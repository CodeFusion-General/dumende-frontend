// Service Worker Manager for Mobile Performance Optimization
// Handles registration, updates, and communication with service worker

export interface ServiceWorkerManager {
  register(): Promise<ServiceWorkerRegistration | null>;
  unregister(): Promise<boolean>;
  update(): Promise<void>;
  clearCache(cacheName?: string): Promise<void>;
  getCacheStatus(): Promise<CacheStatus>;
  isSupported(): boolean;
  getRegistration(): Promise<ServiceWorkerRegistration | null>;
}

export interface CacheStatus {
  [cacheName: string]: {
    size: number;
    urls: string[];
  };
}

export interface ServiceWorkerState {
  isRegistered: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  error: string | null;
}

class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: number | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.setupUpdateChecking();
  }

  /**
   * Check if service workers are supported
   */
  isSupported(): boolean {
    return "serviceWorker" in navigator && "caches" in window;
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn("[SW Manager] Service workers not supported");
      return null;
    }

    try {
      console.log("[SW Manager] Registering service worker...");

      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none", // Always check for updates
      });

      console.log("[SW Manager] Service worker registered successfully");

      // Set up event listeners
      this.setupEventListeners();

      // Check for updates
      await this.checkForUpdates();

      this.emit("registered", this.registration);
      return this.registration;
    } catch (error) {
      console.error("[SW Manager] Service worker registration failed:", error);
      this.emit("error", error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    try {
      const registration = await this.getRegistration();

      if (registration) {
        const result = await registration.unregister();
        console.log("[SW Manager] Service worker unregistered:", result);

        this.registration = null;
        this.clearUpdateInterval();
        this.emit("unregistered");

        return result;
      }

      return false;
    } catch (error) {
      console.error("[SW Manager] Failed to unregister service worker:", error);
      this.emit("error", error);
      return false;
    }
  }

  /**
   * Check for and install service worker updates
   */
  async update(): Promise<void> {
    try {
      const registration = await this.getRegistration();

      if (!registration) {
        throw new Error("No service worker registration found");
      }

      console.log("[SW Manager] Checking for updates...");
      await registration.update();

      // If there's a waiting worker, activate it
      if (registration.waiting) {
        await this.activateWaitingWorker();
      }
    } catch (error) {
      console.error("[SW Manager] Failed to update service worker:", error);
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Clear service worker cache
   */
  async clearCache(cacheName?: string): Promise<void> {
    try {
      if (this.isSupported() && navigator.serviceWorker.controller) {
        await this.sendMessage({
          type: "CLEAR_CACHE",
          payload: { cacheName },
        });

        console.log(`[SW Manager] Cache cleared: ${cacheName || "all"}`);
        this.emit("cacheCleared", cacheName);
      }
    } catch (error) {
      console.error("[SW Manager] Failed to clear cache:", error);
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Get cache status information
   */
  async getCacheStatus(): Promise<CacheStatus> {
    try {
      if (!this.isSupported() || !navigator.serviceWorker.controller) {
        return {};
      }

      const response = await this.sendMessage({
        type: "GET_CACHE_STATUS",
      });

      return response?.payload || {};
    } catch (error) {
      console.error("[SW Manager] Failed to get cache status:", error);
      return {};
    }
  }

  /**
   * Get current service worker registration
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) {
      return this.registration;
    }

    if (this.isSupported()) {
      this.registration = await navigator.serviceWorker.getRegistration();
      return this.registration;
    }

    return null;
  }

  /**
   * Send message to service worker
   */
  private async sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error("No service worker controller"));
        return;
      }

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      messageChannel.port1.onerror = (error) => {
        reject(error);
      };

      navigator.serviceWorker.controller.postMessage(message, [
        messageChannel.port2,
      ]);

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error("Service worker message timeout"));
      }, 10000);
    });
  }

  /**
   * Set up service worker event listeners
   */
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for service worker state changes
    this.registration.addEventListener("updatefound", () => {
      console.log("[SW Manager] Update found");
      this.emit("updateFound");

      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          console.log("[SW Manager] New worker state:", newWorker.state);

          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("[SW Manager] New content available");
            this.emit("updateAvailable", newWorker);
          }
        });
      }
    });

    // Listen for controller changes
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[SW Manager] Controller changed");
      this.emit("controllerChange");

      // Reload the page to get the new content
      if (!window.location.pathname.includes("/admin")) {
        window.location.reload();
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("[SW Manager] Message from service worker:", event.data);
      this.emit("message", event.data);
    });
  }

  /**
   * Activate waiting service worker
   */
  private async activateWaitingWorker(): Promise<void> {
    const registration = await this.getRegistration();

    if (registration?.waiting) {
      console.log("[SW Manager] Activating waiting worker...");
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  /**
   * Set up periodic update checking
   */
  private setupUpdateChecking(): void {
    // Check for updates every 30 minutes
    this.updateCheckInterval = window.setInterval(async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        console.error("[SW Manager] Update check failed:", error);
      }
    }, 30 * 60 * 1000);

    // Check for updates when page becomes visible
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.checkForUpdates().catch(console.error);
      }
    });
  }

  /**
   * Check for service worker updates
   */
  private async checkForUpdates(): Promise<void> {
    const registration = await this.getRegistration();

    if (registration) {
      await registration.update();
    }
  }

  /**
   * Clear update check interval
   */
  private clearUpdateInterval(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  /**
   * Event emitter functionality
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[SW Manager] Error in event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.clearUpdateInterval();
    this.listeners.clear();
    this.registration = null;
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManagerImpl();

// Utility functions for common operations
export const swUtils = {
  /**
   * Initialize service worker with error handling
   */
  async initialize(): Promise<boolean> {
    try {
      const registration = await serviceWorkerManager.register();
      return !!registration;
    } catch (error) {
      console.error("[SW Utils] Failed to initialize service worker:", error);
      return false;
    }
  },

  /**
   * Check if app is running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  },

  /**
   * Check if app can be installed as PWA
   */
  canInstall(): boolean {
    return "beforeinstallprompt" in window;
  },

  /**
   * Get network connection info
   */
  getConnectionInfo(): {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  } {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    return {};
  },

  /**
   * Preload critical resources
   */
  async preloadCriticalResources(urls: string[]): Promise<void> {
    if (!serviceWorkerManager.isSupported()) return;

    try {
      await serviceWorkerManager.sendMessage({
        type: "UPDATE_CACHE",
        payload: { urls },
      });
    } catch (error) {
      console.error("[SW Utils] Failed to preload resources:", error);
    }
  },
};

export default serviceWorkerManager;
