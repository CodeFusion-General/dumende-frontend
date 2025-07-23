import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { smoothScrollTo } from "@/lib/animations";

interface ScrollToTopProps {
  threshold?: number;
  variant?: "default" | "glass" | "minimal";
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  showProgress?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  variant = "glass",
  position = "bottom-right",
  showProgress = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;

      setIsVisible(scrolled > threshold);
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    smoothScrollTo(document.body, 500);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-6 left-6";
      case "bottom-center":
        return "bottom-6 left-1/2 transform -translate-x-1/2";
      default:
        return "bottom-6 right-6";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl";
      case "minimal":
        return "bg-white/90 text-gray-700 hover:bg-white shadow-md hover:shadow-lg border border-gray-200";
      default:
        return "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]";
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-50 w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-300 ease-out
        transform hover:scale-110 active:scale-95
        animate-fade-in-up gpu-accelerated
        ${getPositionClasses()}
        ${getVariantClasses()}
      `}
      aria-label="Scroll to top"
    >
      {/* Progress ring */}
      {showProgress && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          <path
            className="stroke-current opacity-20"
            strokeWidth="2"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="stroke-current transition-all duration-300 ease-out"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${scrollProgress}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      )}

      {/* Arrow icon */}
      <ChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};

// Glass skeleton loading component
export const GlassSkeleton: React.FC<{
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
}> = ({ className = "", variant = "text" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "card":
        return "h-32 w-full rounded-lg";
      case "avatar":
        return "h-12 w-12 rounded-full";
      case "button":
        return "h-10 w-24 rounded-md";
      default:
        return "h-4 w-full rounded";
    }
  };

  return (
    <div
      className={`
        bg-white/10 backdrop-blur-sm border border-white/20
        animate-shimmer
        ${getVariantClasses()}
        ${className}
      `}
    />
  );
};

// Glass skeleton group for complex layouts
export const GlassSkeletonGroup: React.FC<{
  variant?: "card" | "list" | "grid";
  count?: number;
}> = ({ variant = "card", count = 3 }) => {
  const renderCardSkeleton = () => (
    <div className="space-y-4">
      <GlassSkeleton variant="card" />
      <div className="space-y-2">
        <GlassSkeleton className="h-4 w-3/4" />
        <GlassSkeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <GlassSkeleton variant="button" />
        <GlassSkeleton variant="button" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="flex items-center space-x-4">
      <GlassSkeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <GlassSkeleton className="h-4 w-3/4" />
        <GlassSkeleton className="h-3 w-1/2" />
      </div>
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-delay-100"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {renderCardSkeleton()}
        </div>
      ))}
    </div>
  );

  if (variant === "grid") {
    return renderGridSkeleton();
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {variant === "list" ? renderListSkeleton() : renderCardSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default ScrollToTop;
