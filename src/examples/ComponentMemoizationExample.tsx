/**
 * Component Memoization Example
 *
 * Demonstrates the usage of component memoization utilities for performance optimization.
 *
 * Requirements: 1.3, 1.4 - Component performance optimization
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  withMemoization,
  createOptimizedComponent,
  useSmartMemo,
  useSmartCallback,
  componentProfiler,
  getPerformanceInsights,
} from "@/utils/componentMemoization";
import {
  useComponentPerformance,
  useRenderOptimization,
  usePerformanceMonitor,
} from "@/hooks/useComponentPerformance";

// Example of a heavy computation that benefits from memoization
const expensiveCalculation = (items: number[]): number => {
  console.log("Performing expensive calculation...");
  return items.reduce((sum, item) => {
    // Simulate expensive operation
    for (let i = 0; i < 1000000; i++) {
      Math.random();
    }
    return sum + item;
  }, 0);
};

// Basic component without optimization
const UnoptimizedListItem: React.FC<{
  item: { id: number; name: string; value: number };
  onClick: (id: number) => void;
  isSelected: boolean;
}> = ({ item, onClick, isSelected }) => {
  console.log(`Rendering UnoptimizedListItem ${item.id}`);

  return (
    <div
      className={`p-4 border rounded cursor-pointer ${
        isSelected ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200"
      }`}
      onClick={() => onClick(item.id)}
    >
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-gray-600">Value: {item.value}</p>
    </div>
  );
};

// Optimized component using withMemoization
const OptimizedListItem = withMemoization(UnoptimizedListItem, {
  displayName: "OptimizedListItem",
  enableProfiling: true,
  deepCompare: false, // Shallow comparison is sufficient for this component
  skipProps: [], // Don't skip any props
});

// Component using createOptimizedComponent with full optimization
const FullyOptimizedListItem = createOptimizedComponent(UnoptimizedListItem, {
  displayName: "FullyOptimizedListItem",
  autoOptimize: true,
  enableProfiling: true,
  deepCompare: false,
});

// Complex component that demonstrates smart memoization
const ComplexCalculationComponent: React.FC<{
  data: number[];
  multiplier: number;
  config: { precision: number; format: string };
}> = ({ data, multiplier, config }) => {
  // Use performance monitoring
  const { trackPropChange, getMetrics } = useComponentPerformance({
    componentName: "ComplexCalculationComponent",
    trackMemory: true,
    trackRenderTime: true,
    onPerformanceWarning: (warning) => {
      console.warn("Performance warning:", warning);
    },
  });

  // Track prop changes for performance monitoring
  React.useEffect(() => {
    trackPropChange({ data, multiplier, config });
  }, [data, multiplier, config, trackPropChange]);

  // Smart memoization with deep comparison for config object
  const processedData = useSmartMemo(
    () => {
      console.log("Processing data with smart memo...");
      return data.map((item) => item * multiplier);
    },
    [data, multiplier],
    { deepCompare: false } // Arrays and primitives don't need deep comparison
  );

  // Smart memoization with deep comparison for complex config
  const formattedResult = useSmartMemo(
    () => {
      console.log("Formatting result with config...");
      const sum = processedData.reduce((a, b) => a + b, 0);
      return config.format === "currency"
        ? `$${sum.toFixed(config.precision)}`
        : sum.toFixed(config.precision);
    },
    [processedData, config],
    { deepCompare: true } // Config object needs deep comparison
  );

  // Smart callback memoization
  const handleDataUpdate = useSmartCallback(
    (newValue: number, index: number) => {
      console.log(`Updating data at index ${index} with value ${newValue}`);
      // This would typically update parent state
    },
    [data],
    { deepCompare: false }
  );

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-semibold mb-2">Complex Calculation Result</h3>
      <p className="text-lg font-mono">{formattedResult}</p>
      <div className="mt-2 text-sm text-gray-600">
        <p>Data points: {data.length}</p>
        <p>Multiplier: {multiplier}</p>
        <p>Precision: {config.precision}</p>
      </div>
      <button
        onClick={() => handleDataUpdate(Math.random() * 100, 0)}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Update First Item
      </button>
    </div>
  );
};

// Optimize the complex component
const OptimizedComplexComponent = createOptimizedComponent(
  ComplexCalculationComponent,
  {
    displayName: "OptimizedComplexComponent",
    autoOptimize: true,
    enableProfiling: true,
    deepCompare: true, // Enable deep comparison for complex props
  }
);

// Performance monitoring component
const PerformanceMonitor: React.FC = () => {
  const [insights, setInsights] = useState(getPerformanceInsights());
  const [showReport, setShowReport] = useState(false);

  const updateInsights = useCallback(() => {
    setInsights(getPerformanceInsights());
  }, []);

  const clearMetrics = useCallback(() => {
    componentProfiler.reset();
    setInsights(getPerformanceInsights());
  }, []);

  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h3 className="font-semibold mb-2">Performance Monitor</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Total Renders</p>
          <p className="text-lg">{insights.totalRenders}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Avg Render Time</p>
          <p className="text-lg">{insights.averageRenderTime.toFixed(2)}ms</p>
        </div>
      </div>

      {insights.slowComponents.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-red-600">Slow Components:</p>
          <ul className="text-sm text-red-500">
            {insights.slowComponents.map((name) => (
              <li key={name}>• {name}</li>
            ))}
          </ul>
        </div>
      )}

      {insights.unnecessaryRenders.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-orange-600">
            Unnecessary Renders:
          </p>
          <ul className="text-sm text-orange-500">
            {insights.unnecessaryRenders.map((name) => (
              <li key={name}>• {name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={updateInsights}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Refresh
        </button>
        <button
          onClick={clearMetrics}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
        >
          Clear
        </button>
        <button
          onClick={() => setShowReport(!showReport)}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          {showReport ? "Hide" : "Show"} Report
        </button>
      </div>

      {showReport && (
        <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto max-h-40">
          {componentProfiler.getPerformanceReport()}
        </pre>
      )}
    </div>
  );
};

// Main example component
const ComponentMemoizationExample: React.FC = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", value: 10 },
    { id: 2, name: "Item 2", value: 20 },
    { id: 3, name: "Item 3", value: 30 },
  ]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [counter, setCounter] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [config, setConfig] = useState({ precision: 2, format: "number" });

  // Use render optimization hook
  const { optimizationSuggestions, performanceTrend, deviceRecommendations } =
    useRenderOptimization("ComponentMemoizationExample");

  // Use performance monitor
  const { isMonitoring, currentMetrics, startMonitoring, stopMonitoring } =
    usePerformanceMonitor("ComponentMemoizationExample", {
      alertThreshold: 30,
      onAlert: (metrics) => {
        console.warn("Performance alert:", metrics);
      },
    });

  // Memoized expensive calculation
  const expensiveResult = useSmartMemo(
    () => expensiveCalculation(items.map((item) => item.value)),
    [items],
    { deepCompare: false }
  );

  // Memoized click handler
  const handleItemClick = useSmartCallback(
    (id: number) => {
      setSelectedId(selectedId === id ? null : id);
    },
    [selectedId],
    { deepCompare: false }
  );

  // Memoized config update handler
  const handleConfigUpdate = useSmartCallback(
    (newConfig: Partial<typeof config>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));
    },
    [config],
    { deepCompare: true }
  );

  const dataArray = useMemo(() => items.map((item) => item.value), [items]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Component Memoization Example
        </h1>
        <p className="text-gray-600">
          Demonstrates performance optimization techniques using memoization
          utilities
        </p>
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Performance Monitoring Controls */}
      <div className="p-4 border rounded bg-blue-50">
        <h3 className="font-semibold mb-2">Performance Monitoring</h3>
        <div className="flex gap-2 mb-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-3 py-1 rounded text-sm ${
              isMonitoring ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isMonitoring ? "Stop" : "Start"} Monitoring
          </button>
        </div>

        {currentMetrics && (
          <div className="text-sm">
            <p>Current render time: {currentMetrics.renderTime.toFixed(2)}ms</p>
            <p>Memory usage: {currentMetrics.memoryUsage.toFixed(2)}MB</p>
            <p>
              Performance status:{" "}
              {currentMetrics.isPerformant ? "✅ Good" : "⚠️ Poor"}
            </p>
          </div>
        )}

        {performanceTrend !== "insufficient-data" && (
          <p className="text-sm mt-2">
            Performance trend:
            <span
              className={`ml-1 ${
                performanceTrend === "improving"
                  ? "text-green-600"
                  : performanceTrend === "degrading"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {performanceTrend}
            </span>
          </p>
        )}
      </div>

      {/* Optimization Suggestions */}
      {(optimizationSuggestions.length > 0 ||
        deviceRecommendations.length > 0) && (
        <div className="p-4 border rounded bg-orange-50">
          <h3 className="font-semibold mb-2">Optimization Suggestions</h3>

          {optimizationSuggestions.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-medium">Performance Suggestions:</p>
              <ul className="text-sm text-orange-700">
                {optimizationSuggestions
                  .slice(0, 3)
                  .map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
              </ul>
            </div>
          )}

          {deviceRecommendations.length > 0 && (
            <div>
              <p className="text-sm font-medium">
                Device-Specific Recommendations:
              </p>
              <ul className="text-sm text-orange-700">
                {deviceRecommendations
                  .slice(0, 3)
                  .map((recommendation, index) => (
                    <li key={index}>• {recommendation}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-2">Controls</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setCounter((c) => c + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Force Re-render ({counter})
          </button>
          <button
            onClick={() => setMultiplier((m) => m + 1)}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Change Multiplier ({multiplier})
          </button>
          <button
            onClick={() =>
              handleConfigUpdate({
                format: config.format === "number" ? "currency" : "number",
              })
            }
            className="px-3 py-1 bg-purple-500 text-white rounded"
          >
            Toggle Format ({config.format})
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p>Expensive calculation result: {expensiveResult}</p>
        </div>
      </div>

      {/* Unoptimized vs Optimized Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Unoptimized Components</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <UnoptimizedListItem
                key={item.id}
                item={item}
                onClick={handleItemClick}
                isSelected={selectedId === item.id}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Optimized Components</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <OptimizedListItem
                key={item.id}
                item={item}
                onClick={handleItemClick}
                isSelected={selectedId === item.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Complex Component Example */}
      <div>
        <h3 className="font-semibold mb-2">
          Complex Component with Smart Memoization
        </h3>
        <OptimizedComplexComponent
          data={dataArray}
          multiplier={multiplier}
          config={config}
        />
      </div>

      {/* Instructions */}
      <div className="p-4 border rounded bg-green-50">
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Click "Force Re-render" to trigger unnecessary re-renders</li>
          <li>
            • Compare console logs between unoptimized and optimized components
          </li>
          <li>• Watch the performance monitor for render metrics</li>
          <li>• Change multiplier to see smart memoization in action</li>
          <li>• Toggle format to test deep comparison for config objects</li>
          <li>• Check browser dev tools for performance profiling</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentMemoizationExample;
