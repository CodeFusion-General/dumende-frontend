import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Bed, Calendar, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { BoatDTO } from "@/types/boat.types";

interface BoatCardProps {
  boat: BoatDTO;
  viewMode: "grid" | "list";
  isHourlyMode?: boolean;
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
}

// Default image helper function
const getBoatImageUrl = async (boat: BoatDTO): Promise<string> => {
  console.log("🚤 Loading image for boat:", boat.name, boat.id);
  console.log("🖼️ Boat images:", boat.images);

  try {
    // Önce boat'ın kendi image'ını dene
    if (boat.images && boat.images.length > 0) {
      const primaryImage = boat.images.find((img) => img.isPrimary) || boat.images[0];
      if (primaryImage && primaryImage.imageData) {
        console.log("✅ Using boat's own image");
        return primaryImage.imageData;
      }
    }

    console.log("⚠️ No boat images found, fetching default image from API");
    // Eğer image yoksa default image API'sinden al
    const response = await fetch("http://localhost:8080/api/boats/default-image");
    console.log("🌐 Default image API response:", response.status, response.ok);

    if (response.ok) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log("✅ Default image loaded successfully:", imageUrl);
      return imageUrl;
    } else {
      console.error("❌ Default image API failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("💥 Error loading boat image:", error);
  }

  console.log("🔄 Using fallback placeholder");
  // Fallback placeholder
  return "/placeholder-boat.jpg";
};

export const BoatCard: React.FC<BoatCardProps> = ({ boat, viewMode, isHourlyMode = false, isCompared = false, onCompareToggle }) => {
  if (viewMode === "grid") {
    return <BoatCardGrid boat={boat} isHourlyMode={isHourlyMode} isCompared={isCompared} onCompareToggle={onCompareToggle} />;
  }
  return <BoatCardList boat={boat} isHourlyMode={isHourlyMode} isCompared={isCompared} onCompareToggle={onCompareToggle} />;
};

const BoatCardGrid: React.FC<{ boat: BoatDTO; isHourlyMode: boolean; isCompared: boolean; onCompareToggle?: (id: string) => void }> = ({
  boat, isHourlyMode, isCompared, onCompareToggle
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [imageUrl, setImageUrl] = useState<string>("/placeholder-boat.jpg");

  useEffect(() => {
    const loadImage = async () => {
      const url = await getBoatImageUrl(boat);
      setImageUrl(url);
    };
    loadImage();
  }, [boat]);

  const price = isHourlyMode ? boat.hourlyPrice : boat.dailyPrice;
  const priceUnit = isHourlyMode ? "saat" : "gün";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
      <div className="relative overflow-hidden h-60">
        <img
          src={imageUrl}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={() => setImageUrl("/placeholder-boat.jpg")}
        />
        <div className="absolute top-4 left-4 bg-yellow-500 text-gray-800 font-medium text-sm py-1 px-3 rounded-full">
          {boat.type}
        </div>
        <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
          <Heart className="h-5 w-5 text-red-500" />
        </button>
        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(boat.id.toString())}
            className={`absolute bottom-4 right-4 text-xs py-1 px-2 rounded ${
              isCompared ? 'bg-blue-600 text-white' : 'bg-white/80 text-blue-600'
            }`}
          >
            {isCompared ? 'Karşılaştırıldı' : 'Karşılaştır'}
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800">
            {boat.name}
          </h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1">{boat.rating || 0}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-3">{boat.location}</div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{boat.capacity} {t.boats?.card?.person || 'kişi'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{boat.buildYear || boat.year}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {boat.features?.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700"
            >
              {feature.featureName}
            </span>
          ))}
          {boat.features && boat.features.length > 3 && (
            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
              +{boat.features.length - 3}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg text-blue-600">
              {price?.toLocaleString("tr-TR") || "0"} ₺
            </span>
            <span className="text-sm text-gray-500">/{priceUnit}</span>
          </div>
          <Link to={`/boats/${boat.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const BoatCardList: React.FC<{ boat: BoatDTO; isHourlyMode: boolean; isCompared: boolean; onCompareToggle?: (id: string) => void }> = ({
  boat, isHourlyMode, isCompared, onCompareToggle
}) => {
  const [imageUrl, setImageUrl] = useState<string>("/placeholder-boat.jpg");

  useEffect(() => {
    const loadImage = async () => {
      const url = await getBoatImageUrl(boat);
      setImageUrl(url);
    };
    loadImage();
  }, [boat]);

  const price = isHourlyMode ? boat.hourlyPrice : boat.dailyPrice;
  const priceUnit = isHourlyMode ? "saat" : "gün";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl flex flex-col md:flex-row h-full">
      <div className="relative overflow-hidden md:w-1/3">
        <img
          src={imageUrl}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={() => setImageUrl("/placeholder-boat.jpg")}
        />
        <div className="absolute top-4 left-4 bg-yellow-500 text-gray-800 font-medium text-sm py-1 px-3 rounded-full">
          {boat.type}
        </div>
        <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
          <Heart className="h-5 w-5 text-red-500" />
        </button>
        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(boat.id.toString())}
            className={`absolute bottom-4 right-4 text-xs py-1 px-2 rounded ${
              isCompared ? 'bg-blue-600 text-white' : 'bg-white/80 text-blue-600'
            }`}
          >
            {isCompared ? 'Karşılaştırıldı' : 'Karşılaştır'}
          </button>
        )}
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-xl text-gray-800">
              {boat.name}
            </h3>
            <div className="text-sm text-gray-500 mb-2">{boat.location}</div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1">{boat.rating || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-blue-600" />
            <span>{boat.capacity} Kişi</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            <span>{boat.buildYear || boat.year}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {boat.features?.map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700"
            >
              {feature.featureName}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold text-xl text-blue-600">
              {price?.toLocaleString("tr-TR") || "0"} ₺
            </span>
            <span className="text-sm text-gray-500">/{priceUnit}</span>
          </div>
          <div className="flex space-x-2">
            <Link to={`/boats/${boat.id}`}>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Detaylar
              </Button>
            </Link>
            <Link to={`/rezervasyon/${boat.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Rezervasyon <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
