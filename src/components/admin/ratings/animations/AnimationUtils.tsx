import React, { useEffect, useState } from "react";

// Animation hook for staggered animations
export const useStaggeredAnimation = (
  items: any[],
  delay: number = 100
): boolean[] => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(items.length).fill(false)
  );

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    items.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => {
          const newVisible = [...prev];
          newVisible[index] = true;
          return newVisible;
        });
      }, index * delay);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [items.length, delay]);

  return visibleItems;
};

// Animation hook for counting up numbers
export const useCountUp = (
  end: number,
  duration: number = 1500,
  start: number = 0,
  decimals: number = 0
): number => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (end === start) {
      setCount(end);
      return;
    }

    const increment = (end - start) / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;

      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Number(current.toFixed(decimals)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, start, decimals]);

  return count;
};

// Animation hook for progress bars
export const useProgressAnimation = (
  targetProgress: number,
  duration: number = 1000
): number => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = 60; // 60fps
    const increment = targetProgress / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, targetProgress);

      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - step / steps, 3); // ease-out cubic
      const easedValue = targetProgress * easedProgress;

      setProgress(easedValue);

      if (step >= steps) {
        clearInterval(timer);
        setProgress(targetProgress);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetProgress, duration]);

  return progress;
};

// Intersection Observer hook for scroll animations
export const useIntersectionObserver = (
  threshold: number = 0.1
): [React.RefObject<HTMLDivElement>, boolean] => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Hover animation component
interface HoverAnimationProps {
  children: React.ReactNode;
  scale?: number;
  duration?: string;
  className?: string;
}

export const HoverAnimation: React.FC<HoverAnimationProps> = ({
  children,
  scale = 1.05,
  duration = "200ms",
  className = "",
}) => {
  return (
    <div
      className={`transition-transform ease-out hover:scale-${Math.round(
        scale * 100
      )} ${className}`}
      style={{
        transitionDuration: duration,
      }}
    >
      {children}
    </div>
  );
};

// Fade in animation component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 500,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Slide in animation component
interface SlideInProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = "up",
  delay = 0,
  duration = 500,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0";

    switch (direction) {
      case "left":
        return "-translate-x-8";
      case "right":
        return "translate-x-8";
      case "up":
        return "translate-y-8";
      case "down":
        return "-translate-y-8";
      default:
        return "translate-y-8";
    }
  };

  return (
    <div
      className={`transition-all ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${getTransform()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Pulse animation component
interface PulseProps {
  children: React.ReactNode;
  intensity?: "light" | "medium" | "strong";
  duration?: string;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  intensity = "medium",
  duration = "2s",
  className = "",
}) => {
  const intensityClasses = {
    light: "animate-pulse opacity-75",
    medium: "animate-pulse opacity-50",
    strong: "animate-pulse opacity-25",
  };

  return (
    <div
      className={`${intensityClasses[intensity]} ${className}`}
      style={{
        animationDuration: duration,
      }}
    >
      {children}
    </div>
  );
};

// Bounce animation component
interface BounceProps {
  children: React.ReactNode;
  trigger?: boolean;
  duration?: number;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  trigger = false,
  duration = 600,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return (
    <div
      className={`transition-transform ease-out ${
        isAnimating ? "animate-bounce" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Shimmer loading animation component
interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = "",
  children,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse ${className}`}
    >
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-shimmer" />
    </div>
  );
};

// Ripple effect component
interface RippleProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  className?: string;
}

export const Ripple: React.FC<RippleProps> = ({
  children,
  color = "rgba(255, 255, 255, 0.6)",
  duration = 600,
  className = "",
}) => {
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, duration);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
};
