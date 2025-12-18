import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoatDTO } from "@/types/boat.types";
import { getDefaultImageUrl } from "@/lib/imageUtils";

interface CompareBarProps {
  comparedBoats: string[];
  boats: BoatDTO[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const CompareBarComponent: React.FC<CompareBarProps> = ({
  comparedBoats,
  boats,
  onRemove,
  onClearAll,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {comparedBoats.map((id) => {
            const boat = boats.find((b) => b.id.toString() === id);
            return boat ? (
              <div key={id} className="flex items-center space-x-2">
                <img
                  src={
                    boat.images?.find((img) => img && img.imageUrl)
                      ? boat.images.find((img) => img && img.imageUrl)!.imageUrl
                      : getDefaultImageUrl()
                  }
                  alt={boat.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="font-medium">{boat.name}</span>
                <button
                  onClick={() => onRemove(id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  Kaldır
                </button>
              </div>
            ) : null;
          })}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onClearAll}
            className="text-gray-500 hover:text-gray-700"
          >
            Tümünü Temizle
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            onClick={() =>
              navigate(`/compare-boats?ids=${comparedBoats.join(",")}`)
            }
          >
            Karşılaştır ({comparedBoats.length})
          </button>
        </div>
      </div>
    </div>
  );
};

const CompareBar = React.memo(CompareBarComponent);

export default CompareBar;
