import React from "react";
import { Star, Users, Anchor } from "lucide-react";
import { Link } from "react-router-dom";
import { BoatDTO } from "@/types/boat.types";
import { getImageUrl, getPrimaryImageUrl } from "@/lib/imageUtils";

// Eski format için backward compatibility interface
interface LegacyBoat {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  location: string;
  capacity: number;
  price: number;
  priceUnit: "day" | "hour";
  rating: number;
}

interface BoatCardProps {
  boat?: BoatDTO | LegacyBoat | any; // Flexible boat type
  viewMode?: "grid" | "list";
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
  // Legacy props for backward compatibility
  id?: string;
  name?: string;
  type?: string;
  imageUrl?: string;
  location?: string;
  capacity?: number;
  price?: number;
  priceUnit?: "day" | "hour";
  rating?: number;
}

const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  viewMode = "grid",
  isCompared = false,
  onCompareToggle = () => {},
  // Legacy props
  id,
  name,
  type,
  imageUrl,
  location,
  capacity,
  price,
  priceUnit = "day",
  rating,
}) => {
  // Legacy mode - if boat prop is not provided but individual props are
  const isLegacyMode = !boat && (id || name);

  // Normalize data for both formats
  const normalizedBoat = isLegacyMode
    ? {
        id: id || "",
        name: name || "İsimsiz Tekne",
        type: type || "Tekne",
        location: location || "Konum belirtilmemiş",
        capacity: capacity || 0,
        dailyPrice: price || 0,
        rating: rating || 0,
        images: imageUrl ? [{ imageData: imageUrl, isPrimary: true }] : [],
      }
    : boat;

  // Null/undefined kontrolü
  if (!normalizedBoat) {
    return (
      <div className="group bg-white rounded-xl shadow-md overflow-hidden p-4">
        <div className="text-gray-500 text-center">Tekne verisi bulunamadı</div>
      </div>
    );
  }

  const handleType = (type: string) => {
    switch (type) {
      case "SAILBOAT":
        return "Yelkenli Tekne";
      case "MOTORBOAT":
        return "Motorlu Tekne";
      case "SPEEDBOAT":
        return "Hız Teknesi";
      case "YACHT":
        return "Yat";
      default:
        return "Tekne";
    }
  };

  // Get primary image URL or fallback
  const getImageUrl_component = () => {
    if (isLegacyMode && imageUrl) return imageUrl;
    if (normalizedBoat.images && normalizedBoat.images.length > 0) {
      // Geçerli fotoğrafları filtrele
      const validImages = normalizedBoat.images.filter((img) => img && img.id);
      if (validImages.length === 0) return "/placeholder-boat.jpg";

      const primaryImage = validImages.find((img) => img.isPrimary);
      if (primaryImage) {
        return getImageUrl(primaryImage.id);
      }
      // Fallback to first valid image
      return getImageUrl(validImages[0].id);
    }
    return "/placeholder-boat.jpg";
  };

  const imageUrl_final = getImageUrl_component();

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden h-48">
        <img
          src={imageUrl_final}
          alt={normalizedBoat.name || "Tekne"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
       {/* <div className="absolute top-3 right-3 bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-bold">
          {normalizedBoat.type || "Tekne"}
        </div> */}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800">
            {normalizedBoat.name || "İsimsiz Tekne"}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-accent" fill="#F8CB2E" />
            <span className="text-gray-700 font-medium">
              {(normalizedBoat.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-3">
          {normalizedBoat.location || "Konum belirtilmemiş"}
        </p>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-1" />
            <span className="text-sm">{normalizedBoat.capacity || 0} kişi</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Anchor size={16} className="mr-1" />
            <span className="text-sm">{handleType(normalizedBoat.type)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-bold text-primary">
            {normalizedBoat.dailyPrice || price || 0} ₺
            <span className="text-gray-400 text-sm font-normal">
              /{isLegacyMode && priceUnit === "hour" ? "saat" : "gün"}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() =>
                onCompareToggle((normalizedBoat.id || 0).toString())
              }
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isCompared
                  ? "bg-accent text-accent-foreground"
                  : "border border-gray-300 hover:border-accent hover:text-accent"
              }`}
            >
              {isCompared ? "Karşılaştırılıyor" : "Karşılaştır"}
            </button>

            <Link
              to={`/boats/${normalizedBoat.id || 0}`}
              className="text-primary border border-primary hover:bg-primary hover:text-white rounded-lg px-4 py-1.5 transition-all duration-300 text-sm font-medium"
            >
              İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatCard;
