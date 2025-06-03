import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState<number[]>([]);

  // Geçerli fotoğrafları filtrele (boş string'leri ve undefined'ları kaldır)
  const validImages = images.filter((img) => img && img.trim() !== "");

  // Eğer geçerli fotoğraf yoksa fallback göster
  if (!validImages || validImages.length === 0) {
    return (
      <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Fotoğraf bulunamadı</p>
      </div>
    );
  }

  // Current image index'i geçerli range'de tut
  const safeCurrentImage = Math.min(currentImage, validImages.length - 1);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % validImages.length);
  };

  const previousImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + validImages.length) % validImages.length
    );
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => [...prev, index]);
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100">
      {/* Main Image */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={validImages[safeCurrentImage]}
          alt={`Boat image ${safeCurrentImage + 1}`}
          className="w-full h-full object-cover"
          onError={() => handleImageError(safeCurrentImage)}
        />

        {/* Navigation Arrows - sadece birden fazla fotoğraf varsa göster */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={previousImage}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails - sadece birden fazla fotoğraf varsa göster */}
      {validImages.length > 1 && (
        <div className="relative mt-4 pb-4">
          <div className="flex space-x-2 overflow-x-auto px-4">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden",
                  currentImage === index && "ring-2 ring-primary"
                )}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
