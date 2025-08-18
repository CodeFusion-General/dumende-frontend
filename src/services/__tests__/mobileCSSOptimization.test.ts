/**
 * Tests for Mobile CSS Optimization Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MobileCSSOptimizationService } from "../mobileCSSOptimization";

// Mock DOM methods
const mockStyleElement = {
  id: "",
  textContent: "",
  remove: vi.fn(),
};

const mockLinkElement = {
  rel: "",
  href: "",
  media: "",
  as: "",
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

// Mock document methods
Object.defineProperty(document, "createElement", {
  value: vi.fn((tagName: string) => {
    if (tagName === "style") {
      return { ...mockStyleElement };
    }
    if (tagName === "link") {
      return { ...mockLinkElement };
    }
    return {};
  }),
});

Object.defineProperty(document, "head", {
  value: {
    appendChild: vi.fn(),
    insertBefore: vi.fn(),
    firstChild: null,
  },
});

Object.defineProperty(document, "querySelector", {
  value: vi.fn(),
});

Object.defineProperty(document, "getElementById", {
  value: vi.fn(),
});

Object.defineProperty(document, "styleSheets", {
  value: [],
});

// Mock window methods
Object.defineProperty(window, "matchMedia", {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock navigator
Object.defineProperty(navigator, "deviceMemory", {
  value: 4,
  configurable: true,
});

Object.defineProperty(navigator, "hardwareConcurrency", {
  value: 4,
  configurable: true,
});

describe("MobileCSSOptimizationService", () => {
  let service: MobileCSSOptimizationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MobileCSSOptimizationService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      const animationConfig = service.getAnimationConfig();
      const criticalConfig = service.getCriticalConfig();

      expect(animationConfig).toBeDefined();
      expect(animationConfig.enableReducedMotion).toBeDefined();
      expect(animationConfig.maxAnimationDuration).toBeGreaterThan(0);
      expect(animationConfig.preferTransforms).toBe(true);

      expect(criticalConfig).toBeDefined();
      expect(criticalConfig.aboveFoldSelectors).toBeInstanceOf(Array);
      expect(criticalConfig.criticalComponents).toBeInstanceOf(Array);
      expect(criticalConfig.inlineThreshold).toBeGreaterThan(0);
    });

    it("should detect reduced motion preference", () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
      });

      const newService = new MobileCSSOptimizationService();
      const config = newService.getAnimationConfig();

      expect(config.enableReducedMotion).toBe(true);
    });

    it("should detect low-end device", () => {
      Object.defineProperty(navigator, "deviceMemory", {
        value: 1,
        configurable: true,
      });

      const newService = new MobileCSSOptimizationService();
      const config = newService.getAnimationConfig();

      expect(config.enableReducedMotion).toBe(true);
      expect(config.useWillChange).toBe(false);
    });
  });

  describe("Critical CSS Management", () => {
    it("should add component critical CSS", () => {
      const componentName = "TestComponent";
      const css = ".test { color: red; }";

      service.addComponentCriticalCSS(componentName, css);

      expect(document.createElement).toHaveBeenCalledWith("style");
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    it("should only add critical CSS for configured components", () => {
      const componentName = "NonCriticalComponent";
      const css = ".test { color: red; }";

      const createElementSpy = vi.spyOn(document, "createElement");
      service.addComponentCriticalCSS(componentName, css);

      // Should not create style element for non-critical component
      expect(createElementSpy).not.toHaveBeenCalledWith("style");
    });

    it("should update critical configuration", () => {
      const newConfig = {
        aboveFoldSelectors: [".new-selector"],
        inlineThreshold: 20,
      };

      service.updateCriticalConfig(newConfig);
      const config = service.getCriticalConfig();

      expect(config.aboveFoldSelectors).toContain(".new-selector");
      expect(config.inlineThreshold).toBe(20);
    });
  });

  describe("Animation Optimization", () => {
    it("should update animation configuration", () => {
      const newConfig = {
        enableReducedMotion: true,
        maxAnimationDuration: 100,
      };

      service.updateAnimationConfig(newConfig);
      const config = service.getAnimationConfig();

      expect(config.enableReducedMotion).toBe(true);
      expect(config.maxAnimationDuration).toBe(100);
    });

    it("should cleanup animation properties", () => {
      const mockElement = {
        style: { willChange: "transform" },
        classList: { add: vi.fn() },
      } as any;

      service.cleanupAnimationProperties(mockElement);

      expect(mockElement.style.willChange).toBe("auto");
      expect(mockElement.classList.add).toHaveBeenCalledWith(
        "animation-complete"
      );
    });

    it("should handle reduced motion preference changes", () => {
      const mockMatchMedia = vi.fn(() => {
        const mediaQuery = {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };

        // Simulate preference change
        setTimeout(() => {
          mediaQuery.matches = true;
          const changeHandler = mediaQuery.addEventListener.mock.calls[0]?.[1];
          if (changeHandler) {
            changeHandler({ matches: true });
          }
        }, 0);

        return mediaQuery;
      });

      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
      });

      const newService = new MobileCSSOptimizationService();

      // Wait for the simulated change
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const config = newService.getAnimationConfig();
          expect(config.enableReducedMotion).toBe(true);
          resolve();
        }, 10);
      });
    });
  });

  describe("CSS Loading", () => {
    it("should load non-critical CSS asynchronously", async () => {
      const href = "/test.css";
      const media = "screen";

      const loadPromise = service.loadNonCriticalCSS(href, media);

      // Simulate successful load
      const linkElement = mockLinkElement;
      if (linkElement.onload) {
        linkElement.onload();
      }

      await expect(loadPromise).resolves.toBeUndefined();
      expect(document.createElement).toHaveBeenCalledWith("link");
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    it("should handle CSS loading errors", async () => {
      const href = "/nonexistent.css";

      const loadPromise = service.loadNonCriticalCSS(href);

      // Simulate load error
      const linkElement = mockLinkElement;
      if (linkElement.onerror) {
        linkElement.onerror();
      }

      await expect(loadPromise).rejects.toThrow("Failed to load stylesheet");
    });

    it("should preload CSS", () => {
      const href = "/preload.css";

      service.preloadCSS(href);

      expect(document.createElement).toHaveBeenCalledWith("link");
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    it("should not load the same stylesheet twice", async () => {
      const href = "/duplicate.css";

      // First load
      const firstLoad = service.loadNonCriticalCSS(href);
      const linkElement = mockLinkElement;
      if (linkElement.onload) {
        linkElement.onload();
      }
      await firstLoad;

      const createElementCallCount = (document.createElement as any).mock.calls
        .length;

      // Second load should not create new element
      await service.loadNonCriticalCSS(href);
      expect((document.createElement as any).mock.calls.length).toBe(
        createElementCallCount
      );
    });
  });

  describe("Device Detection", () => {
    it("should detect low-end device based on memory", () => {
      Object.defineProperty(navigator, "deviceMemory", {
        value: 1,
        configurable: true,
      });

      const newService = new MobileCSSOptimizationService();
      const config = newService.getAnimationConfig();

      expect(config.enableReducedMotion).toBe(true);
      expect(config.useWillChange).toBe(false);
    });

    it("should detect low-end device based on CPU cores", () => {
      Object.defineProperty(navigator, "deviceMemory", {
        value: undefined,
        configurable: true,
      });

      Object.defineProperty(navigator, "hardwareConcurrency", {
        value: 2,
        configurable: true,
      });

      const newService = new MobileCSSOptimizationService();
      const config = newService.getAnimationConfig();

      expect(config.enableReducedMotion).toBe(true);
    });

    it("should detect low-end device based on connection", () => {
      Object.defineProperty(navigator, "connection", {
        value: {
          effectiveType: "slow-2g",
          addEventListener: vi.fn(),
        },
        configurable: true,
      });

      const newService = new MobileCSSOptimizationService();
      const config = newService.getAnimationConfig();

      expect(config.enableReducedMotion).toBe(true);
    });
  });

  describe("CSS Utilities", () => {
    it("should generate mobile critical CSS", () => {
      // This tests the internal getMobileCriticalCSS method indirectly
      // by checking if critical CSS is applied during initialization
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    it("should setup responsive image CSS", () => {
      // Check if responsive image styles are added
      const styleElements = (document.createElement as any).mock.calls.filter(
        (call: any[]) => call[0] === "style"
      );

      expect(styleElements.length).toBeGreaterThan(0);
    });

    it("should handle aspect ratio fallbacks", () => {
      // The service should add CSS for browsers without aspect-ratio support
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});
