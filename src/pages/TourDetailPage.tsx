import React from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { tourService } from "@/services/tourService";
import { TourDTO } from "@/types/tour.types";
import TourHeroSection from "@/components/tours/TourHeroSection";
import TourInfoSection from "@/components/tours/TourInfoSection";
import TourFeatures from "@/components/tours/TourFeatures";
import TourBookingForm from "@/components/tours/TourBookingForm";
import TourDetailPageSkeleton from "@/components/tours/TourDetailPageSkeleton";
import SimilarTours from "@/components/tours/SimilarTours";
import { useSimilarTours } from "@/hooks/useSimilarTours";
import Layout from "@/components/layout/Layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// New rich detail components
import TourHighlights from "@/components/tours/TourHighlights";
import TourIncluded from "@/components/tours/TourIncluded";
import TourLanguages from "@/components/tours/TourLanguages";
import TourRequirements from "@/components/tours/TourRequirements";
import TourRestrictions from "@/components/tours/TourRestrictions";
import TourRoute from "@/components/tours/TourRoute";
import TourCancellation from "@/components/tours/TourCancellation";

const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // ✅ React Query: Tur detayını önbelleğe alın ve yeniden kullanım sağlayın
  const {
    data: tour,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tour", Number(id)],
    queryFn: () => tourService.getTourById(Number(id)),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });

  // Similar tours hook
  const {
    similarTours,
    isLoading: similarToursLoading,
    error: similarToursError,
    refetch: refetchSimilarTours,
  } = useSimilarTours({
    currentTour: tour || undefined,
    limit: 6,
  });

  // Opsiyonel: Benzer turları önceden getir (küçük ısınma)
  React.useEffect(() => {
    if (!tour?.type) return;
    queryClient.prefetchQuery({
      queryKey: ["similar-tours", tour.type, tour.location],
      queryFn: () =>
        tourService.advancedSearchPaginated(
          {
            type: tour.type,
            location: tour.location,
          },
          { page: 0, size: 6, sort: "rating,desc" }
        ),
      staleTime: 10 * 60 * 1000,
    });
  }, [tour?.type, tour?.location, queryClient]);

  const handleSave = () => {
    toast({
      title: "Tur Kaydedildi",
      description: "Tur favorilerinize eklendi.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tour?.name,
        text: tour?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Kopyalandı",
        description: "Tur linki panoya kopyalandı.",
      });
    }
  };

  if (loading) {
    return <TourDetailPageSkeleton />;
  }

  if (isError || !tour) {
    return (
      <Layout>
        <div className="min-h-[60vh] bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4 font-roboto">
              {(error as any)?.message || "Tur bulunamadı"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5">
        {/* Hero Section */}
        <TourHeroSection
          tour={tour}
          onSave={handleSave}
          onShare={handleShare}
        />

        {/* Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
          {/* Highlights Section - Full Width */}
          <TourHighlights highlights={tour.highlights} />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2 cols */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tour Info with Languages */}
              <div className="space-y-4">
                <TourInfoSection tour={tour} />
                {/* Languages inline display */}
                {tour.languages && tour.languages.length > 0 && (
                  <div className="px-6">
                    <TourLanguages languages={tour.languages} variant="inline" />
                  </div>
                )}
              </div>

              {/* Route/Itinerary */}
              <TourRoute
                route={tour.routeDescription}
                locationDescription={tour.locationDescription}
              />

              {/* Features */}
              <TourFeatures tour={tour} features={tour.features || []} />

              {/* What's Included */}
              <TourIncluded included={tour.includedServices} />

              {/* Requirements */}
              <TourRequirements requirements={tour.requirements} />

              {/* Restrictions */}
              <TourRestrictions
                notAllowed={tour.notAllowed}
                notSuitableFor={tour.notSuitableFor}
              />
            </div>

            {/* Sidebar - 1 col */}
            <div className="lg:col-span-1 space-y-6">
              {/* Cancellation Policy */}
              <TourCancellation policy={tour.cancellationPolicy} />

              {/* Languages Card (for mobile/tablet) */}
              <div className="hidden sm:block lg:hidden">
                <TourLanguages languages={tour.languages} variant="card" />
              </div>

              {/* Booking Form - Sticky */}
              <div className="lg:sticky lg:top-24">
                <TourBookingForm tour={tour} />
              </div>
            </div>
          </div>

          {/* Similar Tours Section */}
          <div className="mt-12">
            <SimilarTours
              tours={similarTours}
              isLoading={similarToursLoading}
              currentTourId={tour.id}
              error={similarToursError}
              onRetry={refetchSimilarTours}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TourDetailPage;
