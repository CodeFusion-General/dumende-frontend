/**
 * React Hook for Image Optimization
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { globalImageOptimizer } from "../lib/image-optimization";

export interface UseImageOptimizationOptions {
  enableLazyLoading?: boolean;
  enableProgressiveLoading?: boolean;
  enableResponsive?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface ImageOptimizationState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  src: string | null;
}

/**
 * Hook for optimized image loading with lazy loading and progressive enhancement
 */
export function useImageOptimization(
  originalSrc: string,
  options: UseImageOptimizationOptions = {}
) {
  const {
    enableLazyLoading = true,
    enableProgressiveLoading = true,
    enableResponsive = false,
    placeholder,
    onLoad,
    onError,
  } = options;

  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<ImageOptimizationState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    src: placeholder || null,
  });

  const loadImage = useCallback(async () => {
    if (!originalSrc || state.isLoaded) return;

    setState((prev) => ({ ...prev, isLoading: true, hasError: false }));

    try {
      // Create a new image element to preload
      const img = new Image();

      // Set up promise for image loading
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      img.src = originalSrc;
      await loadPromise;

      // Update state with loaded image
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        src: originalSrc,
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
  }, [originalSrc, state.isLoaded, onLoad, onError]);

  useEffect(() => {
    if (!enableLazyLoading) {
      loadImage();
      return;
    }

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [enableLazyLoading, loadImage]);

  useEffect(() => {
    // Set up responsive image handling
    if (enableResponsive && imgRef.current) {
      imgRef.current.setAttribute("data-responsive", "true");
      globalImageOptimizer.init();
    }
  }, [enableResponsive]);

  const imageProps = {
    ref: imgRef,
    src: state.src || placeholder,
    "data-src": originalSrc,
    className: `
      ${state.isLoading ? "image-loading" : ""}
      ${state.isLoaded ? "image-loaded" : ""}
      ${state.hasError ? "image-error" : ""}
      ${enableProgressiveLoading ? "progressive-image" : ""}
      ${enableLazyLoading ? "lazy-image" : ""}
      ${enableResponsive ? "responsive-image" : ""}
    `.trim(),
  };

  return {
    imageProps,
    state,
    loadImage,
  };
}

/**
 * Hook for background image optimization
 */
export function useBackgroundImageOptimization(
  originalSrc: string,
  options: UseImageOptimizationOptions = {}
) {
  const { enableLazyLoading = true, onLoad, onError } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<ImageOptimizationState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    src: null,
  });

  const loadBackgroundImage = useCallback(async () => {
    if (!originalSrc || state.isLoaded) return;

    setState((prev) => ({ ...prev, isLoading: true, hasError: false }));

    try {
      // Preload the background image
      const img = new Image();

      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Failed to load background image"));
      });

      img.src = originalSrc;
      await loadPromise;

      // Update state and apply background
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        src: originalSrc,
      }));

      if (elementRef.current) {
        elementRef.current.style.backgroundImage = `url(${originalSrc})`;
      }

      onLoad?.();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        hasError: true,
      }));

      onError?.(error as Error);
    }
  }, [originalSrc, state.isLoaded, onLoad, onError]);

  useEffect(() => {
    if (!enableLazyLoading) {
      loadBackgroundImage();
      return;
    }

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadBackgroundImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [enableLazyLoading, loadBackgroundImage]);

  const backgroundProps = {
    ref: elementRef,
    "data-bg-src": originalSrc,
    className: `
      ${state.isLoading ? "bg-loading" : ""}
      ${state.isLoaded ? "bg-loaded" : ""}
      ${state.hasError ? "bg-error" : ""}
    `.trim(),
    style: {
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
  };

  return {
    backgroundProps,
    state,
    loadBackgroundImage,
  };
}

/**
 * Hook for responsive image srcset generation
 */
export function useResponsiveImage(
  baseSrc: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536]
) {
  const generateSrcSet = useCallback(() => {
    return breakpoints
      .map((width) => {
        // This would typically integrate with your image CDN
        const url = new URL(baseSrc, window.location.origin);
        url.searchParams.set("w", width.toString());
        url.searchParams.set("q", "85");
        return `${url.toString()} ${width}w`;
      })
      .join(", ");
  }, [baseSrc, breakpoints]);

  const generateSizes = useCallback(() => {
    const sizeRules = breakpoints
      .reverse()
      .map((width, index) => {
        if (index === breakpoints.length - 1) {
          return `${width}px`;
        }
        return `(min-width: ${width}px) ${width}px`;
      })
      .join(", ");

    return `${sizeRules}, 100vw`;
  }, [breakpoints]);

  return {
    srcSet: generateSrcSet(),
    sizes: generateSizes(),
  };
}

/**
 * Hook for image format detection and optimization
 */
export function useImageFormatOptimization() {
  const [supportedFormats, setSupportedFormats] = useState({
    webp: false,
    avif: false,
  });

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    };

    const checkAVIFSupport = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      try {
        return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
      } catch {
        return false;
      }
    };

    setSupportedFormats({
      webp: checkWebPSupport(),
      avif: checkAVIFSupport(),
    });

    // Add classes to document for CSS targeting
    const root = document.documentElement;
    if (supportedFormats.webp) {
      root.classList.add("webp");
    } else {
      root.classList.add("no-webp");
    }

    if (supportedFormats.avif) {
      root.classList.add("avif");
    } else {
      root.classList.add("no-avif");
    }
  }, []);

  const getOptimizedSrc = useCallback(
    (originalSrc: string) => {
      if (supportedFormats.avif) {
        return originalSrc.replace(/\.(jpg|jpeg|png|webp)$/i, ".avif");
      }

      if (supportedFormats.webp) {
        return originalSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp");
      }

      return originalSrc;
    },
    [supportedFormats]
  );

  return {
    supportedFormats,
    getOptimizedSrc,
  };
}

/**
 * Hook for image performance monitoring
 */
export function useImagePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
  });

  const trackImageLoad = useCallback((loadTime: number) => {
    setMetrics((prev) => ({
      ...prev,
      loadedImages: prev.loadedImages + 1,
      averageLoadTime:
        (prev.averageLoadTime * (prev.loadedImages - 1) + loadTime) /
        prev.loadedImages,
    }));
  }, []);

  const trackImageError = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      failedImages: prev.failedImages + 1,
    }));
  }, []);

  const trackImageStart = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      totalImages: prev.totalImages + 1,
    }));
  }, []);

  return {
    metrics,
    trackImageLoad,
    trackImageError,
    trackImageStart,
  };
}
