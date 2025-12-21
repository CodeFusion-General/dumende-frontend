import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Users,
  Anchor,
  MapPin,
  Heart,
  BarChart3,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BoatDTO } from "@/types/boat.types";
import { getDefaultImageUrl, getImageUrlPriority } from "@/lib/imageUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { SimilarBoatsError } from "@/components/ui/ErrorStates";
import {
  useMicroInteractions,
  useScrollAnimation,
} from "@/hooks/useMicroInteractions";
import { VisualFeedback, AnimatedButton } from "@/components/ui/VisualFeedback";

interface SimilarBoatsProps {
  boats: BoatDTO[];
  isLoading?: boolean;
  currentBoatId?: number;
  error?: string | null;
  onRetry?: () => void;
}

const SimilarBoats: React.FC<SimilarBoatsProps> = ({
  boats,
  isLoading = false,
  currentBoatId,
  error,
  onRetry,
}) => {
  const [comparedBoats, setComparedBoats] = useState<number[]>([]);
  const [favoriteBoats, setFavoriteBoats] = useState<number[]>([]);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<number, boolean>
  >({});
  const { language } = useLanguage();
  const t = translations[language];

  // Micro-interactions
  const { staggerAnimation, bounceAnimation, prefersReducedMotion } =
    useMicroInteractions();
  const { elementRef: similarBoatsRef, isVisible } = useScrollAnimation(0.3);
  const boatCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter out current boat from similar boats
  const filteredBoats = boats.filter((boat) => boat.id !== currentBoatId);

  // Animate boat cards when they come into view
  useEffect(() => {
    if (isVisible && !prefersReducedMotion && filteredBoats.length > 0) {
      const validRefs = boatCardRefs.current.filter(
        (ref) => ref !== null
      ) as HTMLElement[];
      if (validRefs.length > 0) {
        staggerAnimation(validRefs, "slideInUp", 150);
      }
    }
  }, [isVisible, staggerAnimation, prefersReducedMotion, filteredBoats.length]);

  const handleCompareToggle = (boatId: number) => {
    setComparedBoats(
      (prev) =>
        prev.includes(boatId)
          ? prev.filter((id) => id !== boatId)
          : [...prev, boatId].slice(0, 3) // Limit to 3 boats for comparison
    );
  };

  const handleFavoriteToggle = (boatId: number) => {
    setFavoriteBoats((prev) =>
      prev.includes(boatId)
        ? prev.filter((id) => id !== boatId)
        : [...prev, boatId]
    );
  };

  const handleImageLoad = (boatId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [boatId]: false }));
  };

  const handleImageLoadStart = (boatId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [boatId]: true }));
  };

  const getBoatImageUrl = (boat: BoatDTO): string => {
    if (boat.images?.length > 0) {
      const primaryImage =
        boat.images.find((img) => img.isPrimary) || boat.images[0];
      return getImageUrlPriority(primaryImage) || getDefaultImageUrl();
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

  // Loading skeleton component
  const BoatCardSkeleton = () => (
    <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
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

  if (isLoading) {
    return (
      <div className="mt-16 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <BoatCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">
          {t.pages.boats.similarBoats || "Benzer Tekneler"}
        </h2>
        <SimilarBoatsError onRetry={onRetry} />
      </div>
    );
  }

  if (!filteredBoats.length) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">
          {t.pages.boats.similarBoats || "Benzer Tekneler"}
        </h2>
        <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <Anchor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {t.pages.boats.noSimilarBoats || "Henüz benzer tekne bulunmuyor."}
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
          {t.pages.boats.similarBoats || "Benzer Tekneler"}
        </h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>{filteredBoats.length} tekne bulundu</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      </div>

      {/* Boats Grid */}
      <div
        ref={similarBoatsRef as React.RefObject<HTMLDivElement>}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        {filteredBoats.map((boat, index) => (
          <VisualFeedback
            key={boat.id}
            variant="lift"
            intensity="sm"
            className="opacity-0 animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card
              ref={(el) => (boatCardRefs.current[index] = el)}
              className="bg-white shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 group"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden">
                {imageLoadingStates[boat.id] && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                <img
                  src={getBoatImageUrl(boat)}
                  alt={boat.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  onLoadStart={() => handleImageLoadStart(boat.id)}
                  onLoad={() => handleImageLoad(boat.id)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-boat.jpg";
                    handleImageLoad(boat.id);
                  }}
                />

                {/* Floating Action Buttons */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0 bg-white/90 hover:bg-white shadow-md touch-manipulation"
                    onClick={() => handleFavoriteToggle(boat.id)}
                  >
                    <Heart
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        favoriteBoats.includes(boat.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0 bg-white/90 hover:bg-white shadow-md touch-manipulation"
                    onClick={() => handleCompareToggle(boat.id)}
                  >
                    <BarChart3
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        comparedBoats.includes(boat.id)
                          ? "text-primary fill-primary"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-white/95 text-gray-900 hover:bg-white font-semibold">
                    ₺{(boat.dailyPrice ?? 0).toLocaleString()}/gün
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-4 space-y-3">
                {/* Title and Rating */}
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1 font-montserrat">
                    {boat.name}
                  </h3>
                  {boat.rating && (
                    <div className="flex items-center gap-1 ml-2">
                      <div className="flex">{renderStars(boat.rating)}</div>
                      <span className="text-xs text-gray-600 ml-1">
                        {boat.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-primary" />
                  <span className="text-sm line-clamp-1">{boat.location}</span>
                </div>

                {/* Boat Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{boat.capacity} kişi</span>
                  </div>
                  <div className="flex items-center">
                    <Anchor className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{boat.type}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 text-xs h-9 sm:h-10 transition-colors touch-manipulation ${
                      comparedBoats.includes(boat.id)
                        ? "bg-primary text-white border-primary hover:bg-primary/90"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleCompareToggle(boat.id)}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">
                      {comparedBoats.includes(boat.id)
                        ? "Karşılaştırıldı"
                        : "Karşılaştır"}
                    </span>
                    <span className="xs:hidden">
                      {comparedBoats.includes(boat.id) ? "✓" : "Compare"}
                    </span>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 text-xs h-9 sm:h-10 bg-primary hover:bg-primary/90 touch-manipulation"
                  >
                    <Link to={`/boats/${boat.id}`}>
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
      {comparedBoats.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
          <Card className="bg-white shadow-lg border border-gray-200 w-full sm:w-auto">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                  <span className="hidden xs:inline">
                    {comparedBoats.length} tekne karşılaştırılıyor
                  </span>
                  <span className="xs:hidden">
                    {comparedBoats.length} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 touch-manipulation h-9"
                    disabled={comparedBoats.length < 2}
                  >
                    <span className="hidden xs:inline">Karşılaştır</span>
                    <span className="xs:hidden">Compare</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="touch-manipulation h-9"
                    onClick={() => setComparedBoats([])}
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

export default SimilarBoats;
