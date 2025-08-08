import React, { useState, useEffect } from "react";
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

const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<TourDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (id) {
      loadTourDetail(Number(id));
    }
  }, [id]);

  const loadTourDetail = async (tourId: number) => {
    try {
      setLoading(true);
      setError(null);

      const tourData = await tourService.getTourById(tourId);
      setTour(tourData);
    } catch (error) {
      console.error("Tur detayları yüklenirken hata:", error);
      setError("Tur detayları yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description: "Tur detayları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !tour) {
    return (
      <Layout>
        <div className="min-h-[60vh] bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4 font-roboto">
              {error || "Tur bulunamadı"}
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
      <TourHeroSection tour={tour} onSave={handleSave} onShare={handleShare} />

      {/* Content - Two Column Layout */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <TourInfoSection tour={tour} />
            <TourFeatures tour={tour} features={tour.features || []} />
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <TourBookingForm tour={tour} />
          </div>
        </div>

        {/* Similar Tours Section */}
        <SimilarTours
          tours={similarTours}
          isLoading={similarToursLoading}
          currentTourId={tour.id}
          error={similarToursError}
          onRetry={refetchSimilarTours}
        />
      </div>
      </div>
    </Layout>
  );
};

export default TourDetailPage;
