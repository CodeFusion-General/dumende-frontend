import { useState, useCallback } from "react";
import { BoatDTO } from "@/types/boat.types";
import { boatService } from "@/services/boatService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

export interface UseVesselsReturn {
  // State
  vessels: BoatDTO[];
  currentVessel: BoatDTO | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchVessels: () => Promise<void>;
  fetchVesselById: (id: number) => Promise<void>;
  deleteVessel: (id: string) => Promise<void>;
  setCurrentVessel: (vessel: BoatDTO | null) => void;
  setLoading: (loading: boolean) => void;
}

export function useVessels(): UseVesselsReturn {
  const { user, isAuthenticated, isBoatOwner, isAdmin } = useAuth();
  const [vessels, setVessels] = useState<BoatDTO[]>([]);
  const [currentVessel, setCurrentVessel] = useState<BoatDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVessels = useCallback(async () => {
    if (!user?.id) {
      console.error("User ID bulunamadı:", { user, isAuthenticated });
      setError("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.");
      toast({
        title: "Kimlik Doğrulama Hatası",
        description:
          "Oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın.",
        variant: "destructive",
      });
      return;
    }

    if (!isBoatOwner() && !isAdmin()) {
      setError("Bu sayfaya erişim yetkiniz bulunmamaktadır.");
      toast({
        title: "Yetki Hatası",
        description:
          "Tekneler sayfasına erişim için kaptan yetkisi gereklidir.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ownerId = user.id;
      const data = await boatService.getVesselsByOwner(ownerId);

      setVessels(data);
    } catch (err) {
      console.error("Vessels yükleme hatası:", err);

      if (err instanceof Error) {
        if (err.message.includes("401") || err.message.includes("token")) {
          setError("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          toast({
            title: "Oturum Süresi Doldu",
            description:
              "Güvenlik için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.",
            variant: "destructive",
          });
        } else if (err.message.includes("403")) {
          setError("Bu işlem için yetkiniz bulunmamaktadır.");
          toast({
            title: "Yetki Hatası",
            description:
              "Bu işlemi gerçekleştirmek için gerekli izniniz bulunmamaktadır.",
            variant: "destructive",
          });
        } else {
          setError(`Tekneler yüklenirken hata: ${err.message}`);
          toast({
            title: "Yükleme Hatası",
            description:
              "Tekneler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        }
      } else {
        setError("Tekneler yüklenirken bilinmeyen bir hata oluştu.");
        toast({
          title: "Hata",
          description: "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, isBoatOwner, isAdmin]);

  const fetchVesselById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const vessel = await boatService.getBoatById(id);
      setCurrentVessel(vessel);
    } catch (err) {
      console.error("Vessel detay yükleme hatası:", err);
      toast({
        title: "Hata",
        description: "Tekne bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVessel = useCallback(async (id: string) => {
    const vesselId = parseInt(id);

    if (!confirm("Bu tekneyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await boatService.deleteVessel(vesselId);

      toast({
        title: "Başarılı",
        description: "Tekne silindi.",
      });

      // Refresh vessels list
      setVessels((prev) => prev.filter((v) => v.id !== vesselId));
    } catch (err) {
      console.error("Vessel silme hatası:", err);
      toast({
        title: "Hata",
        description: "Tekne silinemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vessels,
    currentVessel,
    loading,
    error,
    fetchVessels,
    fetchVesselById,
    deleteVessel,
    setCurrentVessel,
    setLoading,
  };
}
