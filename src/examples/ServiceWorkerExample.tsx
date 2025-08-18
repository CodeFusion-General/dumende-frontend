// Service Worker Example Component
// Demonstrates service worker functionality and PWA features

import React from "react";
import { useServiceWorker, usePWAInstall } from "../hooks/useServiceWorker";

export const ServiceWorkerExample: React.FC = () => {
  const {
    state,
    cacheStatus,
    isOnline,
    register,
    unregister,
    update,
    clearCache,
    refreshCacheStatus,
    isSupported,
    canInstall,
    isStandalone,
  } = useServiceWorker();

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallPWA = async () => {
    const success = await install();
    if (success) {
      console.log("PWA installed successfully");
    } else {
      console.log("PWA installation failed or was cancelled");
    }
  };

  const handleClearSpecificCache = () => {
    clearCache("dumende-mobile-v1");
  };

  const handleClearAllCaches = () => {
    clearCache();
  };

  const getCacheInfo = () => {
    const totalCaches = Object.keys(cacheStatus).length;
    const totalCachedItems = Object.values(cacheStatus).reduce(
      (total, cache) => total + cache.size,
      0
    );
    return { totalCaches, totalCachedItems };
  };

  const { totalCaches, totalCachedItems } = getCacheInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Service Worker & PWA Management
        </h2>

        {/* Service Worker Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Support Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Service Worker:</span>
                <span
                  className={isSupported ? "text-green-600" : "text-red-600"}
                >
                  {isSupported ? "Supported" : "Not Supported"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>PWA Install:</span>
                <span
                  className={canInstall ? "text-green-600" : "text-red-600"}
                >
                  {canInstall ? "Available" : "Not Available"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Standalone Mode:</span>
                <span
                  className={isStandalone ? "text-green-600" : "text-gray-600"}
                >
                  {isStandalone ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              Registration Status
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Registered:</span>
                <span
                  className={
                    state.isRegistered ? "text-green-600" : "text-red-600"
                  }
                >
                  {state.isRegistered ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Updating:</span>
                <span
                  className={
                    state.isUpdating ? "text-yellow-600" : "text-gray-600"
                  }
                >
                  {state.isUpdating ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has Update:</span>
                <span
                  className={
                    state.hasUpdate ? "text-blue-600" : "text-gray-600"
                  }
                >
                  {state.hasUpdate ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">
              Network & Cache
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Online:</span>
                <span className={isOnline ? "text-green-600" : "text-red-600"}>
                  {isOnline ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Caches:</span>
                <span className="text-gray-700">{totalCaches}</span>
              </div>
              <div className="flex justify-between">
                <span>Cached Items:</span>
                <span className="text-gray-700">{totalCachedItems}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        {/* Update Available */}
        {state.hasUpdate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Update Available
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              A new version of the app is available. Click update to get the
              latest features.
            </p>
            <button
              onClick={update}
              disabled={state.isUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {state.isUpdating ? "Updating..." : "Update Now"}
            </button>
          </div>
        )}

        {/* PWA Installation */}
        {isInstallable && !isInstalled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Install App</h3>
            <p className="text-green-700 text-sm mb-3">
              Install Dumende as a Progressive Web App for a better mobile
              experience.
            </p>
            <button
              onClick={handleInstallPWA}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Install App
            </button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={register}
            disabled={state.isRegistered || state.isUpdating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Register SW
          </button>

          <button
            onClick={unregister}
            disabled={!state.isRegistered || state.isUpdating}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Unregister SW
          </button>

          <button
            onClick={update}
            disabled={!state.isRegistered || state.isUpdating}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
          >
            Check Update
          </button>

          <button
            onClick={refreshCacheStatus}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            Refresh Status
          </button>
        </div>

        {/* Cache Management */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cache Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={handleClearSpecificCache}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
            >
              Clear Static Cache
            </button>

            <button
              onClick={handleClearAllCaches}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Clear All Caches
            </button>
          </div>

          {/* Cache Details */}
          {Object.keys(cacheStatus).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Cache Details</h4>
              <div className="space-y-2">
                {Object.entries(cacheStatus).map(([cacheName, cache]) => (
                  <div
                    key={cacheName}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium text-gray-700">
                      {cacheName}
                    </span>
                    <span className="text-gray-600">{cache.size} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Network Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Network Information
          </h3>
          <NetworkInfo />
        </div>
      </div>
    </div>
  );
};

// Network Information Component
const NetworkInfo: React.FC = () => {
  const getConnectionInfo = () => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType || "unknown",
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      };
    }

    return null;
  };

  const connectionInfo = getConnectionInfo();

  if (!connectionInfo) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 text-sm">
          Network information not available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Connection Type:</span>
          <div className="text-gray-600">{connectionInfo.effectiveType}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Downlink:</span>
          <div className="text-gray-600">{connectionInfo.downlink} Mbps</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">RTT:</span>
          <div className="text-gray-600">{connectionInfo.rtt} ms</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Data Saver:</span>
          <div className="text-gray-600">
            {connectionInfo.saveData ? "On" : "Off"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerExample;
