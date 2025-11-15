import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import BoatListingHeader from "@/components/boats/BoatListingHeader";
import FilterSidebar from "@/components/boats/FilterSidebar";
// import { boatListingData } from "@/data/boats"; // ✅ REMOVED: Mock data causing performance issues
import NoResults from "@/components/boats/NoResults";
import AnimatedBoatGrid from "@/components/boats/AnimatedBoatGrid";
import CompareBar from "@/components/boats/CompareBar";
import ServiceFilterBadge from "@/components/boats/ServiceFilterBadge";
import { toast } from "@/components/ui/use-toast";
import { boatService } from "@/services/boatService";
import { BoatDTO } from "@/types/boat.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { createRippleEffect } from "@/lib/animations";

const serviceBoatMap: Record<string, string[]> = {
  "evlilik-teklifi": ["Lüks Yat", "Motorlu Yat"],
  "dogum-gunu": ["Motorlu Yat", "Sürat Teknesi", "Katamaran"],
  dugun: ["Lüks Yat", "Gulet"],
  iftar: ["Motorlu Yat", "Gulet"],
  "sunset-cruise": ["Yelkenli", "Motorlu Yat", "Gulet"],
  "bekarlığa-veda": ["Motorlu Yat", "Sürat Teknesi"],
  "tekne-partisi": ["Motorlu Yat", "Katamaran", "Sürat Teknesi"],
  "fotograf-cekimi": ["Yelkenli", "Lüks Yat"],
  "kurumsal-etkinlik": ["Lüks Yat", "Gulet"],
  "ozel-catering": ["Lüks Yat", "Gulet", "Katamaran"],
  "vip-transfer": ["Lüks Yat", "Sürat Teknesi"],
  "yuzme-dalis-turu": ["Katamaran", "Yelkenli"],
};

// ✅ REMOVED: Mock data converter - now using real API data only

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

const BoatsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");
  // Hourly vs Daily price view
  const [isHourlyMode, setIsHourlyMode] = useState<boolean>(true);

  // ✅ PERFORMANCE: State management optimized
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredBoats, setFilteredBoats] = useState<BoatDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBoats, setTotalBoats] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [comparedBoats, setComparedBoats] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 30000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const [openSections, setOpenSections] = useState({
    boatType: true,
    priceRange: true,
    capacity: true,
    features: true,
    location: true,
    date: true,
  });

  // ✅ PERFORMANCE OPTIMIZATION: Increased debounce times
  const debouncedSelectedTypes = useDebounce(selectedTypes, 500);
  const debouncedCapacity = useDebounce(capacity, 500);
  const debouncedPriceRange = useDebounce(priceRange, 800); // Longer for price range
  const debouncedSelectedLocations = useDebounce(selectedLocations, 500);
  const debouncedSelectedFeatures = useDebounce(selectedFeatures, 500);

  const searchParams = new URLSearchParams(location.search);
  const serviceParam = searchParams.get("service");

  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section],
    });
  };

  // ✅ PERFORMANCE: Filtre modelini ve sıralamayı memoize et
  const advancedReq = useMemo(() => {
    return {
      types:
        debouncedSelectedTypes.length > 0 ? debouncedSelectedTypes : undefined,
      locations:
        debouncedSelectedLocations.length > 0
          ? debouncedSelectedLocations
          : undefined,
      minCapacity: debouncedCapacity
        ? parseInt(debouncedCapacity.split("-")[0])
        : undefined,
      minPrice: debouncedPriceRange[0],
      maxPrice: debouncedPriceRange[1],
      startDate,
      endDate,
    } as any;
  }, [
    debouncedSelectedTypes,
    debouncedSelectedLocations,
    debouncedCapacity,
    debouncedPriceRange,
    startDate,
    endDate,
  ]);

  const sortParam = useMemo(() => {
    return sortBy === "priceHigh"
      ? "dailyPrice,desc"
      : sortBy === "priceLow"
      ? "dailyPrice,asc"
      : "popularity,desc";
  }, [sortBy]);

  // ✅ React Query ile sayfalı arama (keepPreviousData)
  const {
    data: pageResp,
    isFetching,
    isError: isQueryError,
    error: queryError,
  } = useQuery({
    queryKey: ["boats-advanced", advancedReq, sortParam, currentPage],
    queryFn: async () =>
      boatService.advancedSearchPaginated(advancedReq, {
        page: currentPage,
        size: 24,
        sort: sortParam,
      }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  // ✅ Sunucu yanıtını yerel state'e yansıt
  useEffect(() => {
    if (!pageResp) return;
    setFilteredBoats(pageResp.content || []);
    setCurrentPage(pageResp.number ?? 0);
    setTotalPages(pageResp.totalPages ?? 0);
    setTotalBoats(pageResp.totalElements ?? 0);
    setHasNextPage(!pageResp.last);
    setError(null);
  }, [pageResp]);

  // ✅ Yükleme durumunu React Query'den al
  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching]);

  // ✅ Hata yönetimi
  useEffect(() => {
    if (isQueryError) {
      console.error("Filter uygulama hatası:", queryError);
      toast({
        title: "Hata",
        description:
          "Filtreleri uygularken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
      setFilteredBoats([]);
      setTotalBoats(0);
    }
  }, [isQueryError, queryError]);

  // ✅ Sadece sayfayı değiştiren hafif fonksiyon
  const applyFilters = useCallback((page = 0) => {
    setCurrentPage(page);
  }, []);

  // Optimized reset function
  const handleFilterReset = useCallback(() => {
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSelectedFeatures([]);
    setPriceRange([500, 30000]);
    setCapacity("");
    if (serviceParam) {
      navigate("/boats");
    }
  }, [serviceParam, navigate]);

  useEffect(() => {
    parseUrlFilters();
  }, [location.search]);

  // URL parametrelerini parsing eden fonksiyon
  const parseUrlFilters = () => {
    const searchParams = new URLSearchParams(location.search);
    const locationFilter = searchParams.get("location");
    const typeFilter = searchParams.get("type");
    const filterType = searchParams.get("filter");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const guests = searchParams.get("guests");

    // Lokasyon filtresi varsa uygula
    if (locationFilter && filterType === "location") {
      setSelectedLocations([locationFilter]);
    }

    // Tip filtresi varsa uygula
    if (typeFilter && filterType === "type") {
      setSelectedTypes([typeFilter]);
    }

    // Tarih ve misafir sayısını URL'den al
    if (start) setStartDate(start);
    if (end) setEndDate(end);
    if (guests) setCapacity(guests);
  };

  // fetchInitialBoats kaldırıldı; React Query ilk veriyi yükleyecek

  useEffect(() => {
    if (serviceParam && serviceBoatMap[serviceParam]) {
      setSelectedTypes(serviceBoatMap[serviceParam]);
    }
  }, [serviceParam]);

  // ✅ PERFORMANCE: Apply filters when debounced values change (no dependency on boat data)
  useEffect(() => {
    applyFilters(0); // Always start from page 0 when filters change
  }, [
    debouncedSelectedTypes,
    debouncedCapacity,
    debouncedPriceRange,
    debouncedSelectedLocations,
    debouncedSelectedFeatures,
    sortBy, // React to sorting changes
  ]);

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {t.common.error}
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <BoatListingHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            totalBoats={totalBoats}
            isHourlyMode={isHourlyMode}
            setIsHourlyMode={setIsHourlyMode}
          />

          <div className="flex flex-col md:flex-row gap-6">
            <FilterSidebar
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              capacity={capacity}
              setCapacity={setCapacity}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedLocations={selectedLocations}
              setSelectedLocations={setSelectedLocations}
              selectedFeatures={selectedFeatures}
              setSelectedFeatures={setSelectedFeatures}
              openSections={openSections}
              toggleSection={toggleSection}
              resetFilters={handleFilterReset}
              applyFilters={() => applyFilters(0)}
              allBoats={[]} // Not needed anymore, using paginated data
              filteredCount={totalBoats}
            />

            <div className="flex-1">
              {serviceParam && (
                <div className="mb-4">
                  <ServiceFilterBadge
                    service={serviceParam}
                    onRemove={() => navigate("/boats")}
                  />
                </div>
              )}

              {filteredBoats.length > 0 ? (
                <AnimatedBoatGrid
                  boats={filteredBoats}
                  viewMode={viewMode}
                  isHourlyMode={isHourlyMode}
                  comparedBoats={comparedBoats}
                  loading={loading}
                  // Detay sayfasına geçerken mevcut arama parametrelerini koru
                  detailLinkBuilder={(boat) => {
                    const params = new URLSearchParams(location.search);
                    // Arama sonuçlarından gelen temel parametreleri taşıyalım
                    const allowed = [
                      "location",
                      "start",
                      "end",
                      "guests",
                      "filter",
                      "type",
                    ];
                    const forwardParams = new URLSearchParams();
                    allowed.forEach((key) => {
                      const value = params.get(key);
                      if (value) forwardParams.set(key, value);
                    });
                    const qs = forwardParams.toString();
                    return qs ? `/boats/${boat.id}?${qs}` : `/boats/${boat.id}`;
                  }}
                  onCompareToggle={(id) => {
                    if (comparedBoats.includes(id)) {
                      setComparedBoats(
                        comparedBoats.filter((boatId) => boatId !== id)
                      );
                    } else if (comparedBoats.length < 3) {
                      setComparedBoats([...comparedBoats, id]);
                    } else {
                      toast({
                        title: t.pages.boats.compare.title,
                        description:
                          "En fazla 3 tekneyi karşılaştırabilirsiniz.",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ) : (
                <NoResults
                  onReset={handleFilterReset}
                  searchQuery={searchParams.get("search") || ""}
                  hasActiveFilters={
                    selectedTypes.length > 0 ||
                    selectedLocations.length > 0 ||
                    selectedFeatures.length > 0 ||
                    capacity !== "" ||
                    priceRange[0] !== 500 ||
                    priceRange[1] !== 30000
                  }
                />
              )}

              {/* ✅ PERFORMANCE: Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => applyFilters(currentPage - 1)}
                    disabled={currentPage === 0 || loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    ← Önceki
                  </button>

                  <span className="px-4 py-2 bg-gray-100 rounded">
                    Sayfa {currentPage + 1} / {totalPages}
                  </span>

                  <button
                    onClick={() => applyFilters(currentPage + 1)}
                    disabled={!hasNextPage || loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Sonraki →
                  </button>

                  <span className="text-sm text-gray-600 ml-4">
                    Toplam {totalBoats} tekne
                  </span>
                </div>
              )}
            </div>
          </div>

          {comparedBoats.length > 0 && (
            <CompareBar
              comparedBoats={comparedBoats}
              boats={filteredBoats} // Use filtered boats instead of allBoats
              onRemove={(id) =>
                setComparedBoats(
                  comparedBoats.filter((boatId) => boatId !== id)
                )
              }
              onClearAll={() => setComparedBoats([])}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BoatsPage;
