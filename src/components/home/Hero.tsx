import React, { useState, useEffect, useRef } from "react";
import SearchWidget from "./SearchWidget";
import DynamicBackground from "../hero/DynamicBackground";
import FloatingGlassElements from "../hero/FloatingElements";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { useParallax } from "@/hooks/useScrollAnimation";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax refs for different content layers
  const { ref: titleRef } = useParallax({ speed: 0.2, direction: "up" });
  const { ref: subtitleRef } = useParallax({ speed: 0.3, direction: "up" });
  const { ref: ctaRef } = useParallax({ speed: 0.1, direction: "up" });

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1540946485063-a40da27545f8?q=80&w=1920&auto=format&fit=crop",
      title: t.hero.slides.luxuryYacht,
    },
    {
      image:
        "https://images.unsplash.com/photo-1520645521318-f03a712f0e67?q=80&w=1920&auto=format&fit=crop",
      title: t.hero.slides.privateTours,
    },
    {
      image:
        "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=1920&auto=format&fit=crop",
      title: t.hero.slides.dailyBoatTrips,
    },
    {
      image:
        "https://images.unsplash.com/photo-1586456074778-f3825fde4a70?q=80&w=1920&auto=format&fit=crop",
      title: t.hero.slides.corporateEvents,
    },
    {
      image:
        "https://images.unsplash.com/photo-1595351475754-8a520df0c350?q=80&w=1920&auto=format&fit=crop",
      title: t.hero.slides.specialCelebrations,
    },
  ];

  // Extract images for the background component
  const slideImages = slides.map((slide) => slide.image);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Manual slide change
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden gpu-accelerated"
    >
      {/* Dynamic Multi-Layer Background System */}
      <DynamicBackground
        images={slideImages}
        currentIndex={currentSlide}
        transitionDuration={1000}
        enableTimeBasedShifting={true}
        enableScrollBasedShifting={true}
      />

      {/* Floating Glass Elements */}
      <FloatingGlassElements isVisible={true} />

      {/* Hero Content with Enhanced Animations and Parallax */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white max-w-4xl mx-auto mb-6 animate-fade-in-up parallax-float"
          style={{
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            animationDelay: "0.2s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {slides[currentSlide].title}
        </h1>

        <p
          ref={subtitleRef}
          className="emphasized-text text-xl md:text-2xl text-white mb-8 animate-fade-in-up parallax-float"
          style={{
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            animationDelay: "0.4s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {t.hero.subtitle}
        </p>

        <button
          ref={ctaRef}
          className="btn-glass-accent text-lg mb-12 animate-scale-in-bounce animate-hover-lift parallax-float"
          style={{
            animationDelay: "0.6s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {t.hero.cta}
        </button>

        {/* Enhanced Dots Navigation with Glass Effect */}
        <div
          className="flex space-x-3 mt-6 animate-fade-in-up"
          style={{
            animationDelay: "0.8s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 glass-button animate-hover-scale
                ${
                  index === currentSlide
                    ? "bg-gradient-ocean w-6 shadow-lg"
                    : "bg-white bg-opacity-30 w-3 backdrop-blur-sm"
                }`}
              style={{
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Search Widget with Glass Effect */}
      <div
        className="absolute bottom-8 left-0 right-0 z-20 px-4 animate-slide-in-bottom"
        style={{
          animationDelay: "1s",
          opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <SearchWidget />
        </div>
      </div>
    </div>
  );
};

export default Hero;
