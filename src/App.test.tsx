import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock all the external dependencies
vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

vi.mock("@/lib/accessibility-utils", () => ({
  accessibilityManager: {
    announcePageChange: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("@/lib/reduced-motion", () => ({
  accessibleAnimationController: {
    destroy: vi.fn(),
  },
}));

vi.mock("@/lib/browser-compatibility", () => ({
  browserCompatibilityManager: {
    logCompatibilityInfo: vi.fn(),
  },
  polyfillManager: {
    loadAllPolyfills: vi.fn(),
  },
}));

// Mock all the page components to avoid complex dependencies
vi.mock("./pages/Index", () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));

describe("App", () => {
  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
