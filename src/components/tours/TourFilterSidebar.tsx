import React, { useMemo } from "react";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TourDTO } from "@/types/tour.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useViewport } from "@/hooks/useResponsiveAnimations";
import { useTouchTarget } from "@/hooks/useMobileGestures";

interface OpenSections {
  tourType: boolean;
  priceRange: boolean;
  duration: boolean;
  capacity: boolean;
  location: boolean;
  difficulty: boolean;
  dateAvailability: boolean;
}

interface TourFilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedDurations: string[];
  setSelectedDurations: (durations: string[]) => void;
  capacity: string;
  setCapacity: (capacity: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  selectedDifficulties: string[];
  setSelectedDifficulties: (difficulties: string[]) => void;
  selectedDateRange: { from?: Date; to?: Date };
  setSelectedDateRange: (range: { from?: Date; to?: Date }) => void;
  openSections: OpenSections;
  toggleSection: (section: keyof OpenSections) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  allTours: TourDTO[];
  filteredCount: number;
}

const TourFilterSidebar: React.FC<TourFilterSidebarProps> = ({
  showFilters,
  setShowFilters,
  selectedTypes,
  setSelectedTypes,
  selectedDurations,
  setSelectedDurations,
  selectedLocations,
  setSelectedLocations,
  selectedDifficulties,
  setSelectedDifficulties,
  selectedDateRange,
  setSelectedDateRange,
  priceRange,
  setPriceRange,
  capacity,
  setCapacity,
  openSections,
  toggleSection,
  resetFilters,
  applyFilters,
  allTours,
  filteredCount,
}) => {
  const { language } = useLanguage();
  const { isMobile } = useViewport();
  const { getTouchTargetProps } = useTouchTarget();

  // Tour types based on common tour categories
  const tourTypes = [
    { value: "adventure", label: "Macera", icon: "🏔️" },
    { value: "cultural", label: "Kültürel", icon: "🏛️" },
    { value: "food", label: "Yemek", icon: "🍽️" },
    { value: "historical", label: "Tarihi", icon: "🏰" },
    { value: "nature", label: "Doğa", icon: "🌿" },
    { value: "city", label: "Şehir", icon: "🏙️" },
    { value: "boat", label: "Tekne", icon: "⛵" },
    { value: "walking", label: "Yürüyüş", icon: "🚶" },
  ];

  // Duration options
  const durationOptions = [
    { value: "half-day", label: "Yarım Gün (2-4 saat)", icon: "⏰" },
    { value: "full-day", label: "Tam Gün (6-8 saat)", icon: "🌅" },
    { value: "multi-day", label: "Çok Günlük", icon: "🌄" },
    { value: "evening", label: "Akşam (2-3 saat)", icon: "🌆" },
  ];

  // Difficulty levels
  const difficultyLevels = [
    { value: "easy", label: "Kolay", icon: "😊", color: "text-green-600" },
    { value: "moderate", label: "Orta", icon: "😐", color: "text-yellow-600" },
    { value: "challenging", label: "Zor", icon: "😤", color: "text-red-600" },
  ];

  // Dynamic locations from tours
  const availableLocations = useMemo(() => {
    const locationSet = new Set<string>();
    allTours.forEach((tour) => {
      if (tour.location) {
        locationSet.add(tour.location);
      }
    });

    return Array.from(locationSet)
      .map((location) => ({
        value: location,
        label: location,
        count: allTours.filter((tour) => tour.location === location).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allTours]);

  // Dynamic price range
  const priceRange_min_max = useMemo(() => {
    if (allTours.length === 0) {
      return { min: 100, max: 5000 };
    }

    const prices = allTours
      .map((tour) => tour.price)
      .filter((price) => price && price > 0);

    if (prices.length === 0) {
      return { min: 100, max: 5000 };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      min: Math.floor(minPrice / 50) * 50,
      max: Math.ceil(maxPrice / 50) * 50,
      step: 50,
    };
  }, [allTours]);

  // Group size ranges (enhanced capacity filtering)
  const groupSizeRanges = [
    { value: "1-2", label: "Çift (1-2 Kişi)", icon: "👫" },
    { value: "3-6", label: "Küçük Grup (3-6 Kişi)", icon: "👨‍👩‍👧‍👦" },
    { value: "7-15", label: "Orta Grup (7-15 Kişi)", icon: "👥" },
    { value: "16-30", label: "Büyük Grup (16-30 Kişi)", icon: "🏢" },
    { value: "30+", label: "Çok Büyük Grup (30+ Kişi)", icon: "🎪" },
  ];

  // Legacy capacity ranges for backward compatibility
  const capacityRanges = [
    { value: "1-4", label: "1-4 Kişi" },
    { value: "5-10", label: "5-10 Kişi" },
    { value: "11-20", label: "11-20 Kişi" },
    { value: "20+", label: "20+ Kişi" },
  ];

  const toggleArrayFilter = (
    value: string,
    selected: string[],
    setter: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  // Mobile bottom sheet or desktop sidebar
  const containerClasses = isMobile
    ? `fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-white/20 rounded-t-2xl shadow-2xl transform transition-transform duration-300 max-h-[85vh] overflow-y-auto ${
        showFilters ? "translate-y-0" : "translate-y-full"
      }`
    : `${
        showFilters ? "block animate-slide-in-glass" : "hidden"
      } lg:block w-full lg:w-80 bg-white/40 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl h-fit transition-all duration-500 ease-glass tour-filter-sidebar`;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && showFilters && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowFilters(false)}
        />
      )}

      <div className={containerClasses}>
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 font-montserrat">
                Filtreler
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetFilters}
                className="px-2 sm:px-3 py-1 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm font-roboto"
                {...(isMobile ? getTouchTargetProps(44) : {})}
              >
                Temizle
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300"
                {...getTouchTargetProps(44)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Tour Type */}
            <Collapsible
              open={openSections.tourType}
              onOpenChange={() => toggleSection("tourType")}
            >
              <CollapsibleTrigger
                className="flex w-full items-center justify-between py-2 sm:py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300"
                {...(isMobile ? getTouchTargetProps(44) : {})}
              >
                <span className="font-medium text-gray-800 font-montserrat text-sm sm:text-base">
                  Tur Türü
                </span>
                {openSections.tourType ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 animate-fade-in-up">
                {tourTypes.map((type, index) => (
                  <div
                    key={type.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <label
                      className="flex items-center space-x-3 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      onClick={() =>
                        toggleArrayFilter(
                          type.value,
                          selectedTypes,
                          setSelectedTypes
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.value)}
                        onChange={() =>
                          toggleArrayFilter(
                            type.value,
                            selectedTypes,
                            setSelectedTypes
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 bg-white text-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all duration-200"
                      />
                      <span className="text-base sm:text-lg mr-1">
                        {type.icon}
                      </span>
                      <span className="text-xs sm:text-sm font-roboto">
                        {type.label}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Duration */}
            <Collapsible
              open={openSections.duration}
              onOpenChange={() => toggleSection("duration")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300">
                <span className="font-medium text-gray-800 font-montserrat flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#3498db]" />
                  Süre
                </span>
                {openSections.duration ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 animate-fade-in-up">
                {durationOptions.map((duration, index) => (
                  <div
                    key={duration.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <label
                      className="flex items-center space-x-3 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      onClick={() =>
                        toggleArrayFilter(
                          duration.value,
                          selectedDurations,
                          setSelectedDurations
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedDurations.includes(duration.value)}
                        onChange={() =>
                          toggleArrayFilter(
                            duration.value,
                            selectedDurations,
                            setSelectedDurations
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 bg-white text-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all duration-200"
                      />
                      <span className="text-lg mr-1">{duration.icon}</span>
                      <span className="text-sm font-roboto">
                        {duration.label}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Price Range */}
            <Collapsible
              open={openSections.priceRange}
              onOpenChange={() => toggleSection("priceRange")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300">
                <span className="font-medium text-gray-800 font-montserrat">
                  Fiyat Aralığı
                </span>
                {openSections.priceRange ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 animate-fade-in-up">
                <div className="px-2">
                  <div className="relative">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={priceRange_min_max.max}
                      min={priceRange_min_max.min}
                      step={priceRange_min_max.step}
                      className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#3498db] [&_[role=slider]]:to-[#2c3e50] [&_[role=slider]]:border-white/30 [&_[role=slider]]:shadow-lg [&_[role=slider]]:backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-sm text-gray-600">
                    <span className="bg-white/60 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-lg font-roboto shadow-sm">
                      Min: {priceRange[0].toLocaleString()} ₺
                    </span>
                    <span className="bg-white/60 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-lg font-roboto shadow-sm">
                      Max: {priceRange[1].toLocaleString()} ₺
                    </span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Group Size */}
            <Collapsible
              open={openSections.capacity}
              onOpenChange={() => toggleSection("capacity")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300">
                <span className="font-medium text-gray-800 font-montserrat flex items-center">
                  <Users className="w-4 h-4 mr-2 text-[#3498db]" />
                  Grup Büyüklüğü
                </span>
                {openSections.capacity ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 animate-fade-in-up">
                {groupSizeRanges.map((range, index) => (
                  <div
                    key={range.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <label
                      className="flex items-center space-x-3 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      onClick={() => setCapacity(range.value)}
                    >
                      <input
                        type="radio"
                        name="capacity"
                        checked={capacity === range.value}
                        onChange={() => setCapacity(range.value)}
                        className="w-4 h-4 rounded-full border-gray-300 bg-white text-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all duration-200"
                      />
                      <span className="text-lg mr-1">{range.icon}</span>
                      <span className="text-sm font-roboto">{range.label}</span>
                    </label>
                    <span className="text-xs text-gray-500 bg-white/60 backdrop-blur-sm border border-white/30 px-2 py-1 rounded-full shadow-sm">
                      {
                        allTours.filter((tour) => {
                          const cap = tour.capacity;
                          if (!cap) return false;
                          if (range.value === "1-2")
                            return cap >= 1 && cap <= 2;
                          if (range.value === "3-6")
                            return cap >= 3 && cap <= 6;
                          if (range.value === "7-15")
                            return cap >= 7 && cap <= 15;
                          if (range.value === "16-30")
                            return cap >= 16 && cap <= 30;
                          if (range.value === "30+") return cap > 30;
                          return false;
                        }).length
                      }
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Location */}
            <Collapsible
              open={openSections.location}
              onOpenChange={() => toggleSection("location")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300">
                <span className="font-medium text-gray-800 font-montserrat flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#3498db]" />
                  Lokasyon
                </span>
                {openSections.location ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 animate-fade-in-up">
                {availableLocations.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <label
                      className="flex items-center space-x-3 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      onClick={() =>
                        toggleArrayFilter(
                          location.value,
                          selectedLocations,
                          setSelectedLocations
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location.value)}
                        onChange={() =>
                          toggleArrayFilter(
                            location.value,
                            selectedLocations,
                            setSelectedLocations
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 bg-white text-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all duration-200"
                      />
                      <span className="text-sm font-roboto">
                        {location.label}
                      </span>
                    </label>
                    <span className="text-xs text-gray-500 bg-white/60 backdrop-blur-sm border border-white/30 px-2 py-1 rounded-full shadow-sm">
                      {location.count}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Difficulty */}
            <Collapsible
              open={openSections.difficulty}
              onOpenChange={() => toggleSection("difficulty")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300">
                <span className="font-medium text-gray-800 font-montserrat flex items-center">
                  <Star className="w-4 h-4 mr-2 text-[#3498db]" />
                  Zorluk
                </span>
                {openSections.difficulty ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 animate-fade-in-up">
                {difficultyLevels.map((difficulty, index) => (
                  <div
                    key={difficulty.value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <label
                      className="flex items-center space-x-3 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200"
                      onClick={() =>
                        toggleArrayFilter(
                          difficulty.value,
                          selectedDifficulties,
                          setSelectedDifficulties
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedDifficulties.includes(
                          difficulty.value
                        )}
                        onChange={() =>
                          toggleArrayFilter(
                            difficulty.value,
                            selectedDifficulties,
                            setSelectedDifficulties
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 bg-white text-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 transition-all duration-200"
                      />
                      <span className="text-lg mr-1">{difficulty.icon}</span>
                      <span
                        className={`text-sm font-roboto ${difficulty.color}`}
                      >
                        {difficulty.label}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Date Availability */}
            <Collapsible
              open={openSections.dateAvailability}
              onOpenChange={() => toggleSection("dateAvailability")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-lg hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300">
                <span className="font-medium text-gray-800 font-montserrat flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-[#3498db]" />
                  Tarih Aralığı
                </span>
                {openSections.dateAvailability ? (
                  <ChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 animate-fade-in-up">
                <div className="px-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-[#3498db]" />
                          {selectedDateRange.from ? (
                            format(selectedDateRange.from, "dd MMM", {
                              locale: tr,
                            })
                          ) : (
                            <span className="text-gray-500">Başlangıç</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-white/95 backdrop-blur-sm border-white/30"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={selectedDateRange.from}
                          onSelect={(date) =>
                            setSelectedDateRange({
                              ...selectedDateRange,
                              from: date,
                            })
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="rounded-lg"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-[#3498db]" />
                          {selectedDateRange.to ? (
                            format(selectedDateRange.to, "dd MMM", {
                              locale: tr,
                            })
                          ) : (
                            <span className="text-gray-500">Bitiş</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-white/95 backdrop-blur-sm border-white/30"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={selectedDateRange.to}
                          onSelect={(date) =>
                            setSelectedDateRange({
                              ...selectedDateRange,
                              to: date,
                            })
                          }
                          disabled={(date) =>
                            date < new Date() ||
                            (selectedDateRange.from &&
                              date < selectedDateRange.from)
                          }
                          initialFocus
                          className="rounded-lg"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {(selectedDateRange.from || selectedDateRange.to) && (
                    <div className="mt-3 p-2 bg-blue-50/60 backdrop-blur-sm border border-blue-200/30 rounded-lg">
                      <p className="text-xs text-blue-700 font-roboto">
                        {selectedDateRange.from && selectedDateRange.to
                          ? `${format(selectedDateRange.from, "dd MMM", {
                              locale: tr,
                            })} - ${format(selectedDateRange.to, "dd MMM", {
                              locale: tr,
                            })} arası turlar`
                          : selectedDateRange.from
                          ? `${format(selectedDateRange.from, "dd MMM", {
                              locale: tr,
                            })} tarihinden sonraki turlar`
                          : `${format(selectedDateRange.to!, "dd MMM", {
                              locale: tr,
                            })} tarihine kadar olan turlar`}
                      </p>
                      <button
                        onClick={() => setSelectedDateRange({})}
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                      >
                        Tarihleri temizle
                      </button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 space-y-3 pb-4 sm:pb-0">
            <button
              onClick={() => {
                applyFilters();
                if (isMobile) setShowFilters(false);
              }}
              className="w-full bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white px-4 sm:px-6 py-3 sm:py-3 rounded-xl font-semibold hover:from-[#2c3e50] hover:to-[#3498db] hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg font-montserrat backdrop-blur-sm border border-white/20 group text-sm sm:text-base"
              {...getTouchTargetProps(48)}
            >
              <span className="flex items-center justify-center space-x-2">
                <Filter className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>{filteredCount} Tur Göster</span>
              </span>
            </button>
            <button
              onClick={() => {
                resetFilters();
                if (isMobile) setShowFilters(false);
              }}
              className="w-full bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/30 px-4 sm:px-6 py-3 sm:py-3 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm font-roboto group text-sm sm:text-base"
              {...getTouchTargetProps(48)}
            >
              <span className="flex items-center justify-center space-x-2">
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Filtreleri Temizle</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourFilterSidebar;
