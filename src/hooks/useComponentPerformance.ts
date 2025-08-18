/**
 * Component Performance Hooks
 *
 * Hooks for monitoring and optimizing component performance on mobile devices.
 *
 * Requirements: 1.3, 1.4 - Component performance optimization and mobile responsiveness
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  componentProfiler,
  ComponentPerformanceMetrics,
} from "@/utils/componentMemoization";
import { mobileDetection } from "@/utils/mobileDetection";

/**
 * Performance thresholds for different device types
 */
const PERFORMANCE_THRESHOLDS = {
  desktop: {
    maxRenderTime: 16, // 60fps
    maxMemoryUsage: 100, // MB
    maxUnnecessaryRenders: 10, // percentage
  },
  mobile: {
    maxRenderTime: 33, // 30fps for mobile
    maxMemoryUsage: 50, // MB
    maxUnnecessaryRenders: 5, // percentage
  },
  lowEnd: {
    maxRenderTime: 50, // 20fps for low-end devices
    maxMemoryUsage: 25, // MB
    maxUnnecessaryRenders: 2, // percentage
  },
};

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Component name for tracking */
  componentName: string;
  /** Enable memory monitoring */
  trackMemory?: boolean;
  /** Enable render time tracking */
  trackRenderTime?: boolean;
  /** Enable prop change tracking */
  trackPropChanges?: boolean;
  /** Custom performance thresholds */
  thresholds?: Partial<typeof PERFORMANCE_THRESHOLDS.desktop>;
  /** Callback for performance warnings */
  onPerformanceWarning?: (warning: PerformanceWarning) => void;
}

/**
 * Performance warning types
 */
export interface PerformanceWarning {
  type:
    | "slow-render"
    | "memory-leak"
    | "unnecessary-renders"
    | "prop-thrashing";
  componentName: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

/**
 * Real-time performance metrics
 */
export interface RealTimeMetrics {
  renderTime: number;
  memoryUsage: number;
  renderCount: number;
  unnecessaryRenders: number;
  isPerformant: boolean;
  warnings: PerformanceWarning[];
}

/**
 * Hook for comprehensive component performance monitoring
 */
export function useComponentPerformance(config: PerformanceConfig) {
  const {
    componentName,
    trackMemory = true,
    trackRenderTime = true,
    trackPropChanges = true,
    thresholds: customThresholds,
    onPerformanceWarning,
  } = config;

  const renderStartTime = useRef<number>();
  const renderCount = useRef<number>(0);
  const memoryBaseline = useRef<number>();
  const warnings = useRef<PerformanceWarning[]>([]);
  const lastPropHash = useRef<string>();
  const propChangeCount = useRef<number>(0);

  // Detect device type for appropriate thresholds
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);

  const thresholds = useMemo(() => {
    let baseThresholds = PERFORMANCE_THRESHOLDS.desktop;

    if (deviceInfo.isLowEndDevice) {
      baseThresholds = PERFORMANCE_THRESHOLDS.lowEnd;
    } else if (deviceInfo.isMobile) {
      baseThresholds = PERFORMANCE_THRESHOLDS.mobile;
    }

    return { ...baseThresholds, ...customThresholds };
  }, [deviceInfo, customThresholds]);

  // Track render start
  useEffect(() => {
    if (!trackRenderTime) return;

    renderStartTime.current = performance.now();
    renderCount.current++;
  });

  // Track render end and memory usage
  useEffect(() => {
    if (!renderStartTime.current) return;

    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;

    // Track render time
    if (trackRenderTime) {
      componentProfiler.endRender(componentName, renderStartTime.current, true);

      if (renderTime > thresholds.maxRenderTime) {
        const warning: PerformanceWarning = {
          type: "slow-render",
          componentName,
          message: `Slow render detected: ${renderTime.toFixed(2)}ms`,
          value: renderTime,
          threshold: thresholds.maxRenderTime,
          timestamp: Date.now(),
        };

        warnings.current.push(warning);
        onPerformanceWarning?.(warning);
      }
    }

    // Track memory usage
    if (trackMemory && "memory" in performance) {
      const memoryInfo = (performance as any).memory;
      const currentMemory = memoryInfo.usedJSHeapSize / 1048576; // Convert to MB

      if (!memoryBaseline.current) {
        memoryBaseline.current = currentMemory;
      }

      const memoryIncrease = currentMemory - memoryBaseline.current;

      if (memoryIncrease > thresholds.maxMemoryUsage) {
        const warning: PerformanceWarning = {
          type: "memory-leak",
          componentName,
          message: `Memory usage increased by ${memoryIncrease.toFixed(2)}MB`,
          value: memoryIncrease,
          threshold: thresholds.maxMemoryUsage,
          timestamp: Date.now(),
        };

        warnings.current.push(warning);
        onPerformanceWarning?.(warning);
      }
    }
  });

  /**
   * Track prop changes to detect prop thrashing
   */
  const trackPropChange = useCallback(
    (props: Record<string, any>) => {
      if (!trackPropChanges) return;

      const propHash = JSON.stringify(props);

      if (lastPropHash.current && lastPropHash.current !== propHash) {
        propChangeCount.current++;

        // Check for prop thrashing (too many prop changes in short time)
        if (propChangeCount.current > 10) {
          const warning: PerformanceWarning = {
            type: "prop-thrashing",
            componentName,
            message: `High prop change frequency detected: ${propChangeCount.current} changes`,
            value: propChangeCount.current,
            threshold: 10,
            timestamp: Date.now(),
          };

          warnings.current.push(warning);
          onPerformanceWarning?.(warning);

          // Reset counter
          propChangeCount.current = 0;
        }
      }

      lastPropHash.current = propHash;
    },
    [componentName, trackPropChanges, onPerformanceWarning]
  );

  /**
   * Get current performance metrics
   */
  const getMetrics = useCallback((): RealTimeMetrics => {
    const metrics = componentProfiler.getMetrics(
      componentName
    ) as ComponentPerformanceMetrics;
    const memoryInfo =
      "memory" in performance ? (performance as any).memory : null;
    const currentMemory = memoryInfo ? memoryInfo.usedJSHeapSize / 1048576 : 0;

    const unnecessaryRenderPercentage =
      metrics.renderCount > 0
        ? (metrics.unnecessaryRenders / metrics.renderCount) * 100
        : 0;

    const isPerformant =
      metrics.averageRenderTime <= thresholds.maxRenderTime &&
      unnecessaryRenderPercentage <= thresholds.maxUnnecessaryRenders &&
      currentMemory - (memoryBaseline.current || 0) <=
        thresholds.maxMemoryUsage;

    return {
      renderTime: metrics.averageRenderTime || 0,
      memoryUsage: currentMemory,
      renderCount: metrics.renderCount || 0,
      unnecessaryRenders: unnecessaryRenderPercentage,
      isPerformant,
      warnings: [...warnings.current],
    };
  }, [componentName, thresholds]);

  /**
   * Clear performance warnings
   */
  const clearWarnings = useCallback(() => {
    warnings.current = [];
  }, []);

  /**
   * Reset all performance tracking
   */
  const reset = useCallback(() => {
    componentProfiler.reset(componentName);
    warnings.current = [];
    renderCount.current = 0;
    propChangeCount.current = 0;
    memoryBaseline.current = undefined;
  }, [componentName]);

  return {
    trackPropChange,
    getMetrics,
    clearWarnings,
    reset,
    thresholds,
    deviceInfo,
  };
}

/**
 * Hook for monitoring render performance with automatic optimization suggestions
 */
export function useRenderOptimization(componentName: string) {
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<
    string[]
  >([]);
  const renderTimes = useRef<number[]>([]);
  const maxRenderTimes = 20; // Keep last 20 render times

  const { getMetrics, deviceInfo } = useComponentPerformance({
    componentName,
    onPerformanceWarning: (warning) => {
      // Generate optimization suggestions based on warnings
      const suggestions: string[] = [];

      switch (warning.type) {
        case "slow-render":
          suggestions.push(
            "Consider using React.memo() to prevent unnecessary re-renders"
          );
          suggestions.push("Use useMemo() for expensive calculations");
          suggestions.push("Implement virtualization for large lists");
          break;
        case "memory-leak":
          suggestions.push("Check for memory leaks in useEffect cleanup");
          suggestions.push("Ensure event listeners are properly removed");
          suggestions.push(
            "Consider using WeakMap/WeakSet for object references"
          );
          break;
        case "prop-thrashing":
          suggestions.push(
            "Stabilize prop references using useCallback/useMemo"
          );
          suggestions.push("Consider lifting state up to reduce prop drilling");
          suggestions.push("Use context for frequently changing shared state");
          break;
        case "unnecessary-renders":
          suggestions.push("Implement proper prop comparison in React.memo()");
          suggestions.push("Use useCallback for function props");
          suggestions.push(
            "Split component into smaller, more focused components"
          );
          break;
      }

      setOptimizationSuggestions((prev) => [...prev, ...suggestions]);
    },
  });

  // Track render times for trend analysis
  useEffect(() => {
    const metrics = getMetrics();
    renderTimes.current.push(metrics.renderTime);

    if (renderTimes.current.length > maxRenderTimes) {
      renderTimes.current.shift();
    }
  });

  /**
   * Analyze render performance trends
   */
  const analyzePerformanceTrend = useCallback(() => {
    if (renderTimes.current.length < 5) return "insufficient-data";

    const recent = renderTimes.current.slice(-5);
    const older = renderTimes.current.slice(0, -5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;

    if (improvement > 10) return "improving";
    if (improvement < -10) return "degrading";
    return "stable";
  }, []);

  /**
   * Get performance recommendations based on device type
   */
  const getDeviceSpecificRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (deviceInfo.isLowEndDevice) {
      recommendations.push("Reduce animation complexity for low-end devices");
      recommendations.push(
        "Implement progressive loading for heavy components"
      );
      recommendations.push(
        "Use smaller image sizes and lower quality settings"
      );
    }

    if (deviceInfo.isMobile) {
      recommendations.push("Optimize touch interactions and gesture handling");
      recommendations.push("Reduce bundle size for mobile networks");
      recommendations.push("Implement lazy loading for off-screen content");
    }

    if (
      deviceInfo.connectionType === "slow-2g" ||
      deviceInfo.connectionType === "2g"
    ) {
      recommendations.push("Minimize network requests and bundle size");
      recommendations.push("Implement aggressive caching strategies");
      recommendations.push(
        "Use skeleton screens for better perceived performance"
      );
    }

    return recommendations;
  }, [deviceInfo]);

  return {
    optimizationSuggestions,
    performanceTrend: analyzePerformanceTrend(),
    deviceRecommendations: getDeviceSpecificRecommendations(),
    clearSuggestions: () => setOptimizationSuggestions([]),
    getMetrics,
  };
}

/**
 * Hook for automatic performance monitoring with alerts
 */
export function usePerformanceMonitor(
  componentName: string,
  options: {
    alertThreshold?: number;
    onAlert?: (metrics: RealTimeMetrics) => void;
    monitoringInterval?: number;
  } = {}
) {
  const { alertThreshold = 50, onAlert, monitoringInterval = 5000 } = options;
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetrics | null>(
    null
  );

  const { getMetrics } = useComponentPerformance({ componentName });

  // Start/stop monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Periodic monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const metrics = getMetrics();
      setCurrentMetrics(metrics);

      // Check for performance alerts
      if (!metrics.isPerformant && metrics.renderTime > alertThreshold) {
        onAlert?.(metrics);
      }
    }, monitoringInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, getMetrics, alertThreshold, onAlert, monitoringInterval]);

  return {
    isMonitoring,
    currentMetrics,
    startMonitoring,
    stopMonitoring,
  };
}

/**
 * Hook for component-level performance budgets
 */
export function usePerformanceBudget(
  componentName: string,
  budget: {
    maxRenderTime?: number;
    maxMemoryUsage?: number;
    maxRenderCount?: number;
  }
) {
  const [budgetStatus, setBudgetStatus] = useState<
    "within-budget" | "over-budget" | "critical"
  >("within-budget");
  const [violations, setViolations] = useState<string[]>([]);

  const { getMetrics } = useComponentPerformance({ componentName });

  // Check budget compliance
  useEffect(() => {
    const metrics = getMetrics();
    const newViolations: string[] = [];

    if (budget.maxRenderTime && metrics.renderTime > budget.maxRenderTime) {
      newViolations.push(
        `Render time (${metrics.renderTime.toFixed(2)}ms) exceeds budget (${
          budget.maxRenderTime
        }ms)`
      );
    }

    if (budget.maxMemoryUsage && metrics.memoryUsage > budget.maxMemoryUsage) {
      newViolations.push(
        `Memory usage (${metrics.memoryUsage.toFixed(2)}MB) exceeds budget (${
          budget.maxMemoryUsage
        }MB)`
      );
    }

    if (budget.maxRenderCount && metrics.renderCount > budget.maxRenderCount) {
      newViolations.push(
        `Render count (${metrics.renderCount}) exceeds budget (${budget.maxRenderCount})`
      );
    }

    setViolations(newViolations);

    if (newViolations.length === 0) {
      setBudgetStatus("within-budget");
    } else if (newViolations.length <= 2) {
      setBudgetStatus("over-budget");
    } else {
      setBudgetStatus("critical");
    }
  }, [budget, getMetrics]);

  return {
    budgetStatus,
    violations,
    isWithinBudget: budgetStatus === "within-budget",
  };
}
