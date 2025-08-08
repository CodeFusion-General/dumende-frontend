import React from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoTourResultsProps {
  onReset: () => void;
  searchQuery?: string;
  hasActiveFilters: boolean;
}

const NoTourResults: React.FC<NoTourResultsProps> = ({
  onReset,
  searchQuery,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-sm text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 font-montserrat">
          {searchQuery ? "Arama sonucu bulunamadı" : "Tur bulunamadı"}
        </h3>

        <p className="text-gray-600 mb-6 font-roboto">
          {searchQuery
            ? `"${searchQuery}" için tur bulunamadı. Farklı anahtar kelimeler deneyin.`
            : hasActiveFilters
            ? "Seçtiğiniz filtrelere uygun tur bulunamadı. Filtreleri değiştirmeyi deneyin."
            : "Henüz tur bulunmuyor. Daha sonra tekrar kontrol edin."}
        </p>

        <div className="space-y-3">
          {hasActiveFilters && (
            <Button
              onClick={onReset}
              className="w-full bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg font-montserrat"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreleri Temizle
            </Button>
          )}

          <div className="flex flex-col space-y-2 text-sm text-gray-500 font-roboto">
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Farklı lokasyonları deneyin</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Daha genel anahtar kelimeler kullanın</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoTourResults;
