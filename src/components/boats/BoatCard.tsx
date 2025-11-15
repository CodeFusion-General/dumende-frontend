import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Bed, Calendar, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { BoatDTO } from "@/types/boat.types";
import { getFullImageUrl, getDefaultImageUrl } from "@/lib/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { boatService } from "@/services/boatService";

interface BoatCardProps {
  boat: BoatDTO;
  viewMode: "grid" | "list";
  isHourlyMode?: boolean;
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
  // Detay sayfası linkini özelleştirmek için (örn. arama parametrelerini korumak)
  detailLinkBuilder?: (boat: BoatDTO) => string;
}

// ✅ OPTIMIZED: Memoized image URL getter to prevent recalculation
const getBoatImageUrl = (boat: BoatDTO): string => {
  // Backend'den gelen URL'i tam URL'e çevir
  if (boat.images && boat.images.length > 0) {
    const primaryImage =
      boat.images.find((img) => img.isPrimary) || boat.images[0];
    if (primaryImage && primaryImage.imageUrl) {
      return getFullImageUrl(primaryImage.imageUrl);
    }
  }

  // Fallback to default image
  return getDefaultImageUrl();
};

export const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  viewMode,
  isHourlyMode = false,
  isCompared = false,
  onCompareToggle,
  variant = "listing",
  detailLinkBuilder,
}) => {
  if (viewMode === "grid") {
    return (
      <BoatCardGrid
        boat={boat}
        isHourlyMode={isHourlyMode}
        isCompared={isCompared}
        onCompareToggle={onCompareToggle}
        variant={variant}
        detailLinkBuilder={detailLinkBuilder}
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
      detailLinkBuilder={detailLinkBuilder}
    />
  );
};

const BoatCardGrid: React.FC<{
  boat: BoatDTO;
  isHourlyMode: boolean;
  isCompared: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
  detailLinkBuilder?: (boat: BoatDTO) => string;
}> = React.memo(({
  boat,
  isHourlyMode,
  isCompared,
  onCompareToggle,
  variant = "listing",
  detailLinkBuilder,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();

  // ✅ OPTIMIZED: Use useMemo instead of useEffect to prevent re-renders
  const imageUrl = useMemo(() => getBoatImageUrl(boat), [boat.id, boat.images]);
  const [imageError, setImageError] = useState(false);

  // ✅ OPTIMIZED: Memoize computed values
  const price = useMemo(() => isHourlyMode ? boat.hourlyPrice : boat.dailyPrice, [isHourlyMode, boat.hourlyPrice, boat.dailyPrice]);
  const priceUnit = useMemo(() => isHourlyMode ? "saat" : "gün", [isHourlyMode]);

  // Memoized helper functions for modern glass styling
  const getTextColor = useMemo(() => (opacity?: string) => {
    return opacity
      ? `text-gray-${
          opacity === "70"
            ? "600"
            : opacity === "80"
            ? "700"
            : opacity === "90"
            ? "800"
            : "500"
        }`
      : "text-[#2c3e50]";
  }, []);

  const badgeStyles = "bg-white/60 text-[#2c3e50] backdrop-blur-sm border border-white/30 shadow-sm font-roboto";

  const compareButtonStyles = useMemo(() =>
    isCompared
      ? "bg-[#3498db] text-white border border-[#3498db]/50 shadow-md"
      : "bg-white/60 text-[#2c3e50] border border-white/30 hover:bg-[#3498db] hover:text-white shadow-sm"
  , [isCompared]);

  const displayImageUrl = useMemo(() => imageError ? "/placeholder-boat.jpg" : imageUrl, [imageError, imageUrl]);

  // Prefetch boat detail on hover/focus
  // NOTE: queryKey ikinci parametre olarak her zaman sayısal boatId kullanıyoruz.
  // Böylece `BoatListing` içindeki detay sorgusu ile aynı cache key'i paylaşır.
  const prefetchBoat = useCallback(() => {
    const numericBoatId = Number(boat.id);
    if (!numericBoatId) return;

    queryClient.prefetchQuery({
      queryKey: ["boat", numericBoatId],
      queryFn: () => boatService.getBoatById(numericBoatId),
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient, boat.id]);

  return (
    <GlassCard className="overflow-hidden animate-hover-lift group bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      {/* Image Section with Glass Overlay */}
      <div className="relative overflow-hidden h-60 flex-shrink-0">
        <img
          src={displayImageUrl}
          alt={boat.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        {/* Enhanced gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Boat type badge with enhanced glass effect */}
        <div
          className={`absolute top-4 left-4 px-3 py-1.5 rounded-full ${badgeStyles} font-medium`}
        >
          <span className="text-sm">{boat.type}</span>
        </div>

        {/* Heart button with enhanced glass effect - Hidden on homepage */}
        {variant !== "homepage" && (
          <button className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm p-2 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 animate-ripple shadow-md">
            <Heart className="h-5 w-5 text-red-500 hover:text-red-600 transition-colors" />
          </button>
        )}

        {/* Compare button with enhanced glass effect - Hidden on homepage */}
        {variant !== "homepage" && onCompareToggle && (
          <button
            onClick={() => onCompareToggle(boat.id.toString())}
            className={`absolute bottom-4 right-4 text-xs py-2 px-3 rounded-full backdrop-blur-sm transition-all duration-300 font-montserrat font-medium ${compareButtonStyles}`}
          >
            {isCompared ? "Karşılaştırıldı" : "Karşılaştır"}
          </button>
        )}
      </div>

      {/* Content Section with enhanced styling - Flexible height */}
      <div className="p-6 bg-gradient-to-b from-white/20 to-white/40 backdrop-blur-sm flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3
            className={`font-bold text-lg ${getTextColor()} group-hover:text-[#3498db] transition-all duration-300 font-montserrat line-clamp-2 flex-1 mr-2`}
          >
            {boat.name}
          </h3>
          <div
            className={`flex items-center px-2.5 py-1.5 rounded-full ${getBadgeStyles()} flex-shrink-0`}
          >
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1">{boat.rating || 0}</span>
          </div>
        </div>

        <div
          className={`text-sm ${getTextColor(
            "70"
          )} mb-4 font-roboto line-clamp-1`}
        >
          {boat.location}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div
            className={`flex items-center text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Users className="h-4 w-4 mr-2 text-[#3498db]" />
            <span>
              {boat.capacity} {t.boats?.card?.person || "kişi"}
            </span>
          </div>
          <div
            className={`flex items-center text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Calendar className="h-4 w-4 mr-2 text-[#3498db]" />
            <span>{boat.buildYear || boat.year}</span>
          </div>
        </div>

        {/* Features section with consistent height */}
        <div className="flex-1 mb-6">
          <div className="flex flex-wrap gap-2 h-16 overflow-hidden items-start content-start">
            {boat.features?.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className={`text-xs px-3 py-1.5 rounded-full ${getBadgeStyles()} line-clamp-1 whitespace-nowrap`}
              >
                {feature.featureName}
              </span>
            ))}
            {boat.features && boat.features.length > 3 && (
              <span
                className={`text-xs px-3 py-1.5 rounded-full ${getBadgeStyles()} whitespace-nowrap`}
              >
                +{boat.features.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Price and button section - Always at bottom with fixed position */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent font-montserrat">
              {price?.toLocaleString("tr-TR") || "0"} ₺
            </span>
            <span className={`text-sm ${getTextColor("60")} ml-1 font-roboto`}>
              /{priceUnit}
            </span>
          </div>
          <Link
            to={detailLinkBuilder ? detailLinkBuilder(boat) : `/boats/${boat.id}`}
            onMouseEnter={prefetchBoat}
            onFocus={prefetchBoat}
          >
            <Button className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-montserrat">
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}); // ✅ OPTIMIZED: Added React.memo closing bracket

const BoatCardList: React.FC<{
  boat: BoatDTO;
  isHourlyMode: boolean;
  isCompared: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
  detailLinkBuilder?: (boat: BoatDTO) => string;
}> = React.memo(({
  boat,
  isHourlyMode,
  isCompared,
  onCompareToggle,
  variant = "listing",
  detailLinkBuilder,
}) => {
  // ✅ OPTIMIZED: Use useMemo instead of useEffect to prevent re-renders
  const imageUrl = useMemo(() => getBoatImageUrl(boat), [boat.id, boat.images]);
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();

  // ✅ OPTIMIZED: Memoize computed values
  const price = useMemo(() => isHourlyMode ? boat.hourlyPrice : boat.dailyPrice, [isHourlyMode, boat.hourlyPrice, boat.dailyPrice]);
  const priceUnit = useMemo(() => isHourlyMode ? "saat" : "gün", [isHourlyMode]);

  // Memoized helper functions for modern glass styling
  const getTextColor = useMemo(() => (opacity?: string) => {
    return opacity
      ? `text-gray-${
          opacity === "70"
            ? "600"
            : opacity === "80"
            ? "700"
            : opacity === "90"
            ? "800"
            : "500"
        }`
      : "text-[#2c3e50]";
  }, []);

  const badgeStyles = "bg-white/60 text-[#2c3e50] backdrop-blur-sm border border-white/30 shadow-sm font-roboto";

  const compareButtonStyles = useMemo(() =>
    isCompared
      ? "bg-[#3498db] text-white border border-[#3498db]/50 shadow-md"
      : "bg-white/60 text-[#2c3e50] border border-white/30 hover:bg-[#3498db] hover:text-white shadow-sm"
  , [isCompared]);

  const displayImageUrl = useMemo(() => imageError ? "/placeholder-boat.jpg" : imageUrl, [imageError, imageUrl]);

  // Prefetch boat detail on hover/focus
  const prefetchBoat = useCallback(() => {
    const numericBoatId = Number(boat.id);
    if (!numericBoatId) return;

    queryClient.prefetchQuery({
      queryKey: ["boat", numericBoatId],
      queryFn: () => boatService.getBoatById(numericBoatId),
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient, boat.id]);

  return (
    <GlassCard className="flex flex-col md:flex-row h-full overflow-hidden animate-hover-lift group bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Image Section */}
      <div className="relative overflow-hidden md:w-1/3 h-48 md:h-auto">
        <img
          src={displayImageUrl}
          alt={boat.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent md:bg-gradient-to-t md:from-black/20 md:via-transparent md:to-transparent" />

        {/* Boat type badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full ${badgeStyles}`}
        >
          <span className="text-sm font-medium">{boat.type}</span>
        </div>

        {/* Heart button - Hidden on homepage */}
        {variant !== "homepage" && (
          <button className="absolute top-4 right-4 bg-white/60 backdrop-blur-sm p-2 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 animate-ripple shadow-md">
            <Heart className="h-5 w-5 text-red-500 hover:text-red-600 transition-colors" />
          </button>
        )}

        {/* Compare button - Hidden on homepage */}
        {variant !== "homepage" && onCompareToggle && (
          <button
            onClick={() => onCompareToggle(boat.id.toString())}
            className={`absolute bottom-4 right-4 text-xs py-2 px-3 rounded-full backdrop-blur-sm transition-all duration-300 ${compareButtonStyles}`}
          >
            {isCompared ? "Karşılaştırıldı" : "Karşılaştır"}
          </button>
        )}
      </div>

      {/* Content Section with enhanced styling */}
      <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white/20 to-white/40 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3
              className={`font-bold text-xl ${getTextColor()} group-hover:text-[#3498db] transition-all duration-300 font-montserrat`}
            >
              {boat.name}
            </h3>
            <div className={`text-sm ${getTextColor("70")} mb-2 font-roboto`}>
              {boat.location}
            </div>
          </div>
          <div
            className={`flex items-center px-2.5 py-1.5 rounded-full ${getBadgeStyles()}`}
          >
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium ml-1">{boat.rating || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div
            className={`flex items-center text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Users className="h-4 w-4 mr-2 text-[#3498db]" />
            <span>{boat.capacity} Kişi</span>
          </div>
          <div
            className={`flex items-center text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Calendar className="h-4 w-4 mr-2 text-[#3498db]" />
            <span>{boat.buildYear || boat.year}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {boat.features?.map((feature, index) => (
            <span
              key={index}
              className={`text-xs px-3 py-1.5 rounded-full ${getBadgeStyles()}`}
            >
              {feature.featureName}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent font-montserrat">
              {price?.toLocaleString("tr-TR") || "0"} ₺
            </span>
            <span className={`text-sm ${getTextColor("60")} font-roboto`}>
              /{priceUnit}
            </span>
          </div>
          <div className="flex space-x-2">
            <Link
              to={detailLinkBuilder ? detailLinkBuilder(boat) : `/boats/${boat.id}`}
              onMouseEnter={prefetchBoat}
              onFocus={prefetchBoat}
            >
              <Button className="bg-white/60 text-[#2c3e50] border border-white/30 hover:bg-white/80 font-medium px-4 py-2 rounded-xl transition-all duration-300 font-montserrat">
                Detaylar
              </Button>
            </Link>
            <Link to={`/rezervasyon/${boat.id}`}>
              <Button className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-montserrat">
                Rezervasyon <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}); // ✅ OPTIMIZED: Added React.memo closing bracket
