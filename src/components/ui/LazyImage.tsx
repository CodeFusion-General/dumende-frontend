/**
 * Advanced Lazy Loading Image Component
 * Implements Requirements 2.2, 2.3 for progressive image loading with blur-to-sharp transition
 */

import React, { forwardRef, ImgHTMLAttributes } from "react";
import {
  useLazyLoading,
  useProgressiveImageLoading,
} from "../../hooks/useLazyLoading";
import { useImageFormatOptimization } from "../../hooks/useImageOptimization";

export interface LazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  enableProgressiveLoading?: boolean;
  enableBlurTransition?: boolean;
  mobileOptimized?: boolean;
  placeholder?: string;
  lowQualityPlaceholder?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * LazyImage Component with Progressive Loading and Blur-to-Sharp Transition
 */
export const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      priority = false,
      enableProgressiveLoading = true,
      enableBlurTransition = true,
      mobileOptimized = true,
      placeholder,
      lowQualityPlaceholder,
      aspectRatio,
      objectFit = "cover",
      onLoad,
      onError,
      className = "",
      ...props
    },
    ref
  ) => {
    // Format optimization
    const { getOptimizedSrc } = useImageFormatOptimization();
    const optimizedSrc = getOptimizedSrc(src);

    // Progressive loading with blur transition
    const { elementRef, currentSrc, blurLevel, isTransitioning, state } =
      useProgressiveImageLoading(optimizedSrc, {
        enableProgressiveLoading,
        mobileOptimized,
        blurTransition: enableBlurTransition,
        onLoad,
        onError,
      });

    // Generate placeholder
    const getPlaceholderSrc = () => {
      if (lowQualityPlaceholder) return lowQualityPlaceholder;
      if (placeholder) return placeholder;
      return generateProgressivePlaceholder(width, height);
    };

    const getImageStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        aspectRatio: aspectRatio,
        objectFit: objectFit,
        transition: "all 0.3s ease",
        ...props.style,
      };

      if (enableBlurTransition && (state.isLoading || isTransitioning)) {
        return {
          ...baseStyles,
          filter: `blur(${blurLevel}px)`,
          transform: "scale(1.02)",
        };
      }

      if (state.isLoaded) {
        return {
          ...baseStyles,
          filter: "none",
          transform: "scale(1)",
        };
      }

      if (state.hasError) {
        return {
          ...baseStyles,
          opacity: 0.5,
          filter: "grayscale(100%)",
        };
      }

      return baseStyles;
    };

    const getImageClasses = () => {
      const classes = [
        "lazy-image",
        className,
        state.isLoading && "lazy-loading",
        state.isLoaded && "lazy-loaded",
        state.hasError && "lazy-error",
        isTransitioning && "lazy-transitioning",
        enableProgressiveLoading && "progressive-loading",
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
          elementRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        src={currentSrc || getPlaceholderSrc()}
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

LazyImage.displayName = "LazyImage";

/**
 * LazyBackgroundImage Component for background images with lazy loading
 */
export interface LazyBackgroundImageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  enableProgressiveLoading?: boolean;
  mobileOptimized?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

export const LazyBackgroundImage = forwardRef<
  HTMLDivElement,
  LazyBackgroundImageProps
>(
  (
    {
      src,
      enableProgressiveLoading = true,
      mobileOptimized = true,
      priority = false,
      onLoad,
      onError,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const { elementRef, state } = useLazyLoading({
      enableProgressiveLoading,
      mobileOptimized,
      onLoad,
      onError,
    });

    const { getOptimizedSrc } = useImageFormatOptimization();
    const optimizedSrc = getOptimizedSrc(src);

    React.useEffect(() => {
      if (state.isIntersecting && !state.isLoaded) {
        const loadBackgroundImage = async () => {
          try {
            const img = new Image();
            img.src = optimizedSrc;
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () =>
                reject(new Error("Failed to load background image"));
            });
            onLoad?.();
          } catch (error) {
            onError?.(error as Error);
          }
        };

        loadBackgroundImage();
      }
    }, [state.isIntersecting, optimizedSrc, onLoad, onError]);

    const getBackgroundStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "all 0.5s ease",
        ...style,
      };

      if (state.isLoaded) {
        return {
          ...baseStyles,
          backgroundImage: `url(${optimizedSrc})`,
        };
      }

      if (state.isLoading) {
        return {
          ...baseStyles,
          backgroundColor: "#f3f4f6",
        };
      }

      return baseStyles;
    };

    const getBackgroundClasses = () => {
      const classes = [
        "lazy-background",
        className,
        state.isLoading && "lazy-bg-loading",
        state.isLoaded && "lazy-bg-loaded",
        state.hasError && "lazy-bg-error",
        mobileOptimized && "mobile-optimized",
      ]
        .filter(Boolean)
        .join(" ");

      return classes;
    };

    return (
      <div
        {...props}
        ref={(node) => {
          elementRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={getBackgroundClasses()}
        style={getBackgroundStyles()}
      >
        {state.isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}
        {children}
      </div>
    );
  }
);

LazyBackgroundImage.displayName = "LazyBackgroundImage";

/**
 * LazyImageGallery Component with batch loading optimization
 */
export interface LazyImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: string;
  enableProgressiveLoading?: boolean;
  mobileOptimized?: boolean;
  batchSize?: number;
  className?: string;
}

export const LazyImageGallery: React.FC<LazyImageGalleryProps> = ({
  images,
  columns = 3,
  gap = "1rem",
  enableProgressiveLoading = true,
  mobileOptimized = true,
  batchSize = 3,
  className = "",
}) => {
  const [loadedCount, setLoadedCount] = React.useState(0);

  const handleImageLoad = React.useCallback(() => {
    setLoadedCount((prev) => prev + 1);
  }, []);

  // Responsive columns for mobile
  const responsiveColumns = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 768) return 2;
      return columns;
    }
    return columns;
  }, [columns]);

  return (
    <div
      className={`lazy-image-gallery ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        gap,
      }}
    >
      {images.map((image, index) => (
        <LazyImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          enableProgressiveLoading={enableProgressiveLoading}
          mobileOptimized={mobileOptimized}
          priority={index < batchSize} // First batch has priority
          onLoad={handleImageLoad}
          className="gallery-image"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
          }}
        />
      ))}

      {/* Loading progress indicator */}
      {loadedCount < images.length && (
        <div className="col-span-full text-center py-4">
          <div className="text-sm text-gray-500">
            Loaded {loadedCount} of {images.length} images
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(loadedCount / images.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions

/**
 * Generate progressive placeholder with blur effect
 */
function generateProgressivePlaceholder(
  width?: number,
  height?: number
): string {
  const w = width || 300;
  const h = height || 200;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
        </filter>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)" filter="url(#blur)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
