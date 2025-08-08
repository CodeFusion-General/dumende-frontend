import { useState, useEffect, useCallback, useRef } from "react";

// Breakpoint definitions matching Tailwind config
const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
  "3xl": 1600,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

interface ResponsiveAnimationConfig {
  enableAnimations?: boolean;
  respectReducedMotion?: boolean;
  adaptToPerformance?: boolean;
  touchOptimizations?: boolean;
}

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: "portrait" | "landscape";
}

interface ResponsiveAnimationHook {
  viewport: ViewportInfo;
  isAnimationEnabled: boolean;
  getResponsiveClass: (
    baseClass: string,
    responsiveVariants?: Partial<Record<Breakpoint, string>>
  ) => string;
  getFluidTransition: (
    property: string,
    duration?: string
  ) => React.CSSProperties;
  getGlassEffect: (
    intensity?: "light" | "medium" | "heavy"
  ) => React.CSSProperties;
  getTouchFriendlyProps: () => React.HTMLAttributes<HTMLElement>;
  handleOrientationChange: (
    callback: (orientation: "portrait" | "landscape") => void
  ) => void;
}

export const useResponsiveAnimations = (
  config: ResponsiveAnimationConfig = {}
): ResponsiveAnimationHook => {
  const {
    enableAnimations = true,
    respectReducedMotion = true,
    adaptToPerformance = true,
    touchOptimizations = true,
  } = config;

  const [viewport, setViewport] = useState<ViewportInfo>(() =>
    getViewportInfo()
  );
  const [isAnimationEnabled, setIsAnimationEnabled] =
    useState(enableAnimations);
  const orientationCallbackRef = useRef<
    ((orientation: "portrait" | "landscape") => void) | null
  >(null);

  // Get current viewport information
  function getViewportInfo(): ViewportInfo {
    if (typeof window === "undefined") {
      return {
        width: 1024,
        height: 768,
        breakpoint: "lg",
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        orientation: "landscape",
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width);
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const orientation = width > height ? "landscape" : "portrait";

    return {
      width,
      height,
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      orientation,
    };
  }

  // Determine current breakpoint
  function getCurrentBreakpoint(width: number): Breakpoint {
    if (width >= BREAKPOINTS["3xl"]) return "3xl";
    if (width >= BREAKPOINTS["2xl"]) return "2xl";
    if (width >= BREAKPOINTS.xl) return "xl";
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    if (width >= BREAKPOINTS.xs) return "xs";
    return "xs";
  }

  // Handle viewport changes
  const handleResize = useCallback(() => {
    const newViewport = getViewportInfo();
    const oldOrientation = viewport.orientation;

    setViewport(newViewport);

    // Handle orientation change
    if (
      oldOrientation !== newViewport.orientation &&
      orientationCallbackRef.current
    ) {
      orientationCallbackRef.current(newViewport.orientation);
    }
  }, [viewport.orientation]);

  // Check for reduced motion preference
  const checkReducedMotion = useCallback(() => {
    if (!respectReducedMotion) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setIsAnimationEnabled(enableAnimations && !prefersReducedMotion);
  }, [enableAnimations, respectReducedMotion]);

  // Performance-based animation adjustment
  const checkPerformance = useCallback(() => {
    if (!adaptToPerformance) return;

    // Simple performance check based on device capabilities
    const isLowPerformance = viewport.isMobile && window.devicePixelRatio > 2;
    if (isLowPerformance) {
      setIsAnimationEnabled(false);
    }
  }, [adaptToPerformance, viewport.isMobile]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", checkReducedMotion);
    checkReducedMotion();

    // Initial performance check
    checkPerformance();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      mediaQuery.removeEventListener("change", checkReducedMotion);
    };
  }, [handleResize, checkReducedMotion, checkPerformance]);

  // Get responsive class names
  const getResponsiveClass = useCallback(
    (
      baseClass: string,
      responsiveVariants?: Partial<Record<Breakpoint, string>>
    ): string => {
      let classes = baseClass;

      if (responsiveVariants) {
        // Add responsive variants based on current breakpoint
        const breakpointOrder: Breakpoint[] = [
          "xs",
          "sm",
          "md",
          "lg",
          "xl",
          "2xl",
          "3xl",
        ];
        const currentIndex = breakpointOrder.indexOf(viewport.breakpoint);

        for (let i = 0; i <= currentIndex; i++) {
          const bp = breakpointOrder[i];
          if (responsiveVariants[bp]) {
            classes += ` ${responsiveVariants[bp]}`;
          }
        }
      }

      // Add device-specific classes
      if (viewport.isMobile) classes += " mobile-optimized";
      if (viewport.isTablet) classes += " tablet-optimized";
      if (viewport.isDesktop) classes += " desktop-optimized";
      if (viewport.isTouch) classes += " touch-optimized";

      return classes;
    },
    [viewport]
  );

  // Get fluid transition styles
  const getFluidTransition = useCallback(
    (
      property: string,
      duration: string = "var(--duration-normal)"
    ): React.CSSProperties => {
      if (!isAnimationEnabled) {
        return {};
      }

      return {
        transition: `${property} ${duration} var(--ease-smooth)`,
        willChange: property === "transform" ? "transform" : "auto",
      };
    },
    [isAnimationEnabled]
  );

  // Get responsive glass effect styles
  const getGlassEffect = useCallback(
    (
      intensity: "light" | "medium" | "heavy" = "medium"
    ): React.CSSProperties => {
      const intensityMap = {
        light: {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        medium: {
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-border)",
        },
        heavy: {
          background: "var(--glass-bg-light)",
          backdropFilter: "var(--glass-blur-heavy)",
          border: "1px solid var(--glass-border-light)",
        },
      };

      const baseStyles = intensityMap[intensity];

      // Adjust glass effect based on device capabilities
      if (viewport.isMobile) {
        return {
          ...baseStyles,
          backdropFilter: intensity === "heavy" ? "blur(8px)" : "blur(4px)",
          WebkitBackdropFilter:
            intensity === "heavy" ? "blur(8px)" : "blur(4px)",
        };
      }

      return {
        ...baseStyles,
        WebkitBackdropFilter: baseStyles.backdropFilter,
        boxShadow: "var(--glass-shadow)",
      };
    },
    [viewport.isMobile]
  );

  // Get touch-friendly props
  const getTouchFriendlyProps =
    useCallback((): React.HTMLAttributes<HTMLElement> => {
      if (!touchOptimizations || !viewport.isTouch) {
        return {};
      }

      return {
        style: {
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          minHeight: "44px",
          minWidth: "44px",
        },
      };
    }, [touchOptimizations, viewport.isTouch]);

  // Handle orientation change callback
  const handleOrientationChange = useCallback(
    (callback: (orientation: "portrait" | "landscape") => void) => {
      orientationCallbackRef.current = callback;
    },
    []
  );

  return {
    viewport,
    isAnimationEnabled,
    getResponsiveClass,
    getFluidTransition,
    getGlassEffect,
    getTouchFriendlyProps,
    handleOrientationChange,
  };
};

// Lightweight viewport-only hook for convenience across the app
export const useViewport = (): ViewportInfo => {
  const { viewport } = useResponsiveAnimations();
  return viewport;
};

// Utility hook for responsive breakpoint detection
export const useBreakpoint = () => {
  const { viewport } = useResponsiveAnimations();
  return viewport.breakpoint;
};

// Utility hook for device detection
export const useDeviceType = () => {
  const { viewport } = useResponsiveAnimations();
  return {
    isMobile: viewport.isMobile,
    isTablet: viewport.isTablet,
    isDesktop: viewport.isDesktop,
    isTouch: viewport.isTouch,
  };
};

// Utility hook for orientation detection
export const useOrientation = () => {
  const { viewport, handleOrientationChange } = useResponsiveAnimations();
  return {
    orientation: viewport.orientation,
    onOrientationChange: handleOrientationChange,
  };
};
