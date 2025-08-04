import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock CSS.supports
Object.defineProperty(window, "CSS", {
  value: {
    supports: () => true,
  },
});

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getExtension: vi.fn(),
}));

// Mock navigator.hardwareConcurrency
Object.defineProperty(navigator, "hardwareConcurrency", {
  value: 4,
  writable: true,
});

// Mock window.matchMedia
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
