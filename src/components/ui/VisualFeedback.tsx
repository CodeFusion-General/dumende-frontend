import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";

interface RippleProps {
  x: number;
  y: number;
  id: string;
}

interface VisualFeedbackProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: "hover" | "press" | "focus" | "ripple" | "glow" | "lift" | "scale";
  intensity?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onHover?: (isHovered: boolean) => void;
  onFocus?: (isFocused: boolean) => void;
}

export const VisualFeedback: React.FC<VisualFeedbackProps> = ({
  children,
  className,
  style,
  variant = "hover",
  intensity = "md",
  disabled = false,
  onClick,
  onHover,
  onFocus,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const {
    createRipple,
    ripples,
    hoverLift,
    resetHover,
    glowEffect,
    removeGlow,
    scaleAnimation,
    prefersReducedMotion,
  } = useMicroInteractions();

  const handleMouseEnter = () => {
    if (disabled || !elementRef.current) return;

    setIsHovered(true);
    onHover?.(true);

    if (variant === "hover" || variant === "lift") {
      hoverLift(elementRef.current, intensity);
    } else if (variant === "glow") {
      glowEffect(elementRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (disabled || !elementRef.current) return;

    setIsHovered(false);
    onHover?.(false);

    if (variant === "hover" || variant === "lift") {
      resetHover(elementRef.current);
    } else if (variant === "glow") {
      removeGlow(elementRef.current);
    }
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsPressed(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (variant === "ripple") {
      createRipple(event);
    } else if (variant === "scale" && elementRef.current) {
      scaleAnimation(elementRef.current);
    }

    onClick?.(event);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    onFocus?.(true);
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsFocused(false);
    onFocus?.(false);
  };

  const getVariantClasses = () => {
    if (disabled) return "";

    const baseClasses = "transition-all duration-300 ease-out";

    switch (variant) {
      case "hover":
        return cn(baseClasses, "hover:shadow-lg");
      case "lift":
        return cn(baseClasses, "hover-lift");
      case "press":
        return cn(baseClasses, "active:scale-95 active:shadow-sm");
      case "ripple":
        return cn(baseClasses, "relative overflow-hidden");
      case "glow":
        return cn(baseClasses, "hover-glow");
      case "scale":
        return cn(baseClasses, "hover:scale-105");
      case "focus":
        return cn(baseClasses, "focus-ring");
      default:
        return baseClasses;
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        getVariantClasses(),
        {
          "opacity-50 cursor-not-allowed": disabled,
          "cursor-pointer": !disabled && onClick,
        },
        className
      )}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {children}

      {/* Ripple Effects */}
      {variant === "ripple" && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-ping"
              style={{
                left: ripple.x - 4,
                top: ripple.y - 4,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  success = false,
  error = false,
  disabled,
  className,
  children,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    createRipple,
    scaleAnimation,
    bounceAnimation,
    prefersReducedMotion,
  } = useMicroInteractions();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    createRipple(event);

    // Scale animation on click
    if (buttonRef.current) {
      await scaleAnimation(buttonRef.current, 0.95, 150);
    }

    // Success bounce animation
    if (success && buttonRef.current) {
      bounceAnimation(buttonRef.current);
    }

    onClick?.(event);
  };

  const getVariantClasses = () => {
    const base =
      "relative overflow-hidden font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2";

    switch (variant) {
      case "primary":
        return cn(
          base,
          "bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl focus:ring-primary/50"
        );
      case "secondary":
        return cn(
          base,
          "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-md hover:shadow-lg focus:ring-gray-500/50"
        );
      case "outline":
        return cn(
          base,
          "border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-md focus:ring-primary/50"
        );
      case "ghost":
        return cn(
          base,
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500/50"
        );
      default:
        return base;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm rounded-lg";
      case "lg":
        return "px-8 py-4 text-lg rounded-xl";
      default:
        return "px-6 py-3 text-base rounded-lg";
    }
  };

  const getStateClasses = () => {
    if (loading) return "opacity-75 cursor-wait";
    if (success) return "bg-green-500 hover:bg-green-600 text-white";
    if (error) return "bg-red-500 hover:bg-red-600 text-white";
    if (disabled) return "opacity-50 cursor-not-allowed";
    return "";
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        getStateClasses(),
        "btn-ripple btn-bounce",
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <span
        className={cn("flex items-center justify-center gap-2", {
          "opacity-0": loading,
        })}
      >
        {success && !prefersReducedMotion && (
          <svg
            className="w-5 h-5 animate-bounce"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {error && !prefersReducedMotion && (
          <svg
            className="w-5 h-5 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover" | "tilt" | "glow";
  clickable?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  variant = "default",
  clickable = false,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { hoverLift, resetHover, glowEffect, removeGlow } =
    useMicroInteractions();

  const handleMouseEnter = () => {
    if (!cardRef.current) return;

    switch (variant) {
      case "hover":
        hoverLift(cardRef.current, "md");
        break;
      case "glow":
        glowEffect(cardRef.current);
        break;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    switch (variant) {
      case "hover":
        resetHover(cardRef.current);
        break;
      case "glow":
        removeGlow(cardRef.current);
        break;
    }
  };

  const getVariantClasses = () => {
    const base =
      "bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ease-out";

    switch (variant) {
      case "hover":
        return cn(base, "hover:shadow-lg");
      case "tilt":
        return cn(base, "card-tilt");
      case "glow":
        return cn(base, "hover-glow");
      default:
        return base;
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        getVariantClasses(),
        {
          "cursor-pointer": clickable,
        },
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "bg-current rounded-full animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  animated?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  animated = true,
  color = "primary",
}) => {
  const colorClasses = {
    primary: "bg-gradient-to-r from-primary to-primary-dark",
    success: "bg-gradient-to-r from-green-500 to-green-600",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    error: "bg-gradient-to-r from-red-500 to-red-600",
  };

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className={cn(
          "h-2 rounded-full transition-all duration-500 ease-out",
          colorClasses[color],
          {
            "progress-bar": animated,
          }
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

export default VisualFeedback;
