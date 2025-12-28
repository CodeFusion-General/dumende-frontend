import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Clock,
  Calendar,
  Star,
  Award,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Timer,
} from "lucide-react";
import { TourDTO, RentalDurationType } from "@/types/tour.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

interface TourInfoSectionProps {
  tour: TourDTO;
}

const TourInfoSection: React.FC<TourInfoSectionProps> = ({ tour }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  // Check if there's additional content to show
  const hasFullDescription = tour.fullDescription && tour.fullDescription.trim().length > 0;

  const getStatusBadge = (status: string) => {
    const badgeClasses =
      "bg-white/60 text-[#2c3e50] backdrop-blur-sm border border-white/30 font-roboto";

    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className={`${badgeClasses} bg-green-500/60 text-green-800`}>
            {t.tours.status.active}
          </Badge>
        );
      case "draft":
        return (
          <Badge className={`${badgeClasses} bg-yellow-500/60 text-yellow-800`}>
            {t.tours.status.draft}
          </Badge>
        );
      case "inactive":
        return (
          <Badge className={`${badgeClasses} bg-gray-500/60 text-gray-800`}>
            {t.tours.status.inactive}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className={`${badgeClasses} bg-red-500/60 text-red-800`}>
            {t.tours.status.cancelled}
          </Badge>
        );
      default:
        return <Badge className={badgeClasses}>{status}</Badge>;
    }
  };

  const getDuration = () => {
    if (tour.tourDates && tour.tourDates.length > 0) {
      return tour.tourDates[0].durationText || t.tours.durationType.fullDay;
    }
    return t.tours.durationType.fullDay;
  };

  const getDifficulty = () => {
    // This would typically come from tour data
    return t.tours.difficultyLevel.medium;
  };

  // Helper function to get label for rental duration type
  const getRentalDurationLabel = (type?: string | RentalDurationType): string => {
    switch (type) {
      case RentalDurationType.HOURLY:
      case "HOURLY":
        return t.tours.durationType.hourly;
      case RentalDurationType.HALF_DAY:
      case "HALF_DAY":
        return t.tours.durationType.halfDay;
      case RentalDurationType.FULL_DAY:
      case "FULL_DAY":
        return t.tours.durationType.fullDay;
      case RentalDurationType.MULTI_DAY:
      case "MULTI_DAY":
        return t.tours.durationType.multiDay;
      default:
        return t.tours.info.notSpecified;
    }
  };

  const getNextAvailableDate = () => {
    if (tour.tourDates && tour.tourDates.length > 0) {
      const availableDates = tour.tourDates
        .filter((date) => date.availabilityStatus.toLowerCase() === "available")
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

      if (availableDates.length > 0) {
        return new Date(availableDates[0].startDate).toLocaleDateString(
          language === 'tr' ? 'tr-TR' : 'en-US'
        );
      }
    }
    return t.tours.info.dateNotSpecified;
  };

  return (
    <div className="space-y-6">
      {/* Quick Info Grid */}
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        <h2 className="text-2xl font-semibold mb-6 font-montserrat text-[#2c3e50]">
          {t.tours.info.title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Duration */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Clock className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">{t.tours.info.duration}</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {getDuration()}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Users className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">{t.tours.info.capacity}</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {tour.capacity} {t.common.person}
            </span>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Award className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">{t.tours.info.difficulty}</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {getDifficulty()}
            </span>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Star className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">{t.tours.info.rating}</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {typeof tour.rating === "number" ? tour.rating.toFixed(1) : "N/A"}
            </span>
          </div>

          {/* Rental Duration Type */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Timer className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">{t.tours.info.tourType}</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat text-center">
              {getRentalDurationLabel(tour.rentalDurationType)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Tour Description */}
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        <h2 className="text-2xl font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
          <Info className="h-6 w-6 text-[#3498db]" />
          {t.tours.info.about}
        </h2>

        {/* Short Description */}
        <p className="text-gray-700 leading-relaxed font-roboto text-lg">
          {tour.description}
        </p>

        {/* Full Description (Expandable) */}
        {hasFullDescription && (
          <div className="mt-4">
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isDescriptionExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pt-4 border-t border-gray-200/50">
                <p className="text-gray-700 leading-relaxed font-roboto text-base whitespace-pre-line">
                  {tour.fullDescription}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-4 text-[#3498db] hover:text-[#2c3e50] hover:bg-[#3498db]/10 font-roboto font-medium group"
            >
              {isDescriptionExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-0.5" />
                  {t.tours.info.showLess}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2 transition-transform group-hover:translate-y-0.5" />
                  {t.tours.info.showMore}
                </>
              )}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Location & Details */}
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        <h2 className="text-2xl font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
          <MapPin className="h-6 w-6 text-[#3498db]" />
          {t.tours.info.locationDetails}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <MapPin className="h-5 w-5 text-[#3498db]" />
            <div>
              <span className="text-sm text-gray-600 font-roboto">
                {t.tours.info.startPoint}
              </span>
              <div className="font-semibold text-[#2c3e50] font-montserrat">
                {tour.location}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <Calendar className="h-5 w-5 text-[#3498db]" />
            <div>
              <span className="text-sm text-gray-600 font-roboto">
                {t.tours.info.nextAvailableDate}
              </span>
              <div className="font-semibold text-[#2c3e50] font-montserrat">
                {getNextAvailableDate()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <Shield className="h-5 w-5 text-[#3498db]" />
            <div>
              <span className="text-sm text-gray-600 font-roboto">{t.tours.info.status}</span>
              <div className="font-semibold text-[#2c3e50] font-montserrat">
                {getStatusBadge(tour.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Map Integration */}
        {typeof tour.latitude === "number" &&
          typeof tour.longitude === "number" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 font-montserrat text-[#2c3e50]">
                {t.tours.info.map}
              </h3>
              <div className="rounded-xl overflow-hidden border border-white/20 shadow-lg">
                <iframe
                  title="tour-map"
                  className="w-full h-64"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    tour.longitude - 0.01
                  }%2C${tour.latitude - 0.01}%2C${tour.longitude + 0.01}%2C${
                    tour.latitude + 0.01
                  }&layer=mapnik&marker=${tour.latitude}%2C${tour.longitude}`}
                />
              </div>
            </div>
          )}
      </GlassCard>
    </div>
  );
};

export default TourInfoSection;
