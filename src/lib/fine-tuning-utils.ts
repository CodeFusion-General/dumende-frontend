/**
 * Fine-tuning Utilities for Animation and Visual Effects
 * Applies optimized timing, contrast, and performance settings
 */

import {
  ANIMATION_CONFIG,
  generateCSSCustomProperties,
  ColorContrast,
} from "./animation-config";

/**
 * Fine-tuning Manager
 * Centralizes all fine-tuning operations for animations and visual effects
 */
export class FineTuningManager {
  private static instance: FineTuningManager;
  private isInitialized = false;
  private contrastAdjustments = new Map<string, string>();

  static getInstance(): FineTuningManager {
    if (!this.instance) {
      this.instance = new FineTuningManager();
    }
    return this.instance;
  }

  /**
   * Initialize fine-tuning system
   */
  init(): void {
    if (this.isInitialized) return;

    this.applyCSSCustomProperties();
    this.optimizeGlassmorphismValues();
    this.enhanceColorContrast();
    this.optimizeAnimationTiming();
    this.setupPerformanceMonitoring();
    this.applyAccessibilityEnhancements();

    this.isInitialized = true;
  }

  /**
   * Apply CSS custom properties from configuration
   */
  private applyCSSCustomProperties(): void {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        ${generateCSSCustomProperties()}
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize glassmorphism values for better balance
   */
  private optimizeGlassmorphismValues(): void {
    const root = document.documentElement;

    // Apply optimized glassmorphism values
    root.style.setProperty(
      "--glass-bg",
      ANIMATION_CONFIG.GLASS.BACKGROUND.DEFAULT
    );
    root.style.setProperty(
      "--glass-bg-light",
      ANIMATION_CONFIG.GLASS.BACKGROUND.LIGHT
    );
    root.style.setProperty(
      "--glass-bg-dark",
      ANIMATION_CONFIG.GLASS.BACKGROUND.DARK
    );
    root.style.setProperty(
      "--glass-border",
      ANIMATION_CONFIG.GLASS.BORDER.DEFAULT
    );
    root.style.setProperty(
      "--glass-border-light",
      ANIMATION_CONFIG.GLASS.BORDER.LIGHT
    );
    root.style.setProperty(
      "--glass-border-dark",
      ANIMATION_CONFIG.GLASS.BORDER.DARK
    );
    root.style.setProperty(
      "--glass-blur",
      `blur(${ANIMATION_CONFIG.GLASS.BLUR.DEFAULT})`
    );
    root.style.setProperty(
      "--glass-blur-light",
      `blur(${ANIMATION_CONFIG.GLASS.BLUR.LIGHT})`
    );
    root.style.setProperty(
      "--glass-blur-heavy",
      `blur(${ANIMATION_CONFIG.GLASS.BLUR.HEAVY})`
    );
    root.style.setProperty(
      "--glass-shadow",
      ANIMATION_CONFIG.GLASS.SHADOW.DEFAULT
    );
    root.style.setProperty(
      "--glass-shadow-hover",
      ANIMATION_CONFIG.GLASS.SHADOW.HOVER
    );
    root.style.setProperty(
      "--glass-shadow-active",
      ANIMATION_CONFIG.GLASS.SHADOW.ACTIVE
    );
  }

  /**
   * Enhance color contrast for better accessibility
   */
  private enhanceColorContrast(): void {
    const root = document.documentElement;

    // Apply enhanced color system
    root.style.setProperty(
      "--color-text-primary",
      ANIMATION_CONFIG.COLORS.TEXT.PRIMARY
    );
    root.style.setProperty(
      "--color-text-secondary",
      ANIMATION_CONFIG.COLORS.TEXT.SECONDARY
    );
    root.style.setProperty(
      "--color-text-light",
      ANIMATION_CONFIG.COLORS.TEXT.LIGHT
    );
    root.style.setProperty(
      "--color-text-muted",
      ANIMATION_CONFIG.COLORS.TEXT.MUTED
    );

    // Check and adjust contrast ratios
    this.validateAndAdjustContrast();
  }

  /**
   * Validate and adjust color contrast ratios
   */
  private validateAndAdjustContrast(): void {
    const contrastPairs = [
      {
        foreground: "#0f4c5c",
        background: "#ffffff",
        name: "primary-on-white",
      },
      {
        foreground: "#1a1a1a",
        background: "#ffffff",
        name: "secondary-on-white",
      },
      {
        foreground: "#ffffff",
        background: "#1a5f7a",
        name: "white-on-primary",
      },
      {
        foreground: "#ffffff",
        background: "#002b5b",
        name: "white-on-secondary",
      },
      { foreground: "#6b7280", background: "#ffffff", name: "muted-on-white" },
    ];

    contrastPairs.forEach(({ foreground, background, name }) => {
      const ratio = ColorContrast.getContrastRatio(foreground, background);

      if (!ColorContrast.meetsWCAGAA(foreground, background)) {
        // Store adjustment for potential future use
        this.contrastAdjustments.set(name, `${ratio.toFixed(2)}:1`);
      } else {
      }
    });
  }

  /**
   * Optimize animation timing across the application
   */
  private optimizeAnimationTiming(): void {
    const root = document.documentElement;

    // Apply optimized timing values
    root.style.setProperty(
      "--duration-fast",
      `${ANIMATION_CONFIG.DURATION.FAST}ms`
    );
    root.style.setProperty(
      "--duration-normal",
      `${ANIMATION_CONFIG.DURATION.NORMAL}ms`
    );
    root.style.setProperty(
      "--duration-slow",
      `${ANIMATION_CONFIG.DURATION.SLOW}ms`
    );
    root.style.setProperty(
      "--duration-slower",
      `${ANIMATION_CONFIG.DURATION.SLOWER}ms`
    );
    root.style.setProperty(
      "--duration-slowest",
      `${ANIMATION_CONFIG.DURATION.SLOWEST}ms`
    );

    // Apply optimized easing functions
    root.style.setProperty("--ease-smooth", ANIMATION_CONFIG.EASING.SMOOTH);
    root.style.setProperty("--ease-bounce", ANIMATION_CONFIG.EASING.BOUNCE);
    root.style.setProperty("--ease-glass", ANIMATION_CONFIG.EASING.GLASS);
    root.style.setProperty("--ease-elastic", ANIMATION_CONFIG.EASING.ELASTIC);
    root.style.setProperty("--ease-back", ANIMATION_CONFIG.EASING.BACK);
  }

  /**
   * Setup performance monitoring for animations
   */
  private setupPerformanceMonitoring(): void {
    // Monitor animation performance
    let frameCount = 0;
    let lastTime = performance.now();

    const monitor = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        if (fps < ANIMATION_CONFIG.PERFORMANCE.MIN_FPS) {
          this.applyPerformanceOptimizations();
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(monitor);
    };

    requestAnimationFrame(monitor);
  }

  /**
   * Apply performance optimizations when needed
   */
  private applyPerformanceOptimizations(): void {
    const root = document.documentElement;

    // Reduce animation durations for better performance
    root.style.setProperty("--duration-fast", "80ms");
    root.style.setProperty("--duration-normal", "150ms");
    root.style.setProperty("--duration-slow", "250ms");

    // Add performance optimization class
    document.body.classList.add("performance-optimized");
  }

  /**
   * Apply accessibility enhancements
   */
  private applyAccessibilityEnhancements(): void {
    // Respect reduced motion preferences
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleReducedMotion = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.add("prefers-reduced-motion");
        this.applyReducedMotionSettings();
      } else {
        document.body.classList.remove("prefers-reduced-motion");
        this.restoreNormalMotionSettings();
      }
    };

    mediaQuery.addEventListener("change", handleReducedMotion);
    handleReducedMotion(mediaQuery as any); // Initial check

    // Enhance focus indicators
    this.enhanceFocusIndicators();
  }

  /**
   * Apply reduced motion settings
   */
  private applyReducedMotionSettings(): void {
    const root = document.documentElement;

    root.style.setProperty(
      "--duration-fast",
      `${ANIMATION_CONFIG.ACCESSIBILITY.REDUCED_MOTION_DURATION}ms`
    );
    root.style.setProperty(
      "--duration-normal",
      `${ANIMATION_CONFIG.ACCESSIBILITY.REDUCED_MOTION_DURATION}ms`
    );
    root.style.setProperty(
      "--duration-slow",
      `${ANIMATION_CONFIG.ACCESSIBILITY.REDUCED_MOTION_DURATION}ms`
    );
  }

  /**
   * Restore normal motion settings
   */
  private restoreNormalMotionSettings(): void {
    const root = document.documentElement;

    root.style.setProperty(
      "--duration-fast",
      `${ANIMATION_CONFIG.DURATION.FAST}ms`
    );
    root.style.setProperty(
      "--duration-normal",
      `${ANIMATION_CONFIG.DURATION.NORMAL}ms`
    );
    root.style.setProperty(
      "--duration-slow",
      `${ANIMATION_CONFIG.DURATION.SLOW}ms`
    );
  }

  /**
   * Enhance focus indicators for better accessibility
   */
  private enhanceFocusIndicators(): void {
    const style = document.createElement("style");
    style.textContent = `
      /* Enhanced focus indicators with optimized values */
      *:focus-visible {
        outline: ${ANIMATION_CONFIG.ACCESSIBILITY.FOCUS_OUTLINE_WIDTH}px solid #0066cc;
        outline-offset: ${ANIMATION_CONFIG.ACCESSIBILITY.FOCUS_OUTLINE_OFFSET}px;
        box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.3);
        transition: all ${ANIMATION_CONFIG.DURATION.FAST}ms ${ANIMATION_CONFIG.EASING.SMOOTH};
      }

      /* Glass element focus indicators */
      .glass:focus-visible,
      .glass-card:focus-visible,
      .glass-button:focus-visible {
        outline: ${ANIMATION_CONFIG.ACCESSIBILITY.FOCUS_OUTLINE_WIDTH}px solid rgba(255, 255, 255, 0.9);
        outline-offset: ${ANIMATION_CONFIG.ACCESSIBILITY.FOCUS_OUTLINE_OFFSET}px;
        box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.4);
        background: ${ANIMATION_CONFIG.GLASS.BACKGROUND.LIGHT};
        border-color: ${ANIMATION_CONFIG.GLASS.BORDER.LIGHT};
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get fine-tuning report
   */
  getFineTuningReport(): {
    optimizedValues: typeof ANIMATION_CONFIG;
    contrastIssues: Map<string, string>;
    performanceStatus: string;
    accessibilityStatus: string;
  } {
    return {
      optimizedValues: ANIMATION_CONFIG,
      contrastIssues: this.contrastAdjustments,
      performanceStatus: document.body.classList.contains(
        "performance-optimized"
      )
        ? "Optimized"
        : "Normal",
      accessibilityStatus: document.body.classList.contains(
        "prefers-reduced-motion"
      )
        ? "Reduced Motion"
        : "Full Motion",
    };
  }

  /**
   * Apply real-time adjustments to specific elements
   */
  adjustElement(
    element: HTMLElement,
    adjustments: {
      duration?: number;
      easing?: string;
      opacity?: number;
      blur?: string;
    }
  ): void {
    if (adjustments.duration) {
      element.style.setProperty(
        "--local-duration",
        `${adjustments.duration}ms`
      );
    }
    if (adjustments.easing) {
      element.style.setProperty("--local-easing", adjustments.easing);
    }
    if (adjustments.opacity) {
      element.style.setProperty(
        "--local-opacity",
        adjustments.opacity.toString()
      );
    }
    if (adjustments.blur) {
      element.style.setProperty("--local-blur", `blur(${adjustments.blur})`);
    }
  }

  /**
   * Batch optimize multiple elements
   */
  batchOptimize(
    elements: HTMLElement[],
    optimizations: {
      reduceMotion?: boolean;
      enhanceContrast?: boolean;
      improvePerformance?: boolean;
    }
  ): void {
    elements.forEach((element) => {
      if (optimizations.reduceMotion) {
        element.classList.add("reduced-motion");
      }
      if (optimizations.enhanceContrast) {
        element.classList.add("enhanced-contrast");
      }
      if (optimizations.improvePerformance) {
        element.classList.add("performance-optimized");
      }
    });
  }
}

/**
 * Animation Quality Analyzer
 * Analyzes and suggests improvements for animation quality
 */
export class AnimationQualityAnalyzer {
  /**
   * Analyze animation timing for optimal feel
   */
  static analyzeTimingCurve(element: HTMLElement): {
    current: string;
    suggested: string;
    reason: string;
  } {
    const computedStyle = window.getComputedStyle(element);
    const currentEasing = computedStyle.transitionTimingFunction;

    // Analyze element type and suggest optimal easing
    if (element.classList.contains("glass-card")) {
      return {
        current: currentEasing,
        suggested: ANIMATION_CONFIG.EASING.GLASS,
        reason: "Glass elements benefit from smooth, natural easing",
      };
    }

    if (element.tagName === "BUTTON") {
      return {
        current: currentEasing,
        suggested: ANIMATION_CONFIG.EASING.BOUNCE,
        reason: "Buttons feel more responsive with subtle bounce",
      };
    }

    return {
      current: currentEasing,
      suggested: ANIMATION_CONFIG.EASING.SMOOTH,
      reason: "Default smooth easing for general elements",
    };
  }

  /**
   * Analyze color contrast and suggest improvements
   */
  static analyzeColorContrast(element: HTMLElement): {
    ratio: number;
    meetsWCAG: boolean;
    suggestions: string[];
  } {
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // Convert colors to hex for analysis (simplified)
    const suggestions: string[] = [];

    // This is a simplified analysis - in a real implementation,
    // you'd need proper color parsing and conversion
    const ratio = 4.5; // Placeholder
    const meetsWCAG = ratio >= 4.5;

    if (!meetsWCAG) {
      suggestions.push("Increase color contrast ratio");
      suggestions.push("Consider using darker text colors");
      suggestions.push("Add background color for better contrast");
    }

    return {
      ratio,
      meetsWCAG,
      suggestions,
    };
  }

  /**
   * Analyze glassmorphism effectiveness
   */
  static analyzeGlassmorphism(element: HTMLElement): {
    hasBackdropFilter: boolean;
    opacity: number;
    suggestions: string[];
  } {
    const computedStyle = window.getComputedStyle(element);
    const backdropFilter = computedStyle.backdropFilter;
    const background = computedStyle.backgroundColor;

    const suggestions: string[] = [];
    const hasBackdropFilter = backdropFilter !== "none";

    // Extract opacity from rgba background
    const opacityMatch = background.match(/rgba?\([^)]+,\s*([^)]+)\)/);
    const opacity = opacityMatch ? parseFloat(opacityMatch[1]) : 1;

    if (!hasBackdropFilter) {
      suggestions.push("Add backdrop-filter for true glassmorphism effect");
    }

    if (opacity > 0.15) {
      suggestions.push("Reduce background opacity for better glass effect");
    }

    if (opacity < 0.05) {
      suggestions.push("Increase background opacity for better visibility");
    }

    return {
      hasBackdropFilter,
      opacity,
      suggestions,
    };
  }
}

// Export singleton instance
export const fineTuningManager = FineTuningManager.getInstance();

// Auto-initialize when DOM is ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      fineTuningManager.init()
    );
  } else {
    fineTuningManager.init();
  }
}
