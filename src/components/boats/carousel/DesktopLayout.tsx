import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { BoatImage } from "@/components/boats/BoatImageCarousel";

interface DesktopLayoutProps {
  mainImage: BoatImage;
  thumbnails: BoatImage[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  onMainImageClick: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasNavigation: boolean;
  loadedImages: Set<number>;
  className?: string;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  mainImage,
  thumbnails,
  currentIndex,
  onThumbnailClick,
  onMainImageClick,
  onPrevious,
  onNext,
  hasNavigation,
  loadedImages,
  className,
}) => {
  if (!mainImage) {

    return (
      <div className={cn("desktop-layout lg:flex lg:gap-4 h-full p-4", className)}>
        <div className="main-image-container lg:flex-[0_0_70%] relative overflow-hidden rounded-2xl bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("desktop-layout lg:flex lg:gap-4 h-full p-4", className)}>
      {/* Main Image Container - 70% width */}
      <div className="main-image-container lg:flex-[0_0_70%] relative overflow-hidden rounded-2xl group">
        {/* Loading state */}
        {!loadedImages.has(currentIndex) && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="loading-spinner" />
          </div>
        )}
        
        <img
          key={`main-image-${currentIndex}-${mainImage.imageUrl}`}
          src={mainImage.imageUrl}
          alt={mainImage.altText || `Image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={onMainImageClick}
          loading={currentIndex < 3 ? "eager" : "lazy"}
          decoding="async"
          sizes="(min-width: 1024px) 70vw, 100vw"
        />
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Navigation arrows for main image */}
        {hasNavigation && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="nav-button absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={onPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="nav-button absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={onNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Fullscreen button */}
        <Button
          variant="outline"
          size="icon"
          className="nav-button absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
          onClick={onMainImageClick}
          aria-label="Open fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        
        {/* Caption overlay */}
        {mainImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-sm font-medium">{mainImage.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnail Grid - 30% width */}
      {thumbnails.length > 1 && (
        <div className="thumbnail-grid lg:flex-[0_0_30%] grid grid-cols-2 gap-2 h-full">
          {thumbnails.slice(0, 4).map((image, sliceIndex) => {
            const actualIndex = sliceIndex; // This maintains the original index from the full array
            return (
              <ThumbnailItem
                key={image.id || actualIndex}
                image={image}
                index={actualIndex}
                isActive={currentIndex === actualIndex}
                isLoaded={loadedImages.has(actualIndex)}
                onClick={() => onThumbnailClick(actualIndex)}
              />
            );
          })}
          
          {/* Show remaining count if more than 4 images */}
          {thumbnails.length > 4 && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 font-semibold text-lg">+{thumbnails.length - 4}</p>
                <p className="text-gray-500 text-xs">more</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Thumbnail Item Component
interface ThumbnailItemProps {
  image: BoatImage;
  index: number;
  isActive: boolean;
  isLoaded: boolean;
  onClick: () => void;
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  image,
  index,
  isActive,
  isLoaded,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "thumbnail-item relative overflow-hidden rounded-xl cursor-pointer border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isActive
          ? "thumbnail-active border-primary ring-2 ring-primary/20 shadow-lg"
          : "border-transparent"
      )}
      aria-label={`View image ${index + 1}`}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {/* Loading state for thumbnail */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <img
        src={image.thumbnailUrl || image.imageUrl}
        alt={image.altText || `Thumbnail ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        decoding="async"
        sizes="(min-width: 1024px) 15vw, 25vw"
      />
      
      {/* Active state overlay */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary/50 rounded-xl" />
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
      
      {/* Image order indicator */}
      <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {index + 1}
      </div>
    </button>
  );
};

export default DesktopLayout;