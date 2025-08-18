/**
 * Mobile CSS Optimization Service
 * Handles mobile-first CSS loading, critical CSS inlining, and performance optimizations
 */

export interface CriticalCSSConfig {
  aboveFoldSelectors: string[];
  criticalComponents: string[];
  inlineThreshold: number; // KB
  deferNonCritical: boolean;
}

export interface MobileAnimationConfig {
  enableReducedMotion: boolean;
  maxAnimationDuration: number;
  preferTransforms: boolean;
  useWillChange: boolean;
  enableHardwareAcceleration: boolean;
}

export class MobileCSSOptimizationService {
  private criticalCSS: string = "";
  private nonCriticalCSS: string[] = [];
  private loadedStylesheets = new Set<string>();
  private animationConfig: MobileAnimationConfig;
  private criticalConfig: CriticalCSSConfig;

  constructor() {
    this.animationConfig = this.getDefaultAnimationConfig();
    this.criticalConfig = this.getDefaultCriticalConfig();
    this.init();
  }

  private init() {
    this.detectUserPreferences();
    this.setupCriticalCSSExtraction();
    this.optimizeExistingAnimations();
    this.setupResponsiveImageLoading();
  }

  /**
   * Get default animation configuration
   */
  private getDefaultAnimationConfig(): MobileAnimationConfig {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isLowEndDevice = this.detectLowEndDevice();

    return {
      enableReducedMotion: prefersReducedMotion || isLowEndDevice,
      maxAnimationDuration: isLowEndDevice ? 200 : 500,
      preferTransforms: true,
      useWillChange: !isLowEndDevice,
      enableHardwareAcceleration: !isLowEndDevice,
    };
  }

  /**
   * Get default critical CSS configuration
   */
  private getDefaultCriticalConfig(): CriticalCSSConfig {
    return {
      aboveFoldSelectors: [
        "header",
        "nav",
        ".hero",
        ".above-fold",
        ".critical",
        "h1",
        "h2",
        ".btn-primary",
        ".glass-nav",
        ".mobile-menu",
      ],
      criticalComponents: [
        "Navigation",
        "Hero",
        "MobileMenu",
        "LoadingSpinner",
        "ErrorBoundary",
      ],
      inlineThreshold: 14, // 14KB is the HTTP/2 initial congestion window
      deferNonCritical: true,
    };
  }

  /**
   * Detect user preferences and device capabilities
   */
  private detectUserPreferences() {
    // Listen for changes in motion preferences
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", (e) => {
      this.animationConfig.enableReducedMotion = e.matches;
      this.updateAnimationStyles();
    });

    // Listen for connection changes
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const updateForConnection = () => {
        const isSlowConnection =
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g";
        this.animationConfig.enableReducedMotion = isSlowConnection;
        this.updateAnimationStyles();
      };

      connection.addEventListener("change", updateForConnection);
      updateForConnection();
    }
  }

  /**
   * Extract and inline critical CSS
   */
  private setupCriticalCSSExtraction() {
    const criticalStyles: string[] = [];

    // Extract critical CSS from existing stylesheets
    Array.from(document.styleSheets).forEach((stylesheet) => {
      try {
        if (stylesheet.cssRules) {
          Array.from(stylesheet.cssRules).forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;

              // Check if this rule is critical
              if (this.isCriticalSelector(selector)) {
                criticalStyles.push(rule.cssText);
              }
            }
          });
        }
      } catch (e) {
        // Cross-origin stylesheets can't be accessed
        console.warn("Cannot access stylesheet rules:", e);
      }
    });

    // Add mobile-specific critical styles
    criticalStyles.push(this.getMobileCriticalCSS());

    this.criticalCSS = criticalStyles.join("\n");
    this.inlineCriticalCSS();
  }

  /**
   * Check if a CSS selector is critical
   */
  private isCriticalSelector(selector: string): boolean {
    return this.criticalConfig.aboveFoldSelectors.some((criticalSelector) =>
      selector.includes(criticalSelector)
    );
  }

  /**
   * Get mobile-specific critical CSS
   */
  private getMobileCriticalCSS(): string {
    return `
      /* Mobile-first critical CSS */
      * {
        box-sizing: border-box;
      }

      html {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Viewport height fix for mobile Safari */
      .viewport-height-fix {
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100);
      }

      /* Safe area insets for devices with notches */
      .safe-area-insets {
        padding-top: env(safe-area-inset-top, 0);
        padding-bottom: env(safe-area-inset-bottom, 0);
        padding-left: env(safe-area-inset-left, 0);
        padding-right: env(safe-area-inset-right, 0);
      }

      /* Touch-friendly interactive elements */
      button, 
      [role="button"], 
      input, 
      select, 
      textarea,
      a {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      /* Prevent zoom on input focus */
      input, 
      select, 
      textarea {
        font-size: 16px;
      }

      /* Loading states */
      .loading {
        opacity: 0.7;
        pointer-events: none;
      }

      /* Critical layout classes */
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .flex {
        display: flex;
      }

      .flex-col {
        flex-direction: column;
      }

      .items-center {
        align-items: center;
      }

      .justify-center {
        justify-content: center;
      }

      .hidden {
        display: none;
      }

      /* Mobile navigation */
      .mobile-menu-button {
        display: block;
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
      }

      @media (min-width: 768px) {
        .mobile-menu-button {
          display: none;
        }
      }

      /* Performance optimizations */
      .will-change-transform {
        will-change: transform;
      }

      .will-change-opacity {
        will-change: opacity;
      }

      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
  }

  /**
   * Inline critical CSS
   */
  private inlineCriticalCSS() {
    if (this.criticalCSS.length === 0) return;

    // Check if critical CSS is already inlined
    if (document.querySelector("#critical-css")) return;

    const style = document.createElement("style");
    style.id = "critical-css";
    style.textContent = this.criticalCSS;

    // Insert at the beginning of head for highest priority
    const firstChild = document.head.firstChild;
    if (firstChild) {
      document.head.insertBefore(style, firstChild);
    } else {
      document.head.appendChild(style);
    }
  }

  /**
   * Load non-critical CSS asynchronously
   */
  async loadNonCriticalCSS(href: string, media: string = "all"): Promise<void> {
    if (this.loadedStylesheets.has(href)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.media = "print"; // Load as print to avoid render blocking

      link.onload = () => {
        // Switch to target media after load
        link.media = media;
        this.loadedStylesheets.add(href);
        resolve();
      };

      link.onerror = () => {
        reject(new Error(`Failed to load stylesheet: ${href}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Preload CSS for better performance
   */
  preloadCSS(href: string): void {
    if (this.loadedStylesheets.has(href)) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;

    // Convert to stylesheet after load
    link.onload = () => {
      link.rel = "stylesheet";
      this.loadedStylesheets.add(href);
    };

    document.head.appendChild(link);
  }

  /**
   * Optimize existing animations for mobile
   */
  private optimizeExistingAnimations() {
    const style = document.createElement("style");
    style.id = "mobile-animation-optimizations";

    let css = "";

    if (this.animationConfig.enableReducedMotion) {
      css += `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
    } else {
      css += `
        /* Optimize animations for mobile performance */
        * {
          animation-duration: ${this.animationConfig.maxAnimationDuration}ms;
        }

        /* Prefer transforms over layout-triggering properties */
        .animate-slide-in {
          transform: translateX(-100%);
          transition: transform ${this.animationConfig.maxAnimationDuration}ms ease-out;
        }

        .animate-slide-in.active {
          transform: translateX(0);
        }

        .animate-fade-in {
          opacity: 0;
          transition: opacity ${this.animationConfig.maxAnimationDuration}ms ease-out;
        }

        .animate-fade-in.active {
          opacity: 1;
        }

        .animate-scale-in {
          transform: scale(0.9);
          opacity: 0;
          transition: transform ${this.animationConfig.maxAnimationDuration}ms ease-out,
                      opacity ${this.animationConfig.maxAnimationDuration}ms ease-out;
        }

        .animate-scale-in.active {
          transform: scale(1);
          opacity: 1;
        }
      `;

      if (this.animationConfig.useWillChange) {
        css += `
          .will-animate {
            will-change: transform, opacity;
          }

          .will-animate.animation-complete {
            will-change: auto;
          }
        `;
      }

      if (this.animationConfig.enableHardwareAcceleration) {
        css += `
          .hardware-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
        `;
      }
    }

    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Update animation styles based on current config
   */
  private updateAnimationStyles() {
    const existingStyle = document.getElementById(
      "mobile-animation-optimizations"
    );
    if (existingStyle) {
      existingStyle.remove();
    }
    this.optimizeExistingAnimations();
  }

  /**
   * Setup responsive image loading CSS
   */
  private setupResponsiveImageLoading() {
    const style = document.createElement("style");
    style.id = "responsive-image-optimizations";
    style.textContent = `
      /* Responsive image optimizations */
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      /* Lazy loading placeholder */
      img[loading="lazy"] {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading-shimmer 1.5s infinite;
      }

      @keyframes loading-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Blur-up technique for progressive loading */
      .image-blur-up {
        filter: blur(5px);
        transition: filter 0.3s ease-out;
      }

      .image-blur-up.loaded {
        filter: blur(0);
      }

      /* Aspect ratio containers */
      .aspect-ratio-16-9 {
        aspect-ratio: 16 / 9;
        overflow: hidden;
      }

      .aspect-ratio-4-3 {
        aspect-ratio: 4 / 3;
        overflow: hidden;
      }

      .aspect-ratio-1-1 {
        aspect-ratio: 1 / 1;
        overflow: hidden;
      }

      /* Fallback for browsers without aspect-ratio support */
      @supports not (aspect-ratio: 1 / 1) {
        .aspect-ratio-16-9 {
          position: relative;
          padding-bottom: 56.25%; /* 9/16 * 100% */
        }

        .aspect-ratio-4-3 {
          position: relative;
          padding-bottom: 75%; /* 3/4 * 100% */
        }

        .aspect-ratio-1-1 {
          position: relative;
          padding-bottom: 100%;
        }

        .aspect-ratio-16-9 img,
        .aspect-ratio-4-3 img,
        .aspect-ratio-1-1 img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Detect low-end device
   */
  private detectLowEndDevice(): boolean {
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency;
    const connection = (navigator as any).connection;

    return (
      (deviceMemory && deviceMemory <= 2) ||
      (hardwareConcurrency && hardwareConcurrency <= 2) ||
      (connection &&
        (connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g"))
    );
  }

  /**
   * Add critical CSS for a component
   */
  addComponentCriticalCSS(componentName: string, css: string): void {
    if (this.criticalConfig.criticalComponents.includes(componentName)) {
      const style = document.createElement("style");
      style.id = `critical-css-${componentName.toLowerCase()}`;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  /**
   * Remove will-change properties after animations complete
   */
  cleanupAnimationProperties(element: HTMLElement): void {
    if (this.animationConfig.useWillChange) {
      element.style.willChange = "auto";
      element.classList.add("animation-complete");
    }
  }

  /**
   * Get current animation configuration
   */
  getAnimationConfig(): MobileAnimationConfig {
    return { ...this.animationConfig };
  }

  /**
   * Update animation configuration
   */
  updateAnimationConfig(config: Partial<MobileAnimationConfig>): void {
    this.animationConfig = { ...this.animationConfig, ...config };
    this.updateAnimationStyles();
  }

  /**
   * Get critical CSS configuration
   */
  getCriticalConfig(): CriticalCSSConfig {
    return { ...this.criticalConfig };
  }

  /**
   * Update critical CSS configuration
   */
  updateCriticalConfig(config: Partial<CriticalCSSConfig>): void {
    this.criticalConfig = { ...this.criticalConfig, ...config };
  }
}

// Export singleton instance
export const mobileCSSOptimizationService = new MobileCSSOptimizationService();

// Auto-initialize on DOM ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Service is already initialized in constructor
    });
  }
}
