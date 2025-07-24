import { useEffect, useRef, useState } from "react";

interface UseStaggeredAnimationOptions {
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
}

export const useStaggeredAnimation = (
  itemCount: number,
  options: UseStaggeredAnimationOptions = {}
) => {
  const {
    delay = 100,
    duration = 300,
    threshold = 0.1,
    rootMargin = "0px",
  } = options;

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize item refs array
  useEffect(() => {
    itemRefs.current = Array(itemCount).fill(null);
  }, [itemCount]);

  // Set up intersection observer
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-stagger-index") || "0"
            );

            // Add staggered delay
            setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, index]));
            }, index * delay);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observe all item elements
    itemRefs.current.forEach((item) => {
      if (item && observerRef.current) {
        observerRef.current.observe(item);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [delay, threshold, rootMargin]);

  // Function to get ref for specific item
  const getItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
    if (el) {
      el.setAttribute("data-stagger-index", index.toString());
    }
  };

  // Function to check if item should be visible
  const isItemVisible = (index: number) => visibleItems.has(index);

  // Function to get animation classes for item
  const getItemClasses = (index: number) => {
    const isVisible = isItemVisible(index);
    return {
      base: "transition-all ease-out",
      visible: isVisible
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform translate-y-8",
      duration: `duration-[${duration}ms]`,
    };
  };

  // Function to get inline styles for item
  const getItemStyles = (index: number) => ({
    transitionDelay: visibleItems.has(index) ? "0ms" : `${index * delay}ms`,
  });

  return {
    containerRef,
    getItemRef,
    isItemVisible,
    getItemClasses,
    getItemStyles,
    visibleItems,
  };
};

// Utility function for CSS class-based staggered animations
export const useStaggeredClasses = (
  itemCount: number,
  baseDelay: number = 100
) => {
  const getStaggeredClass = (index: number) => {
    const delayClass = `animate-delay-${Math.min(index * baseDelay, 1000)}`;
    return `animate-fade-in-up ${delayClass}`;
  };

  const getStaggeredStyle = (index: number) => ({
    animationDelay: `${index * baseDelay}ms`,
  });

  return {
    getStaggeredClass,
    getStaggeredStyle,
  };
};
