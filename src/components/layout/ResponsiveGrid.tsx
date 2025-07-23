import React, { ReactNode } from "react";
import { useResponsiveAnimations } from "@/hooks/useResponsiveAnimations";

interface ResponsiveGridProps {
  children: ReactNode;
  variant?: "auto" | "fixed" | "masonry" | "sidebar" | "dashboard";
  spacing?: "compact" | "normal" | "spacious";
  className?: string;
}

interface ResponsiveCardProps {
  children: ReactNode;
  size?: "small" | "normal" | "large" | "hero";
  className?: string;
}

interface ResponsiveContainerProps {
  children: ReactNode;
  variant?: "optimized" | "full" | "fluid";
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  variant = "auto",
  spacing = "normal",
  className = "",
}) => {
  const { viewport, getResponsiveClass, getFluidTransition } =
    useResponsiveAnimations();

  const getGridClasses = () => {
    const baseClass = "grid-modern";
    let variantClasses = "";

    switch (variant) {
      case "auto":
        if (viewport.isMobile) {
          variantClasses = "grid-template-columns: 1fr;";
        } else if (viewport.isTablet) {
          variantClasses = "grid-tablet-auto";
        } else {
          variantClasses = "grid-desktop-auto";
        }
        break;
      case "fixed":
        if (viewport.isMobile) {
          variantClasses = "grid-template-columns: 1fr;";
        } else if (viewport.isTablet) {
          variantClasses = "grid-tablet-3";
        } else if (viewport.width >= 1280) {
          variantClasses = "grid-xl-4";
        } else {
          variantClasses = "grid-desktop-4";
        }
        break;
      case "masonry":
        if (viewport.isTablet) {
          variantClasses = "grid-tablet-masonry";
        } else if (viewport.isDesktop) {
          variantClasses = "grid-desktop-masonry";
        }
        break;
      case "sidebar":
        if (viewport.isTablet) {
          variantClasses = "grid-tablet-sidebar";
        } else if (viewport.isDesktop) {
          variantClasses = "grid-desktop-sidebar";
        }
        break;
      case "dashboard":
        if (viewport.isDesktop) {
          variantClasses = "grid-desktop-dashboard";
        }
        break;
    }

    const spacingClass =
      spacing === "compact"
        ? "gap-4"
        : spacing === "spacious"
        ? "card-grid-spacing gap-8"
        : "card-grid-spacing";

    return getResponsiveClass(
      `${baseClass} ${variantClasses} ${spacingClass}`,
      {
        sm: "grid-fluid-2",
        md: "grid-fluid-3",
        lg: "grid-desktop-4",
        xl: "grid-xl-5",
      }
    );
  };

  const gridStyle = {
    ...getFluidTransition("grid-template-columns, gap"),
  };

  return (
    <div
      className={`${getGridClasses()} ${className} grid-performance`}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  size = "normal",
  className = "",
}) => {
  const { viewport, getResponsiveClass, getFluidTransition, getGlassEffect } =
    useResponsiveAnimations();

  const getCardClasses = () => {
    const baseClass = "card-adaptive";
    const sizeClass = size !== "normal" ? `card-adaptive-${size}` : "";

    return getResponsiveClass(`${baseClass} ${sizeClass}`, {
      sm: "hover:shadow-lg",
      md: "hover:shadow-xl",
      lg: "hover:shadow-2xl",
    });
  };

  const cardStyle = {
    ...getFluidTransition("padding, border-radius, box-shadow"),
    ...getGlassEffect(viewport.isMobile ? "light" : "medium"),
  };

  return (
    <div
      className={`${getCardClasses()} ${className} animate-hover-lift orientation-smooth`}
      style={cardStyle}
    >
      {children}
    </div>
  );
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  variant = "optimized",
  className = "",
}) => {
  const { getResponsiveClass, getFluidTransition } = useResponsiveAnimations();

  const getContainerClasses = () => {
    const baseClass =
      variant === "optimized"
        ? "container-optimized"
        : variant === "full"
        ? "container-full"
        : "container-fluid";

    return getResponsiveClass(baseClass, {
      sm: "px-6",
      md: "px-8",
      lg: "px-12",
      xl: "px-16",
    });
  };

  const containerStyle = {
    ...getFluidTransition("padding, max-width"),
  };

  return (
    <div
      className={`${getContainerClasses()} ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

// Layout components for specific use cases
export const SidebarLayout: React.FC<{
  sidebar: ReactNode;
  main: ReactNode;
  className?: string;
}> = ({ sidebar, main, className = "" }) => {
  const { viewport, getFluidTransition } = useResponsiveAnimations();

  const layoutStyle = {
    ...getFluidTransition("grid-template-columns, gap"),
  };

  return (
    <div
      className={`layout-sidebar orientation-smooth ${className}`}
      style={layoutStyle}
    >
      <main className="order-2 md:order-1">{main}</main>
      <aside className="order-1 md:order-2">{sidebar}</aside>
    </div>
  );
};

export const DashboardLayout: React.FC<{
  sidebar?: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}> = ({ sidebar, main, rightPanel, className = "" }) => {
  const { viewport, getFluidTransition } = useResponsiveAnimations();

  const layoutStyle = {
    ...getFluidTransition("grid-template-columns, gap"),
  };

  if (viewport.isMobile) {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {sidebar && <aside className="order-1">{sidebar}</aside>}
        <main className="order-2">{main}</main>
        {rightPanel && <aside className="order-3">{rightPanel}</aside>}
      </div>
    );
  }

  return (
    <div
      className={`layout-dashboard orientation-smooth ${className}`}
      style={layoutStyle}
    >
      {sidebar && <aside className="dashboard-sidebar">{sidebar}</aside>}
      <main className="dashboard-main">{main}</main>
      {rightPanel && <aside className="dashboard-right">{rightPanel}</aside>}
    </div>
  );
};

// Orientation-aware component
export const OrientationAware: React.FC<{
  portrait: ReactNode;
  landscape: ReactNode;
  className?: string;
}> = ({ portrait, landscape, className = "" }) => {
  const { viewport } = useResponsiveAnimations();

  return (
    <div className={`orientation-smooth ${className}`}>
      <div className={viewport.orientation === "portrait" ? "block" : "hidden"}>
        {portrait}
      </div>
      <div
        className={viewport.orientation === "landscape" ? "block" : "hidden"}
      >
        {landscape}
      </div>
    </div>
  );
};

// Performance-optimized grid for large datasets
export const PerformanceGrid: React.FC<{
  children: ReactNode;
  itemCount: number;
  className?: string;
}> = ({ children, itemCount, className = "" }) => {
  const { viewport, isAnimationEnabled } = useResponsiveAnimations();

  // Reduce complexity for large datasets on mobile
  const shouldSimplify = viewport.isMobile && itemCount > 20;
  const optimizationClass = shouldSimplify
    ? "mobile-simplified"
    : "large-screen-optimized";

  return (
    <div
      className={`grid-modern grid-performance ${optimizationClass} ${className}`}
      style={{
        contain: "layout style paint",
        willChange: isAnimationEnabled ? "transform" : "auto",
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
