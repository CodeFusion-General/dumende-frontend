/**
 * Progressive Component Loading System
 *
 * Implements lazy loading with priority levels and skeleton states for mobile optimization.
 *
 * Requirements: 3.2, 3.3 - Progressive loading and code splitting
 */

import React, {
  Suspense,
  lazy,
  ComponentType,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { mobileDetection } from "@/utils/mobileDetection";

/**
 * Loading priority levels
 */
export type LoadingPriority = "critical" | "high" | "medium" | "low" | "idle";

/**
 * Progressive loading configuration
 */
export interface ProgressiveLoadingConfig {
  /** Loading priority */
  priority: LoadingPriority;
  /** Delay before loading (ms) */
  delay?: number;
  /** Enable intersection observer loading */
  intersectionLoading?: boolean;
  /** Intersection observer options */
  intersectionOptions?: IntersectionObserverInit;
  /** Fallback component while loading */
  fallback?: React.ComponentType;
  /** Error boundary component */
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** Enable preloading */
  preload?: boolean;
  /** Timeout for loading (ms) */
  timeout?: number;
}

/**
 * Component loader function type
 */
export type ComponentLoader<T = any> = () => Promise<{
  default: ComponentType<T>;
}>;

/**
 * Progressive loading manager
 */
class ProgressiveLoadingManager {
  private static instance: ProgressiveLoadingManager;
  private loadingQueue = new Map<LoadingPriority, Set<() => Promise<void>>>();
  private loadedComponents = new Set<string>();
  private isProcessing = false;
  private deviceInfo = mobileDetection.detectMobileDevice();

  static getInstance(): ProgressiveLoadingManager {
    if (!ProgressiveLoadingManager.instance) {
      ProgressiveLoadingManager.instance = new ProgressiveLoadingManager();
    }
    return ProgressiveLoadingManager.instance;
  }

  constructor() {
    this.initializeQueue();
    this.startProcessing();
  }

  private initializeQueue(): void {
    const priorities: LoadingPriority[] = [
      "critical",
      "high",
      "medium",
      "low",
      "idle",
    ];
    priorities.forEach((priority) => {
      this.loadingQueue.set(priority, new Set());
    });
  } /**
  
 * Add component to loading queue
   */
  addToQueue(priority: LoadingPriority, loader: () => Promise<void>): void {
    const queue = this.loadingQueue.get(priority);
    if (queue) {
      queue.add(loader);
    }
  }

  /**
   * Start processing loading queue
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processQueue();
  }

  /**
   * Process loading queue based on priority
   */
  private async processQueue(): Promise<void> {
    const priorities: LoadingPriority[] = [
      "critical",
      "high",
      "medium",
      "low",
      "idle",
    ];

    for (const priority of priorities) {
      const queue = this.loadingQueue.get(priority);
      if (!queue || queue.size === 0) continue;

      // Adjust concurrency based on device capabilities
      const concurrency = this.getConcurrency(priority);
      const loaders = Array.from(queue);

      // Process in batches
      for (let i = 0; i < loaders.length; i += concurrency) {
        const batch = loaders.slice(i, i + concurrency);

        try {
          await Promise.all(batch.map((loader) => loader()));
        } catch (error) {
          console.warn(
            `Failed to load components in ${priority} priority:`,
            error
          );
        }

        // Remove processed loaders
        batch.forEach((loader) => queue.delete(loader));

        // Add delay between batches for low-end devices
        if (
          this.deviceInfo.isLowEndDevice &&
          i + concurrency < loaders.length
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    // Schedule next processing cycle
    requestIdleCallback(() => {
      if (this.hasQueuedItems()) {
        this.processQueue();
      } else {
        this.isProcessing = false;
      }
    });
  }

  /**
   * Get concurrency level based on priority and device
   */
  private getConcurrency(priority: LoadingPriority): number {
    if (this.deviceInfo.isLowEndDevice) {
      return priority === "critical" ? 2 : 1;
    }

    if (this.deviceInfo.isMobile) {
      switch (priority) {
        case "critical":
          return 3;
        case "high":
          return 2;
        default:
          return 1;
      }
    }

    // Desktop
    switch (priority) {
      case "critical":
        return 5;
      case "high":
        return 3;
      case "medium":
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Check if there are queued items
   */
  private hasQueuedItems(): boolean {
    return Array.from(this.loadingQueue.values()).some(
      (queue) => queue.size > 0
    );
  }

  /**
   * Mark component as loaded
   */
  markAsLoaded(componentId: string): void {
    this.loadedComponents.add(componentId);
  }

  /**
   * Check if component is loaded
   */
  isLoaded(componentId: string): boolean {
    return this.loadedComponents.has(componentId);
  }
}

// Global instance
export const progressiveLoadingManager =
  ProgressiveLoadingManager.getInstance();
/**
 * Create a progressively loaded component
 */
export function createProgressiveComponent<T = any>(
  loader: ComponentLoader<T>,
  config: ProgressiveLoadingConfig = { priority: "medium" }
): ComponentType<T> {
  const {
    priority = "medium",
    delay = 0,
    intersectionLoading = false,
    intersectionOptions = {},
    fallback: FallbackComponent,
    errorBoundary: ErrorBoundaryComponent,
    preload = false,
    timeout = 10000,
  } = config;

  // Create lazy component
  const LazyComponent = lazy(() => {
    const loadPromise = new Promise<{ default: ComponentType<T> }>(
      (resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Component loading timeout after ${timeout}ms`));
        }, timeout);

        const loadComponent = async () => {
          try {
            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }

            const component = await loader();
            clearTimeout(timeoutId);
            resolve(component);
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        };

        // Add to loading queue
        progressiveLoadingManager.addToQueue(priority, loadComponent);
      }
    );

    return loadPromise;
  });

  // Preload if requested
  if (preload) {
    // Preload with lower priority
    const preloadPriority: LoadingPriority =
      priority === "critical" ? "high" : "low";
    progressiveLoadingManager.addToQueue(preloadPriority, async () => {
      try {
        await loader();
      } catch (error) {
        console.warn("Preload failed:", error);
      }
    });
  }

  // Return wrapped component
  const ProgressiveComponent: ComponentType<T> = (props) => {
    if (intersectionLoading) {
      return (
        <IntersectionLoadingWrapper
          fallback={FallbackComponent}
          errorBoundary={ErrorBoundaryComponent}
          intersectionOptions={intersectionOptions}
        >
          <LazyComponent {...props} />
        </IntersectionLoadingWrapper>
      );
    }

    return (
      <ErrorBoundaryWrapper ErrorComponent={ErrorBoundaryComponent}>
        <Suspense
          fallback={
            FallbackComponent ? <FallbackComponent /> : <DefaultSkeleton />
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundaryWrapper>
    );
  };

  ProgressiveComponent.displayName = `Progressive(${
    LazyComponent.displayName || "Component"
  })`;

  return ProgressiveComponent;
}

/**
 * Intersection loading wrapper
 */
const IntersectionLoadingWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  intersectionOptions?: IntersectionObserverInit;
}> = ({
  children,
  fallback: FallbackComponent,
  errorBoundary: ErrorBoundaryComponent,
  intersectionOptions,
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...intersectionOptions,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [intersectionOptions]);

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <ErrorBoundaryWrapper ErrorComponent={ErrorBoundaryComponent}>
          <Suspense
            fallback={
              FallbackComponent ? <FallbackComponent /> : <DefaultSkeleton />
            }
          >
            {children}
          </Suspense>
        </ErrorBoundaryWrapper>
      ) : FallbackComponent ? (
        <FallbackComponent />
      ) : (
        <DefaultSkeleton />
      )}
    </div>
  );
};
/**
 * Error boundary wrapper
 */
class ErrorBoundaryWrapper extends React.Component<
  {
    children: React.ReactNode;
    ErrorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Progressive loading error:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.ErrorComponent) {
        return (
          <this.props.ErrorComponent
            error={this.state.error}
            retry={this.retry}
          />
        );
      }

      return (
        <DefaultErrorFallback error={this.state.error} retry={this.retry} />
      );
    }

    return this.props.children;
  }
}

/**
 * Default skeleton loading component
 */
const DefaultSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
    <div className="space-y-2">
      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  </div>
);

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-semibold mb-2">
      Failed to load component
    </h3>
    <p className="text-red-600 text-sm mb-3">{error.message}</p>
    <button
      onClick={retry}
      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

/**
 * Hook for progressive loading with priority management
 */
export function useProgressiveLoading<T>(
  loader: ComponentLoader<T>,
  config: ProgressiveLoadingConfig = { priority: "medium" }
) {
  const [component, setComponent] = useState<ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const componentId = useRef(
    `component-${Math.random().toString(36).substr(2, 9)}`
  );

  const loadComponent = useCallback(async () => {
    if (progressiveLoadingManager.isLoaded(componentId.current)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { delay = 0, timeout = 10000 } = config;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Loading timeout")), timeout);
      });

      const loadedComponent = await Promise.race([loader(), timeoutPromise]);

      setComponent(() => loadedComponent.default);
      progressiveLoadingManager.markAsLoaded(componentId.current);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loader, config]);

  useEffect(() => {
    progressiveLoadingManager.addToQueue(config.priority, loadComponent);
  }, [loadComponent, config.priority]);

  const retry = useCallback(() => {
    loadComponent();
  }, [loadComponent]);

  return {
    component,
    loading,
    error,
    retry,
  };
}
