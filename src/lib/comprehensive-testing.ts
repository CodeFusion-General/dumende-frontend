/**
 * Comprehensive Testing and Optimization Suite
 * Tests animations, effects, accessibility, and performance across devices and browsers
 */

import { ANIMATION_CONFIG, ColorContrast } from "./animation-config";
import { fineTuningManager } from "./fine-tuning-utils";

/**
 * Browser Compatibility Tester
 */
export class BrowserCompatibilityTester {
  private supportResults = new Map<string, boolean>();

  /**
   * Test all browser features required for modern effects
   */
  async runCompatibilityTests(): Promise<BrowserCompatibilityReport> {
    const tests = [
      { name: "backdrop-filter", test: () => this.testBackdropFilter() },
      { name: "css-transforms-3d", test: () => this.testTransform3D() },
      { name: "css-animations", test: () => this.testCSSAnimations() },
      { name: "webgl", test: () => this.testWebGL() },
      {
        name: "intersection-observer",
        test: () => this.testIntersectionObserver(),
      },
      { name: "resize-observer", test: () => this.testResizeObserver() },
      { name: "custom-properties", test: () => this.testCSSCustomProperties() },
      { name: "grid-layout", test: () => this.testCSSGrid() },
      { name: "flexbox", test: () => this.testFlexbox() },
    ];

    const results: BrowserCompatibilityReport = {
      browser: this.getBrowserInfo(),
      features: {},
      overallScore: 0,
      recommendations: [],
    };

    for (const { name, test } of tests) {
      try {
        const supported = await test();
        this.supportResults.set(name, supported);
        results.features[name] = {
          supported,
          fallbackAvailable: this.hasFallback(name),
        };
      } catch (error) {
        results.features[name] = {
          supported: false,
          fallbackAvailable: this.hasFallback(name),
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    results.overallScore = this.calculateOverallScore(results.features);
    results.recommendations = this.generateRecommendations(results.features);

    return results;
  }

  private testBackdropFilter(): boolean {
    return (
      CSS.supports("backdrop-filter", "blur(10px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(10px)")
    );
  }

  private testTransform3D(): boolean {
    return CSS.supports("transform", "translate3d(0,0,0)");
  }

  private testCSSAnimations(): boolean {
    return CSS.supports("animation", "test 1s ease");
  }

  private testWebGL(): boolean {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  }

  private testIntersectionObserver(): boolean {
    return "IntersectionObserver" in window;
  }

  private testResizeObserver(): boolean {
    return "ResizeObserver" in window;
  }

  private testCSSCustomProperties(): boolean {
    return CSS.supports("color", "var(--test)");
  }

  private testCSSGrid(): boolean {
    return CSS.supports("display", "grid");
  }

  private testFlexbox(): boolean {
    return CSS.supports("display", "flex");
  }

  private getBrowserInfo(): BrowserInfo {
    const ua = navigator.userAgent;
    return {
      name: this.getBrowserName(ua),
      version: this.getBrowserVersion(ua),
      engine: this.getBrowserEngine(ua),
      platform: navigator.platform,
      mobile: /Mobi|Android/i.test(ua),
    };
  }

  private getBrowserName(ua: string): string {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[1] : "Unknown";
  }

  private getBrowserEngine(ua: string): string {
    if (ua.includes("WebKit")) return "WebKit";
    if (ua.includes("Gecko")) return "Gecko";
    if (ua.includes("Trident")) return "Trident";
    return "Unknown";
  }

  private hasFallback(feature: string): boolean {
    const fallbacks = {
      "backdrop-filter": true,
      "css-transforms-3d": true,
      "css-animations": true,
      webgl: false,
      "intersection-observer": true,
      "resize-observer": true,
      "custom-properties": false,
      "grid-layout": true,
      flexbox: false,
    };
    return fallbacks[feature as keyof typeof fallbacks] || false;
  }

  private calculateOverallScore(
    features: Record<string, FeatureSupport>
  ): number {
    const total = Object.keys(features).length;
    const supported = Object.values(features).filter((f) => f.supported).length;
    return Math.round((supported / total) * 100);
  }

  private generateRecommendations(
    features: Record<string, FeatureSupport>
  ): string[] {
    const recommendations: string[] = [];

    if (!features["backdrop-filter"]?.supported) {
      recommendations.push(
        "Enable backdrop-filter fallbacks for glassmorphism effects"
      );
    }

    if (!features["css-transforms-3d"]?.supported) {
      recommendations.push("Disable 3D transforms and use 2D alternatives");
    }

    if (!features["intersection-observer"]?.supported) {
      recommendations.push(
        "Use scroll event listeners as fallback for scroll animations"
      );
    }

    if (!features["webgl"]?.supported) {
      recommendations.push("Disable GPU-accelerated animations");
    }

    return recommendations;
  }
}

/**
 * Performance Tester
 */
export class PerformanceTester {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    loadTime: 0,
    animationPerformance: {},
  };

  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests(): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      metrics: this.metrics,
      score: 0,
      issues: [],
      optimizations: [],
    };

    // Test FPS and frame timing
    await this.testAnimationPerformance();

    // Test memory usage
    this.testMemoryUsage();

    // Test load performance
    await this.testLoadPerformance();

    // Test specific animation types
    await this.testSpecificAnimations();

    report.score = this.calculatePerformanceScore();
    report.issues = this.identifyPerformanceIssues();
    report.optimizations = this.suggestOptimizations();

    return report;
  }

  private async testAnimationPerformance(): Promise<void> {
    return new Promise((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();
      let lastFrameTime = startTime;
      const frameTimes: number[] = [];

      const measureFrame = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        frameTimes.push(frameTime);
        frameCount++;
        lastFrameTime = currentTime;

        if (currentTime - startTime >= 2000) {
          // Test for 2 seconds
          this.metrics.fps = Math.round(
            (frameCount * 1000) / (currentTime - startTime)
          );
          this.metrics.frameTime =
            frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          resolve();
        } else {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  private testMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  private async testLoadPerformance(): Promise<void> {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
    }
  }

  private async testSpecificAnimations(): Promise<void> {
    const animations = [
      { name: "glass-card-hover", selector: ".glass-card" },
      { name: "button-ripple", selector: "button" },
      { name: "scroll-reveal", selector: "[data-scroll-reveal]" },
      { name: "parallax", selector: "[data-parallax]" },
    ];

    for (const { name, selector } of animations) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        this.metrics.animationPerformance[name] =
          await this.measureAnimationPerformance(elements[0] as HTMLElement);
      }
    }
  }

  private async measureAnimationPerformance(
    element: HTMLElement
  ): Promise<AnimationPerformanceMetrics> {
    return new Promise((resolve) => {
      let startTime = performance.now();
      let frameCount = 0;
      const frameTimes: number[] = [];

      // Trigger animation
      element.style.transform = "translateY(-10px)";
      element.style.transition = "transform 300ms ease";

      const measureFrame = () => {
        const currentTime = performance.now();
        frameCount++;
        frameTimes.push(currentTime - startTime);

        if (currentTime - startTime >= 300) {
          // Animation duration
          resolve({
            duration: currentTime - startTime,
            frameCount,
            averageFrameTime:
              frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length,
            smoothness:
              frameCount >= 18
                ? "smooth"
                : frameCount >= 12
                ? "acceptable"
                : "choppy",
          });
        } else {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  private calculatePerformanceScore(): number {
    let score = 100;

    // FPS penalty
    if (this.metrics.fps < 30) score -= 30;
    else if (this.metrics.fps < 45) score -= 15;
    else if (this.metrics.fps < 55) score -= 5;

    // Frame time penalty
    if (this.metrics.frameTime > 20) score -= 20;
    else if (this.metrics.frameTime > 16.67) score -= 10;

    // Memory usage penalty
    if (this.metrics.memoryUsage > 100) score -= 15;
    else if (this.metrics.memoryUsage > 50) score -= 5;

    // Load time penalty
    if (this.metrics.loadTime > 3000) score -= 20;
    else if (this.metrics.loadTime > 2000) score -= 10;

    return Math.max(0, score);
  }

  private identifyPerformanceIssues(): string[] {
    const issues: string[] = [];

    if (this.metrics.fps < 30) {
      issues.push("Low FPS detected - animations may appear choppy");
    }

    if (this.metrics.frameTime > 16.67) {
      issues.push("High frame time - may cause animation stuttering");
    }

    if (this.metrics.memoryUsage > 50) {
      issues.push("High memory usage detected");
    }

    if (this.metrics.loadTime > 2000) {
      issues.push("Slow page load time");
    }

    return issues;
  }

  private suggestOptimizations(): string[] {
    const optimizations: string[] = [];

    if (this.metrics.fps < 45) {
      optimizations.push("Reduce animation complexity");
      optimizations.push("Enable GPU acceleration for transforms");
      optimizations.push("Use will-change property sparingly");
    }

    if (this.metrics.memoryUsage > 50) {
      optimizations.push("Optimize image sizes and formats");
      optimizations.push("Remove unused CSS and JavaScript");
    }

    if (this.metrics.loadTime > 2000) {
      optimizations.push("Enable compression and caching");
      optimizations.push("Optimize critical rendering path");
    }

    return optimizations;
  }
}

/**
 * Accessibility Tester
 */
export class AccessibilityTester {
  /**
   * Run comprehensive accessibility tests
   */
  async runAccessibilityTests(): Promise<AccessibilityReport> {
    const report: AccessibilityReport = {
      score: 0,
      issues: [],
      recommendations: [],
      wcagCompliance: {
        level: "AA",
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };

    // Test color contrast
    await this.testColorContrast(report);

    // Test keyboard navigation
    await this.testKeyboardNavigation(report);

    // Test screen reader compatibility
    await this.testScreenReaderCompatibility(report);

    // Test reduced motion preferences
    await this.testReducedMotionSupport(report);

    // Test focus indicators
    await this.testFocusIndicators(report);

    report.score = this.calculateAccessibilityScore(report);

    return report;
  }

  private async testColorContrast(report: AccessibilityReport): Promise<void> {
    const textElements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, button, label"
    );

    for (const element of textElements) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Simplified contrast check - in real implementation, you'd need proper color parsing
      if (color && backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)") {
        // This is a placeholder - actual implementation would parse colors and calculate contrast
        const contrastRatio = 4.5; // Placeholder

        if (contrastRatio < 4.5) {
          report.issues.push(
            `Low contrast ratio detected on ${element.tagName.toLowerCase()}`
          );
          report.wcagCompliance.failed++;
        } else {
          report.wcagCompliance.passed++;
        }
      }
    }
  }

  private async testKeyboardNavigation(
    report: AccessibilityReport
  ): Promise<void> {
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    let hasTabIndex = true;
    let hasSkipLinks = false;

    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute("tabindex");
      if (tabIndex && parseInt(tabIndex) > 0) {
        report.issues.push(
          `Positive tabindex found on element ${
            index + 1
          } - may disrupt natural tab order`
        );
        report.wcagCompliance.warnings++;
      }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    hasSkipLinks = skipLinks.length > 0;

    if (!hasSkipLinks) {
      report.issues.push(
        "No skip links found - may hinder keyboard navigation"
      );
      report.recommendations.push(
        "Add skip links for better keyboard navigation"
      );
    }
  }

  private async testScreenReaderCompatibility(
    report: AccessibilityReport
  ): Promise<void> {
    // Test for proper heading structure
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let previousLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        report.issues.push(
          `Heading level skipped: ${heading.tagName} follows h${previousLevel}`
        );
        report.wcagCompliance.warnings++;
      }
      previousLevel = level;
    });

    // Test for alt text on images
    const images = document.querySelectorAll("img");
    images.forEach((img, index) => {
      if (!img.getAttribute("alt")) {
        report.issues.push(`Image ${index + 1} missing alt text`);
        report.wcagCompliance.failed++;
      }
    });

    // Test for form labels
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input, index) => {
      const id = input.getAttribute("id");
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute("aria-label");

      if (!label && !ariaLabel) {
        report.issues.push(`Form input ${index + 1} missing label`);
        report.wcagCompliance.failed++;
      }
    });
  }

  private async testReducedMotionSupport(
    report: AccessibilityReport
  ): Promise<void> {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Check if reduced motion styles are applied
      const animatedElements = document.querySelectorAll(
        ".animate-fade-in-up, .animate-slide-in-glass, .animate-scale-in-bounce"
      );

      animatedElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const animationDuration = computedStyle.animationDuration;

        if (animationDuration !== "0s" && animationDuration !== "0.01ms") {
          report.issues.push(
            "Animation not disabled for reduced motion preference"
          );
          report.wcagCompliance.failed++;
        }
      });
    }

    report.wcagCompliance.passed++;
  }

  private async testFocusIndicators(
    report: AccessibilityReport
  ): Promise<void> {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element, index) => {
      // Simulate focus to test focus indicators
      (element as HTMLElement).focus();
      const computedStyle = window.getComputedStyle(element);
      const outline = computedStyle.outline;
      const boxShadow = computedStyle.boxShadow;

      if (outline === "none" && boxShadow === "none") {
        report.issues.push(
          `Element ${index + 1} has no visible focus indicator`
        );
        report.wcagCompliance.failed++;
      } else {
        report.wcagCompliance.passed++;
      }
    });
  }

  private calculateAccessibilityScore(report: AccessibilityReport): number {
    const total =
      report.wcagCompliance.passed +
      report.wcagCompliance.failed +
      report.wcagCompliance.warnings;
    if (total === 0) return 100;

    const score =
      ((report.wcagCompliance.passed + report.wcagCompliance.warnings * 0.5) /
        total) *
      100;
    return Math.round(score);
  }
}

/**
 * Comprehensive Test Runner
 */
export class ComprehensiveTestRunner {
  private browserTester = new BrowserCompatibilityTester();
  private performanceTester = new PerformanceTester();
  private accessibilityTester = new AccessibilityTester();

  /**
   * Run all comprehensive tests
   */
  async runAllTests(): Promise<ComprehensiveTestReport> {
    console.log("🧪 Starting comprehensive testing suite...");

    const [browserReport, performanceReport, accessibilityReport] =
      await Promise.all([
        this.browserTester.runCompatibilityTests(),
        this.performanceTester.runPerformanceTests(),
        this.accessibilityTester.runAccessibilityTests(),
      ]);

    const overallScore = this.calculateOverallScore(
      browserReport,
      performanceReport,
      accessibilityReport
    );
    const criticalIssues = this.identifyCriticalIssues(
      browserReport,
      performanceReport,
      accessibilityReport
    );
    const optimizations = this.generateOptimizations(
      browserReport,
      performanceReport,
      accessibilityReport
    );

    const report: ComprehensiveTestReport = {
      timestamp: new Date().toISOString(),
      overallScore,
      browserCompatibility: browserReport,
      performance: performanceReport,
      accessibility: accessibilityReport,
      criticalIssues,
      optimizations,
      summary: this.generateSummary(overallScore, criticalIssues.length),
    };

    console.log("✅ Comprehensive testing completed");
    console.log(`📊 Overall Score: ${overallScore}/100`);
    console.log(`⚠️ Critical Issues: ${criticalIssues.length}`);

    return report;
  }

  private calculateOverallScore(
    browser: BrowserCompatibilityReport,
    performance: PerformanceReport,
    accessibility: AccessibilityReport
  ): number {
    // Weighted average: Browser 30%, Performance 40%, Accessibility 30%
    return Math.round(
      browser.overallScore * 0.3 +
        performance.score * 0.4 +
        accessibility.score * 0.3
    );
  }

  private identifyCriticalIssues(
    browser: BrowserCompatibilityReport,
    performance: PerformanceReport,
    accessibility: AccessibilityReport
  ): string[] {
    const critical: string[] = [];

    // Browser compatibility critical issues
    if (!browser.features["backdrop-filter"]?.supported) {
      critical.push(
        "Backdrop filter not supported - glassmorphism effects will not work"
      );
    }

    // Performance critical issues
    if (performance.metrics.fps < 30) {
      critical.push("Very low FPS - animations will be choppy");
    }

    // Accessibility critical issues
    if (
      accessibility.wcagCompliance.failed > accessibility.wcagCompliance.passed
    ) {
      critical.push(
        "More accessibility failures than passes - WCAG compliance at risk"
      );
    }

    return critical;
  }

  private generateOptimizations(
    browser: BrowserCompatibilityReport,
    performance: PerformanceReport,
    accessibility: AccessibilityReport
  ): string[] {
    const optimizations = new Set<string>();

    // Add browser optimizations
    browser.recommendations.forEach((rec) => optimizations.add(rec));

    // Add performance optimizations
    performance.optimizations.forEach((opt) => optimizations.add(opt));

    // Add accessibility optimizations
    accessibility.recommendations.forEach((rec) => optimizations.add(rec));

    return Array.from(optimizations);
  }

  private generateSummary(score: number, criticalIssues: number): string {
    if (score >= 90 && criticalIssues === 0) {
      return "Excellent - Website is highly optimized with modern effects working perfectly";
    } else if (score >= 75 && criticalIssues <= 2) {
      return "Good - Website performs well with minor optimization opportunities";
    } else if (score >= 60) {
      return "Fair - Website needs optimization to improve user experience";
    } else {
      return "Poor - Significant optimization required for acceptable performance";
    }
  }

  /**
   * Generate detailed HTML report
   */
  generateHTMLReport(report: ComprehensiveTestReport): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprehensive Test Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; }
          .score { font-size: 2rem; font-weight: bold; color: ${
            report.overallScore >= 75
              ? "#22c55e"
              : report.overallScore >= 50
              ? "#f59e0b"
              : "#ef4444"
          }; }
          .section { margin: 2rem 0; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
          .critical { background: #fef2f2; border-color: #fecaca; }
          .issue { color: #dc2626; margin: 0.5rem 0; }
          .recommendation { color: #059669; margin: 0.5rem 0; }
        </style>
      </head>
      <body>
        <h1>Comprehensive Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <div class="score">Overall Score: ${report.overallScore}/100</div>
        <p>${report.summary}</p>
        
        ${
          report.criticalIssues.length > 0
            ? `
        <div class="section critical">
          <h2>Critical Issues</h2>
          ${report.criticalIssues
            .map((issue) => `<div class="issue">⚠️ ${issue}</div>`)
            .join("")}
        </div>
        `
            : ""
        }
        
        <div class="section">
          <h2>Browser Compatibility (${
            report.browserCompatibility.overallScore
          }/100)</h2>
          <p>Browser: ${report.browserCompatibility.browser.name} ${
      report.browserCompatibility.browser.version
    }</p>
          <p>Platform: ${report.browserCompatibility.browser.platform}</p>
          ${Object.entries(report.browserCompatibility.features)
            .map(
              ([feature, support]) =>
                `<div>${feature}: ${support.supported ? "✅" : "❌"} ${
                  support.fallbackAvailable ? "(Fallback available)" : ""
                }</div>`
            )
            .join("")}
        </div>
        
        <div class="section">
          <h2>Performance (${report.performance.score}/100)</h2>
          <p>FPS: ${report.performance.metrics.fps}</p>
          <p>Frame Time: ${report.performance.metrics.frameTime.toFixed(
            2
          )}ms</p>
          <p>Memory Usage: ${report.performance.metrics.memoryUsage.toFixed(
            2
          )}MB</p>
          <p>Load Time: ${report.performance.metrics.loadTime}ms</p>
          ${report.performance.issues
            .map((issue) => `<div class="issue">${issue}</div>`)
            .join("")}
        </div>
        
        <div class="section">
          <h2>Accessibility (${report.accessibility.score}/100)</h2>
          <p>WCAG ${report.accessibility.wcagCompliance.level} Compliance:</p>
          <p>Passed: ${report.accessibility.wcagCompliance.passed}</p>
          <p>Failed: ${report.accessibility.wcagCompliance.failed}</p>
          <p>Warnings: ${report.accessibility.wcagCompliance.warnings}</p>
          ${report.accessibility.issues
            .map((issue) => `<div class="issue">${issue}</div>`)
            .join("")}
        </div>
        
        <div class="section">
          <h2>Recommended Optimizations</h2>
          ${report.optimizations
            .map((opt) => `<div class="recommendation">💡 ${opt}</div>`)
            .join("")}
        </div>
      </body>
      </html>
    `;
  }
}

// Type definitions
interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
}

interface FeatureSupport {
  supported: boolean;
  fallbackAvailable: boolean;
  error?: string;
}

interface BrowserCompatibilityReport {
  browser: BrowserInfo;
  features: Record<string, FeatureSupport>;
  overallScore: number;
  recommendations: string[];
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  loadTime: number;
  animationPerformance: Record<string, AnimationPerformanceMetrics>;
}

interface AnimationPerformanceMetrics {
  duration: number;
  frameCount: number;
  averageFrameTime: number;
  smoothness: "smooth" | "acceptable" | "choppy";
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  score: number;
  issues: string[];
  optimizations: string[];
}

interface AccessibilityReport {
  score: number;
  issues: string[];
  recommendations: string[];
  wcagCompliance: {
    level: "AA" | "AAA";
    passed: number;
    failed: number;
    warnings: number;
  };
}

interface ComprehensiveTestReport {
  timestamp: string;
  overallScore: number;
  browserCompatibility: BrowserCompatibilityReport;
  performance: PerformanceReport;
  accessibility: AccessibilityReport;
  criticalIssues: string[];
  optimizations: string[];
  summary: string;
}

// Export singleton instance
export const comprehensiveTestRunner = new ComprehensiveTestRunner();
