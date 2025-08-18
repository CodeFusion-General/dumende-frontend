/**
 * Mobile Performance Monitoring Service
 *
 * Tracks Core Web Vitals, memory usage, and network performance
 * specifically optimized for mobile devices
 */

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryPressure: "low" | "medium" | "high" | "critical";
}

export interface NetworkMetrics {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface PerformanceReport {
  id: string;
  timestamp: Date;
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    deviceMemory?: number;
    hardwareConcurrency?: number;
    isMobile: boolean;
  };
  coreWebVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  networkMetrics: NetworkMetrics;
  pageUrl: string;
  sessionId: string;
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  memory: { warning: number; critical: number };
}

class MobilePerformanceMonitoringService {
  private performanceObserver: PerformanceObserver | null = null;
  private memoryMonitorInterval: number | null = null;
  private sessionId: string;
  private isMonitoring = false;
  private performanceData: Partial<CoreWebVitals> = {};
  private callbacks: Array<(report: PerformanceReport) => void> = [];

  // Performance thresholds based on Core Web Vitals recommendations
  private readonly thresholds: PerformanceThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    memory: { warning: 50 * 1024 * 1024, critical: 100 * 1024 * 1024 }, // 50MB warning, 100MB critical
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  /**
   * Start monitoring mobile performance metrics
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.observeWebVitals();
    this.startMemoryMonitoring();
    this.trackNetworkMetrics();
  }

  /**
   * Stop monitoring performance metrics
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }
  }

  /**
   * Subscribe to performance reports
   */
  public onPerformanceReport(
    callback: (report: PerformanceReport) => void
  ): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current performance snapshot
   */
  public getCurrentPerformanceSnapshot(): PerformanceReport {
    return {
      id: this.generateReportId(),
      timestamp: new Date(),
      deviceInfo: this.getDeviceInfo(),
      coreWebVitals: this.getCurrentWebVitals(),
      memoryMetrics: this.getCurrentMemoryMetrics(),
      networkMetrics: this.getCurrentNetworkMetrics(),
      pageUrl: window.location.href,
      sessionId: this.sessionId,
    };
  }

  /**
   * Check if performance metrics exceed thresholds
   */
  public checkPerformanceThresholds(report: PerformanceReport): {
    hasIssues: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check Core Web Vitals
    if (report.coreWebVitals.lcp > this.thresholds.lcp.needsImprovement) {
      issues.push(`LCP too high: ${report.coreWebVitals.lcp}ms`);
    }
    if (report.coreWebVitals.fid > this.thresholds.fid.needsImprovement) {
      issues.push(`FID too high: ${report.coreWebVitals.fid}ms`);
    }
    if (report.coreWebVitals.cls > this.thresholds.cls.needsImprovement) {
      issues.push(`CLS too high: ${report.coreWebVitals.cls}`);
    }

    // Check memory usage
    if (report.memoryMetrics.usedJSHeapSize > this.thresholds.memory.critical) {
      issues.push(
        `Critical memory usage: ${Math.round(
          report.memoryMetrics.usedJSHeapSize / 1024 / 1024
        )}MB`
      );
    } else if (
      report.memoryMetrics.usedJSHeapSize > this.thresholds.memory.warning
    ) {
      issues.push(
        `High memory usage: ${Math.round(
          report.memoryMetrics.usedJSHeapSize / 1024 / 1024
        )}MB`
      );
    }

    return {
      hasIssues: issues.length > 0,
      issues,
    };
  }

  private initializeMonitoring(): void {
    // Start monitoring when the page loads
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.startMonitoring()
      );
    } else {
      this.startMonitoring();
    }

    // Stop monitoring when the page unloads
    window.addEventListener("beforeunload", () => this.stopMonitoring());
  }

  private observeWebVitals(): void {
    if (!("PerformanceObserver" in window)) return;

    try {
      // Observe paint metrics (FCP, LCP)
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = [
        "paint",
        "largest-contentful-paint",
        "first-input",
        "layout-shift",
      ];

      entryTypes.forEach((type) => {
        try {
          this.performanceObserver?.observe({ type, buffered: true });
        } catch (e) {
          // Some entry types might not be supported
          console.warn(`Performance observer type '${type}' not supported:`, e);
        }
      });
    } catch (error) {
      console.error("Failed to initialize performance observer:", error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case "paint":
        if (entry.name === "first-contentful-paint") {
          this.performanceData.fcp = entry.startTime;
        }
        break;

      case "largest-contentful-paint":
        this.performanceData.lcp = entry.startTime;
        break;

      case "first-input":
        this.performanceData.fid =
          (entry as any).processingStart - entry.startTime;
        break;

      case "layout-shift":
        if (!(entry as any).hadRecentInput) {
          this.performanceData.cls =
            (this.performanceData.cls || 0) + (entry as any).value;
        }
        break;
    }

    // Emit performance report when we have enough data
    this.maybeEmitPerformanceReport();
  }

  private startMemoryMonitoring(): void {
    // Monitor memory usage every 5 seconds
    this.memoryMonitorInterval = window.setInterval(() => {
      const memoryMetrics = this.getCurrentMemoryMetrics();

      // Check for memory pressure and emit report if critical
      if (memoryMetrics.memoryPressure === "critical") {
        this.emitPerformanceReport();
      }
    }, 5000);
  }

  private trackNetworkMetrics(): void {
    // Track network information changes
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      const handleConnectionChange = () => {
        this.maybeEmitPerformanceReport();
      };

      connection.addEventListener("change", handleConnectionChange);

      // Cleanup on page unload
      window.addEventListener("beforeunload", () => {
        connection.removeEventListener("change", handleConnectionChange);
      });
    }
  }

  private getCurrentWebVitals(): CoreWebVitals {
    // Calculate TTI and TBT from performance timeline
    const tti = this.calculateTimeToInteractive();
    const tbt = this.calculateTotalBlockingTime();

    return {
      lcp: this.performanceData.lcp || 0,
      fid: this.performanceData.fid || 0,
      cls: this.performanceData.cls || 0,
      fcp: this.performanceData.fcp || 0,
      tti,
      tbt,
    };
  }

  private getCurrentMemoryMetrics(): MemoryMetrics {
    const memory = (performance as any).memory;

    if (!memory) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryPressure: "low",
      };
    }

    const memoryPressure = this.calculateMemoryPressure(memory.usedJSHeapSize);

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      memoryPressure,
    };
  }

  private getCurrentNetworkMetrics(): NetworkMetrics {
    const connection = (navigator as any).connection;

    if (!connection) {
      return {
        connectionType: "unknown",
        effectiveType: "unknown",
        downlink: 0,
        rtt: 0,
        saveData: false,
      };
    }

    return {
      connectionType: connection.type || "unknown",
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
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
    };
  }

  private calculateMemoryPressure(
    usedMemory: number
  ): "low" | "medium" | "high" | "critical" {
    if (usedMemory > this.thresholds.memory.critical) return "critical";
    if (usedMemory > this.thresholds.memory.warning) return "high";
    if (usedMemory > this.thresholds.memory.warning * 0.7) return "medium";
    return "low";
  }

  private calculateTimeToInteractive(): number {
    // Simplified TTI calculation
    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (!navigationEntry) return 0;

    return navigationEntry.domInteractive - navigationEntry.navigationStart;
  }

  private calculateTotalBlockingTime(): number {
    // Simplified TBT calculation
    const longTasks = performance.getEntriesByType("longtask");
    let tbt = 0;

    longTasks.forEach((task) => {
      if (task.duration > 50) {
        tbt += task.duration - 50;
      }
    });

    return tbt;
  }

  private maybeEmitPerformanceReport(): void {
    // Emit report if we have core metrics
    if (this.performanceData.lcp && this.performanceData.fcp) {
      this.emitPerformanceReport();
    }
  }

  private emitPerformanceReport(): void {
    const report = this.getCurrentPerformanceSnapshot();
    this.callbacks.forEach((callback) => {
      try {
        callback(report);
      } catch (error) {
        console.error("Error in performance report callback:", error);
      }
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const mobilePerformanceMonitoring =
  new MobilePerformanceMonitoringService();
export default mobilePerformanceMonitoring;
