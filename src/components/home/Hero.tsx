import { useState, useEffect, useRef } from "react";
import SearchWidget from "./SearchWidget";
import DynamicBackground from "../hero/DynamicBackground";
import FloatingGlassElements from "../hero/FloatingElements";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];
  const heroRef = useRef<HTMLDivElement>(null);

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
      className="relative h-screen w-full overflow-hidden gpu-accelerated z-0"
    >
      {/* Dynamic Multi-Layer Background System (click-through) */}
      <div className="pointer-events-none">
        <DynamicBackground
          images={slideImages}
          currentIndex={currentSlide}
          transitionDuration={1000}
          enableTimeBasedShifting={true}
          enableScrollBasedShifting={true}
        />
      </div>

      {/* Floating Glass Elements (decorative, no pointer capture) */}
      <div className="pointer-events-none">
        <FloatingGlassElements isVisible={true} />
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-auto">
        {/* Title */}
        <div className="w-full mb-6">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mx-auto animate-fade-in-up"
            style={{
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              animationDelay: "0.2s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            {slides[currentSlide].title}
          </h1>
        </div>

        {/* Subtitle */}
        <div className="w-full mb-8">
          <p
            className="text-xl md:text-2xl text-white animate-fade-in-up"
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              animationDelay: "0.4s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            {t.hero.subtitle}
          </p>
        </div>

        {/* Search Widget */}
        <div
          className="w-full max-w-5xl mx-auto mb-8 animate-fade-in-up"
          style={{
            animationDelay: "0.6s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
          data-search-widget
        >
          <SearchWidget />
        </div>

        {/* CTA Button */}
        <div className="w-full mb-8">
          <button
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
            style={{
              animationDelay: "0.8s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
            onClick={() => {
              const searchWidget = document.querySelector(
                "[data-search-widget]"
              );
              if (searchWidget) {
                searchWidget.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }}
          >
            {t.hero.cta}
          </button>
        </div>

        {/* Slide Navigation Dots */}
        <div
          className="flex space-x-3 animate-fade-in-up"
          style={{
            animationDelay: "1s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8 shadow-lg"
                  : "bg-white/50 w-3 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom anchor for smooth scroll (kept for CTA) */}
      <div id="home-search-widget" data-hero-search className="sr-only" />
    </div>
  );
};

export default Hero;
