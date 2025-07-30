export interface PollingOptions {
  interval: number;
  maxInterval: number;
  backoffMultiplier: number;
  maxRetries: number;
  debounceDelay: number;
  adaptivePolling: boolean;
  activityThreshold: number; // milliseconds of inactivity before reducing polling
}

export interface PollingState {
  isActive: boolean;
  currentInterval: number;
  retryCount: number;
  lastActivity: number;
  lastPoll: number;
  consecutiveFailures: number;
}

export class DebouncedPoller {
  private options: PollingOptions;
  private state: PollingState;
  private timeoutId: NodeJS.Timeout | null = null;
  private debounceTimeoutId: NodeJS.Timeout | null = null;
  private pollFunction: () => Promise<void>;
  private onError?: (error: unknown) => void;
  private onSuccess?: () => void;
  private activityListeners: (() => void)[] = [];

  constructor(
    pollFunction: () => Promise<void>,
    options: Partial<PollingOptions> = {},
    callbacks: {
      onError?: (error: unknown) => void;
      onSuccess?: () => void;
    } = {}
  ) {
    this.pollFunction = pollFunction;
    this.onError = callbacks.onError;
    this.onSuccess = callbacks.onSuccess;

    this.options = {
      interval: options.interval || 3000,
      maxInterval: options.maxInterval || 30000,
      backoffMultiplier: options.backoffMultiplier || 1.5,
      maxRetries: options.maxRetries || 5,
      debounceDelay: options.debounceDelay || 500,
      adaptivePolling: options.adaptivePolling || true,
      activityThreshold: options.activityThreshold || 60000, // 1 minute
    };

    this.state = {
      isActive: false,
      currentInterval: this.options.interval,
      retryCount: 0,
      lastActivity: Date.now(),
      lastPoll: 0,
      consecutiveFailures: 0,
    };

    // Set up activity tracking if adaptive polling is enabled
    if (this.options.adaptivePolling) {
      this.setupActivityTracking();
    }
  }

  /**
   * Start polling
   */
  start(): void {
    if (this.state.isActive) return;

    this.state.isActive = true;
    this.state.retryCount = 0;
    this.state.consecutiveFailures = 0;
    this.state.currentInterval = this.options.interval;

    this.scheduleNextPoll();
  }

  /**
   * Stop polling
   */
  stop(): void {
    this.state.isActive = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
      this.debounceTimeoutId = null;
    }
  }

  /**
   * Trigger immediate poll (debounced)
   */
  triggerPoll(): void {
    if (!this.state.isActive) return;

    // Clear existing debounce timeout
    if (this.debounceTimeoutId) {
      clearTimeout(this.debounceTimeoutId);
    }

    // Set up debounced poll
    this.debounceTimeoutId = setTimeout(() => {
      this.executePoll();
    }, this.options.debounceDelay);
  }

  /**
   * Record user activity to optimize polling frequency
   */
  recordActivity(): void {
    this.state.lastActivity = Date.now();

    // If we were in slow polling mode, speed up
    if (
      this.options.adaptivePolling &&
      this.state.currentInterval > this.options.interval
    ) {
      this.state.currentInterval = this.options.interval;
      this.rescheduleNextPoll();
    }
  }

  /**
   * Get current polling state
   */
  getState(): Readonly<PollingState> {
    return { ...this.state };
  }

  /**
   * Update polling options
   */
  updateOptions(newOptions: Partial<PollingOptions>): void {
    this.options = { ...this.options, ...newOptions };

    // Reset interval if it's been changed
    if (newOptions.interval && this.state.isActive) {
      this.state.currentInterval = newOptions.interval;
      this.rescheduleNextPoll();
    }
  }

  /**
   * Add activity listener
   */
  addActivityListener(listener: () => void): void {
    this.activityListeners.push(listener);
  }

  /**
   * Remove activity listener
   */
  removeActivityListener(listener: () => void): void {
    const index = this.activityListeners.indexOf(listener);
    if (index > -1) {
      this.activityListeners.splice(index, 1);
    }
  }

  /**
   * Schedule the next poll
   */
  private scheduleNextPoll(): void {
    if (!this.state.isActive) return;

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Calculate next interval based on adaptive polling
    const nextInterval = this.calculateNextInterval();

    this.timeoutId = setTimeout(() => {
      this.executePoll();
    }, nextInterval);
  }

  /**
   * Reschedule next poll (used when options change)
   */
  private rescheduleNextPoll(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.scheduleNextPoll();
    }
  }

  /**
   * Execute the poll function
   */
  private async executePoll(): Promise<void> {
    if (!this.state.isActive) return;

    this.state.lastPoll = Date.now();

    try {
      await this.pollFunction();

      // Success - reset failure counters
      this.state.consecutiveFailures = 0;
      this.state.retryCount = 0;
      this.state.currentInterval = this.options.interval;

      this.onSuccess?.();
    } catch (error) {
      this.state.consecutiveFailures++;
      this.state.retryCount++;

      // Apply exponential backoff
      this.state.currentInterval = Math.min(
        this.state.currentInterval * this.options.backoffMultiplier,
        this.options.maxInterval
      );

      this.onError?.(error);

      // Stop polling if max retries exceeded
      if (this.state.retryCount >= this.options.maxRetries) {
        console.warn("Max polling retries exceeded, stopping polling");
        this.stop();
        return;
      }
    }

    // Schedule next poll
    this.scheduleNextPoll();
  }

  /**
   * Calculate next polling interval based on activity and failures
   */
  private calculateNextInterval(): number {
    let interval = this.state.currentInterval;

    // Adaptive polling based on user activity
    if (this.options.adaptivePolling) {
      const timeSinceActivity = Date.now() - this.state.lastActivity;

      if (timeSinceActivity > this.options.activityThreshold) {
        // User is inactive, slow down polling
        interval = Math.min(interval * 2, this.options.maxInterval);
      }
    }

    // Add jitter to prevent thundering herd
    const jitter = interval * 0.1 * Math.random();
    return interval + jitter;
  }

  /**
   * Set up activity tracking for adaptive polling
   */
  private setupActivityTracking(): void {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const activityHandler = () => {
      this.recordActivity();
      this.activityListeners.forEach((listener) => listener());
    };

    // Throttle activity handler to avoid excessive calls
    let lastActivityCall = 0;
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastActivityCall > 1000) {
        // Throttle to once per second
        lastActivityCall = now;
        activityHandler();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, throttledHandler, { passive: true });
    });

    // Clean up listeners when poller is destroyed
    const cleanup = () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledHandler);
      });
    };

    // Store cleanup function for later use
    (this as any).cleanup = cleanup;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();

    // Clean up activity listeners if they exist
    if ((this as any).cleanup) {
      (this as any).cleanup();
    }

    this.activityListeners = [];
  }
}

/**
 * Utility function to create a debounced poller
 */
export function createDebouncedPoller(
  pollFunction: () => Promise<void>,
  options?: Partial<PollingOptions>,
  callbacks?: {
    onError?: (error: unknown) => void;
    onSuccess?: () => void;
  }
): DebouncedPoller {
  return new DebouncedPoller(pollFunction, options, callbacks);
}

/**
 * Hook-like utility for React components
 */
export function useDebouncedPolling(
  pollFunction: () => Promise<void>,
  options?: Partial<PollingOptions>,
  callbacks?: {
    onError?: (error: unknown) => void;
    onSuccess?: () => void;
  }
): {
  start: () => void;
  stop: () => void;
  triggerPoll: () => void;
  recordActivity: () => void;
  getState: () => Readonly<PollingState>;
  updateOptions: (options: Partial<PollingOptions>) => void;
} {
  const poller = new DebouncedPoller(pollFunction, options, callbacks);

  return {
    start: () => poller.start(),
    stop: () => poller.stop(),
    triggerPoll: () => poller.triggerPoll(),
    recordActivity: () => poller.recordActivity(),
    getState: () => poller.getState(),
    updateOptions: (newOptions: Partial<PollingOptions>) =>
      poller.updateOptions(newOptions),
  };
}
