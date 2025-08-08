/**
 * Accessibility Utilities for Enhanced User Experience
 */

export interface AccessibilityConfig {
  enableKeyboardDetection: boolean;
  enableFocusTrapping: boolean;
  enableAriaLiveRegions: boolean;
  enableSkipLinks: boolean;
  respectReducedMotion: boolean;
}

/**
 * Keyboard vs Mouse User Detection
 */
export class InputMethodDetector {
  private isKeyboardUser = false;
  private listeners: Array<(isKeyboard: boolean) => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    // Initially assume mouse user
    document.body.classList.add("mouse-user");

    // Detect keyboard usage
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("touchstart", this.handleTouchStart);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Only consider Tab, Enter, Space, and Arrow keys as keyboard navigation
    if (
      [
        "Tab",
        "Enter",
        " ",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key)
    ) {
      this.setKeyboardUser(true);
    }
  };

  private handleMouseDown = () => {
    this.setKeyboardUser(false);
  };

  private handleTouchStart = () => {
    this.setKeyboardUser(false);
  };

  private setKeyboardUser(isKeyboard: boolean) {
    if (this.isKeyboardUser !== isKeyboard) {
      this.isKeyboardUser = isKeyboard;

      if (isKeyboard) {
        document.body.classList.add("keyboard-user");
        document.body.classList.remove("mouse-user");
      } else {
        document.body.classList.add("mouse-user");
        document.body.classList.remove("keyboard-user");
      }

      this.notifyListeners(isKeyboard);
    }
  }

  onInputMethodChange(callback: (isKeyboard: boolean) => void) {
    this.listeners.push(callback);
  }

  private notifyListeners(isKeyboard: boolean) {
    this.listeners.forEach((callback) => callback(isKeyboard));
  }

  isUsingKeyboard(): boolean {
    return this.isKeyboardUser;
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("touchstart", this.handleTouchStart);
    this.listeners = [];
  }
}

/**
 * Focus Management Utilities
 */
export class FocusManager {
  private focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ");

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: Element = document.body): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ).filter((el) => this.isVisible(el)) as HTMLElement[];
  }

  /**
   * Check if element is visible and focusable
   */
  private isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus(container: Element): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);

    // Focus first element initially
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }

  /**
   * Move focus to element and announce to screen readers
   */
  moveFocusTo(element: HTMLElement, announceText?: string) {
    element.focus();

    if (announceText) {
      this.announceToScreenReader(announceText);
    }
  }

  /**
   * Announce text to screen readers
   */
  announceToScreenReader(
    text: string,
    priority: "polite" | "assertive" = "polite"
  ) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = text;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

/**
 * Skip Links Manager
 */
export class SkipLinksManager {
  private skipLinks: HTMLElement[] = [];

  /**
   * Add skip link to page
   */
  addSkipLink(
    text: string,
    targetId: string,
    position: "start" | "end" = "start"
  ) {
    const skipLink = document.createElement("a");
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = "skip-link";
    skipLink.setAttribute("data-skip-link", "true");

    // Add click handler to ensure target gets focus
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    if (position === "start") {
      document.body.insertBefore(skipLink, document.body.firstChild);
    } else {
      document.body.appendChild(skipLink);
    }

    this.skipLinks.push(skipLink);
    return skipLink;
  }

  /**
   * Remove all skip links
   */
  removeAllSkipLinks() {
    this.skipLinks.forEach((link) => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    this.skipLinks = [];
  }

  /**
   * Add common skip links for typical page structure
   */
  addCommonSkipLinks() {
    this.addSkipLink("Skip to main content", "main-content");
    this.addSkipLink("Skip to navigation", "main-navigation");
    this.addSkipLink("Skip to footer", "main-footer");
  }
}

/**
 * ARIA Live Region Manager
 */
export class LiveRegionManager {
  private liveRegions = new Map<string, HTMLElement>();

  /**
   * Create or get live region
   */
  getOrCreateLiveRegion(
    id: string,
    priority: "polite" | "assertive" = "polite"
  ): HTMLElement {
    if (this.liveRegions.has(id)) {
      return this.liveRegions.get(id)!;
    }

    const liveRegion = document.createElement("div");
    liveRegion.id = `live-region-${id}`;
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";

    document.body.appendChild(liveRegion);
    this.liveRegions.set(id, liveRegion);

    return liveRegion;
  }

  /**
   * Announce message in live region
   */
  announce(
    message: string,
    regionId: string = "default",
    priority: "polite" | "assertive" = "polite"
  ) {
    const liveRegion = this.getOrCreateLiveRegion(regionId, priority);
    liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = "";
    }, 1000);
  }

  /**
   * Remove live region
   */
  removeLiveRegion(id: string) {
    const liveRegion = this.liveRegions.get(id);
    if (liveRegion && liveRegion.parentNode) {
      liveRegion.parentNode.removeChild(liveRegion);
      this.liveRegions.delete(id);
    }
  }

  /**
   * Remove all live regions
   */
  removeAllLiveRegions() {
    this.liveRegions.forEach((region, id) => {
      this.removeLiveRegion(id);
    });
  }
}

/**
 * Color Contrast Utilities
 */
export class ColorContrastUtils {
  /**
   * Calculate relative luminance of a color
   */
  private getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
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
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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
   * Check if color combination meets WCAG standards
   */
  meetsWCAGStandards(
    foreground: string,
    background: string,
    level: "AA" | "AAA" = "AA"
  ): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return level === "AA" ? ratio >= 4.5 : ratio >= 7;
  }

  /**
   * Suggest accessible color alternatives
   */
  suggestAccessibleColor(foreground: string, background: string): string {
    const ratio = this.getContrastRatio(foreground, background);

    if (ratio >= 4.5) return foreground;

    // Simple approach: darken or lighten the foreground color
    const rgb = this.hexToRgb(foreground);
    if (!rgb) return foreground;

    // Try darkening first
    let factor = 0.8;
    while (factor > 0.1) {
      const newColor = this.rgbToHex(
        Math.floor(rgb.r * factor),
        Math.floor(rgb.g * factor),
        Math.floor(rgb.b * factor)
      );

      if (this.getContrastRatio(newColor, background) >= 4.5) {
        return newColor;
      }

      factor -= 0.1;
    }

    // If darkening doesn't work, try lightening
    factor = 1.2;
    while (factor < 2) {
      const newColor = this.rgbToHex(
        Math.min(255, Math.floor(rgb.r * factor)),
        Math.min(255, Math.floor(rgb.g * factor)),
        Math.min(255, Math.floor(rgb.b * factor))
      );

      if (this.getContrastRatio(newColor, background) >= 4.5) {
        return newColor;
      }

      factor += 0.1;
    }

    return foreground; // Return original if no solution found
  }

  /**
   * Convert RGB to hex
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}

/**
 * Main Accessibility Manager
 */
export class AccessibilityManager {
  private inputDetector: InputMethodDetector;
  private focusManager: FocusManager;
  private skipLinksManager: SkipLinksManager;
  private liveRegionManager: LiveRegionManager;
  private colorContrastUtils: ColorContrastUtils;
  private config: AccessibilityConfig;

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableKeyboardDetection: true,
      enableFocusTrapping: true,
      enableAriaLiveRegions: true,
      enableSkipLinks: false,
      respectReducedMotion: true,
      ...config,
    };

    this.inputDetector = new InputMethodDetector();
    this.focusManager = new FocusManager();
    this.skipLinksManager = new SkipLinksManager();
    this.liveRegionManager = new LiveRegionManager();
    this.colorContrastUtils = new ColorContrastUtils();

    this.init();
  }

  private init() {
    if (this.config.enableSkipLinks) {
      this.skipLinksManager.addCommonSkipLinks();
    }

    // Add main content landmark if it doesn't exist
    this.ensureMainLandmark();

    // Add reduced motion class if user prefers reduced motion
    if (this.config.respectReducedMotion) {
      this.handleReducedMotionPreference();
    }
  }

  private ensureMainLandmark() {
    if (!document.getElementById("main-content")) {
      const main =
        document.querySelector("main") ||
        document.querySelector('[role="main"]');
      if (main) {
        main.id = "main-content";
      }
    }
  }

  private handleReducedMotionPreference() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.add("prefers-reduced-motion");
      } else {
        document.body.classList.remove("prefers-reduced-motion");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    handleChange(mediaQuery as any); // Initial check
  }

  // Expose utility methods
  get input() {
    return this.inputDetector;
  }
  get focus() {
    return this.focusManager;
  }
  get skipLinks() {
    return this.skipLinksManager;
  }
  get liveRegions() {
    return this.liveRegionManager;
  }
  get colorContrast() {
    return this.colorContrastUtils;
  }

  /**
   * Announce page changes to screen readers
   */
  announcePageChange(pageName: string) {
    this.liveRegionManager.announce(
      `Navigated to ${pageName}`,
      "navigation",
      "polite"
    );
  }

  /**
   * Announce form validation results
   */
  announceFormValidation(message: string, isError: boolean = false) {
    this.liveRegionManager.announce(
      message,
      "form-validation",
      isError ? "assertive" : "polite"
    );
  }

  /**
   * Announce loading states
   */
  announceLoading(isLoading: boolean, context: string = "") {
    const message = isLoading
      ? `Loading ${context}...`
      : `${context} loaded successfully`;

    this.liveRegionManager.announce(message, "loading", "polite");
  }

  /**
   * Clean up all accessibility features
   */
  destroy() {
    this.inputDetector.destroy();
    this.skipLinksManager.removeAllSkipLinks();
    this.liveRegionManager.removeAllLiveRegions();
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager();

// Auto-initialize on DOM ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Accessibility manager is already initialized in constructor
    });
  }
}
