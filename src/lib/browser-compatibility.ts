/**
 * Browser Compatibility and Feature Detection Utilities
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isModern: boolean;
  supportsBackdropFilter: boolean;
  supportsGridLayout: boolean;
  supportsFlexbox: boolean;
  supportsCustomProperties: boolean;
  supportsIntersectionObserver: boolean;
  supportsWebAnimations: boolean;
  supportsES6: boolean;
}

export interface FeatureSupport {
  backdropFilter: boolean;
  cssGrid: boolean;
  flexbox: boolean;
  customProperties: boolean;
  intersectionObserver: boolean;
  webAnimations: boolean;
  transforms3d: boolean;
  transitions: boolean;
  animations: boolean;
  gradients: boolean;
  borderRadius: boolean;
  boxShadow: boolean;
  opacity: boolean;
  rgba: boolean;
}

/**
 * Browser Detection and Feature Support Manager
 */
export class BrowserCompatibilityManager {
  private browserInfo: BrowserInfo;
  private featureSupport: FeatureSupport;
  private fallbacksApplied = false;

  constructor() {
    this.browserInfo = this.detectBrowser();
    this.featureSupport = this.detectFeatureSupport();
    this.init();
  }

  private init() {
    // Apply browser-specific classes
    this.applyBrowserClasses();

    // Apply feature support classes
    this.applyFeatureSupportClasses();

    // Apply fallbacks if needed
    if (!this.browserInfo.isModern) {
      this.applyFallbacks();
    }
  }

  /**
   * Detect browser information
   */
  private detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent;
    let name = "Unknown";
    let version = "0";
    let isModern = false;

    // Chrome
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      name = "Chrome";
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= 80;
    }
    // Firefox
    else if (userAgent.includes("Firefox")) {
      name = "Firefox";
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= 75;
    }
    // Safari
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      name = "Safari";
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= 13;
    }
    // Edge
    else if (userAgent.includes("Edg")) {
      name = "Edge";
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= 80;
    }
    // Internet Explorer
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
      name = "Internet Explorer";
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
      version = match ? match[1] : "0";
      isModern = false; // IE is never considered modern for our purposes
    }

    return {
      name,
      version,
      isModern,
      supportsBackdropFilter: this.testBackdropFilter(),
      supportsGridLayout: this.testCSSGrid(),
      supportsFlexbox: this.testFlexbox(),
      supportsCustomProperties: this.testCustomProperties(),
      supportsIntersectionObserver: "IntersectionObserver" in window,
      supportsWebAnimations: "animate" in document.createElement("div"),
      supportsES6: this.testES6Support(),
    };
  }

  /**
   * Detect feature support
   */
  private detectFeatureSupport(): FeatureSupport {
    return {
      backdropFilter: this.testBackdropFilter(),
      cssGrid: this.testCSSGrid(),
      flexbox: this.testFlexbox(),
      customProperties: this.testCustomProperties(),
      intersectionObserver: "IntersectionObserver" in window,
      webAnimations: "animate" in document.createElement("div"),
      transforms3d: this.testTransforms3D(),
      transitions: this.testTransitions(),
      animations: this.testAnimations(),
      gradients: this.testGradients(),
      borderRadius: this.testBorderRadius(),
      boxShadow: this.testBoxShadow(),
      opacity: this.testOpacity(),
      rgba: this.testRGBA(),
    };
  }

  /**
   * Feature detection methods
   */
  private testBackdropFilter(): boolean {
    const testElement = document.createElement("div");
    testElement.style.backdropFilter = "blur(10px)";
    return (
      testElement.style.backdropFilter !== "" ||
      testElement.style.webkitBackdropFilter !== ""
    );
  }

  private testCSSGrid(): boolean {
    return CSS.supports("display", "grid");
  }

  private testFlexbox(): boolean {
    return CSS.supports("display", "flex");
  }

  private testCustomProperties(): boolean {
    return CSS.supports("color", "var(--test)");
  }

  private testTransforms3D(): boolean {
    return CSS.supports("transform", "translateZ(0)");
  }

  private testTransitions(): boolean {
    return CSS.supports("transition", "all 0.3s ease");
  }

  private testAnimations(): boolean {
    return CSS.supports("animation", "test 1s ease");
  }

  private testGradients(): boolean {
    return CSS.supports("background", "linear-gradient(to right, red, blue)");
  }

  private testBorderRadius(): boolean {
    return CSS.supports("border-radius", "10px");
  }

  private testBoxShadow(): boolean {
    return CSS.supports("box-shadow", "0 0 10px rgba(0,0,0,0.5)");
  }

  private testOpacity(): boolean {
    return CSS.supports("opacity", "0.5");
  }

  private testRGBA(): boolean {
    return CSS.supports("color", "rgba(255,255,255,0.5)");
  }

  private testES6Support(): boolean {
    try {
      // Test arrow functions by checking if they exist
      const testArrow = new Function("return () => {}");
      testArrow();

      // Test const/let by checking if they're supported
      const testConst = new Function(
        "const test = 1; let test2 = 2; return test + test2;"
      );
      testConst();

      // Test template literals
      const testTemplate = new Function("return `template ${1} literal`;");
      testTemplate();

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Apply browser-specific CSS classes
   */
  private applyBrowserClasses() {
    const body = document.body;
    body.classList.add(
      `browser-${this.browserInfo.name.toLowerCase().replace(/\s+/g, "-")}`
    );
    body.classList.add(`browser-version-${this.browserInfo.version}`);

    if (this.browserInfo.isModern) {
      body.classList.add("modern-browser");
    } else {
      body.classList.add("legacy-browser");
    }
  }

  /**
   * Apply feature support CSS classes
   */
  private applyFeatureSupportClasses() {
    const body = document.body;

    Object.entries(this.featureSupport).forEach(([feature, supported]) => {
      if (supported) {
        body.classList.add(
          `supports-${feature.replace(/([A-Z])/g, "-$1").toLowerCase()}`
        );
      } else {
        body.classList.add(
          `no-${feature.replace(/([A-Z])/g, "-$1").toLowerCase()}`
        );
      }
    });
  }

  /**
   * Apply fallbacks for unsupported features
   */
  private applyFallbacks() {
    if (this.fallbacksApplied) return;

    // Backdrop filter fallbacks
    if (!this.featureSupport.backdropFilter) {
      this.applyBackdropFilterFallbacks();
    }

    // CSS Grid fallbacks
    if (!this.featureSupport.cssGrid) {
      this.applyCSSGridFallbacks();
    }

    // Custom properties fallbacks
    if (!this.featureSupport.customProperties) {
      this.applyCustomPropertiesFallbacks();
    }

    // Intersection Observer fallbacks
    if (!this.featureSupport.intersectionObserver) {
      this.applyIntersectionObserverFallbacks();
    }

    // Web Animations fallbacks
    if (!this.featureSupport.webAnimations) {
      this.applyWebAnimationsFallbacks();
    }

    this.fallbacksApplied = true;
  }

  /**
   * Backdrop filter fallbacks
   */
  private applyBackdropFilterFallbacks() {
    const style = document.createElement("style");
    style.textContent = `
      /* Backdrop filter fallbacks */
      .no-backdrop-filter .glass,
      .no-backdrop-filter .glass-light,
      .no-backdrop-filter .glass-dark {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .no-backdrop-filter .glass-nav {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .no-backdrop-filter .glass-nav.scrolled {
        background: rgba(255, 255, 255, 0.98) !important;
      }

      .no-backdrop-filter .glass-modal {
        background: rgba(0, 0, 0, 0.8) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .no-backdrop-filter .glass-button {
        background: rgba(255, 255, 255, 0.2) !important;
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .no-backdrop-filter .glass-button:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * CSS Grid fallbacks
   */
  private applyCSSGridFallbacks() {
    const style = document.createElement("style");
    style.textContent = `
      /* CSS Grid fallbacks using flexbox */
      .no-css-grid .grid {
        display: flex !important;
        flex-wrap: wrap !important;
      }

      .no-css-grid .grid > * {
        flex: 1 1 auto !important;
        min-width: 300px !important;
        margin: 0.5rem !important;
      }

      .no-css-grid .grid-cols-1 > * { flex-basis: 100% !important; }
      .no-css-grid .grid-cols-2 > * { flex-basis: calc(50% - 1rem) !important; }
      .no-css-grid .grid-cols-3 > * { flex-basis: calc(33.333% - 1rem) !important; }
      .no-css-grid .grid-cols-4 > * { flex-basis: calc(25% - 1rem) !important; }

      @media (max-width: 768px) {
        .no-css-grid .grid > * {
          flex-basis: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Custom properties fallbacks
   */
  private applyCustomPropertiesFallbacks() {
    const style = document.createElement("style");
    style.textContent = `
      /* Custom properties fallbacks with hardcoded values */
      .no-custom-properties .glass {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
      }

      .no-custom-properties .glass-light {
        background: rgba(255, 255, 255, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
      }

      .no-custom-properties .glass-dark {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .no-custom-properties .bg-gradient-ocean {
        background: linear-gradient(135deg, #1a5f7a 0%, #2d7795 50%, #4a9bb8 100%) !important;
      }

      .no-custom-properties .bg-gradient-sunset {
        background: linear-gradient(135deg, #f8cb2e 0%, #ffd54f 50%, #ffeb3b 100%) !important;
      }

      .no-custom-properties .bg-gradient-deep-sea {
        background: linear-gradient(135deg, #002b5b 0%, #003a77 50%, #1565c0 100%) !important;
      }

      .no-custom-properties .text-gradient {
        background: linear-gradient(135deg, #1a5f7a 0%, #f8cb2e 100%) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Intersection Observer fallbacks
   */
  private applyIntersectionObserverFallbacks() {
    // Create a simple scroll-based animation fallback
    const scrollHandler = () => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
          element.classList.add("revealed");
        }
      });
    };

    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("resize", scrollHandler);

    // Initial check
    scrollHandler();
  }

  /**
   * Web Animations API fallbacks
   */
  private applyWebAnimationsFallbacks() {
    // Provide a simple animate polyfill for basic animations
    if (!Element.prototype.animate) {
      Element.prototype.animate = function (keyframes: any, options: any) {
        // Simple fallback that just applies the final state
        const finalFrame = Array.isArray(keyframes)
          ? keyframes[keyframes.length - 1]
          : keyframes;

        Object.keys(finalFrame).forEach((property) => {
          (this as any).style[property] = finalFrame[property];
        });

        // Return a mock animation object
        return {
          finished: Promise.resolve(),
          cancel: () => {},
          pause: () => {},
          play: () => {},
          reverse: () => {},
          finish: () => {},
          currentTime: 0,
          playbackRate: 1,
          playState: "finished",
        };
      };
    }
  }

  /**
   * Apply Internet Explorer specific fixes
   */
  private applyIEFixes() {
    if (this.browserInfo.name !== "Internet Explorer") return;

    const style = document.createElement("style");
    style.textContent = `
      /* Internet Explorer fixes */
      .ie-fix {
        /* Remove modern features that IE doesn't support */
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
      }

      /* Use solid backgrounds instead of glass effects */
      .glass,
      .glass-light,
      .glass-dark {
        background: #ffffff !important;
        border: 1px solid #cccccc !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }

      /* Simplify gradients */
      .bg-gradient-ocean,
      .bg-gradient-sunset,
      .bg-gradient-deep-sea {
        background: #1a5f7a !important;
      }

      /* Remove text gradients */
      .text-gradient {
        background: none !important;
        color: #1a5f7a !important;
        -webkit-text-fill-color: inherit !important;
      }

      /* Simplify flexbox layouts */
      .flex {
        display: block !important;
      }

      .flex > * {
        display: inline-block !important;
        vertical-align: top !important;
        width: auto !important;
      }
    `;
    document.head.appendChild(style);

    // Add IE class to all elements that need fixes
    document
      .querySelectorAll(".glass, .glass-light, .glass-dark")
      .forEach((el) => {
        el.classList.add("ie-fix");
      });
  }

  /**
   * Get browser information
   */
  getBrowserInfo(): BrowserInfo {
    return this.browserInfo;
  }

  /**
   * Get feature support information
   */
  getFeatureSupport(): FeatureSupport {
    return this.featureSupport;
  }

  /**
   * Check if a specific feature is supported
   */
  supportsFeature(feature: keyof FeatureSupport): boolean {
    return this.featureSupport[feature];
  }

  /**
   * Check if browser is modern
   */
  isModernBrowser(): boolean {
    return this.browserInfo.isModern;
  }

  /**
   * Apply progressive enhancement
   */
  applyProgressiveEnhancement() {
    // Start with basic styles, then enhance
    const body = document.body;

    // Add enhancement classes based on support
    if (this.featureSupport.backdropFilter) {
      body.classList.add("enhanced-glass");
    }

    if (this.featureSupport.webAnimations) {
      body.classList.add("enhanced-animations");
    }

    if (this.featureSupport.intersectionObserver) {
      body.classList.add("enhanced-scroll-effects");
    }
  }

  /**
   * Log browser compatibility information
   */
  logCompatibilityInfo() {
    console.group("Browser Compatibility Information");
    console.groupEnd();
  }
}

/**
 * Polyfill Manager for missing features
 */
export class PolyfillManager {
  private polyfillsLoaded = new Set<string>();

  /**
   * Load polyfill for Intersection Observer
   */
  async loadIntersectionObserverPolyfill(): Promise<void> {
    if (
      "IntersectionObserver" in window ||
      this.polyfillsLoaded.has("intersection-observer")
    ) {
      return;
    }

    // Simple intersection observer polyfill
    (window as any).IntersectionObserver = class {
      constructor(callback: Function, options: any = {}) {
        this.callback = callback;
        this.options = options;
        this.elements = new Set();
      }

      observe(element: Element) {
        this.elements.add(element);
        this.checkIntersection();
      }

      unobserve(element: Element) {
        this.elements.delete(element);
      }

      disconnect() {
        this.elements.clear();
      }

      checkIntersection() {
        this.elements.forEach((element: Element) => {
          const rect = element.getBoundingClientRect();
          const isIntersecting =
            rect.top < window.innerHeight && rect.bottom > 0;

          this.callback([
            {
              target: element,
              isIntersecting,
              intersectionRatio: isIntersecting ? 1 : 0,
              boundingClientRect: rect,
              intersectionRect: isIntersecting ? rect : null,
              rootBounds: {
                top: 0,
                left: 0,
                bottom: window.innerHeight,
                right: window.innerWidth,
              },
              time: Date.now(),
            },
          ]);
        });
      }
    };

    // Set up scroll listener for the polyfill
    let ticking = false;
    const checkAllIntersections = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // This would need to be implemented to track all observers
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", checkAllIntersections);
    window.addEventListener("resize", checkAllIntersections);

    this.polyfillsLoaded.add("intersection-observer");
  }

  /**
   * Load CSS custom properties polyfill
   */
  async loadCustomPropertiesPolyfill(): Promise<void> {
    if (
      CSS.supports("color", "var(--test)") ||
      this.polyfillsLoaded.has("custom-properties")
    ) {
      return;
    }

    // This would typically load a more comprehensive polyfill
    // For now, we'll just mark it as loaded since we handle fallbacks in CSS
    this.polyfillsLoaded.add("custom-properties");
  }

  /**
   * Load all necessary polyfills
   */
  async loadAllPolyfills(): Promise<void> {
    await Promise.all([
      this.loadIntersectionObserverPolyfill(),
      this.loadCustomPropertiesPolyfill(),
    ]);
  }
}

// Export singleton instances
export const browserCompatibilityManager = new BrowserCompatibilityManager();
export const polyfillManager = new PolyfillManager();

// Auto-initialize
if (typeof window !== "undefined") {
  // Load polyfills
  polyfillManager.loadAllPolyfills();

  // Apply progressive enhancement
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      browserCompatibilityManager.applyProgressiveEnhancement();
    });
  } else {
    browserCompatibilityManager.applyProgressiveEnhancement();
  }
}
