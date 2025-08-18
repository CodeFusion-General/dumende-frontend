import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mobileErrorTracking,
  type MobileErrorReport,
  type ErrorBreadcrumb,
} from "../mobileErrorTracking";

// Mock the performance monitoring service
vi.mock("../mobilePerformanceMonitoring", () => ({
  mobilePerformanceMonitoring: {
    getCurrentPerformanceSnapshot: vi.fn(() => ({
      id: "perf-report-1",
      timestamp: new Date(),
      deviceInfo: { isMobile: true },
      coreWebVitals: {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
        fcp: 1500,
        tti: 2500,
        tbt: 200,
      },
      memoryMetrics: {
        usedJSHeapSize: 25000000,
        totalJSHeapSize: 50000000,
        jsHeapSizeLimit: 100000000,
        memoryPressure: "low",
      },
      networkMetrics: {
        connectionType: "4g",
        effectiveType: "4g",
        downlink: 10,
        rtt: 100,
        saveData: false,
      },
      pageUrl: "https://example.com",
      sessionId: "session-123",
    })),
  },
}));

describe("MobileErrorTrackingService", () => {
  let originalConsoleError: any;
  let mockErrorCallback: any;

  beforeEach(() => {
    // Mock console.error to avoid noise in tests
    originalConsoleError = console.error;
    console.error = vi.fn();

    // Clear any existing state
    mobileErrorTracking.clearSession();

    // Mock callback
    mockErrorCallback = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    mobileErrorTracking.stopTracking();
    vi.clearAllMocks();
  });

  describe("Error Reporting", () => {
    it("should report JavaScript errors", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      const testError = new Error("Test JavaScript error");
      mobileErrorTracking.reportError(testError);

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "javascript",
          message: "Test JavaScript error",
          severity: "high",
          stack: expect.any(String),
        })
      );

      unsubscribe();
    });

    it("should report network errors", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      mobileErrorTracking.reportNetworkError(
        "https://api.example.com",
        500,
        "Internal Server Error"
      );

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "network",
          message: expect.stringContaining(
            "Network error: 500 Internal Server Error"
          ),
          severity: "medium",
          tags: expect.objectContaining({
            url: "https://api.example.com",
            status: "500",
            statusText: "Internal Server Error",
          }),
        })
      );

      unsubscribe();
    });

    it("should report memory errors", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      const memoryUsage = 120 * 1024 * 1024; // 120MB
      mobileErrorTracking.reportMemoryError(memoryUsage);

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "memory",
          message: expect.stringContaining("Memory usage critical: 120MB"),
          severity: "critical",
          tags: expect.objectContaining({
            memoryUsage: memoryUsage.toString(),
          }),
        })
      );

      unsubscribe();
    });

    it("should include device context in error reports", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      mobileErrorTracking.reportError("Test error");

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceInfo: expect.objectContaining({
            userAgent: expect.any(String),
            viewport: expect.objectContaining({
              width: expect.any(Number),
              height: expect.any(Number),
            }),
            isMobile: expect.any(Boolean),
            platform: expect.any(String),
            language: expect.any(String),
          }),
          browserInfo: expect.objectContaining({
            name: expect.any(String),
            version: expect.any(String),
            engine: expect.any(String),
            cookieEnabled: expect.any(Boolean),
            onLine: expect.any(Boolean),
          }),
          pageContext: expect.objectContaining({
            url: expect.any(String),
            referrer: expect.any(String),
            title: expect.any(String),
            loadTime: expect.any(Number),
            userAgent: expect.any(String),
          }),
        })
      );

      unsubscribe();
    });
  });

  describe("Breadcrumbs", () => {
    it("should add and track breadcrumbs", () => {
      const breadcrumb: Omit<ErrorBreadcrumb, "timestamp"> = {
        category: "user-interaction",
        message: "User clicked button",
        data: { buttonId: "submit-btn" },
        level: "info",
      };

      mobileErrorTracking.addBreadcrumb(breadcrumb);

      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);
      mobileErrorTracking.reportError("Test error");

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          breadcrumbs: expect.arrayContaining([
            expect.objectContaining({
              category: "user-interaction",
              message: "User clicked button",
              data: { buttonId: "submit-btn" },
              level: "info",
              timestamp: expect.any(Date),
            }),
          ]),
        })
      );

      unsubscribe();
    });

    it("should limit breadcrumbs to maximum count", () => {
      // Add more than the maximum number of breadcrumbs
      for (let i = 0; i < 60; i++) {
        mobileErrorTracking.addBreadcrumb({
          category: "user-interaction",
          message: `Breadcrumb ${i}`,
          level: "info",
        });
      }

      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);
      mobileErrorTracking.reportError("Test error");

      const report = mockErrorCallback.mock.calls[0][0] as MobileErrorReport;
      expect(report.breadcrumbs.length).toBeLessThanOrEqual(50);

      unsubscribe();
    });
  });

  describe("Session Recording", () => {
    it("should create session recording", () => {
      const sessionRecording = mobileErrorTracking.getSessionRecording();

      expect(sessionRecording).toMatchObject({
        sessionId: expect.stringMatching(/^session_/),
        startTime: expect.any(Date),
        events: expect.any(Array),
        errors: expect.any(Array),
        performance: expect.objectContaining({
          initialLoad: expect.any(Number),
          interactions: expect.any(Number),
          memoryPeaks: expect.any(Array),
        }),
      });
    });

    it("should track session errors", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      mobileErrorTracking.reportError("Session error 1");
      mobileErrorTracking.reportError("Session error 2");

      const sessionErrors = mobileErrorTracking.getSessionErrors();
      expect(sessionErrors).toHaveLength(2);
      expect(sessionErrors[0].message).toBe("Session error 1");
      expect(sessionErrors[1].message).toBe("Session error 2");

      unsubscribe();
    });

    it("should clear session data", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      mobileErrorTracking.reportError("Test error");
      mobileErrorTracking.addBreadcrumb({
        category: "user-interaction",
        message: "Test breadcrumb",
        level: "info",
      });

      expect(mobileErrorTracking.getSessionErrors()).toHaveLength(1);

      mobileErrorTracking.clearSession();

      expect(mobileErrorTracking.getSessionErrors()).toHaveLength(0);

      unsubscribe();
    });
  });

  describe("Error Severity Calculation", () => {
    it("should assign correct severity levels", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      // Test memory error (should be critical)
      mobileErrorTracking.reportMemoryError(100 * 1024 * 1024);
      expect(mockErrorCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({ severity: "critical" })
      );

      // Test network error (should be medium)
      mobileErrorTracking.reportNetworkError(
        "https://api.test.com",
        404,
        "Not Found"
      );
      expect(mockErrorCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({ severity: "medium" })
      );

      // Test JavaScript error (should be high by default)
      mobileErrorTracking.reportError("Regular JavaScript error");
      expect(mockErrorCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({ severity: "high" })
      );

      // Test out of memory error (should be critical)
      mobileErrorTracking.reportError("Out of memory error");
      expect(mockErrorCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({ severity: "critical" })
      );

      unsubscribe();
    });
  });

  describe("Global Error Handling", () => {
    it("should handle global JavaScript errors", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      mobileErrorTracking.startTracking();

      // Simulate a global error event
      const errorEvent = new ErrorEvent("error", {
        message: "Global error test",
        filename: "test.js",
        lineno: 42,
        colno: 10,
        error: new Error("Global error test"),
      });

      window.dispatchEvent(errorEvent);

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "javascript",
          message: "Global error test",
          filename: "test.js",
          lineno: 42,
          colno: 10,
          severity: "high",
        })
      );

      unsubscribe();
    });

    it("should handle unhandled promise rejections", () => {
      const unsubscribe = mobileErrorTracking.onErrorReport(mockErrorCallback);

      mobileErrorTracking.startTracking();

      // Create a mock PromiseRejectionEvent
      const rejectionEvent = {
        type: "unhandledrejection",
        reason: "Promise rejection test",
        promise: {} as Promise<any>,
      } as PromiseRejectionEvent;

      // Manually call the handler since we can't easily dispatch the event in test environment
      const handler = (
        mobileErrorTracking as any
      ).handleUnhandledRejection.bind(mobileErrorTracking);
      handler(rejectionEvent);

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "unhandled-rejection",
          message: "Promise rejection test",
          severity: "high",
        })
      );

      unsubscribe();
    });
  });

  describe("Callback Management", () => {
    it("should register and unregister callbacks", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = mobileErrorTracking.onErrorReport(callback1);
      const unsubscribe2 = mobileErrorTracking.onErrorReport(callback2);

      mobileErrorTracking.reportError("Test error");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Unsubscribe first callback
      unsubscribe1();
      vi.clearAllMocks();

      mobileErrorTracking.reportError("Test error 2");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      unsubscribe2();
    });

    it("should handle callback errors gracefully", () => {
      const faultyCallback = vi.fn(() => {
        throw new Error("Callback error");
      });
      const goodCallback = vi.fn();

      const unsubscribe1 = mobileErrorTracking.onErrorReport(faultyCallback);
      const unsubscribe2 = mobileErrorTracking.onErrorReport(goodCallback);

      expect(() => {
        mobileErrorTracking.reportError("Test error");
      }).not.toThrow();

      expect(faultyCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });
  });
});
