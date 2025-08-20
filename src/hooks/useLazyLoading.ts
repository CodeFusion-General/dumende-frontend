import { useState, useEffect, useRef, useCallback } from "react";

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export interface LazyLoadingResult {
  isIntersecting: boolean;
  hasIntersected: boolean;
  ref: React.RefObject<HTMLElement>;
}

/**
 * Hook for lazy loading elements using Intersection Observer
 * @param options - Intersection Observer options
 * @returns Lazy loading state and ref
 */
export function useLazyLoading(
  options: LazyLoadingOptions = {}
): LazyLoadingResult {
  const { threshold = 0.1, rootMargin = "50px", triggerOnce = true } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);

        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);

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
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return {
    isIntersecting,
    hasIntersected,
    ref,
  };
}

/**
 * Hook for lazy loading images with loading states
 */
export function useLazyImage(src: string, options: LazyLoadingOptions = {}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const { hasIntersected, ref } = useLazyLoading(options);

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
  const { hasIntersected, ref } = useLazyLoading(options);
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
