/**
 * React hooks for scroll-based animations
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  ScrollAnimationObserver,
  ParallaxController,
  StaggerAnimationController,
  ScrollCounterAnimation,
  ScrollProgressIndicator,
  type ScrollAnimationConfig,
  type ParallaxConfig,
} from "../lib/scroll-animations";

/**
 * Hook for scroll reveal animations
 */
export function useScrollReveal(config: ScrollAnimationConfig = {}) {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<ScrollAnimationObserver | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new ScrollAnimationObserver();
    observerRef.current = observer;

    observer.observe(elementRef.current, config);

    return () => {
      observer.disconnect();
    };
  }, [config]);

  return elementRef;
}

/**
 * Hook for parallax scrolling effects
 */
export function useParallax(config: ParallaxConfig = {}) {
  const elementRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<ParallaxController | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const controller = new ParallaxController();
    controllerRef.current = controller;

    controller.add(elementRef.current, config);

    return () => {
      if (elementRef.current) {
        controller.remove(elementRef.current);
      }
    };
  }, [config]);

  const pause = useCallback(() => {
    controllerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    controllerRef.current?.resume();
  }, []);

  return { ref: elementRef, pause, resume };
}

/**
 * Hook for staggered animations
 */
export function useStaggerAnimation(
  childSelector: string = "[data-stagger]",
  delay: number = 100,
  animationClass: string = "animate-fade-in-up"
) {
  const containerRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<StaggerAnimationController | null>(null);
  const observerRef = useRef<ScrollAnimationObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new StaggerAnimationController();
    const observer = new ScrollAnimationObserver();

    controllerRef.current = controller;
    observerRef.current = observer;

    controller.register(
      containerRef.current,
      childSelector,
      delay,
      animationClass
    );

    // Observe container for triggering
    observer.observe(containerRef.current, {
      animationClass: "stagger-trigger",
      triggerOnce: true,
    });

    const handleTrigger = () => {
      controller.trigger(containerRef.current!);
    };

    containerRef.current.addEventListener(
      "scrollAnimationTriggered",
      handleTrigger
    );

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "scrollAnimationTriggered",
          handleTrigger
        );
        controller.unregister(containerRef.current);
      }
      observer.disconnect();
    };
  }, [childSelector, delay, animationClass]);

  const trigger = useCallback(() => {
    if (containerRef.current && controllerRef.current) {
      controllerRef.current.trigger(containerRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    if (containerRef.current && controllerRef.current) {
      controllerRef.current.reset(containerRef.current);
    }
  }, []);

  return { ref: containerRef, trigger, reset };
}

/**
 * Hook for counter animations
 */
export function useScrollCounter(
  start: number,
  end: number,
  duration: number = 2000,
  formatter?: (value: number) => string
) {
  const elementRef = useRef<HTMLElement>(null);
  const counterRef = useRef<ScrollCounterAnimation | null>(null);
  const [currentValue, setCurrentValue] = useState(start);

  useEffect(() => {
    if (!elementRef.current) return;

    const counter = new ScrollCounterAnimation();
    counterRef.current = counter;

    counter.add(elementRef.current, start, end, duration, formatter);

    // Listen for value changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          const text = elementRef.current?.textContent || "";
          const numericValue = parseInt(text.replace(/\D/g, "")) || start;
          setCurrentValue(numericValue);
        }
      });
    });

    observer.observe(elementRef.current, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      if (elementRef.current) {
        counter.remove(elementRef.current);
      }
      observer.disconnect();
    };
  }, [start, end, duration, formatter]);

  return { ref: elementRef, currentValue };
}

/**
 * Hook for scroll progress indicator
 */
export function useScrollProgress(targetSelector?: string) {
  const elementRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<ScrollProgressIndicator | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!elementRef.current) return;

    const indicator = new ScrollProgressIndicator(elementRef.current);
    indicatorRef.current = indicator;

    if (targetSelector) {
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        indicator.trackElement(targetElement);
      }
    } else {
      indicator.trackDocument();
    }

    // Monitor progress changes
    const observer = new MutationObserver(() => {
      const progressValue = parseFloat(
        elementRef.current?.getAttribute("data-progress") || "0"
      );
      setProgress(progressValue);
    });

    observer.observe(elementRef.current, {
      attributes: true,
      attributeFilter: ["data-progress"],
    });

    return () => {
      indicator.stop();
      observer.disconnect();
    };
  }, [targetSelector]);

  return { ref: elementRef, progress };
}

/**
 * Hook for intersection observer with custom callback
 */
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
        ...options,
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
}

/**
 * Hook for scroll-triggered animations with custom logic
 */
export function useScrollTrigger(
  onEnter?: () => void,
  onExit?: () => void,
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const elementRef = useIntersectionObserver((entry) => {
    const wasVisible = isVisible;
    const nowVisible = entry.isIntersecting;

    setIsVisible(nowVisible);

    if (!wasVisible && nowVisible) {
      onEnter?.();
      if (!hasTriggered) {
        setHasTriggered(true);
      }
    } else if (wasVisible && !nowVisible) {
      onExit?.();
    }
  }, options);

  return { ref: elementRef, isVisible, hasTriggered };
}

/**
 * Hook for scroll-based value interpolation
 */
export function useScrollValue(
  startValue: number,
  endValue: number,
  options: IntersectionObserverInit = {}
) {
  const [value, setValue] = useState(startValue);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;

            // Calculate progress based on element position
            const progress = Math.max(
              0,
              Math.min(
                1,
                (windowHeight - rect.top) / (windowHeight + rect.height)
              )
            );

            const interpolatedValue =
              startValue + (endValue - startValue) * progress;
            setValue(interpolatedValue);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px",
        ...options,
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [startValue, endValue, options]);

  return { ref: elementRef, value };
}
