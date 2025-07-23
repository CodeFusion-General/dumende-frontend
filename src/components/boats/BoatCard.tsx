import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Bed, Calendar, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { BoatDTO } from "@/types/boat.types";

interface BoatCardProps {
  boat: BoatDTO;
  viewMode: "grid" | "list";
  isHourlyMode?: boolean;
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
}

// Default image helper function
const getBoatImageUrl = (boat: BoatDTO): string => {
  console.log("🚤 Loading image for boat:", boat.name, boat.id);
  console.log("🖼️ Boat images:", boat.images);

  // Backend'den gelen URL'i direkt kullan
  if (boat.images && boat.images.length > 0) {
    const primaryImage =
      boat.images.find((img) => img.isPrimary) || boat.images[0];
    if (primaryImage && primaryImage.imageUrl) {
      console.log("✅ Using boat's own image URL");
      return primaryImage.imageUrl;
    }
  }

  console.log("🔄 Using default image");
  // Fallback to default image
  return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
};

export const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  viewMode,
  isHourlyMode = false,
  isCompared = false,
  onCompareToggle,
  variant = "listing",
}) => {
  if (viewMode === "grid") {
    return (
      <BoatCardGrid
        boat={boat}
        isHourlyMode={isHourlyMode}
        isCompared={isCompared}
        onCompareToggle={onCompareToggle}
        variant={variant}
      />
    );
  }
  return (
    <BoatCardList
      boat={boat}
      isHourlyMode={isHourlyMode}
      isCompared={isCompared}
      onCompareToggle={onCompareToggle}
      variant={variant}
    />
  );
};

const BoatCardGrid: React.FC<{
  boat: BoatDTO;
  isHourlyMode: boolean;
  isCompared: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
}> = ({ boat, isHourlyMode, isCompared, onCompareToggle, variant = "listing" }) => {
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

  // Helper functions for conditional styling based on variant
  const getTextColor = (opacity?: string) => {
    if (variant === "homepage") {
      return opacity ? `text-white/${opacity}` : "text-white";
    }
    return opacity ? `text-gray-${opacity === "70" ? "600" : opacity === "80" ? "700" : opacity === "90" ? "800" : "500"}` : "text-gray-800";
  };

  const getBadgeStyles = () => {
    if (variant === "homepage") {
      return "glass-light text-white backdrop-blur-sm border border-white/20";
    }
    return "bg-white/90 text-gray-800 backdrop-blur-sm border border-gray-200/50";
  };

  const getCompareButtonStyles = () => {
    if (variant === "homepage") {
      return isCompared
        ? "bg-blue-500/80 text-white border border-blue-400/50"
        : "glass-light text-white border border-white/30 hover:bg-blue-500/60";
    }
    return isCompared
      ? "bg-blue-500 text-white border border-blue-400"
      : "bg-white/90 text-gray-800 border border-gray-300 hover:bg-blue-500 hover:text-white";
  };

  return (
    <GlassCard className="overflow-hidden animate-hover-lift group">
      {/* Image Section with Glass Overlay */}
      <div className="relative overflow-hidden h-60">
        <img
          src={imageUrl}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageUrl("/placeholder-boat.jpg")}
        />

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Boat type badge with glass effect */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${getBadgeStyles()}`}>
          <span className="text-sm font-medium">{boat.type}</span>
        </div>

        {/* Heart button with glass effect - Hidden on homepage */}
        {variant !== "homepage" && (
          <button className="absolute top-4 right-4 glass-light p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all duration-300 animate-ripple">
            <Heart className="h-5 w-5 text-red-400 hover:text-red-500 transition-colors" />
          </button>
        )}

        {/* Compare button with glass effect - Hidden on homepage */}
        {variant !== "homepage" && onCompareToggle && (
          <button
            onClick={() => onCompareToggle(boat.id.toString())}
            className={`absolute bottom-4 right-4 text-xs py-2 px-3 rounded-full backdrop-blur-sm transition-all duration-300 ${getCompareButtonStyles()}`}
          >
            {isCompared ? "Karşılaştırıldı" : "Karşılaştır"}
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-bold text-lg ${getTextColor()} group-hover:text-gradient transition-all duration-300`}>
            {boat.name}
          </h3>
          <div className={`flex items-center px-2 py-1 rounded-full ${getBadgeStyles()}`}>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium ml-1">
              {boat.rating || 0}
            </span>
          </div>
        </div>

        <div className={`text-sm ${getTextColor("70")} mb-4`}>{boat.location}</div>

        <div className="flex justify-between items-center mb-4">
          <div className={`flex items-center text-sm ${getTextColor("80")}`}>
            <Users className="h-4 w-4 mr-2 text-blue-400" />
            <span>
              {boat.capacity} {t.boats?.card?.person || "kişi"}
            </span>
          </div>
          <div className={`flex items-center text-sm ${getTextColor("80")}`}>
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            <span>{boat.buildYear || boat.year}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {boat.features?.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className={`text-xs px-3 py-1 rounded-full ${getBadgeStyles()}`}
            >
              {feature.featureName}
            </span>
          ))}
          {boat.features && boat.features.length > 3 && (
            <span className={`text-xs px-3 py-1 rounded-full ${getBadgeStyles()}`}>
              +{boat.features.length - 3}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-xl text-gradient">
              {price?.toLocaleString("tr-TR") || "0"} ₺
            </span>
            <span className={`text-sm ${getTextColor("60")} ml-1`}>/{priceUnit}</span>
          </div>
          <Link to={`/boats/${boat.id}`}>
            <Button className="glass-button bg-gradient-ocean text-white hover:bg-gradient-ocean-reverse font-medium px-6 py-2 animate-ripple">
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

const BoatCardList: React.FC<{
  boat: BoatDTO;
  isHourlyMode: boolean;
  isCompared: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
}> = ({ boat, isHourlyMode, isCompared, onCompareToggle, variant = "listing" }) => {
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

  // Helper functions for conditional styling based on variant
  const getTextColor = (opacity?: string) => {
    if (variant === "homepage") {
      return opacity ? `text-white/${opacity}` : "text-white";
    }
    return opacity ? `text-gray-${opacity === "70" ? "600" : opacity === "80" ? "700" : opacity === "90" ? "800" : "500"}` : "text-gray-800";
  };

  const getBadgeStyles = () => {
    if (variant === "homepage") {
      return "glass-light text-white backdrop-blur-sm border border-white/20";
    }
    return "bg-white/90 text-gray-800 backdrop-blur-sm border border-gray-200/50";
  };

  const getCompareButtonStyles = () => {
    if (variant === "homepage") {
      return isCompared
        ? "bg-blue-500/80 text-white border border-blue-400/50"
        : "glass-light text-white border border-white/30 hover:bg-blue-500/60";
    }
    return isCompared
      ? "bg-blue-500 text-white border border-blue-400"
      : "bg-white/90 text-gray-800 border border-gray-300 hover:bg-blue-500 hover:text-white";
  };

  return (
    <GlassCard className="flex flex-col md:flex-row h-full overflow-hidden animate-hover-lift group">
      {/* Image Section */}
      <div className="relative overflow-hidden md:w-1/3 h-48 md:h-auto">
        <img
          src={imageUrl}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageUrl("/placeholder-boat.jpg")}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent md:bg-gradient-to-t md:from-black/20 md:via-transparent md:to-transparent" />

        {/* Boat type badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full ${getBadgeStyles()}`}>
          <span className="text-sm font-medium">{boat.type}</span>
        </div>

        {/* Heart button - Hidden on homepage */}
        {variant !== "homepage" && (
          <button className="absolute top-4 right-4 glass-light p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all duration-300 animate-ripple">
            <Heart className="h-5 w-5 text-red-400 hover:text-red-500 transition-colors" />
          </button>
        )}

        {/* Compare button - Hidden on homepage */}
        {variant !== "homepage" && onCompareToggle && (
          <button
            onClick={() => onCompareToggle(boat.id.toString())}
            className={`absolute bottom-4 right-4 text-xs py-2 px-3 rounded-full backdrop-blur-sm transition-all duration-300 ${getCompareButtonStyles()}`}
          >
            {isCompared ? "Karşılaştırıldı" : "Karşılaştır"}
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-bold text-xl ${getTextColor()} group-hover:text-gradient transition-all duration-300`}>
              {boat.name}
            </h3>
            <div className={`text-sm ${getTextColor("70")} mb-2`}>{boat.location}</div>
          </div>
          <div className={`flex items-center px-2 py-1 rounded-full ${getBadgeStyles()}`}>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium ml-1">
              {boat.rating || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className={`flex items-center text-sm ${getTextColor("80")}`}>
            <Users className="h-4 w-4 mr-2 text-blue-400" />
            <span>{boat.capacity} Kişi</span>
          </div>
          <div className={`flex items-center text-sm ${getTextColor("80")}`}>
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            <span>{boat.buildYear || boat.year}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {boat.features?.map((feature, index) => (
            <span
              key={index}
              className={`text-xs px-3 py-1 rounded-full ${getBadgeStyles()}`}
            >
              {feature.featureName}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold text-xl text-gradient">
              {price?.toLocaleString("tr-TR") || "0"} ₺
            </span>
            <span className={`text-sm ${getTextColor("60")}`}>/{priceUnit}</span>
          </div>
          <div className="flex space-x-2">
            <Link to={`/boats/${boat.id}`}>
              <Button className={`glass-button border ${variant === "homepage" ? "border-white/30 text-white hover:bg-white/20" : "border-gray-300 text-gray-800 hover:bg-gray-100"} font-medium px-4 py-2`}>
                Detaylar
              </Button>
            </Link>
            <Link to={`/rezervasyon/${boat.id}`}>
              <Button className="glass-button bg-gradient-ocean text-white hover:bg-gradient-ocean-reverse font-medium px-4 py-2 animate-ripple">
                Rezervasyon <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
