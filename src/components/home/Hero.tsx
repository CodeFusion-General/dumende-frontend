
import React, { useState, useEffect } from 'react';
import SearchWidget from './SearchWidget';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];
  
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?q=80&w=1920&auto=format&fit=crop',
      title: t.hero.slides.luxuryYacht
    },
    {
      image: 'https://images.unsplash.com/photo-1520645521318-f03a712f0e67?q=80&w=1920&auto=format&fit=crop',
      title: t.hero.slides.privateTours
    },
    {
      image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=1920&auto=format&fit=crop',
      title: t.hero.slides.dailyBoatTrips
    },
    {
      image: 'https://images.unsplash.com/photo-1586456074778-f3825fde4a70?q=80&w=1920&auto=format&fit=crop',
      title: t.hero.slides.corporateEvents
    },
    {
      image: 'https://images.unsplash.com/photo-1595351475754-8a520df0c350?q=80&w=1920&auto=format&fit=crop',
      title: t.hero.slides.specialCelebrations
    }
  ];
  
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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out
            ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <div 
            className="w-full h-full bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        </div>
      ))}
      
      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mx-auto mb-6">
          {slides[currentSlide].title}
        </h1>
        <p className="emphasized-text text-xl md:text-2xl text-white mb-8">
          {t.hero.subtitle}
        </p>
        <button className="btn-accent text-lg mb-12">
          {t.hero.cta}
        </button>
        
        {/* Dots Navigation */}
        <div className="flex space-x-3 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300
                ${index === currentSlide ? 'bg-accent w-6' : 'bg-white bg-opacity-50'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Search Widget */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SearchWidget />
        </div>
      </div>
    </div>
  );
};

export default Hero;
