import { useState, useEffect, useCallback } from "react";

// Custom hook for progressive loading strategy

interface UseProgressiveLoadingOptions {
  delay?: number;
  priority?: "high" | "medium" | "low";
  dependencies?: any[];
}

interface UseProgressiveLoadingReturn {
  shouldLoad: boolean;
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

export function useProgressiveLoading(
  options: UseProgressiveLoadingOptions = {}
): UseProgressiveLoadingReturn {
  const { delay = 0, priority = "medium", dependencies = [] } = options;
  const [shouldLoad, setShouldLoad] = useState(priority === "high");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (priority === "high") {
      setShouldLoad(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, priority, ...dependencies]);

  const setVisible = useCallback(
    (visible: boolean) => {
      setIsVisible(visible);
      if (visible && !shouldLoad) {
        setShouldLoad(true);
      }
    },
    [shouldLoad]
  );

  return {
    shouldLoad,
    isVisible,
    setVisible,
  };
}

// Hook for intersection observer based progressive loading
export function useIntersectionLoading(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, options]);

  return [{ current: element } as React.RefObject<HTMLElement>, isIntersecting];
}

// Hook for managing loading priorities
export function useLoadingPriority() {
  const [loadingQueue, setLoadingQueue] = useState<{
    high: string[];
    medium: string[];
    low: string[];
  }>({
    high: [],
    medium: [],
    low: [],
  });

  const addToQueue = useCallback(
    (id: string, priority: "high" | "medium" | "low") => {
      setLoadingQueue((prev) => ({
        ...prev,
        [priority]: [...prev[priority], id],
      }));
    },
    []
  );

  const removeFromQueue = useCallback(
    (id: string, priority: "high" | "medium" | "low") => {
      setLoadingQueue((prev) => ({
        ...prev,
        [priority]: prev[priority].filter((item) => item !== id),
      }));
    },
    []
  );

  const getNextToLoad = useCallback((): {
    id: string;
    priority: "high" | "medium" | "low";
  } | null => {
    if (loadingQueue.high.length > 0) {
      return { id: loadingQueue.high[0], priority: "high" };
    }
    if (loadingQueue.medium.length > 0) {
      return { id: loadingQueue.medium[0], priority: "medium" };
    }
    if (loadingQueue.low.length > 0) {
      return { id: loadingQueue.low[0], priority: "low" };
    }
    return null;
  }, [loadingQueue]);

  return {
    addToQueue,
    removeFromQueue,
    getNextToLoad,
    queueSizes: {
      high: loadingQueue.high.length,
      medium: loadingQueue.medium.length,
      low: loadingQueue.low.length,
    },
  };
}
