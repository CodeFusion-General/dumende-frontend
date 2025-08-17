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

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

// Mock navigator.hardwareConcurrency
Object.defineProperty(navigator, "hardwareConcurrency", {
  writable: true,
  value: 4,
});
