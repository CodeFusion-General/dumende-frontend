import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "light" | "dark";
  hover?: boolean;
  glow?: boolean;
  animated?: boolean;
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      hover = true,
      glow = false,
      animated = true,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = "glass-card relative overflow-hidden";

    const variantClasses = {
      default: "glass",
      light: "glass-light",
      dark: "glass-dark",
    };

    const interactionClasses = cn(
      hover && "group cursor-pointer",
      animated && "transition-all duration-300 ease-glass",
      hover &&
        animated &&
        "hover:transform hover:-translate-y-1 hover:shadow-glass-hover",
      glow && "animate-pulse-glow"
    );

    const gradientBorderClasses = hover
      ? "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-glass-border-light before:to-glass-border before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          interactionClasses,
          gradientBorderClasses,
          className
        )}
        {...props}
      >
        {/* Gradient border overlay */}
        {hover && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* Ripple effect container */}
        {animated && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="ripple-effect absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
