import "@testing-library/jest-dom";

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

// Mock window.matchMedia for tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver with proper callback handling
global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
  return {
    observe: vi.fn((element) => {
      // Immediately call callback with entry for the observed element
      callback([
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 },
          intersectionRect: { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 },
          rootBounds: null,
          time: Date.now(),
        },
      ]);
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: "",
    thresholds: [0],
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock CSS.supports
Object.defineProperty(window, "CSS", {
  writable: true,
  value: {
    supports: vi.fn().mockReturnValue(true),
  },
});

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  getParameter: vi.fn().mockReturnValue("WebGL 1.0"),
});

// Mock HTMLCanvasElement.toDataURL (for WebP support check)
HTMLCanvasElement.prototype.toDataURL = vi.fn().mockImplementation((type) => {
  // Simulate WebP support
  if (type === "image/webp") {
    return "data:image/webp;base64,UklGR..."; // Fake WebP data URL
  }
  return "data:image/png;base64,...";
});

// Mock navigator.hardwareConcurrency
Object.defineProperty(navigator, "hardwareConcurrency", {
  writable: true,
  value: 4,
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16) as unknown as number;
});

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});
