/**
 * Animation Performance Monitoring and Optimization Utilities
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  animationCount: number;
  isOptimized: boolean;
}

export interface DeviceCapabilities {
  supportsWebGL: boolean;
  supportsBackdropFilter: boolean;
  supportsTransform3d: boolean;
  isHighPerformance: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  memoryLimit: number;
}

/**
 * Performance monitoring class for animations
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private isMonitoring = false;
  private animationId: number | null = null;
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];
  private activeAnimations = new Set<string>();
  private performanceEntries: number[] = [];
  private maxEntries = 60; // Store last 60 frame times

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

  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
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

    // Calculate metrics every second
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.frameTime =
        this.performanceEntries.reduce((a, b) => a + b, 0) /
        this.performanceEntries.length;

      const metrics: PerformanceMetrics = {
        fps: this.fps,
        frameTime: this.frameTime,
        memoryUsage: this.getMemoryUsage(),
        animationCount: this.activeAnimations.size,
        isOptimized: this.fps >= 55 && this.frameTime <= 18, // 55+ FPS and <18ms frame time
      };

      this.callbacks.forEach((callback) => callback(metrics));

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.monitor);
  };

  private getMemoryUsage(): number | undefined {
    // @ts-ignore - performance.memory is not in all browsers
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1048576; // Convert to MB
    }
    return undefined;
  }

  getFPS(): number {
    return this.fps;
  }

  getFrameTime(): number {
    return this.frameTime;
  }

  isPerformanceGood(): boolean {
    return this.fps >= 55 && this.frameTime <= 18;
  }
}

/**
 * Device capability detection
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  // @ts-ignore - performance.memory is not in all browsers
  const memoryInfo = performance.memory;
  const memoryLimit = memoryInfo ? memoryInfo.jsHeapSizeLimit / 1048576 : 0; // MB

  return {
    supportsWebGL: !!gl,
    supportsBackdropFilter: CSS.supports("backdrop-filter", "blur(10px)"),
    supportsTransform3d: CSS.supports("transform", "translate3d(0,0,0)"),
    isHighPerformance: navigator.hardwareConcurrency >= 4 && memoryLimit > 1000,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    isMobile:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
    memoryLimit,
  };
}

/**
 * GPU acceleration utilities
 */
export class GPUAccelerationManager {
  private acceleratedElements = new Set<HTMLElement>();
  private observer: MutationObserver | null = null;

  init() {
    this.setupGlobalAcceleration();
    this.observeNewElements();
  }

  private setupGlobalAcceleration() {
    // Add GPU acceleration to commonly animated elements
    const selectors = [
      ".animate-hover-lift",
      ".animate-hover-scale",
      ".animate-scroll-reveal",
      ".animate-scroll-scale",
      "[data-scroll-reveal]",
      "[data-parallax]",
      ".glass-card",
      ".animate-button-hover",
      ".animate-glass-button-hover",
      ".page-transition-content",
      ".route-content",
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        this.accelerateElement(element as HTMLElement);
      });
    });
  }

  accelerateElement(element: HTMLElement) {
    if (this.acceleratedElements.has(element)) return;

    // Apply GPU acceleration hints
    element.style.transform = element.style.transform || "translateZ(0)";
    element.style.backfaceVisibility = "hidden";
    element.style.perspective = "1000px";
    element.style.willChange = "transform, opacity";

    this.acceleratedElements.add(element);

    // Clean up will-change after animations complete
    this.setupCleanup(element);
  }

  private setupCleanup(element: HTMLElement) {
    const cleanupWillChange = () => {
      // Remove will-change after a delay to allow animations to complete
      setTimeout(() => {
        if (element.style.willChange === "transform, opacity") {
          element.style.willChange = "auto";
        }
      }, 1000);
    };

    // Listen for animation end events
    element.addEventListener("animationend", cleanupWillChange);
    element.addEventListener("transitionend", cleanupWillChange);
  }

  private observeNewElements() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // Check if the new element needs acceleration
            if (this.shouldAccelerate(element)) {
              this.accelerateElement(element);
            }

            // Check child elements
            element
              .querySelectorAll(
                ".animate-hover-lift, .animate-hover-scale, .animate-scroll-reveal, .animate-scroll-scale, [data-scroll-reveal], [data-parallax], .glass-card"
              )
              .forEach((child) => {
                this.accelerateElement(child as HTMLElement);
              });
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private shouldAccelerate(element: HTMLElement): boolean {
    const accelerationClasses = [
      "animate-hover-lift",
      "animate-hover-scale",
      "animate-scroll-reveal",
      "animate-scroll-scale",
      "glass-card",
      "animate-button-hover",
      "animate-glass-button-hover",
    ];

    return (
      accelerationClasses.some((className) =>
        element.classList.contains(className)
      ) ||
      element.hasAttribute("data-scroll-reveal") ||
      element.hasAttribute("data-parallax")
    );
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clean up accelerated elements
    this.acceleratedElements.forEach((element) => {
      element.style.willChange = "auto";
    });
    this.acceleratedElements.clear();
  }
}

/**
 * Animation optimization strategies
 */
export class AnimationOptimizer {
  private capabilities: DeviceCapabilities;
  private performanceMonitor: AnimationPerformanceMonitor;
  private gpuManager: GPUAccelerationManager;
  private optimizationLevel: "high" | "medium" | "low" = "high";

  constructor() {
    this.capabilities = detectDeviceCapabilities();
    this.performanceMonitor = new AnimationPerformanceMonitor();
    this.gpuManager = new GPUAccelerationManager();
    this.determineOptimizationLevel();
  }

  private determineOptimizationLevel() {
    if (this.capabilities.prefersReducedMotion) {
      this.optimizationLevel = "low";
    } else if (
      !this.capabilities.isHighPerformance ||
      this.capabilities.isMobile
    ) {
      this.optimizationLevel = "medium";
    } else {
      this.optimizationLevel = "high";
    }
  }

  applyOptimizations() {
    const root = document.documentElement;

    switch (this.optimizationLevel) {
      case "low":
        this.applyLowPerformanceOptimizations(root);
        break;
      case "medium":
        this.applyMediumPerformanceOptimizations(root);
        break;
      case "high":
        this.applyHighPerformanceOptimizations(root);
        break;
    }

    this.applyBrowserSpecificOptimizations(root);

    // Initialize GPU acceleration for high and medium performance
    if (this.optimizationLevel !== "low") {
      this.gpuManager.init();
    }
  }

  private applyLowPerformanceOptimizations(root: HTMLElement) {
    // Disable most animations
    root.style.setProperty("--duration-fast", "0ms");
    root.style.setProperty("--duration-normal", "0ms");
    root.style.setProperty("--duration-slow", "0ms");
    root.classList.add("reduced-motion");

    // Disable complex effects
    root.classList.add("no-glassmorphism");
    root.classList.add("no-parallax");
  }

  private applyMediumPerformanceOptimizations(root: HTMLElement) {
    // Reduce animation durations
    root.style.setProperty("--duration-fast", "100ms");
    root.style.setProperty("--duration-normal", "200ms");
    root.style.setProperty("--duration-slow", "300ms");

    // Reduce blur effects
    root.style.setProperty("--glass-blur", "blur(5px)");
    root.style.setProperty("--glass-blur-heavy", "blur(8px)");

    // Limit stagger delays
    root.style.setProperty("--stagger-delay-1", "50ms");
    root.style.setProperty("--stagger-delay-2", "100ms");
    root.style.setProperty("--stagger-delay-3", "150ms");
  }

  private applyHighPerformanceOptimizations(root: HTMLElement) {
    // Enable all effects with full durations
    root.classList.add("high-performance");

    // Enable GPU acceleration hints
    root.style.setProperty("--enable-gpu-acceleration", "1");
  }

  private applyBrowserSpecificOptimizations(root: HTMLElement) {
    if (!this.capabilities.supportsBackdropFilter) {
      root.classList.add("no-backdrop-filter");
    }

    if (!this.capabilities.supportsWebGL) {
      root.classList.add("no-webgl");
    }

    if (!this.capabilities.supportsTransform3d) {
      root.classList.add("no-transform3d");
    }
  }

  startMonitoring() {
    this.performanceMonitor.start();

    this.performanceMonitor.onMetricsUpdate((metrics) => {
      if (!metrics.isOptimized && this.optimizationLevel === "high") {
        // Downgrade to medium performance if struggling
        this.optimizationLevel = "medium";
        this.applyOptimizations();
        console.warn(
          "Animation performance degraded, applying medium optimizations"
        );
      }
    });
  }

  stopMonitoring() {
    this.performanceMonitor.stop();
  }

  destroy() {
    this.performanceMonitor.stop();
    this.gpuManager.destroy();
  }

  getCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }

  getOptimizationLevel(): string {
    return this.optimizationLevel;
  }
}

/**
 * Animation fallback system
 */
export class AnimationFallbackSystem {
  private fallbacks = new Map<string, string>();

  constructor() {
    this.setupDefaultFallbacks();
  }

  private setupDefaultFallbacks() {
    // Complex animations -> Simple animations
    this.fallbacks.set("animate-scale-in-bounce", "animate-fade-in");
    this.fallbacks.set("animate-slide-in-glass", "animate-fade-in-left");
    this.fallbacks.set("animate-morph-gradient", "animate-pulse");
    this.fallbacks.set("animate-parallax-float", "animate-fade-in");
    this.fallbacks.set("animate-glow-pulse", "animate-pulse");
  }

  addFallback(complex: string, simple: string) {
    this.fallbacks.set(complex, simple);
  }

  applyFallbacks(element: HTMLElement) {
    const classes = Array.from(element.classList);

    classes.forEach((className) => {
      if (this.fallbacks.has(className)) {
        const fallback = this.fallbacks.get(className)!;
        element.classList.remove(className);
        element.classList.add(fallback);
      }
    });
  }

  applyFallbacksToDocument() {
    document.querySelectorAll('[class*="animate-"]').forEach((element) => {
      this.applyFallbacks(element as HTMLElement);
    });
  }
}

/**
 * Global performance manager
 */
export class GlobalPerformanceManager {
  private optimizer: AnimationOptimizer;
  private fallbackSystem: AnimationFallbackSystem;
  private isInitialized = false;

  constructor() {
    this.optimizer = new AnimationOptimizer();
    this.fallbackSystem = new AnimationFallbackSystem();
  }

  init() {
    if (this.isInitialized) return;

    this.optimizer.applyOptimizations();
    this.optimizer.startMonitoring();

    // Apply fallbacks if needed
    const capabilities = this.optimizer.getCapabilities();
    if (!capabilities.isHighPerformance || capabilities.prefersReducedMotion) {
      this.fallbackSystem.applyFallbacksToDocument();
    }

    // Monitor for performance issues
    this.setupPerformanceWatching();

    this.isInitialized = true;
  }

  private setupPerformanceWatching() {
    // Watch for performance issues and apply fallbacks
    let performanceIssueCount = 0;

    this.optimizer["performanceMonitor"].onMetricsUpdate((metrics) => {
      if (!metrics.isOptimized) {
        performanceIssueCount++;

        if (performanceIssueCount >= 3) {
          console.warn(
            "Persistent performance issues detected, applying fallbacks"
          );
          this.fallbackSystem.applyFallbacksToDocument();
          performanceIssueCount = 0;
        }
      } else {
        performanceIssueCount = Math.max(0, performanceIssueCount - 1);
      }
    });
  }

  destroy() {
    this.optimizer.destroy();
    this.isInitialized = false;
  }

  getMetrics() {
    return {
      capabilities: this.optimizer.getCapabilities(),
      optimizationLevel: this.optimizer.getOptimizationLevel(),
      fps: this.optimizer["performanceMonitor"].getFPS(),
      frameTime: this.optimizer["performanceMonitor"].getFrameTime(),
    };
  }
}

// Export singleton instance
export const performanceManager = new GlobalPerformanceManager();

// Auto-initialize
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      performanceManager.init()
    );
  } else {
    performanceManager.init();
  }
}
