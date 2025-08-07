import React, { useState } from "react";
import {
  Ship,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BoatDTO } from "@/types/boat.types";
import { getFullImageUrl, getDefaultImageUrl } from "@/lib/imageUtils";

interface ModernBoatSelectorProps {
  boats: BoatDTO[];
  selectedBoat: BoatDTO | null;
  onBoatSelect: (boat: BoatDTO) => void;
  loading?: boolean;
}

const ModernBoatSelector: React.FC<ModernBoatSelectorProps> = ({
  boats,
  selectedBoat,
  onBoatSelect,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter boats based on search term
  const filteredBoats = boats.filter(
    (boat) =>
      boat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boat.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boat.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get boat image URL with fallback
  const getBoatImageUrl = (boat: BoatDTO): string => {
    if (boat.images && boat.images.length > 0) {
      const primaryImage =
        boat.images.find((img) => img.isPrimary) || boat.images[0];
      if (primaryImage && primaryImage.imageUrl) {
        return getFullImageUrl(primaryImage.imageUrl);
      }
    }
    return getDefaultImageUrl();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Ship className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Gemi Seçin</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-xl h-64"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Ship className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Gemi Seçin ({boats.length})
          </h3>
        </div>

        {boats.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Gemi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        )}
      </div>

      {/* Boats Grid */}
      {filteredBoats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Ship className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>
            {searchTerm
              ? "Arama kriterlerinize uygun gemi bulunamadı."
              : "Henüz kayıtlı geminiz bulunmamaktadır."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoats.map((boat) => (
            <BoatSelectorCard
              key={boat.id}
              boat={boat}
              isSelected={selectedBoat?.id === boat.id}
              onSelect={() => onBoatSelect(boat)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BoatSelectorCardProps {
  boat: BoatDTO;
  isSelected: boolean;
  onSelect: () => void;
}

const BoatSelectorCard: React.FC<BoatSelectorCardProps> = ({
  boat,
  isSelected,
  onSelect,
}) => {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    if (boat.images && boat.images.length > 0) {
      const primaryImage =
        boat.images.find((img) => img.isPrimary) || boat.images[0];
      if (primaryImage && primaryImage.imageUrl) {
        return getFullImageUrl(primaryImage.imageUrl);
      }
    }
    return getDefaultImageUrl();
  });

  const handleImageError = () => {
    setImageUrl(getDefaultImageUrl());
  };

  return (
    <GlassCard
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? "ring-2 ring-[#15847c] bg-[#15847c]/5 border-[#15847c]/20"
          : "hover:shadow-md border-gray-200"
      }`}
      onClick={onSelect}
    >
      <div className="relative overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <img
            src={imageUrl}
            alt={boat.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Boat type badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-gray-800 hover:bg-white">
              {boat.type}
            </Badge>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-3 right-3">
              <div className="bg-[#15847c] text-white rounded-full p-1.5">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Boat Name */}
          <div>
            <h4 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {boat.name}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-1">
              {boat.brandModel}
            </p>
          </div>

          {/* Boat Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4 text-[#15847c]" />
              <span className="line-clamp-1">{boat.location}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4 text-[#15847c]" />
              <span>{boat.capacity} kişi</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4 text-[#15847c]" />
              <span>{boat.buildYear || boat.year}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-4 w-4 text-[#15847c]" />
              <span>₺{boat.dailyPrice?.toLocaleString("tr-TR") || "0"}</span>
            </div>
          </div>

          {/* Features */}
          {boat.features && boat.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {boat.features.slice(0, 2).map((feature, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                >
                  {feature.featureName}
                </Badge>
              ))}
              {boat.features.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                >
                  +{boat.features.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Badge
              className={`text-xs ${
                boat.status === "ACTIVE"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }`}
            >
              {boat.status === "ACTIVE" ? "Aktif" : boat.status}
            </Badge>

            {isSelected && (
              <span className="text-xs font-medium text-[#15847c]">Seçili</span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ModernBoatSelector;
