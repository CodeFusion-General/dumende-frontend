import { useState, useEffect, useRef, useCallback, RefObject } from "react";

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  enableProgressiveLoading?: boolean;
  mobileOptimized?: boolean;
  onIntersect?: () => void;
}

export interface LazyLoadingState {
  isIntersecting: boolean;
  hasIntersected: boolean;
  isLoading: boolean;
  isLoaded: boolean;
}

export interface LazyLoadingResult {
  isIntersecting: boolean;
  hasIntersected: boolean;
  ref: React.RefObject<HTMLElement>;
  // Aliases for compatibility with MobileOptimizedImage
  elementRef: React.MutableRefObject<HTMLElement | null>;
  state: LazyLoadingState;
}

/**
 * Hook for lazy loading elements using Intersection Observer
 * @param options - Intersection Observer options
 * @returns Lazy loading state and ref
 */
export function useLazyLoading(
  options: LazyLoadingOptions = {}
): LazyLoadingResult {
  const {
    threshold = 0.1,
    rootMargin = "50px",
    triggerOnce = true,
    onIntersect,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);

        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);
          setIsLoading(false);
          setIsLoaded(true);
          onIntersect?.();

          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasIntersected, onIntersect]);

  // Create state object for compatibility
  const state: LazyLoadingState = {
    isIntersecting,
    hasIntersected,
    isLoading,
    isLoaded,
  };

  return {
    isIntersecting,
    hasIntersected,
    ref: elementRef as React.RefObject<HTMLElement>,
    elementRef,
    state,
  };
}

/**
 * Hook for lazy loading images with loading states
 */
export function useLazyImage(src: string, options: LazyLoadingOptions = {}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const { hasIntersected, ref, elementRef } = useLazyLoading(options);

  useEffect(() => {
    if (!hasIntersected || !src) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
      setImageError(false);
    };

    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasIntersected, src]);

  return {
    imageSrc,
    imageLoaded,
    imageError,
    hasIntersected,
    ref,
  };
}

/**
 * Hook for lazy loading data with caching
 */
export function useLazyData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: LazyLoadingOptions & { cacheKey?: string } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { hasIntersected, ref, elementRef } = useLazyLoading(options);
  const { cacheKey } = options;

  // Simple in-memory cache
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const loadData = useCallback(async () => {
    if (!hasIntersected) return;

    // Check cache first
    if (cacheKey) {
      const cached = cache.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);

      // Cache the result
      if (cacheKey) {
        cache.current.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [hasIntersected, fetchFn, cacheKey]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  const refetch = useCallback(() => {
    if (cacheKey) {
      cache.current.delete(cacheKey);
    }
    loadData();
  }, [loadData, cacheKey]);

  return {
    data,
    loading,
    error,
    hasIntersected,
    ref,
    refetch,
  };
}

/**
 * Hook for debounced lazy loading (useful for search/filtering)
 */
export function useDebouncedLazyData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  delay: number = 300,
  options: LazyLoadingOptions & { cacheKey?: string } = {}
) {
  const [debouncedDeps, setDebouncedDeps] = useState(dependencies);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedDeps(dependencies);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  return useLazyData(fetchFn, debouncedDeps, options);
}

/**
 * Progressive image loading options
 */
export interface ProgressiveImageLoadingOptions {
  enableProgressiveLoading?: boolean;
  mobileOptimized?: boolean;
  blurTransition?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Progressive image loading state
 */
export interface ProgressiveImageLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error?: Error;
}

/**
 * Progressive image loading result
 */
export interface ProgressiveImageLoadingResult {
  elementRef: RefObject<HTMLImageElement>;
  currentSrc: string | undefined;
  blurLevel: number;
  isTransitioning: boolean;
  state: ProgressiveImageLoadingState;
}

/**
 * Hook for progressive image loading with blur-to-sharp transition
 * Implements Requirements 2.2, 2.3 for progressive image loading
 */
export function useProgressiveImageLoading(
  src: string,
  options: ProgressiveImageLoadingOptions = {}
): ProgressiveImageLoadingResult {
  const {
    enableProgressiveLoading = true,
    mobileOptimized = false,
    blurTransition = true,
    onLoad,
    onError,
  } = options;

  const elementRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>();
  const [blurLevel, setBlurLevel] = useState(blurTransition ? 20 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [state, setState] = useState<ProgressiveImageLoadingState>({
    isLoading: true,
    isLoaded: false,
    hasError: false,
  });

  // Lazy loading with intersection observer
  const { hasIntersected } = useLazyLoading({
    threshold: 0.1,
    rootMargin: mobileOptimized ? "100px" : "200px",
    triggerOnce: true,
  });

  useEffect(() => {
    if (!hasIntersected || !src) return;

    if (!enableProgressiveLoading) {
      setCurrentSrc(src);
      setBlurLevel(0);
      setState({ isLoading: false, isLoaded: true, hasError: false });
      onLoad?.();
      return;
    }

    setState({ isLoading: true, isLoaded: false, hasError: false });
    setIsTransitioning(true);

    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);

      if (blurTransition) {
        // Animate blur reduction
        let blur = 20;
        const interval = setInterval(() => {
          blur = Math.max(0, blur - 2);
          setBlurLevel(blur);
          if (blur === 0) {
            clearInterval(interval);
            setIsTransitioning(false);
          }
        }, 30);
      } else {
        setBlurLevel(0);
        setIsTransitioning(false);
      }

      setState({ isLoading: false, isLoaded: true, hasError: false });
      onLoad?.();
    };

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${src}`);
      setState({ isLoading: false, isLoaded: false, hasError: true, error });
      setIsTransitioning(false);
      onError?.(error);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasIntersected, src, enableProgressiveLoading, blurTransition, mobileOptimized, onLoad, onError]);

  return {
    elementRef,
    currentSrc,
    blurLevel,
    isTransitioning,
    state,
  };
}
