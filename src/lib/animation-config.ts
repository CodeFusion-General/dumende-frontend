/**
 * Fine-tuned Animation Configuration for 2025 Modern Design
 * Optimized timing, easing, and visual effects for premium user experience
 */

export const ANIMATION_CONFIG = {
  // Optimized Duration Values (in milliseconds)
  DURATION: {
    INSTANT: 0,
    FAST: 120,
    NORMAL: 250,
    SLOW: 400,
    SLOWER: 600,
    SLOWEST: 800,
  },

  // Refined Easing Functions for Natural Feel
  EASING: {
    SMOOTH: "cubic-bezier(0.23, 1, 0.32, 1)",
    BOUNCE: "cubic-bezier(0.68, -0.4, 0.265, 1.4)",
    GLASS: "cubic-bezier(0.19, 1, 0.22, 1)",
    ELASTIC: "cubic-bezier(0.175, 0.885, 0.32, 1.2)",
    BACK: "cubic-bezier(0.68, -0.5, 0.32, 1.5)",
  },

  // Optimized Glassmorphism Values
  GLASS: {
    BACKGROUND: {
      DEFAULT: "rgba(255, 255, 255, 0.08)",
      LIGHT: "rgba(255, 255, 255, 0.12)",
      DARK: "rgba(255, 255, 255, 0.04)",
    },
    BORDER: {
      DEFAULT: "rgba(255, 255, 255, 0.18)",
      LIGHT: "rgba(255, 255, 255, 0.25)",
      DARK: "rgba(255, 255, 255, 0.08)",
    },
    BLUR: {
      DEFAULT: "12px",
      LIGHT: "10px",
      HEAVY: "18px",
    },
    SHADOW: {
      DEFAULT: "0 6px 28px rgba(0, 0, 0, 0.08)",
      HOVER: "0 10px 35px rgba(0, 0, 0, 0.12)",
      ACTIVE: "0 3px 12px rgba(0, 0, 0, 0.1)",
    },
  },

  // Enhanced Color System with Better Contrast
  COLORS: {
    GLOW: {
      PRIMARY: "rgba(26, 95, 122, 0.5)",
      SECONDARY: "rgba(0, 43, 91, 0.5)",
      ACCENT: "rgba(248, 203, 46, 0.6)",
    },
    TEXT: {
      PRIMARY: "#0f4c5c",
      SECONDARY: "#1a1a1a",
      LIGHT: "#ffffff",
      MUTED: "#6b7280",
    },
    GRADIENT: {
      PRIMARY: "linear-gradient(135deg, #145a73 0%, #e6b829 100%)",
      REVERSE: "linear-gradient(315deg, #145a73 0%, #e6b829 100%)",
    },
  },

  // Stagger Animation Delays
  STAGGER: {
    FAST: 50,
    NORMAL: 100,
    SLOW: 150,
    SLOWER: 200,
  },

  // Performance Thresholds
  PERFORMANCE: {
    TARGET_FPS: 60,
    MIN_FPS: 30,
    MAX_FRAME_TIME: 16.67, // milliseconds
    EMERGENCY_MODE_THRESHOLD: 20, // FPS
  },

  // Accessibility Settings
  ACCESSIBILITY: {
    REDUCED_MOTION_DURATION: 10, // milliseconds
    FOCUS_OUTLINE_WIDTH: 3, // pixels
    FOCUS_OUTLINE_OFFSET: 2, // pixels
    MIN_TOUCH_TARGET: 44, // pixels
  },
} as const;

/**
 * CSS Custom Properties Generator
 * Generates CSS custom properties from the configuration
 */
export function generateCSSCustomProperties(): string {
  return `
    /* Fine-tuned Animation Durations */
    --duration-instant: ${ANIMATION_CONFIG.DURATION.INSTANT}ms;
    --duration-fast: ${ANIMATION_CONFIG.DURATION.FAST}ms;
    --duration-normal: ${ANIMATION_CONFIG.DURATION.NORMAL}ms;
    --duration-slow: ${ANIMATION_CONFIG.DURATION.SLOW}ms;
    --duration-slower: ${ANIMATION_CONFIG.DURATION.SLOWER}ms;
    --duration-slowest: ${ANIMATION_CONFIG.DURATION.SLOWEST}ms;

    /* Refined Easing Functions */
    --ease-smooth: ${ANIMATION_CONFIG.EASING.SMOOTH};
    --ease-bounce: ${ANIMATION_CONFIG.EASING.BOUNCE};
    --ease-glass: ${ANIMATION_CONFIG.EASING.GLASS};
    --ease-elastic: ${ANIMATION_CONFIG.EASING.ELASTIC};
    --ease-back: ${ANIMATION_CONFIG.EASING.BACK};

    /* Optimized Glassmorphism */
    --glass-bg: ${ANIMATION_CONFIG.GLASS.BACKGROUND.DEFAULT};
    --glass-bg-light: ${ANIMATION_CONFIG.GLASS.BACKGROUND.LIGHT};
    --glass-bg-dark: ${ANIMATION_CONFIG.GLASS.BACKGROUND.DARK};
    --glass-border: ${ANIMATION_CONFIG.GLASS.BORDER.DEFAULT};
    --glass-border-light: ${ANIMATION_CONFIG.GLASS.BORDER.LIGHT};
    --glass-border-dark: ${ANIMATION_CONFIG.GLASS.BORDER.DARK};
    --glass-blur: blur(${ANIMATION_CONFIG.GLASS.BLUR.DEFAULT});
    --glass-blur-light: blur(${ANIMATION_CONFIG.GLASS.BLUR.LIGHT});
    --glass-blur-heavy: blur(${ANIMATION_CONFIG.GLASS.BLUR.HEAVY});
    --glass-shadow: ${ANIMATION_CONFIG.GLASS.SHADOW.DEFAULT};
    --glass-shadow-hover: ${ANIMATION_CONFIG.GLASS.SHADOW.HOVER};
    --glass-shadow-active: ${ANIMATION_CONFIG.GLASS.SHADOW.ACTIVE};

    /* Enhanced Color System */
    --color-glow-primary: ${ANIMATION_CONFIG.COLORS.GLOW.PRIMARY};
    --color-glow-secondary: ${ANIMATION_CONFIG.COLORS.GLOW.SECONDARY};
    --color-glow-accent: ${ANIMATION_CONFIG.COLORS.GLOW.ACCENT};
    --color-text-primary: ${ANIMATION_CONFIG.COLORS.TEXT.PRIMARY};
    --color-text-secondary: ${ANIMATION_CONFIG.COLORS.TEXT.SECONDARY};
    --color-text-light: ${ANIMATION_CONFIG.COLORS.TEXT.LIGHT};
    --color-text-muted: ${ANIMATION_CONFIG.COLORS.TEXT.MUTED};
    --color-text-gradient: ${ANIMATION_CONFIG.COLORS.GRADIENT.PRIMARY};
    --color-text-gradient-reverse: ${ANIMATION_CONFIG.COLORS.GRADIENT.REVERSE};
  `;
}

/**
 * Animation Timing Utilities
 */
export class AnimationTiming {
  /**
   * Get optimal duration based on animation type and element size
   */
  static getOptimalDuration(
    animationType: "entrance" | "interaction" | "transition" | "scroll",
    elementSize: "small" | "medium" | "large" = "medium"
  ): number {
    const baseMultiplier = {
      entrance: 1,
      interaction: 0.8,
      transition: 1.2,
      scroll: 1.5,
    };

    const sizeMultiplier = {
      small: 0.8,
      medium: 1,
      large: 1.2,
    };

    return Math.round(
      ANIMATION_CONFIG.DURATION.NORMAL *
        baseMultiplier[animationType] *
        sizeMultiplier[elementSize]
    );
  }

  /**
   * Get stagger delay for element index
   */
  static getStaggerDelay(
    index: number,
    speed: "fast" | "normal" | "slow" = "normal"
  ): number {
    return (
      index *
      ANIMATION_CONFIG.STAGGER[
        speed.toUpperCase() as keyof typeof ANIMATION_CONFIG.STAGGER
      ]
    );
  }

  /**
   * Check if reduced motion is preferred
   */
  static shouldReduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Get duration with reduced motion consideration
   */
  static getDurationWithReducedMotion(duration: number): number {
    return this.shouldReduceMotion()
      ? ANIMATION_CONFIG.ACCESSIBILITY.REDUCED_MOTION_DURATION
      : duration;
  }
}

/**
 * Color Contrast Utilities
 */
export class ColorContrast {
  /**
   * Calculate relative luminance
   */
  private static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex to RGB
   */
  private static hexToRgb(
    hex: string
  ): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Check if color combination meets WCAG AA standards
   */
  static meetsWCAGAA(foreground: string, background: string): boolean {
    return this.getContrastRatio(foreground, background) >= 4.5;
  }

  /**
   * Check if color combination meets WCAG AAA standards
   */
  static meetsWCAGAAA(foreground: string, background: string): boolean {
    return this.getContrastRatio(foreground, background) >= 7;
  }
}

/**
 * Performance Monitoring for Animations
 */
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isMonitoring = false;

  static getInstance(): AnimationPerformanceMonitor {
    if (!this.instance) {
      this.instance = new AnimationPerformanceMonitor();
    }
    return this.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.monitor();
  }

  private monitor = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );

      // Apply performance optimizations if needed
      if (this.fps < ANIMATION_CONFIG.PERFORMANCE.EMERGENCY_MODE_THRESHOLD) {
        this.applyEmergencyOptimizations();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(this.monitor);
  };

  private applyEmergencyOptimizations(): void {
    document.documentElement.style.setProperty("--duration-fast", "50ms");
    document.documentElement.style.setProperty("--duration-normal", "100ms");
    document.documentElement.style.setProperty("--duration-slow", "150ms");
    document.body.classList.add("emergency-performance-mode");
  }

  getFPS(): number {
    return this.fps;
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }
}

// Export singleton instance
export const animationPerformanceMonitor =
  AnimationPerformanceMonitor.getInstance();
