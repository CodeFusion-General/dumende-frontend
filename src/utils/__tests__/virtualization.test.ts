/**
 * Tests for Virtualization Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useVirtualScroll,
  useWindowedList,
  useIntersectionObserver,
  MobileScrollOptimizer,
} from "../virtualization";

// Mock mobile detection
vi.mock("../mobileDetection", () => ({
  mobileDetection: {
    detectMobileDevice: vi.fn(() => ({
      isMobile: false,
      isLowEndDevice: false,
      connectionType: "4g",
    })),
  },
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe("useVirtualScroll", () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  const defaultConfig = {
    itemHeight: 50,
    containerHeight: 300,
    overscan: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate visible range correctly", () => {
    const { result } = renderHook(() =>
      useVirtualScroll(mockItems, defaultConfig)
    );

    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBeGreaterThan(0);
    expect(result.current.totalSize).toBe(
      mockItems.length * defaultConfig.itemHeight
    );
  });

  it("should handle empty items array", () => {
    const { result } = renderHook(() => useVirtualScroll([], defaultConfig));

    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(-1);
    expect(result.current.totalSize).toBe(0);
    expect(result.current.visibleItems).toEqual([]);
  });

  it("should provide correct item props", () => {
    const { result } = renderHook(() =>
      useVirtualScroll(mockItems, defaultConfig)
    );

    const itemProps = result.current.getItemProps(5);

    expect(itemProps.key).toBe("virtual-item-5");
    expect(itemProps.style.top).toBe(5 * defaultConfig.itemHeight);
    expect(itemProps.style.height).toBe(defaultConfig.itemHeight);
    expect(itemProps["data-index"]).toBe(5);
  });

  it("should handle horizontal scrolling", () => {
    const horizontalConfig = { ...defaultConfig, horizontal: true };
    const { result } = renderHook(() =>
      useVirtualScroll(mockItems, horizontalConfig)
    );

    const itemProps = result.current.getItemProps(3);

    expect(itemProps.style.left).toBe(3 * defaultConfig.itemHeight);
    expect(itemProps.style.width).toBe(defaultConfig.itemHeight);
  });

  it("should adjust overscan for mobile devices", () => {
    const { mobileDetection } = require("../mobileDetection");
    mobileDetection.detectMobileDevice.mockReturnValue({
      isMobile: true,
      isLowEndDevice: true,
      connectionType: "3g",
    });

    const { result } = renderHook(() =>
      useVirtualScroll(mockItems, { ...defaultConfig, overscan: 10 })
    );

    // Should reduce overscan for low-end devices
    expect(result.current.visibleItems.length).toBeLessThan(20);
  });
});

describe("useWindowedList", () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  const defaultConfig = {
    windowSize: 20,
    maxWindows: 3,
    preloadThreshold: 5,
    infiniteScroll: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return correct visible items for first window", () => {
    const { result } = renderHook(() =>
      useWindowedList(mockItems, defaultConfig)
    );

    expect(result.current.visibleItems.length).toBeGreaterThan(0);
    expect(result.current.currentWindow).toBe(0);
    expect(result.current.hasMore).toBe(true);
  });

  it("should handle load more functionality", async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    const config = { ...defaultConfig, onLoadMore };

    const { result } = renderHook(() => useWindowedList(mockItems, config));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.currentWindow).toBe(1);
  });

  it("should reset to first window", () => {
    const { result } = renderHook(() =>
      useWindowedList(mockItems, defaultConfig)
    );

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.currentWindow).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentWindow).toBe(0);
  });

  it("should calculate total windows correctly", () => {
    const { result } = renderHook(() =>
      useWindowedList(mockItems, defaultConfig)
    );

    const expectedWindows = Math.ceil(
      mockItems.length / defaultConfig.windowSize
    );
    expect(result.current.totalWindows).toBe(expectedWindows);
  });

  it("should handle external data loading", async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    const config = { ...defaultConfig, onLoadMore };

    const { result } = renderHook(
      () => useWindowedList(mockItems.slice(0, 25), config) // Smaller initial set
    );

    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(onLoadMore).toHaveBeenCalled();
  });
});

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create intersection observer with default options", () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.ref).toBeDefined();
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBe(null);
  });

  it("should create intersection observer with custom options", () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: "100px",
    };

    renderHook(() => useIntersectionObserver(customOptions));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining(customOptions)
    );
  });

  it("should handle intersection changes", () => {
    let intersectionCallback: (entries: any[]) => void;

    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    });

    const { result } = renderHook(() => useIntersectionObserver());

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    expect(result.current.isIntersecting).toBe(true);
  });
});

describe("MobileScrollOptimizer", () => {
  let optimizer: MobileScrollOptimizer;
  let mockElement: HTMLElement;

  beforeEach(() => {
    optimizer = MobileScrollOptimizer.getInstance();
    mockElement = document.createElement("div");
    vi.clearAllMocks();
  });

  afterEach(() => {
    optimizer.cleanup();
  });

  it("should be a singleton", () => {
    const optimizer1 = MobileScrollOptimizer.getInstance();
    const optimizer2 = MobileScrollOptimizer.getInstance();

    expect(optimizer1).toBe(optimizer2);
  });

  it("should optimize scroll element", () => {
    optimizer.optimizeScrollElement(mockElement);

    expect(mockElement.style.webkitOverflowScrolling).toBe("touch");
    expect(mockElement.style.overflowScrolling).toBe("touch");
  });

  it("should not optimize the same element twice", () => {
    const originalStyle = mockElement.style.cssText;

    optimizer.optimizeScrollElement(mockElement);
    const firstOptimization = mockElement.style.cssText;

    optimizer.optimizeScrollElement(mockElement);
    const secondOptimization = mockElement.style.cssText;

    expect(firstOptimization).toBe(secondOptimization);
  });

  it("should start and stop monitoring", () => {
    const rafSpy = vi.spyOn(global, "requestAnimationFrame");
    const cancelRafSpy = vi.spyOn(global, "cancelAnimationFrame");

    optimizer.startMonitoring();
    expect(rafSpy).toHaveBeenCalled();

    optimizer.stopMonitoring();
    expect(cancelRafSpy).toHaveBeenCalled();
  });

  it("should remove element from optimization", () => {
    optimizer.optimizeScrollElement(mockElement);
    optimizer.removeElement(mockElement);

    // Element should no longer be tracked
    expect(optimizer["scrollElements"].has(mockElement)).toBe(false);
  });

  it("should cleanup all optimizations", () => {
    optimizer.optimizeScrollElement(mockElement);
    optimizer.startMonitoring();

    optimizer.cleanup();

    expect(optimizer["scrollElements"].size).toBe(0);
    expect(optimizer["isOptimizing"]).toBe(false);
  });
});

// Integration tests
describe("Virtualization Integration", () => {
  it("should work with large datasets", () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i }));

    const { result } = renderHook(() =>
      useVirtualScroll(largeDataset, {
        itemHeight: 50,
        containerHeight: 500,
        overscan: 5,
      })
    );

    expect(result.current.visibleItems.length).toBeLessThan(50); // Should only render visible items
    expect(result.current.totalSize).toBe(500000); // 10000 * 50
  });

  it("should handle rapid scroll updates", () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array.from({ length: 1000 }, (_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 300,
          scrollThreshold: 10, // Higher threshold for testing
        }
      )
    );

    // Should not update for small scroll changes
    expect(result.current.startIndex).toBe(0);
  });

  it("should optimize for mobile devices", () => {
    const { mobileDetection } = require("../mobileDetection");
    mobileDetection.detectMobileDevice.mockReturnValue({
      isMobile: true,
      isLowEndDevice: true,
      connectionType: "2g",
    });

    const { result } = renderHook(() =>
      useVirtualScroll(
        Array.from({ length: 100 }, (_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 300,
          overscan: 10,
        }
      )
    );

    // Should reduce overscan for low-end devices
    expect(result.current.visibleItems.length).toBeLessThan(25);
  });
});
