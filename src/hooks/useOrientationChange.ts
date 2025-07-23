import { useState, useEffect, useCallback, useRef } from "react";

interface OrientationState {
  orientation: "portrait" | "landscape";
  angle: number;
  isChanging: boolean;
}

interface OrientationChangeHook {
  orientation: "portrait" | "landscape";
  angle: number;
  isChanging: boolean;
  onOrientationChange: (callback: (state: OrientationState) => void) => void;
  getOrientationClasses: () => string;
  getTransitionStyles: () => React.CSSProperties;
}

export const useOrientationChange = (): OrientationChangeHook => {
  const [orientationState, setOrientationState] = useState<OrientationState>(
    () => ({
      orientation:
        typeof window !== "undefined" && window.innerWidth > window.innerHeight
          ? "landscape"
          : "portrait",
      angle: typeof window !== "undefined" ? screen.orientation?.angle || 0 : 0,
      isChanging: false,
    })
  );

  const callbackRef = useRef<((state: OrientationState) => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateOrientation = useCallback(() => {
    if (typeof window === "undefined") return;

    const newOrientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    const newAngle = screen.orientation?.angle || 0;

    // Set changing state
    setOrientationState((prev) => ({
      ...prev,
      isChanging: true,
    }));

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update orientation after a brief delay to allow for smooth transitions
    timeoutRef.current = setTimeout(() => {
      const newState: OrientationState = {
        orientation: newOrientation,
        angle: newAngle,
        isChanging: false,
      };

      setOrientationState(newState);

      // Call the registered callback
      if (callbackRef.current) {
        callbackRef.current(newState);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for orientation change events
    const handleOrientationChange = () => {
      updateOrientation();
    };

    // Listen for resize events as a fallback
    const handleResize = () => {
      updateOrientation();
    };

    // Add event listeners
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleResize);

    // Also listen for screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationChange);
    }

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleResize);

      if (screen.orientation) {
        screen.orientation.removeEventListener(
          "change",
          handleOrientationChange
        );
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [updateOrientation]);

  const onOrientationChange = useCallback(
    (callback: (state: OrientationState) => void) => {
      callbackRef.current = callback;
    },
    []
  );

  const getOrientationClasses = useCallback(() => {
    const baseClasses = "orientation-smooth";
    const orientationClass =
      orientationState.orientation === "portrait"
        ? "portrait-mode"
        : "landscape-mode";
    const changingClass = orientationState.isChanging
      ? "orientation-changing"
      : "";

    return `${baseClasses} ${orientationClass} ${changingClass}`.trim();
  }, [orientationState.orientation, orientationState.isChanging]);

  const getTransitionStyles = useCallback((): React.CSSProperties => {
    return {
      transition: "all var(--duration-slow) var(--ease-smooth)",
      transformOrigin: "center center",
      willChange: orientationState.isChanging ? "transform, opacity" : "auto",
    };
  }, [orientationState.isChanging]);

  return {
    orientation: orientationState.orientation,
    angle: orientationState.angle,
    isChanging: orientationState.isChanging,
    onOrientationChange,
    getOrientationClasses,
    getTransitionStyles,
  };
};

// Utility hook for orientation-specific layouts
export const useOrientationLayout = () => {
  const { orientation, isChanging, getTransitionStyles } =
    useOrientationChange();

  const getLayoutProps = useCallback(
    (
      portraitLayout: React.CSSProperties,
      landscapeLayout: React.CSSProperties
    ) => {
      const baseStyles = getTransitionStyles();
      const orientationStyles =
        orientation === "portrait" ? portraitLayout : landscapeLayout;

      return {
        style: {
          ...baseStyles,
          ...orientationStyles,
          opacity: isChanging ? 0.8 : 1,
        },
        className:
          orientation === "portrait" ? "portrait-layout" : "landscape-layout",
      };
    },
    [orientation, isChanging, getTransitionStyles]
  );

  return {
    orientation,
    isChanging,
    getLayoutProps,
  };
};

// Hook for handling orientation-specific content
export const useOrientationContent = <T>(
  portraitContent: T,
  landscapeContent: T
): { content: T; isTransitioning: boolean } => {
  const { orientation, isChanging } = useOrientationChange();
  const [content, setContent] = useState<T>(
    orientation === "portrait" ? portraitContent : landscapeContent
  );

  useEffect(() => {
    if (!isChanging) {
      setContent(
        orientation === "portrait" ? portraitContent : landscapeContent
      );
    }
  }, [orientation, isChanging, portraitContent, landscapeContent]);

  return {
    content,
    isTransitioning: isChanging,
  };
};

// Hook for responsive breakpoints with orientation awareness
export const useResponsiveBreakpoint = () => {
  const { orientation } = useOrientationChange();
  const [breakpoint, setBreakpoint] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Consider both width and orientation for breakpoint determination
      let bp = "";

      if (orientation === "portrait") {
        // Portrait mode - use width-based breakpoints
        if (width >= 1280) bp = "xl-portrait";
        else if (width >= 1024) bp = "lg-portrait";
        else if (width >= 768) bp = "md-portrait";
        else if (width >= 640) bp = "sm-portrait";
        else bp = "xs-portrait";
      } else {
        // Landscape mode - consider both dimensions
        if (width >= 1600) bp = "2xl-landscape";
        else if (width >= 1280) bp = "xl-landscape";
        else if (width >= 1024) bp = "lg-landscape";
        else if (width >= 768) bp = "md-landscape";
        else bp = "sm-landscape";
      }

      setBreakpoint(bp);
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => {
      window.removeEventListener("resize", updateBreakpoint);
    };
  }, [orientation]);

  return breakpoint;
};
