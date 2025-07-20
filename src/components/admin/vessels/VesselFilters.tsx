import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Anchor, Users } from "lucide-react";

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
    <div className="relative">
      {/* Modern Filter Container */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        {/* Filter Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-primary/10">
            <Filter className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Input */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tekne Ara
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
              <Input
                placeholder="Tekne adı yazın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-gray-500" />
              Taşıt Tipi
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300">
                <SelectValue placeholder="Tüm Tipler" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                <SelectItem value="all" className="rounded-lg">Tüm Tipler</SelectItem>
                <SelectItem value="Yelkenli" className="rounded-lg">Yelkenli</SelectItem>
                <SelectItem value="Motor Bot" className="rounded-lg">Motor Bot</SelectItem>
                <SelectItem value="Yat" className="rounded-lg">Yat</SelectItem>
                <SelectItem value="Hız Teknesi" className="rounded-lg">Hız Teknesi</SelectItem>
                <SelectItem value="Katamaran" className="rounded-lg">Katamaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Capacity Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              Kapasite
            </label>
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300">
                <SelectValue placeholder="Tüm Kapasiteler" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                <SelectItem value="all" className="rounded-lg">Tüm Kapasiteler</SelectItem>
                <SelectItem value="1-6" className="rounded-lg">1-6 kişi</SelectItem>
                <SelectItem value="7-12" className="rounded-lg">7-12 kişi</SelectItem>
                <SelectItem value="13-20" className="rounded-lg">13-20 kişi</SelectItem>
                <SelectItem value="21+" className="rounded-lg">21+ kişi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-lg" />
      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-md" />
    </div>
  );
};

export default VesselFilters;
