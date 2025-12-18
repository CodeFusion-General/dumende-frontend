/**
 * Performance Analytics Dashboard Service
 *
 * Real-time performance monitoring dashboard, alerting for mobile performance degradation,
 * and A/B testing framework for mobile optimizations
 */

import {
  mobilePerformanceMonitoring,
  type PerformanceReport,
} from "./mobilePerformanceMonitoring";
import {
  mobileErrorTracking,
  type MobileErrorReport,
} from "./mobileErrorTracking";

export interface PerformanceAlert {
  id: string;
  timestamp: Date;
  type: "performance" | "error" | "memory" | "network";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  data: Record<string, any>;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface PerformanceMetrics {
  timestamp: Date;
  coreWebVitals: {
    lcp: { value: number; grade: "good" | "needs-improvement" | "poor" };
    fid: { value: number; grade: "good" | "needs-improvement" | "poor" };
    cls: { value: number; grade: "good" | "needs-improvement" | "poor" };
  };
  memoryUsage: {
    current: number;
    peak: number;
    pressure: "low" | "medium" | "high" | "critical";
  };
  errorRate: {
    total: number;
    rate: number; // errors per minute
    criticalErrors: number;
  };
  networkPerformance: {
    connectionType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  deviceInfo: {
    isMobile: boolean;
    platform: string;
    browserName: string;
    viewportSize: { width: number; height: number };
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trafficPercentage: number; // 0-100
  config: Record<string, any>;
  metrics: {
    participants: number;
    conversions: number;
    conversionRate: number;
    avgPerformanceScore: number;
    errorRate: number;
  };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "completed";
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  targetMetric: "performance" | "conversion" | "error-rate";
  currentWinner?: string; // variant id
}

export interface DashboardConfig {
  refreshInterval: number; // milliseconds
  alertThresholds: {
    lcp: { warning: number; critical: number };
    fid: { warning: number; critical: number };
    cls: { warning: number; critical: number };
    memoryUsage: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
  };
  retentionPeriod: number; // days
  enableRealTimeAlerts: boolean;
}

class PerformanceAnalyticsDashboardService {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private abTests: ABTest[] = [];
  private activeVariants: Map<string, string> = new Map(); // userId -> variantId
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];
  private metricsCallbacks: Array<(metrics: PerformanceMetrics) => void> = [];
  private refreshInterval: number | null = null;
  private isMonitoring = false;

  private readonly defaultConfig: DashboardConfig = {
    refreshInterval: 30000, // 30 seconds
    alertThresholds: {
      lcp: { warning: 2500, critical: 4000 },
      fid: { warning: 100, critical: 300 },
      cls: { warning: 0.1, critical: 0.25 },
      memoryUsage: { warning: 50 * 1024 * 1024, critical: 100 * 1024 * 1024 }, // 50MB/100MB
      errorRate: { warning: 5, critical: 10 }, // errors per minute
    },
    retentionPeriod: 30, // 30 days
    enableRealTimeAlerts: true,
  };

  private config: DashboardConfig;

  constructor(config?: Partial<DashboardConfig>) {
    this.config = { ...this.defaultConfig, ...config };
    this.initializeDashboard();
  }

  /**
   * Start real-time performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupPerformanceTracking();
    this.setupErrorTracking();
    this.startMetricsCollection();
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  /**
   * Get performance metrics for a time range
   */
  public getMetricsHistory(
    startDate: Date,
    endDate: Date = new Date()
  ): PerformanceMetrics[] {
    return this.metrics.filter(
      (metric) => metric.timestamp >= startDate && metric.timestamp <= endDate
    );
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(
      (alert) => !alert.acknowledged && !alert.resolvedAt
    );
  }

  /**
   * Get all alerts
   */
  public getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Create a new A/B test
   */
  public createABTest(test: Omit<ABTest, "id" | "status">): string {
    const abTest: ABTest = {
      id: this.generateId("test"),
      status: "draft",
      ...test,
    };

    this.abTests.push(abTest);
    return abTest.id;
  }

  /**
   * Start an A/B test
   */
  public startABTest(testId: string): boolean {
    const test = this.abTests.find((t) => t.id === testId);
    if (test && test.status === "draft") {
      test.status = "running";
      test.startDate = new Date();
      return true;
    }
    return false;
  }

  /**
   * Stop an A/B test
   */
  public stopABTest(testId: string): boolean {
    const test = this.abTests.find((t) => t.id === testId);
    if (test && test.status === "running") {
      test.status = "completed";
      test.endDate = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get variant for a user (A/B testing)
   */
  public getVariantForUser(
    testId: string,
    userId: string
  ): ABTestVariant | null {
    const test = this.abTests.find(
      (t) => t.id === testId && t.status === "running"
    );
    if (!test) return null;

    // Check if user already has a variant assigned
    const existingVariant = this.activeVariants.get(`${testId}:${userId}`);
    if (existingVariant) {
      return test.variants.find((v) => v.id === existingVariant) || null;
    }

    // Assign new variant based on traffic percentage
    const hash = this.hashUserId(userId);
    let cumulativePercentage = 0;

    for (const variant of test.variants) {
      if (!variant.enabled) continue;

      cumulativePercentage += variant.trafficPercentage;
      if (hash <= cumulativePercentage) {
        this.activeVariants.set(`${testId}:${userId}`, variant.id);
        variant.metrics.participants++;
        return variant;
      }
    }

    return null;
  }

  /**
   * Record conversion for A/B test
   */
  public recordConversion(testId: string, userId: string): void {
    const variantKey = `${testId}:${userId}`;
    const variantId = this.activeVariants.get(variantKey);

    if (variantId) {
      const test = this.abTests.find((t) => t.id === testId);
      const variant = test?.variants.find((v) => v.id === variantId);

      if (variant) {
        variant.metrics.conversions++;
        variant.metrics.conversionRate =
          variant.metrics.participants > 0
            ? (variant.metrics.conversions / variant.metrics.participants) * 100
            : 0;
      }
    }
  }

  /**
   * Get A/B test results
   */
  public getABTestResults(testId: string): ABTest | null {
    return this.abTests.find((t) => t.id === testId) || null;
  }

  /**
   * Subscribe to performance alerts
   */
  public onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);

    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to metrics updates
   */
  public onMetricsUpdate(
    callback: (metrics: PerformanceMetrics) => void
  ): () => void {
    this.metricsCallbacks.push(callback);

    return () => {
      const index = this.metricsCallbacks.indexOf(callback);
      if (index > -1) {
        this.metricsCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update dashboard configuration
   */
  public updateConfig(newConfig: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart monitoring with new config
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }


  /**
   * Clear old data based on retention period
   */
  public cleanupOldData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);

    this.metrics = this.metrics.filter(
      (metric) => metric.timestamp >= cutoffDate
    );
    this.alerts = this.alerts.filter((alert) => alert.timestamp >= cutoffDate);
  }

  private initializeDashboard(): void {
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

    // Cleanup old data periodically
    setInterval(() => this.cleanupOldData(), 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private setupPerformanceTracking(): void {
    mobilePerformanceMonitoring.onPerformanceReport(
      (report: PerformanceReport) => {
        this.processPerformanceReport(report);
      }
    );
  }

  private setupErrorTracking(): void {
    mobileErrorTracking.onErrorReport((report: MobileErrorReport) => {
      this.processErrorReport(report);
    });
  }

  private startMetricsCollection(): void {
    this.refreshInterval = window.setInterval(() => {
      this.collectCurrentMetrics();
    }, this.config.refreshInterval);

    // Collect initial metrics
    this.collectCurrentMetrics();
  }

  private collectCurrentMetrics(): void {
    const performanceReport =
      mobilePerformanceMonitoring.getCurrentPerformanceSnapshot();
    const sessionErrors = mobileErrorTracking.getSessionErrors();

    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      coreWebVitals: {
        lcp: {
          value: performanceReport.coreWebVitals.lcp,
          grade: this.gradeWebVital("lcp", performanceReport.coreWebVitals.lcp),
        },
        fid: {
          value: performanceReport.coreWebVitals.fid,
          grade: this.gradeWebVital("fid", performanceReport.coreWebVitals.fid),
        },
        cls: {
          value: performanceReport.coreWebVitals.cls,
          grade: this.gradeWebVital("cls", performanceReport.coreWebVitals.cls),
        },
      },
      memoryUsage: {
        current: performanceReport.memoryMetrics.usedJSHeapSize,
        peak: Math.max(
          ...this.metrics.map((m) => m.memoryUsage.current),
          performanceReport.memoryMetrics.usedJSHeapSize
        ),
        pressure: performanceReport.memoryMetrics.memoryPressure,
      },
      errorRate: {
        total: sessionErrors.length,
        rate: this.calculateErrorRate(sessionErrors),
        criticalErrors: sessionErrors.filter((e) => e.severity === "critical")
          .length,
      },
      networkPerformance: {
        connectionType: performanceReport.networkMetrics.connectionType,
        effectiveType: performanceReport.networkMetrics.effectiveType,
        downlink: performanceReport.networkMetrics.downlink,
        rtt: performanceReport.networkMetrics.rtt,
      },
      deviceInfo: {
        isMobile: performanceReport.deviceInfo.isMobile,
        platform: performanceReport.deviceInfo.userAgent,
        browserName: this.extractBrowserName(
          performanceReport.deviceInfo.userAgent
        ),
        viewportSize: performanceReport.deviceInfo.viewport,
      },
    };

    this.metrics.push(metrics);
    this.checkForAlerts(metrics);
    this.notifyMetricsCallbacks(metrics);
  }

  private processPerformanceReport(report: PerformanceReport): void {
    const thresholds =
      mobilePerformanceMonitoring.checkPerformanceThresholds(report);

    if (thresholds.hasIssues) {
      const alert: PerformanceAlert = {
        id: this.generateId("alert"),
        timestamp: new Date(),
        type: "performance",
        severity: this.calculateAlertSeverity(thresholds.issues),
        message: `Performance issues detected: ${thresholds.issues.join(", ")}`,
        data: { report, issues: thresholds.issues },
        acknowledged: false,
      };

      this.addAlert(alert);
    }
  }

  private processErrorReport(report: MobileErrorReport): void {
    const alert: PerformanceAlert = {
      id: this.generateId("alert"),
      timestamp: new Date(),
      type: "error",
      severity: report.severity,
      message: `${report.errorType}: ${report.message}`,
      data: { report },
      acknowledged: false,
    };

    this.addAlert(alert);
  }

  private checkForAlerts(metrics: PerformanceMetrics): void {
    const { alertThresholds } = this.config;

    // Check Core Web Vitals
    if (metrics.coreWebVitals.lcp.value > alertThresholds.lcp.critical) {
      this.createAlert(
        "performance",
        "critical",
        `LCP is critically high: ${metrics.coreWebVitals.lcp.value}ms`,
        { metrics }
      );
    } else if (metrics.coreWebVitals.lcp.value > alertThresholds.lcp.warning) {
      this.createAlert(
        "performance",
        "medium",
        `LCP needs improvement: ${metrics.coreWebVitals.lcp.value}ms`,
        { metrics }
      );
    }

    if (metrics.coreWebVitals.fid.value > alertThresholds.fid.critical) {
      this.createAlert(
        "performance",
        "critical",
        `FID is critically high: ${metrics.coreWebVitals.fid.value}ms`,
        { metrics }
      );
    } else if (metrics.coreWebVitals.fid.value > alertThresholds.fid.warning) {
      this.createAlert(
        "performance",
        "medium",
        `FID needs improvement: ${metrics.coreWebVitals.fid.value}ms`,
        { metrics }
      );
    }

    if (metrics.coreWebVitals.cls.value > alertThresholds.cls.critical) {
      this.createAlert(
        "performance",
        "critical",
        `CLS is critically high: ${metrics.coreWebVitals.cls.value}`,
        { metrics }
      );
    } else if (metrics.coreWebVitals.cls.value > alertThresholds.cls.warning) {
      this.createAlert(
        "performance",
        "medium",
        `CLS needs improvement: ${metrics.coreWebVitals.cls.value}`,
        { metrics }
      );
    }

    // Check memory usage
    if (metrics.memoryUsage.current > alertThresholds.memoryUsage.critical) {
      this.createAlert(
        "memory",
        "critical",
        `Memory usage is critical: ${Math.round(
          metrics.memoryUsage.current / 1024 / 1024
        )}MB`,
        { metrics }
      );
    } else if (
      metrics.memoryUsage.current > alertThresholds.memoryUsage.warning
    ) {
      this.createAlert(
        "memory",
        "medium",
        `Memory usage is high: ${Math.round(
          metrics.memoryUsage.current / 1024 / 1024
        )}MB`,
        { metrics }
      );
    }

    // Check error rate
    if (metrics.errorRate.rate > alertThresholds.errorRate.critical) {
      this.createAlert(
        "error",
        "critical",
        `Error rate is critical: ${metrics.errorRate.rate} errors/min`,
        { metrics }
      );
    } else if (metrics.errorRate.rate > alertThresholds.errorRate.warning) {
      this.createAlert(
        "error",
        "medium",
        `Error rate is high: ${metrics.errorRate.rate} errors/min`,
        { metrics }
      );
    }
  }

  private createAlert(
    type: PerformanceAlert["type"],
    severity: PerformanceAlert["severity"],
    message: string,
    data: Record<string, any>
  ): void {
    const alert: PerformanceAlert = {
      id: this.generateId("alert"),
      timestamp: new Date(),
      type,
      severity,
      message,
      data,
      acknowledged: false,
    };

    this.addAlert(alert);
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    if (this.config.enableRealTimeAlerts) {
      this.notifyAlertCallbacks(alert);
    }
  }

  private notifyAlertCallbacks(alert: PerformanceAlert): void {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(alert);
      } catch (error) {
        console.error("Error in alert callback:", error);
      }
    });
  }

  private notifyMetricsCallbacks(metrics: PerformanceMetrics): void {
    this.metricsCallbacks.forEach((callback) => {
      try {
        callback(metrics);
      } catch (error) {
        console.error("Error in metrics callback:", error);
      }
    });
  }

  private gradeWebVital(
    metric: "lcp" | "fid" | "cls",
    value: number
  ): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  private calculateErrorRate(errors: MobileErrorReport[]): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    const recentErrors = errors.filter(
      (error) => error.timestamp.getTime() >= oneMinuteAgo
    );

    return recentErrors.length;
  }

  private calculateAlertSeverity(
    issues: string[]
  ): PerformanceAlert["severity"] {
    if (
      issues.some(
        (issue) => issue.includes("Critical") || issue.includes("critical")
      )
    ) {
      return "critical";
    }
    if (issues.length >= 3) return "high";
    if (issues.length >= 2) return "medium";
    return "low";
  }

  private extractBrowserName(userAgent: string): string {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100; // Return 0-99
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const performanceAnalyticsDashboard =
  new PerformanceAnalyticsDashboardService();
export default performanceAnalyticsDashboard;
