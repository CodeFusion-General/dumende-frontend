/**
 * Tests for Mobile CSS Optimization Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useMobileCSSOptimization,
  useAnimationOptimization,
  useResponsiveCSS,
  useCriticalCSS,
} from "../useMobileCSSOptimization";

// Mock the mobile CSS optimization service
vi.mock("../services/mobileCSSOptimization", () => ({
  mobileCSSOptimizationService: {
    getAnimationConfig: vi.fn(() => ({
      enableReducedMotion: false,
      maxAnimationDuration: 300,
      preferTransforms: true,
      useWillChange: true,
      enableHardwareAcceleration: true,
    })),
    getCriticalConfig: vi.fn(() => ({
      aboveFoldSelectors: ["header", "nav", ".hero"],
      criticalComponents: ["Navigation", "Hero"],
      inlineThreshold: 14,
      deferNonCritical: true,
    })),
    addComponentCriticalCSS: vi.fn(),
    loadNonCriticalCSS: vi.fn(() => Promise.resolve()),
    preloadCSS: vi.fn(),
    cleanupAnimationProperties: vi.fn(),
    updateAnimationConfig: vi.fn(),
    updateCriticalConfig: vi.fn(),
  },
}));

describe("useMobileCSSOptimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default configuration", () => {
    const { result } = renderHook(() => useMobileCSSOptimization());

    expect(result.current.animationConfig).toBeDefined();
    expect(result.current.criticalConfig).toBeDefined();
    expect(result.current.shouldReduceMotion).toBe(false);
    expect(result.current.maxAnimationDuration).toBe(300);
  });

  it("should add component critical CSS when provided", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");

    renderHook(() =>
      useMobileCSSOptimization({
        componentName: "TestComponent",
        criticalCSS: ".test { color: red; }",
      })
    );

    expect(
      mobileCSSOptimizationService.addComponentCriticalCSS
    ).toHaveBeenCalledWith("TestComponent", ".test { color: red; }");
  });

  it("should provide loadNonCriticalCSS function", async () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useMobileCSSOptimization());

    await act(async () => {
      await result.current.loadNonCriticalCSS("/test.css", "screen");
    });

    expect(
      mobileCSSOptimizationService.loadNonCriticalCSS
    ).toHaveBeenCalledWith("/test.css", "screen");
  });

  it("should provide preloadCSS function", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useMobileCSSOptimization());

    act(() => {
      result.current.preloadCSS("/preload.css");
    });

    expect(mobileCSSOptimizationService.preloadCSS).toHaveBeenCalledWith(
      "/preload.css"
    );
  });

  it("should provide cleanupAnimationProperties function", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useMobileCSSOptimization());

    const mockElement = document.createElement("div");

    act(() => {
      result.current.cleanupAnimationProperties(mockElement);
    });

    expect(
      mobileCSSOptimizationService.cleanupAnimationProperties
    ).toHaveBeenCalledWith(mockElement);
  });

  it("should update animation configuration", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useMobileCSSOptimization());

    const newConfig = { enableReducedMotion: true };

    act(() => {
      result.current.updateAnimationConfig(newConfig);
    });

    expect(
      mobileCSSOptimizationService.updateAnimationConfig
    ).toHaveBeenCalledWith(newConfig);
  });

  it("should update critical configuration", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useMobileCSSOptimization());

    const newConfig = { inlineThreshold: 20 };

    act(() => {
      result.current.updateCriticalConfig(newConfig);
    });

    expect(
      mobileCSSOptimizationService.updateCriticalConfig
    ).toHaveBeenCalledWith(newConfig);
  });

  it("should generate animation classes", () => {
    const { result } = renderHook(() => useMobileCSSOptimization());

    const classes = result.current.getAnimationClasses("base-class");

    expect(classes).toContain("base-class");
    expect(classes).toContain("will-animate");
    expect(classes).toContain("hardware-accelerated");
  });

  it("should generate responsive image classes", () => {
    const { result } = renderHook(() => useMobileCSSOptimization());

    const classes = result.current.getResponsiveImageClasses("16-9");

    expect(classes).toContain("responsive-image");
    expect(classes).toContain("aspect-ratio-16-9");
  });

  it("should handle errors in loadNonCriticalCSS", async () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    mobileCSSOptimizationService.loadNonCriticalCSS.mockRejectedValue(
      new Error("Load failed")
    );

    const { result } = renderHook(() => useMobileCSSOptimization());

    // Should not throw, but log error
    await act(async () => {
      await result.current.loadNonCriticalCSS("/error.css");
    });

    expect(
      mobileCSSOptimizationService.loadNonCriticalCSS
    ).toHaveBeenCalledWith("/error.css", undefined);
  });
});

describe("useAnimationOptimization", () => {
  it("should provide animation configuration", () => {
    const { result } = renderHook(() => useAnimationOptimization());

    expect(result.current.config).toBeDefined();
    expect(result.current.shouldReduceMotion).toBe(false);
    expect(result.current.maxDuration).toBe(300);
  });

  it("should update configuration", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useAnimationOptimization());

    const newConfig = { enableReducedMotion: true };

    act(() => {
      result.current.updateConfig(newConfig);
    });

    expect(
      mobileCSSOptimizationService.updateAnimationConfig
    ).toHaveBeenCalledWith(newConfig);
  });

  it("should cleanup element", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useAnimationOptimization());

    const mockElement = document.createElement("div");

    act(() => {
      result.current.cleanupElement(mockElement);
    });

    expect(
      mobileCSSOptimizationService.cleanupAnimationProperties
    ).toHaveBeenCalledWith(mockElement);
  });
});

describe("useResponsiveCSS", () => {
  it("should track loaded stylesheets", async () => {
    const { result } = renderHook(() => useResponsiveCSS());

    expect(result.current.loadedStylesheets).toEqual([]);
    expect(result.current.isLoaded("/test.css")).toBe(false);

    await act(async () => {
      await result.current.loadCSS("/test.css");
    });

    expect(result.current.loadedStylesheets).toContain("/test.css");
    expect(result.current.isLoaded("/test.css")).toBe(true);
  });

  it("should not load the same stylesheet twice", async () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useResponsiveCSS());

    // Load first time
    await act(async () => {
      await result.current.loadCSS("/duplicate.css");
    });

    const firstCallCount =
      mobileCSSOptimizationService.loadNonCriticalCSS.mock.calls.length;

    // Try to load again
    await act(async () => {
      await result.current.loadCSS("/duplicate.css");
    });

    // Should not call service again
    expect(
      mobileCSSOptimizationService.loadNonCriticalCSS.mock.calls.length
    ).toBe(firstCallCount);
  });

  it("should handle loading errors", async () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    mobileCSSOptimizationService.loadNonCriticalCSS.mockRejectedValue(
      new Error("Load failed")
    );

    const { result } = renderHook(() => useResponsiveCSS());

    await expect(
      act(async () => {
        await result.current.loadCSS("/error.css");
      })
    ).rejects.toThrow("Load failed");
  });

  it("should preload CSS", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");
    const { result } = renderHook(() => useResponsiveCSS());

    act(() => {
      result.current.preload("/preload.css");
    });

    expect(mobileCSSOptimizationService.preloadCSS).toHaveBeenCalledWith(
      "/preload.css"
    );
  });
});

describe("useCriticalCSS", () => {
  it("should add critical CSS for component", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");

    renderHook(() => useCriticalCSS("TestComponent", ".test { color: red; }"));

    expect(
      mobileCSSOptimizationService.addComponentCriticalCSS
    ).toHaveBeenCalledWith("TestComponent", ".test { color: red; }");
  });

  it("should update when component name or CSS changes", () => {
    const {
      mobileCSSOptimizationService,
    } = require("../services/mobileCSSOptimization");

    const { rerender } = renderHook(
      ({ componentName, css }) => useCriticalCSS(componentName, css),
      {
        initialProps: {
          componentName: "TestComponent",
          css: ".test { color: red; }",
        },
      }
    );

    expect(
      mobileCSSOptimizationService.addComponentCriticalCSS
    ).toHaveBeenCalledTimes(1);

    rerender({
      componentName: "TestComponent",
      css: ".test { color: blue; }",
    });

    expect(
      mobileCSSOptimizationService.addComponentCriticalCSS
    ).toHaveBeenCalledTimes(2);
    expect(
      mobileCSSOptimizationService.addComponentCriticalCSS
    ).toHaveBeenLastCalledWith("TestComponent", ".test { color: blue; }");
  });
});
