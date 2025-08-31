/**
 * Performance optimization utilities for responsive design
 */

/**
 * Preload critical images to prevent layout shifts
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Batch preload multiple images
 */
export const preloadImages = async (sources: string[]): Promise<void> => {
  const promises = sources.slice(0, 3).map(preloadImage); // Only preload first 3 images
  await Promise.allSettled(promises);
};

/**
 * Optimize image loading with responsive sizes
 */
export const getResponsiveImageSizes = (
  type: "hero" | "thumbnail" | "card"
) => {
  switch (type) {
    case "hero":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 70vw";
    case "thumbnail":
      return "(max-width: 640px) 80px, (max-width: 1024px) 80px, 80px";
    case "card":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    default:
      return "100vw";
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Optimize CSS containment for layout performance
 */
export const getContainmentStyle = (
  type: "layout" | "style" | "paint" | "size"
) => {
  const containmentMap = {
    layout: { contain: "layout style" },
    style: { contain: "style" },
    paint: { contain: "paint" },
    size: { contain: "size" },
  };

  return containmentMap[type] || { contain: "layout style" };
};

/**
 * Intersection Observer for lazy loading optimization
 */
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Remove unused CSS classes from bundle (development helper)
 */
export const logUnusedClasses = (usedClasses: Set<string>) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Used responsive classes:", Array.from(usedClasses).sort());
  }
};
