import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Compass, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { createRippleEffect } from "@/lib/animations";

interface NoResultsProps {
  onReset: () => void;
  searchQuery?: string;
  hasActiveFilters?: boolean;
}

const NoResults: React.FC<NoResultsProps> = ({
  onReset,
  searchQuery,
  hasActiveFilters = false,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRippleEffect(e.currentTarget, e.nativeEvent);
    onReset();
  };

  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: <Search className="w-20 h-20 text-white/40 animate-float" />,
        title: `"${searchQuery}" ${t.boats.noResults.noResultsFor}`,
        description: t.boats.noResults.searchDescription,
        buttonText: t.boats.noResults.clearSearch,
      };
    }

    if (hasActiveFilters) {
      return {
        icon: <Filter className="w-20 h-20 text-white/40 animate-float" />,
        title: t.boats.noResults.title,
        description: t.boats.noResults.filterDescription,
        buttonText: t.boats.noResults.clearFilters,
      };
    }

    return {
      icon: <Compass className="w-20 h-20 text-white/40 animate-float" />,
      title: t.boats.noResults.noBoatsAvailable,
      description: t.boats.noResults.noBoatsAvailableDescription,
      buttonText: t.boats.noResults.refresh,
    };
  };

  const content = getEmptyStateContent();

  return (
    <div
      className={`text-center py-16 transition-all duration-1000 ease-glass ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="glass-card bg-white/5 backdrop-blur-lg rounded-3xl p-12 max-w-md mx-auto border border-white/10">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Icon */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            {content.icon}
          </div>

          {/* Title with gradient text */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h3 className="text-2xl font-bold text-gradient mb-2">
              {content.title}
            </h3>
          </div>

          {/* Description */}
          <div
            className={`transition-all duration-700 delay-600 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              {content.description}
            </p>
          </div>

          {/* Action Button */}
          <div
            className={`transition-all duration-700 delay-800 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <button
              onClick={handleResetClick}
              className="glass-button bg-gradient-sunset px-8 py-3 rounded-xl font-semibold text-gray-900 hover:scale-105 transition-all duration-300 animate-ripple flex items-center space-x-2 shadow-lg"
            >
              <RefreshCw size={18} />
              <span>{content.buttonText}</span>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full animate-glow-pulse"></div>
            <div
              className="absolute bottom-8 left-6 w-1 h-1 bg-white/30 rounded-full animate-glow-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-white/25 rounded-full animate-glow-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Suggestions for better search */}
      {searchQuery && (
        <div
          className={`mt-8 transition-all duration-700 delay-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="glass-card bg-white/5 backdrop-blur-lg rounded-2xl p-6 max-w-lg mx-auto border border-white/10">
            <h4 className="text-white/90 font-semibold mb-4">
              {t.boats.noResults.searchSuggestions}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-white/70">
                • {t.boats.noResults.suggestionsList.useGeneralTerms}
              </div>
              <div className="text-white/70">
                • {t.boats.noResults.suggestionsList.checkTypos}
              </div>
              <div className="text-white/70">
                • {t.boats.noResults.suggestionsList.reduceFilters}
              </div>
              <div className="text-white/70">
                • {t.boats.noResults.suggestionsList.tryDifferentLocation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoResults;
