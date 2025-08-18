/**
 * Example component demonstrating mobile CSS optimization features
 */

import React, { useRef, useEffect, useState } from "react";
import {
  useMobileCSSOptimization,
  useAnimationOptimization,
  useResponsiveCSS,
} from "../hooks/useMobileCSSOptimization";

const COMPONENT_CRITICAL_CSS = `
  .mobile-css-example {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    color: white;
    margin: 1rem 0;
  }

  .mobile-css-example h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .mobile-css-example .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .mobile-css-example .feature-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 4px;
    backdrop-filter: blur(10px);
  }

  .mobile-css-example .animation-demo {
    width: 100px;
    height: 100px;
    background: #ff6b6b;
    border-radius: 50%;
    margin: 1rem auto;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .mobile-css-example .animation-demo:hover {
    transform: scale(1.1);
  }

  .mobile-css-example .animation-demo.animate {
    animation: bounce 1s ease-in-out;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  .mobile-css-example .responsive-image-demo {
    margin: 1rem 0;
  }

  .mobile-css-example .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .mobile-css-example button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .mobile-css-example button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .mobile-css-example .status {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    border-radius: 4px;
    margin: 0.5rem 0;
    font-family: monospace;
    font-size: 0.875rem;
  }
`;

export const MobileCSSOptimizationExample: React.FC = () => {
  const animationRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cssLoadStatus, setCssLoadStatus] = useState<string>("");

  // Use mobile CSS optimization hooks
  const {
    animationConfig,
    shouldReduceMotion,
    maxAnimationDuration,
    loadNonCriticalCSS,
    preloadCSS,
    cleanupAnimationProperties,
    updateAnimationConfig,
    getAnimationClasses,
    getResponsiveImageClasses,
  } = useMobileCSSOptimization({
    enableCriticalCSS: true,
    enableAnimationOptimization: true,
    componentName: "MobileCSSOptimizationExample",
    criticalCSS: COMPONENT_CRITICAL_CSS,
  });

  const animationOptimization = useAnimationOptimization();
  const responsiveCSS = useResponsiveCSS();

  // Trigger animation
  const handleAnimate = () => {
    if (animationRef.current && !isAnimating) {
      setIsAnimating(true);
      animationRef.current.classList.add("animate");

      setTimeout(() => {
        if (animationRef.current) {
          animationRef.current.classList.remove("animate");
          cleanupAnimationProperties(animationRef.current);
        }
        setIsAnimating(false);
      }, maxAnimationDuration);
    }
  };

  // Load non-critical CSS
  const handleLoadNonCriticalCSS = async () => {
    setCssLoadStatus("Loading...");
    try {
      // Simulate loading a non-critical stylesheet
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCssLoadStatus("Loaded successfully!");
    } catch (error) {
      setCssLoadStatus("Failed to load");
    }
  };

  // Preload CSS
  const handlePreloadCSS = () => {
    preloadCSS("/styles/non-critical.css");
    setCssLoadStatus("Preloading initiated");
  };

  // Toggle reduced motion
  const handleToggleReducedMotion = () => {
    updateAnimationConfig({
      enableReducedMotion: !animationConfig.enableReducedMotion,
    });
  };

  // Toggle hardware acceleration
  const handleToggleHardwareAcceleration = () => {
    updateAnimationConfig({
      enableHardwareAcceleration: !animationConfig.enableHardwareAcceleration,
    });
  };

  return (
    <div className="mobile-css-example">
      <h2>Mobile CSS Optimization Demo</h2>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>Critical CSS</h3>
          <p>This component's critical CSS is inlined for faster rendering.</p>
          <div className="status">Critical CSS: ✅ Inlined</div>
        </div>

        <div className="feature-card">
          <h3>Animation Optimization</h3>
          <p>
            Animations are optimized based on user preferences and device
            capabilities.
          </p>
          <div className="status">
            Reduced Motion: {shouldReduceMotion ? "✅ Enabled" : "❌ Disabled"}
            <br />
            Max Duration: {maxAnimationDuration}ms
            <br />
            Hardware Acceleration:{" "}
            {animationConfig.enableHardwareAcceleration
              ? "✅ Enabled"
              : "❌ Disabled"}
          </div>
        </div>

        <div className="feature-card">
          <h3>Responsive Loading</h3>
          <p>
            CSS is loaded progressively based on viewport and device
            capabilities.
          </p>
          <div className="status">
            Loaded Stylesheets: {responsiveCSS.loadedStylesheets.length}
            <br />
            Status: {cssLoadStatus || "Ready"}
          </div>
        </div>

        <div className="feature-card">
          <h3>Performance Classes</h3>
          <p>Automatic CSS classes for performance optimization.</p>
          <div className="status">
            Animation Classes: {getAnimationClasses()}
            <br />
            Image Classes: {getResponsiveImageClasses("16-9")}
          </div>
        </div>
      </div>

      <div className="animation-demo-section">
        <h3>Animation Demo</h3>
        <div
          ref={animationRef}
          className={`animation-demo ${getAnimationClasses()}`}
          onClick={handleAnimate}
        />
        <p>Click the circle to see optimized animations in action</p>
      </div>

      <div className="responsive-image-demo">
        <h3>Responsive Image Demo</h3>
        <div className={getResponsiveImageClasses("16-9")}>
          <img
            src="https://via.placeholder.com/800x450/667eea/ffffff?text=Responsive+Image"
            alt="Responsive demo"
            loading="lazy"
            className="image-blur-up"
          />
        </div>
      </div>

      <div className="controls">
        <button onClick={handleAnimate} disabled={isAnimating}>
          {isAnimating ? "Animating..." : "Trigger Animation"}
        </button>

        <button onClick={handleToggleReducedMotion}>
          {shouldReduceMotion ? "Enable" : "Disable"} Motion
        </button>

        <button onClick={handleToggleHardwareAcceleration}>
          {animationConfig.enableHardwareAcceleration ? "Disable" : "Enable"}{" "}
          GPU
        </button>

        <button onClick={handleLoadNonCriticalCSS}>
          Load Non-Critical CSS
        </button>

        <button onClick={handlePreloadCSS}>Preload CSS</button>
      </div>

      <div className="status">
        <strong>Current Configuration:</strong>
        <br />
        {JSON.stringify(animationConfig, null, 2)}
      </div>
    </div>
  );
};

export default MobileCSSOptimizationExample;
