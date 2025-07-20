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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, MapPin, Users, Anchor, Star, Shield, Clock, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { boatService } from "@/services/boatService";
import { useQuery } from "@tanstack/react-query";
import { BoatDTO } from "@/types/boat.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getImageUrl } from "@/lib/imageUtils";
import {Button} from "@/components/ui/button.tsx";

// Default image helper function for boat detail page
const getBoatImageUrl = async (imageId?: number): Promise<string> => {
  try {
    if (imageId) {
      // Önce gerçek image'ı dene
      const imageUrl = getImageUrl(imageId);
      const response = await fetch(imageUrl);
      if (response.ok) {
        return imageUrl;
      }
    }

    // Eğer image yoksa default image API'sinden al
    const response = await fetch("http://localhost:8080/api/boats/default-image");
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("Error loading boat image:", error);
  }

  // Fallback placeholder
  return "/placeholder-boat.jpg";
};

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

  // Geçerli fotoğrafları filtrele ve default image sistemi ekle
  const [validImages, setValidImages] = React.useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const loadImages = async () => {
      if (boatData?.images && boatData.images.length > 0) {
        // Gerçek fotoğrafları yükle
        const imagePromises = boatData.images
          .filter((img) => img && img.id)
          .map(async (img) => {
            try {
              const imageUrl = getImageUrl(img.id);
              const response = await fetch(imageUrl);
              if (response.ok) {
                return imageUrl;
              }
              // Eğer image yüklenemezse default image kullan
              return await getBoatImageUrl();
            } catch {
              return await getBoatImageUrl();
            }
          });

        const images = await Promise.all(imagePromises);
        setValidImages(images);
        setCurrentImageIndex(0); // Reset index when images change
      } else {
        // Hiç fotoğraf yoksa default image kullan
        const defaultImage = await getBoatImageUrl();
        setValidImages([defaultImage]);
        setCurrentImageIndex(0);
      }
    };

    if (boatData) {
      loadImages();
    }
  }, [boatData]);

  // Navigation functions for image gallery
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
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
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
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
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Image Section with Enhanced Spacing and Modern Animation */}
        <div className="pt-20 pb-8">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
            <div className="relative">
              {validImages.length > 0 ? (
                <div className="relative bg-white rounded-3xl p-4 shadow-xl border border-gray-100 transition-all duration-500 hover:shadow-2xl">
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={validImages[currentImageIndex]}
                        alt={`Boat image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-all duration-700 ease-out hover:scale-110 cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Image Navigation */}
                      {validImages.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                            onClick={previousImage}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                            onClick={nextImage}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Image Counter */}
                    {validImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {validImages.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {validImages.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                      {validImages.slice(0, 6).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            currentImageIndex === index 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-transparent hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      {validImages.length > 6 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs border-2 border-transparent">
                          +{validImages.length - 6}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Anchor className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">Bu tekne için fotoğraf bulunmuyor</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">

          {/* Main Content Grid with Enhanced Spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {/* Boat Header with Modern Design */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {boatData.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {boatData.rating || 4.8} (24 değerlendirme)
                        </span>
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{boatData.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span className="text-lg">{boatData.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-600">
                        ₺{Number(boatData.dailyPrice).toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-1">/gün</span>
                    </div>
                    {boatData.hourlyPrice && (
                      <div className="text-sm text-gray-500">
                        veya ₺{Number(boatData.hourlyPrice).toLocaleString()}/saat
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Kapasite</div>
                    <div className="font-semibold text-gray-900">{boatData.capacity} kişi</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Anchor className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Uzunluk</div>
                    <div className="font-semibold text-gray-900">{boatData.length}m</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                    <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Kaptan</div>
                    <div className="font-semibold text-gray-900">
                      {boatData.captainIncluded ? "Dahil" : "Opsiyonel"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Açıklama</h3>
                  <p className="text-gray-700 leading-relaxed">{boatData.description}</p>
                </div>
              </div>

              {/* Features Section with Modern Cards */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Özellikler</h2>
                <BoatFeatures features={boatData.features} />
              </div>

              {/* Meet Your Host Section with Enhanced Design */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tekne Sahibi</h2>
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {boatData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {boatData.name} Sahibi
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Yanıt oranı: 95%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Yanıt süresi: ~1 saat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Sertifikalı</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Profesyonel kaptan ve tekne sahibi. Türk Denizcilik
                      Kurumu sertifikalı. Deneyimli ve güvenilir hizmet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <Reviews boatId={boatData.id} />
              </div>

              {/* Similar Boats Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer Tekneler</h2>
                {similarBoatsData && similarBoatsData.length > 0 ? (
                  <SimilarBoats boats={similarBoatsData} />
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <Anchor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      Bu kategoride başka tekne bulunamadı.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form - Preserved Position */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BookingForm
                  dailyPrice={Number(boatData.dailyPrice) || 0}
                  hourlyPrice={Number(boatData.hourlyPrice) || 0}
                  isHourly={false}
                  maxGuests={boatData.capacity}
                  boatId={boatData.id.toString()}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BoatListing;
