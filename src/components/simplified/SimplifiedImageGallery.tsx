// Simplified Image Gallery Component for Low-End Devices
// Optimized for memory and performance with reduced features

import React, { memo, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useSimplifiedUI,
  usePerformanceAwareFeatures,
} from "../../hooks/useLowEndOptimization";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

interface SimplifiedImageGalleryProps {
  images: GalleryImage[];
  maxImages?: number;
  showThumbnails?: boolean;
  autoplay?: boolean;
  className?: string;
}

// Optimized image component with lazy loading
const OptimizedImage = memo(
  ({
    src,
    alt,
    width,
    height,
    className = "",
    priority = false,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
  }) => {
    const { imageConfig } = usePerformanceAwareFeatures();
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const optimizedSrc = useMemo(() => {
      // Simple URL optimization for low-end devices
      if (imageConfig.lazy && !priority) {
        const url = new URL(src, window.location.origin);
        url.searchParams.set("q", imageConfig.quality.toString());
        url.searchParams.set(
          "w",
          Math.min(width || 800, imageConfig.maxWidth).toString()
        );
        url.searchParams.set(
          "h",
          Math.min(height || 600, imageConfig.maxHeight).toString()
        );
        return url.toString();
      }
      return src;
    }, [src, width, height, imageConfig, priority]);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
    }, []);

    if (hasError) {
      return (
        <div
          className={`bg-gray-200 flex items-center justify-center ${className}`}
        >
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          width={width}
          height={height}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

// Simple thumbnail component
const SimpleThumbnail = memo(
  ({
    image,
    isActive,
    onClick,
  }: {
    image: GalleryImage;
    isActive: boolean;
    onClick: () => void;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`relative w-12 h-12 rounded border-2 transition-colors ${
          isActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <OptimizedImage
          src={image.thumbnail || image.src}
          alt={image.alt}
          width={48}
          height={48}
          className="rounded"
        />
      </button>
    );
  }
);

SimpleThumbnail.displayName = "SimpleThumbnail";

export const SimplifiedImageGallery: React.FC<SimplifiedImageGalleryProps> = ({
  images,
  maxImages = 5,
  showThumbnails = false,
  autoplay = false,
  className = "",
}) => {
  const { shouldSimplify, config, getProps } = useSimplifiedUI("ImageGallery");
  const { featureFlags } = usePerformanceAwareFeatures();

  // Get optimized props
  const optimizedProps = getProps({
    images,
    maxImages,
    showThumbnails,
    autoplay,
    className,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Limit images for performance
  const displayImages = useMemo(() => {
    const limit = shouldSimplify
      ? Math.min(3, optimizedProps.maxImages)
      : optimizedProps.maxImages;
    return optimizedProps.images.slice(0, limit);
  }, [optimizedProps.images, optimizedProps.maxImages, shouldSimplify]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  }, [displayImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  }, [displayImages.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Disable autoplay for low-end devices
  const shouldAutoplay =
    optimizedProps.autoplay &&
    featureFlags.enableAdvancedFeatures &&
    !config.disableBackgroundProcessing;

  // Simple autoplay effect (disabled for low-end devices)
  React.useEffect(() => {
    if (!shouldAutoplay || displayImages.length <= 1) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [shouldAutoplay, displayImages.length, goToNext]);

  if (displayImages.length === 0) {
    return null;
  }

  const currentImage = displayImages[currentIndex];

  return (
    <div
      className={`relative ${optimizedProps.className}`}
      data-component="ImageGallery"
    >
      {/* Main image display */}
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          width={currentImage.width}
          height={currentImage.height}
          className="w-full h-full"
          priority={currentIndex === 0}
        />

        {/* Navigation arrows - only show if more than one image */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails - simplified for low-end devices */}
      {optimizedProps.showThumbnails &&
        displayImages.length > 1 &&
        !config.disableNonEssentialFeatures && (
          <div className="flex gap-2 mt-3 justify-center">
            {displayImages.map((image, index) => (
              <SimpleThumbnail
                key={image.id}
                image={image}
                isActive={index === currentIndex}
                onClick={() => goToIndex(index)}
              />
            ))}
          </div>
        )}

      {/* Dot indicators as fallback for thumbnails */}
      {!optimizedProps.showThumbnails && displayImages.length > 1 && (
        <div className="flex gap-1 mt-3 justify-center">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(SimplifiedImageGallery);
