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

interface BoatListingHeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  totalBoats: number;
}

const BoatListingHeader: React.FC<BoatListingHeaderProps> = ({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  totalBoats
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold">
          {totalBoats} Tekne Bulundu
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popülerlik</SelectItem>
            <SelectItem value="price-asc">Fiyat (Artan)</SelectItem>
            <SelectItem value="price-desc">Fiyat (Azalan)</SelectItem>
            <SelectItem value="newest">En Yeni</SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
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
          className="flex items-center space-x-2"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <span>{showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}</span>
        </Button>
      </div>
    </div>
  );
};

export default BoatListingHeader;
