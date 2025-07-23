/**
 * Optimized Image Component with Progressive Loading and Lazy Loading
 */

import React, { forwardRef, ImgHTMLAttributes } from "react";
import {
  useImageOptimization,
  useResponsiveImage,
  useImageFormatOptimization,
} from "../../hooks/useImageOptimization";

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
  breakpoints?: number[];
  quality?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Optimized Image Component
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
      enableResponsive = false,
      enableFormatOptimization = true,
      placeholder,
      breakpoints = [320, 640, 768, 1024, 1280, 1536],
      quality = 85,
      onLoad,
      onError,
      className = "",
      ...props
    },
    ref
  ) => {
    // Format optimization
    const { getOptimizedSrc } = useImageFormatOptimization();
    const optimizedSrc = enableFormatOptimization ? getOptimizedSrc(src) : src;

    // Responsive image handling
    const { srcSet, sizes } = useResponsiveImage(optimizedSrc, breakpoints);

    // Progressive and lazy loading
    const { imageProps, state } = useImageOptimization(optimizedSrc, {
      enableLazyLoading,
      enableProgressiveLoading,
      enableResponsive,
      placeholder,
      onLoad,
      onError,
    });

    // Generate placeholder if not provided
    const placeholderSrc = placeholder || generatePlaceholder(width, height);

    return (
      <img
        {...props}
        {...imageProps}
        ref={ref}
        alt={alt}
        width={width}
        height={height}
        srcSet={enableResponsive ? srcSet : undefined}
        sizes={enableResponsive ? sizes : undefined}
        className={`optimized-image ${className} ${imageProps.className}`.trim()}
        loading={enableLazyLoading ? "lazy" : "eager"}
        decoding="async"
        style={{
          ...props.style,
          transition: "all 0.3s ease",
          ...(state.isLoading && {
            filter: "blur(5px)",
            transform: "scale(1.02)",
          }),
          ...(state.isLoaded && {
            filter: "none",
            transform: "scale(1)",
          }),
          ...(state.hasError && {
            opacity: 0.5,
            filter: "grayscale(100%)",
          }),
        }}
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
 * Utility function to generate placeholder
 */
function generatePlaceholder(width?: number, height?: number): string {
  const w = width || 300;
  const h = height || 200;

  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        Loading...
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
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
