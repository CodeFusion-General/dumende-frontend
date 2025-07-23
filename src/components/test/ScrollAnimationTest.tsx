/**
 * Test component for scroll-based animation system
 */

import React from "react";
import {
  useScrollReveal,
  useParallax,
  useStaggerAnimation,
  useScrollCounter,
  useScrollProgress,
  useScrollTrigger,
} from "../../hooks/useScrollAnimation";

const ScrollAnimationTest: React.FC = () => {
  // Test scroll reveal
  const revealRef = useScrollReveal({
    animationClass: "animate-scroll-reveal",
    threshold: 0.2,
    triggerOnce: true,
  });

  // Test parallax
  const { ref: parallaxRef } = useParallax({
    speed: 0.5,
    direction: "up",
  });

  // Test stagger animation
  const { ref: staggerRef, trigger: triggerStagger } = useStaggerAnimation(
    ".stagger-item",
    150,
    "animate-fade-in-up"
  );

  // Test counter
  const { ref: counterRef } = useScrollCounter(
    0,
    100,
    2000,
    (value) => `${value}%`
  );

  // Test scroll progress
  const { ref: progressRef, progress } = useScrollProgress();

  // Test scroll trigger
  const { ref: triggerRef, isVisible } = useScrollTrigger(
    () => console.log("Element entered viewport"),
    () => console.log("Element left viewport")
  );

  return (
    <div className="scroll-animation-test min-h-screen bg-gradient-hero-primary">
      {/* Header with progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          ref={progressRef}
          className="h-full bg-gradient-ocean transition-transform duration-100 ease-out"
          style={{ transformOrigin: "left center" }}
        />
      </div>

      {/* Hero section with parallax background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute inset-0 bg-gradient-deep-sea opacity-50"
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-montserrat font-bold mb-4">
            Scroll Animation Test
          </h1>
          <p className="text-xl opacity-80">
            Demonstrating advanced scroll-based animations
          </p>
        </div>
      </section>

      {/* Scroll reveal section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={revealRef} className="glass-card p-8 text-center">
            <h2 className="text-4xl font-montserrat font-bold mb-6 text-gradient">
              Scroll Reveal Animation
            </h2>
            <p className="text-lg text-gray-700">
              This card animates into view when you scroll to it. The animation
              is triggered by an Intersection Observer and uses smooth CSS
              transitions.
            </p>
          </div>
        </div>
      </section>

      {/* Stagger animation section */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-montserrat font-bold text-center mb-12 text-gradient">
            Staggered Animations
          </h2>
          <div
            ref={staggerRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            data-stagger-container
            data-stagger-delay="150"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="stagger-item glass-card p-6 text-center animate-fade-in-up"
                data-stagger
              >
                <div className="w-16 h-16 bg-gradient-ocean rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{item}</span>
                </div>
                <h3 className="text-xl font-montserrat font-semibold mb-2">
                  Feature {item}
                </h3>
                <p className="text-gray-600">
                  This card animates in with a staggered delay of {item * 150}
                  ms.
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={triggerStagger} className="btn-glass-primary">
              Trigger Stagger Animation
            </button>
          </div>
        </div>
      </section>

      {/* Counter animation section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-montserrat font-bold mb-12 text-gradient">
            Animated Counters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8">
              <div
                ref={counterRef}
                className="text-5xl font-montserrat font-bold text-gradient mb-4"
                data-counter
                data-counter-start="0"
                data-counter-end="100"
                data-counter-duration="2000"
                data-counter-format="{value}%"
              >
                0%
              </div>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div className="glass-card p-8">
              <div
                className="text-5xl font-montserrat font-bold text-gradient mb-4"
                data-counter
                data-counter-start="0"
                data-counter-end="250"
                data-counter-duration="2500"
                data-counter-format="{value}+"
              >
                0+
              </div>
              <p className="text-gray-600">Happy Clients</p>
            </div>
            <div className="glass-card p-8">
              <div
                className="text-5xl font-montserrat font-bold text-gradient mb-4"
                data-counter
                data-counter-start="0"
                data-counter-end="50"
                data-counter-duration="1500"
                data-counter-format="{value}K"
              >
                0K
              </div>
              <p className="text-gray-600">Lines of Code</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax layers section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-sunset opacity-20"
          data-parallax
          data-parallax-speed="0.3"
          data-parallax-direction="up"
        />
        <div
          className="absolute inset-0 bg-gradient-ocean opacity-10"
          data-parallax
          data-parallax-speed="0.6"
          data-parallax-direction="down"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-montserrat font-bold mb-8 text-white">
            Multi-Layer Parallax
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Multiple background layers moving at different speeds create depth
            and visual interest.
          </p>
          <div className="glass-card p-8">
            <p className="text-lg">
              This content stays in place while the background layers move at
              different speeds, creating a beautiful parallax effect as you
              scroll.
            </p>
          </div>
        </div>
      </section>

      {/* Scroll trigger section */}
      <section className="py-20 px-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div
            ref={triggerRef}
            className={`glass-card p-8 transition-all duration-500 ${
              isVisible ? "scale-105 shadow-glow" : "scale-100"
            }`}
          >
            <h2 className="text-4xl font-montserrat font-bold mb-6 text-gradient">
              Scroll Trigger Detection
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              This card changes appearance when it enters the viewport.
            </p>
            <div
              className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                isVisible ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              {isVisible ? "Visible" : "Hidden"}
            </div>
          </div>
        </div>
      </section>

      {/* Data attributes examples */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-montserrat font-bold text-center mb-12 text-gradient">
            Data Attribute Animations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="glass-card p-6"
              data-scroll-reveal
              data-animation="fade-in-up"
              data-threshold="0.3"
            >
              <h3 className="text-xl font-semibold mb-4">Fade In Up</h3>
              <p>Animates from bottom with fade effect.</p>
            </div>
            <div
              className="glass-card p-6"
              data-scroll-reveal
              data-animation="fade-in-left"
              data-threshold="0.3"
            >
              <h3 className="text-xl font-semibold mb-4">Fade In Left</h3>
              <p>Slides in from the left side.</p>
            </div>
            <div
              className="glass-card p-6"
              data-scroll-reveal
              data-animation="scale-in"
              data-threshold="0.3"
            >
              <h3 className="text-xl font-semibold mb-4">Scale In</h3>
              <p>Scales up from smaller size.</p>
            </div>
            <div
              className="glass-card p-6"
              data-scroll-reveal
              data-animation="rotate-in"
              data-threshold="0.3"
            >
              <h3 className="text-xl font-semibold mb-4">Rotate In</h3>
              <p>Rotates and scales into view.</p>
            </div>
            <div
              className="glass-card p-6"
              data-scroll-reveal
              data-animation="glass-reveal"
              data-threshold="0.3"
            >
              <h3 className="text-xl font-semibold mb-4">Glass Reveal</h3>
              <p>Reveals with glassmorphism effect.</p>
            </div>
            <div
              className="glass-card p-6"
              data-scroll-reveal
              data-animation="glow-reveal"
              data-threshold="0.3"
            >
              <h3 className="text-xl font-semibold mb-4">Glow Reveal</h3>
              <p>Appears with a glowing effect.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress indicator at bottom */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-montserrat font-bold mb-8 text-gradient">
            Scroll Progress: {progress.toFixed(1)}%
          </h2>
          <p className="text-lg text-gray-600">
            The progress bar at the top shows how far you've scrolled through
            this page.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ScrollAnimationTest;
