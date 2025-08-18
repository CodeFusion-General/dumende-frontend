/**
 * Mobile-Optimized Image Component with Advanced Format Detection
 * Implements Requirements 2.4, 5.3 for WebP/AVIF format optimization and mobile compression
 */

import React, {
  forwardRef,
  ImgHTMLAttributes,
  useState,
  useEffect,
} from "react";
import { imageFormatOptimizationService } from "../../services/imageFormatOptimization";
import { useLazyLoading } from "../../hooks/useLazyLoading";

export interface MobileOptimizedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  compressionLevel?: "low" | "medium" | "high";
  enableLazyLoading?: boolean;
  enableFallback?: boolean;
  mobileOptimized?: boolean;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Mobile-Optimized Image Component with automatic format detection and optimization
 */
export const MobileOptimizedImage = forwardRef<
  HTMLImageElement,
  MobileOptimizedImageProps
>(
  (
    {
      src,
      alt,
      width,
      height,
      quality = 85,
      format = "auto",
      compressionLevel = "medium",
      enableLazyLoading = true,
      enableFallback = true,
      mobileOptimized = true,
      priority = false,
      aspectRatio,
      objectFit = "cover",
      placeholder,
      onLoad,
      onError,
      className = "",
      ...props
    },
    ref
  ) => {
    const [optimizedImage, setOptimizedImage] = useState<{
      src: string;
      fallbackSrc?: string;
      format: string;
      estimatedSize: number;
    } | null>(null);

    const [loadingState, setLoadingState] = useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);

    // Lazy loading setup
    const { elementRef, state } = useLazyLoading({
      enableProgressiveLoading: true,
      mobileOptimized,
      onIntersect: () => {
        if (!priority) {
          loadOptimizedImage();
        }
      },
    });

    // Initialize optimized image on mount or when priority is true
    useEffect(() => {
      if (priority || !enableLazyLoading) {
        loadOptimizedImage();
      }
    }, [src, priority, enableLazyLoading]);

    // Load optimized image when intersecting (for lazy loading)
    useEffect(() => {
      if (
        state.isIntersecting &&
        !optimizedImage &&
        enableLazyLoading &&
        !priority
      ) {
        loadOptimizedImage();
      }
    }, [state.isIntersecting, optimizedImage, enableLazyLoading, priority]);

    const loadOptimizedImage = async () => {
      if (loadingState === "loading" || loadingState === "loaded") return;

      setLoadingState("loading");

      try {
        // Wait for service initialization
        while (!imageFormatOptimizationService.isInitialized()) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        // Get optimized image configuration
        const optimized = imageFormatOptimizationService.optimizeImageSrc(src, {
          quality,
          width,
          height,
          format,
          mobileOptimized,
          compressionLevel,
          enableFallback,
        });

        setOptimizedImage(optimized);

        // Preload the optimized image
        const img = new Image();

        // Set up error handling with fallback
        const loadWithFallback = async (
          imageSrc: string,
          isFallback = false
        ) => {
          return new Promise<void>((resolve, reject) => {
            img.onload = () => {
              setCurrentSrc(imageSrc);
              setLoadingState("loaded");
              onLoad?.();
              resolve();
            };

            img.onerror = () => {
              if (!isFallback && optimized.fallbackSrc) {
                // Try fallback
                loadWithFallback(optimized.fallbackSrc, true)
                  .then(resolve)
                  .catch(reject);
              } else {
                reject(new Error("Failed to load image"));
              }
            };

            img.src = imageSrc;
          });
        };

        await loadWithFallback(optimized.src);
      } catch (error) {
        setLoadingState("error");
        onError?.(error as Error);

        // Fallback to original source
        setCurrentSrc(src);
      }
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

      switch (loadingState) {
        case "loading":
          return {
            ...baseStyles,
            filter: "blur(2px)",
            opacity: 0.8,
          };
        case "loaded":
          return {
            ...baseStyles,
            filter: "none",
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
        "mobile-optimized-image",
        className,
        loadingState === "loading" && "image-loading",
        loadingState === "loaded" && "image-loaded",
        loadingState === "error" && "image-error",
        mobileOptimized && "mobile-optimized",
        optimizedImage?.format && `format-${optimizedImage.format}`,
      ]
        .filter(Boolean)
        .join(" ");

      return classes;
    };

    const getPlaceholderSrc = () => {
      if (placeholder) return placeholder;
      return generateOptimizedPlaceholder(width, height, mobileOptimized);
    };

    return (
      <>
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

        {/* Performance info for development */}
        {process.env.NODE_ENV === "development" && optimizedImage && (
          <div className="sr-only" data-testid="image-optimization-info">
            Format: {optimizedImage.format}, Estimated Size:{" "}
            {Math.round(optimizedImage.estimatedSize / 1024)}KB
          </div>
        )}
      </>
    );
  }
);

MobileOptimizedImage.displayName = "MobileOptimizedImage";

/**
 * Picture Element with Multiple Format Support
 */
export interface ResponsivePictureProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  breakpoints?: number[];
  quality?: number;
  mobileOptimized?: boolean;
  enableFallback?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  src,
  alt,
  width,
  height,
  breakpoints = [320, 480, 640, 768, 1024, 1280],
  quality = 85,
  mobileOptimized = true,
  enableFallback = true,
  className = "",
  onLoad,
  onError,
}) => {
  const [sources, setSources] = useState<
    Array<{
      format: string;
      srcSet: string;
      sizes: string;
    }>
  >([]);

  useEffect(() => {
    const generateSources = async () => {
      // Wait for service initialization
      while (!imageFormatOptimizationService.isInitialized()) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const formatSupport = imageFormatOptimizationService.getFormatSupport();
      const generatedSources = [];

      // Generate sources for supported formats in priority order
      if (formatSupport.avif) {
        generatedSources.push({
          format: "avif",
          srcSet: imageFormatOptimizationService.generateResponsiveSrcSet(
            src,
            breakpoints,
            {
              format: "avif",
              quality,
              mobileOptimized,
            }
          ),
          sizes: imageFormatOptimizationService.generateSizes(breakpoints),
        });
      }

      if (formatSupport.webp) {
        generatedSources.push({
          format: "webp",
          srcSet: imageFormatOptimizationService.generateResponsiveSrcSet(
            src,
            breakpoints,
            {
              format: "webp",
              quality,
              mobileOptimized,
            }
          ),
          sizes: imageFormatOptimizationService.generateSizes(breakpoints),
        });
      }

      setSources(generatedSources);
    };

    generateSources();
  }, [src, breakpoints, quality, mobileOptimized]);

  // Generate fallback srcSet
  const fallbackSrcSet =
    imageFormatOptimizationService.generateResponsiveSrcSet(src, breakpoints, {
      format: "jpeg",
      quality,
      mobileOptimized,
    });

  const fallbackSizes =
    imageFormatOptimizationService.generateSizes(breakpoints);

  return (
    <picture className={`responsive-picture ${className}`}>
      {sources.map((source) => (
        <source
          key={source.format}
          type={`image/${source.format}`}
          srcSet={source.srcSet}
          sizes={source.sizes}
        />
      ))}
      <MobileOptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        format="jpeg" // Fallback format
        mobileOptimized={mobileOptimized}
        enableFallback={enableFallback}
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
};

// Helper functions

/**
 * Generate optimized placeholder with format awareness
 */
function generateOptimizedPlaceholder(
  width?: number,
  height?: number,
  mobileOptimized: boolean = true
): string {
  const w = width || (mobileOptimized ? 320 : 300);
  const h = height || (mobileOptimized ? 240 : 200);

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="optimizedShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e2e8f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#optimizedShimmer)"/>
      ${
        !mobileOptimized
          ? `<text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="11" fill="#64748b" text-anchor="middle" dy=".3em">Optimizing...</text>`
          : ""
      }
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
