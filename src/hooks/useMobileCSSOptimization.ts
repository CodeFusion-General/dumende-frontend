/**
 * React hook for mobile CSS optimization
 */

import { useEffect, useCallback, useState } from "react";
import {
  mobileCSSOptimizationService,
  MobileAnimationConfig,
  CriticalCSSConfig,
} from "../services/mobileCSSOptimization";

export interface UseMobileCSSOptimizationOptions {
  enableCriticalCSS?: boolean;
  enableAnimationOptimization?: boolean;
  componentName?: string;
  criticalCSS?: string;
}

export function useMobileCSSOptimization(
  options: UseMobileCSSOptimizationOptions = {}
) {
  const {
    enableCriticalCSS = true,
    enableAnimationOptimization = true,
    componentName,
    criticalCSS,
  } = options;

  const [animationConfig, setAnimationConfig] = useState<MobileAnimationConfig>(
    mobileCSSOptimizationService.getAnimationConfig()
  );

  const [criticalConfig, setCriticalConfig] = useState<CriticalCSSConfig>(
    mobileCSSOptimizationService.getCriticalConfig()
  );

  // Add component critical CSS
  useEffect(() => {
    if (enableCriticalCSS && componentName && criticalCSS) {
      mobileCSSOptimizationService.addComponentCriticalCSS(
        componentName,
        criticalCSS
      );
    }
  }, [enableCriticalCSS, componentName, criticalCSS]);

  // Load non-critical CSS
  const loadNonCriticalCSS = useCallback(
    async (href: string, media?: string) => {
      try {
        await mobileCSSOptimizationService.loadNonCriticalCSS(href, media);
      } catch (error) {
        console.error("Failed to load non-critical CSS:", error);
      }
    },
    []
  );

  // Preload CSS
  const preloadCSS = useCallback((href: string) => {
    mobileCSSOptimizationService.preloadCSS(href);
  }, []);

  // Cleanup animation properties
  const cleanupAnimationProperties = useCallback(
    (element: HTMLElement) => {
      if (enableAnimationOptimization) {
        mobileCSSOptimizationService.cleanupAnimationProperties(element);
      }
    },
    [enableAnimationOptimization]
  );

  // Update animation config
  const updateAnimationConfig = useCallback(
    (config: Partial<MobileAnimationConfig>) => {
      mobileCSSOptimizationService.updateAnimationConfig(config);
      setAnimationConfig(mobileCSSOptimizationService.getAnimationConfig());
    },
    []
  );

  // Update critical config
  const updateCriticalConfig = useCallback(
    (config: Partial<CriticalCSSConfig>) => {
      mobileCSSOptimizationService.updateCriticalConfig(config);
      setCriticalConfig(mobileCSSOptimizationService.getCriticalConfig());
    },
    []
  );

  // Animation utilities
  const shouldReduceMotion = animationConfig.enableReducedMotion;
  const maxAnimationDuration = animationConfig.maxAnimationDuration;

  // CSS class helpers
  const getAnimationClasses = useCallback(
    (baseClasses: string = "") => {
      const classes = [baseClasses];

      if (animationConfig.useWillChange) {
        classes.push("will-animate");
      }

      if (animationConfig.enableHardwareAcceleration) {
        classes.push("hardware-accelerated");
      }

      return classes.filter(Boolean).join(" ");
    },
    [animationConfig]
  );

  // Responsive image classes
  const getResponsiveImageClasses = useCallback(
    (aspectRatio?: "16-9" | "4-3" | "1-1") => {
      const classes = ["responsive-image"];

      if (aspectRatio) {
        classes.push(`aspect-ratio-${aspectRatio}`);
      }

      return classes.join(" ");
    },
    []
  );

  return {
    // Configuration
    animationConfig,
    criticalConfig,
    shouldReduceMotion,
    maxAnimationDuration,

    // Methods
    loadNonCriticalCSS,
    preloadCSS,
    cleanupAnimationProperties,
    updateAnimationConfig,
    updateCriticalConfig,

    // Utilities
    getAnimationClasses,
    getResponsiveImageClasses,
  };
}

/**
 * Hook for managing critical CSS loading
 */
export function useCriticalCSS(componentName: string, criticalCSS: string) {
  useEffect(() => {
    mobileCSSOptimizationService.addComponentCriticalCSS(
      componentName,
      criticalCSS
    );
  }, [componentName, criticalCSS]);
}

/**
 * Hook for managing animation performance
 */
export function useAnimationOptimization() {
  const [config, setConfig] = useState(
    mobileCSSOptimizationService.getAnimationConfig()
  );

  const updateConfig = useCallback(
    (newConfig: Partial<MobileAnimationConfig>) => {
      mobileCSSOptimizationService.updateAnimationConfig(newConfig);
      setConfig(mobileCSSOptimizationService.getAnimationConfig());
    },
    []
  );

  const cleanupElement = useCallback((element: HTMLElement) => {
    mobileCSSOptimizationService.cleanupAnimationProperties(element);
  }, []);

  return {
    config,
    updateConfig,
    cleanupElement,
    shouldReduceMotion: config.enableReducedMotion,
    maxDuration: config.maxAnimationDuration,
  };
}

/**
 * Hook for responsive CSS loading
 */
export function useResponsiveCSS() {
  const [loadedStylesheets, setLoadedStylesheets] = useState<Set<string>>(
    new Set()
  );

  const loadCSS = useCallback(
    async (href: string, media?: string) => {
      if (loadedStylesheets.has(href)) {
        return;
      }

      try {
        await mobileCSSOptimizationService.loadNonCriticalCSS(href, media);
        setLoadedStylesheets((prev) => new Set(prev).add(href));
      } catch (error) {
        console.error("Failed to load CSS:", error);
        throw error;
      }
    },
    [loadedStylesheets]
  );

  const preload = useCallback((href: string) => {
    mobileCSSOptimizationService.preloadCSS(href);
  }, []);

  const isLoaded = useCallback(
    (href: string) => {
      return loadedStylesheets.has(href);
    },
    [loadedStylesheets]
  );

  return {
    loadCSS,
    preload,
    isLoaded,
    loadedStylesheets: Array.from(loadedStylesheets),
  };
}
