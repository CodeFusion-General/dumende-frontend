// React hook for Service Worker management
// Provides reactive state management for service worker functionality

import { useState, useEffect, useCallback } from "react";
import {
  serviceWorkerManager,
  ServiceWorkerState,
  CacheStatus,
} from "../services/serviceWorkerManager";

export interface UseServiceWorkerReturn {
  // State
  state: ServiceWorkerState;
  cacheStatus: CacheStatus;
  isOnline: boolean;

  // Actions
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  update: () => Promise<void>;
  clearCache: (cacheName?: string) => Promise<void>;
  refreshCacheStatus: () => Promise<void>;

  // Utilities
  isSupported: boolean;
  canInstall: boolean;
  isStandalone: boolean;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isUpdating: false,
    hasUpdate: false,
    error: null,
  });

  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check if service worker is supported
  const isSupported = serviceWorkerManager.isSupported();

  // Check if app can be installed as PWA
  const canInstall = "beforeinstallprompt" in window;

  // Check if app is running in standalone mode
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  // Register service worker
  const register = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Service workers not supported",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      const registration = await serviceWorkerManager.register();

      setState((prev) => ({
        ...prev,
        isRegistered: !!registration,
        isUpdating: false,
      }));

      // Refresh cache status after registration
      await refreshCacheStatus();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }));
    }
  }, [isSupported]);

  // Unregister service worker
  const unregister = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      const success = await serviceWorkerManager.unregister();

      setState((prev) => ({
        ...prev,
        isRegistered: !success,
        isUpdating: false,
        hasUpdate: false,
      }));

      setCacheStatus({});
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : "Unregistration failed",
      }));
    }
  }, []);

  // Update service worker
  const update = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      await serviceWorkerManager.update();

      setState((prev) => ({
        ...prev,
        isUpdating: false,
        hasUpdate: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : "Update failed",
      }));
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(async (cacheName?: string) => {
    try {
      await serviceWorkerManager.clearCache(cacheName);
      await refreshCacheStatus();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Cache clear failed",
      }));
    }
  }, []);

  // Refresh cache status
  const refreshCacheStatus = useCallback(async () => {
    try {
      const status = await serviceWorkerManager.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error("Failed to refresh cache status:", error);
    }
  }, []);

  // Set up service worker event listeners
  useEffect(() => {
    if (!isSupported) return;

    const handleRegistered = () => {
      setState((prev) => ({ ...prev, isRegistered: true }));
      refreshCacheStatus();
    };

    const handleUnregistered = () => {
      setState((prev) => ({
        ...prev,
        isRegistered: false,
        hasUpdate: false,
      }));
      setCacheStatus({});
    };

    const handleUpdateFound = () => {
      setState((prev) => ({ ...prev, isUpdating: true }));
    };

    const handleUpdateAvailable = () => {
      setState((prev) => ({
        ...prev,
        hasUpdate: true,
        isUpdating: false,
      }));
    };

    const handleControllerChange = () => {
      setState((prev) => ({ ...prev, hasUpdate: false }));
    };

    const handleError = (error: any) => {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Service worker error",
        isUpdating: false,
      }));
    };

    const handleCacheCleared = () => {
      refreshCacheStatus();
    };

    // Add event listeners
    serviceWorkerManager.on("registered", handleRegistered);
    serviceWorkerManager.on("unregistered", handleUnregistered);
    serviceWorkerManager.on("updateFound", handleUpdateFound);
    serviceWorkerManager.on("updateAvailable", handleUpdateAvailable);
    serviceWorkerManager.on("controllerChange", handleControllerChange);
    serviceWorkerManager.on("error", handleError);
    serviceWorkerManager.on("cacheCleared", handleCacheCleared);

    // Check initial registration state
    serviceWorkerManager.getRegistration().then((registration) => {
      if (registration) {
        setState((prev) => ({ ...prev, isRegistered: true }));
        refreshCacheStatus();
      }
    });

    // Cleanup
    return () => {
      serviceWorkerManager.off("registered", handleRegistered);
      serviceWorkerManager.off("unregistered", handleUnregistered);
      serviceWorkerManager.off("updateFound", handleUpdateFound);
      serviceWorkerManager.off("updateAvailable", handleUpdateAvailable);
      serviceWorkerManager.off("controllerChange", handleControllerChange);
      serviceWorkerManager.off("error", handleError);
      serviceWorkerManager.off("cacheCleared", handleCacheCleared);
    };
  }, [isSupported, refreshCacheStatus]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-register service worker on mount
  useEffect(() => {
    if (isSupported && !state.isRegistered) {
      register();
    }
  }, [isSupported, state.isRegistered, register]);

  return {
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
  };
}

// Hook for PWA installation
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();

      setInstallPrompt(event);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      const outcome = await result.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error("PWA installation failed:", error);
      return false;
    }
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    install,
  };
}

export default useServiceWorker;
