/**
 * Scroll-Based Animation System
 * Implements Intersection Observer for scroll-triggered animations,
 * staggered animations, and parallax scrolling effects
 */

export interface ScrollAnimationConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  staggerDelay?: number;
  animationClass?: string;
}

export interface ParallaxConfig {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  boundary?: {
    start?: number;
    end?: number;
  };
}

/**
 * Enhanced Intersection Observer for scroll animations
 */
export class ScrollAnimationObserver {
  private observer: IntersectionObserver;
  private elements = new Map<Element, ScrollAnimationConfig>();
  private triggeredElements = new Set<Element>();

  constructor(defaultConfig: ScrollAnimationConfig = {}) {
    const config = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      triggerOnce: true,
      animationClass: "animate-scroll-reveal",
      ...defaultConfig,
    };

    this.observer = new IntersectionObserver(this.handleIntersection, {
      threshold: config.threshold,
      rootMargin: config.rootMargin,
    });
  }

  observe(element: Element, config: ScrollAnimationConfig = {}) {
    const elementConfig = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      triggerOnce: true,
      animationClass: "animate-scroll-reveal",
      staggerDelay: 0,
      ...config,
    };

    this.elements.set(element, elementConfig);
    this.observer.observe(element);

    // Add initial state
    element.classList.add(elementConfig.animationClass!);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
    this.triggeredElements.delete(element);
    this.observer.unobserve(element);
  }

  private handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const config = this.elements.get(entry.target);
      if (!config) return;

      if (entry.isIntersecting) {
        if (config.triggerOnce && this.triggeredElements.has(entry.target)) {
          return;
        }

        this.triggerAnimation(entry.target, config);

        if (config.triggerOnce) {
          this.triggeredElements.add(entry.target);
        }
      } else if (!config.triggerOnce) {
        this.removeAnimation(entry.target, config);
      }
    });
  };

  private triggerAnimation(element: Element, config: ScrollAnimationConfig) {
    if (config.staggerDelay && config.staggerDelay > 0) {
      // Handle staggered children
      const children = element.querySelectorAll("[data-stagger]");
      children.forEach((child, index) => {
        setTimeout(() => {
          child.classList.add("revealed");
        }, index * config.staggerDelay!);
      });
    } else {
      element.classList.add("revealed");
    }

    // Dispatch custom event
    element.dispatchEvent(
      new CustomEvent("scrollAnimationTriggered", {
        detail: { config },
      })
    );
  }

  private removeAnimation(element: Element, config: ScrollAnimationConfig) {
    element.classList.remove("revealed");

    // Remove from staggered children
    const children = element.querySelectorAll("[data-stagger]");
    children.forEach((child) => {
      child.classList.remove("revealed");
    });
  }

  disconnect() {
    this.observer.disconnect();
    this.elements.clear();
    this.triggeredElements.clear();
  }
}

/**
 * Staggered Animation Controller
 */
export class StaggerAnimationController {
  private containers = new Map<
    Element,
    {
      children: Element[];
      delay: number;
      animationClass: string;
    }
  >();

  register(
    container: Element,
    childSelector: string = "[data-stagger]",
    delay: number = 100,
    animationClass: string = "animate-fade-in-up"
  ) {
    const children = Array.from(container.querySelectorAll(childSelector));

    this.containers.set(container, {
      children,
      delay,
      animationClass,
    });

    // Add initial animation class to children
    children.forEach((child) => {
      child.classList.add(animationClass);
    });
  }

  trigger(container: Element) {
    const config = this.containers.get(container);
    if (!config) return;

    config.children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add("revealed");
      }, index * config.delay);
    });
  }

  reset(container: Element) {
    const config = this.containers.get(container);
    if (!config) return;

    config.children.forEach((child) => {
      child.classList.remove("revealed");
    });
  }

  unregister(container: Element) {
    this.containers.delete(container);
  }
}

/**
 * Parallax Scrolling Controller
 */
export class ParallaxController {
  private elements = new Map<
    Element,
    ParallaxConfig & {
      initialOffset: number;
      rect: DOMRect;
    }
  >();
  private isActive = false;
  private rafId: number | null = null;
  private lastScrollY = 0;

  add(element: Element, config: ParallaxConfig = {}) {
    const elementConfig = {
      speed: 0.5,
      direction: "up" as const,
      boundary: {
        start: 0,
        end: 1,
      },
      ...config,
    };

    const rect = element.getBoundingClientRect();
    const scrollY = window.pageYOffset;

    this.elements.set(element, {
      ...elementConfig,
      initialOffset: rect.top + scrollY,
      rect,
    });

    if (!this.isActive) {
      this.start();
    }
  }

  remove(element: Element) {
    this.elements.delete(element);

    if (this.elements.size === 0) {
      this.stop();
    }
  }

  private start() {
    this.isActive = true;
    this.lastScrollY = window.pageYOffset;
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
    const windowHeight = window.innerHeight;

    this.elements.forEach((config, element) => {
      const { speed, direction, boundary, initialOffset, rect } = config;

      // Check if element is within scroll boundaries
      const elementTop = initialOffset;
      const elementBottom = elementTop + rect.height;

      const startBoundary = boundary!.start! * windowHeight;
      const endBoundary = boundary!.end! * windowHeight;

      if (
        elementBottom < scrollY - startBoundary ||
        elementTop > scrollY + windowHeight + endBoundary
      ) {
        return; // Element is outside boundaries
      }

      // Calculate parallax offset
      const progress =
        (scrollY - elementTop + windowHeight) / (windowHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, progress));

      let offset = (scrollY - initialOffset) * speed!;

      // Apply direction
      switch (direction) {
        case "down":
          offset = -offset;
          break;
        case "left":
          (element as HTMLElement).style.transform = `translateX(${offset}px)`;
          return;
        case "right":
          (element as HTMLElement).style.transform = `translateX(${-offset}px)`;
          return;
      }

      (element as HTMLElement).style.transform = `translateY(${offset}px)`;
    });

    this.lastScrollY = scrollY;
    this.rafId = requestAnimationFrame(this.update);
  };

  updateElementRect(element: Element) {
    const config = this.elements.get(element);
    if (config) {
      const rect = element.getBoundingClientRect();
      const scrollY = window.pageYOffset;
      config.rect = rect;
      config.initialOffset = rect.top + scrollY;
    }
  }

  pause() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (!this.isActive && this.elements.size > 0) {
      this.start();
    }
  }
}

/**
 * Scroll Progress Indicator
 */
export class ScrollProgressIndicator {
  private element: HTMLElement;
  private target: Element | null = null;
  private isActive = false;
  private rafId: number | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  trackDocument() {
    this.target = null;
    this.start();
  }

  trackElement(element: Element) {
    this.target = element;
    this.start();
  }

  private start() {
    this.isActive = true;
    this.update();
  }

  stop() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private update = () => {
    if (!this.isActive) return;

    let progress = 0;

    if (this.target) {
      // Track specific element
      const rect = this.target.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      if (rect.top <= 0 && rect.bottom >= 0) {
        progress = Math.abs(rect.top) / (elementHeight - windowHeight);
        progress = Math.max(0, Math.min(1, progress));
      }
    } else {
      // Track document
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      progress = scrollTop / (documentHeight - windowHeight);
      progress = Math.max(0, Math.min(1, progress));
    }

    // Update progress indicator
    this.element.style.transform = `scaleX(${progress})`;
    this.element.setAttribute("data-progress", (progress * 100).toFixed(1));

    this.rafId = requestAnimationFrame(this.update);
  };
}

/**
 * Scroll-triggered Counter Animation
 */
export class ScrollCounterAnimation {
  private elements = new Map<
    Element,
    {
      start: number;
      end: number;
      duration: number;
      formatter?: (value: number) => string;
    }
  >();
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(this.handleIntersection, {
      threshold: 0.5,
    });
  }

  add(
    element: Element,
    start: number,
    end: number,
    duration: number = 2000,
    formatter?: (value: number) => string
  ) {
    this.elements.set(element, {
      start,
      end,
      duration,
      formatter,
    });

    // Set initial value
    const initialText = formatter ? formatter(start) : start.toString();
    element.textContent = initialText;

    this.observer.observe(element);
  }

  remove(element: Element) {
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  private handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const config = this.elements.get(entry.target);
        if (config) {
          this.animateCounter(entry.target, config);
        }
      }
    });
  };

  private animateCounter(
    element: Element,
    config: {
      start: number;
      end: number;
      duration: number;
      formatter?: (value: number) => string;
    }
  ) {
    const { start, end, duration, formatter } = config;
    const startTime = performance.now();
    const difference = end - start;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(start + difference * easedProgress);
      const displayText = formatter
        ? formatter(currentValue)
        : currentValue.toString();

      element.textContent = displayText;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  disconnect() {
    this.observer.disconnect();
    this.elements.clear();
  }
}

/**
 * Global Scroll Animation Manager
 */
export class ScrollAnimationManager {
  public scrollObserver: ScrollAnimationObserver;
  public staggerController: StaggerAnimationController;
  public parallaxController: ParallaxController;
  public counterAnimation: ScrollCounterAnimation;
  private progressIndicators: ScrollProgressIndicator[] = [];
  private isInitialized = false;

  constructor() {
    this.scrollObserver = new ScrollAnimationObserver();
    this.staggerController = new StaggerAnimationController();
    this.parallaxController = new ParallaxController();
    this.counterAnimation = new ScrollCounterAnimation();
  }

  init() {
    if (this.isInitialized) return;

    // Auto-detect and setup scroll animations
    this.setupScrollRevealAnimations();
    this.setupStaggerAnimations();
    this.setupParallaxElements();
    this.setupCounterAnimations();
    this.setupProgressIndicators();

    // Handle resize events
    window.addEventListener("resize", this.handleResize);

    // Handle reduced motion preference
    this.handleReducedMotion();

    this.isInitialized = true;
  }

  private setupScrollRevealAnimations() {
    // Setup basic scroll reveal animations
    document.querySelectorAll("[data-scroll-reveal]").forEach((element) => {
      const animationClass =
        element.getAttribute("data-animation") || "animate-scroll-reveal";
      const threshold = parseFloat(
        element.getAttribute("data-threshold") || "0.1"
      );
      const triggerOnce = element.getAttribute("data-trigger-once") !== "false";

      this.scrollObserver.observe(element, {
        animationClass,
        threshold,
        triggerOnce,
      });
    });
  }

  private setupStaggerAnimations() {
    document
      .querySelectorAll("[data-stagger-container]")
      .forEach((container) => {
        const childSelector =
          container.getAttribute("data-stagger-children") || "[data-stagger]";
        const delay = parseInt(
          container.getAttribute("data-stagger-delay") || "100"
        );
        const animationClass =
          container.getAttribute("data-stagger-animation") ||
          "animate-fade-in-up";

        this.staggerController.register(
          container,
          childSelector,
          delay,
          animationClass
        );

        // Observe container for triggering
        this.scrollObserver.observe(container, {
          animationClass: "stagger-trigger",
          triggerOnce: true,
        });

        container.addEventListener("scrollAnimationTriggered", () => {
          this.staggerController.trigger(container);
        });
      });
  }

  private setupParallaxElements() {
    document.querySelectorAll("[data-parallax]").forEach((element) => {
      const speed = parseFloat(
        element.getAttribute("data-parallax-speed") || "0.5"
      );
      const direction =
        (element.getAttribute("data-parallax-direction") as
          | "up"
          | "down"
          | "left"
          | "right") || "up";
      const startBoundary = parseFloat(
        element.getAttribute("data-parallax-start") || "0"
      );
      const endBoundary = parseFloat(
        element.getAttribute("data-parallax-end") || "1"
      );

      this.parallaxController.add(element, {
        speed,
        direction,
        boundary: {
          start: startBoundary,
          end: endBoundary,
        },
      });
    });
  }

  private setupCounterAnimations() {
    document.querySelectorAll("[data-counter]").forEach((element) => {
      const start = parseInt(element.getAttribute("data-counter-start") || "0");
      const end = parseInt(element.getAttribute("data-counter-end") || "100");
      const duration = parseInt(
        element.getAttribute("data-counter-duration") || "2000"
      );
      const format = element.getAttribute("data-counter-format");

      let formatter: ((value: number) => string) | undefined;
      if (format) {
        formatter = (value: number) =>
          format.replace("{value}", value.toString());
      }

      this.counterAnimation.add(element, start, end, duration, formatter);
    });
  }

  private setupProgressIndicators() {
    document.querySelectorAll("[data-scroll-progress]").forEach((element) => {
      const indicator = new ScrollProgressIndicator(element as HTMLElement);
      const target = element.getAttribute("data-scroll-target");

      if (target) {
        const targetElement = document.querySelector(target);
        if (targetElement) {
          indicator.trackElement(targetElement);
        }
      } else {
        indicator.trackDocument();
      }

      this.progressIndicators.push(indicator);
    });
  }

  private handleResize = () => {
    // Update parallax element rects on resize
    this.parallaxController["elements"].forEach((config, element) => {
      this.parallaxController.updateElementRect(element);
    });
  };

  private handleReducedMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.parallaxController.pause();
    }
  }

  destroy() {
    this.scrollObserver.disconnect();
    this.parallaxController.pause();
    this.counterAnimation.disconnect();
    this.progressIndicators.forEach((indicator) => indicator.stop());

    window.removeEventListener("resize", this.handleResize);
    this.isInitialized = false;
  }
}

// Export singleton instance
export const scrollAnimationManager = new ScrollAnimationManager();

// Auto-initialize
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      scrollAnimationManager.init()
    );
  } else {
    scrollAnimationManager.init();
  }
}
