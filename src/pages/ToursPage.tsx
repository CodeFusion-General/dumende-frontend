import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TourListingHeader from "@/components/tours/TourListingHeader";
import TourFilterSidebar from "@/components/tours/TourFilterSidebar";
import AnimatedTourGrid from "@/components/tours/AnimatedTourGrid";
import TourCompareBar from "@/components/tours/TourCompareBar";
import NoTourResults from "@/components/tours/NoTourResults";
import { tourService } from "@/services/tourService";
import { TourDTO } from "@/types/tour.types";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { usePullToRefresh } from "@/hooks/useMobileGestures";
import { useViewport } from "@/hooks/useResponsiveAnimations";
import { RefreshCw } from "lucide-react";

// Debounce hook
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ToursPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const { isMobile } = useViewport();

  // View and sorting state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTours, setAllTours] = useState<TourDTO[]>([]);
  const [filteredTours, setFilteredTours] = useState<TourDTO[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 5000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Compare state
  const [comparedTours, setComparedTours] = useState<string[]>([]);

  // Filter sections state
  const [openSections, setOpenSections] = useState({
    tourType: true,
    priceRange: true,
    duration: true,
    capacity: true,
    location: true,
    difficulty: true,
    dateAvailability: true,
  });

  // Debounced filter values for performance
  const debouncedSelectedTypes = useDebounce(selectedTypes, 300);
  const debouncedSelectedDurations = useDebounce(selectedDurations, 300);
  const debouncedCapacity = useDebounce(capacity, 300);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  const debouncedSelectedLocations = useDebounce(selectedLocations, 300);
  const debouncedSelectedDifficulties = useDebounce(selectedDifficulties, 300);
  const debouncedSelectedDateRange = useDebounce(selectedDateRange, 500);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section],
    });
  };

  // Fetch tours from API
  const fetchTours = async (showToast: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try to get all tours using capacity search as fallback
      const tours = await tourService.searchToursByCapacity(1);
      setAllTours(tours);
      setFilteredTours(tours);

      if (showToast) {
        toast({
          title: "Başarılı",
          description: "Turlar yenilendi",
        });
      }
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError(
        "Turlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setAllTours([]);
      setFilteredTours([]);

      if (showToast) {
        toast({
          title: "Hata",
          description: "Turlar yenilenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper: Prefer backend tourType; fallback to text inference for backward compatibility
  const getTourType = (tour: TourDTO): string[] => {
    if (tour.tourType) {
      switch (tour.tourType) {
        case "HIKING":
          return ["walking", "adventure"];
        case "CULTURAL":
          return ["cultural"];
        case "FOOD":
          return ["food"];
        case "CITY":
          return ["city"];
        case "NATURE":
          return ["nature"];
        case "BOAT":
          return ["boat"];
        case "PHOTOGRAPHY":
          return ["adventure"];
        case "DIVING":
          return ["adventure", "nature"];
        default:
          break;
      }
    }

    const text = `${tour.name} ${tour.description}`.toLowerCase();
    const types: string[] = [];

    if (
      text.includes("macera") ||
      text.includes("adventure") ||
      text.includes("tırmanış") ||
      text.includes("dağ")
    )
      types.push("adventure");
    if (
      text.includes("kültür") ||
      text.includes("cultural") ||
      text.includes("müze") ||
      text.includes("tarihi")
    )
      types.push("cultural");
    if (
      text.includes("yemek") ||
      text.includes("food") ||
      text.includes("gastronomi") ||
      text.includes("lezz")
    )
      types.push("food");
    if (
      text.includes("tarih") ||
      text.includes("historical") ||
      text.includes("antik") ||
      text.includes("eski")
    )
      types.push("historical");
    if (
      text.includes("doğa") ||
      text.includes("nature") ||
      text.includes("orman") ||
      text.includes("park")
    )
      types.push("nature");
    if (
      text.includes("şehir") ||
      text.includes("city") ||
      text.includes("kent") ||
      text.includes("merkez")
    )
      types.push("city");
    if (
      text.includes("tekne") ||
      text.includes("boat") ||
      text.includes("gemi") ||
      text.includes("deniz")
    )
      types.push("boat");
    if (
      text.includes("yürüyüş") ||
      text.includes("walking") ||
      text.includes("hiking") ||
      text.includes("trek")
    )
      types.push("walking");

    return types.length > 0 ? types : ["city"]; // Default to city if no type detected
  };

  // Helper function to extract duration from tour dates
  const getTourDuration = (tour: TourDTO): string[] => {
    const durations: string[] = [];

    tour.tourDates.forEach((date) => {
      const durationText = date.durationText.toLowerCase();
      if (
        durationText.includes("2") ||
        durationText.includes("3") ||
        durationText.includes("4")
      ) {
        if (durationText.includes("saat") || durationText.includes("hour")) {
          durations.push("half-day");
        }
      }
      if (
        durationText.includes("6") ||
        durationText.includes("7") ||
        durationText.includes("8")
      ) {
        if (durationText.includes("saat") || durationText.includes("hour")) {
          durations.push("full-day");
        }
      }
      if (durationText.includes("gün") || durationText.includes("day")) {
        const dayMatch = durationText.match(/(\d+)\s*(gün|day)/);
        if (dayMatch && parseInt(dayMatch[1]) > 1) {
          durations.push("multi-day");
        }
      }
      if (durationText.includes("akşam") || durationText.includes("evening")) {
        durations.push("evening");
      }
    });

    return durations.length > 0 ? durations : ["half-day"]; // Default to half-day
  };

  // Helper function to extract difficulty from description
  const getTourDifficulty = (tour: TourDTO): string[] => {
    const text = `${tour.name} ${tour.description}`.toLowerCase();
    const difficulties: string[] = [];

    if (
      text.includes("kolay") ||
      text.includes("easy") ||
      text.includes("rahat") ||
      text.includes("başlangıç")
    )
      difficulties.push("easy");
    if (
      text.includes("orta") ||
      text.includes("moderate") ||
      text.includes("normal") ||
      text.includes("standart")
    )
      difficulties.push("moderate");
    if (
      text.includes("zor") ||
      text.includes("challenging") ||
      text.includes("ileri") ||
      text.includes("deneyimli")
    )
      difficulties.push("challenging");

    return difficulties.length > 0 ? difficulties : ["easy"]; // Default to easy
  };

  // Apply filters and search
  const applyFilters = useCallback(async () => {
    try {
      setLoading(true);
      let filtered = [...allTours];

      // Apply search query
      if (debouncedSearchQuery.trim()) {
        filtered = filtered.filter(
          (tour) =>
            tour.name
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            tour.location
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            tour.description
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
        );
      }

      // Apply tour type filter
      if (debouncedSelectedTypes.length > 0) {
        filtered = filtered.filter((tour) => {
          const tourTypes = getTourType(tour);
          return debouncedSelectedTypes.some((type) =>
            tourTypes.includes(type)
          );
        });
      }

      // Apply duration filter
      if (debouncedSelectedDurations.length > 0) {
        filtered = filtered.filter((tour) => {
          const tourDurations = getTourDuration(tour);
          return debouncedSelectedDurations.some((duration) =>
            tourDurations.includes(duration)
          );
        });
      }

      // Apply difficulty filter
      if (debouncedSelectedDifficulties.length > 0) {
        filtered = filtered.filter((tour) => {
          const tourDifficulties = getTourDifficulty(tour);
          return debouncedSelectedDifficulties.some((difficulty) =>
            tourDifficulties.includes(difficulty)
          );
        });
      }

      // Apply location filter
      if (debouncedSelectedLocations.length > 0) {
        filtered = filtered.filter((tour) =>
          debouncedSelectedLocations.includes(tour.location)
        );
      }

      // Apply price range filter
      filtered = filtered.filter(
        (tour) =>
          tour.price >= debouncedPriceRange[0] &&
          tour.price <= debouncedPriceRange[1]
      );

      // Apply group size filter
      if (debouncedCapacity) {
        filtered = filtered.filter((tour) => {
          const cap = tour.capacity;
          if (!cap) return false;
          // New group size ranges
          if (debouncedCapacity === "1-2") return cap >= 1 && cap <= 2;
          if (debouncedCapacity === "3-6") return cap >= 3 && cap <= 6;
          if (debouncedCapacity === "7-15") return cap >= 7 && cap <= 15;
          if (debouncedCapacity === "16-30") return cap >= 16 && cap <= 30;
          if (debouncedCapacity === "30+") return cap > 30;
          // Legacy capacity ranges for backward compatibility
          if (debouncedCapacity === "1-4") return cap >= 1 && cap <= 4;
          if (debouncedCapacity === "5-10") return cap >= 5 && cap <= 10;
          if (debouncedCapacity === "11-20") return cap >= 11 && cap <= 20;
          if (debouncedCapacity === "20+") return cap > 20;
          return false;
        });
      }

      // Apply date availability filter
      if (debouncedSelectedDateRange.from || debouncedSelectedDateRange.to) {
        filtered = filtered.filter((tour) => {
          if (!tour.tourDates || tour.tourDates.length === 0) return false;

          return tour.tourDates.some((date) => {
            try {
              const tourDate = parseISO(date.startDate);
              const isAvailable = date.availabilityStatus === "AVAILABLE";

              if (!isAvailable) return false;

              if (
                debouncedSelectedDateRange.from &&
                debouncedSelectedDateRange.to
              ) {
                return (
                  !isBefore(tourDate, debouncedSelectedDateRange.from) &&
                  !isAfter(tourDate, debouncedSelectedDateRange.to)
                );
              } else if (debouncedSelectedDateRange.from) {
                return !isBefore(tourDate, debouncedSelectedDateRange.from);
              } else if (debouncedSelectedDateRange.to) {
                return !isAfter(tourDate, debouncedSelectedDateRange.to);
              }

              return true;
            } catch (error) {
              console.error("Error parsing tour date:", error);
              return false;
            }
          });
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "capacity":
            return b.capacity - a.capacity;
          case "popular":
          default:
            return (b.rating || 0) - (a.rating || 0); // Use rating as popularity proxy
        }
      });

      setFilteredTours(filtered);
    } catch (err) {
      console.error("Filter application error:", err);
      toast({
        title: "Hata",
        description: "Filtreleri uygularken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    allTours,
    debouncedSearchQuery,
    debouncedSelectedTypes,
    debouncedSelectedDurations,
    debouncedCapacity,
    debouncedPriceRange,
    debouncedSelectedLocations,
    debouncedSelectedDifficulties,
    debouncedSelectedDateRange,
    sortBy,
  ]);

  // Reset filters with animated transitions
  const handleFilterReset = useCallback(() => {
    // Add smooth transition classes
    const filterSidebar = document.querySelector(".tour-filter-sidebar");
    if (filterSidebar) {
      filterSidebar.classList.add("animate-pulse");
      setTimeout(() => {
        filterSidebar.classList.remove("animate-pulse");
      }, 300);
    }

    setSelectedTypes([]);
    setSelectedDurations([]);
    setSelectedLocations([]);
    setSelectedDifficulties([]);
    setPriceRange([100, 5000]);
    setCapacity("");
    setSearchQuery("");
    setSelectedDateRange({});
  }, []);

  // Pull to refresh functionality
  const {
    elementRef: pullToRefreshRef,
    pullDistance,
    isRefreshing,
    canRefresh,
    refreshText,
    pullProgress,
  } = usePullToRefresh({
    threshold: 80,
    onRefresh: async () => {
      await fetchTours(true);
    },
  });

  // Initialize data
  useEffect(() => {
    fetchTours();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    if (allTours.length > 0) {
      applyFilters();
    }
  }, [
    debouncedSearchQuery,
    debouncedSelectedTypes,
    debouncedSelectedDurations,
    debouncedCapacity,
    debouncedPriceRange,
    debouncedSelectedLocations,
    debouncedSelectedDifficulties,
    debouncedSelectedDateRange,
    sortBy,
    applyFilters,
  ]);

  // Handle compare toggle
  const handleCompareToggle = (id: string) => {
    if (comparedTours.includes(id)) {
      setComparedTours(comparedTours.filter((tourId) => tourId !== id));
    } else if (comparedTours.length < 3) {
      setComparedTours([...comparedTours, id]);
    } else {
      toast({
        title: "Karşılaştırma Limiti",
        description: "En fazla 3 turu karşılaştırabilirsiniz.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        ref={pullToRefreshRef}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative"
      >
        {/* Pull to Refresh Indicator */}
        {isMobile && pullDistance > 0 && (
          <div
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 transition-all duration-300"
            style={{
              transform: `translateY(${Math.min(pullDistance - 80, 0)}px)`,
              opacity: pullProgress,
            }}
          >
            <div className="flex items-center justify-center py-4">
              <RefreshCw
                className={`h-5 w-5 mr-2 text-[#3498db] ${
                  isRefreshing ? "animate-spin" : ""
                }`}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              />
              <span className="text-sm font-medium text-gray-700 font-roboto">
                {refreshText}
              </span>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <TourListingHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            totalTours={filteredTours.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <TourFilterSidebar
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              selectedDurations={selectedDurations}
              setSelectedDurations={setSelectedDurations}
              capacity={capacity}
              setCapacity={setCapacity}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedLocations={selectedLocations}
              setSelectedLocations={setSelectedLocations}
              selectedDifficulties={selectedDifficulties}
              setSelectedDifficulties={setSelectedDifficulties}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
              openSections={openSections}
              toggleSection={toggleSection}
              resetFilters={handleFilterReset}
              applyFilters={applyFilters}
              allTours={allTours}
              filteredCount={filteredTours.length}
            />

            <div className="flex-1">
              {filteredTours.length > 0 ? (
                <AnimatedTourGrid
                  tours={filteredTours}
                  viewMode={viewMode}
                  comparedTours={comparedTours}
                  onCompareToggle={handleCompareToggle}
                  loading={loading}
                />
              ) : (
                <NoTourResults
                  onReset={handleFilterReset}
                  searchQuery={searchQuery}
                  hasActiveFilters={
                    selectedTypes.length > 0 ||
                    selectedDurations.length > 0 ||
                    selectedLocations.length > 0 ||
                    selectedDifficulties.length > 0 ||
                    capacity !== "" ||
                    priceRange[0] !== 100 ||
                    priceRange[1] !== 5000 ||
                    searchQuery.trim() !== "" ||
                    selectedDateRange.from !== undefined ||
                    selectedDateRange.to !== undefined
                  }
                />
              )}
            </div>
          </div>

          {comparedTours.length > 0 && (
            <TourCompareBar
              comparedTours={comparedTours}
              tours={allTours}
              onRemove={(id) =>
                setComparedTours(
                  comparedTours.filter((tourId) => tourId !== id)
                )
              }
              onClearAll={() => setComparedTours([])}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ToursPage;
