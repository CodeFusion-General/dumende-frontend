import React, { useEffect, useState } from "react";
import {
  mobilePerformanceMonitoring,
  type PerformanceReport,
} from "../services/mobilePerformanceMonitoring";
import {
  mobileErrorTracking,
  type MobileErrorReport,
} from "../services/mobileErrorTracking";
import {
  performanceAnalyticsDashboard,
  type PerformanceAlert,
  type PerformanceMetrics,
} from "../services/performanceAnalyticsDashboard";

/**
 * Example component demonstrating mobile performance monitoring integration
 */
export const PerformanceMonitoringExample: React.FC = () => {
  const [performanceReport, setPerformanceReport] =
    useState<PerformanceReport | null>(null);
  const [currentMetrics, setCurrentMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Subscribe to performance reports
    const unsubscribePerformance =
      mobilePerformanceMonitoring.onPerformanceReport((report) => {
        setPerformanceReport(report);
        console.log("Performance Report:", report);
      });

    // Subscribe to error reports
    const unsubscribeErrors = mobileErrorTracking.onErrorReport((error) => {
      console.log("Error Report:", error);
    });

    // Subscribe to dashboard alerts
    const unsubscribeAlerts = performanceAnalyticsDashboard.onAlert((alert) => {
      setAlerts((prev) => [...prev, alert]);
      console.log("Performance Alert:", alert);
    });

    // Subscribe to metrics updates
    const unsubscribeMetrics = performanceAnalyticsDashboard.onMetricsUpdate(
      (metrics) => {
        setCurrentMetrics(metrics);
      }
    );

    // Start monitoring
    mobilePerformanceMonitoring.startMonitoring();
    mobileErrorTracking.startTracking();
    performanceAnalyticsDashboard.startMonitoring();
    setIsMonitoring(true);

    // Cleanup on unmount
    return () => {
      unsubscribePerformance();
      unsubscribeErrors();
      unsubscribeAlerts();
      unsubscribeMetrics();

      mobilePerformanceMonitoring.stopMonitoring();
      mobileErrorTracking.stopTracking();
      performanceAnalyticsDashboard.stopMonitoring();
    };
  }, []);

  const handleTestError = () => {
    // Test error reporting
    mobileErrorTracking.reportError(
      "Test error from performance monitoring example"
    );
  };

  const handleTestNetworkError = () => {
    // Test network error reporting
    mobileErrorTracking.reportNetworkError(
      "https://api.example.com/test",
      500,
      "Internal Server Error"
    );
  };

  const handleTestMemoryError = () => {
    // Test memory error reporting
    mobileErrorTracking.reportMemoryError(120 * 1024 * 1024); // 120MB
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    performanceAnalyticsDashboard.acknowledgeAlert(alertId);
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const formatBytes = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  const formatTime = (ms: number) => {
    return `${Math.round(ms)}ms`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Mobile Performance Monitoring Dashboard
      </h1>

      {/* Monitoring Status */}
      <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800">
          Monitoring Status: {isMonitoring ? "🟢 Active" : "🔴 Inactive"}
        </h2>
      </div>

      {/* Test Buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={handleTestError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test JavaScript Error
        </button>
        <button
          onClick={handleTestNetworkError}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test Network Error
        </button>
        <button
          onClick={handleTestMemoryError}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Memory Error
        </button>
      </div>

      {/* Current Performance Metrics */}
      {currentMetrics && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Current Performance Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Core Web Vitals */}
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold mb-2">Core Web Vitals</h3>
              <div className="space-y-1 text-sm">
                <div
                  className={`flex justify-between ${
                    currentMetrics.coreWebVitals.lcp.grade === "good"
                      ? "text-green-600"
                      : currentMetrics.coreWebVitals.lcp.grade ===
                        "needs-improvement"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <span>LCP:</span>
                  <span>
                    {formatTime(currentMetrics.coreWebVitals.lcp.value)} (
                    {currentMetrics.coreWebVitals.lcp.grade})
                  </span>
                </div>
                <div
                  className={`flex justify-between ${
                    currentMetrics.coreWebVitals.fid.grade === "good"
                      ? "text-green-600"
                      : currentMetrics.coreWebVitals.fid.grade ===
                        "needs-improvement"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <span>FID:</span>
                  <span>
                    {formatTime(currentMetrics.coreWebVitals.fid.value)} (
                    {currentMetrics.coreWebVitals.fid.grade})
                  </span>
                </div>
                <div
                  className={`flex justify-between ${
                    currentMetrics.coreWebVitals.cls.grade === "good"
                      ? "text-green-600"
                      : currentMetrics.coreWebVitals.cls.grade ===
                        "needs-improvement"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <span>CLS:</span>
                  <span>
                    {currentMetrics.coreWebVitals.cls.value.toFixed(3)} (
                    {currentMetrics.coreWebVitals.cls.grade})
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold mb-2">Memory Usage</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span>{formatBytes(currentMetrics.memoryUsage.current)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak:</span>
                  <span>{formatBytes(currentMetrics.memoryUsage.peak)}</span>
                </div>
                <div
                  className={`flex justify-between ${
                    currentMetrics.memoryUsage.pressure === "low"
                      ? "text-green-600"
                      : currentMetrics.memoryUsage.pressure === "medium"
                      ? "text-yellow-600"
                      : currentMetrics.memoryUsage.pressure === "high"
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  <span>Pressure:</span>
                  <span>{currentMetrics.memoryUsage.pressure}</span>
                </div>
              </div>
            </div>

            {/* Error Rate */}
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold mb-2">Error Rate</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Errors:</span>
                  <span>{currentMetrics.errorRate.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate (per min):</span>
                  <span>{currentMetrics.errorRate.rate}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Critical:</span>
                  <span>{currentMetrics.errorRate.criticalErrors}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Device & Network Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold mb-2">Device Info</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Mobile:</span>
                  <span>
                    {currentMetrics.deviceInfo.isMobile ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Browser:</span>
                  <span>{currentMetrics.deviceInfo.browserName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Viewport:</span>
                  <span>
                    {currentMetrics.deviceInfo.viewportSize.width}x
                    {currentMetrics.deviceInfo.viewportSize.height}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold mb-2">Network</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{currentMetrics.networkPerformance.effectiveType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downlink:</span>
                  <span>{currentMetrics.networkPerformance.downlink} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>RTT:</span>
                  <span>{currentMetrics.networkPerformance.rtt}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Performance Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(-5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${
                  alert.severity === "critical"
                    ? "bg-red-100 border-red-300"
                    : alert.severity === "high"
                    ? "bg-orange-100 border-orange-300"
                    : alert.severity === "medium"
                    ? "bg-yellow-100 border-yellow-300"
                    : "bg-blue-100 border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">
                      {alert.severity.toUpperCase()} - {alert.type}
                    </div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Performance Report */}
      {performanceReport && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Latest Performance Report
          </h2>
          <div className="text-sm">
            <div className="mb-2">
              <strong>Session ID:</strong> {performanceReport.sessionId}
            </div>
            <div className="mb-2">
              <strong>Timestamp:</strong>{" "}
              {performanceReport.timestamp.toLocaleString()}
            </div>
            <div className="mb-2">
              <strong>Page URL:</strong> {performanceReport.pageUrl}
            </div>
            <div className="mb-2">
              <strong>Device:</strong>{" "}
              {performanceReport.deviceInfo.isMobile ? "Mobile" : "Desktop"}(
              {performanceReport.deviceInfo.viewport.width}x
              {performanceReport.deviceInfo.viewport.height})
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>
          This example demonstrates the mobile performance monitoring system in
          action.
        </p>
        <p>
          Use the test buttons above to simulate different types of errors and
          see how they're tracked.
        </p>
        <p>
          The dashboard automatically collects performance metrics and generates
          alerts when thresholds are exceeded.
        </p>
      </div>
    </div>
  );
};

export default PerformanceMonitoringExample;
