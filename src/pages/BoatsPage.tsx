import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import BoatListingHeader from "@/components/boats/BoatListingHeader";
import FilterSidebar from "@/components/boats/FilterSidebar";
import { boatListingData } from "@/data/boats";
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

// Mock data adapter to convert listing data to BoatDTO format
const convertToBoatDTO = (mockData: any): BoatDTO => ({
  id: mockData.id,
  ownerId: 1, // Mock owner ID
  name: mockData.name,
  description: mockData.description || "",
  model: mockData.model || "",
  year: mockData.year,
  length: 0, // Mock value
  capacity: mockData.capacity,
  dailyPrice: mockData.price,
  hourlyPrice: 0, // Mock value
  location: mockData.location,
  rating: mockData.rating,
  type: mockData.type,
  status: "ACTIVE",
  brandModel: mockData.model || "",
  buildYear: mockData.year,
  captainIncluded: false,
  images: mockData.images.map((url: string) => ({
    id: 0,
    boatId: mockData.id,
    imageUrl: url,
    isPrimary: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  features: mockData.features.map((feature: string, index: number) => ({
    id: index,
    boatId: mockData.id,
    featureName: feature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  availabilities: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

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

  // Mock data state (commented out but preserved)
  /* const [allBoats] = useState(boatListingData);
  const [filteredBoats, setFilteredBoats] = useState(boatListingData); */

  // Real data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBoats, setAllBoats] = useState<BoatDTO[]>([]);
  const [filteredBoats, setFilteredBoats] = useState<BoatDTO[]>([]);

  const [comparedBoats, setComparedBoats] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 30000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [openSections, setOpenSections] = useState({
    boatType: true,
    priceRange: true,
    capacity: true,
    features: true,
    location: true,
    date: true,
  });

  // **PERFORMANCE OPTIMIZATION**
  // Debounce filter değişikliklerini (500ms gecikme)
  const debouncedSelectedTypes = useDebounce(selectedTypes, 300);
  const debouncedCapacity = useDebounce(capacity, 300);
  const debouncedPriceRange = useDebounce(priceRange, 500); // Fiyat için biraz daha uzun
  const debouncedSelectedLocations = useDebounce(selectedLocations, 300);
  const debouncedSelectedFeatures = useDebounce(selectedFeatures, 300);

  const searchParams = new URLSearchParams(location.search);
  const serviceParam = searchParams.get("service");

  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section],
    });
  };

  // Performance için memoized applyFilters
  const applyFilters = useCallback(async () => {
    try {
      setLoading(true);
      // Real API call
      const response = await boatService.searchBoats({
        type:
          debouncedSelectedTypes.length > 0
            ? debouncedSelectedTypes[0]
            : undefined,
        minCapacity: debouncedCapacity
          ? parseInt(debouncedCapacity.split("-")[0])
          : undefined,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
        location:
          debouncedSelectedLocations.length > 0
            ? debouncedSelectedLocations[0]
            : undefined,
      });

      // Ensure we always set an array
      const filteredResults = Array.isArray(response)
        ? response
        : (response as any)?.content || [];

      setFilteredBoats(filteredResults);
    } catch (err) {
      console.error("Filter uygulama hatası:", err);
      toast({
        title: "Hata",
        description:
          "Filtreleri uygularken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
      setFilteredBoats([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSelectedTypes,
    debouncedCapacity,
    debouncedPriceRange,
    debouncedSelectedLocations,
    debouncedSelectedFeatures,
  ]);

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
    fetchBoats();
    // URL parametrelerini oku ve filtreleri uygula
    parseUrlFilters();
  }, [location.search]);

  // URL parametrelerini parsing eden fonksiyon
  const parseUrlFilters = () => {
    const searchParams = new URLSearchParams(location.search);
    const locationFilter = searchParams.get("location");
    const typeFilter = searchParams.get("type");
    const filterType = searchParams.get("filter");

    // Lokasyon filtresi varsa uygula
    if (locationFilter && filterType === "location") {
      setSelectedLocations([locationFilter]);
    }

    // Tip filtresi varsa uygula
    if (typeFilter && filterType === "type") {
      setSelectedTypes([typeFilter]);
    }
  };

  const fetchBoats = async () => {
    try {
      setLoading(true);

      // Önce API'yi dene
      try {
        const response = await boatService.getBoats();
        const boats = Array.isArray(response)
          ? response
          : (response as any)?.content || [];

        if (boats.length > 0) {
          setAllBoats(boats);
          setFilteredBoats(boats);
          setError(null);
          return;
        }
      } catch (apiError) {
        console.warn(
          "API'den veri alınamadı, mock data kullanılıyor:",
          apiError
        );
      }

      // API'den veri gelmezse mock data kullan
      const mockBoats = boatListingData.map(convertToBoatDTO);
      setAllBoats(mockBoats);
      setFilteredBoats(mockBoats);
      setError(null);
    } catch (err) {
      console.error("Error fetching boats:", err);
      setError(
        "Tekneleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setAllBoats([]);
      setFilteredBoats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceParam && serviceBoatMap[serviceParam]) {
      setSelectedTypes(serviceBoatMap[serviceParam]);
    }
  }, [serviceParam]);

  // Debounced değerler değiştiğinde filtreleri uygula
  useEffect(() => {
    if (allBoats.length > 0) {
      // Sadece tekneler yüklendikten sonra filtrele
      applyFilters();
    }
  }, [
    debouncedSelectedTypes,
    debouncedCapacity,
    debouncedPriceRange,
    debouncedSelectedLocations,
    debouncedSelectedFeatures,
    applyFilters,
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
            totalBoats={filteredBoats.length}
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
              applyFilters={applyFilters}
              allBoats={allBoats}
              filteredCount={filteredBoats.length}
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
            </div>
          </div>

          {comparedBoats.length > 0 && (
            <CompareBar
              comparedBoats={comparedBoats}
              boats={allBoats}
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
