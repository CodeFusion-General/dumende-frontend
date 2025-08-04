import { toast } from "sonner";

// Error types for messaging system
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
  requiresAuth?: boolean;
  statusCode?: number;
}

// Error classification utility
export function classifyError(error: unknown): ErrorDetails {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: "Bilinmeyen bir hata oluştu",
      retryable: false,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      error.name === "NetworkError"
    ) {
      return {
        type: ErrorType.NETWORK,
        message:
          "İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.",
        originalError: error,
        retryable: true,
      };
    }

    // Authentication errors
    if (
      message.includes("unauthorized") ||
      message.includes("authentication") ||
      message.includes("token") ||
      message.includes("login")
    ) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.",
        originalError: error,
        retryable: false,
        requiresAuth: true,
      };
    }

    // Authorization errors
    if (
      message.includes("forbidden") ||
      message.includes("access denied") ||
      message.includes("permission")
    ) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: "Bu işlem için yetkiniz bulunmuyor.",
        originalError: error,
        retryable: false,
      };
    }

    // Validation errors
    if (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required")
    ) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        originalError: error,
        retryable: false,
      };
    }

    // Server errors
    if (
      message.includes("server") ||
      message.includes("internal") ||
      message.includes("500")
    ) {
      return {
        type: ErrorType.SERVER,
        message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
        originalError: error,
        retryable: true,
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      message: error.message || "Beklenmeyen bir hata oluştu",
      originalError: error,
      retryable: true,
    };
  }

  // Handle HTTP response errors
  if (typeof error === "object" && error !== null) {
    const errorObj = error as any;

    if (errorObj.status || errorObj.statusCode) {
      const statusCode = errorObj.status || errorObj.statusCode;

      switch (statusCode) {
        case 401:
          return {
            type: ErrorType.AUTHENTICATION,
            message: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.",
            retryable: false,
            requiresAuth: true,
            statusCode,
          };
        case 403:
          return {
            type: ErrorType.AUTHORIZATION,
            message: "Bu işlem için yetkiniz bulunmuyor.",
            retryable: false,
            statusCode,
          };
        case 400:
          return {
            type: ErrorType.VALIDATION,
            message: errorObj.message || "Geçersiz istek",
            retryable: false,
            statusCode,
          };
        case 404:
          return {
            type: ErrorType.VALIDATION,
            message: "İstenen kaynak bulunamadı",
            retryable: false,
            statusCode,
          };
        case 429:
          return {
            type: ErrorType.SERVER,
            message: "Çok fazla istek gönderildi. Lütfen bekleyin.",
            retryable: true,
            statusCode,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ErrorType.SERVER,
            message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
            retryable: true,
            statusCode,
          };
        default:
          return {
            type: ErrorType.UNKNOWN,
            message: errorObj.message || "Beklenmeyen bir hata oluştu",
            retryable: statusCode >= 500,
            statusCode,
          };
      }
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      retryable: true,
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: "Beklenmeyen bir hata oluştu",
    retryable: false,
  };
}

// Toast notification utilities
export function showErrorToast(
  errorDetails: ErrorDetails,
  options?: {
    showRetry?: boolean;
    onRetry?: () => void;
    duration?: number;
  }
) {
  const { showRetry = false, onRetry, duration = 5000 } = options || {};

  toast.error(errorDetails.message, {
    description: getErrorDescription(errorDetails),
    duration,
    action:
      showRetry && errorDetails.retryable && onRetry
        ? {
            label: "Tekrar Dene",
            onClick: onRetry,
          }
        : undefined,
  });
}

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

export function showWarningToast(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 4000,
  });
}

export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 3000,
  });
}

// Get appropriate error description
function getErrorDescription(errorDetails: ErrorDetails): string {
  switch (errorDetails.type) {
    case ErrorType.NETWORK:
      return "Bağlantı sorunu yaşanıyor. İnternet bağlantınızı kontrol edin.";
    case ErrorType.AUTHENTICATION:
      return "Oturum bilgileriniz geçersiz. Giriş sayfasına yönlendirileceksiniz.";
    case ErrorType.AUTHORIZATION:
      return "Bu işlemi gerçekleştirmek için gerekli izniniz bulunmuyor.";
    case ErrorType.VALIDATION:
      return "Gönderilen bilgilerde hata var. Lütfen kontrol edin.";
    case ErrorType.SERVER:
      return "Sunucu tarafında bir sorun var. Kısa süre sonra tekrar deneyin.";
    default:
      return "Beklenmeyen bir durum oluştu. Sorun devam ederse destek ekibiyle iletişime geçin.";
  }
}

// Offline detection utilities
export function isOnline(): boolean {
  return navigator.onLine;
}

export function createOfflineHandler(callback: (isOnline: boolean) => void) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < windowMs);

    this.attempts.set(key, validAttempts);

    return validAttempts.length >= maxAttempts;
  }

  recordAttempt(key: string): void {
    const attempts = this.attempts.get(key) || [];
    attempts.push(Date.now());
    this.attempts.set(key, attempts);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingTime(key: string, windowMs: number): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    const remainingTime = windowMs - (Date.now() - oldestAttempt);

    return Math.max(0, remainingTime);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// Authentication redirect utility
export function handleAuthenticationError(navigate?: (path: string) => void) {
  // Clear any stored auth data
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");

  // Show notification
  showErrorToast({
    type: ErrorType.AUTHENTICATION,
    message: "Oturum süreniz doldu",
    retryable: false,
    requiresAuth: true,
  });

  // Redirect to login if navigate function is provided
  if (navigate) {
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } else {
    // Fallback to window location
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  }
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000,
  maxDelay: number = 10000,
  backoffFactor: number = 2
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const errorDetails = classifyError(error);

      // Don't retry non-retryable errors
      if (!errorDetails.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
