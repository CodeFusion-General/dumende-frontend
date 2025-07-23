import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { createRippleEffect, createGlassRippleEffect } from "@/lib/animations";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden gpu-accelerated animate-button-press",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-primary/50 focus-visible:ring-4 focus-visible:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-destructive/50 focus-visible:ring-4 focus-visible:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-accent/50 focus-visible:ring-4 focus-visible:shadow-[0_0_15px_rgba(0,0,0,0.1)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-secondary/50 focus-visible:ring-4",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-accent/50 focus-visible:ring-4",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-primary/50 focus-visible:ring-2",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-white/50 focus-visible:ring-4 focus-visible:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        default: "",
        ripple: "animate-ripple",
        pulse: "animate-pulse-glow",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  enableRipple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      enableRipple = true,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        // Create ripple effect if enabled and not disabled
        if (enableRipple && !props.disabled && event.currentTarget) {
          if (variant === "glass") {
            createGlassRippleEffect(event.currentTarget, event.nativeEvent);
          } else {
            createRippleEffect(event.currentTarget, event.nativeEvent);
          }
        }

        // Call original onClick handler
        onClick?.(event);
      },
      [enableRipple, props.disabled, onClick, variant]
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
