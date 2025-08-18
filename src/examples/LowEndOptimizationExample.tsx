// Low-End Device Optimization Example Component
// Demonstrates adaptive optimizations for low-end mobile devices

import React, { useState, useEffect } from "react";
import {
  useLowEndOptimization,
  useSimplifiedUI,
  useMemoryConsciousLoading,
  usePerformanceAwareFeatures,
} from "../hooks/useLowEndOptimization";
import {
  AdaptiveTestimonials,
  AdaptiveImageGallery,
  AdaptiveBoatCard,
  AdaptiveComponent,
} from "../components/adaptive/AdaptiveComponentLoader";

export const LowEndOptimizationExample: React.FC = () => {
  const {
    isLowEndDevice,
    optimizations,
    loadingStrategy,
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
  } = useLowEndOptimization();

  const {
    loadedComponents,
    canLoadMoreComponents,
    loadComponent,
    unloadComponent,
  } = useMemoryConsciousLoading();

  const { featureFlags, animationConfig, imageConfig, shouldOptimize } =
    usePerformanceAwareFeatures();

  const [testResults, setTestResults] = useState<any[]>([]);

  // Test component loading decisions
  const testComponentLoading = () => {
    const components = [
      { name: "Header", priority: 95 },
      { name: "Navigation", priority: 90 },
      { name: "Hero", priority: 85 },
      { name: "FeaturedBoats", priority: 70 },
      { name: "Testimonials", priority: 50 },
      { name: "Newsletter", priority: 30 },
      { name: "ParallaxSection", priority: 20 },
      { name: "VideoBackground", priority: 15 },
    ];

    const results = components.map((component) => ({
      ...component,
      shouldLoad: shouldLoadComponent(component.name, component.priority),
      shouldSimplify: shouldUseSimplifiedComponent(component.name),
      isLoaded: loadedComponents.includes(component.name),
    }));

    setTestResults(results);
  };

  // Test memory optimization
  const handleOptimizeMemory = async () => {
    console.log("Starting memory optimization...");
    await optimizeMemory();
    console.log("Memory optimization completed");
  };

  // Test cache clearing
  const handleClearCache = async () => {
    console.log("Clearing non-essential cache...");
    await clearCache();
    console.log("Cache cleared");
  };

  // Test component unloading
  const handleUnloadComponents = async () => {
    console.log("Unloading inactive components...");
    await unloadInactiveComponents();
    console.log("Components unloaded");
  };

  useEffect(() => {
    testComponentLoading();
  }, [shouldLoadComponent, shouldUseSimplifiedComponent, loadedComponents]);

  // Sample data for adaptive components
  const sampleReviews = [
    {
      id: "1",
      rating: 5,
      comment:
        "Amazing yacht experience! The crew was fantastic and the boat was in perfect condition.",
      customerName: "John Smith",
      date: "2024-01-15",
      boatName: "Ocean Dream",
    },
    {
      id: "2",
      rating: 4,
      comment:
        "Great day out on the water. Would definitely recommend to others.",
      customerName: "Sarah Johnson",
      date: "2024-01-10",
      boatName: "Sea Breeze",
    },
  ];

  const sampleImages = [
    {
      id: "1",
      src: "/images/yacht1.jpg",
      alt: "Luxury yacht exterior",
      thumbnail: "/images/yacht1-thumb.jpg",
    },
    {
      id: "2",
      src: "/images/yacht2.jpg",
      alt: "Yacht interior lounge",
      thumbnail: "/images/yacht2-thumb.jpg",
    },
  ];

  const sampleBoat = {
    id: "1",
    name: "Ocean Dream",
    type: "Luxury Yacht",
    location: "Miami Beach",
    capacity: 12,
    pricePerDay: 2500,
    rating: 4.8,
    reviewCount: 24,
    imageUrl: "/images/yacht1.jpg",
    features: ["WiFi", "Kitchen", "Bathroom", "Sound System"],
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Low-End Device Optimization Dashboard
        </h2>

        {/* Device Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            className={`p-4 rounded-lg ${
              isLowEndDevice ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <h3
              className={`font-semibold mb-3 ${
                isLowEndDevice ? "text-red-900" : "text-green-900"
              }`}
            >
              Device Classification
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Low-End Device:</span>
                <span
                  className={`font-medium ${
                    isLowEndDevice ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isLowEndDevice ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Simplified UI:</span>
                <span
                  className={
                    optimizations.enableSimplifiedUI
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }
                >
                  {optimizations.enableSimplifiedUI ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory Optimization:</span>
                <span
                  className={
                    optimizations.enableMemoryOptimization
                      ? "text-blue-600"
                      : "text-gray-600"
                  }
                >
                  {optimizations.enableMemoryOptimization
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Memory Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Usage:</span>
                <span
                  className={
                    memoryUsage > 0.8 ? "text-red-600" : "text-green-600"
                  }
                >
                  {Math.round(memoryUsage * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Constrained:</span>
                <span
                  className={
                    isMemoryConstrained ? "text-red-600" : "text-green-600"
                  }
                >
                  {isMemoryConstrained ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Loaded Components:</span>
                <span>{loadedComponents.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Can Load More:</span>
                <span
                  className={
                    canLoadMoreComponents ? "text-green-600" : "text-red-600"
                  }
                >
                  {canLoadMoreComponents ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibent text-purple-900 mb-3">Performance</h3>
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
                <span>Should Optimize:</span>
                <span
                  className={
                    shouldOptimize ? "text-yellow-600" : "text-green-600"
                  }
                >
                  {shouldOptimize ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Animation Duration:</span>
                <span>{animationConfig.duration}ms</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-3">Constraints</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Max Components:</span>
                <span>{optimizations.maxComponentsPerPage}</span>
              </div>
              <div className="flex justify-between">
                <span>Image Quality:</span>
                <span>
                  {Math.round(optimizations.imageQualityReduction * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Image Size:</span>
                <span>
                  {optimizations.maxImageSize.width}x
                  {optimizations.maxImageSize.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Request Timeout:</span>
                <span>{optimizations.requestTimeout}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Feature Flags
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(featureFlags).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {feature.replace(/([A-Z])/g, " $1").toLowerCase()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {enabled ? "On" : "Off"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Component Loading Tests */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Component Loading Analysis
            </h3>
            <button
              onClick={testComponentLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Refresh Analysis
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Should Load
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Simplify
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.shouldLoad
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.shouldLoad ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.shouldSimplify
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {result.shouldSimplify ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.isLoaded ? "Loaded" : "Not Loaded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Memory Management Controls */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Memory Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleOptimizeMemory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Optimize Memory
            </button>

            <button
              onClick={handleClearCache}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
            >
              Clear Cache
            </button>

            <button
              onClick={handleUnloadComponents}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Unload Inactive
            </button>
          </div>
        </div>

        {/* Adaptive Components Demo */}
        <div className="space-y-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Adaptive Components Demo
          </h3>

          {/* Adaptive Testimonials */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Adaptive Testimonials
            </h4>
            <AdaptiveTestimonials reviews={sampleReviews} />
          </div>

          {/* Adaptive Image Gallery */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Adaptive Image Gallery
            </h4>
            <AdaptiveImageGallery images={sampleImages} showThumbnails={true} />
          </div>

          {/* Adaptive Boat Card */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Adaptive Boat Card
            </h4>
            <div className="max-w-sm">
              <AdaptiveBoatCard boat={sampleBoat} showFeatures={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowEndOptimizationExample;
