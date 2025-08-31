import React, { useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/boats/BookingForm";
import BoatFeatures from "@/components/boats/BoatFeatures";
import BoatServices from "@/components/boats/BoatServices";
import HostInfo from "@/components/boats/HostInfo";
import SimilarBoats from "@/components/boats/SimilarBoats";
import Reviews from "@/components/boats/Reviews";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
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
import { bookingService } from "@/services/bookingService";
import { captainService } from "@/services/captainService";
import { useQuery } from "@tanstack/react-query";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import { isValidImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { CustomerCaptainChat } from "@/components/boats/messaging/CustomerCaptainChat";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { extractCaptainIdFromBooking } from "@/utils/conversationUtils";
import { BookingDTO } from "@/types/booking.types";
import { Captain } from "@/types/captain.types";
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
} from "@/components/ui/ErrorStates";
import { useProgressiveLoading } from "@/hooks/useProgressiveLoading";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { notificationService } from "@/services/notificationService";
import { BoatDTO } from "@/types/boat.types";
import MapPicker from "@/components/common/MapPicker";
import {
  preloadImages,
  getResponsiveImageSizes,
  getContainmentStyle,
} from "@/utils/performanceOptimizations";

// Default image kaldırıldı: geçerli görsel yoksa boş durum gösterilecek

const BoatListing = () => {
  const { id } = useParams();
  const { isAuthenticated, isCustomer, user } = useAuth();

  // Messaging state
  const [showMessaging, setShowMessaging] = React.useState(false);
  const [userBooking, setUserBooking] = React.useState<BookingDTO | null>(null);
  const [captain, setCaptain] = React.useState<Captain | null>(null);
  const [captainLoading, setCaptainLoading] = React.useState(false);
  const [checkingBooking, setCheckingBooking] = React.useState(false);

  // Micro-interactions
  const { prefersReducedMotion } = useMicroInteractions();
  const quickInfoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Progressive loading for different sections
  const { shouldLoad: shouldLoadSimilarBoats } = useProgressiveLoading({
    delay: 900,
    priority: "low",
  });

  // Optimize React Query with stricter caching and prevent refetching
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
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 30 * 60 * 1000, // 30 dakika cache
    gcTime: 60 * 60 * 1000, // For React Query v5 compatibility
    refetchInterval: false, // Otomatik refetch'i kapatın
  });

  // Memoize similar boats query to prevent re-computation
  const {
    data: similarBoatsData,
    isLoading: isSimilarBoatsLoading,
    error: similarBoatsError,
    refetch: refetchSimilarBoats,
  } = useQuery({
    queryKey: ["similar-boats", boatData?.type, boatData?.id],
    queryFn: () =>
      boatService.searchBoats({
        type: boatData?.type,
      }),
    select: useCallback(
      (data: BoatDTO[]) =>
        data.filter((boat) => boat.id !== boatData?.id).slice(0, 4),
      [boatData?.id]
    ),
    enabled: !!boatData?.type && shouldLoadSimilarBoats,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
    staleTime: 15 * 60 * 1000, // 15 minutes cache
    gcTime: 30 * 60 * 1000, // For React Query v5 compatibility
  });

  // Check if user has booking with this boat
  const checkUserBooking = React.useCallback(async () => {
    if (!isAuthenticated || !isCustomer() || !boatData?.id) {
      return;
    }

    setCheckingBooking(true);
    try {
      const booking = await bookingService.getCustomerBookingWithBoat(
        boatData.id
      );
      setUserBooking(booking);

      if (booking) {
        // console.debug("User has booking with this boat:", booking);
        // Load captain info
        setCaptainLoading(true);
        try {
          const captainId = await extractCaptainIdFromBooking(booking);
          const captainData = await captainService.getCaptainById(captainId);
          setCaptain(captainData);
          // console.debug("Captain data loaded:", captainData);
        } catch (error) {
          console.error("❌ Failed to load captain info:", error);
        } finally {
          setCaptainLoading(false);
        }
      }
    } catch (error) {
      console.error("Error checking user booking:", error);
    } finally {
      setCheckingBooking(false);
    }
  }, [isAuthenticated, isCustomer, boatData?.id]);

  // Check user booking when boat data is loaded - memoized to prevent excessive calls
  React.useEffect(() => {
    if (boatData?.id && isAuthenticated && isCustomer()) {
      checkUserBooking();
    }
  }, [boatData?.id, isAuthenticated, isCustomer]);

  // Custom hook to prevent messaging from triggering refetches
  const useStableBoatData = (boatData: BoatDTO | undefined) => {
    const stableDataRef = React.useRef(boatData);
    const [stableData, setStableData] = React.useState(boatData);

    React.useEffect(() => {
      if (boatData && !stableDataRef.current) {
        stableDataRef.current = boatData;
        setStableData(boatData);
      }
    }, [boatData]);

    return stableData || boatData;
  };

  const stableBoatData = useStableBoatData(boatData);

  // Memoize messaging callbacks to prevent re-renders
  const messagingCallbacks = useMemo(
    () => ({
      handleOpenMessaging: () => {
        if (userBooking && captain) {
          setShowMessaging(true);
        } else {
          toast({
            title: "Mesajlaşma mevcut değil",
            description: "Bu tekne ile aktif bir rezervasyonunuz bulunmuyor.",
            variant: "destructive",
          });
        }
      },
      handleCloseMessaging: () => {
        setShowMessaging(false);
      },
      isMessagingAvailable: () => {
        if (!isAuthenticated || !isCustomer() || !userBooking) {
          return false;
        }

        const allowedStatuses = ["PENDING", "CONFIRMED", "COMPLETED"];
        return allowedStatuses.includes(userBooking.status);
      },
    }),
    [userBooking, captain, isAuthenticated, isCustomer]
  );

  // Messaging functions
  const handleOpenMessaging = messagingCallbacks.handleOpenMessaging;
  const handleCloseMessaging = messagingCallbacks.handleCloseMessaging;
  const isMessagingAvailable = messagingCallbacks.isMessagingAvailable;

  // Check if messaging should be available
  const messagingAvailable = isMessagingAvailable();

  // Image processing state
  const [isProcessingImages, setIsProcessingImages] = React.useState(false);

  // Cache for signed URLs to prevent repeated requests
  const signedUrlCacheRef = React.useRef<Record<string, string>>({});
  const pendingUrlRequests = React.useRef<Set<string>>(new Set());

  // Memoize image URLs to prevent re-processing
  const processedImageUrls = useMemo(() => {
    if (!boatData?.images || boatData.images.length === 0) {
      return [];
    }

    const validImageUrls = boatData.images
      .filter((img) => img && img.imageUrl && isValidImageUrl(img.imageUrl))
      .map((img) => img.imageUrl);

    return validImageUrls.length > 0 ? validImageUrls : [];
  }, [boatData?.images]);

  // Process images with caching - optimized to prevent unnecessary processing
  React.useEffect(() => {
    const processImages = async () => {
      if (!processedImageUrls.length || isProcessingImages) return;

      // Skip if images haven't changed and we already have valid images
      if (
        validImages.length > 0 &&
        validImages.length === processedImageUrls.length
      ) {
        return;
      }

      setIsProcessingImages(true);
      try {
        const newValidImages: string[] = [];

        for (const imageUrl of processedImageUrls) {
          // Skip if already cached
          if (signedUrlCacheRef.current[imageUrl]) {
            newValidImages.push(signedUrlCacheRef.current[imageUrl]);
            continue;
          }

          // Skip if request is already pending
          if (pendingUrlRequests.current.has(imageUrl)) {
            continue;
          }

          // For Firebase Storage URLs, we need to check if they need signing
          if (
            imageUrl.includes("firebasestorage.googleapis.com") &&
            !imageUrl.includes("&signature=")
          ) {
            pendingUrlRequests.current.add(imageUrl);

            try {
              // Use the existing URL as-is for now (assuming backend provides signed URLs)
              // In a real implementation, you would call a service to get signed URLs
              signedUrlCacheRef.current[imageUrl] = imageUrl;
              newValidImages.push(imageUrl);
            } catch (error) {
              signedUrlCacheRef.current[imageUrl] = imageUrl; // Fallback to original
              newValidImages.push(imageUrl);
            } finally {
              pendingUrlRequests.current.delete(imageUrl);
            }
          } else {
            // Already signed or not Firebase URL
            signedUrlCacheRef.current[imageUrl] = imageUrl;
            newValidImages.push(imageUrl);
          }
        }

        setValidImages(newValidImages);

        // Preload first few images to prevent layout shifts
        if (newValidImages.length > 0) {
          preloadImages(newValidImages.slice(0, 3)).catch(console.warn);
        }
      } finally {
        setIsProcessingImages(false);
      }
    };

    processImages();
  }, [processedImageUrls]);

  const [validImages, setValidImages] = React.useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

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

  // Add cleanup on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      // Clear cache references on unmount
      signedUrlCacheRef.current = {};
      pendingUrlRequests.current.clear();
    };
  }, []);

  // Memoize the CustomerCaptainChat props to prevent re-renders
  const chatProps = useMemo(
    () => ({
      isOpen: showMessaging,
      onClose: handleCloseMessaging,
      booking: userBooking,
      captain: captain,
    }),
    [showMessaging, handleCloseMessaging, userBooking, captain]
  );

  // Stable boat data for the entire component lifecycle
  const finalBoatData = stableBoatData || boatData;

  if (isLoading || isRetrying) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-primary/5">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16 py-8">
            {/* Hero Image Skeleton */}
            <div className="relative pt-16 sm:pt-20 pb-8 sm:pb-12">
              <ImageGallerySkeleton className="mb-8" />
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
              <div className="lg:col-span-8 space-y-6 sm:space-y-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16 py-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16 py-8">
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
          className="relative pt-16 sm:pt-20 pb-6 sm:pb-8 lg:pb-6 overflow-hidden"
          aria-label="Boat image gallery"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,95,122,0.1),transparent_50%)]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-12">
            {/* Hero Image Gallery with Professional Presentation */}
            <div className="relative animate-fade-in">
              {validImages.length > 0 ? (
                <div
                  className="relative bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-100/50 backdrop-blur-sm transition-all duration-700 hover:shadow-3xl group"
                  style={getContainmentStyle("layout")}
                >
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
                    <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[5/3] xl:aspect-[16/9] relative overflow-hidden">
                      <img
                        src={validImages[currentImageIndex]}
                        alt={`${finalBoatData.name} - Görsel ${
                          currentImageIndex + 1
                        }`}
                        className="w-full h-full object-cover transition-all duration-700 ease-out hover:scale-105 cursor-pointer"
                        style={{ willChange: "transform" }}
                        loading="eager"
                        sizes={getResponsiveImageSizes("hero")}
                        decoding="async"
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
                            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-md border-white/50 transition-all duration-300 hover:scale-110 min-h-11 min-w-11 touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={previousImage}
                            aria-label="Previous image"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-md border-white/50 transition-all duration-300 hover:scale-110 min-h-11 min-w-11 touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                    <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {validImages.slice(0, 8).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            currentImageIndex === index
                              ? "border-primary ring-4 ring-primary/20 shadow-lg"
                              : "border-transparent hover:border-primary/50 shadow-md"
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover transition-all duration-300"
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      ))}
                      {validImages.length > 8 && (
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 xl:w-20 xl:h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-xs sm:text-sm font-medium border-2 border-gray-200 shadow-md">
                          +{validImages.length - 8}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="bg-white rounded-3xl p-8 sm:p-12 lg:p-8 shadow-2xl border border-gray-100/50 backdrop-blur-sm"
                  style={getContainmentStyle("layout")}
                >
                  <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[5/3] xl:aspect-[16/9] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 rounded-2xl flex items-center justify-center">
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16 py-8 sm:py-12">
            {/* Three-Column Grid Layout with Proper Responsive Breakpoints */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 xl:gap-12">
              {/* Main Content Area - Spans 8 columns on lg+ screens */}
              <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                {/* Enhanced Boat Header with Corporate Design */}
                <div
                  className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl animate-fade-in"
                  style={getContainmentStyle("layout")}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8 mb-6 sm:mb-8">
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      {/* Badges and Rating */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20 hover:from-primary/20 hover:to-primary/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300"
                        >
                          {finalBoatData.type}
                        </Badge>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-200/50">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  i < Math.floor(finalBoatData.rating || 4.8)
                                    ? "text-amber-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            {finalBoatData.rating || 4.8}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            (24 değerlendirme)
                          </span>
                        </div>
                      </div>

                      {/* Title and Location */}
                      <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                          {finalBoatData.name}
                        </h1>
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <span className="text-base sm:text-lg font-medium">
                            {finalBoatData.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="flex flex-col items-start lg:items-end gap-3 bg-gradient-to-br from-primary/5 to-secondary/5 p-4 sm:p-6 rounded-2xl border border-primary/10">
                      <div className="text-left lg:text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-primary">
                            ₺{Number(finalBoatData.dailyPrice).toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-base sm:text-lg font-medium">
                            /gün
                          </span>
                        </div>
                        {finalBoatData.hourlyPrice && (
                          <div className="text-xs text-gray-600 mt-1">
                            veya ₺
                            {Number(finalBoatData.hourlyPrice).toLocaleString()}
                            /saat
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <VisualFeedback
                      variant="lift"
                      intensity="sm"
                      className="opacity-0 animate-slide-in-up"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <div
                        ref={(el) => (quickInfoRefs.current[0] = el)}
                        className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 sm:p-6 text-center border border-blue-200/50"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-blue-700 font-medium mb-1">
                          Kapasite
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-blue-900">
                          {finalBoatData.capacity} kişi
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
                        className="group bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 sm:p-6 text-center border border-primary/20"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Anchor className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-primary font-medium mb-1">
                          Uzunluk
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-primary-dark">
                          {finalBoatData.length}m
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
                        className="group bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl p-4 sm:p-6 text-center border border-green-200/50"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-sm text-green-700 font-medium mb-1">
                          Kaptan
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-green-900">
                          {finalBoatData.captainIncluded
                            ? "Dahil"
                            : "Opsiyonel"}
                        </div>
                      </div>
                    </VisualFeedback>
                  </div>

                  {/* Enhanced Description */}
                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      Açıklama
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {finalBoatData.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Features Section with Corporate Design */}
                {/* Location Map Section */}
                {finalBoatData.latitude != null &&
                  finalBoatData.longitude != null && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-6 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                      <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                        Konum
                      </h2>
                      <p className="text-gray-600 mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />{" "}
                        {finalBoatData.location}
                      </p>
                      <div className="rounded-2xl overflow-hidden border border-gray-200">
                        <MapPicker
                          value={{
                            lat: finalBoatData.latitude,
                            lng: finalBoatData.longitude,
                          }}
                          height={360}
                          zoom={13}
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                {/* Enhanced Features Section with Corporate Design */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-6 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                  <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                    Özellikler
                  </h2>
                  <BoatFeatures features={finalBoatData.features} />
                </div>

                {/* Enhanced Services Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-6 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                  <BoatServices services={finalBoatData.services || []} />
                </div>

                {/* Enhanced Host Section with Professional Design */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-6 border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                  <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                    Tekne Sahibi
                  </h2>
                  <HostInfo
                    hostName={`${finalBoatData.name} Sahibi`}
                    responseRate={95}
                    responseTime="~1 saat"
                    isCertified={true}
                    isVerified={true}
                    joinDate="2020"
                    rating={finalBoatData.rating || 4.8}
                    reviewCount={24}
                    totalBookings={150}
                    boatId={finalBoatData.id}
                    onMessageHost={handleOpenMessaging}
                    showMessageButton={messagingAvailable}
                    messageButtonDisabled={captainLoading || !captain}
                    messageButtonText={
                      checkingBooking
                        ? "Kontrol ediliyor..."
                        : captainLoading
                        ? "Yükleniyor..."
                        : userBooking
                        ? "Mesaj Gönder"
                        : "Rezervasyon Gerekli"
                    }
                  />
                </div>

                {/* Enhanced Reviews Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 transition-all duration-500 hover:shadow-2xl overflow-hidden">
                  <div className="p-8 lg:p-6">
                    <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      Değerlendirmeler
                    </h2>
                  </div>
                  <Reviews boatId={finalBoatData.id} />
                </div>

                {/* Enhanced Similar Boats Section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 transition-all duration-500 hover:shadow-2xl overflow-hidden">
                  <ProgressiveLoader
                    isLoading={isSimilarBoatsLoading}
                    skeleton={<SimilarBoatsSkeleton className="p-8 lg:p-6" />}
                  >
                    <SimilarBoats
                      boats={similarBoatsData || []}
                      isLoading={isSimilarBoatsLoading}
                      currentBoatId={finalBoatData?.id}
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
                <div className="sticky top-6 sm:top-8 space-y-4 sm:space-y-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 transition-all duration-500 hover:shadow-2xl">
                    <BookingForm
                      dailyPrice={Number(finalBoatData.dailyPrice) || 0}
                      hourlyPrice={Number(finalBoatData.hourlyPrice) || 0}
                      isHourly={false}
                      maxGuests={finalBoatData.capacity}
                      boatId={finalBoatData.id.toString()}
                    />
                  </div>

                  {/* Additional Trust Indicators */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100/50">
                    <div className="space-y-3 sm:space-y-4">
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

      {/* Customer Captain Chat Modal */}
      {userBooking && captain && <CustomerCaptainChat {...chatProps} />}
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
