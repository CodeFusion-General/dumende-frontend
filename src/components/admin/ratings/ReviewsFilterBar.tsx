import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Filter,
  RotateCcw,
  Star,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilterOptions, SortOption } from "@/types/ratings.types";
import {
  useStaggeredAnimation,
} from "./animations/AnimationUtils";

interface ReviewsFilterBarProps {
  filters: FilterOptions;
  sortBy: SortOption;
  onFiltersChange: (filters: FilterOptions) => void;
  onSortChange: (sortBy: SortOption) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const ReviewsFilterBar: React.FC<ReviewsFilterBarProps> = ({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onResetFilters,
  totalResults,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search with loading state
  useEffect(() => {
    if (searchTerm !== (filters.searchTerm || "")) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, searchTerm: searchTerm || undefined });
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.rating) count++;
    if (filters.category && filters.category !== "all") count++;
    if (filters.isVerified !== undefined) count++;
    if (filters.location) count++;
    if (filters.dateRange) count++;
    if (filters.searchTerm) count++;
    return count;
  }, [filters]);

  // Filter chips data
  const filterChips = useMemo(() => {
    const chips = [];

    if (filters.rating) {
      chips.push({
        id: "rating",
        label: `${filters.rating} Yıldız`,
        icon: <Star className="w-3 h-3" />,
        onRemove: () => onFiltersChange({ ...filters, rating: undefined }),
      });
    }

    if (filters.category && filters.category !== "all") {
      chips.push({
        id: "category",
        label: filters.category === "boat" ? "Tekne" : "Tur",
        icon: null,
        onRemove: () => onFiltersChange({ ...filters, category: "all" }),
      });
    }

    if (filters.isVerified !== undefined) {
      chips.push({
        id: "verified",
        label: filters.isVerified ? "Doğrulanmış" : "Doğrulanmamış",
        icon: <Shield className="w-3 h-3" />,
        onRemove: () => onFiltersChange({ ...filters, isVerified: undefined }),
      });
    }

    if (filters.location) {
      chips.push({
        id: "location",
        label: filters.location,
        icon: <MapPin className="w-3 h-3" />,
        onRemove: () => onFiltersChange({ ...filters, location: undefined }),
      });
    }

    if (filters.dateRange) {
      chips.push({
        id: "dateRange",
        label: `${filters.dateRange.start} - ${filters.dateRange.end}`,
        icon: <Calendar className="w-3 h-3" />,
        onRemove: () => onFiltersChange({ ...filters, dateRange: undefined }),
      });
    }

    return chips;
  }, [filters, onFiltersChange]);

  // Staggered animation for filter chips
  const chipAnimations = useStaggeredAnimation(filterChips, 100);

  const handleRatingFilter = (rating: string) => {
    const ratingValue = rating === "all" ? undefined : parseInt(rating);
    onFiltersChange({ ...filters, rating: ratingValue });
  };

  const handleCategoryFilter = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category as FilterOptions["category"],
    });
  };

  const handleVerifiedFilter = (verified: string) => {
    const verifiedValue = verified === "all" ? undefined : verified === "true";
    onFiltersChange({ ...filters, isVerified: verifiedValue });
  };

  const handleLocationFilter = (location: string) => {
    const locationValue = location === "all" ? undefined : location;
    onFiltersChange({ ...filters, location: locationValue });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xs:p-6 space-y-4 hover:shadow-md transition-shadow duration-300"
      role="search"
      aria-label="Değerlendirme filtreleme araçları"
    >
      {/* Header with results count and mobile filter toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
          <h3 className="text-base xs:text-lg font-semibold text-gray-900 hover:text-primary transition-colors duration-200">
            Yorumları Filtrele
          </h3>
          <span
            className={`text-xs xs:text-sm text-gray-500 transition-all duration-300 ${
              isSearching ? 'animate-pulse text-primary' : ''
            }`}
            role="status"
            aria-live="polite"
          >
            {isSearching ? 'Aranıyor...' : `${totalResults} sonuç bulundu`}
          </span>
        </div>

        {/* Mobile filter toggle */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="group flex items-center gap-2 hover:scale-105 hover:shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filters"
            aria-label={`Filtreleri ${showMobileFilters ? "gizle" : "göster"}`}
          >
            <Filter
              className={`w-4 h-4 transition-transform duration-200 ${
                showMobileFilters ? 'rotate-180' : 'group-hover:rotate-12'
              }`}
              aria-hidden="true"
            />
            Filtreler
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0.5 text-xs animate-bounce-gentle"
                aria-label={`${activeFiltersCount} aktif filtre`}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop filters - always visible */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200 hover:text-primary">
              Ara
            </label>
            <div className="relative group">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-200 ${
                  isSearching ? 'text-primary animate-pulse' : 'text-gray-400 group-hover:text-primary'
                }`}
              />
              <Input
                type="text"
                placeholder="Yorum, kullanıcı adı veya tekne adı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm"
                  aria-label="Arama metnini temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puan
            </label>
            <Select
              value={filters.rating?.toString() || "all"}
              onValueChange={handleRatingFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tüm puanlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm puanlar</SelectItem>
                <SelectItem value="5">5 Yıldız</SelectItem>
                <SelectItem value="4">4 Yıldız</SelectItem>
                <SelectItem value="3">3 Yıldız</SelectItem>
                <SelectItem value="2">2 Yıldız</SelectItem>
                <SelectItem value="1">1 Yıldız</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konum
            </label>
            <Select
              value={filters.location || "all"}
              onValueChange={handleLocationFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tüm konumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm konumlar</SelectItem>
                <SelectItem value="İstanbul">İstanbul</SelectItem>
                <SelectItem value="Bodrum">Bodrum</SelectItem>
                <SelectItem value="Antalya">Antalya</SelectItem>
                <SelectItem value="Fethiye">Fethiye</SelectItem>
                <SelectItem value="Marmaris">Marmaris</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <Select
              value={filters.category || "all"}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tüm kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm kategoriler</SelectItem>
                <SelectItem value="boat">Tekne</SelectItem>
                <SelectItem value="tour">Tur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doğrulama
            </label>
            <Select
              value={
                filters.isVerified === undefined
                  ? "all"
                  : filters.isVerified.toString()
              }
              onValueChange={handleVerifiedFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Doğrulanmış</SelectItem>
                <SelectItem value="false">Doğrulanmamış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sırala
            </label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">En yeni</SelectItem>
                <SelectItem value="date-asc">En eski</SelectItem>
                <SelectItem value="rating-desc">En yüksek puan</SelectItem>
                <SelectItem value="rating-asc">En düşük puan</SelectItem>
                <SelectItem value="helpful-desc">En faydalı</SelectItem>
                <SelectItem value="helpful-asc">En az faydalı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {filterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200">
            Aktif filtreler:
          </span>
          {filterChips.map((chip, index) => (
            <div
              key={chip.id}
              className={`transition-all duration-300 ${
                chipAnimations[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <Badge
                variant="secondary"
                className="group flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105 hover:shadow-sm transition-all duration-200"
              >
                {chip.icon && (
                  <span className="group-hover:rotate-12 transition-transform duration-200">
                    {chip.icon}
                  </span>
                )}
                <span className="text-xs font-medium">{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="ml-1 hover:text-primary-dark hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm"
                  aria-label={`${chip.label} filtresini kaldır`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="group text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-2 py-1 h-auto text-xs focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
            aria-label="Tüm filtreleri temizle"
          >
            <RotateCcw className="w-3 h-3 mr-1 group-hover:rotate-180 transition-transform duration-300" />
            Tümünü temizle
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsFilterBar;