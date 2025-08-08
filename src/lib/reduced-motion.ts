/**
 * Reduced Motion Alternatives and Accessibility Utilities
 */

export interface ReducedMotionConfig {
  respectUserPreference: boolean;
  fallbackDuration: number;
  enableStaticAlternatives: boolean;
  enableFocusIndicators: boolean;
}

/**
 * Reduced Motion Manager
 */
export class ReducedMotionManager {
  private config: ReducedMotionConfig;
  private mediaQuery: MediaQueryList;
  private observers: Array<(prefersReduced: boolean) => void> = [];

  constructor(config: Partial<ReducedMotionConfig> = {}) {
    this.config = {
      respectUserPreference: true,
      fallbackDuration: 200,
      enableStaticAlternatives: true,
      enableFocusIndicators: true,
      ...config,
    };

    this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.init();
  }

  private init() {
    // Listen for changes in user preference
    this.mediaQuery.addEventListener("change", this.handlePreferenceChange);

    // Apply initial settings
    this.applyReducedMotionSettings(this.mediaQuery.matches);
  }

  private handlePreferenceChange = (e: MediaQueryListEvent) => {
    this.applyReducedMotionSettings(e.matches);
    this.notifyObservers(e.matches);
  };

  private applyReducedMotionSettings(prefersReduced: boolean) {
    const root = document.documentElement;

    if (prefersReduced && this.config.respectUserPreference) {
      // Apply reduced motion styles
      root.classList.add("prefers-reduced-motion");

      // Set minimal animation durations
      root.style.setProperty(
        "--duration-fast",
        `${this.config.fallbackDuration / 4}ms`
      );
      root.style.setProperty(
        "--duration-normal",
        `${this.config.fallbackDuration}ms`
      );
      root.style.setProperty(
        "--duration-slow",
        `${this.config.fallbackDuration * 1.5}ms`
      );

      // Disable complex animations
      root.classList.add("reduced-motion");

      if (this.config.enableStaticAlternatives) {
        this.enableStaticAlternatives();
      }

      if (this.config.enableFocusIndicators) {
        this.enhanceFocusIndicators();
      }
    } else {
      // Remove reduced motion classes
      root.classList.remove("prefers-reduced-motion", "reduced-motion");

      // Reset animation durations to defaults
      root.style.removeProperty("--duration-fast");
      root.style.removeProperty("--duration-normal");
      root.style.removeProperty("--duration-slow");
    }
  }

  private enableStaticAlternatives() {
    // Replace animated loading indicators with static ones
    document
      .querySelectorAll(".animate-spin, .animate-pulse")
      .forEach((element) => {
        element.classList.add("static-loading");
      });

    // Replace parallax with static positioning
    document.querySelectorAll("[data-parallax]").forEach((element) => {
      (element as HTMLElement).style.transform = "none";
    });

    // Replace morphing gradients with static gradients
    document.querySelectorAll(".animate-morph-gradient").forEach((element) => {
      element.classList.add("static-gradient");
    });
  }

  private enhanceFocusIndicators() {
    // Add enhanced focus indicators for better accessibility
    const style = document.createElement("style");
    style.textContent = `
      .prefers-reduced-motion *:focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.3) !important;
      }
      
      .prefers-reduced-motion .glass-card:focus,
      .prefers-reduced-motion .animate-button-hover:focus {
        background-color: rgba(0, 102, 204, 0.1) !important;
        border-color: #0066cc !important;
      }
    `;
    document.head.appendChild(style);
  }

  onPreferenceChange(callback: (prefersReduced: boolean) => void) {
    this.observers.push(callback);
  }

  private notifyObservers(prefersReduced: boolean) {
    this.observers.forEach((callback) => callback(prefersReduced));
  }

  prefersReducedMotion(): boolean {
    return this.mediaQuery.matches;
  }

  destroy() {
    this.mediaQuery.removeEventListener("change", this.handlePreferenceChange);
    this.observers = [];
  }
}

/**
 * Animation Alternative Provider
 */
export class AnimationAlternativeProvider {
  private alternatives = new Map<string, () => void>();

  constructor() {
    this.setupDefaultAlternatives();
  }

  private setupDefaultAlternatives() {
    // Hover effects alternatives
    this.alternatives.set("animate-hover-lift", () => {
      this.addStaticHoverEffect("hover-highlight");
    });

    this.alternatives.set("animate-hover-scale", () => {
      this.addStaticHoverEffect("hover-opacity");
    });

    // Loading alternatives
    this.alternatives.set("animate-spin", () => {
      this.addStaticLoadingIndicator();
    });

    this.alternatives.set("animate-pulse", () => {
      this.addStaticPulseIndicator();
    });

    // Scroll alternatives
    this.alternatives.set("animate-scroll-reveal", () => {
      this.addInstantReveal();
    });

    // Page transition alternatives
    this.alternatives.set("page-transition", () => {
      this.addInstantPageTransition();
    });
  }

  private addStaticHoverEffect(className: string) {
    const style = document.createElement("style");
    style.textContent = `
      .reduced-motion .hover-highlight:hover {
        background-color: rgba(59, 130, 246, 0.1) !important;
        border-color: rgba(59, 130, 246, 0.3) !important;
      }
      
      .reduced-motion .hover-opacity:hover {
        opacity: 0.8 !important;
      }
    `;
    document.head.appendChild(style);
  }

  private addStaticLoadingIndicator() {
    const style = document.createElement("style");
    style.textContent = `
      .reduced-motion .static-loading {
        position: relative;
      }
      
      .reduced-motion .static-loading::after {
        content: "Loading...";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
        color: #666;
      }
    `;
    document.head.appendChild(style);
  }

  private addStaticPulseIndicator() {
    const style = document.createElement("style");
    style.textContent = `
      .reduced-motion .static-loading {
        border: 2px dashed #ccc;
        background-color: #f9f9f9;
      }
    `;
    document.head.appendChild(style);
  }

  private addInstantReveal() {
    const style = document.createElement("style");
    style.textContent = `
      .reduced-motion [data-scroll-reveal],
      .reduced-motion .animate-scroll-reveal {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private addInstantPageTransition() {
    const style = document.createElement("style");
    style.textContent = `
      .reduced-motion .page-transition-content,
      .reduced-motion .route-content {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  applyAlternative(animationType: string) {
    const alternative = this.alternatives.get(animationType);
    if (alternative) {
      alternative();
    }
  }

  applyAllAlternatives() {
    this.alternatives.forEach((alternative) => alternative());
  }
}

/**
 * Accessibility-focused Animation Controller
 */
export class AccessibleAnimationController {
  private reducedMotionManager: ReducedMotionManager;
  private alternativeProvider: AnimationAlternativeProvider;
  private isActive = false;

  constructor() {
    this.reducedMotionManager = new ReducedMotionManager();
    this.alternativeProvider = new AnimationAlternativeProvider();
  }

  init() {
    if (this.isActive) return;

    // Apply alternatives if reduced motion is preferred
    if (this.reducedMotionManager.prefersReducedMotion()) {
      this.alternativeProvider.applyAllAlternatives();
    }

    // Listen for preference changes
    this.reducedMotionManager.onPreferenceChange((prefersReduced) => {
      if (prefersReduced) {
        this.alternativeProvider.applyAllAlternatives();
        this.addAccessibilityEnhancements();
      } else {
        this.removeAccessibilityEnhancements();
      }
    });

    this.isActive = true;
  }

  private addAccessibilityEnhancements() {
    // Skip links devre dışı bırakıldı (kurumsal karar)

    // Enhance keyboard navigation
    this.enhanceKeyboardNavigation();

    // Add screen reader announcements for state changes
    this.addScreenReaderAnnouncements();
  }

  // Skip links özelliği kurumsal talebe göre kaldırıldı.

  private enhanceKeyboardNavigation() {
    // Add visible focus indicators
    const style = document.createElement("style");
    style.textContent = `
      .reduced-motion *:focus-visible {
        outline: 3px solid #0066cc;
        outline-offset: 2px;
        box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.3);
      }
      
      .reduced-motion .glass-card:focus-visible {
        background-color: rgba(0, 102, 204, 0.1);
        border-color: #0066cc;
      }
    `;
    document.head.appendChild(style);
  }

  private addScreenReaderAnnouncements() {
    // Create live region for announcements
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(liveRegion);

    // Announce page changes
    const announcePageChange = (message: string) => {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = "";
      }, 1000);
    };

    // Listen for route changes and announce them
    window.addEventListener("popstate", () => {
      announcePageChange("Page content updated");
    });
  }

  private removeAccessibilityEnhancements() {
    // Remove skip links
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.remove();
    }

    // Remove live regions
    const liveRegion = document.querySelector('[aria-live="polite"]');
    if (liveRegion) {
      liveRegion.remove();
    }
  }

  destroy() {
    this.reducedMotionManager.destroy();
    this.removeAccessibilityEnhancements();
    this.isActive = false;
  }

  prefersReducedMotion(): boolean {
    return this.reducedMotionManager.prefersReducedMotion();
  }
}

// Export singleton instance
export const accessibleAnimationController =
  new AccessibleAnimationController();

// Auto-initialize
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      accessibleAnimationController.init()
    );
  } else {
    accessibleAnimationController.init();
  }
}
