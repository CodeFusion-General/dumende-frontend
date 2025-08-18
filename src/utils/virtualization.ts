/**
 * List Virtualization Utilities
 *
 * Provides virtual scrolling and windowing for large lists to improve mobile performance.
 *
 * Requirements: 1.4, 4.2 - List performance optimization and mobile scroll performance
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { mobileDetection } from "@/utils/mobileDetection";

/**
 * Configuration for virtual scrolling
 */
export interface VirtualScrollConfig {
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render outside visible area (buffer) */
  overscan?: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Enable horizontal scrolling */
  horizontal?: boolean;
  /** Scroll threshold for triggering updates */
  scrollThreshold?: number;
  /** Enable smooth scrolling */
  smoothScrolling?: boolean;
  /** Custom scroll container selector */
  scrollContainer?: string;
}

/**
 * Virtual scroll state
 */
export interface VirtualScrollState {
  /** Index of first visible item */
  startIndex: number;
  /** Index of last visible item */
  endIndex: number;
  /** Total height/width of virtual container */
  totalSize: number;
  /** Offset for positioning visible items */
  offsetBefore: number;
  /** Offset after visible items */
  offsetAfter: number;
  /** Currently visible items */
  visibleItems: number[];
}

/**
 * Hook for virtual scrolling large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  config: VirtualScrollConfig
): VirtualScrollState & {
  scrollElementRef: React.RefObject<HTMLDivElement>;
  getItemProps: (index: number) => {
    key: string;
    style: React.CSSProperties;
    "data-index": number;
  };
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  scrollToTop: () => void;
} {
  const {
    itemHeight,
    overscan = 5,
    containerHeight,
    horizontal = false,
    scrollThreshold = 1,
    smoothScrolling = true,
  } = config;

  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect mobile device for optimizations
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;
  const isLowEndDevice = deviceInfo.isLowEndDevice;

  // Adjust overscan for mobile devices
  const effectiveOverscan = useMemo(() => {
    if (isLowEndDevice) return Math.max(1, overscan - 2);
    if (isMobile) return Math.max(2, overscan - 1);
    return overscan;
  }, [overscan, isMobile, isLowEndDevice]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const itemCount = items.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    const startIndex = Math.max(
      0,
      Math.floor(scrollOffset / itemHeight) - effectiveOverscan
    );

    const endIndex = Math.min(
      itemCount - 1,
      startIndex + visibleCount + effectiveOverscan * 2
    );

    return { startIndex, endIndex, visibleCount };
  }, [
    scrollOffset,
    itemHeight,
    containerHeight,
    items.length,
    effectiveOverscan,
  ]);

  // Calculate virtual scroll state
  const virtualState = useMemo((): VirtualScrollState => {
    const { startIndex, endIndex } = visibleRange;
    const totalSize = items.length * itemHeight;
    const offsetBefore = startIndex * itemHeight;
    const offsetAfter = (items.length - endIndex - 1) * itemHeight;
    const visibleItems = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i
    );

    return {
      startIndex,
      endIndex,
      totalSize,
      offsetBefore,
      offsetAfter,
      visibleItems,
    };
  }, [visibleRange, items.length, itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      const newScrollOffset = horizontal ? target.scrollLeft : target.scrollTop;

      // Apply scroll threshold to reduce update frequency on mobile
      if (Math.abs(newScrollOffset - scrollOffset) >= scrollThreshold) {
        setScrollOffset(newScrollOffset);
      }

      // Track scrolling state for performance optimizations
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    },
    [scrollOffset, scrollThreshold, horizontal]
  );

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    // Use passive listeners for better mobile performance
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Get props for individual items
  const getItemProps = useCallback(
    (index: number) => {
      const offset = index * itemHeight;

      return {
        key: `virtual-item-${index}`,
        style: {
          position: "absolute" as const,
          [horizontal ? "left" : "top"]: offset,
          [horizontal ? "width" : "height"]: itemHeight,
          width: horizontal ? itemHeight : "100%",
        },
        "data-index": index,
      };
    },
    [itemHeight, horizontal]
  );

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const scrollElement = scrollElementRef.current;
      if (!scrollElement) return;

      const offset = index * itemHeight;
      const scrollOptions: ScrollToOptions = {
        [horizontal ? "left" : "top"]: offset,
        behavior: smoothScrolling ? behavior : "auto",
      };

      scrollElement.scrollTo(scrollOptions);
    },
    [itemHeight, horizontal, smoothScrolling]
  );

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  return {
    ...virtualState,
    scrollElementRef,
    getItemProps,
    scrollToIndex,
    scrollToTop,
  };
}

/**
 * Configuration for windowed lists
 */
export interface WindowedListConfig {
  /** Number of items per window */
  windowSize: number;
  /** Number of windows to keep in memory */
  maxWindows?: number;
  /** Preload threshold (load next window when this many items from end) */
  preloadThreshold?: number;
  /** Enable infinite scrolling */
  infiniteScroll?: boolean;
  /** Callback for loading more data */
  onLoadMore?: () => Promise<void>;
}

/**
 * Hook for windowed infinite scrolling
 */
export function useWindowedList<T>(
  items: T[],
  config: WindowedListConfig
): {
  visibleItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
  currentWindow: number;
  totalWindows: number;
} {
  const {
    windowSize,
    maxWindows = 3,
    preloadThreshold = 5,
    infiniteScroll = true,
    onLoadMore,
  } = config;

  const [currentWindow, setCurrentWindow] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  // Calculate visible items based on current window
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(
      0,
      (currentWindow - Math.floor(maxWindows / 2)) * windowSize
    );
    const endIndex = Math.min(
      items.length,
      (currentWindow + Math.ceil(maxWindows / 2) + 1) * windowSize
    );

    return items.slice(startIndex, endIndex);
  }, [items, currentWindow, windowSize, maxWindows]);

  // Calculate if there are more items to load
  const hasMore = useMemo(() => {
    const totalDisplayed = (currentWindow + 1) * windowSize;
    return (
      totalDisplayed < items.length ||
      (infiniteScroll && onLoadMore && !hasLoadedMore)
    );
  }, [
    currentWindow,
    windowSize,
    items.length,
    infiniteScroll,
    onLoadMore,
    hasLoadedMore,
  ]);

  // Calculate total windows
  const totalWindows = useMemo(() => {
    return Math.ceil(items.length / windowSize);
  }, [items.length, windowSize]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (isLoading) return;

    // Check if we need to load more from external source
    const remainingItems = items.length - (currentWindow + 1) * windowSize;

    if (remainingItems <= preloadThreshold && onLoadMore && !hasLoadedMore) {
      setIsLoading(true);
      try {
        await onLoadMore();
        setHasLoadedMore(true);
      } catch (error) {
        console.error("Failed to load more items:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (remainingItems > 0) {
      // Move to next window
      setCurrentWindow((prev) => prev + 1);
    }
  }, [
    currentWindow,
    windowSize,
    preloadThreshold,
    onLoadMore,
    hasLoadedMore,
    isLoading,
    items.length,
  ]);

  // Reset to first window
  const reset = useCallback(() => {
    setCurrentWindow(0);
    setHasLoadedMore(false);
  }, []);

  // Auto-load more when approaching end
  useEffect(() => {
    if (!infiniteScroll || !hasMore) return;

    const remainingItems = items.length - (currentWindow + 1) * windowSize;
    if (remainingItems <= preloadThreshold) {
      loadMore();
    }
  }, [
    currentWindow,
    windowSize,
    preloadThreshold,
    infiniteScroll,
    hasMore,
    loadMore,
    items.length,
  ]);

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMore,
    reset,
    currentWindow,
    totalWindows,
  };
}

/**
 * Hook for intersection observer-based lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): {
  ref: React.RefObject<HTMLDivElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return { ref, isIntersecting, entry };
}

/**
 * Mobile-optimized scroll performance utilities
 */
export class MobileScrollOptimizer {
  private static instance: MobileScrollOptimizer;
  private scrollElements = new Set<HTMLElement>();
  private rafId: number | null = null;
  private isOptimizing = false;

  static getInstance(): MobileScrollOptimizer {
    if (!MobileScrollOptimizer.instance) {
      MobileScrollOptimizer.instance = new MobileScrollOptimizer();
    }
    return MobileScrollOptimizer.instance;
  }

  /**
   * Optimize scroll performance for mobile devices
   */
  optimizeScrollElement(element: HTMLElement): void {
    if (this.scrollElements.has(element)) return;

    // Apply mobile scroll optimizations
    element.style.webkitOverflowScrolling = "touch";
    element.style.overflowScrolling = "touch";

    // Reduce scroll frequency on low-end devices
    const deviceInfo = mobileDetection.detectMobileDevice();
    if (deviceInfo.isLowEndDevice) {
      this.throttleScrollEvents(element);
    }

    // Add momentum scrolling for iOS
    if (deviceInfo.isMobile) {
      element.style.webkitOverflowScrolling = "touch";
    }

    this.scrollElements.add(element);
  }

  /**
   * Throttle scroll events for better performance
   */
  private throttleScrollEvents(element: HTMLElement): void {
    let isThrottled = false;

    const originalAddEventListener = element.addEventListener;
    element.addEventListener = function (
      type: string,
      listener: any,
      options?: any
    ) {
      if (type === "scroll" && !isThrottled) {
        const throttledListener = (event: Event) => {
          if (!isThrottled) {
            isThrottled = true;
            requestAnimationFrame(() => {
              listener(event);
              isThrottled = false;
            });
          }
        };

        return originalAddEventListener.call(
          this,
          type,
          throttledListener,
          options
        );
      }

      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  /**
   * Enable scroll performance monitoring
   */
  startMonitoring(): void {
    if (this.isOptimizing) return;

    this.isOptimizing = true;
    this.monitorScrollPerformance();
  }

  /**
   * Monitor scroll performance and apply optimizations
   */
  private monitorScrollPerformance(): void {
    let lastScrollTime = 0;
    let scrollCount = 0;

    const checkPerformance = () => {
      const now = performance.now();

      if (now - lastScrollTime > 1000) {
        // Check scroll frequency
        if (scrollCount > 60) {
          // More than 60 scroll events per second
          console.warn(
            "High scroll frequency detected, applying optimizations"
          );
          this.applyPerformanceOptimizations();
        }

        scrollCount = 0;
        lastScrollTime = now;
      }

      if (this.isOptimizing) {
        this.rafId = requestAnimationFrame(checkPerformance);
      }
    };

    this.rafId = requestAnimationFrame(checkPerformance);
  }

  /**
   * Apply performance optimizations when needed
   */
  private applyPerformanceOptimizations(): void {
    this.scrollElements.forEach((element) => {
      // Reduce scroll sensitivity
      element.style.scrollBehavior = "auto";

      // Disable smooth scrolling temporarily
      const smoothScrollElements = element.querySelectorAll(
        '[style*="scroll-behavior: smooth"]'
      );
      smoothScrollElements.forEach((el) => {
        (el as HTMLElement).style.scrollBehavior = "auto";
      });
    });
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring(): void {
    this.isOptimizing = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Remove element from optimization
   */
  removeElement(element: HTMLElement): void {
    this.scrollElements.delete(element);
  }

  /**
   * Cleanup all optimizations
   */
  cleanup(): void {
    this.stopMonitoring();
    this.scrollElements.clear();
  }
}

/**
 * Hook for mobile-optimized scrolling
 */
export function useMobileScrollOptimization(
  elementRef: React.RefObject<HTMLElement>,
  enabled: boolean = true
): {
  optimizer: MobileScrollOptimizer;
  isOptimized: boolean;
} {
  const [isOptimized, setIsOptimized] = useState(false);
  const optimizer = useMemo(() => MobileScrollOptimizer.getInstance(), []);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    optimizer.optimizeScrollElement(element);
    optimizer.startMonitoring();
    setIsOptimized(true);

    return () => {
      optimizer.removeElement(element);
      setIsOptimized(false);
    };
  }, [elementRef, enabled, optimizer]);

  return { optimizer, isOptimized };
}
