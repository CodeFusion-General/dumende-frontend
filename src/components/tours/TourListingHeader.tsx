import React from "react";
import { Grid2X2, List, SlidersHorizontal, Search } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { useViewport } from "@/hooks/useResponsiveAnimations";
import { useTouchTarget } from "@/hooks/useMobileGestures";

interface TourListingHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  totalTours: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TourListingHeader: React.FC<TourListingHeaderProps> = ({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  totalTours,
  searchQuery,
  setSearchQuery,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const { isMobile } = useViewport();
  const { getTouchTargetProps } = useTouchTarget();

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 font-montserrat">
          {totalTours} Tur Bulundu
        </h2>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tur adı, lokasyon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30 focus:bg-white/80 transition-all duration-300 h-10 sm:h-auto"
            {...(isMobile ? getTouchTargetProps(44) : {})}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 w-full lg:w-auto justify-between lg:justify-end">
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger
            className="w-[140px] sm:w-[180px] bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-300 h-10 sm:h-auto text-sm sm:text-base"
            {...(isMobile ? getTouchTargetProps(44) : {})}
          >
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border border-white/30">
            <SelectItem value="popular">Popülerlik</SelectItem>
            <SelectItem value="price-low">Fiyat (Düşük)</SelectItem>
            <SelectItem value="price-high">Fiyat (Yüksek)</SelectItem>
            <SelectItem value="rating">Değerlendirme</SelectItem>
            <SelectItem value="duration">Süre</SelectItem>
            <SelectItem value="capacity">Kapasite</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(mode) => mode && setViewMode(mode as "grid" | "list")}
          className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg"
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Grid view"
            className="data-[state=on]:bg-[#3498db] data-[state=on]:text-white hover:bg-white/80 transition-all duration-300 h-10 w-10 sm:h-auto sm:w-auto p-2 sm:p-2.5"
            {...(isMobile ? getTouchTargetProps(44) : {})}
          >
            <Grid2X2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className="data-[state=on]:bg-[#3498db] data-[state=on]:text-white hover:bg-white/80 transition-all duration-300 h-10 w-10 sm:h-auto sm:w-auto p-2 sm:p-2.5"
            {...(isMobile ? getTouchTargetProps(44) : {})}
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Filter Toggle for Mobile */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-300 h-10 px-3 sm:px-4 text-sm sm:text-base"
          {...getTouchTargetProps(44)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Filtreler</span>
        </Button>
      </div>
    </div>
  );
};

export default TourListingHeader;
