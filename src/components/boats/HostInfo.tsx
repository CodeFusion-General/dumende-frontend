import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Clock,
  MessageCircle,
  Star,
  Calendar,
  Award,
  CheckCircle,
  User,
} from "lucide-react";
import {
  useMicroInteractions,
  useScrollAnimation,
} from "@/hooks/useMicroInteractions";
import { VisualFeedback, AnimatedCard } from "@/components/ui/VisualFeedback";

// Host data interface for future backend integration
export interface HostData {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  responseRate: number;
  responseTime: string;
  isCertified: boolean;
  isVerified: boolean;
  joinDate: string;
  description: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  certifications?: string[];
  languages?: string[];
}

interface HostInfoProps {
  hostName: string;
  hostAvatar?: string;
  responseRate?: number;
  responseTime?: string;
  isCertified?: boolean;
  isVerified?: boolean;
  joinDate?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  totalBookings?: number;
  certifications?: string[];
  languages?: string[];
  className?: string;
  // Alternative: accept full host data object
  hostData?: HostData;
}

const HostInfo: React.FC<HostInfoProps> = ({
  hostName,
  hostAvatar,
  responseRate = 95,
  responseTime = "~1 saat",
  isCertified = true,
  isVerified = true,
  joinDate = "2020",
  description = "Profesyonel kaptan ve tekne sahibi. Türk Denizcilik Kurumu sertifikalı. Deneyimli ve güvenilir hizmet sunmaktadır. Müşteri memnuniyeti odaklı yaklaşım.",
  rating = 4.8,
  reviewCount = 24,
  totalBookings = 150,
  certifications = [],
  languages = [],
  className = "",
  hostData,
}) => {
  const { staggerAnimation, fadeIn, prefersReducedMotion } =
    useMicroInteractions();
  const { elementRef: hostRef, isVisible } = useScrollAnimation(0.3);
  const trustIndicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Use hostData if provided, otherwise use individual props
  const data = hostData || {
    name: hostName,
    avatar: hostAvatar,
    responseRate,
    responseTime,
    isCertified,
    isVerified,
    joinDate,
    description,
    rating,
    reviewCount,
    totalBookings,
    certifications,
    languages,
  };

  // Animate host info when it comes into view
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
  // Generate initials from host name
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
      {/* Host Profile Section */}
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

        {/* Host Information */}
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
                    Sertifikalı
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
              Profesyonel Kaptan & Tekne Sahibi
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{data.joinDate} yılından beri üye</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{data.totalBookings}+ başarılı rezervasyon</span>
              </div>
            </div>
          </div>

          {/* Host Rating */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 rounded-2xl border border-amber-200/50">
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
        </div>
      </div>

      {/* Trust Indicators Grid */}
      <div
        ref={hostRef}
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
              Türk Denizcilik Kurumu
            </div>
          </div>
        </VisualFeedback>
      </div>

      {/* Host Description */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-8 border border-gray-200/50 transition-all duration-300 hover:shadow-md">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Hakkında
        </h4>
        <p className="text-gray-700 leading-relaxed text-lg">
          {data.description}
        </p>
      </div>

      {/* Additional Trust Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="text-2xl font-bold text-primary mb-1">
            {data.totalBookings}+
          </div>
          <div className="text-sm text-gray-600">Başarılı Rezervasyon</div>
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
            {new Date().getFullYear() - parseInt(data.joinDate)}
          </div>
          <div className="text-sm text-gray-600">Yıllık Deneyim</div>
        </div>
      </div>
    </div>
  );
};

export default HostInfo;
