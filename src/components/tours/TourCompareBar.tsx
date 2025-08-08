import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourDTO } from "@/types/tour.types";
import { getDefaultImageUrl, getFullImageUrl } from "@/lib/imageUtils";

interface TourCompareBarProps {
  comparedTours: string[];
  tours: TourDTO[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const TourCompareBar: React.FC<TourCompareBarProps> = ({
  comparedTours,
  tours,
  onRemove,
  onClearAll,
}) => {
  const navigate = useNavigate();

  const getTourImageUrl = (tour: TourDTO): string => {
    if (tour.tourImages && tour.tourImages.length > 0) {
      const firstImage = tour.tourImages[0];
      if (firstImage && firstImage.imageUrl) {
        return getFullImageUrl(firstImage.imageUrl);
      }
    }
    return getDefaultImageUrl();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-2xl border-t border-gray-200/50 p-4 z-50 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {comparedTours.map((id) => {
            const tour = tours.find((t) => t.id.toString() === id);
            return tour ? (
              <div
                key={id}
                className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 min-w-fit"
              >
                <img
                  src={getTourImageUrl(tour)}
                  alt={tour.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 text-sm font-montserrat line-clamp-1">
                    {tour.name}
                  </span>
                  <span className="text-xs text-gray-600 font-roboto">
                    {tour.price.toLocaleString()} ₺
                  </span>
                </div>
                <button
                  onClick={() => onRemove(id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null;
          })}
        </div>

        <div className="flex items-center space-x-4 ml-4">
          <button
            onClick={onClearAll}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 font-roboto text-sm"
          >
            Tümünü Temizle
          </button>
          <Button
            className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg font-montserrat"
            onClick={() =>
              navigate(`/compare-tours?ids=${comparedTours.join(",")}`)
            }
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Karşılaştır ({comparedTours.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TourCompareBar;
