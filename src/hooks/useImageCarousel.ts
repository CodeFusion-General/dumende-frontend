import { useState, useCallback, useEffect, useRef } from "react";
import { BoatImage } from "@/components/boats/BoatImageCarousel";

interface UseImageCarouselOptions {
  images: BoatImage[];
  initialIndex?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  preloadCount?: number;
  onImageChange?: (index: number) => void;
}

interface UseImageCarouselReturn {
  currentIndex: number;
  isAutoplayEnabled: boolean;
  loadedImages: Set<number>;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  toggleAutoplay: () => void;
  preloadImage: (index: number) => void;
  setCurrentIndex: (index: number) => void;
  setAutoplayEnabled: (enabled: boolean) => void;
}

export const useImageCarousel = ({
  images,
  initialIndex = 0,
  autoplay = false,
  autoplayDelay = 4000,
  loop = true,
  preloadCount = 2,
  onImageChange,
}: UseImageCarouselOptions): UseImageCarouselReturn => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(autoplay);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  // Validate and sanitize index
  const getSafeIndex = useCallback((index: number): number => {
    if (images.length === 0) return 0;
    if (loop) {
      return ((index % images.length) + images.length) % images.length;
    }
    return Math.max(0, Math.min(index, images.length - 1));
  }, [images.length, loop]);

  // Handle index change with validation
  const handleIndexChange = useCallback((newIndex: number) => {
    const safeIndex = getSafeIndex(newIndex);
    setCurrentIndex(safeIndex);
    onImageChange?.(safeIndex);
  }, [getSafeIndex, onImageChange]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    
    const nextIndex = loop 
      ? (currentIndex + 1) % images.length
      : Math.min(currentIndex + 1, images.length - 1);
    
    handleIndexChange(nextIndex);
  }, [currentIndex, images.length, loop, handleIndexChange]);

  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return;
    
    const prevIndex = loop
      ? (currentIndex - 1 + images.length) % images.length
      : Math.max(currentIndex - 1, 0);
    
    handleIndexChange(prevIndex);
  }, [currentIndex, images.length, loop, handleIndexChange]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      handleIndexChange(index);
    }
  }, [images.length, handleIndexChange]);

  // Autoplay functionality
  const startAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    
    if (isAutoplayEnabled && images.length > 1 && !isHoveredRef.current) {
      autoplayIntervalRef.current = setInterval(() => {
        goToNext();
      }, autoplayDelay);
    }
  }, [isAutoplayEnabled, images.length, autoplayDelay, goToNext]);

  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, []);

  const toggleAutoplay = useCallback(() => {
    setIsAutoplayEnabled(prev => !prev);
  }, []);

  // Pause autoplay on hover
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    stopAutoplay();
  }, [stopAutoplay]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (isAutoplayEnabled) {
      startAutoplay();
    }
  }, [isAutoplayEnabled, startAutoplay]);

  // Image preloading
  const preloadImage = useCallback((index: number) => {
    if (loadedImages.has(index) || !images[index]) return;

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set([...prev, index]));
    };
    img.onerror = () => {
      console.warn(`Failed to preload image at index ${index}`);
    };
    img.src = images[index].imageUrl;
  }, [images, loadedImages]);

  // Preload adjacent images
  const preloadAdjacentImages = useCallback(() => {
    const indicesToPreload: number[] = [];
    
    // Always preload current image
    indicesToPreload.push(currentIndex);
    
    // Preload adjacent images based on preloadCount
    for (let i = 1; i <= preloadCount; i++) {
      if (loop || currentIndex + i < images.length) {
        indicesToPreload.push(getSafeIndex(currentIndex + i));
      }
      if (loop || currentIndex - i >= 0) {
        indicesToPreload.push(getSafeIndex(currentIndex - i));
      }
    }

    // Remove duplicates and preload
    const uniqueIndices = [...new Set(indicesToPreload)];
    uniqueIndices.forEach(index => {
      if (index >= 0 && index < images.length) {
        preloadImage(index);
      }
    });
  }, [currentIndex, preloadCount, images.length, loop, getSafeIndex, preloadImage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events when not in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
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
        case ' ':
          event.preventDefault();
          toggleAutoplay();
          break;
        case 'Escape':
          event.preventDefault();
          setIsAutoplayEnabled(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, goToIndex, toggleAutoplay, images.length]);

  // Autoplay effect
  useEffect(() => {
    if (isAutoplayEnabled && images.length > 1) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => stopAutoplay();
  }, [isAutoplayEnabled, images.length, startAutoplay, stopAutoplay]);

  // Preload images effect
  useEffect(() => {
    preloadAdjacentImages();
  }, [preloadAdjacentImages]);

  // Reset index when images change
  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1);
    }
  }, [images.length, currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoplay();
    };
  }, [stopAutoplay]);

  return {
    currentIndex,
    isAutoplayEnabled,
    loadedImages,
    goToNext,
    goToPrevious,
    goToIndex,
    toggleAutoplay,
    preloadImage,
    setCurrentIndex: handleIndexChange,
    setAutoplayEnabled: setIsAutoplayEnabled,
  };
};

// Touch/Swipe gesture hook for carousel
interface UseCarouselGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  velocity?: number;
  enabled?: boolean;
}

export const useCarouselGestures = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocity = 0.3,
  enabled = true,
}: UseCarouselGesturesOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    startTimeRef.current = Date.now();
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;
    const duration = Date.now() - startTimeRef.current;
    const swipeVelocity = Math.abs(distance) / duration;

    if (swipeVelocity > velocity) {
      if (isLeftSwipe) {
        onSwipeLeft?.();
      } else if (isRightSwipe) {
        onSwipeRight?.();
      }
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  }, [enabled, touchStart, touchEnd, threshold, velocity, onSwipeLeft, onSwipeRight]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

// Responsive breakpoint hook for carousel
export const useCarouselBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    showThumbnails: breakpoint === 'desktop',
    showSwiper: breakpoint !== 'desktop',
  };
};

export default useImageCarousel;