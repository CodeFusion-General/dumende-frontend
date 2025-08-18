// React hook for Low-End Device Optimization
// Provides reactive state management for low-end device optimizations

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  lowEndDeviceOptimizer,
  LowEndOptimizations,
  ComponentLoadingStrategy,
  lowEndUtils,
} from "../services/lowEndDeviceOptimizer";

export interface UseLowEndOptimizationReturn {
  // Device state
  isLowEndDevice: boolean;
  optimizations: LowEndOptimizations;
  loadingStrategy: ComponentLoadingStrategy;

  // Memory management
  memoryUsage: number;
  isMemoryConstrained: boolean;

  // Component management
  shouldLoadComponent: (componentName: string, priority: number) => boolean;
  shouldUseSimplifiedComponent: (componentName: string) => boolean;
  getSimplifiedProps: (componentName: string, originalProps: any) => any;

  // UI optimization
  simplifiedUIConfig: any;
  shouldDisableFeature: (featureName: string) => boolean;
  getOptimizedImageProps: (originalProps: any) => any;

  // Actions
  optimizeMemory: () => Promise<void>;
  unloadInactiveComponents: () => Promise<void>;
  clearCache: () => Promise<void>;

  // Performance metrics
  performanceMetrics: {
    fps: number;
    memoryUsage: number;
    loadTime: number;
  };
}

export function useLowEndOptimization(): UseLowEndOptimizationReturn {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [optimizations, setOptimizations] =
    useState<LowEndOptimizations | null>(null);
  const [loadingStrategy, setLoadingStrategy] =
    useState<ComponentLoadingStrategy | null>(null);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
  });

  // Initialize optimization state
  useEffect(() => {
    const isLowEnd = lowEndDeviceOptimizer.isLowEndDevice();
    setIsLowEndDevice(isLowEnd);

    if (isLowEnd) {
      const constraints = lowEndDeviceOptimizer.getDeviceConstraints();
      const strategy = lowEndDeviceOptimizer.getComponentLoadingStrategy();

      setOptimizations(constraints);
      setLoadingStrategy(strategy);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleConstraintsUpdated = (newConstraints: LowEndOptimizations) => {
      setOptimizations(newConstraints);
    };

    const handleMemoryUsageUpdate = (memoryInfo: any) => {
      setMemoryUsage(memoryInfo.usage);
      setPerformanceMetrics((prev) => ({
        ...prev,
        memoryUsage: memoryInfo.usage,
      }));
    };

    const handleOptimizationsAdjusted = (
      newOptimizations: LowEndOptimizations
    ) => {
      setOptimizations(newOptimizations);
    };

    // Add event listeners
    lowEndDeviceOptimizer.on("constraintsUpdated", handleConstraintsUpdated);
    lowEndDeviceOptimizer.on("memoryUsageUpdate", handleMemoryUsageUpdate);
    lowEndDeviceOptimizer.on(
      "optimizationsAdjusted",
      handleOptimizationsAdjusted
    );

    // Cleanup
    return () => {
      lowEndDeviceOptimizer.off("constraintsUpdated", handleConstraintsUpdated);
      lowEndDeviceOptimizer.off("memoryUsageUpdate", handleMemoryUsageUpdate);
      lowEndDeviceOptimizer.off(
        "optimizationsAdjusted",
        handleOptimizationsAdjusted
      );
    };
  }, []);

  // Component loading decision
  const shouldLoadComponent = useCallback(
    (componentName: string, priority: number) => {
      return lowEndDeviceOptimizer.shouldLoadComponent(componentName, priority);
    },
    []
  );

  // Simplified component check
  const shouldUseSimplifiedComponent = useCallback((componentName: string) => {
    return lowEndDeviceOptimizer.shouldUseSimplifiedComponent(componentName);
  }, []);

  // Get simplified props
  const getSimplifiedProps = useCallback(
    (componentName: string, originalProps: any) => {
      return lowEndUtils.getSimplifiedProps(componentName, originalProps);
    },
    []
  );

  // Feature disable check
  const shouldDisableFeature = useCallback((featureName: string) => {
    return lowEndUtils.shouldDisableFeature(featureName);
  }, []);

  // Optimized image props
  const getOptimizedImageProps = useCallback((originalProps: any) => {
    return lowEndUtils.getOptimizedImageProps(originalProps);
  }, []);

  // Memory optimization
  const optimizeMemory = useCallback(async () => {
    await lowEndDeviceOptimizer.optimizeMemoryUsage();
  }, []);

  // Unload inactive components
  const unloadInactiveComponents = useCallback(async () => {
    await lowEndDeviceOptimizer.unloadInactiveComponents();
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    await lowEndDeviceOptimizer.clearNonEssentialCache();
  }, []);

  // Memoized values
  const simplifiedUIConfig = useMemo(() => {
    return lowEndDeviceOptimizer.getSimplifiedUIConfig();
  }, [optimizations]);

  const isMemoryConstrained = useMemo(() => {
    return memoryUsage > (loadingStrategy?.memoryWarningThreshold || 0.8);
  }, [memoryUsage, loadingStrategy]);

  // Default values for non-low-end devices
  const defaultOptimizations: LowEndOptimizations = useMemo(
    () => ({
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
    }),
    []
  );

  const defaultLoadingStrategy: ComponentLoadingStrategy = useMemo(
    () => ({
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
    }),
    []
  );

  return {
    isLowEndDevice,
    optimizations: optimizations || defaultOptimizations,
    loadingStrategy: loadingStrategy || defaultLoadingStrategy,
    memoryUsage,
    isMemoryConstrained,
    shouldLoadComponent,
    shouldUseSimplifiedComponent,
    getSimplifiedProps,
    simplifiedUIConfig,
    shouldDisableFeature,
    getOptimizedImageProps,
    optimizeMemory,
    unloadInactiveComponents,
    clearCache,
    performanceMetrics,
  };
}

// Hook for simplified UI components
export function useSimplifiedUI(componentName: string) {
  const {
    isLowEndDevice,
    shouldUseSimplifiedComponent,
    simplifiedUIConfig,
    getSimplifiedProps,
  } = useLowEndOptimization();

  const shouldSimplify = shouldUseSimplifiedComponent(componentName);

  const getProps = useCallback(
    (originalProps: any) => {
      if (!shouldSimplify) return originalProps;
      return getSimplifiedProps(componentName, originalProps);
    },
    [shouldSimplify, getSimplifiedProps, componentName]
  );

  return {
    isLowEndDevice,
    shouldSimplify,
    config: simplifiedUIConfig,
    getProps,
  };
}

// Hook for memory-conscious component loading
export function useMemoryConsciousLoading() {
  const {
    isLowEndDevice,
    memoryUsage,
    isMemoryConstrained,
    shouldLoadComponent,
    optimizeMemory,
    unloadInactiveComponents,
    loadingStrategy,
  } = useLowEndOptimization();

  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(
    new Set()
  );

  const loadComponent = useCallback(
    (componentName: string, priority: number = 50) => {
      if (shouldLoadComponent(componentName, priority)) {
        setLoadedComponents((prev) => new Set([...prev, componentName]));
        return true;
      }
      return false;
    },
    [shouldLoadComponent]
  );

  const unloadComponent = useCallback((componentName: string) => {
    setLoadedComponents((prev) => {
      const newSet = new Set(prev);
      newSet.delete(componentName);
      return newSet;
    });
  }, []);

  const canLoadMoreComponents = useMemo(() => {
    return (
      loadedComponents.size <
      (loadingStrategy?.critical.length || 10) + (isMemoryConstrained ? 0 : 5)
    );
  }, [loadedComponents.size, loadingStrategy, isMemoryConstrained]);

  // Auto-optimize when memory is constrained
  useEffect(() => {
    if (isMemoryConstrained && isLowEndDevice) {
      optimizeMemory();
    }
  }, [isMemoryConstrained, isLowEndDevice, optimizeMemory]);

  return {
    isLowEndDevice,
    memoryUsage,
    isMemoryConstrained,
    loadedComponents: Array.from(loadedComponents),
    canLoadMoreComponents,
    loadComponent,
    unloadComponent,
    optimizeMemory,
    unloadInactiveComponents,
  };
}

// Hook for performance-aware features
export function usePerformanceAwareFeatures() {
  const {
    isLowEndDevice,
    shouldDisableFeature,
    optimizations,
    performanceMetrics,
  } = useLowEndOptimization();

  const featureFlags = useMemo(
    () => ({
      enableAnimations: !shouldDisableFeature("complex-transitions"),
      enableVideoAutoplay: !shouldDisableFeature("video-autoplay"),
      enableParallax: !shouldDisableFeature("parallax"),
      enableBackgroundProcessing: !shouldDisableFeature(
        "background-processing"
      ),
      enableAdvancedFeatures: !optimizations.disableNonEssentialFeatures,
    }),
    [shouldDisableFeature, optimizations]
  );

  const animationConfig = useMemo(
    () => ({
      duration: optimizations.animationDuration,
      easing: "ease-out",
      reduce: optimizations.reduceAnimations,
    }),
    [optimizations]
  );

  const imageConfig = useMemo(
    () => ({
      quality: Math.round(80 * optimizations.imageQualityReduction),
      maxWidth: optimizations.maxImageSize.width,
      maxHeight: optimizations.maxImageSize.height,
      lazy: optimizations.limitImageQuality,
    }),
    [optimizations]
  );

  return {
    isLowEndDevice,
    featureFlags,
    animationConfig,
    imageConfig,
    performanceMetrics,
    shouldOptimize:
      performanceMetrics.fps < 45 || performanceMetrics.memoryUsage > 0.7,
  };
}

export default useLowEndOptimization;
