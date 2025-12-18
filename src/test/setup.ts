import "@testing-library/jest-dom";

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

// Store original timer functions before mocking
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;

// Mock window.setInterval and window.clearInterval
window.setInterval = vi.fn((callback: TimerHandler, ms?: number) => {
  return originalSetInterval(callback, ms) as unknown as number;
}) as typeof window.setInterval;

window.clearInterval = vi.fn((id?: number) => {
  originalClearInterval(id);
}) as typeof window.clearInterval;

// Mock window.setTimeout and window.clearTimeout
window.setTimeout = vi.fn((callback: TimerHandler, ms?: number) => {
  return originalSetTimeout(callback, ms) as unknown as number;
}) as typeof window.setTimeout;

window.clearTimeout = vi.fn((id?: number) => {
  originalClearTimeout(id);
}) as typeof window.clearTimeout;

// Mock navigator.userAgent
Object.defineProperty(navigator, "userAgent", {
  writable: true,
  configurable: true,
  value:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});

// Mock navigator.connection
Object.defineProperty(navigator, "connection", {
  writable: true,
  configurable: true,
  value: {
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
    saveData: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// Mock window.location
Object.defineProperty(window, "location", {
  writable: true,
  configurable: true,
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
});

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
}));

// Mock performance methods using Object.defineProperty (read-only in CI)
if (typeof performance !== "undefined") {
  const perfMethods = {
    getEntriesByType: vi.fn().mockReturnValue([]),
    getEntriesByName: vi.fn().mockReturnValue([]),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  };

  Object.entries(perfMethods).forEach(([key, value]) => {
    try {
      Object.defineProperty(performance, key, {
        writable: true,
        configurable: true,
        value,
      });
    } catch {
      // Property might already be defined, skip silently
    }
  });
}

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

// Mock HTMLCanvasElement.getContext with proper WebGL context
const mockWebGLContext = {
  getParameter: vi.fn().mockReturnValue("WebGL 1.0"),
  getExtension: vi.fn().mockReturnValue(null),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  canvas: null,
};

const mock2DContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  arc: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  canvas: null,
};

HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType: string) => {
  if (contextType === "webgl" || contextType === "experimental-webgl") {
    return mockWebGLContext;
  }
  if (contextType === "2d") {
    return mock2DContext;
  }
  return null;
}) as typeof HTMLCanvasElement.prototype.getContext;

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
