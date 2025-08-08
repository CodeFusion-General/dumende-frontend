import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Retry configuration interface
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error?.name === "NetworkError" ||
      error?.code === "NETWORK_ERROR" ||
      error?.status >= 500 ||
      error?.message?.includes("timeout") ||
      error?.message?.includes("fetch")
    );
  },
};

// Retry hook for tour operations
export const useTourRetry = (
  operation: () => Promise<any>,
  config: Partial<RetryConfig> = {}
) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastError, setLastError] = useState<any>(null);
  const [retryDelay, setRetryDelay] = useState(0);

  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  const calculateDelay = useCallback(
    (attempt: number) => {
      const delay = Math.min(
        finalConfig.baseDelay *
          Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      );
      // Add jitter to prevent thundering herd
      return delay + Math.random() * 1000;
    },
    [finalConfig]
  );

  const retry = useCallback(async () => {
    if (attemptCount >= finalConfig.maxAttempts) {
      throw new Error(
        `Max retry attempts (${finalConfig.maxAttempts}) exceeded`
      );
    }

    setIsRetrying(true);
    setAttemptCount((prev) => prev + 1);

    try {
      const result = await operation();
      setLastError(null);
      setAttemptCount(0);
      setIsRetrying(false);
      return result;
    } catch (error) {
      setLastError(error);

      if (
        attemptCount + 1 >= finalConfig.maxAttempts ||
        (finalConfig.retryCondition && !finalConfig.retryCondition(error))
      ) {
        setIsRetrying(false);
        throw error;
      }

      const delay = calculateDelay(attemptCount);
      setRetryDelay(delay);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry();
    }
  }, [operation, attemptCount, finalConfig, calculateDelay]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
    setLastError(null);
    setRetryDelay(0);
  }, []);

  return {
    retry,
    reset,
    isRetrying,
    attemptCount,
    lastError,
    retryDelay,
    canRetry: attemptCount < finalConfig.maxAttempts,
    maxAttempts: finalConfig.maxAttempts,
  };
};

// Retry button component with visual feedback
interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  isRetrying?: boolean;
  attemptCount?: number;
  maxAttempts?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showAttempts?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  isRetrying = false,
  attemptCount = 0,
  maxAttempts = 3,
  disabled = false,
  className,
  children = "Tekrar Dene",
  showAttempts = true,
  variant = "outline",
  size = "default",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = async () => {
    if (disabled || isRetrying || isLoading) return;

    setIsLoading(true);
    try {
      await onRetry();
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled =
    disabled || isRetrying || isLoading || attemptCount >= maxAttempts;

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={handleRetry}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          isLoading && "animate-pulse",
          className
        )}
      >
        <RefreshCw
          className={cn("h-4 w-4", (isRetrying || isLoading) && "animate-spin")}
        />
        {children}
      </Button>

      {showAttempts && attemptCount > 0 && (
        <span className="text-xs text-gray-500">
          Deneme {attemptCount}/{maxAttempts}
        </span>
      )}
    </div>
  );
};

// Retry status indicator
interface RetryStatusProps {
  status: "idle" | "retrying" | "success" | "failed";
  attemptCount?: number;
  maxAttempts?: number;
  error?: any;
  className?: string;
}

export const RetryStatus: React.FC<RetryStatusProps> = ({
  status,
  attemptCount = 0,
  maxAttempts = 3,
  error,
  className,
}) => {
  const statusConfig = {
    idle: {
      icon: null,
      text: "",
      color: "text-gray-500",
    },
    retrying: {
      icon: <RefreshCw className="h-4 w-4 animate-spin" />,
      text: `Yeniden deneniyor... (${attemptCount}/${maxAttempts})`,
      color: "text-blue-600",
    },
    success: {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Başarılı",
      color: "text-green-600",
    },
    failed: {
      icon: <XCircle className="h-4 w-4" />,
      text: `Başarısız (${attemptCount}/${maxAttempts} deneme)`,
      color: "text-red-600",
    },
  };

  const config = statusConfig[status];

  if (status === "idle") return null;

  return (
    <div
      className={cn("flex items-center gap-2 text-sm", config.color, className)}
    >
      {config.icon}
      <span>{config.text}</span>
      {status === "failed" && error && (
        <span className="text-xs text-gray-500 ml-2">
          ({error.message || "Bilinmeyen hata"})
        </span>
      )}
    </div>
  );
};

// Auto-retry wrapper component
interface AutoRetryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry: () => Promise<void>;
  retryConfig?: Partial<RetryConfig>;
  showRetryButton?: boolean;
  autoRetry?: boolean;
  className?: string;
}

export const AutoRetryWrapper: React.FC<AutoRetryWrapperProps> = ({
  children,
  fallback,
  onRetry,
  retryConfig = {},
  showRetryButton = true,
  autoRetry = true,
  className,
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<any>(null);

  const { retry, reset, isRetrying, attemptCount, canRetry, maxAttempts } =
    useTourRetry(onRetry, retryConfig);

  const handleError = useCallback(
    (error: any) => {
      setHasError(true);
      setError(error);

      if (autoRetry && canRetry) {
        retry().catch(() => {
          // Error already handled by retry mechanism
        });
      }
    },
    [autoRetry, canRetry, retry]
  );

  const handleManualRetry = useCallback(async () => {
    setHasError(false);
    setError(null);
    reset();

    try {
      await retry();
      setHasError(false);
    } catch (err) {
      setHasError(true);
      setError(err);
    }
  }, [retry, reset]);

  // Error boundary effect
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason);
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [handleError]);

  if (hasError && !isRetrying) {
    return (
      <div className={cn("text-center p-8", className)}>
        {fallback || (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span className="font-medium">Bir hata oluştu</span>
            </div>

            <p className="text-gray-600 text-sm">
              {error?.message || "Beklenmeyen bir hata oluştu"}
            </p>

            <RetryStatus
              status="failed"
              attemptCount={attemptCount}
              maxAttempts={maxAttempts}
              error={error}
            />

            {showRetryButton && canRetry && (
              <RetryButton
                onRetry={handleManualRetry}
                attemptCount={attemptCount}
                maxAttempts={maxAttempts}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  if (isRetrying) {
    return (
      <div className={cn("text-center p-8", className)}>
        <RetryStatus
          status="retrying"
          attemptCount={attemptCount}
          maxAttempts={maxAttempts}
        />
      </div>
    );
  }

  return <>{children}</>;
};

// Specific retry components for tour operations
export const TourDataRetry: React.FC<{
  onRetry: () => Promise<void>;
  error?: any;
  className?: string;
}> = ({ onRetry, error, className }) => {
  const { retry, isRetrying, attemptCount, canRetry, maxAttempts } =
    useTourRetry(onRetry);

  return (
    <div
      className={cn(
        "text-center p-6 bg-red-50 border border-red-200 rounded-lg",
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Tur Verileri Yüklenemedi
      </h3>
      <p className="text-red-700 mb-4">
        {error?.message || "Tur bilgileri yüklenirken bir hata oluştu."}
      </p>

      <RetryStatus
        status={isRetrying ? "retrying" : "failed"}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        error={error}
        className="mb-4"
      />

      {canRetry && (
        <RetryButton
          onRetry={retry}
          isRetrying={isRetrying}
          attemptCount={attemptCount}
          maxAttempts={maxAttempts}
        />
      )}
    </div>
  );
};

export const TourImageRetry: React.FC<{
  onRetry: () => Promise<void>;
  className?: string;
}> = ({ onRetry, className }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className={cn(
        "aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center",
        className
      )}
    >
      <div className="text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
        <p className="text-sm text-gray-600">Resim yüklenemedi</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying}
          className="text-xs"
        >
          <RefreshCw
            className={cn("h-3 w-3 mr-1", isRetrying && "animate-spin")}
          />
          Yeniden Yükle
        </Button>
      </div>
    </div>
  );
};

export default useTourRetry;
