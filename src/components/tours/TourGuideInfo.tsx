import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Clock,
  MessageCircle,
  Star,
  Calendar,
  Award,
  CheckCircle,
  User,
  MapPin,
  Languages,
  Briefcase,
} from "lucide-react";
import {
  useMicroInteractions,
  useScrollAnimation,
} from "@/hooks/useMicroInteractions";
import { VisualFeedback, AnimatedCard } from "@/components/ui/VisualFeedback";
import { GuideData } from "@/types/tour.types";

interface TourGuideInfoProps {
  guideName: string;
  guideAvatar?: string;
  responseRate?: number;
  responseTime?: string;
  isCertified?: boolean;
  isVerified?: boolean;
  joinDate?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  totalTours?: number;
  certifications?: string[];
  languages?: string[];
  specialties?: string[];
  experience?: number;
  location?: string;
  className?: string;
  // Alternative: accept full guide data object
  guideData?: GuideData;
  // Messaging props
  tourId?: number;
  onMessageGuide?: () => void;
  showMessageButton?: boolean;
  messageButtonDisabled?: boolean;
  messageButtonText?: string;
}

const TourGuideInfo: React.FC<TourGuideInfoProps> = ({
  guideName,
  guideAvatar,
  responseRate = 95,
  responseTime = "~1 saat",
  isCertified = true,
  isVerified = true,
  joinDate = "2020",
  description = "Profesyonel tur rehberi ve yerel uzman. Turizm Rehberliği Sertifikalı. Deneyimli ve güvenilir hizmet sunmaktadır. Müşteri memnuniyeti odaklı yaklaşım.",
  rating = 4.8,
  reviewCount = 24,
  totalTours = 150,
  certifications = [],
  languages = ["Türkçe", "İngilizce"],
  specialties = ["Kültürel Turlar", "Doğa Yürüyüşleri"],
  experience = 5,
  location = "İstanbul",
  className = "",
  guideData,
  tourId,
  onMessageGuide,
  showMessageButton = false,
  messageButtonDisabled = false,
  messageButtonText = "Rehberle İletişim",
}) => {
  const { staggerAnimation, fadeIn, prefersReducedMotion } =
    useMicroInteractions();
  const { elementRef: guideRef, isVisible } = useScrollAnimation(0.3);
  const trustIndicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Use guideData if provided, otherwise use individual props
  const data = guideData || {
    id: 0,
    name: guideName,
    avatar: guideAvatar,
    responseRate,
    responseTime,
    isCertified,
    isVerified,
    joinDate,
    description,
    rating,
    reviewCount,
    totalTours,
    certifications,
    languages,
    specialties,
    experience,
    location,
  };

  // Animate guide info when it comes into view
  useEffect(() => {
    if (isVisible && !prefersReducedMotion) {
      const validRefs = trustIndicatorRefs.current.filter(
        (ref) => ref !== null
      ) as HTMLElement[];
      if (validRefs.length > 0) {
        staggerAnimation(validRefs, "slideInUp", 150);
      }
    }
  }, [isVisible, staggerAnimation, prefersReducedMotion]);

  // Generate initials from guide name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Generate gradient colors based on name
  const getGradientColors = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-primary to-primary-dark",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Guide Profile Section */}
      <div className="flex flex-col sm:flex-row lg:flex-row items-start gap-6 sm:gap-8">
        {/* Professional Avatar with Verification Badges */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${getGradientColors(
              data.name
            )} flex items-center justify-center shadow-xl ring-4 ring-primary/20 transition-all duration-300 hover:scale-105`}
          >
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {getInitials(data.name)}
              </span>
            )}
          </div>

          {/* Verification Badges */}
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            {data.isCertified && (
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
            {data.isVerified && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Guide Information */}
        <div className="flex-1 space-y-6">
          {/* Name and Title */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {data.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.isCertified && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 border-green-200 hover:from-green-100 hover:to-emerald-200 px-3 py-1"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Sertifikalı Rehber
                  </Badge>
                )}
                {data.isVerified && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 px-3 py-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Doğrulanmış
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 font-medium text-lg">
              Profesyonel Tur Rehberi & Yerel Uzman
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{data.joinDate} yılından beri rehber</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{data.totalTours}+ başarılı tur</span>
              </div>
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{data.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>{data.experience} yıl deneyim</span>
              </div>
            </div>
          </div>

          {/* Guide Rating and Message Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 rounded-2xl border border-amber-200/50 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(data.rating)
                          ? "text-amber-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {data.rating}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {data.reviewCount} değerlendirme
              </div>
            </div>

            {/* Message Guide Button */}
            {showMessageButton && (
              <Button
                onClick={onMessageGuide}
                disabled={messageButtonDisabled}
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium"
              >
                <MessageCircle className="h-5 w-5" />
                {messageButtonText}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Trust Indicators Grid */}
      <div
        ref={guideRef}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Response Rate */}
        <VisualFeedback
          variant="lift"
          intensity="sm"
          className="opacity-0 animate-slide-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            ref={(el) => (trustIndicatorRefs.current[0] = el)}
            className="group bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl p-6 border border-green-200/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-700 mb-1">
                  Yanıt Oranı
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {data.responseRate}%
                </div>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500 progress-bar"
                style={{ width: `${data.responseRate}%` }}
              />
            </div>
          </div>
        </VisualFeedback>

        {/* Response Time */}
        <VisualFeedback
          variant="lift"
          intensity="sm"
          className="opacity-0 animate-slide-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            ref={(el) => (trustIndicatorRefs.current[1] = el)}
            className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700 mb-1">
                  Yanıt Süresi
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {data.responseTime}
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
              Genellikle hızlı yanıt verir
            </div>
          </div>
        </VisualFeedback>

        {/* Certification Status */}
        <VisualFeedback
          variant="lift"
          intensity="sm"
          className="opacity-0 animate-slide-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div
            ref={(el) => (trustIndicatorRefs.current[2] = el)}
            className="group bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-primary mb-1">
                  Sertifika
                </div>
                <div className="text-2xl font-bold text-primary-dark">
                  {data.isCertified ? "Onaylı" : "Beklemede"}
                </div>
              </div>
            </div>
            <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
              Turizm Rehberliği Kurumu
            </div>
          </div>
        </VisualFeedback>
      </div>

      {/* Guide Description */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-8 border border-gray-200/50 transition-all duration-300 hover:shadow-md">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Hakkında
        </h4>
        <p className="text-gray-700 leading-relaxed text-lg mb-6">
          {data.description}
        </p>

        {/* Specialties and Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specialties */}
          {data.specialties && data.specialties.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Uzmanlık Alanları
              </h5>
              <div className="flex flex-wrap gap-2">
                {data.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 hover:from-primary/20 hover:to-primary/30"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                Konuşulan Diller
              </h5>
              <div className="flex flex-wrap gap-2">
                {data.languages.map((language, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Trust Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="text-2xl font-bold text-primary mb-1">
            {data.totalTours}+
          </div>
          <div className="text-sm text-gray-600">Başarılı Tur</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {data.responseRate}%
          </div>
          <div className="text-sm text-gray-600">Yanıt Oranı</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="text-2xl font-bold text-amber-500 mb-1">
            {data.rating}
          </div>
          <div className="text-sm text-gray-600">Ortalama Puan</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {data.experience}
          </div>
          <div className="text-sm text-gray-600">Yıllık Deneyim</div>
        </div>
      </div>
    </div>
  );
};

export default TourGuideInfo;
