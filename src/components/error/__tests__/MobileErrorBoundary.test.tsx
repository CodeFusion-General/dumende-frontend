import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileErrorBoundary } from "../MobileErrorBoundary";
import { mobileDetection } from "../../../utils/mobileDetection";

// Mock the mobile detection utility
vi.mock("../../../utils/mobileDetection", () => ({
  mobileDetection: {
    detectMobileDevice: vi.fn(() => ({
      isMobile: true,
      isLowEndDevice: false,
      connectionType: "4g",
      screenSize: { width: 375, height: 812 },
      pixelRatio: 2,
      memoryLimit: 4096,
      deviceType: "mid-range",
      browser: {
        name: "Safari",
        version: "14.0",
        isSafari: true,
        isChrome: false,
        isFirefox: false,
      },
    })),
  },
}));

// Get mocked service
const mockedMobileDetection = vi.mocked(mobileDetection);

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component that throws a memory error
const ThrowMemoryError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Out of memory - heap limit exceeded");
  }
  return <div>No error</div>;
};

// Component that throws a network error
const ThrowNetworkError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Network request failed");
  }
  return <div>No error</div>;
};

describe("MobileErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("should render children when there is no error", () => {
    render(
      <MobileErrorBoundary>
        <ThrowError shouldThrow={false} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should catch and display generic error", () => {
    render(
      <MobileErrorBoundary>
        <ThrowError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Display Issue")).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should display memory error UI for memory-related errors", () => {
    render(
      <MobileErrorBoundary>
        <ThrowMemoryError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Memory Issue")).toBeInTheDocument();
    expect(screen.getByText("Switch to Basic Mode")).toBeInTheDocument();
  });

  it("should display network error UI for network-related errors", () => {
    render(
      <MobileErrorBoundary>
        <ThrowNetworkError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Connection Issue")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <MobileErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
      expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(Date),
        errorType: expect.any(String),
        message: "Test error",
      })
    );
  });

  it("should handle retry functionality", () => {
    const { rerender } = render(
      <MobileErrorBoundary maxRetries={1}>
        <ThrowError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Display Issue")).toBeInTheDocument();

    const retryButton = screen.getByText("Try Again");
    fireEvent.click(retryButton);

    // After retry, the error boundary should reset
    // We need to rerender with a non-throwing component to simulate recovery
    rerender(
      <MobileErrorBoundary maxRetries={1}>
        <ThrowError shouldThrow={false} />
      </MobileErrorBoundary>
    );
  });

  it("should render custom fallback when provided", () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <MobileErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("should show different UI for low-end devices", () => {
    // Mock low-end device
    mockedMobileDetection.detectMobileDevice.mockReturnValue({
      isMobile: true,
      isLowEndDevice: true,
      connectionType: "2g",
      screenSize: { width: 320, height: 568 },
      pixelRatio: 1,
      memoryLimit: 1024,
      deviceType: "low-end",
      browser: {
        name: "Chrome",
        version: "80.0",
        isSafari: false,
        isChrome: true,
        isFirefox: false,
      },
    });

    render(
      <MobileErrorBoundary>
        <ThrowMemoryError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Memory Issue")).toBeInTheDocument();
    expect(
      screen.getByText(/Your device is running low on memory/)
    ).toBeInTheDocument();
  });

  it("should handle offline scenarios", () => {
    // Mock offline state
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    render(
      <MobileErrorBoundary>
        <ThrowNetworkError shouldThrow={true} />
      </MobileErrorBoundary>
    );

    expect(screen.getByText("Connection Issue")).toBeInTheDocument();
    expect(screen.getByText(/You appear to be offline/)).toBeInTheDocument();
  });
});
