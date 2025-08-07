import { useState, useCallback } from "react";
import { retryOperation, parseApiError, AppError } from "@/utils/errorHandling";

interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number, error: any) => void;
  onError?: (error: AppError) => void;
}

interface UseRetryReturn<T> {
  execute: (operation: () => Promise<T>) => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
  lastError: AppError | null;
  reset: () => void;
}

export function useRetry<T = any>(
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const { maxRetries = 3, baseDelay = 1000, onRetry, onError } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<AppError | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      setIsRetrying(true);
      setLastError(null);
      setRetryCount(0);

      try {
        const result = await retryOperation(
          operation,
          maxRetries,
          baseDelay,
          (attempt, error) => {
            setRetryCount(attempt);
            if (onRetry) {
              onRetry(attempt, error);
            }
          }
        );

        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        const appError =
          error instanceof Error && "type" in error
            ? (error as AppError)
            : parseApiError(error);

        setLastError(appError);
        setIsRetrying(false);

        if (onError) {
          onError(appError);
        }

        throw appError;
      }
    },
    [maxRetries, baseDelay, onRetry, onError]
  );

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    execute,
    isRetrying,
    retryCount,
    lastError,
    reset,
  };
}

// Specialized retry hook for profile operations
export const useProfileRetry = (options: UseRetryOptions = {}) => {
  return useRetry({
    maxRetries: 2,
    baseDelay: 1500,
    ...options,
  });
};
