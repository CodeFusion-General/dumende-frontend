import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useImageCarousel, useCarouselBreakpoint } from "@/hooks/useImageCarousel";
import { Heart, Share2, Play, Pause, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DesktopLayout from "@/components/boats/carousel/DesktopLayout";
import MobileLayout from "@/components/boats/carousel/MobileLayout";
import FullscreenLightbox from "@/components/boats/carousel/FullscreenLightbox";

export interface BoatImage {
  id: string;
  imageUrl: string;
  altText: string;
  caption?: string;
  order: number;
  thumbnailUrl?: string;
  isHeroImage?: boolean;
}

export interface BoatImageCarouselProps {
  images: BoatImage[];
  currentIndex?: number;
  onImageChange?: (index: number) => void;
  autoplay?: boolean;
  maxHeight?: number;
  className?: string;
  showActionButtons?: boolean;
  onSave?: () => void;
  onShare?: () => void;
}

const BoatImageCarousel: React.FC<BoatImageCarouselProps> = ({
  images,
  currentIndex = 0,
  onImageChange,
  autoplay = false,
  maxHeight = 520,
  className,
  showActionButtons = true,
  onSave,
  onShare,
}) => {
  const { isMobile, isDesktop, showThumbnails } = useCarouselBreakpoint();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the custom carousel hook
  const {
    currentIndex: activeIndex,
    isAutoplayEnabled,
    loadedImages,
    goToNext,
    goToPrevious,
    goToIndex,
    toggleAutoplay,
    setCurrentIndex,
  } = useImageCarousel({
    images,
    initialIndex: currentIndex,
    autoplay,
    onImageChange,
  });

  // Height constraints for laptop-friendly design
  const containerStyle = {
    maxHeight: `min(${maxHeight}px, 60vh)`,
    height: 'clamp(320px, 60vh, 520px)',
  };

  // Laptop optimization for small screens
  useEffect(() => {
    const updateHeightConstraints = () => {
      if (window.innerWidth >= 1024 && window.innerHeight <= 800) {
        if (containerRef.current) {
          containerRef.current.style.maxHeight = '450px';
        }
      }
    };

    updateHeightConstraints();
    window.addEventListener('resize', updateHeightConstraints);
    return () => window.removeEventListener('resize', updateHeightConstraints);
  }, []);

  // Note: Removed external currentIndex sync to prevent state conflicts
  // The initialIndex prop is used only once during hook initialization

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreenOpen(prev => !prev);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center",
          className
        )}
        style={containerStyle}
      >
        <div className="text-center text-gray-500">
          <p className="text-xl font-medium">No images available</p>
          <p className="text-sm mt-2">Images will be added soon</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "carousel-container relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100/50 backdrop-blur-sm group",
          className
        )}
        style={containerStyle}
        role="region"
        aria-label="Boat image carousel"
        aria-live="polite"
      >
        {/* Desktop Layout (≥1024px) */}
        {isDesktop ? (
          <DesktopLayout
            mainImage={images[Math.min(activeIndex, images.length - 1)]}
            thumbnails={images}
            currentIndex={activeIndex}
            onThumbnailClick={(index) => goToIndex(index)}
            onMainImageClick={handleFullscreenToggle}
            onPrevious={goToPrevious}
            onNext={goToNext}
            hasNavigation={images.length > 1}
            loadedImages={loadedImages}
          />
        ) : (
          /* Mobile/Tablet Layout (<1024px) */
          <MobileLayout
            images={images}
            currentIndex={activeIndex}
            onSlideChange={(index) => goToIndex(index)}
            onImageClick={handleFullscreenToggle}
            onPrevious={goToPrevious}
            onNext={goToNext}
            loadedImages={loadedImages}
            showNavigation={images.length > 1}
          />
        )}

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="action-buttons absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-100">
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                className="action-button bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50"
                onClick={onSave}
                aria-label="Save image"
              >
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                className="action-button bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50"
                onClick={onShare}
                aria-label="Share image"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {images.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="action-button bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50"
                onClick={toggleAutoplay}
                aria-label={isAutoplayEnabled ? "Pause autoplay" : "Start autoplay"}
              >
                {isAutoplayEnabled ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="action-button bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50"
              onClick={handleFullscreenToggle}
              aria-label="Open fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="image-counter absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      <FullscreenLightbox
        isOpen={isFullscreenOpen}
        images={images}
        currentIndex={activeIndex}
        onClose={() => setIsFullscreenOpen(false)}
        onImageChange={goToIndex}
        loadedImages={loadedImages}
      />
    </>
  );
};

export default BoatImageCarousel;