import { toast } from "@/components/ui/use-toast";
import * as React from "react";
import { ToastAction, type ToastActionElement } from "@/components/ui/toast";

// Error types for better error categorization
export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  UNKNOWN = "UNKNOWN",
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: any;
  isRetryable?: boolean;
  userMessage?: string;
}

// Turkish error messages for common scenarios
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: "İnternet bağlantınızı kontrol edin ve tekrar deneyin.",
    TIMEOUT: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
    SERVER_UNREACHABLE:
      "Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
  },
  VALIDATION: {
    REQUIRED_FIELD: "Bu alan zorunludur.",
    INVALID_EMAIL: "Geçerli bir e-posta adresi giriniz.",
    INVALID_DATE: "Geçerli bir tarih giriniz.",
    INVALID_PRICE: "Geçerli bir fiyat giriniz.",
    DATE_RANGE: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.",
    PAST_DATE: "Tarih bugünden önce olamaz.",
  },
  AUTHENTICATION: {
    LOGIN_REQUIRED: "Bu işlem için giriş yapmanız gerekiyor.",
    SESSION_EXPIRED: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
    INVALID_CREDENTIALS: "Kullanıcı adı veya şifre hatalı.",
  },
  AUTHORIZATION: {
    ACCESS_DENIED: "Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.",
    INSUFFICIENT_PERMISSIONS:
      "Yetersiz yetki. Bu işlem için ek izinler gerekiyor.",
  },
  SERVER: {
    INTERNAL_ERROR: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
    SERVICE_UNAVAILABLE:
      "Servis geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
    MAINTENANCE: "Sistem bakımda. Lütfen daha sonra tekrar deneyin.",
  },
  CLIENT: {
    INVALID_REQUEST:
      "Geçersiz istek. Lütfen sayfayı yenileyin ve tekrar deneyin.",
    RESOURCE_NOT_FOUND: "İstenen kaynak bulunamadı.",
  },
  UNKNOWN: {
    GENERIC: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
  },
} as const;

// Create a standardized error object
export function createAppError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  statusCode?: number,
  originalError?: any,
  isRetryable: boolean = false
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.statusCode = statusCode;
  error.originalError = originalError;
  error.isRetryable = isRetryable;
  error.userMessage = message;

  return error;
}

// Parse and categorize errors from API responses
export function parseApiError(error: any): AppError {
  // Network errors (no response)
  if (!error.response) {
    const errorMessage = error.message?.toLowerCase() || "";

    if (errorMessage.includes("timeout") || error.code === "ECONNABORTED") {
      return createAppError(
        ERROR_MESSAGES.NETWORK.TIMEOUT,
        ErrorType.NETWORK,
        undefined,
        error,
        true
      );
    }

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection")
    ) {
      return createAppError(
        ERROR_MESSAGES.NETWORK.CONNECTION_FAILED,
        ErrorType.NETWORK,
        undefined,
        error,
        true
      );
    }

    return createAppError(
      ERROR_MESSAGES.NETWORK.SERVER_UNREACHABLE,
      ErrorType.NETWORK,
      undefined,
      error,
      true
    );
  }

  const statusCode = error.response.status;
  const responseData = error.response.data;

  // Extract error message from response
  let errorMessage =
    responseData?.message ||
    responseData?.error ||
    error.message ||
    "Bilinmeyen hata";

  // Categorize by status code
  switch (statusCode) {
    case 400:
      return createAppError(
        responseData?.message || ERROR_MESSAGES.CLIENT.INVALID_REQUEST,
        ErrorType.VALIDATION,
        statusCode,
        error,
        false
      );

    case 401:
      return createAppError(
        ERROR_MESSAGES.AUTHENTICATION.SESSION_EXPIRED,
        ErrorType.AUTHENTICATION,
        statusCode,
        error,
        false
      );

    case 403:
      return createAppError(
        ERROR_MESSAGES.AUTHORIZATION.ACCESS_DENIED,
        ErrorType.AUTHORIZATION,
        statusCode,
        error,
        false
      );

    case 404:
      return createAppError(
        ERROR_MESSAGES.CLIENT.RESOURCE_NOT_FOUND,
        ErrorType.CLIENT,
        statusCode,
        error,
        false
      );

    case 408:
      return createAppError(
        ERROR_MESSAGES.NETWORK.TIMEOUT,
        ErrorType.NETWORK,
        statusCode,
        error,
        true
      );

    case 429:
      return createAppError(
        "Çok fazla istek gönderildi. Lütfen bir süre bekleyin ve tekrar deneyin.",
        ErrorType.CLIENT,
        statusCode,
        error,
        true
      );

    case 500:
      return createAppError(
        ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
        ErrorType.SERVER,
        statusCode,
        error,
        true
      );

    case 502:
    case 503:
      return createAppError(
        ERROR_MESSAGES.SERVER.SERVICE_UNAVAILABLE,
        ErrorType.SERVER,
        statusCode,
        error,
        true
      );

    case 504:
      return createAppError(
        ERROR_MESSAGES.NETWORK.TIMEOUT,
        ErrorType.NETWORK,
        statusCode,
        error,
        true
      );

    default:
      if (statusCode >= 500) {
        return createAppError(
          ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
          ErrorType.SERVER,
          statusCode,
          error,
          true
        );
      } else if (statusCode >= 400) {
        return createAppError(
          errorMessage,
          ErrorType.CLIENT,
          statusCode,
          error,
          false
        );
      } else {
        return createAppError(
          ERROR_MESSAGES.UNKNOWN.GENERIC,
          ErrorType.UNKNOWN,
          statusCode,
          error,
          false
        );
      }
  }
}

// Show user-friendly error toast
export function showErrorToast(
  error: AppError | Error | string,
  options?:
    | string
    | {
        title?: string;
        showRetry?: boolean;
        onRetry?: () => void;
        retryLabel?: string;
      }
) {
  let message: string;
  let isRetryable = false;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error && "type" in error) {
    const appError = error as AppError;
    message = appError.userMessage || appError.message;
    isRetryable = appError.isRetryable || false;
  } else {
    message = (error as any).message || ERROR_MESSAGES.UNKNOWN.GENERIC;
  }

  const titleText =
    typeof options === "string" ? options : options?.title || "Hata";

  const actionElement: ToastActionElement | undefined =
    typeof options === "object" && options?.showRetry && options?.onRetry
      ? (React.createElement(
          ToastAction as any,
          {
            altText: options.retryLabel ?? "Tekrar Dene",
            onClick: options.onRetry,
          },
          options.retryLabel ?? "Tekrar Dene"
        ) as unknown as ToastActionElement)
      : undefined;

  toast({
    title: titleText,
    description: message,
    variant: "destructive",
    duration: isRetryable ? 6000 : 4000,
    action: actionElement,
  });
}

// Retry mechanism with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const appError = parseApiError(error);

      // Don't retry if error is not retryable
      if (!appError.isRetryable || attempt === maxRetries) {
        throw appError;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = Math.min(delay + jitter, 10000); // Cap at 10 seconds

      console.log(
        `Retrying operation in ${totalDelay}ms (attempt ${attempt}/${maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw parseApiError(lastError);
}

// Validation error helpers
export interface ValidationError {
  field: string;
  message: string;
}

export function createValidationError(
  field: string,
  message: string
): ValidationError {
  return { field, message };
}

export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string> {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);
}

// Form validation utilities
export const validators = {
  required: (value: any, fieldName: string): ValidationError | null => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return createValidationError(
        fieldName,
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
      );
    }
    return null;
  },

  email: (value: string, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return createValidationError(
        fieldName,
        ERROR_MESSAGES.VALIDATION.INVALID_EMAIL
      );
    }
    return null;
  },

  date: (value: string | Date, fieldName: string): ValidationError | null => {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return createValidationError(
        fieldName,
        ERROR_MESSAGES.VALIDATION.INVALID_DATE
      );
    }
    return null;
  },

  pastDate: (
    value: string | Date,
    fieldName: string
  ): ValidationError | null => {
    const date = value instanceof Date ? value : new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return createValidationError(
        fieldName,
        ERROR_MESSAGES.VALIDATION.PAST_DATE
      );
    }
    return null;
  },

  price: (
    value: string | number,
    fieldName: string
  ): ValidationError | null => {
    const price = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(price) || price < 0) {
      return createValidationError(
        fieldName,
        ERROR_MESSAGES.VALIDATION.INVALID_PRICE
      );
    }
    return null;
  },

  dateRange: (
    startDate: string | Date,
    endDate: string | Date
  ): ValidationError | null => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (start >= end) {
      return createValidationError(
        "endDate",
        ERROR_MESSAGES.VALIDATION.DATE_RANGE
      );
    }
    return null;
  },
};

// Global rate limiter for API calls and user actions
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

class GlobalRateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();

  // Check if a key is rate limited
  isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry) {
      return false;
    }

    // Clean up old entries
    if (now - entry.firstAttempt > windowMs) {
      this.attempts.delete(key);
      return false;
    }

    return entry.count >= maxAttempts;
  }

  // Record an attempt
  recordAttempt(key: string): void {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      entry.count++;
      entry.lastAttempt = now;
    }
  }

  // Get remaining time until rate limit resets
  getRemainingTime(key: string, windowMs: number): number {
    const entry = this.attempts.get(key);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    const elapsed = now - entry.firstAttempt;
    return Math.max(0, windowMs - elapsed);
  }

  // Clear rate limit for a key
  clearRateLimit(key: string): void {
    this.attempts.delete(key);
  }

  // Clean up old entries (should be called periodically)
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, entry] of this.attempts.entries()) {
      if (now - entry.lastAttempt > maxAge) {
        this.attempts.delete(key);
      }
    }
  }
}

// Global instance
export const globalRateLimiter = new GlobalRateLimiter();

// Cleanup old entries every hour
setInterval(() => {
  globalRateLimiter.cleanup();
}, 60 * 60 * 1000);

// Network status utilities
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Offline handler creator
export const createOfflineHandler = (callback: () => void) => {
  const handleOnline = () => {
    if (isOnline()) {
      callback();
    }
  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
};

// Authentication error handler
export const handleAuthenticationError = (error: AppError): void => {
  if (error.type === ErrorType.AUTHENTICATION) {
    // Clear auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Redirect to login
    setTimeout(() => {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/";
      }
    }, 100);
  }
};

// Error classification (alias for parseApiError for backward compatibility)
export const classifyError = parseApiError;

// Success toast utility
export const showSuccessToast = (message: string, title?: string) => {
  toast({
    title: title || "Başarılı",
    description: message,
    variant: "default",
    duration: 3000,
  });
};

// Error recovery suggestions
export function getErrorRecoverySuggestions(error: AppError): string[] {
  const suggestions: string[] = [];

  switch (error.type) {
    case ErrorType.NETWORK:
      suggestions.push("İnternet bağlantınızı kontrol edin");
      suggestions.push("Sayfayı yenileyin ve tekrar deneyin");
      suggestions.push("Birkaç dakika bekleyip tekrar deneyin");
      break;

    case ErrorType.AUTHENTICATION:
      suggestions.push("Çıkış yapıp tekrar giriş yapın");
      suggestions.push("Şifrenizi sıfırlayın");
      break;

    case ErrorType.AUTHORIZATION:
      suggestions.push("Yöneticinizle iletişime geçin");
      suggestions.push("Hesap yetkilerinizi kontrol edin");
      break;

    case ErrorType.VALIDATION:
      suggestions.push("Form alanlarını kontrol edin");
      suggestions.push("Gerekli alanları doldurun");
      break;

    case ErrorType.SERVER:
      suggestions.push("Birkaç dakika bekleyip tekrar deneyin");
      suggestions.push("Sayfayı yenileyin");
      if (error.isRetryable) {
        suggestions.push("Otomatik yeniden deneme aktif");
      }
      break;

    default:
      suggestions.push("Sayfayı yenileyin ve tekrar deneyin");
      suggestions.push("Tarayıcınızın önbelleğini temizleyin");
      break;
  }

  return suggestions;
}
