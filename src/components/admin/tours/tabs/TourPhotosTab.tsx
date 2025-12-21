import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  Move,
  AlertCircle,
  CheckCircle,
  Camera,
  Sparkles,
  Grid3x3,
  FileImage,
  Cloud
} from "lucide-react";
import { TourImageDTO } from "@/types/tour.types";

interface TourPhotosTabProps {
  photos: File[];
  existingImages?: TourImageDTO[];
  onChange: (photos: File[]) => void;
  onDeleteExisting?: (imageId: number) => void;
}

const TourPhotosTab: React.FC<TourPhotosTabProps> = ({
  photos,
  existingImages = [],
  onChange,
  onDeleteExisting
}) => {
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file select button click
  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag and drop for file upload area
  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = {
        target: { files, value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  // Handle file uploads with progress simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = [...photos];
    let addedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (existingImages.length + newPhotos.length >= 10) {
        errors.push("Maksimum 10 fotoğraf yükleyebilirsiniz");
        break;
      }

      const file = files[i];

      // File size check (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} dosyası 5MB'dan büyük`);
        continue;
      }

      // File type check
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} geçerli bir resim dosyası değil`);
        continue;
      }

      // Simulate upload progress
      const fileName = file.name;
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileName] || 0;
          if (current >= 100) {
            clearInterval(interval);
            // Remove from progress after completion
            setTimeout(() => {
              setUploadProgress(p => {
                const { [fileName]: _, ...rest } = p;
                return rest;
              });
            }, 500);
            return prev;
          }
          return { ...prev, [fileName]: Math.min(current + 20, 100) };
        });
      }, 100);

      newPhotos.push(file);
      addedCount++;
    }

    onChange(newPhotos);
    e.target.value = "";

    // Show errors if any
    if (errors.length > 0) {
      console.warn("Upload errors:", errors);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);

    // Adjust featured index if needed
    if (index === featuredIndex) {
      setFeaturedIndex(0);
    } else if (index < featuredIndex) {
      setFeaturedIndex(featuredIndex - 1);
    }
  };

  const setFeatured = (index: number) => {
    setFeaturedIndex(index);
  };

  // Drag and drop functionality for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];

    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);

    onChange(newPhotos);

    if (featuredIndex === draggedIndex) {
      setFeaturedIndex(index);
    } else if (featuredIndex > draggedIndex && featuredIndex <= index) {
      setFeaturedIndex(featuredIndex - 1);
    } else if (featuredIndex < draggedIndex && featuredIndex >= index) {
      setFeaturedIndex(featuredIndex + 1);
    }

    setDraggedIndex(null);
  };

  const getPhotoUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Total photos count including existing images from CloudFlare
  const totalPhotosCount = existingImages.length + photos.length;
  const uploadPercentage = (totalPhotosCount / 10) * 100;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#15847c] to-[#0e5c56] rounded-2xl opacity-10"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#15847c] rounded-lg">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Fotoğraflar</h2>
          </div>
          <p className="text-gray-600 ml-11">
            Tur için en fazla 10 fotoğraf ekleyebilirsiniz. İlk fotoğraf ana görsel olarak kullanılacaktır.
          </p>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {totalPhotosCount > 0 && (
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Fotoğraf Durumu</span>
            <Badge variant={uploadPercentage === 100 ? "default" : "outline"} className="bg-[#15847c]/10 text-[#15847c] border-[#15847c]">
              {totalPhotosCount}/10 Fotoğraf
              {existingImages.length > 0 && photos.length > 0 && (
                <span className="ml-1 text-xs">({existingImages.length} mevcut + {photos.length} yeni)</span>
              )}
            </Badge>
          </div>
          <Progress value={uploadPercentage} className="h-2" />
        </Card>
      )}

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          isDraggingOver
            ? 'border-[#15847c] bg-[#15847c]/5 shadow-xl scale-[1.02]'
            : 'border-gray-300 hover:border-[#15847c] hover:shadow-lg'
        } ${totalPhotosCount >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDropFiles}
        onDragLeave={handleDragLeave}
      >
        <div className="p-12 text-center">
          <div className={`inline-flex p-4 rounded-full mb-4 transition-all duration-300 ${
            isDraggingOver ? 'bg-[#15847c]/20 scale-110' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 transition-colors ${
              isDraggingOver ? 'text-[#15847c]' : 'text-gray-400'
            }`} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isDraggingOver ? 'Bırakın!' : 'Fotoğrafları Sürükleyin veya Seçin'}
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            JPG, PNG veya WEBP formatında, en fazla 10 adet fotoğraf. Her dosya maksimum 5MB olabilir.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={totalPhotosCount >= 10}
            />

            <Button
              type="button"
              onClick={handleFileSelectClick}
              disabled={totalPhotosCount >= 10}
              className="bg-[#15847c] hover:bg-[#0e5c56] text-white disabled:opacity-50"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {totalPhotosCount >= 10 ? "Maksimum Sayıya Ulaşıldı" : "Bilgisayardan Seç"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="border-[#15847c] text-[#15847c] hover:bg-[#15847c]/10"
            >
              <Camera className="h-4 w-4 mr-2" />
              Stok Fotoğraflar
            </Button>
          </div>
          
          {/* Upload Progress Items */}
          {Object.entries(uploadProgress).length > 0 && (
            <div className="mt-6 space-y-2 max-w-md mx-auto">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 truncate">{fileName}</span>
                      <span className="text-xs font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                  {progress === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Existing Images from CloudFlare (Edit Mode) */}
      {existingImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[#15847c]" />
                Mevcut Fotoğraflar
              </h3>
              <p className="text-sm text-gray-600 mt-1">CloudFlare'de kayıtlı fotoğraflar</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              {existingImages.length} Fotoğraf
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <Card className={`overflow-hidden border-2 transition-all duration-300 ${
                  index === 0
                    ? "border-[#15847c] shadow-xl ring-2 ring-[#15847c]/20"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}>
                  <div className="aspect-square relative">
                    <img
                      src={image.mediumUrl || image.publicUrl || image.thumbnailUrl || ''}
                      alt={`Tour photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to other URLs if primary fails
                        const target = e.target as HTMLImageElement;
                        if (image.publicUrl && target.src !== image.publicUrl) {
                          target.src = image.publicUrl;
                        } else if (image.thumbnailUrl && target.src !== image.thumbnailUrl) {
                          target.src = image.thumbnailUrl;
                        }
                      }}
                    />

                    {/* Overlay with delete button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 right-2">
                        {onDeleteExisting && (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 transition-all duration-300"
                            onClick={() => onDeleteExisting(image.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Photo Number */}
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-black/70 text-white border-0">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>

                    {/* Featured Badge for first image */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-gradient-to-r from-[#15847c] to-[#0e5c56] text-white border-0 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Ana Fotoğraf
                        </Badge>
                      </div>
                    )}

                    {/* CloudFlare indicator */}
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-blue-500/80 text-white border-0 text-xs">
                        <Cloud className="h-3 w-3" />
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Photo Grid (Local uploads) */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-[#15847c]" />
                {existingImages.length > 0 ? "Yeni Eklenen Fotoğraflar" : "Yüklenen Fotoğraflar"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Sürükleyerek sırayı değiştirebilirsiniz</p>
            </div>

            {photos.length > 1 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                <Move className="h-3 w-3 mr-1" />
                Sürükle & Bırak Aktif
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`relative group ${draggedIndex === index ? "opacity-50" : ""}`}
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
              >
                <Card className={`overflow-hidden border-2 transition-all duration-300 cursor-move ${
                  index === featuredIndex 
                    ? "border-[#15847c] shadow-xl ring-2 ring-[#15847c]/20" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}>
                  <div className="aspect-square relative">
                    <img
                      src={getPhotoUrl(photo)}
                      alt={`Tour photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className={`h-8 w-8 transition-all duration-300 ${
                            index === featuredIndex
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : "bg-white/90 hover:bg-white text-gray-700"
                          }`}
                          onClick={() => setFeatured(index)}
                        >
                          {index === featuredIndex ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 transition-all duration-300"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Photo Number */}
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-black/70 text-white border-0">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Featured Badge */}
                    {index === featuredIndex && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-gradient-to-r from-[#15847c] to-[#0e5c56] text-white border-0 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Ana Fotoğraf
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Helper Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">İpuçları:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Yıldız simgesine tıklayarak ana fotoğrafı değiştirebilirsiniz</li>
                  <li>Fotoğrafları sürükleyerek sıralamayı değiştirebilirsiniz</li>
                  <li>Yüksek kaliteli ve iyi ışıklandırılmış fotoğraflar kullanın</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPhotosTab;