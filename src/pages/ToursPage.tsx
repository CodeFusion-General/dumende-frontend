import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { usePullToRefresh } from "@/hooks/useMobileGestures";
import { useViewport } from "@/hooks/useResponsiveAnimations";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Debounce hook
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(12);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
  const debouncedSelectedTypes = useDebounce(selectedTypes, 500);
  const debouncedSelectedDurations = useDebounce(selectedDurations, 500);
  const debouncedCapacity = useDebounce(capacity, 800);
  const debouncedPriceRange = useDebounce(priceRange, 800);
  const debouncedSelectedLocations = useDebounce(selectedLocations, 500);
  const debouncedSelectedDifficulties = useDebounce(selectedDifficulties, 500);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section],
    });
  };

  // ✅ PERFORMANCE: React Query for server state management with pagination
  const {
    data: tourData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "tours-paginated",
      currentPage,
      debouncedSearchQuery,
      debouncedSelectedTypes,
      debouncedCapacity,
      debouncedPriceRange,
      debouncedSelectedLocations,
      sortBy,
    ],
    queryFn: async () => {
      const filters: any = {};
      
      // Apply search query
      if (debouncedSearchQuery.trim()) {
        filters.name = debouncedSearchQuery.trim();
      }

      // Apply type filters
      if (debouncedSelectedTypes.length > 0) {
        filters.type = debouncedSelectedTypes[0]; // Backend expects single type
      }

      // Apply location filters
      if (debouncedSelectedLocations.length > 0) {
        filters.location = debouncedSelectedLocations[0]; // Backend expects single location
      }

      // Apply capacity filter
      if (debouncedCapacity) {
        const capacityMap: Record<string, number> = {
          "1-2": 1,
          "3-6": 3,
          "7-15": 7,
          "16-30": 16,
          "30+": 30,
          "1-4": 1, // Legacy
          "5-10": 5, // Legacy
          "11-20": 11, // Legacy
          "20+": 20, // Legacy
        };
        filters.minCapacity = capacityMap[debouncedCapacity] || 1;
      }

      // Apply price range filter
      if (debouncedPriceRange[0] !== 100 || debouncedPriceRange[1] !== 5000) {
        filters.minPrice = debouncedPriceRange[0];
        filters.maxPrice = debouncedPriceRange[1];
      }

      const sortMapping: Record<string, string> = {
        popular: "rating,desc",
        "price-low": "price,asc",
        "price-high": "price,desc",
        rating: "rating,desc",
        capacity: "capacity,desc",
      };

      return tourService.advancedSearchPaginated(filters, {
        page: currentPage,
        size: itemsPerPage,
        sort: sortMapping[sortBy] || "rating,desc",
      });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const tours = tourData?.content || [];
  const totalElements = tourData?.totalElements || 0;
  const totalPages = tourData?.totalPages || 0;

  // Fetch tours manually for pull-to-refresh
  const fetchTours = async (showToast: boolean = false) => {
    try {
      await refetch();
      if (showToast) {
        toast({
          title: "Başarılı",
          description: "Turlar yenilendi",
        });
      }
    } catch (err) {
      console.error("Error fetching tours:", err);
      if (showToast) {
        toast({
          title: "Hata", 
          description: "Turlar yenilenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    }
  };

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage + 1 - delta);
      i <= Math.min(totalPages - 1, currentPage + 1 + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage + 1 - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + 1 + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

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
    setCurrentPage(0); // Reset to first page
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

  // ✅ PERFORMANCE: No manual effects needed - React Query handles data fetching automatically
  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(0);
  }, [
    debouncedSearchQuery,
    debouncedSelectedTypes,
    debouncedCapacity,
    debouncedPriceRange,
    debouncedSelectedLocations,
    sortBy,
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

  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
            <p className="text-gray-600">
              {error?.message || "Turlar yüklenirken bir hata oluştu"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              🔄 Tekrar Dene
            </button>
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
            totalTours={totalElements}
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
              applyFilters={() => {}} // No longer needed with React Query
              allTours={tours} // Current page tours
              filteredCount={totalElements}
            />

            <div className="flex-1">
              {tours.length > 0 ? (
                <>
                  <AnimatedTourGrid
                    tours={tours}
                    viewMode={viewMode}
                    comparedTours={comparedTours}
                    onCompareToggle={handleCompareToggle}
                    loading={loading}
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600 font-roboto">
                        {totalElements > 0 ? (
                          <>
                            {currentPage * itemsPerPage + 1}-
                            {Math.min((currentPage + 1) * itemsPerPage, totalElements)} / {totalElements} tur
                          </>
                        ) : (
                          "Tur bulunamadı"
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0 || loading}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex gap-1">
                          {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                              {page === "..." ? (
                                <span className="px-2 py-1 text-sm text-gray-400">...</span>
                              ) : (
                                <Button
                                  variant={currentPage === (page as number) - 1 ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange((page as number) - 1)}
                                  disabled={loading}
                                  className="h-8 w-8 p-0 text-sm"
                                >
                                  {page}
                                </Button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1 || loading}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
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
              tours={tours}
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
