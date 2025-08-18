/**
 * Advanced Lazy Loading Hook with Mobile Optimization
 * Implements Requirements 2.2, 2.3 for progressive image loading
 */

import { useEffect, useRef, useState, useCallback } from "react";

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  enableProgressiveLoading?: boolean;
  enablePriorityLoading?: boolean;
  mobileOptimized?: boolean;
  blurTransition?: boolean;
  onIntersect?: () => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface LazyLoadingState {
  isIntersecting: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  loadProgress: number;
}

/**
 * Hook for IntersectionObserver-based lazy loading with mobile optimizations
 */
export function useLazyLoading(options: LazyLoadingOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = "50px",
    enableProgressiveLoading = true,
    enablePriorityLoading = false,
    mobileOptimized = true,
    blurTransition = true,
    onIntersect,
    onLoad,
    onError,
  } = options;

  const [state, setState] = useState<LazyLoadingState>({
    isIntersecting: false,
    isLoading: false,
    isLoaded: false,
    hasError: false,
    loadProgress: 0,
  });

  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Mobile-specific optimizations
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const isSlowConnection =
    typeof navigator !== "undefined" &&
    "connection" in navigator &&
    ((navigator as any).connection?.effectiveType === "slow-2g" ||
      (navigator as any).connection?.effectiveType === "2g");

  // Adjust settings for mobile
  const mobileRootMargin = mobileOptimized && isMobile ? "100px" : rootMargin;
  const mobileThreshold = mobileOptimized && isMobile ? 0.05 : threshold;

  // Initialize intersection observer
  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState((prev) => ({ ...prev, isIntersecting: true }));
            onIntersect?.();

            // Unobserve after intersection for performance
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: mobileThreshold,
        rootMargin: mobileRootMargin,
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [mobileThreshold, mobileRootMargin, onIntersect]);

  // Load content when intersecting
  const loadContent = useCallback(
    async (src: string) => {
      if (state.isLoaded || state.isLoading) return;

      setState((prev) => ({ ...prev, isLoading: true, loadProgress: 0 }));

      try {
        // Progressive loading with blur-to-sharp transition
        if (enableProgressiveLoading && blurTransition) {
          await loadWithProgressiveTransition(src, (progress) => {
            setState((prev) => ({ ...prev, loadProgress: progress }));
          });
        } else {
          await loadImage(src);
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoaded: true,
          loadProgress: 100,
        }));
        onLoad?.();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          hasError: true,
        }));
        onError?.(error as Error);
      }
    },
    [
      state.isLoaded,
      state.isLoading,
      enableProgressiveLoading,
      blurTransition,
      onLoad,
      onError,
    ]
  );

  // Reset loading state
  const reset = useCallback(() => {
    setState({
      isIntersecting: false,
      isLoading: false,
      isLoaded: false,
      hasError: false,
      loadProgress: 0,
    });
  }, []);

  return {
    elementRef,
    state,
    loadContent,
    reset,
  };
}

/**
 * Hook for priority-based lazy loading
 */
export function usePriorityLazyLoading(
  priority: "critical" | "high" | "medium" | "low" = "medium"
) {
  const [loadQueue, setLoadQueue] = useState<
    Array<{ element: HTMLElement; priority: string; src: string }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const priorityOrder = ["critical", "high", "medium", "low"];

  const addToQueue = useCallback(
    (element: HTMLElement, src: string, itemPriority: string) => {
      setLoadQueue((prev) => [
        ...prev,
        { element, priority: itemPriority, src },
      ]);
    },
    []
  );

  const processQueue = useCallback(async () => {
    if (isProcessing || loadQueue.length === 0) return;

    setIsProcessing(true);

    // Sort by priority
    const sortedQueue = [...loadQueue].sort((a, b) => {
      return (
        priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      );
    });

    // Process items with delay between each to prevent overwhelming the browser
    for (const item of sortedQueue) {
      try {
        await loadImage(item.src);

        // Small delay between loads to prevent blocking
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error("Failed to load priority image:", error);
      }
    }

    setLoadQueue([]);
    setIsProcessing(false);
  }, [loadQueue, isProcessing]);

  useEffect(() => {
    processQueue();
  }, [processQueue]);

  return {
    addToQueue,
    queueLength: loadQueue.length,
    isProcessing,
  };
}

/**
 * Hook for blur-to-sharp progressive loading
 */
export function useProgressiveImageLoading(
  src: string,
  options: LazyLoadingOptions = {}
) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [blurLevel, setBlurLevel] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { elementRef, state, loadContent } = useLazyLoading(options);

  useEffect(() => {
    if (state.isIntersecting && !state.isLoaded) {
      loadProgressiveImage();
    }
  }, [state.isIntersecting]);

  const loadProgressiveImage = async () => {
    setIsTransitioning(true);

    try {
      // Load low-quality placeholder first
      const lowQualitySrc = generateLowQualityUrl(src);
      setCurrentSrc(lowQualitySrc);

      // Gradually reduce blur as high-quality image loads
      const highQualityImg = new Image();
      highQualityImg.src = src;

      await new Promise<void>((resolve, reject) => {
        highQualityImg.onload = () => {
          // Smooth transition from blurred to sharp
          const transitionDuration = 300;
          const steps = 10;
          const stepDuration = transitionDuration / steps;

          let currentStep = 0;
          const interval = setInterval(() => {
            currentStep++;
            const newBlurLevel = 10 - (currentStep / steps) * 10;
            setBlurLevel(Math.max(0, newBlurLevel));

            if (currentStep >= steps) {
              clearInterval(interval);
              setCurrentSrc(src);
              setBlurLevel(0);
              setIsTransitioning(false);
              resolve();
            }
          }, stepDuration);
        };

        highQualityImg.onerror = reject;
      });
    } catch (error) {
      setIsTransitioning(false);
      throw error;
    }
  };

  return {
    elementRef,
    currentSrc,
    blurLevel,
    isTransitioning,
    state,
  };
}

/**
 * Hook for batch lazy loading optimization
 */
export function useBatchLazyLoading(batchSize: number = 3) {
  const [loadingBatch, setLoadingBatch] = useState<Set<string>>(new Set());
  const [completedBatch, setCompletedBatch] = useState<Set<string>>(new Set());
  const queueRef = useRef<Array<{ id: string; loadFn: () => Promise<void> }>>(
    []
  );

  const addToBatch = useCallback((id: string, loadFn: () => Promise<void>) => {
    queueRef.current.push({ id, loadFn });
    processBatch();
  }, []);

  const processBatch = useCallback(async () => {
    if (loadingBatch.size >= batchSize || queueRef.current.length === 0) return;

    const batch = queueRef.current.splice(0, batchSize - loadingBatch.size);
    const newLoadingIds = new Set([
      ...loadingBatch,
      ...batch.map((item) => item.id),
    ]);
    setLoadingBatch(newLoadingIds);

    // Load batch items in parallel
    const promises = batch.map(async (item) => {
      try {
        await item.loadFn();
        setCompletedBatch((prev) => new Set([...prev, item.id]));
      } catch (error) {
        console.error(`Failed to load batch item ${item.id}:`, error);
      } finally {
        setLoadingBatch((prev) => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }
    });

    await Promise.all(promises);

    // Process next batch if queue has items
    if (queueRef.current.length > 0) {
      setTimeout(processBatch, 100); // Small delay between batches
    }
  }, [loadingBatch, batchSize]);

  return {
    addToBatch,
    loadingBatch,
    completedBatch,
    queueLength: queueRef.current.length,
  };
}

// Helper functions

/**
 * Load image with progress tracking
 */
async function loadWithProgressiveTransition(
  src: string,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 90) progress = 90;
      onProgress(progress);
    }, 100);

    img.onload = () => {
      clearInterval(progressInterval);
      onProgress(100);
      setTimeout(resolve, 100); // Small delay for smooth transition
    };

    img.onerror = () => {
      clearInterval(progressInterval);
      reject(new Error("Failed to load image"));
    };

    img.src = src;
  });
}

/**
 * Basic image loading promise
 */
async function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Generate low-quality image URL for progressive loading
 */
function generateLowQualityUrl(src: string): string {
  const url = new URL(src, window.location.origin);
  url.searchParams.set("q", "20"); // Very low quality
  url.searchParams.set("blur", "5"); // Add blur
  url.searchParams.set("w", "50"); // Small width
  return url.toString();
}
