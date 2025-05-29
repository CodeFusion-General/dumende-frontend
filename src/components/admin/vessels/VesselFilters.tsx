import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface VesselFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  capacityFilter: string;
  setCapacityFilter: (capacity: string) => void;
}

const VesselFilters: React.FC<VesselFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  capacityFilter,
  setCapacityFilter,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4">
      <div className="relative flex-grow min-w-[200px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tekne adı ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-auto">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Taşıt Tipi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Tipler</SelectItem>
            <SelectItem value="Yelkenli">Yelkenli</SelectItem>
            <SelectItem value="Motor Bot">Motor Bot</SelectItem>
            <SelectItem value="Yat">Yat</SelectItem>
            <SelectItem value="Hız Teknesi">Hız Teknesi</SelectItem>
            <SelectItem value="Katamaran">Katamaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <Select value={capacityFilter} onValueChange={setCapacityFilter}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Kapasite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kapasiteler</SelectItem>
            <SelectItem value="1-6">1-6 kişi</SelectItem>
            <SelectItem value="7-12">7-12 kişi</SelectItem>
            <SelectItem value="13-20">13-20 kişi</SelectItem>
            <SelectItem value="21+">21+ kişi</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VesselFilters;
