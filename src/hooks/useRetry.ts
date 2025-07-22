import { useState, useCallback } from "react";

// Custom hook for retry mechanisms with exponential backoff

interface UseRetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
}

interface UseRetryReturn<T> {
  execute: () => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  canRetry: boolean;
  reset: () => void;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onError,
    onSuccess,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const calculateDelay = (attemptNumber: number): number => {
    const exponentialDelay =
      initialDelay * Math.pow(backoffFactor, attemptNumber - 1);
    return Math.min(exponentialDelay, maxDelay);
  };

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    for (
      let currentAttempt = 1;
      currentAttempt <= maxAttempts;
      currentAttempt++
    ) {
      setAttempt(currentAttempt);

      try {
        const result = await asyncFunction();
        setIsLoading(false);
        setError(null);
        onSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error, currentAttempt);

        if (currentAttempt === maxAttempts) {
          setIsLoading(false);
          return null;
        }

        // Wait before retrying (except for the last attempt)
        if (currentAttempt < maxAttempts) {
          const delayMs = calculateDelay(currentAttempt);
          await delay(delayMs);
        }
      }
    }

    setIsLoading(false);
    return null;
  }, [
    asyncFunction,
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffFactor,
    onError,
    onSuccess,
  ]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setAttempt(0);
  }, []);

  const canRetry = attempt < maxAttempts && !isLoading;

  return {
    execute,
    isLoading,
    error,
    attempt,
    canRetry,
    reset,
  };
}

// Specialized retry hook for image loading
export function useImageRetry(src: string, options: UseRetryOptions = {}) {
  const loadImage = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, [src]);

  return useRetry(loadImage, {
    maxAttempts: 3,
    initialDelay: 500,
    maxDelay: 2000,
    ...options,
  });
}

// Specialized retry hook for API calls
export function useApiRetry<T>(
  apiCall: () => Promise<T>,
  options: UseRetryOptions = {}
) {
  return useRetry(apiCall, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
    ...options,
  });
}

// Specialized retry hook for profile operations
export function useProfileRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsRetrying(true);
    
    try {
      // Execute the operation directly first
      const result = await operation();
      setIsRetrying(false);
      return result;
    } catch (error) {
      // If it fails, try up to 2 more times with delays
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount < maxRetries) {
        try {
          // Wait before retrying
          const delayMs = 1000 * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          
          // Try again
          const result = await operation();
          setIsRetrying(false);
          return result;
        } catch (retryError) {
          retryCount++;
          
          // If we've exhausted all retries, give up
          if (retryCount >= maxRetries) {
            setIsRetrying(false);
            throw retryError;
          }
        }
      }
      
      // This should never be reached due to the throw above
      setIsRetrying(false);
      throw error;
    }
  }, []);
  
  return { executeWithRetry, isRetrying };
}
