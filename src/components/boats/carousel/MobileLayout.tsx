import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { BoatImage } from "@/components/boats/BoatImageCarousel";
import { useCarouselGestures } from "@/hooks/useImageCarousel";

interface MobileLayoutProps {
  images: BoatImage[];
  currentIndex: number;
  onSlideChange: (index: number) => void;
  onImageClick: () => void;
  onPrevious: () => void;
  onNext: () => void;
  loadedImages: Set<number>;
  className?: string;
  showNavigation?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  images,
  currentIndex,
  onSlideChange,
  onImageClick,
  onPrevious,
  onNext,
  loadedImages,
  className,
  showNavigation = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Touch gesture handling
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useCarouselGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    threshold: 50,
    velocity: 0.3,
    enabled: images.length > 1,
  });

  if (images.length === 0) {
    return (
      <div className={cn("mobile-swiper lg:hidden w-full h-full relative flex items-center justify-center bg-gray-100", className)}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mobile-swiper lg:hidden w-full h-full relative", className)}>
      {/* Simple mobile image display */}
      <div 
        className="relative h-full overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={`mobile-main-${images[currentIndex]?.id}-${currentIndex}`}
          src={images[currentIndex]?.imageUrl}
          alt={images[currentIndex]?.altText || `Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
          onClick={onImageClick}
          loading={currentIndex < 2 ? "eager" : "lazy"}
          decoding="async"
          sizes="100vw"
        />
        
        {/* Mobile navigation arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border-white/50 h-10 w-10 touch-manipulation z-10"
              onClick={onPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border-white/50 h-10 w-10 touch-manipulation z-10"
              onClick={onNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Pagination dots */}
        {images.length > 1 && (
          <div className="pagination-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onSlideChange(index)}
                className={cn(
                  "pagination-dot w-2 h-2 rounded-full transition-all duration-300 touch-manipulation",
                  currentIndex === index
                    ? "pagination-dot-active bg-white shadow-lg w-6"
                    : "pagination-dot-inactive bg-white/60 hover:bg-white/80"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Fullscreen button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border-white/50 h-10 w-10 touch-manipulation z-10"
          onClick={onImageClick}
          aria-label="Open fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileLayout;