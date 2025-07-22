import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Users, Calendar, Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { tourService } from "@/services/tourService";
import { TourDTO } from "@/types/tour.types";

const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<TourDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Aktif</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500">Taslak</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Yayında Değil</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">İptal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15847c] mx-auto mb-4"></div>
          <p className="text-gray-600">Tur detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Tur bulunamadı"}</p>
          <Button onClick={() => navigate("/captain/tours")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const tourImage =
    tour.tourImages && tour.tourImages.length > 0
      ? tour.tourImages[0].imageUrl
      : "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/captain/tours")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={tourImage}
          alt={tour.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="max-w-6xl mx-auto px-4 py-8 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {tour.name}
                </h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{tour.capacity} kişi</span>
                  </div>
                  {tour.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{tour.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white mb-1">
                  {Number(tour.price).toLocaleString("tr-TR")} ₺
                </div>
                {getStatusBadge(tour.status)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Tur Hakkında</h2>
                <p className="text-gray-700 leading-relaxed">
                  {tour.description}
                </p>
              </CardContent>
            </Card>

            {/* Tour Images */}
            {tour.tourImages && tour.tourImages.length > 1 && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Fotoğraflar</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tour.tourImages.slice(1).map((image, index) => (
                      <div
                        key={image.id}
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.imageUrl}
                          alt={`${tour.name} - ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Tur Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tekne ID:</span>
                    <span className="font-medium">{tour.boatId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kapasite:</span>
                    <span className="font-medium">{tour.capacity} kişi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sezon Başlangıcı:</span>
                    <span className="font-medium">
                      {new Date(tour.seasonStartDate).toLocaleDateString(
                        "tr-TR"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sezon Bitişi:</span>
                    <span className="font-medium">
                      {new Date(tour.seasonEndDate).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className="font-medium">
                      {getStatusBadge(tour.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
