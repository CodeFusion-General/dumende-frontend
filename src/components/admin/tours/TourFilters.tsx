
import React from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface TourFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  durationFilter: string;
  setDurationFilter: (duration: string) => void;
  priceFilter: string;
  setPriceFilter: (price: string) => void;
}

const TourFilters: React.FC<TourFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  locationFilter,
  setLocationFilter,
  durationFilter,
  setDurationFilter,
  priceFilter,
  setPriceFilter
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4">
      <div className="relative flex-grow min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tur adı veya lokasyon ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="w-full sm:w-auto">
        <Select 
          value={locationFilter} 
          onValueChange={setLocationFilter}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Lokasyon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Lokasyonlar</SelectItem>
            <SelectItem value="İstanbul">İstanbul</SelectItem>
            <SelectItem value="Bodrum">Bodrum</SelectItem>
            <SelectItem value="Fethiye">Fethiye</SelectItem>
            <SelectItem value="Marmaris">Marmaris</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <Select 
          value={durationFilter} 
          onValueChange={setDurationFilter}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Süre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Süreler</SelectItem>
            <SelectItem value="1-2">1-2 Saat</SelectItem>
            <SelectItem value="3-5">3-5 Saat</SelectItem>
            <SelectItem value="6+">6+ Saat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <Select 
          value={priceFilter} 
          onValueChange={setPriceFilter}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Fiyat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Fiyatlar</SelectItem>
            <SelectItem value="0-1000">0-1000 ₺</SelectItem>
            <SelectItem value="1000-3000">1000-3000 ₺</SelectItem>
            <SelectItem value="3000+">3000+ ₺</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TourFilters;
