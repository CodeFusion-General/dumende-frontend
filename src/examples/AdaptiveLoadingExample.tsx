// Adaptive Loading Example Component
// Demonstrates adaptive loading functionality and device-aware optimizations

import React, { useState, useEffect } from "react";
import {
  useAdaptiveLoading,
  useNetworkAwareLoading,
  useBatteryAwareLoading,
  usePerformanceAwareLoading,
} from "../hooks/useAdaptiveLoading";

export const AdaptiveLoadingExample: React.FC = () => {
  const {
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
  } = useAdaptiveLoading();

  const {
    connectionInfo,
    shouldPreload,
    shouldPrefetch,
    maxConcurrentRequests,
    requestTimeout,
  } = useNetworkAwareLoading();

  const {
    batteryInfo,
    shouldReduceActivity,
    shouldEnableBackgroundSync,
    shouldEnablePushNotifications,
    animationLevel,
  } = useBatteryAwareLoading();

  const {
    performanceInfo,
    performanceMetrics,
    shouldOptimizeForPerformance,
    imageQuality,
    enableAdvancedFeatures,
  } = usePerformanceAwareLoading();

  const [testResults, setTestResults] = useState<any[]>([]);

  // Test resource loading decisions
  const testResourceLoading = () => {
    const tests = [
      { type: "image", priority: 95, expected: true },
      { type: "image", priority: 50, expected: true },
      { type: "video", priority: 30, expected: null },
      { type: "prefetch", priority: 60, expected: null },
      { type: "prefetch", priority: 30, expected: null },
      { type: "animation", priority: 40, expected: null },
    ];

    const results = tests.map((test) => ({
      ...test,
      actual: shouldLoadResource(test.type, test.priority),
    }));

    setTestResults(results);
  };

  // Test image optimization
  const testImageOptimization = () => {
    const originalSizes = [
      { width: 1920, height: 1080 },
      { width: 800, height: 600 },
      { width: 400, height: 300 },
    ];

    const optimizedSizes = originalSizes.map((size) => ({
      original: size,
      optimized: getOptimalImageSize(size),
    }));

    console.log("Image optimization results:", optimizedSizes);
  };

  useEffect(() => {
    if (isInitialized) {
      testResourceLoading();
    }
  }, [isInitialized, shouldLoadResource]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Detecting device capabilities...</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to initialize adaptive loading</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Adaptive Loading Dashboard
        </h2>

        {/* Device Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Device Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Class:</span>
                <span
                  className={`font-medium ${
                    deviceClass === "high-end"
                      ? "text-green-600"
                      : deviceClass === "mid-range"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {deviceClass}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory:</span>
                <span>{capabilities?.memory || "Unknown"} GB</span>
              </div>
              <div className="flex justify-between">
                <span>CPU Cores:</span>
                <span>{capabilities?.cores || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span>Performance:</span>
                <span>{capabilities?.performanceScore || 0}/100</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">Network</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <span
                  className={
                    isSlowConnection ? "text-red-600" : "text-green-600"
                  }
                >
                  {connectionInfo?.type || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Speed:</span>
                <span>{connectionInfo?.downlink || 0} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span>{connectionInfo?.rtt || 0} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Data Saver:</span>
                <span
                  className={
                    connectionInfo?.saveData
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }
                >
                  {connectionInfo?.saveData ? "On" : "Off"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-3">Battery</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Level:</span>
                <span
                  className={isBatteryLow ? "text-red-600" : "text-green-600"}
                >
                  {batteryInfo?.level
                    ? `${Math.round(batteryInfo.level * 100)}%`
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Charging:</span>
                <span
                  className={
                    batteryInfo?.charging ? "text-green-600" : "text-gray-600"
                  }
                >
                  {batteryInfo?.charging ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low Battery:</span>
                <span
                  className={isBatteryLow ? "text-red-600" : "text-green-600"}
                >
                  {isBatteryLow ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reduce Activity:</span>
                <span
                  className={
                    shouldReduceActivity ? "text-yellow-600" : "text-green-600"
                  }
                >
                  {shouldReduceActivity ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-3">Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span
                  className={
                    performanceMetrics.fps < 30
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {Math.round(performanceMetrics.fps)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory:</span>
                <span
                  className={
                    performanceMetrics.memoryUsage > 0.8
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {Math.round(performanceMetrics.memoryUsage * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Optimize:</span>
                <span
                  className={
                    shouldOptimizeForPerformance
                      ? "text-yellow-600"
                      : "text-green-600"
                  }
                >
                  {shouldOptimizeForPerformance ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low-End:</span>
                <span
                  className={isLowEndDevice ? "text-red-600" : "text-green-600"}
                >
                  {isLowEndDevice ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Strategy */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Loading Strategy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Quality Settings
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Image Quality:</span>
                  <span
                    className={`font-medium ${
                      imageQuality === "high"
                        ? "text-green-600"
                        : imageQuality === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {imageQuality}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Video Quality:</span>
                  <span className="font-medium">{strategy?.videoQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Animation Level:</span>
                  <span className="font-medium">{animationLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chunk Size:</span>
                  <span className="font-medium">{getChunkSize()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Loading Features
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Lazy Loading:</span>
                  <span
                    className={
                      strategy?.enableLazyLoading
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {strategy?.enableLazyLoading ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Code Splitting:</span>
                  <span
                    className={
                      strategy?.enableCodeSplitting
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {strategy?.enableCodeSplitting ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Preload Next:</span>
                  <span
                    className={
                      strategy?.preloadNextPage
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {strategy?.preloadNextPage ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Prefetch:</span>
                  <span
                    className={
                      strategy?.prefetchResources
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {strategy?.prefetchResources ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Advanced Features
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Advanced Features:</span>
                  <span
                    className={
                      enableAdvancedFeatures ? "text-green-600" : "text-red-600"
                    }
                  >
                    {enableAdvancedFeatures ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Background Sync:</span>
                  <span
                    className={
                      shouldEnableBackgroundSync
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {shouldEnableBackgroundSync ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Push Notifications:</span>
                  <span
                    className={
                      shouldEnablePushNotifications
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {shouldEnablePushNotifications ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Requests:</span>
                  <span className="font-medium">{maxConcurrentRequests}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Loading Tests */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Resource Loading Tests
            </h3>
            <button
              onClick={testResourceLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Run Tests
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Should Load
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.actual
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.actual ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {result.actual
                          ? "Meets loading criteria"
                          : "Filtered by adaptive loading"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Image Optimization Demo */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Image Optimization Demo
            </h3>
            <button
              onClick={testImageOptimization}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Test Optimization
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { width: 1920, height: 1080, label: "Large Image" },
              { width: 800, height: 600, label: "Medium Image" },
              { width: 400, height: 300, label: "Small Image" },
            ].map((size, index) => {
              const optimized = getOptimalImageSize(size);
              const reduction = Math.round(
                (1 -
                  (optimized.width * optimized.height) /
                    (size.width * size.height)) *
                  100
              );

              return (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {size.label}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Original:</span>
                      <span>
                        {size.width}×{size.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimized:</span>
                      <span>
                        {optimized.width}×{optimized.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reduction:</span>
                      <span
                        className={
                          reduction > 0 ? "text-green-600" : "text-gray-600"
                        }
                      >
                        {reduction}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLoadingExample;
