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
} from "lucide-react";
import { TourDTO } from "@/types/tour.types";

interface TourInfoSectionProps {
  tour: TourDTO;
}

const TourInfoSection: React.FC<TourInfoSectionProps> = ({ tour }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Check if there's additional content to show
  const hasFullDescription = tour.fullDescription && tour.fullDescription.trim().length > 0;

  const getStatusBadge = (status: string) => {
    const badgeClasses =
      "bg-white/60 text-[#2c3e50] backdrop-blur-sm border border-white/30 font-roboto";

    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className={`${badgeClasses} bg-green-500/60 text-green-800`}>
            Aktif
          </Badge>
        );
      case "draft":
        return (
          <Badge className={`${badgeClasses} bg-yellow-500/60 text-yellow-800`}>
            Taslak
          </Badge>
        );
      case "inactive":
        return (
          <Badge className={`${badgeClasses} bg-gray-500/60 text-gray-800`}>
            Yayında Değil
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className={`${badgeClasses} bg-red-500/60 text-red-800`}>
            İptal
          </Badge>
        );
      default:
        return <Badge className={badgeClasses}>{status}</Badge>;
    }
  };

  const getDuration = () => {
    if (tour.tourDates && tour.tourDates.length > 0) {
      return tour.tourDates[0].durationText || "Tam Gün";
    }
    return "Tam Gün";
  };

  const getDifficulty = () => {
    // This would typically come from tour data
    return "Orta";
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
          "tr-TR"
        );
      }
    }
    return "Tarih belirtilmemiş";
  };

  return (
    <div className="space-y-6">
      {/* Quick Info Grid */}
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        <h2 className="text-2xl font-semibold mb-6 font-montserrat text-[#2c3e50]">
          Tur Bilgileri
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Duration */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Clock className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">Süre</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {getDuration()}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Users className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">Kapasite</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {tour.capacity} kişi
            </span>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Award className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">Zorluk</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {getDifficulty()}
            </span>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
            <div className="bg-[#3498db]/20 p-3 rounded-full mb-3 group-hover:bg-[#3498db]/30 transition-colors duration-300">
              <Star className="h-6 w-6 text-[#3498db]" />
            </div>
            <span className="text-sm text-gray-600 font-roboto">Puan</span>
            <span className="font-semibold text-[#2c3e50] font-montserrat">
              {typeof tour.rating === "number" ? tour.rating.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Tour Description */}
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        <h2 className="text-2xl font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
          <Info className="h-6 w-6 text-[#3498db]" />
          Tur Hakkında
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
                  Daha Az Göster
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2 transition-transform group-hover:translate-y-0.5" />
                  Daha Fazla Göster
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
          Konum ve Detaylar
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <MapPin className="h-5 w-5 text-[#3498db]" />
            <div>
              <span className="text-sm text-gray-600 font-roboto">
                Başlangıç Noktası
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
                Sonraki Müsait Tarih
              </span>
              <div className="font-semibold text-[#2c3e50] font-montserrat">
                {getNextAvailableDate()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <Shield className="h-5 w-5 text-[#3498db]" />
            <div>
              <span className="text-sm text-gray-600 font-roboto">Durum</span>
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
                Harita
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
