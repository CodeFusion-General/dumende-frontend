import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);

      // Start exit animation
      const exitTimer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 200); // Half of transition duration

      return () => clearTimeout(exitTimer);
    }
  }, [location, displayLocation]);

  return (
    <div className="page-transition-container">
      <div
        className={`page-transition-content ${
          isTransitioning ? "page-exit" : "page-enter"
        }`}
        key={displayLocation.pathname}
      >
        {children}
      </div>
    </div>
  );
};

export const GlassPageTransition: React.FC<PageTransitionProps> = ({
  children,
}) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="glass-page-transition-container">
      <div
        className={`glass-page-transition-content ${
          isTransitioning ? "glass-page-enter" : ""
        }`}
        key={location.pathname}
      >
        {children}
      </div>
    </div>
  );
};

// Loading overlay component
export const PageLoadingOverlay: React.FC<{ isLoading: boolean }> = ({
  isLoading,
}) => {
  if (!isLoading) return null;

  return (
    <div className="page-loading-overlay">
      <div className="page-loading-content">
        <div className="glass-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

// Route transition wrapper
export const RouteTransitionWrapper: React.FC<
  PageTransitionProps & {
    variant?: "default" | "glass" | "slide" | "fade";
  }
> = ({ children, variant = "default" }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getTransitionClass = () => {
    switch (variant) {
      case "glass":
        return "route-transition-glass";
      case "slide":
        return "route-transition-slide";
      case "fade":
        return "route-transition-fade";
      default:
        return "route-transition-default";
    }
  };

  return (
    <>
      <PageLoadingOverlay isLoading={isLoading} />
      <div className={`route-wrapper ${getTransitionClass()}`}>
        <div className="route-content animate-fade-in-up">{children}</div>
      </div>
    </>
  );
};

export default PageTransition;
