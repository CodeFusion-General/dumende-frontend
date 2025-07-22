import { useEffect, useRef, useCallback, useState } from "react";

interface MicroInteractionOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  respectMotionPreference?: boolean;
}

interface RippleEffect {
  x: number;
  y: number;
  id: string;
}

export const useMicroInteractions = () => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Animate element with custom options
  const animateElement = useCallback(
    (
      element: HTMLElement,
      animation: string,
      options: MicroInteractionOptions = {}
    ) => {
      const {
        duration = 300,
        delay = 0,
        easing = "cubic-bezier(0.4, 0, 0.2, 1)",
        respectMotionPreference = true,
      } = options;

      if (respectMotionPreference && prefersReducedMotion) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const animationName = `micro-${animation}-${Date.now()}`;

        // Apply animation styles
        element.style.animationName = animation;
        element.style.animationDuration = `${duration}ms`;
        element.style.animationDelay = `${delay}ms`;
        element.style.animationTimingFunction = easing;
        element.style.animationFillMode = "forwards";

        const handleAnimationEnd = () => {
          element.style.animation = "";
          element.removeEventListener("animationend", handleAnimationEnd);
          resolve();
        };

        element.addEventListener("animationend", handleAnimationEnd);
      });
    },
    [prefersReducedMotion]
  );

  // Create ripple effect
  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;

      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = `ripple-${Date.now()}-${Math.random()}`;

      const newRipple: RippleEffect = { x, y, id };
      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);
    },
    [prefersReducedMotion]
  );

  // Hover lift effect
  const hoverLift = useCallback(
    (element: HTMLElement, intensity: "sm" | "md" | "lg" = "md") => {
      if (prefersReducedMotion) return;

      const transforms = {
        sm: "translateY(-2px)",
        md: "translateY(-4px)",
        lg: "translateY(-8px)",
      };

      const shadows = {
        sm: "0 4px 12px rgba(0, 0, 0, 0.1)",
        md: "0 8px 25px rgba(0, 0, 0, 0.15)",
        lg: "0 20px 40px rgba(0, 0, 0, 0.2)",
      };

      element.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      element.style.transform = transforms[intensity];
      element.style.boxShadow = shadows[intensity];
    },
    [prefersReducedMotion]
  );

  // Reset hover effects
  const resetHover = useCallback((element: HTMLElement) => {
    element.style.transform = "";
    element.style.boxShadow = "";
  }, []);

  // Scale animation
  const scaleAnimation = useCallback(
    (element: HTMLElement, scale: number = 1.05, duration: number = 200) => {
      if (prefersReducedMotion) return Promise.resolve();

      return new Promise<void>((resolve) => {
        element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        element.style.transform = `scale(${scale})`;

        setTimeout(() => {
          element.style.transform = "";
          resolve();
        }, duration);
      });
    },
    [prefersReducedMotion]
  );

  // Bounce animation
  const bounceAnimation = useCallback(
    (element: HTMLElement) => {
      if (prefersReducedMotion) return Promise.resolve();

      return animateElement(element, "bounce", { duration: 600 });
    },
    [animateElement, prefersReducedMotion]
  );

  // Pulse animation
  const pulseAnimation = useCallback(
    (element: HTMLElement, duration: number = 1000) => {
      if (prefersReducedMotion) return Promise.resolve();

      return animateElement(element, "pulse", { duration });
    },
    [animateElement, prefersReducedMotion]
  );

  // Shake/wiggle animation
  const shakeAnimation = useCallback(
    (element: HTMLElement) => {
      if (prefersReducedMotion) return Promise.resolve();

      return animateElement(element, "wiggle", { duration: 600 });
    },
    [animateElement, prefersReducedMotion]
  );

  // Glow effect
  const glowEffect = useCallback(
    (
      element: HTMLElement,
      color: string = "#1a5f7a",
      intensity: number = 0.4
    ) => {
      if (prefersReducedMotion) return;

      element.style.transition = "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      element.style.boxShadow = `0 0 20px rgba(${hexToRgb(
        color
      )}, ${intensity})`;
    },
    [prefersReducedMotion]
  );

  // Remove glow effect
  const removeGlow = useCallback((element: HTMLElement) => {
    element.style.boxShadow = "";
  }, []);

  // Stagger animation for multiple elements
  const staggerAnimation = useCallback(
    (
      elements: HTMLElement[],
      animation: string,
      staggerDelay: number = 100
    ) => {
      if (prefersReducedMotion) return Promise.resolve();

      const promises = elements.map((element, index) =>
        animateElement(element, animation, { delay: index * staggerDelay })
      );

      return Promise.all(promises);
    },
    [animateElement, prefersReducedMotion]
  );

  // Fade in animation
  const fadeIn = useCallback(
    (element: HTMLElement, duration: number = 600) => {
      if (prefersReducedMotion) return Promise.resolve();

      return animateElement(element, "fadeIn", { duration });
    },
    [animateElement, prefersReducedMotion]
  );

  // Slide in animations
  const slideIn = useCallback(
    (
      element: HTMLElement,
      direction: "up" | "down" | "left" | "right" = "up",
      duration: number = 500
    ) => {
      if (prefersReducedMotion) return Promise.resolve();

      const animationName = `slideIn${
        direction.charAt(0).toUpperCase() + direction.slice(1)
      }`;
      return animateElement(element, animationName, { duration });
    },
    [animateElement, prefersReducedMotion]
  );

  return {
    // Animation functions
    animateElement,
    fadeIn,
    slideIn,
    scaleAnimation,
    bounceAnimation,
    pulseAnimation,
    shakeAnimation,
    staggerAnimation,

    // Hover effects
    hoverLift,
    resetHover,
    glowEffect,
    removeGlow,

    // Ripple effect
    createRipple,
    ripples,

    // State
    prefersReducedMotion,
  };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isVisible };
};

// Hook for hover state management
export const useHoverState = () => {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return { elementRef, isHovered };
};

// Hook for focus state management
export const useFocusState = () => {
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("focus", handleFocus);
    element.addEventListener("blur", handleBlur);

    return () => {
      element.removeEventListener("focus", handleFocus);
      element.removeEventListener("blur", handleBlur);
    };
  }, [handleFocus, handleBlur]);

  return { elementRef, isFocused };
};

// Utility function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "26, 95, 122"; // Default primary color

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ].join(", ");
}

// Hook for managing animation queues
export const useAnimationQueue = () => {
  const [queue, setQueue] = useState<(() => Promise<void>)[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addToQueue = useCallback((animation: () => Promise<void>) => {
    setQueue((prev) => [...prev, animation]);
  }, []);

  const runQueue = useCallback(async () => {
    if (isRunning || queue.length === 0) return;

    setIsRunning(true);

    for (const animation of queue) {
      await animation();
    }

    setQueue([]);
    setIsRunning(false);
  }, [queue, isRunning]);

  useEffect(() => {
    if (queue.length > 0 && !isRunning) {
      runQueue();
    }
  }, [queue, isRunning, runQueue]);

  return { addToQueue, isRunning, queueLength: queue.length };
};
