import { useCallback, useEffect, useRef, useState } from "react";

interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
}

interface SwipeGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: (event: TouchEvent | MouseEvent) => void;
  onSwipeEnd?: (event: TouchEvent | MouseEvent) => void;
}

interface SwipeGestureState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  endTime: number;
  isTracking: boolean;
}

export const useSwipeGestures = (
  handlers: SwipeGestureHandlers,
  options: SwipeGestureOptions = {}
) => {
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options;

  const [gestureState, setGestureState] = useState<SwipeGestureState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTime: 0,
    endTime: 0,
    isTracking: false,
  });

  const elementRef = useRef<HTMLElement>(null);

  const handleStart = useCallback(
    (event: TouchEvent | MouseEvent) => {
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;

      setGestureState({
        startX: clientX,
        startY: clientY,
        endX: clientX,
        endY: clientY,
        startTime: Date.now(),
        endTime: Date.now(),
        isTracking: true,
      });

      handlers.onSwipeStart?.(event);
    },
    [handlers]
  );

  const handleMove = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!gestureState.isTracking) return;

      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;

      setGestureState((prev) => ({
        ...prev,
        endX: clientX,
        endY: clientY,
        endTime: Date.now(),
      }));

      if (preventDefaultTouchmoveEvent && "touches" in event) {
        event.preventDefault();
      }
    },
    [gestureState.isTracking, preventDefaultTouchmoveEvent]
  );

  const handleEnd = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!gestureState.isTracking) return;

      const deltaX = gestureState.endX - gestureState.startX;
      const deltaY = gestureState.endY - gestureState.startY;
      const deltaTime = gestureState.endTime - gestureState.startTime;
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Determine swipe direction based on threshold and velocity
      if (Math.abs(deltaX) > threshold && velocityX > velocity) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (Math.abs(deltaY) > threshold && velocityY > velocity) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      setGestureState((prev) => ({
        ...prev,
        isTracking: false,
      }));

      handlers.onSwipeEnd?.(event);
    },
    [gestureState, threshold, velocity, handlers]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events
    element.addEventListener("touchstart", handleStart, { passive: false });
    element.addEventListener("touchmove", handleMove, { passive: false });
    element.addEventListener("touchend", handleEnd, { passive: false });

    // Mouse events (if enabled)
    if (trackMouse) {
      element.addEventListener("mousedown", handleStart);
      element.addEventListener("mousemove", handleMove);
      element.addEventListener("mouseup", handleEnd);
    }

    return () => {
      element.removeEventListener("touchstart", handleStart);
      element.removeEventListener("touchmove", handleMove);
      element.removeEventListener("touchend", handleEnd);

      if (trackMouse) {
        element.removeEventListener("mousedown", handleStart);
        element.removeEventListener("mousemove", handleMove);
        element.removeEventListener("mouseup", handleEnd);
      }
    };
  }, [handleStart, handleMove, handleEnd, trackMouse]);

  return {
    elementRef,
    gestureState,
    isTracking: gestureState.isTracking,
  };
};

// Pull-to-refresh hook
interface PullToRefreshOptions {
  threshold?: number;
  resistance?: number;
  onRefresh?: () => Promise<void> | void;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const {
    threshold = 80,
    resistance = 2.5,
    onRefresh,
    refreshingText = "Yenileniyor...",
    pullText = "Yenilemek için çekin",
    releaseText = "Yenilemek için bırakın",
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = event.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return;

      currentY.current = event.touches[0].clientY;
      const deltaY = currentY.current - startY.current;

      if (deltaY > 0) {
        event.preventDefault();
        const distance = Math.min(deltaY / resistance, threshold * 1.5);
        setPullDistance(distance);
        setCanRefresh(distance >= threshold);
      }
    },
    [isRefreshing, resistance, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (canRefresh && !isRefreshing && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [canRefresh, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getRefreshText = () => {
    if (isRefreshing) return refreshingText;
    if (canRefresh) return releaseText;
    return pullText;
  };

  return {
    elementRef,
    pullDistance,
    isRefreshing,
    canRefresh,
    refreshText: getRefreshText(),
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
};

// Touch target optimization hook
export const useTouchTarget = () => {
  const getTouchTargetProps = useCallback((minSize: number = 44) => {
    return {
      style: {
        minWidth: `${minSize}px`,
        minHeight: `${minSize}px`,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      } as React.CSSProperties,
    };
  }, []);

  return { getTouchTargetProps };
};
