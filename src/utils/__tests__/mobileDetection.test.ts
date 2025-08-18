import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mobileDetection,
  isMobileDevice,
  isLowEndDevice,
  getDeviceType,
} from "../mobileDetection";

// Mock navigator properties
const mockNavigator = (overrides: Partial<Navigator> = {}) => {
  Object.defineProperty(window, "navigator", {
    value: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      ...overrides,
    },
    writable: true,
  });
};

// Mock screen properties
const mockScreen = (width: number, height: number) => {
  Object.defineProperty(window, "screen", {
    value: {
      width,
      height,
    },
    writable: true,
  });
};

describe("MobileDetectionService", () => {
  beforeEach(() => {
    mobileDetection.reset();
    vi.clearAllMocks();
  });

  describe("detectMobileDevice", () => {
    it("should detect iPhone as mobile device", () => {
      mockNavigator({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
      });
      mockScreen(375, 812);

      const deviceInfo = mobileDetection.detectMobileDevice();

      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.browser.isSafari).toBe(true);
      expect(deviceInfo.screenSize.width).toBe(375);
    });

    it("should detect Android as mobile device", () => {
      mockNavigator({
        userAgent:
          "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      });
      mockScreen(360, 760);

      const deviceInfo = mobileDetection.detectMobileDevice();

      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.browser.isChrome).toBe(true);
    });

    it("should detect desktop as non-mobile", () => {
      mockNavigator({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      });
      mockScreen(1920, 1080);

      const deviceInfo = mobileDetection.detectMobileDevice();

      expect(deviceInfo.isMobile).toBe(false);
    });

    it("should classify device performance correctly", () => {
      // Mock low-end device
      mockNavigator({
        userAgent: "Mozilla/5.0 (Linux; Android 8.0; SM-J330F)",
        // @ts-ignore
        deviceMemory: 2,
      });
      mockScreen(720, 1280);

      const deviceInfo = mobileDetection.detectMobileDevice();

      expect(deviceInfo.deviceType).toBe("low-end");
      expect(deviceInfo.isLowEndDevice).toBe(true);
    });

    it("should handle missing connection API gracefully", () => {
      mockNavigator({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      });

      const deviceInfo = mobileDetection.detectMobileDevice();

      expect(deviceInfo.connectionType).toBe("unknown");
    });
  });

  describe("detectFeatureSupport", () => {
    it("should detect basic feature support", () => {
      // Mock IntersectionObserver
      Object.defineProperty(window, "IntersectionObserver", {
        value: vi.fn(),
        writable: true,
      });

      // Mock serviceWorker
      Object.defineProperty(navigator, "serviceWorker", {
        value: {},
        writable: true,
      });

      const features = mobileDetection.detectFeatureSupport();

      expect(features.intersectionObserver).toBe(true);
      expect(features.serviceWorker).toBe(true);
    });

    it("should detect touch events support", () => {
      Object.defineProperty(window, "ontouchstart", {
        value: null,
        writable: true,
      });

      const features = mobileDetection.detectFeatureSupport();

      expect(features.touchEvents).toBe(true);
    });
  });

  describe("utility functions", () => {
    it("should provide correct mobile detection", () => {
      mockNavigator({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      });

      expect(isMobileDevice()).toBe(true);
    });

    it("should provide correct low-end device detection", () => {
      mockNavigator({
        userAgent: "Mozilla/5.0 (Linux; Android 8.0; SM-J330F)",
        // @ts-ignore
        deviceMemory: 2,
      });
      mockScreen(720, 1280);

      expect(isLowEndDevice()).toBe(true);
      expect(getDeviceType()).toBe("low-end");
    });
  });

  describe("network information", () => {
    it("should handle missing network API", () => {
      const networkInfo = mobileDetection.getNetworkInfo();
      expect(networkInfo).toBeNull();
    });

    it("should return network info when available", () => {
      // @ts-ignore
      Object.defineProperty(navigator, "connection", {
        value: {
          effectiveType: "4g",
          downlink: 10,
          rtt: 100,
          saveData: false,
        },
        writable: true,
      });

      const networkInfo = mobileDetection.getNetworkInfo();
      expect(networkInfo).toEqual({
        effectiveType: "4g",
        downlink: 10,
        rtt: 100,
        saveData: false,
      });
    });
  });
});
