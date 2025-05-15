
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Star } from 'lucide-react';

interface TourPhotosTabProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

const TourPhotosTab: React.FC<TourPhotosTabProps> = ({ photos, onChange }) => {
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // In a real application, this would handle file uploads to a server
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For demo purposes, we'll just use URL.createObjectURL
    // In a real app, you'd upload these to your server/storage
    const newPhotos = [...photos];
    for (let i = 0; i < files.length; i++) {
      if (newPhotos.length < 10) {  // Max 10 photos
        newPhotos.push(URL.createObjectURL(files[i]));
      }
    }
    
    onChange(newPhotos);
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
    
    // Adjust featured index if needed
    if (index === featuredIndex) {
      setFeaturedIndex(0);  // Default to first photo
    } else if (index < featuredIndex) {
      setFeaturedIndex(featuredIndex - 1);  // Shift down
    }
  };

  const setFeatured = (index: number) => {
    setFeaturedIndex(index);
  };

  // Drag and drop functionality
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Remove from original position
    newPhotos.splice(draggedIndex, 1);
    // Add at new position
    newPhotos.splice(index, 0, draggedPhoto);
    
    onChange(newPhotos);
    
    // Update featured index if it was moved
    if (featuredIndex === draggedIndex) {
      setFeaturedIndex(index);
    } else if (featuredIndex > draggedIndex && featuredIndex <= index) {
      setFeaturedIndex(featuredIndex - 1);
    } else if (featuredIndex < draggedIndex && featuredIndex >= index) {
      setFeaturedIndex(featuredIndex + 1);
    }
    
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fotoğraflar</h2>
      <p className="text-sm text-gray-500">
        Tur için en fazla 10 fotoğraf ekleyebilirsiniz. İlk fotoğraf ana görsel olarak kullanılacaktır.
        Fotoğrafları sürükleyerek sıralayabilir veya yıldız işaretine tıklayarak öne çıkarabilirsiniz.
      </p>

      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#15847c] transition-colors">
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Fotoğrafları Buraya Sürükleyin</h3>
        <p className="text-gray-500 mb-4 text-center">
          JPG veya PNG formatında, en fazla 10 adet fotoğraf. Her dosya maksimum 5MB olabilir.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={photos.length >= 10}
          />
          <label htmlFor="photo-upload">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={photos.length >= 10}
            >
              Dosya Seç
            </Button>
          </label>
        </div>
      </div>

      {photos.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Yüklenen Fotoğraflar ({photos.length}/10)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <Card
                key={index}
                className={`relative group overflow-hidden ${
                  index === featuredIndex ? 'ring-2 ring-[#15847c]' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
              >
                <div className="aspect-square relative">
                  <img
                    src={photo}
                    alt={`Tour photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`bg-white/80 hover:bg-white ${
                          index === featuredIndex ? 'text-yellow-500' : 'text-gray-500'
                        }`}
                        onClick={() => setFeatured(index)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="bg-white/80 hover:bg-white text-gray-500"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index === featuredIndex && (
                    <div className="absolute bottom-2 left-2 bg-[#15847c] text-white px-2 py-1 text-xs rounded">
                      Ana Fotoğraf
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPhotosTab;
