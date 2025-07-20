import { useState, useCallback, useRef, useEffect } from "react";

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError: Error | null;
}

interface UseRetryReturn {
  retry: () => Promise<void>;
  reset: () => void;
  state: RetryState;
  canRetry: boolean;
}

export const useRetry = (
  asyncFunction: () => Promise<void>,
  options: RetryOptions = {}
): UseRetryReturn => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    lastError: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const retry = useCallback(async () => {
    if (state.attemptCount >= maxAttempts) {
      onMaxAttemptsReached?.();
      return;
    }

    setState((prev) => ({
      ...prev,
      isRetrying: true,
      attemptCount: prev.attemptCount + 1,
    }));

    try {
      // Call the retry callback if provided
      onRetry?.(state.attemptCount + 1);

      // Add delay for subsequent attempts
      if (state.attemptCount > 0) {
        const currentDelay =
          delay * Math.pow(backoffMultiplier, state.attemptCount);
        await new Promise((resolve) => {
          timeoutRef.current = setTimeout(resolve, currentDelay);
        });
      }

      // Execute the async function
      await asyncFunction();

      // Success - reset state
      setState({
        isRetrying: false,
        attemptCount: 0,
        lastError: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isRetrying: false,
        lastError: error as Error,
      }));

      // If we've reached max attempts, call the callback
      if (state.attemptCount + 1 >= maxAttempts) {
        onMaxAttemptsReached?.();
      }
    }
  }, [
    asyncFunction,
    state.attemptCount,
    maxAttempts,
    delay,
    backoffMultiplier,
    onRetry,
    onMaxAttemptsReached,
  ]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      isRetrying: false,
      attemptCount: 0,
      lastError: null,
    });
  }, []);

  const canRetry = state.attemptCount < maxAttempts && !state.isRetrying;

  return {
    retry,
    reset,
    state,
    canRetry,
  };
};

// Hook for handling async operations with loading and error states
interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  retryOptions?: RetryOptions;
}

interface UseAsyncOperationReturn {
  execute: () => Promise<void>;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  reset: () => void;
  canRetry: boolean;
}

export const useAsyncOperation = (
  asyncFunction: () => Promise<void>,
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn => {
  const { onSuccess, onError, retryOptions } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrappedAsyncFunction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await asyncFunction();
      onSuccess?.();
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error; // Re-throw for retry mechanism
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  const retryHook = useRetry(wrappedAsyncFunction, retryOptions);

  const execute = useCallback(async () => {
    await wrappedAsyncFunction();
  }, [wrappedAsyncFunction]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    retryHook.reset();
  }, [retryHook]);

  return {
    execute,
    loading,
    error,
    retry: retryHook.retry,
    reset,
    canRetry: retryHook.canRetry,
  };
};

// Hook for handling data fetching with retry
interface UseFetchWithRetryOptions<T> extends RetryOptions {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchWithRetryReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  canRetry: boolean;
}

export const useFetchWithRetry = <T>(
  fetchFunction: () => Promise<T>,
  options: UseFetchWithRetryOptions<T> = {}
): UseFetchWithRetryReturn<T> => {
  const { initialData = null, onSuccess, onError, ...retryOptions } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrappedFetchFunction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error; // Re-throw for retry mechanism
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onSuccess, onError]);

  const retryHook = useRetry(wrappedFetchFunction, retryOptions);

  const refetch = useCallback(async () => {
    await wrappedFetchFunction();
  }, [wrappedFetchFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    retryHook.reset();
  }, [initialData, retryHook]);

  return {
    data,
    loading,
    error,
    refetch,
    retry: retryHook.retry,
    reset,
    canRetry: retryHook.canRetry,
  };
};

// Hook specifically for profile operations with retry functionality
export const useProfileRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    delayMs = 1000
  ): Promise<T> => {
    let attempts = 0;
    
    while (true) {
      try {
        attempts++;
        return await operation();
      } catch (error) {
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Set retrying state
        setIsRetrying(true);
        
        // Wait before next attempt with exponential backoff
        const delay = delayMs * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, []);
  
  // Reset retrying state when operation completes
  useEffect(() => {
    return () => {
      setIsRetrying(false);
    };
  }, []);
  
  return {
    executeWithRetry,
    isRetrying
  };
};
