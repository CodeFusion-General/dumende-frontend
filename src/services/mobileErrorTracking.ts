/**
 * Mobile Error Tracking Service
 *
 * Enhanced error reporting with mobile device context,
 * crash reporting for mobile browser issues, and user session recording
 */

import {
  mobilePerformanceMonitoring,
  type PerformanceReport,
} from "./mobilePerformanceMonitoring";

export interface MobileErrorReport {
  id: string;
  timestamp: Date;
  errorType:
    | "javascript"
    | "network"
    | "rendering"
    | "memory"
    | "crash"
    | "unhandled-rejection";
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;

  // Device context
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    deviceMemory?: number;
    hardwareConcurrency?: number;
    isMobile: boolean;
    platform: string;
    language: string;
  };

  // Performance context
  performanceMetrics?: PerformanceReport;

  // Browser context
  browserInfo: {
    name: string;
    version: string;
    engine: string;
    cookieEnabled: boolean;
    onLine: boolean;
  };

  // Page context
  pageContext: {
    url: string;
    referrer: string;
    title: string;
    loadTime: number;
    userAgent: string;
  };

  // User session context
  sessionInfo: {
    sessionId: string;
    sessionDuration: number;
    pageViews: number;
    interactions: number;
    lastInteraction?: Date;
  };

  // Network context
  networkInfo?: {
    connectionType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };

  // Additional context
  breadcrumbs: ErrorBreadcrumb[];
  tags: Record<string, string>;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ErrorBreadcrumb {
  timestamp: Date;
  category: "navigation" | "user-interaction" | "network" | "console" | "error";
  message: string;
  data?: Record<string, any>;
  level: "info" | "warning" | "error";
}

export interface SessionRecording {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  events: SessionEvent[];
  errors: string[];
  performance: {
    initialLoad: number;
    interactions: number;
    memoryPeaks: number[];
  };
}

export interface SessionEvent {
  timestamp: Date;
  type: "click" | "scroll" | "navigation" | "error" | "performance" | "network";
  target?: string;
  data?: Record<string, any>;
}

class MobileErrorTrackingService {
  private errorReports: MobileErrorReport[] = [];
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private sessionRecording: SessionRecording | null = null;
  private sessionStartTime = Date.now();
  private pageViews = 0;
  private interactions = 0;
  private lastInteraction?: Date;
  private callbacks: Array<(report: MobileErrorReport) => void> = [];
  private isTracking = false;

  // Configuration
  private readonly maxBreadcrumbs = 50;
  private readonly maxSessionEvents = 1000;
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.initializeErrorTracking();
    this.startSessionRecording();
  }

  /**
   * Start error tracking
   */
  public startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.setupErrorHandlers();
    this.trackPageView();
  }

  /**
   * Stop error tracking
   */
  public stopTracking(): void {
    if (!this.isTracking) return;

    this.isTracking = false;
    this.removeErrorHandlers();
    this.endSessionRecording();
  }

  /**
   * Manually report an error
   */
  public reportError(
    error: Error | string,
    context?: Partial<MobileErrorReport>
  ): void {
    const errorReport = this.createErrorReport(error, "javascript", context);
    this.processErrorReport(errorReport);
  }

  /**
   * Report a network error
   */
  public reportNetworkError(
    url: string,
    status: number,
    statusText: string,
    context?: Record<string, any>
  ): void {
    const error = new Error(
      `Network error: ${status} ${statusText} for ${url}`
    );
    const errorReport = this.createErrorReport(error, "network", {
      tags: { url, status: status.toString(), statusText },
      ...context,
    });
    this.processErrorReport(errorReport);
  }

  /**
   * Report a memory error
   */
  public reportMemoryError(
    memoryUsage: number,
    context?: Record<string, any>
  ): void {
    const error = new Error(
      `Memory usage critical: ${Math.round(memoryUsage / 1024 / 1024)}MB`
    );
    const errorReport = this.createErrorReport(error, "memory", {
      severity: "critical",
      tags: { memoryUsage: memoryUsage.toString() },
      ...context,
    });
    this.processErrorReport(errorReport);
  }

  /**
   * Add breadcrumb for debugging context
   */
  public addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, "timestamp">): void {
    const fullBreadcrumb: ErrorBreadcrumb = {
      timestamp: new Date(),
      ...breadcrumb,
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    // Add to session recording
    this.addSessionEvent({
      timestamp: new Date(),
      type: breadcrumb.category === "user-interaction" ? "click" : "navigation",
      data: { breadcrumb: fullBreadcrumb },
    });
  }

  /**
   * Subscribe to error reports
   */
  public onErrorReport(
    callback: (report: MobileErrorReport) => void
  ): () => void {
    this.callbacks.push(callback);

    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current session recording
   */
  public getSessionRecording(): SessionRecording | null {
    return this.sessionRecording;
  }

  /**
   * Get error reports for the current session
   */
  public getSessionErrors(): MobileErrorReport[] {
    const sessionId = this.sessionRecording?.sessionId;
    if (!sessionId) return [];

    return this.errorReports.filter(
      (report) => report.sessionInfo.sessionId === sessionId
    );
  }

  /**
   * Clear error reports and session data
   */
  public clearSession(): void {
    this.errorReports = [];
    this.breadcrumbs = [];
    this.endSessionRecording();
    this.startSessionRecording();
  }

  private initializeErrorTracking(): void {
    // Start tracking when the page loads
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.startTracking());
    } else {
      this.startTracking();
    }

    // Stop tracking when the page unloads
    window.addEventListener("beforeunload", () => this.stopTracking());
  }

  private setupErrorHandlers(): void {
    // Global JavaScript error handler
    window.addEventListener("error", this.handleGlobalError.bind(this));

    // Unhandled promise rejection handler
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection.bind(this)
    );

    // Track user interactions
    document.addEventListener("click", this.handleUserInteraction.bind(this));
    document.addEventListener("scroll", this.handleUserInteraction.bind(this));
    document.addEventListener("keydown", this.handleUserInteraction.bind(this));

    // Track navigation
    window.addEventListener("popstate", this.handleNavigation.bind(this));
  }

  private removeErrorHandlers(): void {
    window.removeEventListener("error", this.handleGlobalError.bind(this));
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleUserInteraction.bind(this)
    );
    document.removeEventListener(
      "scroll",
      this.handleUserInteraction.bind(this)
    );
    document.removeEventListener(
      "keydown",
      this.handleUserInteraction.bind(this)
    );
    window.removeEventListener("popstate", this.handleNavigation.bind(this));
  }

  private handleGlobalError(event: ErrorEvent): void {
    const errorReport = this.createErrorReport(
      event.error || new Error(event.message),
      "javascript",
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: "high",
      }
    );
    this.processErrorReport(errorReport);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    const errorReport = this.createErrorReport(error, "unhandled-rejection", {
      severity: "high",
    });
    this.processErrorReport(errorReport);
  }

  private handleUserInteraction(event: Event): void {
    this.interactions++;
    this.lastInteraction = new Date();

    this.addBreadcrumb({
      category: "user-interaction",
      message: `User ${event.type} on ${
        (event.target as Element)?.tagName || "unknown"
      }`,
      data: {
        type: event.type,
        target: (event.target as Element)?.tagName,
        timestamp: Date.now(),
      },
      level: "info",
    });
  }

  private handleNavigation(): void {
    this.trackPageView();

    this.addBreadcrumb({
      category: "navigation",
      message: `Navigation to ${window.location.pathname}`,
      data: {
        url: window.location.href,
        referrer: document.referrer,
      },
      level: "info",
    });
  }

  private trackPageView(): void {
    this.pageViews++;

    this.addSessionEvent({
      timestamp: new Date(),
      type: "navigation",
      data: {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
      },
    });
  }

  private createErrorReport(
    error: Error | string,
    errorType: MobileErrorReport["errorType"],
    context?: Partial<MobileErrorReport>
  ): MobileErrorReport {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const performanceReport =
      mobilePerformanceMonitoring.getCurrentPerformanceSnapshot();

    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      errorType,
      message: errorObj.message,
      stack: errorObj.stack,
      filename: context?.filename,
      lineno: context?.lineno,
      colno: context?.colno,
      deviceInfo: this.getDeviceInfo(),
      performanceMetrics: performanceReport,
      browserInfo: this.getBrowserInfo(),
      pageContext: this.getPageContext(),
      sessionInfo: this.getSessionInfo(),
      networkInfo: this.getNetworkInfo(),
      breadcrumbs: [...this.breadcrumbs],
      tags: context?.tags || {},
      severity:
        context?.severity || this.calculateSeverity(errorObj, errorType),
      ...context,
    };
  }

  private processErrorReport(report: MobileErrorReport): void {
    // Store the error report
    this.errorReports.push(report);

    // Add error to session recording
    this.addSessionEvent({
      timestamp: new Date(),
      type: "error",
      data: {
        errorId: report.id,
        message: report.message,
        severity: report.severity,
      },
    });

    // Add error breadcrumb
    this.addBreadcrumb({
      category: "error",
      message: `${report.errorType}: ${report.message}`,
      data: { errorId: report.id, severity: report.severity },
      level: "error",
    });

    // Notify callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(report);
      } catch (error) {
        console.error("Error in error tracking callback:", error);
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Mobile Error Tracked:", report);
    }
  }

  private startSessionRecording(): void {
    this.sessionRecording = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      events: [],
      errors: [],
      performance: {
        initialLoad: performance.now(),
        interactions: 0,
        memoryPeaks: [],
      },
    };
  }

  private endSessionRecording(): void {
    if (this.sessionRecording) {
      this.sessionRecording.endTime = new Date();
      this.sessionRecording.performance.interactions = this.interactions;
    }
  }

  private addSessionEvent(
    event: Omit<SessionEvent, "timestamp"> & { timestamp: Date }
  ): void {
    if (!this.sessionRecording) return;

    this.sessionRecording.events.push(event);

    // Keep only the most recent events
    if (this.sessionRecording.events.length > this.maxSessionEvents) {
      this.sessionRecording.events = this.sessionRecording.events.slice(
        -this.maxSessionEvents
      );
    }
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      platform: navigator.platform,
      language: navigator.language,
    };
  }

  private getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";
    let browserEngine = "Unknown";

    // Detect browser
    if (userAgent.includes("Chrome")) {
      browserName = "Chrome";
      browserEngine = "Blink";
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes("Safari")) {
      browserName = "Safari";
      browserEngine = "WebKit";
      const match = userAgent.match(/Version\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
      browserEngine = "Gecko";
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    }

    return {
      name: browserName,
      version: browserVersion,
      engine: browserEngine,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };
  }

  private getPageContext() {
    return {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      loadTime: performance.now(),
      userAgent: navigator.userAgent,
    };
  }

  private getSessionInfo() {
    return {
      sessionId: this.sessionRecording?.sessionId || "unknown",
      sessionDuration: Date.now() - this.sessionStartTime,
      pageViews: this.pageViews,
      interactions: this.interactions,
      lastInteraction: this.lastInteraction,
    };
  }

  private getNetworkInfo() {
    const connection = (navigator as any).connection;

    if (!connection) return undefined;

    return {
      connectionType: connection.type || "unknown",
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }

  private calculateSeverity(
    error: Error,
    errorType: MobileErrorReport["errorType"]
  ): "low" | "medium" | "high" | "critical" {
    // Memory errors are always critical
    if (errorType === "memory") return "critical";

    // Crashes are critical
    if (errorType === "crash") return "critical";

    // Network errors are usually medium unless they're critical endpoints
    if (errorType === "network") return "medium";

    // Check error message for severity indicators
    const message = error.message.toLowerCase();

    if (
      message.includes("out of memory") ||
      message.includes("maximum call stack")
    ) {
      return "critical";
    }

    if (message.includes("network") || message.includes("fetch")) {
      return "medium";
    }

    // Default to high for JavaScript errors
    return "high";
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const mobileErrorTracking = new MobileErrorTrackingService();
export default mobileErrorTracking;
