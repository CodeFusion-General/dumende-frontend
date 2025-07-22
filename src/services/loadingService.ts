// Service for managing loading states and error handling across the application

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated?: Date;
}

export interface AsyncOperationOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  onRetry?: (attempt: number) => void;
}

class LoadingService {
  private loadingStates = new Map<string, LoadingState>();
  private abortControllers = new Map<string, AbortController>();

  // Get loading state for a specific key
  getLoadingState(key: string): LoadingState {
    return (
      this.loadingStates.get(key) || {
        isLoading: false,
        error: null,
        data: null,
      }
    );
  }

  // Set loading state
  setLoadingState(key: string, state: Partial<LoadingState>) {
    const currentState = this.getLoadingState(key);
    this.loadingStates.set(key, {
      ...currentState,
      ...state,
      lastUpdated: new Date(),
    });
  }

  // Execute async operation with loading state management
  async executeWithLoading<T>(
    key: string,
    operation: (signal?: AbortSignal) => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T | null> {
    const {
      retries = 3,
      retryDelay = 1000,
      timeout = 30000,
      onError,
      onSuccess,
      onRetry,
    } = options;

    // Cancel any existing operation for this key
    this.cancelOperation(key);

    // Create new abort controller
    const abortController = new AbortController();
    this.abortControllers.set(key, abortController);

    // Set loading state
    this.setLoadingState(key, {
      isLoading: true,
      error: null,
    });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Set timeout
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, timeout);

        const result = await operation(abortController.signal);

        clearTimeout(timeoutId);

        // Success
        this.setLoadingState(key, {
          isLoading: false,
          error: null,
          data: result,
        });

        onSuccess?.(result);
        this.abortControllers.delete(key);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Check if operation was aborted
        if (abortController.signal.aborted) {
          this.setLoadingState(key, {
            isLoading: false,
            error: "Operation was cancelled",
          });
          return null;
        }

        onError?.(lastError);

        // If this is not the last attempt, wait and retry
        if (attempt < retries) {
          onRetry?.(attempt);
          await this.delay(retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    this.setLoadingState(key, {
      isLoading: false,
      error: lastError?.message || "Operation failed",
    });

    this.abortControllers.delete(key);
    return null;
  }

  // Cancel operation
  cancelOperation(key: string) {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  // Clear loading state
  clearLoadingState(key: string) {
    this.loadingStates.delete(key);
    this.cancelOperation(key);
  }

  // Clear all loading states
  clearAllLoadingStates() {
    this.loadingStates.clear();
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  // Utility method for delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Batch operations
  async executeBatch<T>(
    operations: Array<{
      key: string;
      operation: (signal?: AbortSignal) => Promise<T>;
      options?: AsyncOperationOptions;
    }>
  ): Promise<Array<T | null>> {
    const promises = operations.map(({ key, operation, options }) =>
      this.executeWithLoading(key, operation, options)
    );

    return Promise.all(promises);
  }

  // Progressive loading - execute operations in sequence with priorities
  async executeProgressive<T>(
    operations: Array<{
      key: string;
      operation: (signal?: AbortSignal) => Promise<T>;
      priority: "high" | "medium" | "low";
      options?: AsyncOperationOptions;
    }>
  ): Promise<Array<T | null>> {
    // Sort by priority
    const sortedOps = operations.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    const results: Array<T | null> = [];

    for (const { key, operation, options } of sortedOps) {
      const result = await this.executeWithLoading(key, operation, options);
      results.push(result);
    }

    return results;
  }

  // Check if any operations are loading
  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(
      (state) => state.isLoading
    );
  }

  // Get all errors
  getAllErrors(): Array<{ key: string; error: string }> {
    const errors: Array<{ key: string; error: string }> = [];

    this.loadingStates.forEach((state, key) => {
      if (state.error) {
        errors.push({ key, error: state.error });
      }
    });

    return errors;
  }

  // Retry failed operations
  async retryFailedOperations(
    operations: Map<string, (signal?: AbortSignal) => Promise<any>>
  ): Promise<void> {
    const failedKeys = Array.from(this.loadingStates.entries())
      .filter(([_, state]) => state.error && !state.isLoading)
      .map(([key]) => key);

    const retryPromises = failedKeys.map((key) => {
      const operation = operations.get(key);
      if (operation) {
        return this.executeWithLoading(key, operation);
      }
      return Promise.resolve(null);
    });

    await Promise.all(retryPromises);
  }
}

export const loadingService = new LoadingService();
