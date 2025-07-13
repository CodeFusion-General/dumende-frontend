import React from "react";
import { Star, Users, Anchor } from "lucide-react";
import { Link } from "react-router-dom";
import { BoatDTO } from "@/types/boat.types";
import { getImageUrl, getPrimaryImageUrl } from "@/lib/imageUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

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
  /** Determines whether the card should show hourly or daily pricing */
  isHourlyMode?: boolean;
}

const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  viewMode = "grid",
  isCompared = false,
  onCompareToggle = () => {},
  isHourlyMode = false,
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
  const { language } = useLanguage();
  const t = translations[language];

  // Determine data source and normalize
  const boatData = {
    id: boat?.id || id || "",
    name: boat?.name || name || "Unknown Boat",
    type: boat?.type || type || "Unknown",
    location: boat?.location || location || "Unknown Location",
    capacity: boat?.capacity || capacity || 0,
    rating: boat?.rating || rating || 0,
    price: boat?.dailyPrice || boat?.price || price || 0,
    hourlyPrice: boat?.hourlyPrice || (boat?.dailyPrice || boat?.price || price || 0) / 8,
  };

  const handleType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      "Yelkenli": "SAILBOAT",
      "Motor Bot": "MOTORBOAT", 
      "Motorlu Tekne": "MOTORBOAT",
      "Yat": "YACHT",
      "Hız Teknesi": "SPEEDBOAT",
      "Katamaran": "CATAMARAN",
    };
    
    // Type mapping için önce çeviri tablosunu kullan
    return t.pages.boats.filters.types[type as keyof typeof t.pages.boats.filters.types] || 
           t.pages.boats.filters.types[typeMap[type] as keyof typeof t.pages.boats.filters.types] || 
           type;
  };

  const displayPrice = isHourlyMode ? boatData.hourlyPrice : boatData.price;
  const priceLabel = isHourlyMode ? t.pages.boats.card.hourlyPrice : t.pages.boats.card.dailyPrice;

  const getImageUrl_component = () => {
    // Backend henüz hazır olmadığı için API çağrılarını yorum satırına alıyoruz
    // if (boat?.images?.length > 0) {
    //   return getPrimaryImageUrl(boat.id); // Düzeltme: boat.images yerine boat.id
    // }
    if (boat?.imageUrl || imageUrl) {
      return boat?.imageUrl || imageUrl;
    }
    return "/placeholder-boat.jpg";
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
        <div className="w-1/3">
          <img
            src={getImageUrl_component()}
            alt={boatData.name}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-800">{boatData.name}</h3>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm text-gray-600">{boatData.rating}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-2">{boatData.location}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{boatData.capacity} {t.pages.boats.card.person}</span>
              </div>
              <div className="flex items-center">
                <Anchor className="w-4 h-4 mr-1" />
                <span>{handleType(boatData.type)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                {displayPrice.toLocaleString()} {priceLabel}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onCompareToggle(boatData.id.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCompared
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.pages.boats.card.compare}
              </button>
              <Link
                to={`/boats/${boatData.id}`}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {t.pages.boats.card.viewDetails}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={getImageUrl_component()}
          alt={boatData.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{boatData.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm text-gray-600">{boatData.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-3">{boatData.location}</p>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{boatData.capacity} {t.pages.boats.card.person}</span>
          </div>
          <div className="flex items-center">
            <Anchor className="w-4 h-4 mr-1" />
            <span>{handleType(boatData.type)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-right">
            <span className="text-xl font-bold text-primary">
              {displayPrice.toLocaleString()} {priceLabel}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onCompareToggle(boatData.id.toString())}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isCompared
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.pages.boats.card.compare}
            </button>
            <Link
              to={`/boats/${boatData.id}`}
              className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary-dark transition-colors"
            >
              {t.pages.boats.card.viewDetails}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatCard;
