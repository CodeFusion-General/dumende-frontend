// Low-End Device Optimizer for Mobile Performance
// Implements reduced functionality mode and memory-conscious optimizations

export interface LowEndOptimizations {
  // UI simplifications
  enableSimplifiedUI: boolean;
  reduceAnimations: boolean;
  limitImageQuality: boolean;
  disableNonEssentialFeatures: boolean;

  // Memory management
  enableMemoryOptimization: boolean;
  limitConcurrentComponents: boolean;
  enableComponentUnloading: boolean;
  reduceImageCache: boolean;

  // Performance constraints
  maxComponentsPerPage: number;
  imageQualityReduction: number; // 0-1 scale
  animationDuration: number; // ms
  debounceDelay: number; // ms

  // Feature flags
  disableVideoAutoplay: boolean;
  disableParallax: boolean;
  disableComplexTransitions: boolean;
  disableBackgroundProcessing: boolean;

  // Resource limits
  maxImageSize: { width: number; height: number };
  maxCacheSize: number; // MB
  requestTimeout: number; // ms
  maxRetries: number;
}

export interface ComponentLoadingStrategy {
  // Loading priorities
  critical: string[];
  important: string[];
  optional: string[];
  disabled: string[];

  // Loading behavior
  loadOnDemand: boolean;
  preloadCritical: boolean;
  deferOptional: boolean;
  unloadInactive: boolean;

  // Memory thresholds
  memoryWarningThreshold: number; // 0-1
  memoryCriticalThreshold: number; // 0-1
  componentUnloadThreshold: number; // 0-1
}

export interface LowEndDeviceOptimizer {
  // Device detection
  isLowEndDevice(): boolean;
  getDeviceConstraints(): LowEndOptimizations;

  // Component management
  shouldLoadComponent(componentName: string, priority: number): boolean;
  getComponentLoadingStrategy(): ComponentLoadingStrategy;
  unloadInactiveComponents(): Promise<void>;

  // Memory management
  monitorMemoryUsage(): void;
  optimizeMemoryUsage(): Promise<void>;
  clearNonEssentialCache(): Promise<void>;

  // UI optimization
  getSimplifiedUIConfig(): any;
  shouldUseSimplifiedComponent(componentName: string): boolean;

  // Performance monitoring
  trackPerformanceMetrics(): void;
  adjustOptimizationsBasedOnPerformance(): void;
}

class LowEndDeviceOptimizerImpl implements LowEndDeviceOptimizer {
  private optimizations: LowEndOptimizations;
  private loadingStrategy: ComponentLoadingStrategy;
  private loadedComponents: Set<string> = new Set();
  private memoryMonitorInterval: number | null = null;
  private performanceMetrics: any = {};
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.optimizations = this.getDefaultOptimizations();
    this.loadingStrategy = this.getDefaultLoadingStrategy();
    this.initializeOptimizations();
  }

  /**
   * Detect if current device is low-end
   */
  isLowEndDevice(): boolean {
    // Check device memory
    const deviceMemory = (navigator as any).deviceMemory || 4;
    if (deviceMemory <= 2) return true;

    // Check CPU cores
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return true;

    // Check connection speed
    const connection = (navigator as any).connection;
    if (connection) {
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        return true;
      }
      if (connection.downlink < 1.5) return true;
    }

    // Check if running on older mobile browsers
    const userAgent = navigator.userAgent.toLowerCase();
    const isOldAndroid = /android [1-4]/.test(userAgent);
    const isOldIOS = /os [1-9]_/.test(userAgent);

    if (isOldAndroid || isOldIOS) return true;

    // Check performance score if available
    if (this.performanceMetrics.score && this.performanceMetrics.score < 40) {
      return true;
    }

    return false;
  }

  /**
   * Get device-specific optimization constraints
   */
  getDeviceConstraints(): LowEndOptimizations {
    if (!this.isLowEndDevice()) {
      return this.getDefaultOptimizations();
    }

    const deviceMemory = (navigator as any).deviceMemory || 2;
    const connection = (navigator as any).connection;

    // Adjust optimizations based on device capabilities
    const constraints: LowEndOptimizations = {
      ...this.optimizations,
      enableSimplifiedUI: true,
      reduceAnimations: true,
      limitImageQuality: true,
      disableNonEssentialFeatures: true,
      enableMemoryOptimization: true,
      limitConcurrentComponents: true,
      enableComponentUnloading: true,
      reduceImageCache: true,
      maxComponentsPerPage: deviceMemory <= 1 ? 3 : 5,
      imageQualityReduction: deviceMemory <= 1 ? 0.3 : 0.5,
      animationDuration: 150, // Reduced from default 300ms
      debounceDelay: 300, // Increased for slower devices
      disableVideoAutoplay: true,
      disableParallax: true,
      disableComplexTransitions: true,
      disableBackgroundProcessing: true,
      maxImageSize: {
        width: deviceMemory <= 1 ? 400 : 600,
        height: deviceMemory <= 1 ? 300 : 450,
      },
      maxCacheSize: deviceMemory <= 1 ? 5 : 10, // MB
      requestTimeout: connection?.effectiveType === "2g" ? 15000 : 10000,
      maxRetries: 2,
    };

    this.optimizations = constraints;
    this.emit("constraintsUpdated", constraints);

    return constraints;
  }

  /**
   * Determine if a component should be loaded
   */
  shouldLoadComponent(componentName: string, priority: number): boolean {
    const strategy = this.loadingStrategy;

    // Always load critical components
    if (strategy.critical.includes(componentName) || priority >= 90) {
      return true;
    }

    // Never load disabled components
    if (strategy.disabled.includes(componentName)) {
      return false;
    }

    // Check memory constraints
    if (this.isMemoryConstrained()) {
      // Only load important components when memory is constrained
      return strategy.important.includes(componentName) && priority >= 70;
    }

    // Check component limit
    if (this.loadedComponents.size >= this.optimizations.maxComponentsPerPage) {
      return (
        strategy.critical.includes(componentName) ||
        strategy.important.includes(componentName)
      );
    }

    // Load based on priority and strategy
    if (strategy.important.includes(componentName)) {
      return priority >= 50;
    }

    if (strategy.optional.includes(componentName)) {
      return priority >= 30 && !this.isLowEndDevice();
    }

    return priority >= 60;
  }

  /**
   * Get component loading strategy for low-end devices
   */
  getComponentLoadingStrategy(): ComponentLoadingStrategy {
    if (!this.isLowEndDevice()) {
      return this.getDefaultLoadingStrategy();
    }

    const strategy: ComponentLoadingStrategy = {
      critical: ["Header", "Navigation", "Hero", "SearchForm", "ErrorBoundary"],
      important: ["FeaturedBoats", "BoatCard", "BookingForm", "UserProfile"],
      optional: ["Testimonials", "Newsletter", "SocialMedia", "Analytics"],
      disabled: [
        "ParallaxSection",
        "VideoBackground",
        "ComplexAnimations",
        "NonEssentialWidgets",
        "ThirdPartyIntegrations",
      ],
      loadOnDemand: true,
      preloadCritical: false, // Disabled for low-end devices
      deferOptional: true,
      unloadInactive: true,
      memoryWarningThreshold: 0.7,
      memoryCriticalThreshold: 0.85,
      componentUnloadThreshold: 0.8,
    };

    this.loadingStrategy = strategy;
    return strategy;
  }

  /**
   * Unload inactive components to free memory
   */
  async unloadInactiveComponents(): Promise<void> {
    if (!this.loadingStrategy.unloadInactive) return;

    const inactiveComponents = Array.from(this.loadedComponents).filter(
      (component) => {
        // Check if component is currently visible or recently used
        return !this.isComponentActive(component);
      }
    );

    for (const component of inactiveComponents) {
      try {
        await this.unloadComponent(component);
        this.loadedComponents.delete(component);
        console.log(
          `[Low-End Optimizer] Unloaded inactive component: ${component}`
        );
      } catch (error) {
        console.error(
          `[Low-End Optimizer] Failed to unload component ${component}:`,
          error
        );
      }
    }

    this.emit("componentsUnloaded", inactiveComponents);
  }

  /**
   * Monitor memory usage and trigger optimizations
   */
  monitorMemoryUsage(): void {
    if (this.memoryMonitorInterval) return;

    this.memoryMonitorInterval = window.setInterval(() => {
      const memoryInfo = this.getMemoryInfo();

      if (memoryInfo.usage > this.loadingStrategy.memoryCriticalThreshold) {
        console.warn("[Low-End Optimizer] Critical memory usage detected");
        this.handleCriticalMemoryUsage();
      } else if (
        memoryInfo.usage > this.loadingStrategy.memoryWarningThreshold
      ) {
        console.warn("[Low-End Optimizer] High memory usage detected");
        this.handleHighMemoryUsage();
      }

      this.emit("memoryUsageUpdate", memoryInfo);
    }, 5000); // Check every 5 seconds
  }

  /**
   * Optimize memory usage by clearing caches and unloading components
   */
  async optimizeMemoryUsage(): Promise<void> {
    console.log("[Low-End Optimizer] Starting memory optimization...");

    // Clear non-essential caches
    await this.clearNonEssentialCache();

    // Unload inactive components
    await this.unloadInactiveComponents();

    // Force garbage collection if available
    if ("gc" in window && typeof (window as any).gc === "function") {
      (window as any).gc();
    }

    // Reduce image cache size
    if (this.optimizations.reduceImageCache) {
      await this.reduceImageCache();
    }

    this.emit("memoryOptimized");
  }

  /**
   * Clear non-essential cache data
   */
  async clearNonEssentialCache(): Promise<void> {
    try {
      // Clear old cache entries
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        if (
          cacheName.includes("optional") ||
          cacheName.includes("low-priority")
        ) {
          await caches.delete(cacheName);
          console.log(`[Low-End Optimizer] Cleared cache: ${cacheName}`);
        }
      }

      // Clear browser storage for non-essential data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("cache") || key.includes("temp"))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("[Low-End Optimizer] Failed to clear cache:", error);
    }
  }

  /**
   * Get simplified UI configuration for low-end devices
   */
  getSimplifiedUIConfig(): any {
    if (!this.isLowEndDevice()) {
      return {};
    }

    return {
      // Reduce visual complexity
      disableGradients: true,
      disableShadows: true,
      disableBlur: true,
      disableTransparency: true,

      // Simplify animations
      reduceAnimationDuration: true,
      disableComplexAnimations: true,
      disableParallax: true,

      // Optimize images
      reduceImageQuality: true,
      disableImageFilters: true,
      limitImageSize: true,

      // Simplify layout
      useSimpleGrid: true,
      reduceWhitespace: true,
      simplifyTypography: true,

      // Performance settings
      debounceUserInput: true,
      throttleScrollEvents: true,
      limitConcurrentRequests: true,
    };
  }

  /**
   * Check if simplified component variant should be used
   */
  shouldUseSimplifiedComponent(componentName: string): boolean {
    if (!this.optimizations.enableSimplifiedUI) return false;

    const simplifiedComponents = [
      "Testimonials",
      "ImageGallery",
      "VideoPlayer",
      "MapComponent",
      "ChartComponent",
      "AnimatedSection",
    ];

    return simplifiedComponents.includes(componentName);
  }

  /**
   * Track performance metrics for optimization decisions
   */
  trackPerformanceMetrics(): void {
    // Track FPS
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.performanceMetrics.fps = fps;

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Track memory usage
    setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      this.performanceMetrics.memoryUsage = memoryInfo.usage;
    }, 2000);

    // Track loading times
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "navigation") {
            this.performanceMetrics.loadTime = entry.duration;
          }
        });
      });

      observer.observe({ entryTypes: ["navigation"] });
    }
  }

  /**
   * Adjust optimizations based on current performance
   */
  adjustOptimizationsBasedOnPerformance(): void {
    const { fps, memoryUsage, loadTime } = this.performanceMetrics;

    // Adjust based on FPS
    if (fps && fps < 30) {
      this.optimizations.reduceAnimations = true;
      this.optimizations.animationDuration = Math.min(
        100,
        this.optimizations.animationDuration
      );
      this.optimizations.disableComplexTransitions = true;
    }

    // Adjust based on memory usage
    if (memoryUsage && memoryUsage > 0.8) {
      this.optimizations.enableComponentUnloading = true;
      this.optimizations.maxComponentsPerPage = Math.max(
        2,
        this.optimizations.maxComponentsPerPage - 1
      );
      this.optimizations.reduceImageCache = true;
    }

    // Adjust based on load time
    if (loadTime && loadTime > 5000) {
      this.optimizations.limitImageQuality = true;
      this.optimizations.imageQualityReduction = Math.max(
        0.2,
        this.optimizations.imageQualityReduction - 0.1
      );
      this.optimizations.disableNonEssentialFeatures = true;
    }

    this.emit("optimizationsAdjusted", this.optimizations);
  }

  /**
   * Initialize optimizations based on device detection
   */
  private initializeOptimizations(): void {
    if (this.isLowEndDevice()) {
      this.getDeviceConstraints();
      this.getComponentLoadingStrategy();
      this.monitorMemoryUsage();
      this.trackPerformanceMetrics();

      console.log(
        "[Low-End Optimizer] Low-end device detected, optimizations enabled"
      );
    }
  }

  /**
   * Get default optimizations for normal devices
   */
  private getDefaultOptimizations(): LowEndOptimizations {
    return {
      enableSimplifiedUI: false,
      reduceAnimations: false,
      limitImageQuality: false,
      disableNonEssentialFeatures: false,
      enableMemoryOptimization: false,
      limitConcurrentComponents: false,
      enableComponentUnloading: false,
      reduceImageCache: false,
      maxComponentsPerPage: 10,
      imageQualityReduction: 0.8,
      animationDuration: 300,
      debounceDelay: 150,
      disableVideoAutoplay: false,
      disableParallax: false,
      disableComplexTransitions: false,
      disableBackgroundProcessing: false,
      maxImageSize: { width: 1200, height: 800 },
      maxCacheSize: 50,
      requestTimeout: 10000,
      maxRetries: 3,
    };
  }

  /**
   * Get default loading strategy for normal devices
   */
  private getDefaultLoadingStrategy(): ComponentLoadingStrategy {
    return {
      critical: ["Header", "Navigation", "ErrorBoundary"],
      important: ["Hero", "FeaturedBoats", "SearchForm"],
      optional: ["Testimonials", "Newsletter", "Analytics"],
      disabled: [],
      loadOnDemand: false,
      preloadCritical: true,
      deferOptional: false,
      unloadInactive: false,
      memoryWarningThreshold: 0.8,
      memoryCriticalThreshold: 0.9,
      componentUnloadThreshold: 0.85,
    };
  }

  /**
   * Check if memory is constrained
   */
  private isMemoryConstrained(): boolean {
    const memoryInfo = this.getMemoryInfo();
    return memoryInfo.usage > this.loadingStrategy.memoryWarningThreshold;
  }

  /**
   * Get current memory information
   */
  private getMemoryInfo(): { usage: number; used: number; total: number } {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
      };
    }

    return { usage: 0, used: 0, total: 0 };
  }

  /**
   * Check if component is currently active
   */
  private isComponentActive(componentName: string): boolean {
    // Simple heuristic - check if component is in viewport or recently interacted with
    const element = document.querySelector(
      `[data-component="${componentName}"]`
    );

    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    return isVisible;
  }

  /**
   * Unload a specific component
   */
  private async unloadComponent(componentName: string): Promise<void> {
    // Implementation would depend on the specific component system
    // This is a placeholder for the actual unloading logic
    const element = document.querySelector(
      `[data-component="${componentName}"]`
    );
    if (element) {
      element.remove();
    }
  }

  /**
   * Handle critical memory usage
   */
  private handleCriticalMemoryUsage(): void {
    console.error(
      "[Low-End Optimizer] Critical memory usage - emergency cleanup"
    );

    // Immediate actions for critical memory usage
    this.clearNonEssentialCache();
    this.unloadInactiveComponents();

    // Reduce quality settings
    this.optimizations.imageQualityReduction = Math.max(
      0.2,
      this.optimizations.imageQualityReduction - 0.2
    );
    this.optimizations.maxComponentsPerPage = Math.max(
      2,
      this.optimizations.maxComponentsPerPage - 2
    );

    this.emit("criticalMemoryUsage");
  }

  /**
   * Handle high memory usage
   */
  private handleHighMemoryUsage(): void {
    console.warn("[Low-End Optimizer] High memory usage - preventive cleanup");

    // Preventive actions for high memory usage
    this.unloadInactiveComponents();

    this.emit("highMemoryUsage");
  }

  /**
   * Reduce image cache size
   */
  private async reduceImageCache(): Promise<void> {
    try {
      const cache = await caches.open("image-cache");
      const requests = await cache.keys();

      // Remove oldest 50% of cached images
      const toRemove = requests.slice(0, Math.floor(requests.length / 2));

      for (const request of toRemove) {
        await cache.delete(request);
      }

      console.log(
        `[Low-End Optimizer] Reduced image cache by ${toRemove.length} items`
      );
    } catch (error) {
      console.error("[Low-End Optimizer] Failed to reduce image cache:", error);
    }
  }

  /**
   * Event emitter functionality
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in low-end optimizer event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }

    this.listeners.clear();
    this.loadedComponents.clear();
  }
}

// Singleton instance
export const lowEndDeviceOptimizer = new LowEndDeviceOptimizerImpl();

// Utility functions
export const lowEndUtils = {
  /**
   * Check if device needs low-end optimizations
   */
  needsOptimization(): boolean {
    return lowEndDeviceOptimizer.isLowEndDevice();
  },

  /**
   * Get simplified component props
   */
  getSimplifiedProps(componentName: string, originalProps: any): any {
    if (!lowEndDeviceOptimizer.shouldUseSimplifiedComponent(componentName)) {
      return originalProps;
    }

    const config = lowEndDeviceOptimizer.getSimplifiedUIConfig();

    return {
      ...originalProps,
      // Apply simplifications based on config
      disableAnimations: config.disableComplexAnimations,
      reduceQuality: config.reduceImageQuality,
      simplifyLayout: config.useSimpleGrid,
    };
  },

  /**
   * Get memory-optimized image props
   */
  getOptimizedImageProps(originalProps: any): any {
    const constraints = lowEndDeviceOptimizer.getDeviceConstraints();

    if (!constraints.limitImageQuality) {
      return originalProps;
    }

    return {
      ...originalProps,
      quality: Math.round(
        (originalProps.quality || 80) * constraints.imageQualityReduction
      ),
      maxWidth: Math.min(
        originalProps.maxWidth || Infinity,
        constraints.maxImageSize.width
      ),
      maxHeight: Math.min(
        originalProps.maxHeight || Infinity,
        constraints.maxImageSize.height
      ),
      loading: "lazy", // Force lazy loading
    };
  },

  /**
   * Check if feature should be disabled
   */
  shouldDisableFeature(featureName: string): boolean {
    const constraints = lowEndDeviceOptimizer.getDeviceConstraints();

    switch (featureName) {
      case "video-autoplay":
        return constraints.disableVideoAutoplay;
      case "parallax":
        return constraints.disableParallax;
      case "complex-transitions":
        return constraints.disableComplexTransitions;
      case "background-processing":
        return constraints.disableBackgroundProcessing;
      default:
        return constraints.disableNonEssentialFeatures;
    }
  },
};

export default lowEndDeviceOptimizer;
