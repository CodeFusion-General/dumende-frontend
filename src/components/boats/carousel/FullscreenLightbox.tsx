import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { BoatImage } from "@/components/boats/BoatImageCarousel";
import { useCarouselGestures } from "@/hooks/useImageCarousel";

interface FullscreenLightboxProps {
  isOpen: boolean;
  images: BoatImage[];
  currentIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  loadedImages?: Set<number>;
  className?: string;
}

const FullscreenLightbox: React.FC<FullscreenLightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onImageChange,
  loadedImages = new Set(),
  className,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // Focus management
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (images.length > 1) {
      const nextIndex = (currentIndex + 1) % images.length;
      onImageChange(nextIndex);
    }
  }, [currentIndex, images.length, onImageChange]);

  const goToPrevious = useCallback(() => {
    if (images.length > 1) {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      onImageChange(prevIndex);
    }
  }, [currentIndex, images.length, onImageChange]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      onImageChange(index);
    }
  }, [images.length, onImageChange]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Touch/swipe gestures
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useCarouselGestures({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 50,
    velocity: 0.3,
    enabled: zoom === 1, // Only enable swipe when not zoomed
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          goToIndex(images.length - 1);
          break;
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleZoomReset();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, goToIndex, onClose, images.length]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // Image dragging for zoomed images
  const handleMouseDown = (event: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Close on overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  // Download image
  const handleDownload = async () => {
    try {
      const currentImage = images[currentIndex];
      const response = await fetch(currentImage.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boat-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  // Share image
  const handleShare = async () => {
    const currentImage = images[currentIndex];
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.altText || 'Boat Image',
          text: currentImage.caption || 'Check out this boat image',
          url: currentImage.imageUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentImage.imageUrl);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  const lightboxContent = (
    <div
      ref={overlayRef}
      className={cn("fullscreen-overlay fixed inset-0 z-50 bg-black/95 flex items-center justify-center", className)}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <div className="fullscreen-content relative w-full h-full flex items-center justify-center p-4">
        {/* Loading state */}
        {!loadedImages.has(currentIndex) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-spinner bg-white" />
          </div>
        )}

        {/* Main image */}
        <img
          ref={imageRef}
          src={currentImage.imageUrl}
          alt={currentImage.altText || `Image ${currentIndex + 1}`}
          className="fullscreen-image max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          draggable={false}
        />

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            {/* Image counter */}
            <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <Button
              variant="outline"
              size="icon"
              className="nav-button-fullscreen"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="nav-button-fullscreen px-3"
              onClick={handleZoomReset}
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="nav-button-fullscreen"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Action buttons */}
            <Button
              variant="outline"
              size="icon"
              className="nav-button-fullscreen"
              onClick={handleDownload}
              aria-label="Download image"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="nav-button-fullscreen"
              onClick={handleShare}
              aria-label="Share image"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Close button */}
            <Button
              ref={closeButtonRef}
              variant="outline"
              size="icon"
              className="nav-button-fullscreen"
              onClick={onClose}
              aria-label="Close lightbox"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="nav-button-fullscreen absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="nav-button-fullscreen absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Bottom thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => goToIndex(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300",
                  currentIndex === index
                    ? "border-white shadow-lg"
                    : "border-white/30 hover:border-white/60"
                )}
                aria-label={`Go to image ${index + 1}`}
              >
                <img
                  src={image.thumbnailUrl || image.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image caption */}
        {currentImage.caption && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm max-w-md text-center">
            <p className="text-sm font-medium">{currentImage.caption}</p>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        <div className="absolute bottom-4 left-4 text-white/70 text-xs">
          <p>← → Navigate • Esc Close • +/- Zoom • 0 Reset</p>
        </div>
      </div>
    </div>
  );

  // Use portal to render outside of main DOM tree
  return createPortal(lightboxContent, document.body);
};

export default FullscreenLightbox;