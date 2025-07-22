import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  transitionDuration?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  showThumbnails = true,
  autoPlay = false,
  transitionDuration = 700,
}) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState<number[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Filter valid images (remove empty strings and undefined)
  const validImages = images.filter((img) => img && img.trim() !== "");

  // If no valid images, show fallback
  if (!validImages || validImages.length === 0) {
    return (
      <div
        className={cn(
          "aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg border border-gray-200/50",
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-gray-500 font-medium">Fotoğraf bulunamadı</p>
        </div>
      </div>
    );
  }

  // Keep current image index within valid range
  const safeCurrentImage = Math.min(currentImage, validImages.length - 1);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % validImages.length);
  };

  const previousImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + validImages.length) % validImages.length
    );
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => [...prev, index]);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setIsImageLoading(true);
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && validImages.length > 1) {
      nextImage();
    }
    if (isRightSwipe && validImages.length > 1) {
      previousImage();
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden group transition-all duration-500 hover:shadow-2xl",
        className
      )}
    >
      {/* Main Image Container with Professional Styling */}
      <div className="relative overflow-hidden">
        <div
          className="aspect-video sm:aspect-[4/3] md:aspect-video relative overflow-hidden bg-gray-100"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={validImages[safeCurrentImage]}
            alt={`Gallery image ${safeCurrentImage + 1}`}
            className={cn(
              "w-full h-full object-cover transition-all ease-out cursor-pointer",
              "hover:scale-110 group-hover:scale-105",
              "select-none" // Prevent text selection during swipe
            )}
            style={{ transitionDuration: `${transitionDuration}ms` }}
            onError={() => handleImageError(safeCurrentImage)}
            onLoad={handleImageLoad}
            onLoadStart={handleImageLoadStart}
            loading="eager"
            draggable={false} // Prevent image dragging
          />

          {/* Loading Overlay */}
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Floating Navigation Buttons with Glass-morphism */}
          {validImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 transition-all duration-300",
                  "w-10 h-10 sm:w-12 sm:h-12 touch-manipulation",
                  "bg-white/90 hover:bg-white shadow-xl backdrop-blur-md border-white/50",
                  "hover:scale-110 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                  "focus:opacity-100 focus:scale-110",
                  "md:opacity-0 md:group-hover:opacity-100"
                )}
                onClick={previousImage}
                aria-label="Previous image"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 transition-all duration-300",
                  "w-10 h-10 sm:w-12 sm:h-12 touch-manipulation",
                  "bg-white/90 hover:bg-white shadow-xl backdrop-blur-md border-white/50",
                  "hover:scale-110 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                  "focus:opacity-100 focus:scale-110",
                  "md:opacity-0 md:group-hover:opacity-100"
                )}
                onClick={nextImage}
                aria-label="Next image"
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}

          {/* Professional Image Counter Overlay */}
          {validImages.length > 1 && (
            <div
              className={cn(
                "absolute bottom-4 right-4 transition-all duration-300",
                "bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium",
                "backdrop-blur-sm flex items-center gap-2",
                "opacity-0 group-hover:opacity-100"
              )}
            >
              <Camera className="h-4 w-4" />
              <span>
                {safeCurrentImage + 1} / {validImages.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Thumbnail Strip with Active State Indicators */}
      {showThumbnails && validImages.length > 1 && (
        <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {validImages.slice(0, 8).map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300",
                  "border-2 hover:scale-105 focus:scale-105 shadow-md hover:shadow-lg touch-manipulation",
                  "min-w-[48px] min-h-[48px]", // Ensure minimum touch target size
                  currentImage === index
                    ? "border-primary ring-2 sm:ring-4 ring-primary/20 shadow-lg scale-105"
                    : "border-transparent hover:border-primary/50 focus:border-primary/50"
                )}
                aria-label={`Go to image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    currentImage === index
                      ? "opacity-100"
                      : "opacity-70 hover:opacity-100"
                  )}
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}

            {/* Show remaining count if more than 8 images */}
            {validImages.length > 8 && (
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-gray-200 shadow-md min-w-[48px] min-h-[48px]">
                +{validImages.length - 8}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
