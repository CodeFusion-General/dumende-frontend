import { useState, useCallback } from "react";
import { toast } from "sonner";

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onError,
    onSuccess,
    onMaxAttemptsReached,
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
  });

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      let currentAttempt = 0;
      let lastError: Error;

      setRetryState({
        isRetrying: true,
        attempt: 0,
        lastError: null,
      });

      while (currentAttempt < maxAttempts) {
        try {
          currentAttempt++;
          setRetryState((prev) => ({
            ...prev,
            attempt: currentAttempt,
          }));

          const result = await operation();

          // Success
          setRetryState({
            isRetrying: false,
            attempt: currentAttempt,
            lastError: null,
          });

          if (onSuccess) {
            onSuccess();
          }

          return result;
        } catch (error) {
          lastError = error as Error;

          setRetryState((prev) => ({
            ...prev,
            lastError,
          }));

          if (onError) {
            onError(lastError, currentAttempt);
          }

          // If this was the last attempt, don't wait
          if (currentAttempt >= maxAttempts) {
            break;
          }

          // Calculate delay with optional backoff
          const currentDelay = backoff
            ? delay * Math.pow(2, currentAttempt - 1)
            : delay;

          // Show retry toast
          toast.info(`Tekrar deneniyor... (${currentAttempt}/${maxAttempts})`, {
            description: `${
              currentDelay / 1000
            } saniye sonra tekrar denenecek.`,
          });

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
      }

      // All attempts failed
      setRetryState({
        isRetrying: false,
        attempt: currentAttempt,
        lastError: lastError!,
      });

      if (onMaxAttemptsReached) {
        onMaxAttemptsReached(lastError!);
      } else {
        toast.error("İşlem başarısız", {
          description: `${maxAttempts} deneme sonrasında işlem tamamlanamadı.`,
        });
      }

      throw lastError!;
    },
    [maxAttempts, delay, backoff, onError, onSuccess, onMaxAttemptsReached]
  );

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...retryState,
  };
};

// Specialized hook for profile operations
export const useProfileRetry = () => {
  return useRetry({
    maxAttempts: 3,
    delay: 1500,
    backoff: true,
    onError: (error, attempt) => {
      console.warn(`Profile operation failed (attempt ${attempt}):`, error);
    },
    onMaxAttemptsReached: (error) => {
      console.error("Profile operation failed after all retries:", error);
      toast.error("Profil işlemi başarısız", {
        description:
          "Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.",
        action: {
          label: "Sayfayı Yenile",
          onClick: () => window.location.reload(),
        },
      });
    },
  });
};
