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

// Tekne tipi mapping (backend enum → frontend display)
const boatTypeMapping: Record<string, string> = {
  SAILBOAT: "Yelkenli",
  MOTOR_YACHT: "Motor Yat",
  CATAMARAN: "Katamaran",
  MOTOR_BOAT: "Motor Tekne",
  GULET: "Gulet",
  RIB: "RIB Bot",
  FISHING_BOAT: "Balık Teknesi",
  SPEED_BOAT: "Hız Teknesi",
  LUXURY_YACHT: "Lüks Yat",
  PARTY_BOAT: "Parti Teknesi",
};

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
        label: boatTypeMapping[type] || type,
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
        label: feature,
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
      setSelectedTypes(selectedTypes.filter((type) => type !== value));
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const toggleLocation = (value: string) => {
    if (selectedLocations.includes(value)) {
      setSelectedLocations(
        selectedLocations.filter((location) => location !== value)
      );
    } else {
      setSelectedLocations([...selectedLocations, value]);
    }
  };

  const toggleFeature = (value: string) => {
    if (selectedFeatures.includes(value)) {
      setSelectedFeatures(
        selectedFeatures.filter((feature) => feature !== value)
      );
    } else {
      setSelectedFeatures([...selectedFeatures, value]);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  return (
    <>
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? (
            <X className="mr-2 h-4 w-4" />
          ) : (
            <Filter className="mr-2 h-4 w-4" />
          )}
          {showFilters ? "Filtreleri Kapat" : "Filtreleri Göster"}
        </Button>
      </div>

      <div
        className={`${
          showFilters ? "block" : "hidden"
        } md:block md:w-1/4 lg:w-1/5 pr-0 md:pr-6`}
      >
        <div className="bg-white rounded-lg shadow-md p-5 mb-6 sticky top-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-brand-secondary">Filtreler</h3>
            <button
              className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
              onClick={resetFilters}
            >
              Temizle
            </button>
          </div>

          <Collapsible
            open={openSections.boatType}
            onOpenChange={() => toggleSection("boatType")}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Tekne Türü</span>
              {openSections.boatType ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {availableBoatTypes.map((boatType) => (
                <div
                  key={boatType.value}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={boatType.value}
                      checked={selectedTypes.includes(boatType.value)}
                      onChange={() => toggleBoatType(boatType.value)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label
                      htmlFor={boatType.value}
                      className="text-sm text-gray-700"
                    >
                      {boatType.label}
                    </label>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {boatType.count}
                  </span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.priceRange}
            onOpenChange={() => toggleSection("priceRange")}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Fiyat Aralığı</span>
              {openSections.priceRange ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  Min: {priceRange[0].toLocaleString("tr-TR")} ₺
                </span>
                <span className="text-sm text-gray-600">
                  Max: {priceRange[1].toLocaleString("tr-TR")} ₺
                </span>
              </div>
              <div className="text-center text-xs text-gray-500 mb-2">
                📊 Mevcut fiyat aralığı:{" "}
                {priceRange_min_max.min.toLocaleString("tr-TR")} ₺ -{" "}
                {priceRange_min_max.max.toLocaleString("tr-TR")} ₺
              </div>
              <div className="mb-6 px-1">
                <Slider
                  defaultValue={[priceRange[0], priceRange[1]]}
                  min={priceRange_min_max.min}
                  max={priceRange_min_max.max}
                  step={priceRange_min_max.step}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={handlePriceRangeChange}
                  className="w-full"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.capacity}
            onOpenChange={() => toggleSection("capacity")}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Kapasite</span>
              {openSections.capacity ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {availableCapacityRanges.map((range) => (
                <div key={range} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`capacity-${range}`}
                      name="capacity"
                      value={range}
                      checked={capacity === range}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="mr-2 h-4 w-4 border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label
                      htmlFor={`capacity-${range}`}
                      className="text-sm text-gray-700"
                    >
                      {range} Kişi
                    </label>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
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

          <Collapsible
            open={openSections.features}
            onOpenChange={() => toggleSection("features")}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Özellikler</span>
              {openSections.features ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {availableFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feature-${index}`}
                      checked={selectedFeatures.includes(feature.value)}
                      onChange={() => toggleFeature(feature.value)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label
                      htmlFor={`feature-${index}`}
                      className="text-sm text-gray-700"
                    >
                      {feature.label}
                    </label>
                  </div>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    {feature.count}
                  </span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.location}
            onOpenChange={() => toggleSection("location")}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Lokasyon</span>
              {openSections.location ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {availableLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`location-${index}`}
                      checked={selectedLocations.includes(location.value)}
                      onChange={() => toggleLocation(location.value)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label
                      htmlFor={`location-${index}`}
                      className="text-sm text-gray-700"
                    >
                      {location.label}
                    </label>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    {location.count}
                  </span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white"
              onClick={applyFilters}
            >
              Filtreleri Uygula ({filteredCount} Sonuç)
            </Button>

            <Button
              variant="outline"
              className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10"
              onClick={resetFilters}
            >
              Filtreleri Temizle
            </Button>

            {/* Dynamic Stats */}
            <div className="text-center text-xs text-gray-500 mt-2 space-y-1">
              <div>📊 Toplam {allBoats.length} tekne</div>
              <div>🎯 {availableBoatTypes.length} farklı tip</div>
              <div>🌍 {availableLocations.length} lokasyon</div>
              <div>⚙️ {availableFeatures.length} özellik</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
