// React hook for Adaptive Loading
// Provides reactive state management for adaptive loading functionality

import { useState, useEffect, useCallback } from "react";
import {
  adaptiveLoadingManager,
  DeviceCapabilities,
  LoadingStrategy,
  adaptiveUtils,
} from "../services/adaptiveLoadingManager";

export interface UseAdaptiveLoadingReturn {
  // State
  capabilities: DeviceCapabilities | null;
  strategy: LoadingStrategy | null;
  isInitialized: boolean;
  isLoading: boolean;

  // Device info
  deviceClass: "low-end" | "mid-range" | "high-end" | null;
  isLowEndDevice: boolean;
  isSlowConnection: boolean;
  isBatteryLow: boolean;

  // Strategy helpers
  shouldLoadResource: (resourceType: string, priority: number) => boolean;
  getOptimalImageSize: (originalSize: { width: number; height: number }) => {
    width: number;
    height: number;
  };
  getImageQuality: () => "low" | "medium" | "high";
  getChunkSize: () => "small" | "medium" | "large";

  // Actions
  initialize: () => Promise<void>;
  updateStrategy: (performanceMetrics: any) => void;

  // Feature flags
  shouldEnableFeature: (feature: keyof LoadingStrategy) => boolean;

  // Network & performance
  getRequestTimeout: () => number;
  getMaxConcurrentRequests: () => number;
}

export function useAdaptiveLoading(): UseAdaptiveLoadingReturn {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(
    null
  );
  const [strategy, setStrategy] = useState<LoadingStrategy | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize adaptive loading
  const initialize = useCallback(async () => {
    if (isInitialized || isLoading) return;

    try {
      setIsLoading(true);

      const detectedCapabilities =
        await adaptiveLoadingManager.detectDeviceCapabilities();
      const determinedStrategy =
        adaptiveLoadingManager.determineLoadingStrategy(detectedCapabilities);

      setCapabilities(detectedCapabilities);
      setStrategy(determinedStrategy);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize adaptive loading:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isLoading]);

  // Update strategy based on performance metrics
  const updateStrategy = useCallback(
    (performanceMetrics: any) => {
      if (!strategy) return;

      const updatedStrategy = adaptiveLoadingManager.adjustStrategy(
        strategy,
        performanceMetrics
      );
      setStrategy(updatedStrategy);
    },
    [strategy]
  );

  // Resource loading decision
  const shouldLoadResource = useCallback(
    (resourceType: string, priority: number) => {
      return adaptiveLoadingManager.shouldLoadResource(resourceType, priority);
    },
    []
  );

  // Optimal image size calculation
  const getOptimalImageSize = useCallback(
    (originalSize: { width: number; height: number }) => {
      return adaptiveLoadingManager.getOptimalImageSize(originalSize);
    },
    []
  );

  // Get image quality setting
  const getImageQuality = useCallback(() => {
    return adaptiveUtils.getImageQuality();
  }, []);

  // Get chunk size setting
  const getChunkSize = useCallback(() => {
    return adaptiveUtils.getChunkSize();
  }, []);

  // Feature enablement check
  const shouldEnableFeature = useCallback((feature: keyof LoadingStrategy) => {
    return adaptiveUtils.shouldEnableFeature(feature);
  }, []);

  // Get request timeout
  const getRequestTimeout = useCallback(() => {
    return adaptiveUtils.getRequestTimeout();
  }, []);

  // Get max concurrent requests
  const getMaxConcurrentRequests = useCallback(() => {
    return adaptiveUtils.getMaxConcurrentRequests();
  }, []);

  // Derived state
  const deviceClass = capabilities?.deviceClass || null;
  const isLowEndDevice = capabilities?.isLowEndDevice || false;
  const isSlowConnection = adaptiveLoadingManager.isSlowConnection();
  const isBatteryLow = adaptiveLoadingManager.isBatteryLow();

  // Set up event listeners
  useEffect(() => {
    const handleCapabilitiesDetected = (
      newCapabilities: DeviceCapabilities
    ) => {
      setCapabilities(newCapabilities);
    };

    const handleStrategyDetermined = (newStrategy: LoadingStrategy) => {
      setStrategy(newStrategy);
    };

    const handleStrategyAdjusted = (adjustedStrategy: LoadingStrategy) => {
      setStrategy(adjustedStrategy);
    };

    const handleNetworkChange = () => {
      // Refresh capabilities when network changes
      if (isInitialized) {
        const currentCapabilities =
          adaptiveLoadingManager.getCurrentCapabilities();
        if (currentCapabilities) {
          setCapabilities({ ...currentCapabilities });
        }
      }
    };

    const handleBatteryChange = () => {
      // Refresh capabilities when battery changes
      if (isInitialized) {
        const currentCapabilities =
          adaptiveLoadingManager.getCurrentCapabilities();
        if (currentCapabilities) {
          setCapabilities({ ...currentCapabilities });
        }
      }
    };

    // Add event listeners
    adaptiveLoadingManager.on(
      "capabilitiesDetected",
      handleCapabilitiesDetected
    );
    adaptiveLoadingManager.on("strategyDetermined", handleStrategyDetermined);
    adaptiveLoadingManager.on("strategyAdjusted", handleStrategyAdjusted);
    adaptiveLoadingManager.on("networkChange", handleNetworkChange);
    adaptiveLoadingManager.on("batteryChange", handleBatteryChange);

    // Cleanup
    return () => {
      adaptiveLoadingManager.off(
        "capabilitiesDetected",
        handleCapabilitiesDetected
      );
      adaptiveLoadingManager.off(
        "strategyDetermined",
        handleStrategyDetermined
      );
      adaptiveLoadingManager.off("strategyAdjusted", handleStrategyAdjusted);
      adaptiveLoadingManager.off("networkChange", handleNetworkChange);
      adaptiveLoadingManager.off("batteryChange", handleBatteryChange);
    };
  }, [isInitialized]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    capabilities,
    strategy,
    isInitialized,
    isLoading,
    deviceClass,
    isLowEndDevice,
    isSlowConnection,
    isBatteryLow,
    shouldLoadResource,
    getOptimalImageSize,
    getImageQuality,
    getChunkSize,
    initialize,
    updateStrategy,
    shouldEnableFeature,
    getRequestTimeout,
    getMaxConcurrentRequests,
  };
}

// Hook for network-aware loading
export function useNetworkAwareLoading() {
  const { capabilities, strategy, isSlowConnection, shouldEnableFeature } =
    useAdaptiveLoading();

  const shouldPreload = useCallback(
    (priority: number = 50) => {
      if (isSlowConnection) return priority >= 80;
      return shouldEnableFeature("preloadCriticalResources") && priority >= 50;
    },
    [isSlowConnection, shouldEnableFeature]
  );

  const shouldPrefetch = useCallback(
    (priority: number = 30) => {
      if (isSlowConnection) return false;
      return shouldEnableFeature("prefetchResources") && priority >= 30;
    },
    [isSlowConnection, shouldEnableFeature]
  );

  const getConnectionInfo = useCallback(() => {
    if (!capabilities) return null;

    return {
      type: capabilities.connectionType,
      effectiveType: capabilities.effectiveType,
      downlink: capabilities.downlink,
      rtt: capabilities.rtt,
      saveData: capabilities.saveData,
    };
  }, [capabilities]);

  return {
    connectionInfo: getConnectionInfo(),
    isSlowConnection,
    shouldPreload,
    shouldPrefetch,
    maxConcurrentRequests: strategy?.maxConcurrentRequests || 6,
    requestTimeout: strategy?.requestTimeout || 10000,
  };
}

// Hook for battery-aware optimizations
export function useBatteryAwareLoading() {
  const { capabilities, strategy, isBatteryLow, shouldEnableFeature } =
    useAdaptiveLoading();

  const shouldReduceActivity = useCallback(() => {
    return isBatteryLow || !capabilities?.batteryCharging;
  }, [isBatteryLow, capabilities?.batteryCharging]);

  const shouldEnableBackgroundSync = useCallback(() => {
    if (shouldReduceActivity()) return false;
    return shouldEnableFeature("enableBackgroundSync");
  }, [shouldReduceActivity, shouldEnableFeature]);

  const shouldEnablePushNotifications = useCallback(() => {
    if (shouldReduceActivity()) return false;
    return shouldEnableFeature("enablePushNotifications");
  }, [shouldReduceActivity, shouldEnableFeature]);

  const getAnimationLevel = useCallback(() => {
    if (shouldReduceActivity()) return "reduced";
    return strategy?.animationLevel || "full";
  }, [shouldReduceActivity, strategy?.animationLevel]);

  const getBatteryInfo = useCallback(() => {
    if (!capabilities) return null;

    return {
      level: capabilities.batteryLevel,
      charging: capabilities.batteryCharging,
      isLow: isBatteryLow,
    };
  }, [capabilities, isBatteryLow]);

  return {
    batteryInfo: getBatteryInfo(),
    isBatteryLow,
    shouldReduceActivity: shouldReduceActivity(),
    shouldEnableBackgroundSync: shouldEnableBackgroundSync(),
    shouldEnablePushNotifications: shouldEnablePushNotifications(),
    animationLevel: getAnimationLevel(),
  };
}

// Hook for performance-aware loading
export function usePerformanceAwareLoading() {
  const { capabilities, strategy, isLowEndDevice, updateStrategy } =
    useAdaptiveLoading();

  const [performanceMetrics, setPerformanceMetrics] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    fps: 60,
  });

  // Monitor performance metrics
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        setPerformanceMetrics((prev) => ({
          ...prev,
          fps,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    // Start FPS monitoring
    animationId = requestAnimationFrame(measureFPS);

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        setPerformanceMetrics((prev) => ({
          ...prev,
          memoryUsage,
        }));
      }
    }, 5000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, []);

  // Update strategy when performance changes significantly
  useEffect(() => {
    if (performanceMetrics.memoryUsage > 0.8 || performanceMetrics.fps < 30) {
      updateStrategy(performanceMetrics);
    }
  }, [performanceMetrics, updateStrategy]);

  const getPerformanceInfo = useCallback(() => {
    if (!capabilities) return null;

    return {
      deviceClass: capabilities.deviceClass,
      performanceScore: capabilities.performanceScore,
      memory: capabilities.memory,
      cores: capabilities.cores,
      isLowEnd: isLowEndDevice,
      currentMetrics: performanceMetrics,
    };
  }, [capabilities, isLowEndDevice, performanceMetrics]);

  const shouldOptimizeForPerformance = useCallback(() => {
    return (
      isLowEndDevice ||
      performanceMetrics.memoryUsage > 0.7 ||
      performanceMetrics.fps < 45
    );
  }, [isLowEndDevice, performanceMetrics]);

  return {
    performanceInfo: getPerformanceInfo(),
    performanceMetrics,
    isLowEndDevice,
    shouldOptimizeForPerformance: shouldOptimizeForPerformance(),
    imageQuality: strategy?.imageQuality || "medium",
    animationLevel: strategy?.animationLevel || "full",
    enableAdvancedFeatures: strategy?.enableAdvancedFeatures || true,
  };
}

export default useAdaptiveLoading;
