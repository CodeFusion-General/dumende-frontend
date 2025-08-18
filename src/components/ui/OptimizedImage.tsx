/**
 * Mobile-First Optimized Image Component with Progressive Loading and Lazy Loading
 * Implements Requirements 2.1, 2.2, 2.3, 2.4 for mobile performance optimization
 */

import React, {
  forwardRef,
  ImgHTMLAttributes,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  useImageOptimization,
  useResponsiveImage,
  useImageFormatOptimization,
} from "../../hooks/useImageOptimization";
import {
  useLazyLoading,
  useProgressiveImageLoading,
} from "../../hooks/useLazyLoading";

export interface OptimizedImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "sizes"
  > {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  enableLazyLoading?: boolean;
  enableProgressiveLoading?: boolean;
  enableResponsive?: boolean;
  enableFormatOptimization?: boolean;
  placeholder?: string;
  lowQualityPlaceholder?: string;
  breakpoints?: number[];
  quality?: number;
  priority?: boolean; // For above-the-fold images
  mobileOptimized?: boolean; // Enable mobile-specific optimizations
  aspectRatio?: string; // CSS aspect-ratio value
  objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Mobile-First Optimized Image Component
 * Implements mobile-specific optimizations for better performance on mobile devices
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      enableLazyLoading = true,
      enableProgressiveLoading = true,
      enableResponsive = true, // Default to true for mobile optimization
      enableFormatOptimization = true,
      placeholder,
      lowQualityPlaceholder,
      breakpoints = [320, 480, 640, 768, 1024, 1280, 1536], // Mobile-first breakpoints
      quality = 85,
      priority = false,
      mobileOptimized = true,
      aspectRatio,
      objectFit = "cover",
      onLoad,
      onError,
      className = "",
      ...props
    },
    ref
  ) => {
    const [isIntersecting, setIsIntersecting] = useState(
      !enableLazyLoading || priority
    );
    const [loadingState, setLoadingState] = useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Mobile device detection
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const isSlowConnection =
      (typeof navigator !== "undefined" &&
        "connection" in navigator &&
        (navigator as any).connection?.effectiveType === "slow-2g") ||
      (navigator as any).connection?.effectiveType === "2g";

    // Format optimization
    const { getOptimizedSrc, supportedFormats } = useImageFormatOptimization();
    const optimizedSrc = enableFormatOptimization ? getOptimizedSrc(src) : src;

    // Mobile-optimized responsive image handling
    const mobileBreakpoints = mobileOptimized
      ? [320, 480, 640, 768, 1024] // Smaller set for mobile
      : breakpoints;

    const { srcSet, sizes } = useResponsiveImage(
      optimizedSrc,
      mobileBreakpoints
    );

    // Generate mobile-optimized placeholder
    const getPlaceholderSrc = () => {
      if (lowQualityPlaceholder) return lowQualityPlaceholder;
      if (placeholder) return placeholder;
      return generateMobilePlaceholder(width, height, isMobile);
    };

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!enableLazyLoading || priority) {
        setIsIntersecting(true);
        return;
      }

      const currentImgRef = imgRef.current;
      if (!currentImgRef) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: mobileOptimized ? "100px" : "50px", // Larger margin for mobile
        }
      );

      observerRef.current.observe(currentImgRef);

      return () => {
        observerRef.current?.disconnect();
      };
    }, [enableLazyLoading, priority, mobileOptimized]);

    // Image loading logic
    useEffect(() => {
      if (!isIntersecting || loadingState === "loaded") return;

      const loadImage = async () => {
        setLoadingState("loading");

        try {
          // For mobile optimization, load lower quality first if slow connection
          const targetSrc =
            isSlowConnection && mobileOptimized
              ? getOptimizedSrcForConnection(optimizedSrc, "slow")
              : optimizedSrc;

          const img = new Image();

          // Set up responsive attributes
          if (enableResponsive) {
            img.srcset = srcSet;
            img.sizes = sizes;
          }

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image"));
          });

          img.src = targetSrc;
          setCurrentSrc(targetSrc);
          setLoadingState("loaded");
          onLoad?.();
        } catch (error) {
          setLoadingState("error");
          onError?.(error as Error);
        }
      };

      loadImage();
    }, [
      isIntersecting,
      optimizedSrc,
      srcSet,
      sizes,
      enableResponsive,
      isSlowConnection,
      mobileOptimized,
      onLoad,
      onError,
    ]);

    // Progressive loading effect
    const getImageStyles = () => {
      const baseStyles: React.CSSProperties = {
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        aspectRatio: aspectRatio,
        objectFit: objectFit,
        transition: enableProgressiveLoading ? "all 0.3s ease" : "none",
        ...props.style,
      };

      switch (loadingState) {
        case "loading":
          return {
            ...baseStyles,
            filter: enableProgressiveLoading ? "blur(5px)" : "none",
            transform: enableProgressiveLoading ? "scale(1.02)" : "none",
            opacity: 0.8,
          };
        case "loaded":
          return {
            ...baseStyles,
            filter: "none",
            transform: "scale(1)",
            opacity: 1,
          };
        case "error":
          return {
            ...baseStyles,
            opacity: 0.5,
            filter: "grayscale(100%)",
          };
        default:
          return baseStyles;
      }
    };

    const getImageClasses = () => {
      const classes = [
        "optimized-image",
        className,
        loadingState === "loading" && "image-loading",
        loadingState === "loaded" && "image-loaded",
        loadingState === "error" && "image-error",
        enableProgressiveLoading && "progressive-image",
        enableLazyLoading && "lazy-image",
        enableResponsive && "responsive-image",
        mobileOptimized && "mobile-optimized",
      ]
        .filter(Boolean)
        .join(" ");

      return classes;
    };

    return (
      <img
        {...props}
        ref={(node) => {
          imgRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        src={currentSrc || getPlaceholderSrc()}
        srcSet={
          enableResponsive && loadingState === "loaded" ? srcSet : undefined
        }
        sizes={
          enableResponsive && loadingState === "loaded" ? sizes : undefined
        }
        alt={alt}
        width={width}
        height={height}
        className={getImageClasses()}
        style={getImageStyles()}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

/**
 * Background Image Component with Optimization
 */
export interface OptimizedBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  enableLazyLoading?: boolean;
  enableFormatOptimization?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

export const OptimizedBackground = forwardRef<
  HTMLDivElement,
  OptimizedBackgroundProps
>(
  (
    {
      src,
      enableLazyLoading = true,
      enableFormatOptimization = true,
      onLoad,
      onError,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Format optimization
    const { getOptimizedSrc } = useImageFormatOptimization();
    const optimizedSrc = enableFormatOptimization ? getOptimizedSrc(src) : src;

    // Background image loading
    const { backgroundProps, state } = useBackgroundImageOptimization(
      optimizedSrc,
      {
        enableLazyLoading,
        onLoad,
        onError,
      }
    );

    return (
      <div
        {...props}
        {...backgroundProps}
        ref={ref}
        className={`optimized-background ${className} ${backgroundProps.className}`.trim()}
        style={{
          ...backgroundProps.style,
          ...style,
          position: "relative",
          ...(state.isLoading && {
            backgroundColor: "#f3f4f6",
          }),
        }}
      >
        {state.isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
        )}
        {children}
      </div>
    );
  }
);

OptimizedBackground.displayName = "OptimizedBackground";

/**
 * Image Gallery Component with Optimization
 */
export interface OptimizedImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: string;
  enableLazyLoading?: boolean;
  enableProgressiveLoading?: boolean;
  enableResponsive?: boolean;
  className?: string;
}

export const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = ({
  images,
  columns = 3,
  gap = "1rem",
  enableLazyLoading = true,
  enableProgressiveLoading = true,
  enableResponsive = true,
  className = "",
}) => {
  return (
    <div
      className={`optimized-image-gallery ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          enableLazyLoading={enableLazyLoading}
          enableProgressiveLoading={enableProgressiveLoading}
          enableResponsive={enableResponsive}
          className="gallery-image"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />
      ))}
    </div>
  );
};

/**
 * Hero Image Component with Advanced Optimization
 */
export interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  mobileSrc?: string;
  tabletSrc?: string;
  enableParallax?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({
  src,
  alt,
  mobileSrc,
  tabletSrc,
  enableParallax = false,
  overlayOpacity = 0.3,
  children,
  className = "",
}) => {
  // Determine the appropriate source based on screen size
  const getResponsiveSrc = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 768 && mobileSrc) return mobileSrc;
      if (width < 1024 && tabletSrc) return tabletSrc;
    }
    return src;
  };

  const responsiveSrc = getResponsiveSrc();

  return (
    <div
      className={`optimized-hero-image relative overflow-hidden ${className}`}
    >
      <OptimizedBackground
        src={responsiveSrc}
        enableLazyLoading={false} // Hero images should load immediately
        className={`absolute inset-0 ${enableParallax ? "parallax-bg" : ""}`}
        style={{
          backgroundAttachment: enableParallax ? "fixed" : "scroll",
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Hidden image for SEO and accessibility */}
      <OptimizedImage
        src={responsiveSrc}
        alt={alt}
        className="sr-only"
        enableLazyLoading={false}
      />
    </div>
  );
};

/**
 * Utility function to generate mobile-optimized placeholder
 */
function generateMobilePlaceholder(
  width?: number,
  height?: number,
  isMobile: boolean = false
): string {
  const w = width || (isMobile ? 320 : 300);
  const h = height || (isMobile ? 240 : 200);

  // Generate a simple SVG placeholder optimized for mobile
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)"/>
      ${
        !isMobile
          ? `<text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">Loading...</text>`
          : ""
      }
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Utility function to get optimized source for connection speed
 */
function getOptimizedSrcForConnection(
  src: string,
  connectionType: "slow" | "fast"
): string {
  const url = new URL(src, window.location.origin);

  if (connectionType === "slow") {
    // Lower quality and smaller size for slow connections
    url.searchParams.set("q", "60");
    url.searchParams.set("w", "640");
  } else {
    // Higher quality for fast connections
    url.searchParams.set("q", "85");
  }

  return url.toString();
}

/**
 * Utility function to generate placeholder (legacy support)
 */
function generatePlaceholder(width?: number, height?: number): string {
  return generateMobilePlaceholder(width, height, false);
}

/**
 * Hook for background image optimization (used internally)
 */
function useBackgroundImageOptimization(
  src: string,
  options: {
    enableLazyLoading?: boolean;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }
) {
  const [state, setState] = React.useState({
    isLoading: true,
    isLoaded: false,
    hasError: false,
  });

  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!src) return;

    const loadImage = async () => {
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error("Failed to load background image"));
        });

        img.src = src;

        setState({
          isLoading: false,
          isLoaded: true,
          hasError: false,
        });

        options.onLoad?.();
      } catch (error) {
        setState({
          isLoading: false,
          isLoaded: false,
          hasError: true,
        });

        options.onError?.(error as Error);
      }
    };

    if (options.enableLazyLoading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "50px" }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    } else {
      loadImage();
    }
  }, [src, options.enableLazyLoading]);

  return {
    backgroundProps: {
      ref: elementRef,
      className: `
        ${state.isLoading ? "bg-loading" : ""}
        ${state.isLoaded ? "bg-loaded" : ""}
        ${state.hasError ? "bg-error" : ""}
      `.trim(),
      style: {
        backgroundImage: state.isLoaded ? `url(${src})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
    },
    state,
  };
}
