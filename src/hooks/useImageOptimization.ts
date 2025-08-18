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
 * Hook for image format detection and optimization with mobile-specific enhancements
 * Implements Requirements 2.4, 5.3 for format optimization and mobile compression
 */
export function useImageFormatOptimization() {
  const [supportedFormats, setSupportedFormats] = useState({
    webp: false,
    avif: false,
    heic: false,
    jxl: false,
  });

  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isMobile: false,
    isLowEndDevice: false,
    connectionType: "unknown" as "slow-2g" | "2g" | "3g" | "4g" | "unknown",
    memoryLimit: 0,
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

    const checkHEICSupport = () => {
      // HEIC support detection (mainly for iOS Safari)
      const img = new Image();
      img.src = "data:image/heic;base64,";
      return img.complete && img.naturalWidth > 0;
    };

    const checkJXLSupport = () => {
      // JPEG XL support detection
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      try {
        return canvas.toDataURL("image/jxl").indexOf("data:image/jxl") === 0;
      } catch {
        return false;
      }
    };

    const detectDeviceCapabilities = () => {
      const isMobile =
        window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

      // Detect low-end device based on various factors
      const isLowEndDevice =
        ((navigator as any).deviceMemory &&
          (navigator as any).deviceMemory <= 2) ||
        ((navigator as any).hardwareConcurrency &&
          (navigator as any).hardwareConcurrency <= 2) ||
        /Android.*[2-4]\./i.test(navigator.userAgent);

      // Detect connection type
      const connection = (navigator as any).connection;
      const connectionType = connection ? connection.effectiveType : "unknown";

      // Estimate memory limit
      const memoryLimit = (navigator as any).deviceMemory
        ? (navigator as any).deviceMemory * 1024 * 1024 * 1024 // Convert GB to bytes
        : isMobile
        ? 2 * 1024 * 1024 * 1024
        : 4 * 1024 * 1024 * 1024; // Default estimates

      return {
        isMobile,
        isLowEndDevice,
        connectionType,
        memoryLimit,
      };
    };

    const formats = {
      webp: checkWebPSupport(),
      avif: checkAVIFSupport(),
      heic: checkHEICSupport(),
      jxl: checkJXLSupport(),
    };

    setSupportedFormats(formats);
    setDeviceCapabilities(detectDeviceCapabilities());

    // Add classes to document for CSS targeting
    const root = document.documentElement;
    Object.entries(formats).forEach(([format, supported]) => {
      if (supported) {
        root.classList.add(format);
      } else {
        root.classList.add(`no-${format}`);
      }
    });

    // Add device capability classes
    const capabilities = detectDeviceCapabilities();
    if (capabilities.isMobile) root.classList.add("mobile-device");
    if (capabilities.isLowEndDevice) root.classList.add("low-end-device");
    root.classList.add(`connection-${capabilities.connectionType}`);
  }, []);

  const getOptimizedSrc = useCallback(
    (
      originalSrc: string,
      options: {
        quality?: number;
        width?: number;
        mobileOptimized?: boolean;
        compressionLevel?: "low" | "medium" | "high";
      } = {}
    ) => {
      const {
        quality = 85,
        width,
        mobileOptimized = true,
        compressionLevel = "medium",
      } = options;

      // Determine optimal format based on support and device capabilities
      let targetFormat = getOptimalFormat();
      let targetQuality = quality;
      let targetWidth = width;

      // Mobile-specific optimizations
      if (mobileOptimized && deviceCapabilities.isMobile) {
        // Reduce quality for mobile devices with slow connections
        if (
          deviceCapabilities.connectionType === "slow-2g" ||
          deviceCapabilities.connectionType === "2g"
        ) {
          targetQuality = Math.min(targetQuality, 60);
        } else if (deviceCapabilities.connectionType === "3g") {
          targetQuality = Math.min(targetQuality, 75);
        }

        // Reduce size for low-end devices
        if (deviceCapabilities.isLowEndDevice) {
          targetQuality = Math.min(targetQuality, 70);
          if (!targetWidth) {
            targetWidth = Math.min(window.innerWidth * 2, 1024); // 2x for retina, max 1024
          }
        }

        // Apply compression level
        switch (compressionLevel) {
          case "high":
            targetQuality = Math.min(targetQuality, 50);
            break;
          case "medium":
            targetQuality = Math.min(targetQuality, 75);
            break;
          case "low":
            // Keep original quality
            break;
        }
      }

      // Build optimized URL
      const url = new URL(originalSrc, window.location.origin);

      // Set format
      if (targetFormat !== "original") {
        const extension = `.${targetFormat}`;
        const currentExtension = originalSrc.match(
          /\.(jpg|jpeg|png|webp|avif|heic|jxl)$/i
        );
        if (currentExtension) {
          url.pathname = url.pathname.replace(currentExtension[0], extension);
        }
      }

      // Set quality
      url.searchParams.set("q", targetQuality.toString());

      // Set width if specified
      if (targetWidth) {
        url.searchParams.set("w", targetWidth.toString());
      }

      // Add mobile optimization flag
      if (mobileOptimized && deviceCapabilities.isMobile) {
        url.searchParams.set("mobile", "1");
      }

      return url.toString();
    },
    [supportedFormats, deviceCapabilities]
  );

  const getOptimalFormat = useCallback(() => {
    // Priority order: AVIF > WebP > HEIC > JXL > Original
    if (supportedFormats.avif) return "avif";
    if (supportedFormats.webp) return "webp";
    if (supportedFormats.heic) return "heic";
    if (supportedFormats.jxl) return "jxl";
    return "original";
  }, [supportedFormats]);

  const getCompressionRecommendation = useCallback(
    (fileSize: number) => {
      const { isMobile, isLowEndDevice, connectionType } = deviceCapabilities;

      // File size thresholds (in bytes)
      const SMALL_FILE = 100 * 1024; // 100KB
      const MEDIUM_FILE = 500 * 1024; // 500KB
      const LARGE_FILE = 1024 * 1024; // 1MB

      if (fileSize <= SMALL_FILE) {
        return "low"; // Minimal compression for small files
      }

      if (isMobile || isLowEndDevice) {
        if (connectionType === "slow-2g" || connectionType === "2g") {
          return "high"; // Aggressive compression for slow connections
        }
        if (fileSize >= LARGE_FILE) {
          return "high"; // Compress large files on mobile
        }
        return "medium";
      }

      if (fileSize >= LARGE_FILE) {
        return "medium"; // Moderate compression for large files on desktop
      }

      return "low"; // Minimal compression for desktop
    },
    [deviceCapabilities]
  );

  const generateSrcSet = useCallback(
    (
      baseSrc: string,
      breakpoints: number[] = [320, 480, 640, 768, 1024, 1280, 1536],
      options: { quality?: number; mobileOptimized?: boolean } = {}
    ) => {
      return breakpoints
        .map((width) => {
          const optimizedSrc = getOptimizedSrc(baseSrc, {
            ...options,
            width,
          });
          return `${optimizedSrc} ${width}w`;
        })
        .join(", ");
    },
    [getOptimizedSrc]
  );

  const generateSizes = useCallback(
    (breakpoints: number[] = [320, 480, 640, 768, 1024, 1280, 1536]) => {
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
    },
    []
  );

  return {
    supportedFormats,
    deviceCapabilities,
    getOptimizedSrc,
    getOptimalFormat,
    getCompressionRecommendation,
    generateSrcSet,
    generateSizes,
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
