/**
 * Browser Compatibility and Feature Detection Utilities
 */

export interface MobileFeatureFlags {
  enableTouchOptimizations: boolean;
  enableViewportFixes: boolean;
  enableSafariWorkarounds: boolean;
  enableAndroidOptimizations: boolean;
  enableReducedMotion: boolean;
  enableLowEndDeviceMode: boolean;
  enableOfflineSupport: boolean;
  enablePWAFeatures: boolean;
  enableAdaptiveLoading: boolean;
  enableMemoryOptimizations: boolean;
}

export interface MobileBrowserQuirks {
  safariAddressBarResize: boolean;
  safariViewportBugs: boolean;
  safariScrollBounce: boolean;
  safariInputZoom: boolean;
  androidKeyboardResize: boolean;
  androidBackButtonHandling: boolean;
  androidChromeTabSwitching: boolean;
  touchDelayIssues: boolean;
  orientationChangeDelay: boolean;
  memoryLimitations: boolean;
}

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
  // Mobile-specific properties
  isMobile: boolean;
  isMobileSafari: boolean;
  isAndroidChrome: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: string;
  deviceType: "mobile" | "tablet" | "desktop";
  hasNotch: boolean;
  supportsViewportUnits: boolean;
  supportsTouch: boolean;
  supportsOrientationChange: boolean;
  hasAddressBarIssues: boolean;
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
  // Mobile-specific features
  touchEvents: boolean;
  pointerEvents: boolean;
  deviceMotion: boolean;
  deviceOrientation: boolean;
  vibration: boolean;
  webGL: boolean;
  webGL2: boolean;
  serviceWorker: boolean;
  pushNotifications: boolean;
  webShare: boolean;
  fullscreen: boolean;
  pictureInPicture: boolean;
  webRTC: boolean;
  geolocation: boolean;
  camera: boolean;
  microphone: boolean;
  battery: boolean;
  networkInformation: boolean;
  paymentRequest: boolean;
  webAuthn: boolean;
}

/**
 * Browser Detection and Feature Support Manager
 */
export class BrowserCompatibilityManager {
  private browserInfo: BrowserInfo;
  private featureSupport: FeatureSupport;
  private mobileFeatureFlags: MobileFeatureFlags;
  private mobileBrowserQuirks: MobileBrowserQuirks;
  private fallbacksApplied = false;

  constructor() {
    this.browserInfo = this.detectBrowser();
    this.featureSupport = this.detectFeatureSupport();
    this.mobileFeatureFlags = this.initializeMobileFeatureFlags();
    this.mobileBrowserQuirks = this.detectMobileBrowserQuirks();
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

    // Mobile detection
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobileSafari =
      isIOS && /Safari/.test(userAgent) && !/CriOS|FxiOS/.test(userAgent);
    const isAndroidChrome =
      isAndroid && /Chrome/.test(userAgent) && !/Edge/.test(userAgent);

    // Platform detection
    let platform = "unknown";
    if (isIOS) platform = "ios";
    else if (isAndroid) platform = "android";
    else if (userAgent.includes("Windows")) platform = "windows";
    else if (userAgent.includes("Mac")) platform = "macos";
    else if (userAgent.includes("Linux")) platform = "linux";

    // Device type detection
    let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
    if (isMobile) {
      deviceType = /iPad|Android(?!.*Mobile)/.test(userAgent)
        ? "tablet"
        : "mobile";
    }

    // Chrome
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      name = isAndroidChrome ? "Chrome Mobile" : "Chrome";
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= (isMobile ? 70 : 80);
    }
    // Firefox
    else if (userAgent.includes("Firefox")) {
      name = isMobile ? "Firefox Mobile" : "Firefox";
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= (isMobile ? 68 : 75);
    }
    // Safari
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      name = isMobileSafari ? "Mobile Safari" : "Safari";
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : "0";
      isModern = parseInt(version) >= (isMobile ? 12 : 13);
    }
    // Edge
    else if (userAgent.includes("Edg")) {
      name = isMobile ? "Edge Mobile" : "Edge";
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

    // Create basic browser info first
    const basicInfo = {
      name,
      version,
      isModern,
      isMobile,
      isMobileSafari,
      isAndroidChrome,
      isIOS,
      isAndroid,
      platform,
      deviceType,
    };

    // Then add feature tests that don't depend on this.browserInfo
    return {
      ...basicInfo,
      hasNotch:
        CSS.supports("padding-top", "env(safe-area-inset-top)") ||
        CSS.supports("padding-top", "constant(safe-area-inset-top)"),
      supportsViewportUnits: (() => {
        const testEl = document.createElement("div");
        testEl.style.height = "100vh";
        testEl.style.width = "100vw";
        return testEl.style.height !== "" && testEl.style.width !== "";
      })(),
      supportsTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      supportsOrientationChange: "onorientationchange" in window,
      hasAddressBarIssues:
        isMobileSafari ||
        (isIOS && window.innerHeight !== document.documentElement.clientHeight),
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
      // Mobile-specific features
      touchEvents: this.testTouchEvents(),
      pointerEvents: this.testPointerEvents(),
      deviceMotion: this.testDeviceMotion(),
      deviceOrientation: this.testDeviceOrientation(),
      vibration: this.testVibration(),
      webGL: this.testWebGL(),
      webGL2: this.testWebGL2(),
      serviceWorker: this.testServiceWorker(),
      pushNotifications: this.testPushNotifications(),
      webShare: this.testWebShare(),
      fullscreen: this.testFullscreen(),
      pictureInPicture: this.testPictureInPicture(),
      webRTC: this.testWebRTC(),
      geolocation: this.testGeolocation(),
      camera: this.testCamera(),
      microphone: this.testMicrophone(),
      battery: this.testBattery(),
      networkInformation: this.testNetworkInformation(),
      paymentRequest: this.testPaymentRequest(),
      webAuthn: this.testWebAuthn(),
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
   * Mobile-specific detection methods
   */
  private detectNotch(): boolean {
    // Check for iPhone X and newer with notch
    return (
      CSS.supports("padding-top", "env(safe-area-inset-top)") ||
      CSS.supports("padding-top", "constant(safe-area-inset-top)")
    );
  }

  private testViewportUnits(): boolean {
    // Test if vh/vw units work properly (Safari has issues)
    const testEl = document.createElement("div");
    testEl.style.height = "100vh";
    testEl.style.width = "100vw";
    return testEl.style.height !== "" && testEl.style.width !== "";
  }

  private testTouchSupport(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  private testOrientationChange(): boolean {
    return "onorientationchange" in window;
  }

  private detectAddressBarIssues(): boolean {
    // Safari on iOS has address bar that affects viewport height
    return (
      this.browserInfo?.isMobileSafari ||
      (this.browserInfo?.isIOS &&
        window.innerHeight !== document.documentElement.clientHeight)
    );
  }

  private testTouchEvents(): boolean {
    return "ontouchstart" in window;
  }

  private testPointerEvents(): boolean {
    return "onpointerdown" in window;
  }

  private testDeviceMotion(): boolean {
    return "DeviceMotionEvent" in window;
  }

  private testDeviceOrientation(): boolean {
    return "DeviceOrientationEvent" in window;
  }

  private testVibration(): boolean {
    return "vibrate" in navigator;
  }

  private testWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      return false;
    }
  }

  private testWebGL2(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!canvas.getContext("webgl2");
    } catch {
      return false;
    }
  }

  private testServiceWorker(): boolean {
    return "serviceWorker" in navigator;
  }

  private testPushNotifications(): boolean {
    return "PushManager" in window && "Notification" in window;
  }

  private testWebShare(): boolean {
    return "share" in navigator;
  }

  private testFullscreen(): boolean {
    return (
      "requestFullscreen" in document.documentElement ||
      "webkitRequestFullscreen" in document.documentElement ||
      "mozRequestFullScreen" in document.documentElement
    );
  }

  private testPictureInPicture(): boolean {
    return "pictureInPictureEnabled" in document;
  }

  private testWebRTC(): boolean {
    return "RTCPeerConnection" in window || "webkitRTCPeerConnection" in window;
  }

  private testGeolocation(): boolean {
    return "geolocation" in navigator;
  }

  private testCamera(): boolean {
    return (
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
    );
  }

  private testMicrophone(): boolean {
    return (
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
    );
  }

  private testBattery(): boolean {
    return "getBattery" in navigator;
  }

  private testNetworkInformation(): boolean {
    return (
      "connection" in navigator ||
      "mozConnection" in navigator ||
      "webkitConnection" in navigator
    );
  }

  private testPaymentRequest(): boolean {
    return "PaymentRequest" in window;
  }

  private testWebAuthn(): boolean {
    return "credentials" in navigator && "create" in navigator.credentials;
  }

  /**
   * Initialize mobile feature flags
   */
  private initializeMobileFeatureFlags(): MobileFeatureFlags {
    const isLowEndDevice = this.detectLowEndDevice();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    return {
      enableTouchOptimizations:
        this.browserInfo.isMobile && this.featureSupport.touchEvents,
      enableViewportFixes:
        this.browserInfo.isMobileSafari || this.browserInfo.hasAddressBarIssues,
      enableSafariWorkarounds: this.browserInfo.isMobileSafari,
      enableAndroidOptimizations: this.browserInfo.isAndroidChrome,
      enableReducedMotion: prefersReducedMotion || isLowEndDevice,
      enableLowEndDeviceMode: isLowEndDevice,
      enableOfflineSupport: this.featureSupport.serviceWorker,
      enablePWAFeatures:
        this.browserInfo.isMobile && this.featureSupport.serviceWorker,
      enableAdaptiveLoading: this.browserInfo.isMobile,
      enableMemoryOptimizations: this.browserInfo.isMobile || isLowEndDevice,
    };
  }

  /**
   * Detect mobile browser quirks
   */
  private detectMobileBrowserQuirks(): MobileBrowserQuirks {
    return {
      safariAddressBarResize: this.browserInfo.isMobileSafari,
      safariViewportBugs: this.browserInfo.isMobileSafari,
      safariScrollBounce: this.browserInfo.isMobileSafari,
      safariInputZoom: this.browserInfo.isMobileSafari,
      androidKeyboardResize: this.browserInfo.isAndroidChrome,
      androidBackButtonHandling: this.browserInfo.isAndroid,
      androidChromeTabSwitching: this.browserInfo.isAndroidChrome,
      touchDelayIssues:
        this.browserInfo.isMobile && !this.featureSupport.pointerEvents,
      orientationChangeDelay: this.browserInfo.isMobile,
      memoryLimitations: this.browserInfo.isMobile || this.detectLowEndDevice(),
    };
  }

  /**
   * Detect low-end device
   */
  private detectLowEndDevice(): boolean {
    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory <= 2) {
      return true;
    }

    // Check hardware concurrency (CPU cores)
    const hardwareConcurrency = navigator.hardwareConcurrency;
    if (hardwareConcurrency && hardwareConcurrency <= 2) {
      return true;
    }

    // Check connection type
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (
      connection &&
      (connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g")
    ) {
      return true;
    }

    // Fallback: assume older mobile browsers are on low-end devices
    if (this.browserInfo.isMobile && !this.browserInfo.isModern) {
      return true;
    }

    return false;
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

    // Mobile-specific classes
    if (this.browserInfo.isMobile) {
      body.classList.add("mobile-device");
      body.classList.add(`device-${this.browserInfo.deviceType}`);
      body.classList.add(`platform-${this.browserInfo.platform}`);
    }

    if (this.browserInfo.isMobileSafari) {
      body.classList.add("mobile-safari");
    }

    if (this.browserInfo.isAndroidChrome) {
      body.classList.add("android-chrome");
    }

    if (this.browserInfo.hasNotch) {
      body.classList.add("has-notch");
    }

    if (this.browserInfo.hasAddressBarIssues) {
      body.classList.add("has-address-bar-issues");
    }

    if (this.detectLowEndDevice()) {
      body.classList.add("low-end-device");
    }

    // Feature flag classes
    Object.entries(this.mobileFeatureFlags).forEach(([flag, enabled]) => {
      if (enabled) {
        body.classList.add(
          `feature-${flag.replace(/([A-Z])/g, "-$1").toLowerCase()}`
        );
      }
    });

    // Quirk classes
    Object.entries(this.mobileBrowserQuirks).forEach(([quirk, hasQuirk]) => {
      if (hasQuirk) {
        body.classList.add(
          `quirk-${quirk.replace(/([A-Z])/g, "-$1").toLowerCase()}`
        );
      }
    });
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
   * Get mobile feature flags
   */
  getMobileFeatureFlags(): MobileFeatureFlags {
    return this.mobileFeatureFlags;
  }

  /**
   * Get mobile browser quirks
   */
  getMobileBrowserQuirks(): MobileBrowserQuirks {
    return this.mobileBrowserQuirks;
  }

  /**
   * Check if a mobile feature flag is enabled
   */
  isMobileFeatureEnabled(flag: keyof MobileFeatureFlags): boolean {
    return this.mobileFeatureFlags[flag];
  }

  /**
   * Check if browser has a specific mobile quirk
   */
  hasMobileQuirk(quirk: keyof MobileBrowserQuirks): boolean {
    return this.mobileBrowserQuirks[quirk];
  }

  /**
   * Enable/disable mobile feature flag
   */
  setMobileFeatureFlag(flag: keyof MobileFeatureFlags, enabled: boolean): void {
    this.mobileFeatureFlags[flag] = enabled;

    // Update CSS class
    const body = document.body;
    const className = `feature-${flag
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()}`;

    if (enabled) {
      body.classList.add(className);
    } else {
      body.classList.remove(className);
    }
  }

  /**
   * Get device performance classification
   */
  getDevicePerformanceClass(): "low" | "medium" | "high" {
    if (this.detectLowEndDevice()) {
      return "low";
    }

    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency;

    if (deviceMemory >= 8 || hardwareConcurrency >= 8) {
      return "high";
    }

    return "medium";
  }

  /**
   * Log browser compatibility information
   */
  logCompatibilityInfo() {
    console.group("Browser Compatibility Information");
    console.log("Browser Info:", this.browserInfo);
    console.log("Feature Support:", this.featureSupport);
    console.log("Mobile Feature Flags:", this.mobileFeatureFlags);
    console.log("Mobile Browser Quirks:", this.mobileBrowserQuirks);
    console.log("Device Performance Class:", this.getDevicePerformanceClass());
    console.groupEnd();
  }
}

/**
 * Polyfill Manager for missing features
 */
export class PolyfillManager {
  private polyfillsLoaded = new Set<string>();
  private browserManager: BrowserCompatibilityManager;

  constructor(browserManager?: BrowserCompatibilityManager) {
    this.browserManager = browserManager || browserCompatibilityManager;
  }

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
   * Load touch event polyfills for older mobile browsers
   */
  async loadTouchEventPolyfills(): Promise<void> {
    if (this.polyfillsLoaded.has("touch-events")) {
      return;
    }

    // Add touch event polyfills for browsers that don't support them
    if (!("ontouchstart" in window) && navigator.maxTouchPoints === 0) {
      // Create synthetic touch events from mouse events
      const createTouchEvent = (mouseEvent: MouseEvent, touchType: string) => {
        const touch = {
          identifier: 0,
          target: mouseEvent.target,
          clientX: mouseEvent.clientX,
          clientY: mouseEvent.clientY,
          pageX: mouseEvent.pageX,
          pageY: mouseEvent.pageY,
          screenX: mouseEvent.screenX,
          screenY: mouseEvent.screenY,
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 1,
        };

        const touchEvent = new CustomEvent(touchType, {
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(touchEvent, "touches", {
          value: touchType === "touchend" ? [] : [touch],
          writable: false,
        });

        Object.defineProperty(touchEvent, "targetTouches", {
          value: touchType === "touchend" ? [] : [touch],
          writable: false,
        });

        Object.defineProperty(touchEvent, "changedTouches", {
          value: [touch],
          writable: false,
        });

        return touchEvent;
      };

      // Map mouse events to touch events
      document.addEventListener("mousedown", (e) => {
        const touchEvent = createTouchEvent(e, "touchstart");
        e.target?.dispatchEvent(touchEvent);
      });

      document.addEventListener("mousemove", (e) => {
        if (e.buttons > 0) {
          const touchEvent = createTouchEvent(e, "touchmove");
          e.target?.dispatchEvent(touchEvent);
        }
      });

      document.addEventListener("mouseup", (e) => {
        const touchEvent = createTouchEvent(e, "touchend");
        e.target?.dispatchEvent(touchEvent);
      });
    }

    this.polyfillsLoaded.add("touch-events");
  }

  /**
   * Load viewport handling polyfills for mobile Safari
   */
  async loadViewportPolyfills(): Promise<void> {
    if (this.polyfillsLoaded.has("viewport-fixes")) {
      return;
    }

    const browserInfo = this.browserManager.getBrowserInfo();

    // Safari viewport height fix
    if (browserInfo.isMobileSafari || browserInfo.hasAddressBarIssues) {
      const setViewportHeight = () => {
        // Use the actual viewport height instead of 100vh
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      };

      // Set initial value
      setViewportHeight();

      // Update on resize and orientation change
      window.addEventListener("resize", setViewportHeight);
      window.addEventListener("orientationchange", () => {
        // Delay to account for address bar animation
        setTimeout(setViewportHeight, 500);
      });

      // Add CSS custom property fallback
      const style = document.createElement("style");
      style.textContent = `
        .viewport-height-fix {
          height: 100vh; /* Fallback for browsers that don't support custom properties */
          height: calc(var(--vh, 1vh) * 100);
        }
        
        .full-height {
          min-height: 100vh;
          min-height: calc(var(--vh, 1vh) * 100);
        }
      `;
      document.head.appendChild(style);
    }

    // Handle safe area insets for devices with notches
    if (browserInfo.hasNotch) {
      const style = document.createElement("style");
      style.textContent = `
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top, 0);
          padding-top: constant(safe-area-inset-top, 0); /* iOS 11.0-11.2 */
        }
        
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
          padding-bottom: constant(safe-area-inset-bottom, 0);
        }
        
        .safe-area-inset-left {
          padding-left: env(safe-area-inset-left, 0);
          padding-left: constant(safe-area-inset-left, 0);
        }
        
        .safe-area-inset-right {
          padding-right: env(safe-area-inset-right, 0);
          padding-right: constant(safe-area-inset-right, 0);
        }
        
        .safe-area-insets {
          padding-top: env(safe-area-inset-top, 0);
          padding-bottom: env(safe-area-inset-bottom, 0);
          padding-left: env(safe-area-inset-left, 0);
          padding-right: env(safe-area-inset-right, 0);
          padding-top: constant(safe-area-inset-top, 0);
          padding-bottom: constant(safe-area-inset-bottom, 0);
          padding-left: constant(safe-area-inset-left, 0);
          padding-right: constant(safe-area-inset-right, 0);
        }
      `;
      document.head.appendChild(style);
    }

    this.polyfillsLoaded.add("viewport-fixes");
  }

  /**
   * Load gesture handling polyfills
   */
  async loadGesturePolyfills(): Promise<void> {
    if (this.polyfillsLoaded.has("gesture-handling")) {
      return;
    }

    // Add passive event listener support detection and polyfill
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, "passive", {
        get: function () {
          supportsPassive = true;
          return false;
        },
      });
      window.addEventListener("testPassive", () => {}, opts);
      window.removeEventListener("testPassive", () => {}, opts);
    } catch (e) {}

    // Store the result globally for use in event listeners
    (window as any).supportsPassive = supportsPassive;

    // Add touch action polyfill for older browsers
    if (!CSS.supports("touch-action", "manipulation")) {
      const style = document.createElement("style");
      style.textContent = `
        .touch-action-manipulation {
          -ms-touch-action: manipulation;
          touch-action: manipulation;
        }
        
        .touch-action-none {
          -ms-touch-action: none;
          touch-action: none;
        }
        
        .touch-action-pan-x {
          -ms-touch-action: pan-x;
          touch-action: pan-x;
        }
        
        .touch-action-pan-y {
          -ms-touch-action: pan-y;
          touch-action: pan-y;
        }
      `;
      document.head.appendChild(style);
    }

    // Add 300ms tap delay fix for older mobile browsers
    const browserInfo = this.browserManager.getBrowserInfo();
    if (browserInfo.isMobile && !browserInfo.isModern) {
      const style = document.createElement("style");
      style.textContent = `
        a, button, input, select, textarea, [role="button"], [tabindex] {
          touch-action: manipulation;
          -ms-touch-action: manipulation;
        }
      `;
      document.head.appendChild(style);

      // Add meta viewport tag if not present
      if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement("meta");
        viewport.name = "viewport";
        viewport.content =
          "width=device-width, initial-scale=1, user-scalable=no";
        document.head.appendChild(viewport);
      }
    }

    this.polyfillsLoaded.add("gesture-handling");
  }

  /**
   * Load ResizeObserver polyfill for older mobile browsers
   */
  async loadResizeObserverPolyfill(): Promise<void> {
    if (
      "ResizeObserver" in window ||
      this.polyfillsLoaded.has("resize-observer")
    ) {
      return;
    }

    // Simple ResizeObserver polyfill
    (window as any).ResizeObserver = class {
      private callback: Function;
      private elements = new Set<Element>();
      private observer?: MutationObserver;

      constructor(callback: Function) {
        this.callback = callback;
        this.setupObserver();
      }

      observe(element: Element) {
        this.elements.add(element);
        this.checkResize();
      }

      unobserve(element: Element) {
        this.elements.delete(element);
      }

      disconnect() {
        this.elements.clear();
        if (this.observer) {
          this.observer.disconnect();
        }
      }

      private setupObserver() {
        // Use MutationObserver as fallback
        this.observer = new MutationObserver(() => {
          this.checkResize();
        });

        this.observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class"],
        });

        // Also listen to window resize
        window.addEventListener("resize", () => {
          this.checkResize();
        });
      }

      private checkResize() {
        const entries: any[] = [];
        this.elements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          entries.push({
            target: element,
            contentRect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left,
            },
          });
        });

        if (entries.length > 0) {
          this.callback(entries);
        }
      }
    };

    this.polyfillsLoaded.add("resize-observer");
  }

  /**
   * Load Web Share API polyfill
   */
  async loadWebSharePolyfill(): Promise<void> {
    if ("share" in navigator || this.polyfillsLoaded.has("web-share")) {
      return;
    }

    // Simple Web Share API polyfill
    (navigator as any).share = async (data: {
      title?: string;
      text?: string;
      url?: string;
    }) => {
      // Fallback to copying to clipboard or opening share dialog
      const shareText = `${data.title || ""}\n${data.text || ""}\n${
        data.url || ""
      }`.trim();

      if ("clipboard" in navigator) {
        try {
          await navigator.clipboard.writeText(shareText);
          // Show a simple notification
          const notification = document.createElement("div");
          notification.textContent = "Copied to clipboard!";
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 2000);
        } catch (err) {
          // Fallback to prompt
          prompt("Copy this text to share:", shareText);
        }
      } else {
        // Fallback to prompt
        prompt("Copy this text to share:", shareText);
      }
    };

    this.polyfillsLoaded.add("web-share");
  }

  /**
   * Load all mobile-specific polyfills
   */
  async loadMobilePolyfills(): Promise<void> {
    const browserInfo = this.browserManager.getBrowserInfo();

    if (browserInfo.isMobile) {
      await Promise.all([
        this.loadTouchEventPolyfills(),
        this.loadViewportPolyfills(),
        this.loadGesturePolyfills(),
        this.loadResizeObserverPolyfill(),
        this.loadWebSharePolyfill(),
      ]);
    }
  }

  /**
   * Load all necessary polyfills
   */
  async loadAllPolyfills(): Promise<void> {
    await Promise.all([
      this.loadIntersectionObserverPolyfill(),
      this.loadCustomPropertiesPolyfill(),
      this.loadMobilePolyfills(),
    ]);
  }
}

// Export singleton instances
export const browserCompatibilityManager = new BrowserCompatibilityManager();
export const polyfillManager = new PolyfillManager(browserCompatibilityManager);

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
