import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Share2,
  Camera,
  MapPin,
  Users,
  Clock,
  Star,
  Calendar,
} from "lucide-react";
import { TourDTO } from "@/types/tour.types";
import { getFullImageUrl } from "@/lib/imageUtils";
import { useSwipeGestures } from "@/hooks/useMobileGestures";
import { useViewport } from "@/hooks/useResponsiveAnimations";
import { useTouchTarget } from "@/hooks/useMobileGestures";

interface TourHeroSectionProps {
  tour: TourDTO;
  onSave?: () => void;
  onShare?: () => void;
}

const TourHeroSection: React.FC<TourHeroSectionProps> = ({
  tour,
  onSave,
  onShare,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isMobile } = useViewport();
  const { getTouchTargetProps } = useTouchTarget();

  // Process tour images
  const validImages =
    tour.tourImages && tour.tourImages.length > 0
      ? tour.tourImages
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((img) => getFullImageUrl(img.imageUrl))
          .filter((url) => Boolean(url))
      : [];

  // Default görsel kaldırıldı: geçerli görsel yoksa boş durum gösterilecek
  const displayImages = validImages.length > 0 ? validImages : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Swipe gesture handlers
  const { elementRef: swipeRef } = useSwipeGestures(
    {
      onSwipeLeft: () => {
        if (displayImages.length > 1) {
          nextImage();
        }
      },
      onSwipeRight: () => {
        if (displayImages.length > 1) {
          previousImage();
        }
      },
    },
    {
      threshold: 50,
      velocity: 0.3,
    }
  );

  // Get tour duration from first available date
  const getDuration = () => {
    if (tour.tourDates && tour.tourDates.length > 0) {
      return tour.tourDates[0].durationText || "Tam Gün";
    }
    return "Tam Gün";
  };

  // Get difficulty level (placeholder - would come from tour data)
  const getDifficulty = () => {
    // This would typically come from tour data
    return "Orta";
  };

  return (
    <section
      className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden"
      aria-label="Tour image gallery"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,152,219,0.1),transparent_50%)]" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Hero Image Gallery with Professional Presentation */}
        <div className="relative animate-fade-in">
          <GlassCard className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 transition-all duration-700 hover:shadow-3xl group">
            {/* Floating Action Buttons */}
            <div className="absolute top-8 right-8 z-20 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50 font-montserrat"
                onClick={onSave}
              >
                <Heart className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-white/50 font-montserrat"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
            </div>

            <div className="relative overflow-hidden rounded-2xl">
              <div className="aspect-[16/10] relative overflow-hidden">
                {displayImages.length > 0 ? (
                  <>
                    <img
                      src={displayImages[currentImageIndex]}
                      alt={`${tour.name} - Görsel ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 ease-out hover:scale-105 cursor-pointer"
                      loading="eager"
                    />

                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3498db]/20 via-transparent to-[#2c3e50]/20 opacity-30" />

                    {/* Tour Information Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex justify-between items-end">
                        <div>
                          <h1 className="text-4xl font-bold text-white mb-4 font-montserrat">
                            {tour.name}
                          </h1>

                          {/* Quick Info Grid */}
                          <div className="flex flex-wrap gap-6 text-white/90">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                              <MapPin className="h-4 w-4" />
                              <span className="font-roboto">{tour.location}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                              <Users className="h-4 w-4" />
                              <span className="font-roboto">{tour.capacity} kişi</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                              <Clock className="h-4 w-4" />
                              <span className="font-roboto">{getDuration()}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                              <Calendar className="h-4 w-4" />
                              <span className="font-roboto">Zorluk: {getDifficulty()}</span>
                            </div>
                            {typeof tour.rating === "number" && (
                              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-roboto">{tour.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white mb-2 font-montserrat bg-gradient-to-r from-white to-white/80 bg-clip-text">
                            {Number(tour.price).toLocaleString("tr-TR")} ₺
                          </div>
                          <div className="text-white/80 font-roboto">kişi başı</div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Navigation with Glassmorphism */}
                    {displayImages.length > 1 && (
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
                    {displayImages.length > 1 && (
                      <div className="absolute bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {currentImageIndex + 1} / {displayImages.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#3498db]/20 to-[#2c3e50]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Camera className="h-12 w-12 text-[#3498db]" />
                      </div>
                      <p className="text-gray-600 text-lg font-medium">Bu tur için fotoğraf bulunmuyor</p>
                      <p className="text-gray-400 text-sm mt-2">Yakında fotoğraflar eklenecek</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.slice(0, 8).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 hover:scale-105 ${
                      currentImageIndex === index
                        ? "border-[#3498db] ring-4 ring-[#3498db]/20 shadow-lg"
                        : "border-transparent hover:border-[#3498db]/50 shadow-md"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </button>
                ))}
                {displayImages.length > 8 && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-black/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-sm font-medium">
                    +{displayImages.length - 8}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default TourHeroSection;
