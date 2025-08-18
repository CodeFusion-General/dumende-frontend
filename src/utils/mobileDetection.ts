export interface MobileDeviceInfo {
  isMobile: boolean;
  isLowEndDevice: boolean;
  connectionType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  screenSize: { width: number; height: number };
  pixelRatio: number;
  memoryLimit: number;
  deviceType: "low-end" | "mid-range" | "high-end";
  browser: {
    name: string;
    version: string;
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
  };
}

export interface FeatureSupport {
  webp: boolean;
  avif: boolean;
  intersectionObserver: boolean;
  serviceWorker: boolean;
  webGL: boolean;
  css3DTransforms: boolean;
  touchEvents: boolean;
}

class MobileDetectionService {
  private deviceInfo: MobileDeviceInfo | null = null;
  private featureSupport: FeatureSupport | null = null;

  /**
   * Detect if the current device is mobile
   */
  detectMobileDevice(): MobileDeviceInfo {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    const userAgent = navigator.userAgent;
    const isMobile = this.isMobileUserAgent(userAgent);
    const screenSize = this.getScreenSize();
    const pixelRatio = window.devicePixelRatio || 1;
    const connectionType = this.getConnectionType();
    const memoryLimit = this.getMemoryLimit();
    const browser = this.getBrowserInfo(userAgent);

    // Determine if it's a low-end device based on multiple factors
    const isLowEndDevice = this.isLowEndDevice(
      memoryLimit,
      screenSize,
      connectionType
    );
    const deviceType = this.classifyDevicePerformance(
      memoryLimit,
      screenSize,
      connectionType
    );

    this.deviceInfo = {
      isMobile,
      isLowEndDevice,
      connectionType,
      screenSize,
      pixelRatio,
      memoryLimit,
      deviceType,
      browser,
    };

    return this.deviceInfo;
  }

  /**
   * Detect mobile device from user agent
   */
  private isMobileUserAgent(userAgent: string): boolean {
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  }

  /**
   * Get screen size information
   */
  private getScreenSize(): { width: number; height: number } {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  /**
   * Get network connection type
   */
  private getConnectionType(): "slow-2g" | "2g" | "3g" | "4g" | "unknown" {
    // @ts-ignore - navigator.connection is not in all TypeScript definitions
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (!connection) {
      return "unknown";
    }

    const effectiveType = connection.effectiveType;

    switch (effectiveType) {
      case "slow-2g":
        return "slow-2g";
      case "2g":
        return "2g";
      case "3g":
        return "3g";
      case "4g":
        return "4g";
      default:
        return "unknown";
    }
  }

  /**
   * Estimate device memory limit
   */
  private getMemoryLimit(): number {
    // @ts-ignore - navigator.deviceMemory is not in all TypeScript definitions
    const deviceMemory = navigator.deviceMemory;

    if (deviceMemory) {
      return deviceMemory * 1024; // Convert GB to MB
    }

    // Fallback estimation based on user agent and screen size
    const userAgent = navigator.userAgent;
    const screenSize = this.getScreenSize();

    // Basic heuristics for memory estimation
    if (userAgent.includes("iPhone")) {
      if (userAgent.includes("iPhone 6") || userAgent.includes("iPhone 7")) {
        return 2048; // 2GB
      }
      return 4096; // 4GB for newer iPhones
    }

    if (userAgent.includes("Android")) {
      if (screenSize.width <= 720) {
        return 2048; // 2GB for lower resolution Android
      }
      return 4096; // 4GB for higher resolution Android
    }

    return 4096; // Default 4GB
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(userAgent: string): MobileDeviceInfo["browser"] {
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    let name = "unknown";
    let version = "unknown";

    if (isSafari) {
      name = "Safari";
      const match = userAgent.match(/Version\/([0-9.]+)/);
      version = match ? match[1] : "unknown";
    } else if (isChrome) {
      name = "Chrome";
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      version = match ? match[1] : "unknown";
    } else if (isFirefox) {
      name = "Firefox";
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      version = match ? match[1] : "unknown";
    }

    return {
      name,
      version,
      isSafari,
      isChrome,
      isFirefox,
    };
  }

  /**
   * Determine if device is low-end based on multiple factors
   */
  private isLowEndDevice(
    memoryLimit: number,
    screenSize: { width: number; height: number },
    connectionType: string
  ): boolean {
    // Low memory (less than 3GB)
    if (memoryLimit < 3072) {
      return true;
    }

    // Low resolution screen
    if (screenSize.width <= 720) {
      return true;
    }

    // Slow connection
    if (connectionType === "slow-2g" || connectionType === "2g") {
      return true;
    }

    return false;
  }

  /**
   * Classify device performance level
   */
  private classifyDevicePerformance(
    memoryLimit: number,
    screenSize: { width: number; height: number },
    connectionType: string
  ): "low-end" | "mid-range" | "high-end" {
    // High-end: 6GB+ RAM, high resolution, good connection
    if (
      memoryLimit >= 6144 &&
      screenSize.width >= 1080 &&
      (connectionType === "4g" || connectionType === "unknown")
    ) {
      return "high-end";
    }

    // Low-end: less than 3GB RAM, low resolution, or slow connection
    if (
      memoryLimit < 3072 ||
      screenSize.width <= 720 ||
      connectionType === "slow-2g" ||
      connectionType === "2g"
    ) {
      return "low-end";
    }

    // Everything else is mid-range
    return "mid-range";
  }

  /**
   * Detect feature support for progressive enhancement
   */
  detectFeatureSupport(): FeatureSupport {
    if (this.featureSupport) {
      return this.featureSupport;
    }

    this.featureSupport = {
      webp: this.supportsWebP(),
      avif: this.supportsAVIF(),
      intersectionObserver: "IntersectionObserver" in window,
      serviceWorker: "serviceWorker" in navigator,
      webGL: this.supportsWebGL(),
      css3DTransforms: this.supports3DTransforms(),
      touchEvents: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    };

    return this.featureSupport;
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  /**
   * Check AVIF support
   */
  private supportsAVIF(): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
    } catch {
      return false;
    }
  }

  /**
   * Check WebGL support
   */
  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      return false;
    }
  }

  /**
   * Check 3D transforms support
   */
  private supports3DTransforms(): boolean {
    const el = document.createElement("div");
    el.style.transform = "translate3d(0, 0, 0)";
    return el.style.transform !== "";
  }

  /**
   * Get network information if available
   */
  getNetworkInfo() {
    // @ts-ignore
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (!connection) {
      return null;
    }

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Reset cached detection results (useful for testing)
   */
  reset(): void {
    this.deviceInfo = null;
    this.featureSupport = null;
  }
}

// Export singleton instance
export const mobileDetection = new MobileDetectionService();

// Export utility functions
export const isMobileDevice = (): boolean => {
  return mobileDetection.detectMobileDevice().isMobile;
};

export const isLowEndDevice = (): boolean => {
  return mobileDetection.detectMobileDevice().isLowEndDevice;
};

export const getDeviceType = (): "low-end" | "mid-range" | "high-end" => {
  return mobileDetection.detectMobileDevice().deviceType;
};

export const getConnectionType = ():
  | "slow-2g"
  | "2g"
  | "3g"
  | "4g"
  | "unknown" => {
  return mobileDetection.detectMobileDevice().connectionType;
};

export const supportsFeature = (feature: keyof FeatureSupport): boolean => {
  return mobileDetection.detectFeatureSupport()[feature];
};
