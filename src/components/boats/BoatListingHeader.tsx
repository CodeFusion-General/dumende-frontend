import React from 'react';
import { Grid2X2, List, SlidersHorizontal } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

interface BoatListingHeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  totalBoats: number;
  isHourlyMode: boolean;
  setIsHourlyMode: (value: boolean) => void;
}

const BoatListingHeader: React.FC<BoatListingHeaderProps> = ({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  totalBoats,
  isHourlyMode,
  setIsHourlyMode
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold">
          {totalBoats} {t.pages.boats.boatsFound}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{t.pages.boats.hourly}</span>
          <Switch
            checked={!isHourlyMode}               // knob right => Günlük
            onCheckedChange={(checked) => setIsHourlyMode(!checked)}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className="text-sm">{t.pages.boats.daily}</span>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.pages.boats.popularity} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{t.pages.boats.sorting.popular}</SelectItem>
            <SelectItem value="price-low">{t.pages.boats.sorting.priceLow}</SelectItem>
            <SelectItem value="price-high">{t.pages.boats.sorting.priceHigh}</SelectItem>
            <SelectItem value="capacity">{t.pages.boats.sorting.capacity}</SelectItem>
            <SelectItem value="rating">{t.pages.boats.sorting.rating}</SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup type="single" value={viewMode} onValueChange={(mode) => mode && setViewMode(mode as 'grid' | 'list')}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid2X2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {t.pages.boats.showFilters}
        </Button>
      </div>
    </div>
  );
};

export default BoatListingHeader;
