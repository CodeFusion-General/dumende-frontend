import React, { useMemo } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { boatTypes, locations, features } from "@/data/boats";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { BoatDTO } from "@/types/boat.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

interface OpenSections {
  boatType: boolean;
  priceRange: boolean;
  capacity: boolean;
  features: boolean;
  location: boolean;
  date: boolean;
}

interface FilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  capacity: string;
  setCapacity: (capacity: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  openSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  allBoats: BoatDTO[];
  filteredCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  showFilters,
  setShowFilters,
  selectedTypes,
  setSelectedTypes,
  selectedLocations,
  setSelectedLocations,
  selectedFeatures,
  setSelectedFeatures,
  priceRange,
  setPriceRange,
  capacity,
  setCapacity,
  openSections,
  toggleSection,
  resetFilters,
  applyFilters,
  allBoats,
  filteredCount,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  // Tekne tipi mapping (backend enum → frontend display)
  const getTypeDisplayName = (type: string): string => {
    return (
      t.pages.boats.filters.types[
        type as keyof typeof t.pages.boats.filters.types
      ] || type
    );
  };

  // Özellik mapping
  const getFeatureDisplayName = (feature: string): string => {
    return (
      t.pages.boats.filters.featuresList[
        feature as keyof typeof t.pages.boats.filters.featuresList
      ] || feature
    );
  };

  // Kapasite mapping
  const getCapacityDisplayName = (capacity: string): string => {
    return (
      t.pages.boats.filters.capacityRanges[
        capacity as keyof typeof t.pages.boats.filters.capacityRanges
      ] || capacity
    );
  };

  // *** PERFORMANCE OPTIMIZED DYNAMIC FILTERS ***

  // Dinamik tekne tipleri (memoized for performance)
  const availableBoatTypes = useMemo(() => {
    const typeSet = new Set<string>();
    allBoats.forEach((boat) => {
      if (boat.type) {
        typeSet.add(boat.type);
      }
    });

    return Array.from(typeSet)
      .map((type) => ({
        value: type,
        label: getTypeDisplayName(type),
        count: allBoats.filter((boat) => boat.type === type).length,
      }))
      .sort((a, b) => b.count - a.count); // En çok teknesi olan tip önce
  }, [allBoats]);

  // Dinamik lokasyonlar (memoized for performance)
  const availableLocations = useMemo(() => {
    const locationSet = new Set<string>();
    allBoats.forEach((boat) => {
      if (boat.location) {
        locationSet.add(boat.location);
      }
    });

    return Array.from(locationSet)
      .map((location) => ({
        value: location,
        label: location,
        count: allBoats.filter((boat) => boat.location === location).length,
      }))
      .sort((a, b) => b.count - a.count); // En çok teknesi olan lokasyon önce
  }, [allBoats]);

  // Dinamik özellikler (memoized for performance)
  const availableFeatures = useMemo(() => {
    const featureSet = new Set<string>();
    allBoats.forEach((boat) => {
      if (boat.features && Array.isArray(boat.features)) {
        boat.features.forEach((feature) => {
          if (feature.featureName) {
            featureSet.add(feature.featureName);
          }
        });
      }
    });

    return Array.from(featureSet)
      .map((feature) => ({
        value: feature,
        label: getFeatureDisplayName(feature),
        count: allBoats.filter((boat) =>
          boat.features?.some((f) => f.featureName === feature)
        ).length,
      }))
      .sort((a, b) => b.count - a.count); // En çok kullanılan özellik önce
  }, [allBoats]);

  // Dinamik fiyat aralığı (memoized for performance)
  const priceRange_min_max = useMemo(() => {
    if (allBoats.length === 0) {
      return { min: 500, max: 30000 };
    }

    const prices = allBoats
      .map((boat) => boat.dailyPrice)
      .filter((price) => price && price > 0);

    if (prices.length === 0) {
      return { min: 500, max: 30000 };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Slider için uygun step hesaplama
    const range = maxPrice - minPrice;
    const step =
      range > 100000 ? 5000 : range > 50000 ? 2000 : range > 10000 ? 1000 : 500;

    return {
      min: Math.floor(minPrice / step) * step,
      max: Math.ceil(maxPrice / step) * step,
      step,
    };
  }, [allBoats]);

  // Dinamik kapasite aralıkları
  const availableCapacityRanges = useMemo(() => {
    if (allBoats.length === 0) {
      return ["1-6", "7-12", "13-20", "20+"];
    }

    const capacities = allBoats
      .map((boat) => boat.capacity)
      .filter((cap) => cap && cap > 0);

    if (capacities.length === 0) {
      return ["1-6", "7-12", "13-20", "20+"];
    }

    const maxCapacity = Math.max(...capacities);

    // Dinamik kapasite aralıkları oluştur
    const ranges = ["1-6", "7-12", "13-20"];
    if (maxCapacity > 20) {
      ranges.push("20+");
    }
    if (maxCapacity > 50) {
      ranges.push("50+");
    }
    if (maxCapacity > 100) {
      ranges.push("100+");
    }

    return ranges;
  }, [allBoats]);

  const toggleBoatType = (value: string) => {
    if (selectedTypes.includes(value)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== value));
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const toggleLocation = (value: string) => {
    if (selectedLocations.includes(value)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== value));
    } else {
      setSelectedLocations([...selectedLocations, value]);
    }
  };

  const toggleFeature = (value: string) => {
    if (selectedFeatures.includes(value)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== value));
    } else {
      setSelectedFeatures([...selectedFeatures, value]);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  return (
    <div
      className={`${
        showFilters ? "block animate-slide-in-glass" : "hidden"
      } md:block w-full md:w-80 glass-card bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 h-fit transition-all duration-500 ease-glass`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-white/80" />
          <h3 className="text-lg font-semibold text-white">
            {t.pages.boats.filters.title}
          </h3>
        </div>
        <button
          onClick={resetFilters}
          className="glass-button px-3 py-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
        >
          {t.pages.boats.filters.clear}
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="md:hidden glass-button p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Tekne Türü */}
        <Collapsible
          open={openSections.boatType}
          onOpenChange={() => toggleSection("boatType")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-300">
            <span className="font-medium text-white/90">
              {t.pages.boats.filters.type}
            </span>
            {openSections.boatType ? (
              <ChevronUp className="w-4 h-4 text-white/70 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/70 transition-transform duration-300" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 animate-fade-in-up">
            {availableBoatTypes.map((boatType, index) => (
              <div
                key={boatType.value}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <label
                  className="flex items-center space-x-3 cursor-pointer text-white/80 hover:text-white transition-colors duration-200"
                  onClick={() => toggleBoatType(boatType.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(boatType.value)}
                    onChange={() => toggleBoatType(boatType.value)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                  />
                  <span className="text-sm">{boatType.label}</span>
                </label>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                  {boatType.count}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Fiyat Aralığı */}
        <Collapsible
          open={openSections.priceRange}
          onOpenChange={() => toggleSection("priceRange")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-300">
            <span className="font-medium text-white/90">
              {t.pages.boats.filters.priceRange}
            </span>
            {openSections.priceRange ? (
              <ChevronUp className="w-4 h-4 text-white/70 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/70 transition-transform duration-300" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 animate-fade-in-up">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={priceRange_min_max.max}
                min={priceRange_min_max.min}
                step={priceRange_min_max.step}
                className="w-full"
              />
              <div className="flex justify-between mt-3 text-sm text-white/70">
                <span className="bg-white/10 px-2 py-1 rounded-lg">
                  {t.pages.boats.filters.min}: {priceRange[0].toLocaleString()}{" "}
                  ₺
                </span>
                <span className="bg-white/10 px-2 py-1 rounded-lg">
                  {t.pages.boats.filters.max}: {priceRange[1].toLocaleString()}{" "}
                  ₺
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Kapasite */}
        <Collapsible
          open={openSections.capacity}
          onOpenChange={() => toggleSection("capacity")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-300">
            <span className="font-medium text-white/90">
              {t.pages.boats.filters.capacity}
            </span>
            {openSections.capacity ? (
              <ChevronUp className="w-4 h-4 text-white/70 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/70 transition-transform duration-300" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 animate-fade-in-up">
            {availableCapacityRanges.map((range, index) => (
              <div
                key={range}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <label
                  className="flex items-center space-x-3 cursor-pointer text-white/80 hover:text-white transition-colors duration-200"
                  onClick={() => setCapacity(range)}
                >
                  <input
                    type="radio"
                    name="capacity"
                    checked={capacity === range}
                    onChange={() => setCapacity(range)}
                    className="w-4 h-4 rounded-full border-white/30 bg-white/10 text-blue-500 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                  />
                  <span className="text-sm">
                    {getCapacityDisplayName(range)}
                  </span>
                </label>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                  {
                    allBoats.filter((boat) => {
                      const cap = boat.capacity;
                      if (!cap) return false;
                      if (range === "1-6") return cap >= 1 && cap <= 6;
                      if (range === "7-12") return cap >= 7 && cap <= 12;
                      if (range === "13-20") return cap >= 13 && cap <= 20;
                      if (range === "20+") return cap > 20;
                      if (range === "50+") return cap > 50;
                      if (range === "100+") return cap > 100;
                      return false;
                    }).length
                  }
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Özellikler */}
        <Collapsible
          open={openSections.features}
          onOpenChange={() => toggleSection("features")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-300">
            <span className="font-medium text-white/90">
              {t.pages.boats.filters.features}
            </span>
            {openSections.features ? (
              <ChevronUp className="w-4 h-4 text-white/70 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/70 transition-transform duration-300" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 animate-fade-in-up">
            {availableFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <label
                  className="flex items-center space-x-3 cursor-pointer text-white/80 hover:text-white transition-colors duration-200"
                  onClick={() => toggleFeature(feature.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature.value)}
                    onChange={() => toggleFeature(feature.value)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                  />
                  <span className="text-sm">{feature.label}</span>
                </label>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                  {feature.count}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Lokasyon */}
        <Collapsible
          open={openSections.location}
          onOpenChange={() => toggleSection("location")}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-300">
            <span className="font-medium text-white/90">
              {t.pages.boats.filters.location}
            </span>
            {openSections.location ? (
              <ChevronUp className="w-4 h-4 text-white/70 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/70 transition-transform duration-300" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 animate-fade-in-up">
            {availableLocations.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <label
                  className="flex items-center space-x-3 cursor-pointer text-white/80 hover:text-white transition-colors duration-200"
                  onClick={() => toggleLocation(location.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location.value)}
                    onChange={() => toggleLocation(location.value)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                  />
                  <span className="text-sm">{location.label}</span>
                </label>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                  {location.count}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Alt Butonlar */}
      <div className="mt-8 space-y-3">
        <button
          onClick={applyFilters}
          className="w-full glass-button bg-gradient-sunset px-6 py-3 rounded-xl font-semibold text-gray-900 hover:scale-105 transition-all duration-300 animate-ripple shadow-lg"
        >
          {t.pages.boats.filters.applyWithResults.replace(
            "{count}",
            filteredCount.toString()
          )}
        </button>
        <button
          onClick={resetFilters}
          className="w-full glass-button bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-3 rounded-xl font-medium text-white/90 hover:bg-white/15 hover:text-white transition-all duration-300"
        >
          {t.pages.boats.filters.clearFilters}
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
