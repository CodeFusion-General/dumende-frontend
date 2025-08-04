import DOMPurify from "isomorphic-dompurify";
import { BookingDTO, BookingStatus } from "@/types/booking.types";
import { MessageDTO } from "@/types/message.types";
import { globalRateLimiter } from "./errorHandling";

// Message content validation and sanitization
export interface MessageValidationResult {
  isValid: boolean;
  sanitizedContent?: string;
  errors: string[];
}

// XSS prevention and input sanitization
export const sanitizeMessageContent = (content: string): string => {
  if (!content || typeof content !== "string") {
    return "";
  }

  // Remove any HTML tags and scripts
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed in messages
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content
  });

  // Additional sanitization for common XSS patterns
  return sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .trim();
};

// Comprehensive message content validation
export const validateMessageContent = (
  content: string
): MessageValidationResult => {
  const errors: string[] = [];

  // Basic validation
  if (!content || typeof content !== "string") {
    errors.push("Mesaj içeriği gereklidir");
    return { isValid: false, errors };
  }

  const trimmedContent = content.trim();

  // Empty message check
  if (!trimmedContent) {
    errors.push("Mesaj boş olamaz");
    return { isValid: false, errors };
  }

  // Length validation
  if (trimmedContent.length > 1000) {
    errors.push("Mesaj 1000 karakterden uzun olamaz");
  }

  if (trimmedContent.length < 1) {
    errors.push("Mesaj en az 1 karakter olmalıdır");
  }

  // Sanitize content
  const sanitizedContent = sanitizeMessageContent(trimmedContent);

  // Check if sanitization removed too much content (potential XSS attempt)
  if (sanitizedContent.length < trimmedContent.length * 0.5) {
    errors.push("Mesaj içeriği güvenlik kontrolünden geçemedi");
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      errors.push("Mesaj içeriği güvenlik politikalarına uygun değil");
      break;
    }
  }

  // Check for excessive special characters (potential injection attempt)
  const specialCharCount = (content.match(/[<>'"&;(){}[\]]/g) || []).length;
  if (specialCharCount > content.length * 0.1) {
    errors.push("Mesaj çok fazla özel karakter içeriyor");
  }

  return {
    isValid: errors.length === 0,
    sanitizedContent: errors.length === 0 ? sanitizedContent : undefined,
    errors,
  };
};

// Booking ownership validation
export interface BookingOwnershipValidation {
  isOwner: boolean;
  isCaptain: boolean;
  isCustomer: boolean;
  hasAccess: boolean;
  reason?: string;
}

export const validateBookingOwnership = async (
  booking: BookingDTO,
  userId: number,
  captainId?: number
): Promise<BookingOwnershipValidation> => {
  try {
    const isCustomer = booking.customerId === userId;
    const isCaptain = captainId ? captainId === userId : false;
    const isOwner = isCustomer || isCaptain;

    if (!isOwner) {
      return {
        isOwner: false,
        isCaptain: false,
        isCustomer: false,
        hasAccess: false,
        reason: "Kullanıcı bu rezervasyonun sahibi değil",
      };
    }

    // Check booking status for messaging access
    const allowedStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(booking.status as BookingStatus)) {
      return {
        isOwner,
        isCaptain,
        isCustomer,
        hasAccess: false,
        reason: `${booking.status} durumundaki rezervasyonlar için mesajlaşma mevcut değil`,
      };
    }

    return {
      isOwner,
      isCaptain,
      isCustomer,
      hasAccess: true,
    };
  } catch (error) {
    return {
      isOwner: false,
      isCaptain: false,
      isCustomer: false,
      hasAccess: false,
      reason: `Rezervasyon doğrulama hatası: ${error}`,
    };
  }
};

// Conversation access validation
export interface ConversationAccessValidation {
  hasAccess: boolean;
  reason?: string;
  conversationMetadata?: {
    bookingId: number;
    customerId: number;
    captainId: number;
  };
}

export const validateConversationAccess = (
  conversationId: string,
  userId: number,
  bookingOwnership: BookingOwnershipValidation
): ConversationAccessValidation => {
  try {
    // Parse conversation ID to extract booking information
    const conversationPattern = /^booking_(\d+)_(\d+)_(\d+)$/;
    const match = conversationId.match(conversationPattern);

    if (!match) {
      return {
        hasAccess: false,
        reason: "Geçersiz konuşma ID formatı",
      };
    }

    const bookingId = parseInt(match[1], 10);
    const customerId = parseInt(match[2], 10);
    const captainId = parseInt(match[3], 10);

    // Validate that user is either customer or captain in the conversation
    const isParticipant = userId === customerId || userId === captainId;

    if (!isParticipant) {
      return {
        hasAccess: false,
        reason: "Kullanıcı bu konuşmanın katılımcısı değil",
      };
    }

    // Check booking ownership validation
    if (!bookingOwnership.hasAccess) {
      return {
        hasAccess: false,
        reason: bookingOwnership.reason || "Rezervasyon erişimi reddedildi",
      };
    }

    return {
      hasAccess: true,
      conversationMetadata: {
        bookingId,
        customerId,
        captainId,
      },
    };
  } catch (error) {
    return {
      hasAccess: false,
      reason: `Konuşma erişimi doğrulama hatası: ${error}`,
    };
  }
};

// Enhanced rate limiting for messaging
export interface RateLimitConfig {
  maxMessages: number;
  windowMs: number;
  burstLimit?: number;
  burstWindowMs?: number;
}

export const defaultMessageRateLimit: RateLimitConfig = {
  maxMessages: 10, // 10 messages per minute
  windowMs: 60 * 1000, // 1 minute
  burstLimit: 3, // 3 messages in 10 seconds (burst protection)
  burstWindowMs: 10 * 1000, // 10 seconds
};

export const validateMessageRateLimit = (
  userId: number,
  config: RateLimitConfig = defaultMessageRateLimit
): {
  allowed: boolean;
  reason?: string;
  remainingTime?: number;
} => {
  const rateLimitKey = `message_rate_${userId}`;
  const burstLimitKey = `message_burst_${userId}`;

  // Check burst limit first (short-term protection)
  if (config.burstLimit && config.burstWindowMs) {
    if (
      globalRateLimiter.isRateLimited(
        burstLimitKey,
        config.burstLimit,
        config.burstWindowMs
      )
    ) {
      const remainingTime = globalRateLimiter.getRemainingTime(
        burstLimitKey,
        config.burstWindowMs
      );
      return {
        allowed: false,
        reason: `Çok hızlı mesaj gönderiyorsunuz. ${Math.ceil(
          remainingTime / 1000
        )} saniye bekleyin.`,
        remainingTime,
      };
    }
  }

  // Check regular rate limit
  if (
    globalRateLimiter.isRateLimited(
      rateLimitKey,
      config.maxMessages,
      config.windowMs
    )
  ) {
    const remainingTime = globalRateLimiter.getRemainingTime(
      rateLimitKey,
      config.windowMs
    );
    return {
      allowed: false,
      reason: `Mesaj limitine ulaştınız. ${Math.ceil(
        remainingTime / 1000
      )} saniye bekleyin.`,
      remainingTime,
    };
  }

  return { allowed: true };
};

export const recordMessageAttempt = (userId: number): void => {
  const rateLimitKey = `message_rate_${userId}`;
  const burstLimitKey = `message_burst_${userId}`;

  globalRateLimiter.recordAttempt(rateLimitKey);
  globalRateLimiter.recordAttempt(burstLimitKey);
};

// Message content security analysis
export interface SecurityAnalysisResult {
  riskLevel: "low" | "medium" | "high";
  issues: string[];
  recommendations: string[];
}

export const analyzeMessageSecurity = (
  content: string
): SecurityAnalysisResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  // Check for potential XSS patterns
  const xssPatterns = [
    { pattern: /<script/i, issue: "Script tag detected" },
    { pattern: /javascript:/i, issue: "JavaScript protocol detected" },
    { pattern: /on\w+\s*=/i, issue: "Event handler detected" },
    { pattern: /data:text\/html/i, issue: "Data URL with HTML detected" },
    { pattern: /<iframe/i, issue: "Iframe tag detected" },
  ];

  for (const { pattern, issue } of xssPatterns) {
    if (pattern.test(content)) {
      issues.push(issue);
      riskLevel = "high";
    }
  }

  // Check for suspicious URL patterns
  const urlPatterns = [
    /https?:\/\/[^\s]+/gi,
    /www\.[^\s]+/gi,
    /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/gi,
  ];

  let urlCount = 0;
  for (const pattern of urlPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      urlCount += matches.length;
    }
  }

  if (urlCount > 2) {
    issues.push("Multiple URLs detected");
    riskLevel = riskLevel === "high" ? "high" : "medium";
    recommendations.push("Verify URLs before clicking");
  }

  // Check for excessive special characters
  const specialCharCount = (content.match(/[<>'"&;(){}[\]]/g) || []).length;
  if (specialCharCount > content.length * 0.1) {
    issues.push("High concentration of special characters");
    riskLevel = riskLevel === "high" ? "high" : "medium";
  }

  // Check message length for potential spam
  if (content.length > 800) {
    issues.push("Very long message");
    recommendations.push("Consider breaking into smaller messages");
  }

  // Check for repeated characters (potential spam)
  const repeatedCharPattern = /(.)\1{10,}/;
  if (repeatedCharPattern.test(content)) {
    issues.push("Excessive character repetition detected");
    riskLevel = riskLevel === "high" ? "high" : "medium";
  }

  return {
    riskLevel,
    issues,
    recommendations,
  };
};

// Comprehensive security validation for message sending
export interface MessageSecurityValidation {
  isValid: boolean;
  sanitizedContent?: string;
  errors: string[];
  warnings: string[];
  securityAnalysis: SecurityAnalysisResult;
}

export const validateMessageSecurity = (
  content: string,
  userId: number,
  booking: BookingDTO,
  captainId?: number
): Promise<MessageSecurityValidation> => {
  return new Promise(async (resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Content validation and sanitization
      const contentValidation = validateMessageContent(content);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
      }

      // 2. Rate limiting validation
      const rateLimitValidation = validateMessageRateLimit(userId);
      if (!rateLimitValidation.allowed) {
        errors.push(rateLimitValidation.reason || "Rate limit exceeded");
      }

      // 3. Booking ownership validation
      const ownershipValidation = await validateBookingOwnership(
        booking,
        userId,
        captainId
      );
      if (!ownershipValidation.hasAccess) {
        errors.push(ownershipValidation.reason || "Access denied");
      }

      // 4. Security analysis
      const securityAnalysis = analyzeMessageSecurity(content);
      if (securityAnalysis.riskLevel === "high") {
        errors.push("Message content poses security risk");
      } else if (securityAnalysis.riskLevel === "medium") {
        warnings.push("Message content may pose security risk");
      }

      // Add security recommendations as warnings
      warnings.push(...securityAnalysis.recommendations);

      resolve({
        isValid: errors.length === 0,
        sanitizedContent: contentValidation.sanitizedContent,
        errors,
        warnings,
        securityAnalysis,
      });
    } catch (error) {
      resolve({
        isValid: false,
        sanitizedContent: undefined,
        errors: [`Security validation error: ${error}`],
        warnings,
        securityAnalysis: {
          riskLevel: "high",
          issues: ["Validation process failed"],
          recommendations: ["Contact support"],
        },
      });
    }
  });
};

// Security logging for audit purposes
export interface SecurityEvent {
  type:
    | "message_blocked"
    | "rate_limit_exceeded"
    | "xss_attempt"
    | "access_denied";
  userId: number;
  bookingId?: number;
  details: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

export const logSecurityEvent = (event: SecurityEvent): void => {
  // In a real application, this would send to a security monitoring service
  console.warn("Security Event:", {
    ...event,
    timestamp: event.timestamp.toISOString(),
  });

  // Store in localStorage for development/debugging
  try {
    const existingLogs = JSON.parse(
      localStorage.getItem("security_logs") || "[]"
    );
    existingLogs.push(event);

    // Keep only last 100 events
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }

    localStorage.setItem("security_logs", JSON.stringify(existingLogs));
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};
