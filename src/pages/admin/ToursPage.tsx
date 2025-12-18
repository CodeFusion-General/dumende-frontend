import React, { useState, useEffect, useMemo, useCallback } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ToursList from "@/components/admin/tours/ToursList";
import TourFilters from "@/components/admin/tours/TourFilters";
import EmptyTours from "@/components/admin/tours/EmptyTours";
import { toast } from "@/components/ui/use-toast";
import { tourService } from "@/services/tourService";
import { TourDTO } from "@/types/tour.types";

/* Backend hazır olduğunda kullanılacak interface:
interface Tour {
  id: string;
  title: string;
  duration: string;
  price: number;
  location: string;
  status: 'active' | 'draft' | 'inactive';
  image: string;
  boat: string;
}
*/

const ToursPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Backend state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tours, setTours] = useState<TourDTO[]>([]);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: guideId'yi auth context'ten al
      const currentGuideId = 1; // Geçici olarak sabit değer
      const toursData = await tourService.getToursByGuideId(currentGuideId);
      setTours(toursData);

    } catch (error) {
      console.error("Turlar yüklenirken hata:", error);
      setError("Turlar yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description:
          "Turlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTour = useCallback(() => {
    navigate("/captain/tours/new");
  }, [navigate]);

  // Filter tours based on search query and filters - memoized to prevent recalculation on every render
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch =
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        locationFilter === "all" || tour.location.includes(locationFilter);

      // Duration hesaplama: ilk tur tarihinin durationText'inden saat/gün çıkarımı
      const firstDate = tour.tourDates?.[0];
      const duration = firstDate
        ? (() => {
            if (firstDate.durationMinutes && firstDate.durationMinutes > 0) {
              return Math.round(firstDate.durationMinutes / 60);
            }
            const text = (firstDate.durationText || "").toLowerCase();
            const num = parseInt(text.replace(/\D/g, "")) || 0;
            if (text.includes("gün")) return num * 24; // saat cinsinden
            if (text.includes("saat")) return num;
            return 0;
          })()
        : 0;

      const matchesDuration =
        durationFilter === "all" ||
        (durationFilter === "1-2" && duration <= 2) ||
        (durationFilter === "3-5" && duration >= 3 && duration <= 5) ||
        (durationFilter === "6+" && duration >= 6);

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "0-1000" && Number(tour.price) <= 1000) ||
        (priceFilter === "1000-3000" &&
          Number(tour.price) > 1000 &&
          Number(tour.price) <= 3000) ||
        (priceFilter === "3000+" && Number(tour.price) > 3000);

      return matchesSearch && matchesLocation && matchesDuration && matchesPrice;
    });
  }, [tours, searchQuery, locationFilter, durationFilter, priceFilter]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await tourService.deleteTour(Number(id));
      setTours((prev) => prev.filter((tour) => tour.id !== Number(id)));
      toast({
        title: "Başarılı",
        description: "Tur silindi.",
      });
    } catch (error) {
      console.error("Tur silme hatası:", error);
      toast({
        title: "Hata",
        description: "Tur silinemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      await tourService.updateTourStatus(Number(id), status);
      await fetchTours(); // Turları yeniden yükle
      toast({
        title: "Başarılı",
        description: "Tur durumu güncellendi.",
      });
    } catch (error) {
      console.error("Tur durumu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Tur durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <CaptainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Turlarım</h1>
            <Button
              onClick={handleAddTour}
              className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
            >
              <Plus size={16} className="mr-1" /> Tur Ekle
            </Button>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg text-gray-600">Turlar yükleniyor...</p>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CaptainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Turlarım</h1>
            <Button
              onClick={handleAddTour}
              className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
            >
              <Plus size={16} className="mr-1" /> Tur Ekle
            </Button>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg text-red-600">{error}</p>
            <Button
              onClick={fetchTours}
              className="mt-4 bg-[#15847c] hover:bg-[#0e5c56] text-white"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Turlarım</h1>
          <Button
            onClick={handleAddTour}
            className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
          >
            <Plus size={16} className="mr-1" /> Tur Ekle
          </Button>
        </div>

        <TourFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          durationFilter={durationFilter}
          setDurationFilter={setDurationFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
        />

        {tours.length === 0 ? (
          <EmptyTours onAddClick={handleAddTour} />
        ) : filteredTours.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg text-gray-600">
              Arama kriteriyle eşleşen tur bulunamadı.
            </p>
            <p className="text-gray-500 mt-2">
              Lütfen filtreleri değiştirin veya yeni tur ekleyin.
            </p>
          </div>
        ) : (
          <ToursList
            tours={filteredTours}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </CaptainLayout>
  );
};

export default ToursPage;
