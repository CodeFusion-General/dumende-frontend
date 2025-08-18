import { lazy, ComponentType, LazyExoticComponent } from "react";
import { mobileDetection } from "./mobileDetection";

export interface LazyLoadOptions {
  fallback?: ComponentType;
  priority?: "critical" | "high" | "medium" | "low";
  mobileOptimized?: boolean;
  preload?: boolean;
}

/**
 * Enhanced lazy loading with mobile optimization
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    priority = "medium",
    mobileOptimized = false,
    preload = false,
  } = options;

  // Create the lazy component
  const LazyComponent = lazy(() => {
    // Add artificial delay for low priority components on mobile
    if (mobileOptimized) {
      const deviceInfo = mobileDetection.detectMobileDevice();

      if (deviceInfo.isLowEndDevice && priority === "low") {
        // Delay low priority components on low-end devices
        return new Promise((resolve) => {
          setTimeout(() => {
            importFn().then(resolve);
          }, 100);
        });
      }

      if (
        deviceInfo.connectionType === "slow-2g" ||
        deviceInfo.connectionType === "2g"
      ) {
        // Further delay on slow connections
        return new Promise((resolve) => {
          setTimeout(
            () => {
              importFn().then(resolve);
            },
            priority === "low" ? 200 : 50
          );
        });
      }
    }

    return importFn();
  });

  // Preload if requested and not on low-end device
  if (preload && typeof window !== "undefined") {
    const deviceInfo = mobileDetection.detectMobileDevice();

    if (!deviceInfo.isLowEndDevice) {
      // Preload after a short delay
      setTimeout(
        () => {
          importFn().catch(() => {
            // Ignore preload errors
          });
        },
        priority === "critical" ? 0 : 1000
      );
    }
  }

  return LazyComponent;
}

/**
 * Preload a component based on device capabilities
 */
export function preloadComponent(
  importFn: () => Promise<any>,
  condition: () => boolean = () => true
): void {
  if (typeof window === "undefined") return;

  const deviceInfo = mobileDetection.detectMobileDevice();

  // Don't preload on low-end devices or slow connections
  if (
    deviceInfo.isLowEndDevice ||
    deviceInfo.connectionType === "slow-2g" ||
    deviceInfo.connectionType === "2g"
  ) {
    return;
  }

  if (condition()) {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Ignore preload errors
        });
      });
    } else {
      setTimeout(() => {
        importFn().catch(() => {
          // Ignore preload errors
        });
      }, 100);
    }
  }
}

/**
 * Create mobile-optimized lazy routes
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    priority: getRoutePriority(routeName),
    mobileOptimized: true,
    preload: shouldPreloadRoute(routeName),
  });
}

/**
 * Determine route loading priority
 */
function getRoutePriority(
  routeName: string
): "critical" | "high" | "medium" | "low" {
  const criticalRoutes = ["home", "boats", "boat-details"];
  const highRoutes = ["auth", "register", "login"];
  const lowRoutes = ["admin", "dashboard", "vessels"];

  if (criticalRoutes.some((route) => routeName.includes(route))) {
    return "critical";
  }

  if (highRoutes.some((route) => routeName.includes(route))) {
    return "high";
  }

  if (lowRoutes.some((route) => routeName.includes(route))) {
    return "low";
  }

  return "medium";
}

/**
 * Determine if route should be preloaded
 */
function shouldPreloadRoute(routeName: string): boolean {
  const preloadRoutes = ["home", "boats"];
  return preloadRoutes.some((route) => routeName.includes(route));
}

/**
 * Batch preload multiple components
 */
export function batchPreload(
  imports: Array<() => Promise<any>>,
  options: { delay?: number; maxConcurrent?: number } = {}
): void {
  const { delay = 0, maxConcurrent = 2 } = options;

  if (typeof window === "undefined") return;

  const deviceInfo = mobileDetection.detectMobileDevice();

  // Skip batch preloading on low-end devices
  if (deviceInfo.isLowEndDevice) return;

  setTimeout(() => {
    let currentIndex = 0;
    let activePromises = 0;

    const loadNext = () => {
      while (activePromises < maxConcurrent && currentIndex < imports.length) {
        const importFn = imports[currentIndex++];
        activePromises++;

        importFn()
          .catch(() => {
            // Ignore errors
          })
          .finally(() => {
            activePromises--;
            loadNext();
          });
      }
    };

    loadNext();
  }, delay);
}

/**
 * Mobile-aware component splitting utility
 */
export class ComponentSplitter {
  private static loadedComponents = new Set<string>();

  static createSplitComponent<T extends ComponentType<any>>(
    componentName: string,
    importFn: () => Promise<{ default: T }>,
    fallback?: ComponentType
  ): LazyExoticComponent<T> {
    return createLazyComponent(importFn, {
      priority: this.getComponentPriority(componentName),
      mobileOptimized: true,
      fallback,
    });
  }

  private static getComponentPriority(
    componentName: string
  ): "critical" | "high" | "medium" | "low" {
    const criticalComponents = ["Hero", "Navigation", "ErrorBoundary"];
    const heavyComponents = [
      "Testimonials",
      "Dashboard",
      "VesselsPage",
      "Charts",
    ];

    if (criticalComponents.includes(componentName)) {
      return "critical";
    }

    if (heavyComponents.includes(componentName)) {
      return "low";
    }

    return "medium";
  }

  static markAsLoaded(componentName: string): void {
    this.loadedComponents.add(componentName);
  }

  static isLoaded(componentName: string): boolean {
    return this.loadedComponents.has(componentName);
  }
}
