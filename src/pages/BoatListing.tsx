import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/boats/BookingForm";
import BoatFeatures from "@/components/boats/BoatFeatures";
import HostInfo from "@/components/boats/HostInfo";
import SimilarBoats from "@/components/boats/SimilarBoats";
import Reviews from "@/components/boats/Reviews";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  MapPin,
  Users,
  Anchor,
  Star,
  Shield,
  Clock,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Heart,
  Share2,
  Camera,
} from "lucide-react";
import { boatService } from "@/services/boatService";
import { useQuery } from "@tanstack/react-query";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { VisualFeedback, AnimatedButton } from "@/components/ui/VisualFeedback";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isValidImageUrl, getDefaultImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import {
  ImageGallerySkeleton,
  BoatInfoSkeleton,
  BoatFeaturesSkeleton,
  HostInfoSkeleton,
  ReviewsSkeleton,
  SimilarBoatsSkeleton,
  BookingFormSkeleton,
  ProgressiveLoader,
} from "@/components/ui/LoadingStates";
import {
  ErrorState,
  NetworkError,
  BoatNotFoundError,
  ErrorBoundaryFallback,
} from "@/components/ui/ErrorStates";
import { useRetry } from "@/hooks/useRetry";
import { useProgressiveLoading } from "@/hooks/useProgressiveLoading";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { notificationService } from "@/services/notificationService";

// Default image helper function for boat detail page
const getBoatImageUrl = (): string => {
  return getDefaultImageUrl();
};

const BoatListing = () => {
  const { id } = useParams();

  // Micro-interactions
  const { fadeIn, slideIn, staggerAnimation, prefersReducedMotion } =
    useMicroInteractions();
  const heroRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const quickInfoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Progressive loading for different sections
  const { shouldLoad: shouldLoadFeatures } = useProgressiveLoading({
    delay: 300,
    priority: "medium",
  });

  const { shouldLoad: shouldLoadReviews } = useProgressiveLoading({
    delay: 600,
    priority: "low",
  });

  const { shouldLoad: shouldLoadSimilarBoats } = useProgressiveLoading({
    delay: 900,
    priority: "low",
  });

  // Retry mechanism for boat data
  const { execute: retryBoatData, isLoading: isRetrying } = useRetry(
    () => boatService.getBoatById(Number(id)),
    {
      maxAttempts: 3,
      onError: (error, attempt) => {
        console.error(`Boat loading attempt ${attempt} failed:`, error);
      },
    }
  );

  const {
    data: boatData,
    isLoading,
    error,
    refetch: refetchBoat,
  } = useQuery({
    queryKey: ["boat", id],
    queryFn: () => boatService.getBoatById(Number(id)),
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Find similar boats based on type and price range
  const {
    data: similarBoatsData,
    isLoading: isSimilarBoatsLoading,
    error: similarBoatsError,
    refetch: refetchSimilarBoats,
  } = useQuery({
    queryKey: ["similar-boats", boatData?.type],
    queryFn: () =>
      boatService.searchBoats({
        type: boatData?.type,
      }),
    select: (data) =>
      data.filter((boat) => boat.id !== boatData?.id).slice(0, 4),
    enabled: !!boatData?.type && shouldLoadSimilarBoats,
    retry: 2,
  });

  // Geçerli fotoğrafları filtrele ve default image sistemi ekle
  const [validImages, setValidImages] = React.useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    if (boatData?.images && boatData.images.length > 0) {
      // Backend'den gelen URL'leri direkt kullan
      const validImageUrls = boatData.images
        .filter((img) => img && img.imageUrl && isValidImageUrl(img.imageUrl))
        .map((img) => img.imageUrl);

      if (validImageUrls.length > 0) {
        setValidImages(validImageUrls);
      } else {
        // Geçerli URL yoksa default image kullan
        setValidImages([getBoatImageUrl()]);
      }
      setCurrentImageIndex(0);
    } else {
      // Hiç fotoğraf yoksa default image kullan
      setValidImages([getBoatImageUrl()]);
      setCurrentImageIndex(0);
    }
  }, [boatData]);

  // Navigation functions for image gallery
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (isLoading || isRetrying) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-primary/5">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
            {/* Hero Image Skeleton */}
            <div className="relative pt-16 sm:pt-20 pb-8 sm:pb-12">
              <ImageGallerySkeleton className="mb-8" />
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
              <div className="lg:col-span-8 space-y-6 sm:space-y-8 lg:space-y-12">
                <BoatInfoSkeleton />
                <BoatFeaturesSkeleton />
                <HostInfoSkeleton />
                <ReviewsSkeleton />
                <SimilarBoatsSkeleton />
              </div>
              <div className="lg:col-span-4">
                <BookingFormSkeleton className="sticky top-8" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    // Check if it's a network error
    const isNetworkError =
      error.message?.includes("fetch") || error.message?.includes("network");

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-primary/5">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
            {isNetworkError ? (
              <NetworkError onRetry={() => refetchBoat()} />
            ) : (
              <ErrorState
                title="Boat Loading Failed"
                message="We couldn't load the boat details. Please try again."
                onRetry={() => refetchBoat()}
                variant="error"
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!boatData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-primary/5">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
            <BoatNotFoundError onGoBack={() => window.history.back()} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-primary/5">
      <Navbar />
      <main
        className="flex-grow pb-20 md:pb-0"
        role="main"
        aria-label="Boat listing details"
      >
        {/* Add bottom padding for mobile booking footer */}
        {/* Enhanced Hero Section with Corporate Design */}
        <section
          className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden"
          aria-label="Boat image gallery"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,95,122,0.1),transparent_50%)]" />

          <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            {/* Hero Image Gallery with Professional Presentation */}
            <div className="relative animate-fade-in">
              {validImages.length > 0 ? (
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100/50 backdrop-blur-sm transition-all duration-700 hover:shadow-3xl group">
                  {/* Action Buttons */}
                  <div className="absolute top-8 right-8 z-20 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Paylaş
                    </Button>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <img
                        src={validImages[currentImageIndex]}
                        alt={`${boatData.name} - Görsel ${
                          currentImageIndex + 1
                        }`}
                        className="w-full h-full object-cover transition-all duration-700 ease-out hover:scale-105 cursor-pointer"
                        loading="eager"
                      />
                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-30" />

                      {/* Floating Navigation with Glass-morphism */}
                      {validImages.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-md border-white/50 transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] touch-manipulation"
                            onClick={previousImage}
                            aria-label="Previous image"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-md border-white/50 transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] touch-manipulation"
                            onClick={nextImage}
                            aria-label="Next image"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </>
                      )}

                      {/* Professional Image Counter */}
                      {validImages.length > 1 && (
                        <div className="absolute bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          {currentImageIndex + 1} / {validImages.length}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Thumbnail Strip */}
                  {validImages.length > 1 && (
                    <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {validImages.slice(0, 8).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 hover:scale-105 ${
                            currentImageIndex === index
                              ? "border-primary ring-4 ring-primary/20 shadow-lg"
                              : "border-transparent hover:border-primary/50 shadow-md"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                        </button>
                      ))}
                      {validImages.length > 8 && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium border-2 border-gray-200 shadow-md">
                          +{validImages.length - 8}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100/50 backdrop-blur-sm">
                  <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center animate-pulse">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Anchor className="h-12 w-12 text-primary/60" />
                      </div>
                      <p className="text-gray-500 text-xl font-medium">
                        Bu tekne için fotoğraf bulunmuyor
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Yakında fotoğraflar eklenecek
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Main Content Area with Corporate Design */}
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent" />

          <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
            {/* Three-Column Grid Layout with Proper Responsive Breakpoints */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
              {/* Main Content Area - Spans 8 columns on lg+ screens */}
              <div className="lg:col-span-8 space-y-6 sm:space-y-8 lg:space-y-12">
                {/* Enhanced Boat Header with Corporate Design */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl animate-fade-in">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8 mb-6 sm:mb-8">
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      {/* Badges and Rating */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20 hover:from-primary/20 hover:to-primary/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300"
                        >
                          {boatData.type}
                        </Badge>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-200/50">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  i < Math.floor(boatData.rating || 4.8)
                                    ? "text-amber-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            {boatData.rating || 4.8}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            (24 değerlendirme)
                          </span>
                        </div>
                      </div>

                      {/* Title and Location */}
                      <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                          {boatData.name}
                        </h1>
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <span className="text-base sm:text-lg font-medium">
                            {boatData.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="flex flex-col items-start lg:items-end gap-3 bg-gradient-to-br from-primary/5 to-secondary/5 p-4 sm:p-6 rounded-2xl border border-primary/10">
                      <div className="text-left lg:text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                            ₺{Number(boatData.dailyPrice).toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-base sm:text-lg font-medium">
                            /gün
                          </span>
                        </div>
                        {boatData.hourlyPrice && (
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            veya ₺
                            {Number(boatData.hourlyPrice).toLocaleString()}/saat
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                        Vergiler dahil
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  {/* Enhanced Quick Info Cards */}
                  <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <VisualFeedback
                      variant="lift"
                      intensity="sm"
                      className="opacity-0 animate-slide-in-up"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <div
                        ref={(el) => (quickInfoRefs.current[0] = el)}
                        className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 text-center border border-blue-200/50"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-blue-700 font-medium mb-1">
                          Kapasite
                        </div>
                        <div className="text-xl font-bold text-blue-900">
                          {boatData.capacity} kişi
                        </div>
                      </div>
                    </VisualFeedback>

                    <VisualFeedback
                      variant="lift"
                      intensity="sm"
                      className="opacity-0 animate-slide-in-up"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div
                        ref={(el) => (quickInfoRefs.current[1] = el)}
                        className="group bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 text-center border border-primary/20"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Anchor className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-primary font-medium mb-1">
                          Uzunluk
                        </div>
                        <div className="text-xl font-bold text-primary-dark">
                          {boatData.length}m
                        </div>
                      </div>
                    </VisualFeedback>

                    <VisualFeedback
                      variant="lift"
                      intensity="sm"
                      className="opacity-0 animate-slide-in-up"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <div
                        ref={(el) => (quickInfoRefs.current[2] = el)}
                        className="group bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl p-6 text-center border border-green-200/50"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-green-700 font-medium mb-1">
                          Kaptan
                        </div>
                        <div className="text-xl font-bold text-green-900">
                          {boatData.captainIncluded ? "Dahil" : "Opsiyonel"}
                        </div>
                      </div>
                    </VisualFeedback>
                  </div>

                  {/* Enhanced Description */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      Açıklama
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {boatData.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Features Section with Corporate Design */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                    Özellikler
                  </h2>
                  <BoatFeatures features={boatData.features} />
                </div>

                {/* Enhanced Host Section with Professional Design */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                    Tekne Sahibi
                  </h2>
                  <HostInfo
                    hostName={`${boatData.name} Sahibi`}
                    responseRate={95}
                    responseTime="~1 saat"
                    isCertified={true}
                    isVerified={true}
                    joinDate="2020"
                    rating={boatData.rating || 4.8}
                    reviewCount={24}
                    totalBookings={150}
                  />
                </div>

                {/* Enhanced Reviews Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 transition-all duration-500 hover:shadow-2xl overflow-hidden">
                  <div className="p-8 lg:p-10">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      Değerlendirmeler
                    </h2>
                  </div>
                  <Reviews boatId={boatData.id} />
                </div>

                {/* Enhanced Similar Boats Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 transition-all duration-500 hover:shadow-2xl overflow-hidden">
                  <ProgressiveLoader
                    isLoading={isSimilarBoatsLoading}
                    skeleton={<SimilarBoatsSkeleton className="p-8 lg:p-10" />}
                  >
                    <SimilarBoats
                      boats={similarBoatsData || []}
                      isLoading={isSimilarBoatsLoading}
                      currentBoatId={boatData?.id}
                      error={
                        similarBoatsError
                          ? "Failed to load similar boats"
                          : null
                      }
                      onRetry={() => refetchSimilarBoats()}
                    />
                  </ProgressiveLoader>
                </div>
              </div>

              {/* Enhanced Booking Sidebar - Spans 4 columns on lg+ screens */}
              <div className="lg:col-span-4">
                <div className="sticky top-8 space-y-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                    <BookingForm
                      dailyPrice={Number(boatData.dailyPrice) || 0}
                      hourlyPrice={Number(boatData.hourlyPrice) || 0}
                      isHourly={false}
                      maxGuests={boatData.capacity}
                      boatId={boatData.id.toString()}
                    />
                  </div>

                  {/* Additional Trust Indicators */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Güvenli ödeme sistemi</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Ücretsiz iptal (24 saat öncesine kadar)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <span>7/24 müşteri desteği</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Wrap the component with ErrorBoundary for comprehensive error handling
const BoatListingWithErrorBoundary = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error("BoatListing Error:", error, errorInfo);
      notificationService.error(
        "An unexpected error occurred while loading the boat details.",
        {
          title: "Application Error",
          action: {
            label: "Reload Page",
            onClick: () => window.location.reload(),
          },
        }
      );
    }}
  >
    <BoatListing />
  </ErrorBoundary>
);

export default BoatListingWithErrorBoundary;
