import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Users, MapPin, Calendar, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import { TourDTO } from "@/types/tour.types";
import { getDefaultImageUrl, getFullImageUrl } from "@/lib/imageUtils";
import { useViewport } from "@/hooks/useResponsiveAnimations";
import { useTouchTarget } from "@/hooks/useMobileGestures";

interface TourCardProps {
  tour: TourDTO;
  viewMode: "grid" | "list";
  variant?: "homepage" | "listing";
  isCompared?: boolean;
  onCompareToggle?: (id: string) => void;
}

// Default image helper function
const getTourImageUrl = (tour: TourDTO): string => {
  // Backend'den gelen URL'i tam URL'e çevir
  if (tour.tourImages && tour.tourImages.length > 0) {
    const firstImage = tour.tourImages[0];
    if (firstImage && firstImage.imageUrl) {
      return getFullImageUrl(firstImage.imageUrl);
    }
  }

  // Fallback to default image
  return getDefaultImageUrl();
};

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  viewMode,
  variant = "listing",
  isCompared = false,
  onCompareToggle,
}) => {
  if (viewMode === "grid") {
    return (
      <TourCardGrid
        tour={tour}
        isCompared={isCompared}
        onCompareToggle={onCompareToggle}
        variant={variant}
      />
    );
  }
  return (
    <TourCardList
      tour={tour}
      isCompared={isCompared}
      onCompareToggle={onCompareToggle}
      variant={variant}
    />
  );
};

const TourCardGrid: React.FC<{
  tour: TourDTO;
  isCompared: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
}> = ({ tour, isCompared, onCompareToggle, variant = "listing" }) => {
  const [imageUrl, setImageUrl] = useState<string>(getDefaultImageUrl());
  const { isMobile, isTouch } = useViewport();
  const { getTouchTargetProps } = useTouchTarget();

  useEffect(() => {
    const url = getTourImageUrl(tour);
    setImageUrl(url);
  }, [tour]);

  const ratingDisplay =
    typeof tour.rating === "number" ? tour.rating.toFixed(1) : "0";
  const nextDate =
    tour.tourDates && tour.tourDates.length > 0
      ? new Date(tour.tourDates[0].startDate)
      : null;

  // Helper functions for modern glass styling
  const getTextColor = (opacity?: string) => {
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
  };

  const getBadgeStyles = () => {
    return "bg-white/60 text-[#2c3e50] backdrop-blur-sm border border-white/30 shadow-sm font-roboto";
  };

  const getCompareButtonStyles = () => {
    return isCompared
      ? "bg-[#3498db] text-white border border-[#3498db]/50 shadow-md"
      : "bg-white/60 text-[#2c3e50] border border-white/30 hover:bg-[#3498db] hover:text-white shadow-sm";
  };

  return (
    <GlassCard className="overflow-hidden animate-hover-lift group bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col touch-manipulation">
      {/* Image Section with Glass Overlay */}
      <div className="relative overflow-hidden h-48 sm:h-56 md:h-60 flex-shrink-0">
        <img
          src={imageUrl}
          alt={tour.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageUrl(getDefaultImageUrl())}
        />

        {/* Enhanced gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Tour status badge with enhanced glass effect */}
        <div
          className={`absolute top-4 left-4 px-3 py-1.5 rounded-full ${getBadgeStyles()} font-medium`}
        >
          <span className="text-sm">{tour.status}</span>
        </div>

        {/* Heart button with enhanced glass effect - Hidden on homepage */}
        {variant !== "homepage" && (
          <VisualFeedback variant="ripple" intensity="sm">
            <button
              className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/60 backdrop-blur-sm p-2 sm:p-2.5 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 shadow-md"
              {...getTouchTargetProps(44)}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 hover:text-red-600 transition-colors" />
            </button>
          </VisualFeedback>
        )}

        {/* Compare button with enhanced glass effect - Hidden on homepage */}
        {variant !== "homepage" && onCompareToggle && (
          <VisualFeedback variant="scale" intensity="sm">
            <button
              onClick={() => onCompareToggle(tour.id.toString())}
              className={`absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs py-2 px-3 rounded-full backdrop-blur-sm transition-all duration-300 font-montserrat font-medium ${getCompareButtonStyles()}`}
              {...getTouchTargetProps(44)}
            >
              {isCompared ? "Karşılaştırıldı" : "Karşılaştır"}
            </button>
          </VisualFeedback>
        )}
      </div>

      {/* Content Section with enhanced styling - Flexible height */}
      <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-b from-white/20 to-white/40 backdrop-blur-sm flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3
            className={`font-bold text-base sm:text-lg ${getTextColor()} group-hover:text-[#3498db] transition-all duration-300 font-montserrat line-clamp-2 flex-1 mr-2`}
          >
            {tour.name}
          </h3>
          <div
            className={`flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full ${getBadgeStyles()} flex-shrink-0`}
          >
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs sm:text-sm font-medium ml-1">
              {ratingDisplay}
            </span>
          </div>
        </div>

        <div
          className={`text-xs sm:text-sm ${getTextColor(
            "70"
          )} mb-3 sm:mb-4 font-roboto line-clamp-1 flex items-center`}
        >
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
          {tour.location}
        </div>

        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div
            className={`flex items-center text-xs sm:text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
            <span>{tour.capacity} kişi</span>
          </div>
          <div
            className={`flex items-center text-xs sm:text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
            <span>
              {nextDate ? nextDate.toLocaleDateString("tr-TR") : "Yakında"}
            </span>
          </div>
        </div>

        {/* Tour duration and features section with consistent height */}
        <div className="flex-1 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-1 sm:gap-2 h-12 sm:h-16 overflow-hidden items-start content-start">
            {tour.tourDates &&
              tour.tourDates.length > 0 &&
              tour.tourDates[0].durationText && (
                <span
                  className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${getBadgeStyles()} line-clamp-1 whitespace-nowrap flex items-center`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {tour.tourDates[0].durationText}
                </span>
              )}
            {/* Add more tour-specific features here if available */}
            <span
              className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${getBadgeStyles()} whitespace-nowrap`}
            >
              Tur Deneyimi
            </span>
          </div>
        </div>

        {/* Price and button section - Always at bottom with fixed position */}
        <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-white/10">
          <div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent font-montserrat">
              {Number(tour.price).toLocaleString("tr-TR")} ₺
            </span>
            <span
              className={`text-xs sm:text-sm ${getTextColor(
                "60"
              )} ml-1 font-roboto`}
            >
              /tur
            </span>
          </div>
          <Link to={`/tours/${tour.id}`}>
            <Button
              className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-montserrat"
              {...getTouchTargetProps(44)}
            >
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

const TourCardList: React.FC<{
  tour: TourDTO;
  isCompared: boolean;
  onCompareToggle?: (id: string) => void;
  variant?: "homepage" | "listing";
}> = ({ tour, isCompared, onCompareToggle, variant = "listing" }) => {
  const [imageUrl, setImageUrl] = useState<string>(getDefaultImageUrl());
  const { isMobile, isTouch } = useViewport();
  const { getTouchTargetProps } = useTouchTarget();

  useEffect(() => {
    const url = getTourImageUrl(tour);
    setImageUrl(url);
  }, [tour]);

  const ratingDisplay =
    typeof tour.rating === "number" ? tour.rating.toFixed(1) : "0";
  const nextDate =
    tour.tourDates && tour.tourDates.length > 0
      ? new Date(tour.tourDates[0].startDate)
      : null;

  // Helper functions for modern glass styling
  const getTextColor = (opacity?: string) => {
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
  };

  const getBadgeStyles = () => {
    return "bg-white/60 text-[#2c3e50] backdrop-blur-sm border border-white/30 shadow-sm font-roboto";
  };

  const getCompareButtonStyles = () => {
    return isCompared
      ? "bg-[#3498db] text-white border border-[#3498db]/50 shadow-md"
      : "bg-white/60 text-[#2c3e50] border border-white/30 hover:bg-[#3498db] hover:text-white shadow-sm";
  };

  return (
    <GlassCard className="flex flex-col md:flex-row h-full overflow-hidden animate-hover-lift group bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation">
      {/* Image Section */}
      <div className="relative overflow-hidden md:w-1/3 h-40 sm:h-48 md:h-auto">
        <img
          src={imageUrl}
          alt={tour.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageUrl(getDefaultImageUrl())}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent md:bg-gradient-to-t md:from-black/20 md:via-transparent md:to-transparent" />

        {/* Tour status badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full ${getBadgeStyles()}`}
        >
          <span className="text-sm font-medium">{tour.status}</span>
        </div>

        {/* Heart button - Hidden on homepage */}
        {variant !== "homepage" && (
          <VisualFeedback variant="ripple" intensity="sm">
            <button
              className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/60 backdrop-blur-sm p-2 sm:p-2.5 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 shadow-md"
              {...getTouchTargetProps(44)}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 hover:text-red-600 transition-colors" />
            </button>
          </VisualFeedback>
        )}

        {/* Compare button - Hidden on homepage */}
        {variant !== "homepage" && onCompareToggle && (
          <VisualFeedback variant="scale" intensity="sm">
            <button
              onClick={() => onCompareToggle(tour.id.toString())}
              className={`absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs py-2 px-3 rounded-full backdrop-blur-sm transition-all duration-300 ${getCompareButtonStyles()}`}
              {...getTouchTargetProps(44)}
            >
              {isCompared ? "Karşılaştırıldı" : "Karşılaştır"}
            </button>
          </VisualFeedback>
        )}
      </div>

      {/* Content Section with enhanced styling */}
      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col bg-gradient-to-b from-white/20 to-white/40 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div>
            <h3
              className={`font-bold text-lg sm:text-xl ${getTextColor()} group-hover:text-[#3498db] transition-all duration-300 font-montserrat`}
            >
              {tour.name}
            </h3>
            <div
              className={`text-xs sm:text-sm ${getTextColor(
                "70"
              )} mb-2 font-roboto flex items-center`}
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
              {tour.location}
            </div>
          </div>
          <div
            className={`flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full ${getBadgeStyles()}`}
          >
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs sm:text-sm font-medium ml-1">
              {ratingDisplay}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div
            className={`flex items-center text-xs sm:text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
            <span>{tour.capacity} Kişi</span>
          </div>
          <div
            className={`flex items-center text-xs sm:text-sm ${getTextColor(
              "80"
            )} font-roboto`}
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
            <span>
              {nextDate ? nextDate.toLocaleDateString("tr-TR") : "Yakında"}
            </span>
          </div>
          {tour.tourDates &&
            tour.tourDates.length > 0 &&
            tour.tourDates[0].durationText && (
              <div
                className={`flex items-center text-xs sm:text-sm ${getTextColor(
                  "80"
                )} font-roboto`}
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-[#3498db]" />
                <span>{tour.tourDates[0].durationText}</span>
              </div>
            )}
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 mt-auto">
          <span
            className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${getBadgeStyles()}`}
          >
            Tur Deneyimi
          </span>
          {/* Add more tour-specific features here if available */}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent font-montserrat">
              {Number(tour.price).toLocaleString("tr-TR")} ₺
            </span>
            <span
              className={`text-xs sm:text-sm ${getTextColor("60")} font-roboto`}
            >
              /tur
            </span>
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <Link to={`/tours/${tour.id}`}>
              <Button
                className="bg-white/60 text-[#2c3e50] border border-white/30 hover:bg-white/80 font-medium px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl transition-all duration-300 font-montserrat"
                {...getTouchTargetProps(44)}
              >
                Detaylar
              </Button>
            </Link>
            <Link to={`/tours/${tour.id}`}>
              <Button
                className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-montserrat"
                {...getTouchTargetProps(44)}
              >
                İncele
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TourCard;

