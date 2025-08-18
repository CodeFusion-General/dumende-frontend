// Adaptive Loading Manager for Mobile Performance Optimization
// Adjusts loading strategies based on device performance, network, and battery

export interface DeviceCapabilities {
  // Hardware capabilities
  memory: number; // GB
  cores: number;
  deviceClass: "low-end" | "mid-range" | "high-end";

  // Network information
  connectionType: "slow-2g" | "2g" | "3g" | "4g" | "5g" | "wifi" | "unknown";
  effectiveType: string;
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;

  // Battery information
  batteryLevel?: number; // 0-1
  batteryCharging?: boolean;

  // Performance metrics
  performanceScore: number; // 0-100
  isLowEndDevice: boolean;
}

export interface LoadingStrategy {
  // Resource loading
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;

  // Quality settings
  imageQuality: "low" | "medium" | "high";
  videoQuality: "low" | "medium" | "high";
  animationLevel: "none" | "reduced" | "full";

  // Preloading
  preloadCriticalResources: boolean;
  preloadNextPage: boolean;
  prefetchResources: boolean;

  // Caching
  aggressiveCaching: boolean;
  cacheImages: boolean;
  cacheAPI: boolean;

  // Features
  enableAdvancedFeatures: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;

  // Performance
  maxConcurrentRequests: number;
  requestTimeout: number;
  chunkSize: "small" | "medium" | "large";
}

export interface AdaptiveLoadingManager {
  // Device detection
  detectDeviceCapabilities(): Promise<DeviceCapabilities>;

  // Strategy determination
  determineLoadingStrategy(capabilities: DeviceCapabilities): LoadingStrategy;

  // Dynamic adjustment
  adjustStrategy(
    currentStrategy: LoadingStrategy,
    performanceMetrics: any
  ): LoadingStrategy;

  // Resource management
  shouldLoadResource(resourceType: string, priority: number): boolean;
  getOptimalImageSize(originalSize: { width: number; height: number }): {
    width: number;
    height: number;
  };

  // Network awareness
  isSlowConnection(): boolean;
  shouldReduceQuality(): boolean;

  // Battery awareness
  isBatteryLow(): boolean;
  shouldReduceBackgroundActivity(): boolean;
}

class AdaptiveLoadingManagerImpl implements AdaptiveLoadingManager {
  private currentCapabilities: DeviceCapabilities | null = null;
  private currentStrategy: LoadingStrategy | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.setupPerformanceMonitoring();
    this.setupNetworkMonitoring();
    this.setupBatteryMonitoring();
  }

  /**
   * Detect device capabilities and performance characteristics
   */
  async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
    const capabilities: DeviceCapabilities = {
      memory: this.getDeviceMemory(),
      cores: this.getCPUCores(),
      deviceClass: "mid-range",
      connectionType: "unknown",
      effectiveType: "unknown",
      downlink: 0,
      rtt: 0,
      saveData: false,
      performanceScore: 50,
      isLowEndDevice: false,
    };

    // Network information
    const networkInfo = this.getNetworkInformation();
    Object.assign(capabilities, networkInfo);

    // Battery information
    const batteryInfo = await this.getBatteryInformation();
    Object.assign(capabilities, batteryInfo);

    // Performance benchmarking
    const performanceScore = await this.benchmarkPerformance();
    capabilities.performanceScore = performanceScore;

    // Device classification
    capabilities.deviceClass = this.classifyDevice(capabilities);
    capabilities.isLowEndDevice = capabilities.deviceClass === "low-end";

    this.currentCapabilities = capabilities;
    this.emit("capabilitiesDetected", capabilities);

    return capabilities;
  }

  /**
   * Determine optimal loading strategy based on device capabilities
   */
  determineLoadingStrategy(capabilities: DeviceCapabilities): LoadingStrategy {
    const strategy: LoadingStrategy = {
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableCodeSplitting: true,
      imageQuality: "medium",
      videoQuality: "medium",
      animationLevel: "full",
      preloadCriticalResources: true,
      preloadNextPage: false,
      prefetchResources: true,
      aggressiveCaching: false,
      cacheImages: true,
      cacheAPI: true,
      enableAdvancedFeatures: true,
      enableBackgroundSync: true,
      enablePushNotifications: true,
      maxConcurrentRequests: 6,
      requestTimeout: 10000,
      chunkSize: "medium",
    };

    // Adjust based on device class
    if (capabilities.deviceClass === "low-end") {
      strategy.imageQuality = "low";
      strategy.videoQuality = "low";
      strategy.animationLevel = "reduced";
      strategy.preloadNextPage = false;
      strategy.prefetchResources = false;
      strategy.enableAdvancedFeatures = false;
      strategy.maxConcurrentRequests = 3;
      strategy.chunkSize = "small";
    } else if (capabilities.deviceClass === "high-end") {
      strategy.imageQuality = "high";
      strategy.videoQuality = "high";
      strategy.preloadNextPage = true;
      strategy.aggressiveCaching = true;
      strategy.maxConcurrentRequests = 8;
      strategy.chunkSize = "large";
    }

    // Adjust based on network conditions
    if (this.isSlowConnection(capabilities)) {
      strategy.imageQuality = "low";
      strategy.videoQuality = "low";
      strategy.preloadNextPage = false;
      strategy.prefetchResources = false;
      strategy.aggressiveCaching = true;
      strategy.maxConcurrentRequests = 2;
      strategy.requestTimeout = 15000;
    }

    // Adjust based on data saver mode
    if (capabilities.saveData) {
      strategy.imageQuality = "low";
      strategy.videoQuality = "low";
      strategy.animationLevel = "reduced";
      strategy.preloadNextPage = false;
      strategy.prefetchResources = false;
      strategy.enableBackgroundSync = false;
    }

    // Adjust based on battery level
    if (this.isBatteryLow(capabilities)) {
      strategy.animationLevel = "reduced";
      strategy.preloadNextPage = false;
      strategy.prefetchResources = false;
      strategy.enableBackgroundSync = false;
      strategy.enablePushNotifications = false;
    }

    this.currentStrategy = strategy;
    this.emit("strategyDetermined", strategy);

    return strategy;
  }

  /**
   * Dynamically adjust strategy based on runtime performance metrics
   */
  adjustStrategy(
    currentStrategy: LoadingStrategy,
    performanceMetrics: any
  ): LoadingStrategy {
    const adjustedStrategy = { ...currentStrategy };

    // Adjust based on memory usage
    if (performanceMetrics.memoryUsage > 0.8) {
      adjustedStrategy.aggressiveCaching = false;
      adjustedStrategy.preloadNextPage = false;
      adjustedStrategy.maxConcurrentRequests = Math.max(
        2,
        adjustedStrategy.maxConcurrentRequests - 2
      );
    }

    // Adjust based on CPU usage
    if (performanceMetrics.cpuUsage > 0.7) {
      adjustedStrategy.animationLevel = "reduced";
      adjustedStrategy.enableAdvancedFeatures = false;
    }

    // Adjust based on network performance
    if (performanceMetrics.networkLatency > 1000) {
      adjustedStrategy.requestTimeout = 20000;
      adjustedStrategy.maxConcurrentRequests = 2;
    }

    // Adjust based on frame rate
    if (performanceMetrics.fps < 30) {
      adjustedStrategy.animationLevel = "reduced";
      adjustedStrategy.imageQuality = "low";
    }

    this.currentStrategy = adjustedStrategy;
    this.emit("strategyAdjusted", adjustedStrategy);

    return adjustedStrategy;
  }

  /**
   * Determine if a resource should be loaded based on current strategy
   */
  shouldLoadResource(resourceType: string, priority: number): boolean {
    if (!this.currentStrategy) return true;

    const strategy = this.currentStrategy;

    // Always load critical resources
    if (priority >= 90) return true;

    // Check resource type specific rules
    switch (resourceType) {
      case "image":
        return strategy.enableImageOptimization;

      case "video":
        return !this.isSlowConnection() && !this.isBatteryLow();

      case "animation":
        return strategy.animationLevel !== "none";

      case "prefetch":
        return strategy.prefetchResources && priority >= 50;

      case "preload":
        return strategy.preloadCriticalResources && priority >= 70;

      default:
        return priority >= 30;
    }
  }

  /**
   * Get optimal image size based on device capabilities
   */
  getOptimalImageSize(originalSize: { width: number; height: number }): {
    width: number;
    height: number;
  } {
    if (!this.currentCapabilities || !this.currentStrategy) {
      return originalSize;
    }

    const { deviceClass } = this.currentCapabilities;
    const { imageQuality } = this.currentStrategy;

    let scaleFactor = 1;

    // Adjust based on device class
    if (deviceClass === "low-end") {
      scaleFactor = 0.5;
    } else if (deviceClass === "mid-range") {
      scaleFactor = 0.75;
    }

    // Adjust based on image quality setting
    if (imageQuality === "low") {
      scaleFactor *= 0.6;
    } else if (imageQuality === "medium") {
      scaleFactor *= 0.8;
    }

    // Adjust based on network conditions
    if (this.isSlowConnection()) {
      scaleFactor *= 0.7;
    }

    return {
      width: Math.round(originalSize.width * scaleFactor),
      height: Math.round(originalSize.height * scaleFactor),
    };
  }

  /**
   * Check if connection is slow
   */
  isSlowConnection(capabilities?: DeviceCapabilities): boolean {
    const caps = capabilities || this.currentCapabilities;
    if (!caps) return false;

    return (
      caps.connectionType === "slow-2g" ||
      caps.connectionType === "2g" ||
      caps.downlink < 1.5 ||
      caps.rtt > 300
    );
  }

  /**
   * Check if quality should be reduced
   */
  shouldReduceQuality(): boolean {
    return (
      this.isSlowConnection() ||
      this.isBatteryLow() ||
      (this.currentCapabilities?.saveData ?? false)
    );
  }

  /**
   * Check if battery is low
   */
  isBatteryLow(capabilities?: DeviceCapabilities): boolean {
    const caps = capabilities || this.currentCapabilities;
    if (!caps || caps.batteryLevel === undefined) return false;

    return caps.batteryLevel < 0.2 && !caps.batteryCharging;
  }

  /**
   * Check if background activity should be reduced
   */
  shouldReduceBackgroundActivity(): boolean {
    return (
      this.isBatteryLow() ||
      this.isSlowConnection() ||
      (this.currentCapabilities?.saveData ?? false)
    );
  }

  /**
   * Get device memory in GB
   */
  private getDeviceMemory(): number {
    // @ts-ignore
    return navigator.deviceMemory || 4; // Default to 4GB
  }

  /**
   * Get CPU core count
   */
  private getCPUCores(): number {
    return navigator.hardwareConcurrency || 4; // Default to 4 cores
  }

  /**
   * Get network information
   */
  private getNetworkInformation(): Partial<DeviceCapabilities> {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) {
      return {
        connectionType: "unknown",
        effectiveType: "unknown",
        downlink: 0,
        rtt: 0,
        saveData: false,
      };
    }

    return {
      connectionType: this.mapConnectionType(connection.effectiveType),
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }

  /**
   * Get battery information
   */
  private async getBatteryInformation(): Promise<Partial<DeviceCapabilities>> {
    try {
      // @ts-ignore
      const battery = await navigator.getBattery?.();

      if (battery) {
        return {
          batteryLevel: battery.level,
          batteryCharging: battery.charging,
        };
      }
    } catch (error) {
      console.warn("Battery API not available:", error);
    }

    return {};
  }

  /**
   * Benchmark device performance
   */
  private async benchmarkPerformance(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let iterations = 0;
      const maxTime = 100; // 100ms benchmark

      const benchmark = () => {
        const currentTime = performance.now();

        if (currentTime - startTime < maxTime) {
          // Simple CPU-intensive task
          for (let i = 0; i < 10000; i++) {
            Math.random() * Math.random();
          }
          iterations++;
          requestAnimationFrame(benchmark);
        } else {
          // Calculate performance score (0-100)
          const score = Math.min(100, (iterations / 100) * 100);
          resolve(score);
        }
      };

      requestAnimationFrame(benchmark);
    });
  }

  /**
   * Classify device based on capabilities
   */
  private classifyDevice(
    capabilities: DeviceCapabilities
  ): "low-end" | "mid-range" | "high-end" {
    let score = 0;

    // Memory score (0-30 points)
    if (capabilities.memory >= 8) score += 30;
    else if (capabilities.memory >= 4) score += 20;
    else if (capabilities.memory >= 2) score += 10;

    // CPU score (0-25 points)
    if (capabilities.cores >= 8) score += 25;
    else if (capabilities.cores >= 4) score += 15;
    else if (capabilities.cores >= 2) score += 10;

    // Performance score (0-25 points)
    score += (capabilities.performanceScore / 100) * 25;

    // Network score (0-20 points)
    if (
      capabilities.connectionType === "5g" ||
      capabilities.connectionType === "wifi"
    )
      score += 20;
    else if (capabilities.connectionType === "4g") score += 15;
    else if (capabilities.connectionType === "3g") score += 10;

    if (score >= 70) return "high-end";
    if (score >= 40) return "mid-range";
    return "low-end";
  }

  /**
   * Map connection effective type to our enum
   */
  private mapConnectionType(
    effectiveType: string
  ): DeviceCapabilities["connectionType"] {
    switch (effectiveType) {
      case "slow-2g":
        return "slow-2g";
      case "2g":
        return "2g";
      case "3g":
        return "3g";
      case "4g":
        return "4g";
      default:
        return "unknown";
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if ("PerformanceObserver" in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          this.handlePerformanceEntries(entries);
        });

        this.performanceObserver.observe({
          entryTypes: ["navigation", "resource", "measure", "paint"],
        });
      } catch (error) {
        console.warn("Performance Observer not supported:", error);
      }
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    const connection = (navigator as any).connection;

    if (connection) {
      connection.addEventListener("change", () => {
        this.handleNetworkChange();
      });
    }
  }

  /**
   * Setup battery monitoring
   */
  private setupBatteryMonitoring(): void {
    // @ts-ignore
    navigator
      .getBattery?.()
      .then((battery: any) => {
        battery.addEventListener("levelchange", () => {
          this.handleBatteryChange();
        });

        battery.addEventListener("chargingchange", () => {
          this.handleBatteryChange();
        });
      })
      .catch(() => {
        // Battery API not supported
      });
  }

  /**
   * Handle performance entries
   */
  private handlePerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach((entry) => {
      if (entry.entryType === "navigation") {
        this.emit("navigationTiming", entry);
      } else if (entry.entryType === "resource") {
        this.emit("resourceTiming", entry);
      }
    });
  }

  /**
   * Handle network changes
   */
  private handleNetworkChange(): void {
    if (this.currentCapabilities) {
      const networkInfo = this.getNetworkInformation();
      Object.assign(this.currentCapabilities, networkInfo);

      if (this.currentStrategy) {
        this.currentStrategy = this.determineLoadingStrategy(
          this.currentCapabilities
        );
      }

      this.emit("networkChange", networkInfo);
    }
  }

  /**
   * Handle battery changes
   */
  private handleBatteryChange(): void {
    this.getBatteryInformation().then((batteryInfo) => {
      if (this.currentCapabilities) {
        Object.assign(this.currentCapabilities, batteryInfo);

        if (this.currentStrategy) {
          this.currentStrategy = this.determineLoadingStrategy(
            this.currentCapabilities
          );
        }

        this.emit("batteryChange", batteryInfo);
      }
    });
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
            `Error in adaptive loading event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Get current capabilities
   */
  getCurrentCapabilities(): DeviceCapabilities | null {
    return this.currentCapabilities;
  }

  /**
   * Get current strategy
   */
  getCurrentStrategy(): LoadingStrategy | null {
    return this.currentStrategy;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    this.listeners.clear();
    this.currentCapabilities = null;
    this.currentStrategy = null;
  }
}

// Singleton instance
export const adaptiveLoadingManager = new AdaptiveLoadingManagerImpl();

// Utility functions
export const adaptiveUtils = {
  /**
   * Initialize adaptive loading with automatic detection
   */
  async initialize(): Promise<LoadingStrategy> {
    const capabilities =
      await adaptiveLoadingManager.detectDeviceCapabilities();
    return adaptiveLoadingManager.determineLoadingStrategy(capabilities);
  },

  /**
   * Get recommended image quality
   */
  getImageQuality(): "low" | "medium" | "high" {
    const strategy = adaptiveLoadingManager.getCurrentStrategy();
    return strategy?.imageQuality || "medium";
  },

  /**
   * Get recommended chunk size for code splitting
   */
  getChunkSize(): "small" | "medium" | "large" {
    const strategy = adaptiveLoadingManager.getCurrentStrategy();
    return strategy?.chunkSize || "medium";
  },

  /**
   * Check if feature should be enabled
   */
  shouldEnableFeature(feature: keyof LoadingStrategy): boolean {
    const strategy = adaptiveLoadingManager.getCurrentStrategy();
    return (strategy?.[feature] as boolean) || false;
  },

  /**
   * Get optimal request timeout
   */
  getRequestTimeout(): number {
    const strategy = adaptiveLoadingManager.getCurrentStrategy();
    return strategy?.requestTimeout || 10000;
  },

  /**
   * Get max concurrent requests
   */
  getMaxConcurrentRequests(): number {
    const strategy = adaptiveLoadingManager.getCurrentStrategy();
    return strategy?.maxConcurrentRequests || 6;
  },
};

export default adaptiveLoadingManager;
