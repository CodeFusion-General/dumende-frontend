/**
 * Component Memoization Utilities
 *
 * This module provides utilities for optimizing React component performance through
 * intelligent memoization, prop comparison, and performance profiling.
 *
 * Requirements: 1.3, 1.4 - Component performance optimization and mobile responsiveness
 */

import React, {
  ComponentType,
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";

/**
 * Performance metrics for component rendering
 */
export interface ComponentPerformanceMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  propsChanges: number;
  unnecessaryRenders: number;
}

/**
 * Memoization configuration options
 */
export interface MemoizationConfig {
  /** Enable deep comparison for complex objects */
  deepCompare?: boolean;
  /** Custom comparison function */
  customCompare?: (prevProps: any, nextProps: any) => boolean;
  /** Enable performance profiling */
  enableProfiling?: boolean;
  /** Component name for debugging */
  displayName?: string;
  /** Skip memoization for specific props */
  skipProps?: string[];
  /** Maximum number of prop changes to track */
  maxPropChanges?: number;
}

/**
 * Performance profiler for tracking component render metrics
 */
class ComponentProfiler {
  private metrics = new Map<string, ComponentPerformanceMetrics>();
  private renderTimes = new Map<string, number[]>();
  private maxRenderTimes = 100; // Keep last 100 render times

  startRender(componentName: string): number {
    return performance.now();
  }

  endRender(
    componentName: string,
    startTime: number,
    propsChanged: boolean = true
  ): void {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    let metrics = this.metrics.get(componentName);
    if (!metrics) {
      metrics = {
        componentName,
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        totalRenderTime: 0,
        propsChanges: 0,
        unnecessaryRenders: 0,
      };
      this.metrics.set(componentName, metrics);
    }

    // Update metrics
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    if (propsChanged) {
      metrics.propsChanges++;
    } else {
      metrics.unnecessaryRenders++;
    }

    // Track render times for performance analysis
    let times = this.renderTimes.get(componentName);
    if (!times) {
      times = [];
      this.renderTimes.set(componentName, times);
    }
    times.push(renderTime);
    if (times.length > this.maxRenderTimes) {
      times.shift();
    }

    // Log performance warnings for slow renders
    if (renderTime > 16) {
      // More than one frame at 60fps
      console.warn(
        `Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  }

  getMetrics(
    componentName?: string
  ): ComponentPerformanceMetrics | Map<string, ComponentPerformanceMetrics> {
    if (componentName) {
      return (
        this.metrics.get(componentName) || {
          componentName,
          renderCount: 0,
          averageRenderTime: 0,
          lastRenderTime: 0,
          totalRenderTime: 0,
          propsChanges: 0,
          unnecessaryRenders: 0,
        }
      );
    }
    return new Map(this.metrics);
  }

  getRenderTimes(componentName: string): number[] {
    return this.renderTimes.get(componentName) || [];
  }

  reset(componentName?: string): void {
    if (componentName) {
      this.metrics.delete(componentName);
      this.renderTimes.delete(componentName);
    } else {
      this.metrics.clear();
      this.renderTimes.clear();
    }
  }

  getPerformanceReport(): string {
    const report: string[] = ["Component Performance Report:", ""];

    for (const [name, metrics] of this.metrics) {
      const unnecessaryRenderPercentage =
        metrics.renderCount > 0
          ? ((metrics.unnecessaryRenders / metrics.renderCount) * 100).toFixed(
              1
            )
          : "0";

      report.push(`${name}:`);
      report.push(`  Renders: ${metrics.renderCount}`);
      report.push(`  Avg Time: ${metrics.averageRenderTime.toFixed(2)}ms`);
      report.push(`  Last Time: ${metrics.lastRenderTime.toFixed(2)}ms`);
      report.push(
        `  Unnecessary: ${metrics.unnecessaryRenders} (${unnecessaryRenderPercentage}%)`
      );
      report.push("");
    }

    return report.join("\n");
  }
}

// Global profiler instance
export const componentProfiler = new ComponentProfiler();

/**
 * Deep comparison utility for complex objects
 */
export function deepEqual(obj1: any, obj2: any, maxDepth: number = 5): boolean {
  if (maxDepth <= 0) return obj1 === obj2;

  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return obj1 === obj2;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== "object") return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i], maxDepth - 1)) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key], maxDepth - 1)) return false;
  }

  return true;
}

/**
 * Smart prop comparison that handles different data types intelligently
 */
export function smartPropsEqual(
  prevProps: any,
  nextProps: any,
  config: MemoizationConfig = {}
): boolean {
  const { skipProps = [], deepCompare = false, customCompare } = config;

  // Use custom comparison if provided
  if (customCompare) {
    return customCompare(prevProps, nextProps);
  }

  // Get all prop keys, excluding skipped ones
  const prevKeys = Object.keys(prevProps).filter(
    (key) => !skipProps.includes(key)
  );
  const nextKeys = Object.keys(nextProps).filter(
    (key) => !skipProps.includes(key)
  );

  // Different number of props
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  // Check each prop
  for (const key of prevKeys) {
    if (!nextKeys.includes(key)) {
      return false;
    }

    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // Handle functions - compare by reference unless they're the same function
    if (typeof prevValue === "function" && typeof nextValue === "function") {
      if (prevValue !== nextValue) {
        // Check if functions have the same string representation (for inline functions)
        if (prevValue.toString() !== nextValue.toString()) {
          return false;
        }
      }
      continue;
    }

    // Handle objects and arrays
    if (typeof prevValue === "object" && typeof nextValue === "object") {
      if (prevValue === null || nextValue === null) {
        if (prevValue !== nextValue) return false;
        continue;
      }

      if (deepCompare) {
        if (!deepEqual(prevValue, nextValue)) {
          return false;
        }
      } else {
        // Shallow comparison for objects
        if (prevValue !== nextValue) {
          return false;
        }
      }
      continue;
    }

    // Primitive comparison
    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

/**
 * Higher-order component for automatic memoization with performance profiling
 */
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  config: MemoizationConfig = {}
): ComponentType<P> {
  const {
    enableProfiling = process.env.NODE_ENV === "development",
    displayName = Component.displayName || Component.name || "Component",
  } = config;

  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    const startTime = enableProfiling
      ? componentProfiler.startRender(displayName)
      : 0;

    const areEqual = smartPropsEqual(prevProps, nextProps, config);

    if (enableProfiling) {
      componentProfiler.endRender(displayName, startTime, !areEqual);
    }

    return areEqual;
  });

  MemoizedComponent.displayName = `Memoized(${displayName})`;

  return MemoizedComponent;
}

/**
 * Hook for memoizing expensive calculations with smart dependencies
 */
export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  config: { deepCompare?: boolean; maxAge?: number } = {}
): T {
  const { deepCompare = false, maxAge } = config;
  const prevDepsRef = useRef<React.DependencyList>();
  const valueRef = useRef<T>();
  const timestampRef = useRef<number>();

  const depsChanged = useMemo(() => {
    const prevDeps = prevDepsRef.current;

    if (!prevDeps) return true;

    if (prevDeps.length !== deps.length) return true;

    for (let i = 0; i < deps.length; i++) {
      const prevDep = prevDeps[i];
      const currentDep = deps[i];

      if (
        deepCompare &&
        typeof currentDep === "object" &&
        currentDep !== null
      ) {
        if (!deepEqual(prevDep, currentDep)) return true;
      } else {
        if (prevDep !== currentDep) return true;
      }
    }

    return false;
  }, deps);

  const isExpired = useMemo(() => {
    if (!maxAge || !timestampRef.current) return false;
    return Date.now() - timestampRef.current > maxAge;
  }, [maxAge]);

  return useMemo(() => {
    if (depsChanged || isExpired || valueRef.current === undefined) {
      valueRef.current = factory();
      prevDepsRef.current = deps;
      timestampRef.current = Date.now();
    }
    return valueRef.current;
  }, [depsChanged, isExpired, factory]);
}

/**
 * Hook for memoizing callback functions with smart dependencies
 */
export function useSmartCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  config: { deepCompare?: boolean } = {}
): T {
  const { deepCompare = false } = config;

  return useSmartMemo(() => callback, deps, { deepCompare }) as T;
}

/**
 * Hook for performance profiling of component renders
 */
export function useRenderProfiler(
  componentName: string,
  enabled: boolean = true
) {
  const renderStartTime = useRef<number>();
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
    renderCount.current++;
  });

  useEffect(() => {
    if (!enabled || !renderStartTime.current) return;

    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;

    componentProfiler.endRender(componentName, renderStartTime.current, true);

    // Log slow renders in development
    if (process.env.NODE_ENV === "development" && renderTime > 16) {
      console.warn(
        `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (render #${
          renderCount.current
        })`
      );
    }
  });

  return {
    getMetrics: () => componentProfiler.getMetrics(componentName),
    getRenderTimes: () => componentProfiler.getRenderTimes(componentName),
    reset: () => componentProfiler.reset(componentName),
  };
}

/**
 * Hook for detecting unnecessary re-renders
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log("[why-did-you-update]", name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Performance-optimized component wrapper with automatic optimizations
 */
export function createOptimizedComponent<P extends object>(
  Component: ComponentType<P>,
  config: MemoizationConfig & {
    /** Enable automatic prop optimization */
    autoOptimize?: boolean;
    /** Enable render profiling */
    enableProfiling?: boolean;
  } = {}
): ComponentType<P> {
  const {
    autoOptimize = true,
    enableProfiling = process.env.NODE_ENV === "development",
    displayName = Component.displayName || Component.name || "Component",
    ...memoConfig
  } = config;

  let OptimizedComponent = Component;

  // Apply memoization
  if (autoOptimize) {
    OptimizedComponent = withMemoization(OptimizedComponent, {
      ...memoConfig,
      enableProfiling,
      displayName,
    });
  }

  // Add profiling wrapper if enabled
  if (enableProfiling) {
    const ProfiledComponent: ComponentType<P> = (props) => {
      useRenderProfiler(displayName);

      if (process.env.NODE_ENV === "development") {
        useWhyDidYouUpdate(displayName, props as Record<string, any>);
      }

      return React.createElement(OptimizedComponent, props);
    };

    ProfiledComponent.displayName = `Profiled(${displayName})`;
    return ProfiledComponent;
  }

  return OptimizedComponent;
}

/**
 * Utility to get performance insights for all components
 */
export function getPerformanceInsights(): {
  slowComponents: string[];
  unnecessaryRenders: string[];
  totalRenders: number;
  averageRenderTime: number;
} {
  const metrics = componentProfiler.getMetrics() as Map<
    string,
    ComponentPerformanceMetrics
  >;
  const slowComponents: string[] = [];
  const unnecessaryRenders: string[] = [];
  let totalRenders = 0;
  let totalRenderTime = 0;

  for (const [name, metric] of metrics) {
    totalRenders += metric.renderCount;
    totalRenderTime += metric.totalRenderTime;

    if (metric.averageRenderTime > 16) {
      slowComponents.push(name);
    }

    const unnecessaryPercentage =
      metric.renderCount > 0
        ? (metric.unnecessaryRenders / metric.renderCount) * 100
        : 0;

    if (unnecessaryPercentage > 20) {
      unnecessaryRenders.push(name);
    }
  }

  return {
    slowComponents,
    unnecessaryRenders,
    totalRenders,
    averageRenderTime: totalRenders > 0 ? totalRenderTime / totalRenders : 0,
  };
}

/**
 * Development helper to log performance report
 */
export function logPerformanceReport(): void {
  if (process.env.NODE_ENV === "development") {
    console.log(componentProfiler.getPerformanceReport());

    const insights = getPerformanceInsights();
    console.log("Performance Insights:", insights);
  }
}
