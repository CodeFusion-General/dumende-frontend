import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Users,
  MapPin,
  Heart,
  BarChart3,
  ArrowRight,
  Loader2,
  Clock,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TourDTO } from "@/types/tour.types";
import { getDefaultImageUrl } from "@/lib/imageUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import {
  useMicroInteractions,
  useScrollAnimation,
} from "@/hooks/useMicroInteractions";
import { VisualFeedback, AnimatedButton } from "@/components/ui/VisualFeedback";

interface SimilarToursProps {
  tours: TourDTO[];
  isLoading?: boolean;
  currentTourId?: number;
  error?: string | null;
  onRetry?: () => void;
}

const SimilarTours: React.FC<SimilarToursProps> = ({
  tours,
  isLoading = false,
  currentTourId,
  error,
  onRetry,
}) => {
  const [comparedTours, setComparedTours] = useState<number[]>([]);
  const [favoriteTours, setFavoriteTours] = useState<number[]>([]);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<number, boolean>
  >({});
  const { language } = useLanguage();
  const t = translations[language];

  // Micro-interactions
  const { staggerAnimation, bounceAnimation, prefersReducedMotion } =
    useMicroInteractions();
  const { elementRef: similarToursRef, isVisible } = useScrollAnimation(0.3);
  const tourCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter out current tour from similar tours
  const filteredTours = tours.filter((tour) => tour.id !== currentTourId);

  // Animate tour cards when they come into view
  useEffect(() => {
    if (isVisible && !prefersReducedMotion && filteredTours.length > 0) {
      const validRefs = tourCardRefs.current.filter(
        (ref) => ref !== null
      ) as HTMLElement[];
      if (validRefs.length > 0) {
        staggerAnimation(validRefs, "slideInUp", 150);
      }
    }
  }, [isVisible, staggerAnimation, prefersReducedMotion, filteredTours.length]);

  const handleCompareToggle = (tourId: number) => {
    setComparedTours(
      (prev) =>
        prev.includes(tourId)
          ? prev.filter((id) => id !== tourId)
          : [...prev, tourId].slice(0, 3) // Limit to 3 tours for comparison
    );
  };

  const handleFavoriteToggle = (tourId: number) => {
    setFavoriteTours((prev) =>
      prev.includes(tourId)
        ? prev.filter((id) => id !== tourId)
        : [...prev, tourId]
    );
  };

  const handleImageLoad = (tourId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [tourId]: false }));
  };

  const handleImageLoadStart = (tourId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [tourId]: true }));
  };

  const getTourImageUrl = (tour: TourDTO): string => {
    if (tour.tourImages?.length > 0) {
      // Sort by display order and get the first image
      const sortedImages = [...tour.tourImages].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      return sortedImages[0].imageUrl || getDefaultImageUrl();
    }
    return getDefaultImageUrl();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3 h-3">
            <Star className="w-3 h-3 text-gray-300 fill-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-gray-300 fill-gray-300" />
        );
      }
    }
    return stars;
  };

  const getNextAvailableDate = (tour: TourDTO): string => {
    if (!tour.tourDates?.length) return "Tarih yok";

    const availableDates = tour.tourDates
      .filter((date) => date.availabilityStatus === "AVAILABLE")
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    if (availableDates.length === 0) return "Müsait değil";

    const nextDate = new Date(availableDates[0].startDate);
    return nextDate.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  const getDuration = (tour: TourDTO): string => {
    if (!tour.tourDates?.length) return "Süre belirtilmemiş";
    return tour.tourDates[0].durationText || "Süre belirtilmemiş";
  };

  // Loading skeleton component
  const TourCardSkeleton = () => (
    <Card className="bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-48" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  // Error component
  const SimilarToursError = () => (
    <Card className="bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Calendar className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Benzer turlar yüklenemedi</p>
          <p className="text-sm text-gray-600 mt-1">
            {error || "Bir hata oluştu"}
          </p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="bg-white/60 hover:bg-white/80 backdrop-blur-sm border-white/30"
          >
            Tekrar Dene
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="mt-16 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <TourCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">
          {t.pages.tours?.similarTours || "Benzer Turlar"}
        </h2>
        <SimilarToursError />
      </div>
    );
  }

  if (!filteredTours.length) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">
          {t.pages.tours?.similarTours || "Benzer Turlar"}
        </h2>
        <Card className="bg-gray-50/40 backdrop-blur-sm border-dashed border-2 border-gray-200/60">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {t.pages.tours?.noSimilarTours || "Henüz benzer tur bulunmuyor."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
          {t.pages.tours?.similarTours || "Benzer Turlar"}
        </h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>{filteredTours.length} tur bulundu</span>
          <Link
            to="/tours"
            className="flex items-center ml-2 hover:text-[#3498db] transition-colors"
          >
            <span className="hidden sm:inline">Tümünü Gör</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Tours Grid */}
      <div
        ref={similarToursRef as React.RefObject<HTMLDivElement>}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {filteredTours.map((tour, index) => (
          <VisualFeedback
            key={tour.id}
            variant="lift"
            intensity="sm"
            className="opacity-0 animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card
              ref={(el) => (tourCardRefs.current[index] = el)}
              className="bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm overflow-hidden transition-all duration-300 group hover:shadow-lg hover:bg-white/50"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden">
                {imageLoadingStates[tour.id] && (
                  <div className="absolute inset-0 bg-gray-100/40 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[#3498db]" />
                  </div>
                )}
                <img
                  src={getTourImageUrl(tour)}
                  alt={tour.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  onLoadStart={() => handleImageLoadStart(tour.id)}
                  onLoad={() => handleImageLoad(tour.id)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultImageUrl();
                    handleImageLoad(tour.id);
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                {/* Floating Action Buttons */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0 bg-white/90 hover:bg-white shadow-md touch-manipulation backdrop-blur-sm"
                    onClick={() => handleFavoriteToggle(tour.id)}
                  >
                    <Heart
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        favoriteTours.includes(tour.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0 bg-white/90 hover:bg-white shadow-md touch-manipulation backdrop-blur-sm"
                    onClick={() => handleCompareToggle(tour.id)}
                  >
                    <BarChart3
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        comparedTours.includes(tour.id)
                          ? "text-[#3498db] fill-[#3498db]"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-white/95 text-gray-900 hover:bg-white font-semibold backdrop-blur-sm border border-white/30">
                    ₺{tour.price.toLocaleString()}/kişi
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-4 space-y-3">
                {/* Title and Rating */}
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1 font-montserrat">
                    {tour.name}
                  </h3>
                  {tour.rating && (
                    <div className="flex items-center gap-1 ml-2">
                      <div className="flex">{renderStars(tour.rating)}</div>
                      <span className="text-xs text-gray-600 ml-1">
                        {tour.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-[#3498db]" />
                  <span className="text-sm line-clamp-1">{tour.location}</span>
                </div>

                {/* Tour Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{tour.capacity} kişi</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{getDuration(tour)}</span>
                  </div>
                </div>

                {/* Next Available Date */}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Sonraki: {getNextAvailableDate(tour)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 text-xs h-9 sm:h-10 transition-colors touch-manipulation backdrop-blur-sm ${
                      comparedTours.includes(tour.id)
                        ? "bg-[#3498db] text-white border-[#3498db] hover:bg-[#3498db]/90"
                        : "bg-white/60 hover:bg-white/80 border-white/30"
                    }`}
                    onClick={() => handleCompareToggle(tour.id)}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">
                      {comparedTours.includes(tour.id)
                        ? "Karşılaştırıldı"
                        : "Karşılaştır"}
                    </span>
                    <span className="xs:hidden">
                      {comparedTours.includes(tour.id) ? "✓" : "Compare"}
                    </span>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 text-xs h-9 sm:h-10 bg-gradient-to-r from-[#3498db] to-[#2c3e50] hover:from-[#2c3e50] hover:to-[#3498db] touch-manipulation"
                  >
                    <Link to={`/tours/${tour.id}`}>
                      <span className="hidden xs:inline">Detayları Gör</span>
                      <span className="xs:hidden">View</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </VisualFeedback>
        ))}
      </div>

      {/* Compare Bar */}
      {comparedTours.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-white/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-2 text-[#3498db]" />
                  <span className="hidden xs:inline">
                    {comparedTours.length} tur karşılaştırılıyor
                  </span>
                  <span className="xs:hidden">
                    {comparedTours.length} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] hover:from-[#2c3e50] hover:to-[#3498db] touch-manipulation h-9"
                    disabled={comparedTours.length < 2}
                  >
                    <span className="hidden xs:inline">Karşılaştır</span>
                    <span className="xs:hidden">Compare</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="touch-manipulation h-9 bg-white/60 hover:bg-white/80 backdrop-blur-sm border-white/30"
                    onClick={() => setComparedTours([])}
                  >
                    <span className="hidden xs:inline">Temizle</span>
                    <span className="xs:hidden">Clear</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimilarTours;
