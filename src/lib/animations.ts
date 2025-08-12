/**
 * Enhanced Animation System - JavaScript Helpers
 * Provides utilities for complex animations and interactions
 */

import { ANIMATION_CONFIG } from "./animation-config";

// Optimized Animation timing functions
export const EASING = {
  smooth: ANIMATION_CONFIG.EASING.SMOOTH,
  bounce: ANIMATION_CONFIG.EASING.BOUNCE,
  glass: ANIMATION_CONFIG.EASING.GLASS,
  elastic: ANIMATION_CONFIG.EASING.ELASTIC,
  back: ANIMATION_CONFIG.EASING.BACK,
} as const;

// Optimized Animation durations
export const DURATION = {
  fast: ANIMATION_CONFIG.DURATION.FAST,
  normal: ANIMATION_CONFIG.DURATION.NORMAL,
  slow: ANIMATION_CONFIG.DURATION.SLOW,
  slower: ANIMATION_CONFIG.DURATION.SLOWER,
  slowest: ANIMATION_CONFIG.DURATION.SLOWEST,
} as const;

// Optimized Stagger delays
export const STAGGER_DELAY = {
  1: ANIMATION_CONFIG.STAGGER.NORMAL,
  2: ANIMATION_CONFIG.STAGGER.NORMAL * 2,
  3: ANIMATION_CONFIG.STAGGER.NORMAL * 3,
  4: ANIMATION_CONFIG.STAGGER.NORMAL * 4,
  5: ANIMATION_CONFIG.STAGGER.NORMAL * 5,
  6: ANIMATION_CONFIG.STAGGER.NORMAL * 6,
} as const;

/**
 * Animation performance monitoring
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private isMonitoring = false;
  private animationId: number | null = null;
  private callbacks: Array<
    (metrics: { fps: number; frameTime: number; isOptimized: boolean }) => void
  > = [];
  private activeAnimations = new Set<string>();
  private performanceEntries: number[] = [];
  private maxEntries = 60;

  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.performanceEntries = [];
    this.monitor();
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  onMetricsUpdate(
    callback: (metrics: {
      fps: number;
      frameTime: number;
      isOptimized: boolean;
    }) => void
  ) {
    this.callbacks.push(callback);
  }

  trackAnimation(animationId: string) {
    this.activeAnimations.add(animationId);
  }

  untrackAnimation(animationId: string) {
    this.activeAnimations.delete(animationId);
  }

  private monitor = () => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;
    this.performanceEntries.push(deltaTime);

    // Keep only the last maxEntries
    if (this.performanceEntries.length > this.maxEntries) {
      this.performanceEntries.shift();
    }

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.frameTime =
        this.performanceEntries.reduce((a, b) => a + b, 0) /
        this.performanceEntries.length;

      const metrics = {
        fps: this.fps,
        frameTime: this.frameTime,
        isOptimized: this.fps >= 55 && this.frameTime <= 18,
      };

      // this.callbacks.forEach((callback) => callback(metrics));

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.monitor);
  };

  getFPS(): number {
    return this.fps;
  }

  getFrameTime(): number {
    return this.frameTime;
  }
}

/**
 * Ripple effect animation
 */
export function createRippleEffect(element: HTMLElement, event: MouseEvent) {
  // Check if element already has relative positioning
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.position === "static") {
    element.style.position = "relative";
  }

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement("div");
  ripple.className = "ripple-effect";
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple ${DURATION.slower}ms ${EASING.glass};
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 0;
  `;

  element.appendChild(ripple);

  // Clean up after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, DURATION.slower);
}

/**
 * Enhanced ripple effect for glass buttons
 */
export function createGlassRippleEffect(
  element: HTMLElement,
  event: MouseEvent
) {
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement("div");
  ripple.className = "glass-ripple-effect";
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${ANIMATION_CONFIG.GLASS.BACKGROUND.LIGHT};
    backdrop-filter: blur(${ANIMATION_CONFIG.GLASS.BLUR.DEFAULT});
    transform: scale(0);
    animation: ripple ${DURATION.slowest}ms ${EASING.glass};
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 0;
  `;

  element.appendChild(ripple);

  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, DURATION.slowest);
}

/**
 * Staggered animation utility
 */
export function staggerAnimation(
  elements: NodeListOf<Element> | Element[],
  animationClass: string,
  delay: number = STAGGER_DELAY[1]
) {
  const elementsArray = Array.from(elements);

  elementsArray.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass);
    }, index * delay);
  });

  return () => {
    elementsArray.forEach((element) => {
      element.classList.remove(animationClass);
    });
  };
}

/**
 * Parallax scrolling effect
 */
export class ParallaxController {
  private elements: Array<{
    element: HTMLElement;
    speed: number;
    offset: number;
  }> = [];
  private isActive = false;
  private rafId: number | null = null;

  add(element: HTMLElement, speed: number = 0.5) {
    this.elements.push({
      element,
      speed,
      offset: 0,
    });

    if (!this.isActive) {
      this.start();
    }
  }

  remove(element: HTMLElement) {
    this.elements = this.elements.filter((item) => item.element !== element);

    if (this.elements.length === 0) {
      this.stop();
    }
  }

  private start() {
    this.isActive = true;
    this.update();
  }

  private stop() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private update = () => {
    if (!this.isActive) return;

    const scrollY = window.pageYOffset;

    this.elements.forEach(({ element, speed }) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Only animate elements that are in or near the viewport
      if (
        elementTop < scrollY + windowHeight &&
        elementTop + elementHeight > scrollY
      ) {
        const yPos = -(scrollY - elementTop) * speed;
        element.style.transform = `translateY(${yPos}px)`;
      }
    });

    this.rafId = requestAnimationFrame(this.update);
  };
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(
  target: HTMLElement | string,
  duration: number = DURATION.slow,
  offset: number = 0
) {
  const element =
    typeof target === "string"
      ? (document.querySelector(target) as HTMLElement)
      : target;

  if (!element) return;

  const targetPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

/**
 * Animation sequence builder
 */
export class AnimationSequence {
  private steps: Array<() => Promise<void>> = [];
  private isRunning = false;

  add(animation: () => Promise<void>) {
    this.steps.push(animation);
    return this;
  }

  addDelay(duration: number) {
    this.steps.push(
      () => new Promise((resolve) => setTimeout(resolve, duration))
    );
    return this;
  }

  addElement(
    element: HTMLElement,
    animationClass: string,
    duration: number = DURATION.normal
  ) {
    this.steps.push(
      () =>
        new Promise((resolve) => {
          element.classList.add(animationClass);
          setTimeout(() => {
            element.classList.remove(animationClass);
            resolve();
          }, duration);
        })
    );
    return this;
  }

  async play() {
    if (this.isRunning) return;

    this.isRunning = true;

    for (const step of this.steps) {
      await step();
    }

    this.isRunning = false;
  }

  clear() {
    this.steps = [];
    return this;
  }
}

/**
 * Intersection Observer for scroll animations
 */
export class ScrollAnimationObserver {
  private observer: IntersectionObserver;
  private elements = new Map<Element, string>();

  constructor(options: IntersectionObserverInit = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      ...options,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection,
      defaultOptions
    );
  }

  observe(element: Element, animationClass: string = "animate-scroll-reveal") {
    this.elements.set(element, animationClass);
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  private handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const animationClass = this.elements.get(entry.target);
      if (!animationClass) return;

      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      } else {
        entry.target.classList.remove("revealed");
      }
    });
  };

  disconnect() {
    this.observer.disconnect();
    this.elements.clear();
  }
}

/**
 * Device capability detection for animation optimization
 */
export function getDeviceCapabilities() {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  return {
    supportsWebGL: !!gl,
    supportsBackdropFilter: CSS.supports("backdrop-filter", "blur(10px)"),
    supportsTransform3d: CSS.supports("transform", "translate3d(0,0,0)"),
    isHighPerformance: navigator.hardwareConcurrency >= 4,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    isMobile:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
  };
}

/**
 * Animation optimization based on device capabilities
 */
export function optimizeAnimationsForDevice() {
  const capabilities = getDeviceCapabilities();
  const root = document.documentElement;

  if (capabilities.prefersReducedMotion) {
    root.style.setProperty("--duration-fast", "0ms");
    root.style.setProperty("--duration-normal", "0ms");
    root.style.setProperty("--duration-slow", "0ms");
    return;
  }

  if (!capabilities.isHighPerformance || capabilities.isMobile) {
    // Reduce animation complexity on lower-end devices
    root.style.setProperty("--duration-fast", "100ms");
    root.style.setProperty("--duration-normal", "200ms");
    root.style.setProperty("--duration-slow", "300ms");
  }

  if (!capabilities.supportsBackdropFilter) {
    // Add fallback class for browsers without backdrop-filter support
    root.classList.add("no-backdrop-filter");
  }
}

/**
 * Global animation utilities
 */
export const AnimationUtils = {
  performanceMonitor: new AnimationPerformanceMonitor(),
  parallaxController: new ParallaxController(),
  scrollObserver: new ScrollAnimationObserver(),

  // Initialize animation system
  init() {
    optimizeAnimationsForDevice();

    // Start performance monitoring
    this.performanceMonitor.start();

    // Track performance and apply optimizations
    this.performanceMonitor.onMetricsUpdate((metrics) => {
      if (!metrics.isOptimized) {
        // Suppressed noisy performance logs in production

        // Apply performance optimizations if needed
        if (metrics.fps < 30) {
          this.applyEmergencyOptimizations();
        }
      }
    });

    // Add global event listeners for ripple effects
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("animate-ripple")) {
        // Track ripple animation
        const animationId = `ripple-${Date.now()}`;
        this.performanceMonitor.trackAnimation(animationId);

        createRippleEffect(target, event);

        // Untrack after animation completes
        setTimeout(() => {
          this.performanceMonitor.untrackAnimation(animationId);
        }, 600);
      }
    });

    // Initialize scroll animations with performance tracking
    document
      .querySelectorAll(".animate-scroll-reveal, .animate-scroll-scale")
      .forEach((element) => {
        this.scrollObserver.observe(element);
      });
  },

  // Apply emergency performance optimizations
  applyEmergencyOptimizations() {
    const root = document.documentElement;

    // Reduce animation durations drastically
    root.style.setProperty("--duration-fast", "50ms");
    root.style.setProperty("--duration-normal", "100ms");
    root.style.setProperty("--duration-slow", "150ms");

    // Disable complex animations
    root.classList.add("emergency-performance-mode");

    console.warn(
      "Emergency performance mode activated - complex animations disabled"
    );
  },

  // Cleanup
  destroy() {
    this.performanceMonitor.stop();
    this.scrollObserver.disconnect();
  },
};

// Auto-initialize when DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AnimationUtils.init());
  } else {
    AnimationUtils.init();
  }
}
