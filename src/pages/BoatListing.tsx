import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageGallery from "@/components/boats/ImageGallery";
import BoatInfo from "@/components/boats/BoatInfo";
import BookingForm from "@/components/boats/BookingForm";
import BoatFeatures from "@/components/boats/BoatFeatures";
import SimilarBoats from "@/components/boats/SimilarBoats";
import Reviews from "@/components/boats/Reviews";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { boatService } from "@/services/boatService";
import { useQuery } from "@tanstack/react-query";
import { BoatDTO } from "@/types/boat.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getImageUrl } from "@/lib/imageUtils";

const BoatListing = () => {
  const { id } = useParams();

  const {
    data: boatData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boat", id],
    queryFn: () => boatService.getBoatById(Number(id)),
    enabled: !!id,
  });

  // Find similar boats based on type and price range
  const { data: similarBoatsData } = useQuery({
    queryKey: ["similar-boats", boatData?.type],
    queryFn: () =>
      boatService.searchBoats({
        type: boatData?.type,
      }),
    select: (data) =>
      data.filter((boat) => boat.id !== boatData?.id).slice(0, 4),
    enabled: !!boatData?.type, // Only run when we have boat type
  });

  // Geçerli fotoğrafları filtrele - sadece boatData varsa
  const validImages = boatData?.images
    ? boatData.images
        .filter((img) => img && img.id) // null/undefined kontrolü
        .map((img) => getImageUrl(img.id))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
                <Skeleton className="h-64" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-96" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>
                Tekne detayları yüklenirken bir hata oluştu. Lütfen daha sonra
                tekrar deneyin.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!boatData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert>
              <AlertTitle>Tekne Bulunamadı</AlertTitle>
              <AlertDescription>
                Aradığınız tekne bulunamadı. Lütfen geçerli bir tekne seçin.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {validImages.length > 0 ? (
            <ImageGallery images={validImages} />
          ) : (
            <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Bu tekne için fotoğraf bulunmuyor</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BoatInfo
                boat={{
                  name: boatData.name,
                  type: boatData.type,
                  location: boatData.location,
                  rating: boatData.rating || 0,
                  reviewCount: 0, // TODO: Add review count to BoatDTO
                  length: boatData.length.toString(),
                  capacity: boatData.capacity,
                  captainOption: boatData.captainIncluded
                    ? "Captain Included"
                    : "Optional Captain",
                  description: boatData.description,
                }}
              />

              <BoatFeatures features={boatData.features} />

              {/* Meet Your Host Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Tekne Sahibi</h2>
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-600">
                        {boatData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {boatData.name} Sahibi
                      </h3>
                      <div className="mt-2 space-y-2 text-gray-600">
                        <p>Yanıt oranı: 95%</p>
                        <p>Yanıt süresi: ~1 saat</p>
                      </div>
                      <p className="mt-4 text-gray-700">
                        Profesyonel kaptan ve tekne sahibi. Türk Denizcilik
                        Kurumu sertifikalı.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Reviews
                boatId={boatData.id}
              />

              <div className="mt-16">
                <h2 className="text-2xl font-semibold mb-6">Benzer Tekneler</h2>
                {similarBoatsData && similarBoatsData.length > 0 ? (
                  <SimilarBoats boats={similarBoatsData} />
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Bu kategoride başka tekne bulunamadı.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <BookingForm
                price={Number(boatData.dailyPrice) || 0}
                isHourly={false}
                maxGuests={boatData.capacity}
                boatId={boatData.id.toString()}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BoatListing;
