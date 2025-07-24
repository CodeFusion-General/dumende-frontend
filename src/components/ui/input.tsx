import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "glass" | "floating";
  hasError?: boolean;
  isValid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, variant = "default", hasError, isValid, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        props.onFocus?.(e);
      },
      [props]
    );

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(e.target.value.length > 0);
        props.onBlur?.(e);
      },
      [props]
    );

    const baseClasses =
      "flex h-10 w-full rounded-md text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 gpu-accelerated";

    const variantClasses = {
      default: cn(
        "border border-input bg-background px-3 py-2 ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:border-ring/50 hover:shadow-sm",
        hasError &&
          "border-destructive focus-visible:ring-destructive animate-shake",
        isValid &&
          "border-green-500 focus-visible:ring-green-500 focus-visible:shadow-[0_0_10px_rgba(34,197,94,0.2)]"
      ),
      glass: cn(
        "border border-white/20 bg-white/10 backdrop-blur-md px-3 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0",
        "focus-visible:bg-white/20 focus-visible:shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
        "hover:bg-white/15 hover:border-white/30",
        "text-white placeholder:text-white/70",
        hasError &&
          "border-red-400/50 focus-visible:ring-red-400/50 animate-shake",
        isValid &&
          "border-green-400/50 focus-visible:ring-green-400/50 focus-visible:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
      ),
      floating: cn(
        "border-0 border-b-2 border-input bg-transparent px-0 py-2 rounded-none",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-0",
        "hover:border-ring/50",
        hasError &&
          "border-destructive focus-visible:border-destructive animate-shake",
        isValid && "border-green-500 focus-visible:border-green-500"
      ),
    };

    const focusClasses = cn(
      isFocused && "scale-[1.01]",
      variant === "glass" &&
        isFocused &&
        "shadow-[0_0_20px_rgba(255,255,255,0.1)]"
    );

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            baseClasses,
            variantClasses[variant],
            focusClasses,
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Floating label for floating variant */}
        {variant === "floating" && props.placeholder && (
          <label
            className={cn(
              "absolute left-0 transition-all duration-300 pointer-events-none",
              "text-muted-foreground",
              isFocused || hasValue
                ? "top-0 text-xs -translate-y-4 text-ring"
                : "top-2 text-base"
            )}
          >
            {props.placeholder}
          </label>
        )}

        {/* Validation icons */}
        {(hasError || isValid) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && (
              <svg
                className="w-4 h-4 text-destructive animate-pulse"
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
            {isValid && (
              <svg
                className="w-4 h-4 text-green-500 animate-scale-in"
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
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
