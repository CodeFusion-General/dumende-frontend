
import React from 'react';
import { Search } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, List } from 'lucide-react';

interface BoatListingHeaderProps {
  boatCount: number;
  sortBy: string;
  viewMode: 'grid' | 'list';
  onSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  setViewMode: (value: 'grid' | 'list') => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const BoatListingHeader: React.FC<BoatListingHeaderProps> = ({
  boatCount,
  sortBy,
  viewMode,
  onSortChange,
  setViewMode,
  onSearch,
  searchQuery = '',
  setSearchQuery
}) => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
        <form onSubmit={handleSearch} className="relative flex-grow md:w-auto mr-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Tekne adı veya türü ara..." 
            className="w-full border border-gray-300 rounded-md pl-10 py-2 pr-4 focus:ring-brand-primary focus:border-brand-primary"
          />
          <button type="submit" className="absolute left-3 top-2.5 border-0 bg-transparent p-0">
            <Search className="h-5 w-5 text-gray-400" />
          </button>
        </form>
        
        <select 
          className="border border-gray-300 rounded-md py-2 px-4 focus:ring-brand-primary focus:border-brand-primary bg-white"
          value={sortBy}
          onChange={onSortChange}
        >
          <option value="popular">Popülerlik</option>
          <option value="price-asc">Fiyat (Artan)</option>
          <option value="price-desc">Fiyat (Azalan)</option>
          <option value="newest">Yeni Eklenenler</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
        <div className="text-sm text-gray-600">
          {boatCount} tekne bulundu
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid2X2 className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

export default BoatListingHeader;
