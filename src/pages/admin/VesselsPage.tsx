import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import VesselsList from "@/components/admin/vessels/VesselsList";
import BoatServicesManager from "@/components/boats/BoatServicesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ship,
  Plus,
  FileText,
  Shield,
  Utensils,
  MapPin,
    Image,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { boatService } from "@/services/boatService";
import {
  BoatDTO,
  CreateVesselDTO,
  UpdateVesselDTO,
  BoatImageDTO,
} from "@/types/boat.types";
import {
  compressImage,
  validateImageFile,
  isValidImageUrl,
  getDefaultImageUrl,
} from "@/lib/imageUtils";
import { useAuth } from "@/contexts/AuthContext";
import MapPicker from "@/components/common/MapPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Form data interface
interface VesselFormData {
  // Temel bilgiler
  type: string;
  brandModel: string;
  name: string;
  buildYear: string;
  lastMaintenanceYear: string;
  toiletCount: string;
  fullCapacity: string;
  diningCapacity: string;
  length: string;
  flag: string;
  material: string;
  description: string;

  // Fiyatlandırma
  dailyPrice: string;
  hourlyPrice: string;

  // Lokasyon
  location: string;
  latitude?: number;
  longitude?: number;
  departurePoint: string;
  returnPoint: string;

  // Şartlar
  smokingRule: string;
  petPolicy: string;
  alcoholPolicy: string;
  musicPolicy: string;
  additionalRules: string;

  // Servisler
  mealService: string;
  djService: string;
  waterSports: string;
  otherServices: string;

  // Açıklamalar
  shortDescription: string;
  detailedDescription: string;

  // Organizasyonlar
  organizationTypes: string[];
  organizationDetails: string;

  // Dosyalar
  images: File[];
  existingImages: BoatImageDTO[]; // Mevcut fotoğraflar
  imageIdsToRemove: number[]; // Silinecek fotoğraf ID'leri
  features: string[];

  // Boat Services
  boatServices: Array<{
    name: string;
    description: string;
    price: number;
    serviceType: string;
    quantity: number;
  }>;
}

const VesselsPage = () => {
  const { user, isAuthenticated, isBoatOwner, isAdmin } = useAuth(); // Auth context'i kullan
  const [activeTab, setActiveTab] = useState("list");
  const [editingVesselId, setEditingVesselId] = useState<number | null>(null);
  const [formTab, setFormTab] = useState("details");
    const [newFeature, setNewFeature] = useState("");

  // Backend state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vessels, setVessels] = useState<BoatDTO[]>([]);
  const [currentVessel, setCurrentVessel] = useState<BoatDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<VesselFormData>({
    type: "",
    brandModel: "",
    name: "",
    buildYear: "",
    lastMaintenanceYear: "",
    toiletCount: "",
    fullCapacity: "",
    diningCapacity: "",
    length: "",
    flag: "",
    material: "",
    description: "",
    dailyPrice: "",
    hourlyPrice: "",
    location: "",
    latitude: undefined,
    longitude: undefined,
    departurePoint: "",
    returnPoint: "",
    smokingRule: "",
    petPolicy: "",
    alcoholPolicy: "",
    musicPolicy: "",
    additionalRules: "",
    mealService: "",
    djService: "",
    waterSports: "",
    otherServices: "",
    shortDescription: "",
    detailedDescription: "",
    organizationTypes: [],
    organizationDetails: "",
    images: [],
    existingImages: [],
    imageIdsToRemove: [],
    features: [],
    boatServices: [],
  });

  // Harita modalı ve geolocation
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Konum Kullanılamıyor", description: "Tarayıcınız konum servisini desteklemiyor.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        toast({ title: "Konum Seçildi", description: "Mevcut konumunuz haritaya işlendi." });
      },
      () => {
        toast({ title: "Konum İzni Gerekli", description: "Konumunuzu paylaşmayı reddettiniz.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Component mount'da vessels'ları yükle
  useEffect(() => {
    fetchVessels();
  }, []);

  // Editing vessel değiştiğinde form'u doldur
  useEffect(() => {
    if (editingVesselId && currentVessel) {
      populateFormWithVessel(currentVessel);
    } else {
      resetForm();
    }
  }, [editingVesselId, currentVessel]);

  // API Calls
  const fetchVessels = async () => {
    // AuthContext'ten user ve authentication durumunu kontrol et
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

    // Kullanıcının BOAT_OWNER veya ADMIN rolü olup olmadığını kontrol et
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

      console.log("Fetching vessels for user ID:", user.id);
      const ownerId = user.id; // Giriş yapmış kullanıcının ID'sini kullan
      const data = await boatService.getVesselsByOwner(ownerId);

      console.log("Vessels fetched successfully:", data.length);
      setVessels(data);
    } catch (err) {
      console.error("Vessels yükleme hatası:", err);

      // Daha detaylı error handling
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
  };

  const fetchVesselById = async (id: number) => {
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
  };

  // Form helpers
  const populateFormWithVessel = (vessel: BoatDTO) => {
    setFormData({
      type: vessel.type || "",
      brandModel: vessel.brandModel || "",
      name: vessel.name || "",
      buildYear: vessel.buildYear?.toString() || "",
      lastMaintenanceYear: vessel.year?.toString() || "",
      toiletCount: "",
      fullCapacity: vessel.capacity?.toString() || "",
      diningCapacity: "",
      length: vessel.length?.toString() || "",
      flag: "",
      material: "",
      description: vessel.description || "",
      dailyPrice: vessel.dailyPrice?.toString() || "",
      hourlyPrice: vessel.hourlyPrice?.toString() || "",
      location: vessel.location || "",
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      departurePoint: "",
      returnPoint: "",
      smokingRule: "",
      petPolicy: "",
      alcoholPolicy: "",
      musicPolicy: "",
      additionalRules: "",
      mealService: "",
      djService: "",
      waterSports: "",
      otherServices: "",
      shortDescription: "",
      detailedDescription: "",
      organizationTypes: [],
      organizationDetails: "",
      images: [],
      existingImages: vessel.images || [], // Mevcut fotoğrafları yükle
      imageIdsToRemove: [],
      features: vessel.features?.map((f) => f.featureName) || [],
      boatServices: vessel.services?.map((s) => ({
        name: s.name,
        description: s.description,
        price: s.price,
        serviceType: s.serviceType,
        quantity: s.quantity
      })) || [],
    });
  };

  const resetForm = () => {
    setFormData({
      type: "",
      brandModel: "",
      name: "",
      buildYear: "",
      lastMaintenanceYear: "",
      toiletCount: "",
      fullCapacity: "",
      diningCapacity: "",
      length: "",
      flag: "",
      material: "",
      description: "",
      dailyPrice: "",
      hourlyPrice: "",
      location: "",
      departurePoint: "",
      returnPoint: "",
      smokingRule: "",
      petPolicy: "",
      alcoholPolicy: "",
      musicPolicy: "",
      additionalRules: "",
      mealService: "",
      djService: "",
      waterSports: "",
      otherServices: "",
      shortDescription: "",
      detailedDescription: "",
      organizationTypes: [],
      organizationDetails: "",
      images: [],
      existingImages: [],
      imageIdsToRemove: [],
      features: [],
      boatServices: [],
    });
  };

  // Form validation
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Tekne ismi zorunludur");
    if (!formData.type) errors.push("Tekne tipi zorunludur");
    if (!formData.fullCapacity || parseInt(formData.fullCapacity) <= 0)
      errors.push("Geçerli bir kapasite giriniz");
    if (!formData.location.trim()) errors.push("Lokasyon zorunludur");
    if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0)
      errors.push("Geçerli bir günlük fiyat giriniz");

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Form to DTO conversion
  const formDataToCreateDTO = async (
    data: VesselFormData
  ): Promise<CreateVesselDTO> => {
    // Fotoğrafları base64'e dönüştür
    const imagePromises = data.images.map(async (file, index) => {
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          // Data URL prefix'ini kaldır (data:image/jpeg;base64, -> sadece base64 verisi)
          const base64Data = base64String.split(",")[1];

          resolve({
            imageData: base64Data, // Sadece base64 verisi, prefix yok
            isPrimary: index === 0, // İlk fotoğraf primary
            displayOrder: index + 1,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    const imagesDTOs = await Promise.all(imagePromises);

    return {
      name: data.name.trim(),
      description: data.detailedDescription || data.shortDescription || "",
      model: data.brandModel,
      year: parseInt(data.buildYear) || new Date().getFullYear(),
      length: parseFloat(data.length) || 0,
      capacity: parseInt(data.fullCapacity) || 0,
      dailyPrice: parseFloat(data.dailyPrice) || 0,
      hourlyPrice: parseFloat(data.hourlyPrice) || 0,
      location: data.location.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      type: data.type,
      status: "INACTIVE", // Yeni tekneler inactive olarak başlar
      brandModel: data.brandModel,
      buildYear: parseInt(data.buildYear) || new Date().getFullYear(),
      captainIncluded: false, // Default false
      images: imagesDTOs, // Base64 formatında fotoğraflar (prefix'siz)
      features: data.features.map((name) => ({ featureName: name })),
      services: data.boatServices.map((service) => ({
        boatId: 0, // Will be set by backend after boat creation
        name: service.name,
        description: service.description,
        serviceType: service.serviceType as any, // ServiceType enum
        price: service.price,
        quantity: service.quantity,
      })),
    };
  };

  const formDataToUpdateDTO = (data: VesselFormData): UpdateVesselDTO => {
    return {
      id: editingVesselId!,
      name: data.name,
      description: data.description,
      model: data.brandModel,
      buildYear: parseInt(data.buildYear) || undefined,
      length: parseFloat(data.length) || undefined,
      capacity: parseInt(data.fullCapacity) || undefined,
      dailyPrice: parseFloat(data.dailyPrice) || undefined,
      hourlyPrice: parseFloat(data.hourlyPrice) || undefined,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      type: data.type,
      brandModel: data.brandModel,
      imageIdsToRemove: data.imageIdsToRemove, // Silinecek fotoğraf ID'leri
    };
  };

  const handleAddVessel = () => {
    setEditingVesselId(null);
    setCurrentVessel(null);
    setActiveTab("form");
    setFormTab("details");
    resetForm();
  };

  const handleEditVessel = (id: string) => {
    const vesselId = parseInt(id);
    setEditingVesselId(vesselId);
    setActiveTab("form");
    setFormTab("details");

    // Vessel detayını getir
    fetchVesselById(vesselId);
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setEditingVesselId(null);
    setCurrentVessel(null);
    resetForm();
  };

  // Mevcut fotoğrafı kaldırma
  const handleRemoveExistingImage = (imageId: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img.id !== imageId),
      imageIdsToRemove: [...prev.imageIdsToRemove, imageId],
    }));

    toast({
      title: "Fotoğraf Kaldırıldı",
      description: "Fotoğraf kaydedildiğinde silinecek olarak işaretlendi.",
    });
  };

  // Yeni fotoğrafı kaldırma
  const handleRemoveNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Optimize edilmiş resim yükleme fonksiyonu
  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    try {
      setLoading(true);

      const validFiles: File[] = [];
      const errors: string[] = [];

      // Dosya validasyonu
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file);

        if (validation.isValid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }

      if (errors.length > 0) {
        toast({
          title: "Dosya Hatası",
          description: errors.join(", "),
          variant: "destructive",
        });
      }

      if (validFiles.length === 0) return;

      // Resimleri compress et ve form'a ekle
      const compressedImages: File[] = [];

      for (const file of validFiles) {
        try {
          const compressedBase64 = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8,
            outputFormat: "image/jpeg",
          });

          // Base64'ü tekrar File objesine dönüştür (preview için)
          const byteCharacters = atob(compressedBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const compressedFile = new File([byteArray], file.name, {
            type: "image/jpeg",
          });

          compressedImages.push(compressedFile);
        } catch (error) {
          console.error(`${file.name} compress edilemedi:`, error);
          errors.push(`${file.name} işlenemedi`);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedImages],
      }));

      toast({
        title: "Başarılı",
        description: `${compressedImages.length} fotoğraf optimize edildi ve eklendi.`,
      });

      if (errors.length > 0) {
        toast({
          title: "Uyarı",
          description: `Bazı dosyalar işlenemedi: ${errors.join(", ")}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fotoğraf ekleme hatası:", error);
      toast({
        title: "Hata",
        description:
          "Fotoğraflar eklenemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Optimize edilmiş form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: "Form Hatası",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (editingVesselId && currentVessel) {
        // Update existing vessel - resim güncellemesi ayrı handle edilir
        const updateDTO = formDataToUpdateDTO(formData);
        await boatService.updateVessel(updateDTO);

        // Özellik farklılıklarını uygula
        try {
          const originalFeatures = currentVessel.features || [];
          const originalNames = new Set(originalFeatures.map((f) => f.featureName));
          const currentNames = new Set(formData.features);

          // Eklenecekler
          const featuresToAdd = formData.features.filter((name) => !originalNames.has(name));
          // Silinecekler
          const featuresToRemove = originalFeatures.filter((f) => !currentNames.has(f.featureName));

          for (const name of featuresToAdd) {
            try {
              await boatService.addBoatFeature(editingVesselId, name);
            } catch (e) {
              console.error(`Özellik eklenemedi: ${name}`, e);
            }
          }

          for (const feat of featuresToRemove) {
            try {
              await boatService.removeBoatFeature(editingVesselId, feat.id);
            } catch (e) {
              console.error(`Özellik silinemedi: ${feat.featureName}`, e);
            }
          }
        } catch (e) {
          console.error("Özellik güncelleme hatası:", e);
        }

        // Silinecek fotoğrafları sil
        if (formData.imageIdsToRemove.length > 0) {
          for (const imageId of formData.imageIdsToRemove) {
            try {
              await boatService.deleteBoatImage(editingVesselId, imageId);
            } catch (error) {
              console.error(`Fotoğraf ${imageId} silinemedi:`, error);
            }
          }
        }

        // Eğer yeni resimler eklendiyse, onları da yükle
        if (formData.images.length > 0) {
          await boatService.compressAndUploadImages(
            editingVesselId,
            createFileListFromFiles(formData.images)
          );
        }

        toast({
          title: "Başarılı",
          description: "Tekne bilgileri güncellendi.",
        });
      } else {
        // Create new vessel with optimized images
        if (formData.images.length > 0) {
          // Resimleri compress et
          const imagePromises = formData.images.map(async (file, index) => {
            const compressedBase64 = await compressImage(file, {
              maxWidth: 1200,
              maxHeight: 800,
              quality: 0.8,
              outputFormat: "image/jpeg",
            });

            return {
              imageData: compressedBase64,
              isPrimary: index === 0,
              displayOrder: index + 1,
            };
          });

          const imagesDTOs = await Promise.all(imagePromises);

          const createDTO: CreateVesselDTO = {
            ...(await formDataToCreateDTO(formData)),
            images: imagesDTOs,
          };

          // Optimize edilmiş yükleme metodunu kullan
          const newVessel = await boatService.createVesselWithOptimizedImages(
            createDTO
          );

          toast({
            title: "Başarılı",
            description: "Yeni tekne eklendi.",
          });
        } else {
          // Resim olmadan tekne oluştur
          const createDTO = await formDataToCreateDTO(formData);
          const newVessel = await boatService.createVessel(createDTO);

          toast({
            title: "Başarılı",
            description: "Yeni tekne eklendi.",
          });
        }
      }

      // Liste sayfasına dön ve verileri yenile
      await fetchVessels();
      handleBackToList();
    } catch (error) {
      console.error("Vessel kaydetme hatası:", error);
      toast({
        title: "Hata",
        description: "Tekne kaydedilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create FileList from File array
  const createFileListFromFiles = (files: File[]): FileList => {
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    return dt.files;
  };

  const handleDeleteVessel = async (id: string) => {
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

      // Liste güncelle
      await fetchVessels();

      // Eğer silinen tekne düzenleniyorsa liste sayfasına dön
      if (editingVesselId === vesselId) {
        handleBackToList();
      }
    } catch (error) {
      console.error("Vessel silme hatası:", error);
      toast({
        title: "Hata",
        description: "Tekne silinemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Form field handlers
  const handleInputChange =
    (field: keyof VesselFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSelectChange =
    (field: keyof VesselFormData) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleMultiSelectToggle = (
    field: keyof VesselFormData,
    value: string
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  return (
    <CaptainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="list" className="mt-0">
            <VesselsList
              onAddVessel={handleAddVessel}
              onEditVessel={handleEditVessel}
              onDeleteVessel={handleDeleteVessel}
              vessels={vessels}
              loading={loading}
              error={error}
              isEmpty={vessels.length === 0 && !loading}
            />
          </TabsContent>

          <TabsContent value="form" className="mt-0">
            <div className="space-y-8">
              {/* Başlık */}
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                      <Ship className="text-primary" size={24} />
                      {editingVesselId ? "Taşıt Düzenle" : "Yeni Taşıt Ekle"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      {editingVesselId
                        ? "Mevcut tekne/taşıt bilgilerinizi modern form ile güncelleyin."
                        : "Adım adım ilerleyerek yeni teknenizi ekleyin. Tüm sekmeler tek bir kayıtta saklanır."}
                    </p>
                  </div>
                  {loading && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Yükleniyor
                    </span>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <Tabs
                  defaultValue={formTab}
                  className="w-full"
                  onValueChange={setFormTab}
                >
                  {/* Sekmeler - adım deneyimi ve durum rozetleri */}
                  <div className="bg-white border-b border-gray-200">
                    <TabsList className="w-full justify-start bg-transparent border-0 rounded-none p-0 h-auto">
                      <div className="flex flex-wrap gap-2 p-4">
                        <TabsTrigger
                          value="details"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">1</span>
                          <FileText size={16} />
                          <span className="font-medium">Detaylar</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="terms"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">2</span>
                          <Shield size={16} />
                          <span className="font-medium">Şartlar</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="services"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">3</span>
                          <Utensils size={16} />
                          <span className="font-medium">Servisler</span>
                          {formData.boatServices.length > 0 && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{formData.boatServices.length}</span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="location"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">4</span>
                          <MapPin size={16} />
                          <span className="font-medium">Lokasyon</span>
                          {formData.latitude && formData.longitude && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">Seçildi</span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="photos"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">5</span>
                          <Image size={16} />
                          <span className="font-medium">Fotoğraflar</span>
                          {(formData.existingImages.length + formData.images.length) > 0 && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{formData.existingImages.length + formData.images.length}</span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="features"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">6</span>
                          <Shield size={16} />
                          <span className="font-medium">Özellikler</span>
                          {formData.features.length > 0 && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{formData.features.length}</span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="descriptions"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white transition border border-gray-200 data-[state=active]:border-primary"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">7</span>
                          <FileText size={16} />
                          <span className="font-medium">Açıklamalar</span>
                        </TabsTrigger>
                      </div>
                    </TabsList>
                  </div>

                  <TabsContent value="details" className="p-8">
                    <div className="space-y-8">
                      {/* Section Header */}
                      <div className="border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                          <FileText className="mr-3 text-primary" size={24} />
                          Temel Bilgiler
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Teknenizin temel özelliklerini ve detaylarını girin
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label
                            className="block text-sm font-semibold text-gray-700 mb-2"
                            htmlFor="vesselType"
                          >
                            Taşıt Tipi *
                          </label>
                          <Select
                            value={formData.type}
                            onValueChange={handleSelectChange("type")}
                          >
                            <SelectTrigger
                              id="vesselType"
                              className="h-12 border-gray-300 focus:border-primary focus:ring-primary"
                            >
                              <SelectValue placeholder="Tekne tipini seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SAILBOAT">Yelkenli</SelectItem>
                              <SelectItem value="MOTORBOAT">
                                Motor Bot
                              </SelectItem>
                              <SelectItem value="YACHT">Yat</SelectItem>
                              <SelectItem value="SPEEDBOAT">
                                Hız Teknesi
                              </SelectItem>
                              <SelectItem value="CATAMARAN">
                                Katamaran
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Teknenizin kategorisini belirleyin
                          </p>
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="brandModel"
                          >
                            Marka / Model
                          </label>
                          <Input
                            id="brandModel"
                            placeholder="Örn: Azimut 55"
                            value={formData.brandModel}
                            onChange={handleInputChange("brandModel")}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="block text-sm font-semibold text-gray-700 mb-2"
                            htmlFor="vesselName"
                          >
                            Tekne İsmi *
                          </label>
                          <Input
                            id="vesselName"
                            placeholder="Tekne ismi giriniz"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            required
                            className="h-12 border-gray-300 focus:border-primary focus:ring-primary"
                          />
                          <p className="text-xs text-gray-500">
                            Müşterilerinizin göreceği tekne ismi
                          </p>
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="buildYear"
                          >
                            Yapım Yılı
                          </label>
                          <Input
                            id="buildYear"
                            type="number"
                            placeholder="Örn: 2015"
                            value={formData.buildYear}
                            onChange={handleInputChange("buildYear")}
                            min="1970"
                            max={new Date().getFullYear()}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="fullCapacity"
                          >
                            Kapasite *
                          </label>
                          <Input
                            id="fullCapacity"
                            type="number"
                            placeholder="Örn: 12"
                            value={formData.fullCapacity}
                            onChange={handleInputChange("fullCapacity")}
                            min="1"
                            required
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="length"
                          >
                            Uzunluk (metre)
                          </label>
                          <Input
                            id="length"
                            type="number"
                            step="0.1"
                            placeholder="Örn: 15.5"
                            value={formData.length}
                            onChange={handleInputChange("length")}
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="block text-sm font-semibold text-gray-700 mb-2"
                            htmlFor="dailyPrice"
                          >
                            Günlük Fiyat (₺) *
                          </label>
                          <Input
                            id="dailyPrice"
                            type="number"
                            step="0.01"
                            placeholder="Örn: 2500"
                            value={formData.dailyPrice}
                            onChange={handleInputChange("dailyPrice")}
                            min="0"
                            required
                            className="h-12 border-gray-300 focus:border-primary focus:ring-primary"
                          />
                          <p className="text-xs text-gray-500">
                            Günlük kiralama ücreti
                          </p>
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="hourlyPrice"
                          >
                            Saatlik Fiyat (₺)
                          </label>
                          <Input
                            id="hourlyPrice"
                            type="number"
                            step="0.01"
                            placeholder="Örn: 300"
                            value={formData.hourlyPrice}
                            onChange={handleInputChange("hourlyPrice")}
                            min="0"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="location"
                          >
                            Lokasyon *
                          </label>
                          <Select
                            value={formData.location}
                            onValueChange={handleSelectChange("location")}
                          >
                            <SelectTrigger id="location">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="İstanbul">İstanbul</SelectItem>
                              <SelectItem value="Bodrum">Bodrum</SelectItem>
                              <SelectItem value="Fethiye">Fethiye</SelectItem>
                              <SelectItem value="Marmaris">Marmaris</SelectItem>
                              <SelectItem value="Çeşme">Çeşme</SelectItem>
                              <SelectItem value="Antalya">Antalya</SelectItem>
                              <SelectItem value="Göcek">Göcek</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pt-4 text-xs text-gray-500">* işaretli alanlar zorunludur</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="terms" className="p-6">
                    <div className="space-y-6">
                    
                      <h2 className="text-xl font-medium mb-4">
                        Şartlar ve Koşullar
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sigara İçme Kuralı
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">
                                İzin Verilir
                              </SelectItem>
                              <SelectItem value="restricted">
                                Belirli Alanlarda
                              </SelectItem>
                              <SelectItem value="prohibited">
                                Yasaktır
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Evcil Hayvan
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">
                                İzin Verilir
                              </SelectItem>
                              <SelectItem value="prohibited">
                                İzin Verilmez
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Alkol
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">
                                İzin Verilir
                              </SelectItem>
                              <SelectItem value="prohibited">
                                İzin Verilmez
                              </SelectItem>
                              <SelectItem value="byo">Kendi Getir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Müzik
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">
                                İzin Verilir
                              </SelectItem>
                              <SelectItem value="restricted">
                                Belirli Saatlerde
                              </SelectItem>
                              <SelectItem value="prohibited">
                                İzin Verilmez
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ek Kurallar
                        </label>
                        <Textarea placeholder="Müşterilerinizin bilmesi gereken diğer kuralları veya şartları buraya yazabilirsiniz..." />
                      </div>

                      
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="p-6">
                    
                    <h2 className="text-xl font-medium mb-4">Ek Hizmetler</h2>
                    
                    {/* Boat Services Management Component */}
                    <BoatServicesManager 
                      services={formData.boatServices}
                      onServicesChange={(services) => setFormData(prev => ({...prev, boatServices: services}))}
                    />
                    
                  </TabsContent>

                  <TabsContent value="location" className="p-6">
                    
                    <h2 className="text-xl font-medium mb-4">Lokasyon</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Kalkış Noktası
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bodrum">
                                Bodrum Marina
                              </SelectItem>
                              <SelectItem value="fethiye">
                                Fethiye Limanı
                              </SelectItem>
                              <SelectItem value="marmaris">
                                Marmaris Marina
                              </SelectItem>
                              <SelectItem value="gocek">
                                Göcek Marina
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Dönüş Noktası
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="same">
                                Kalkış ile Aynı
                              </SelectItem>
                              <SelectItem value="bodrum">
                                Bodrum Marina
                              </SelectItem>
                              <SelectItem value="fethiye">
                                Fethiye Limanı
                              </SelectItem>
                              <SelectItem value="marmaris">
                                Marmaris Marina
                              </SelectItem>
                              <SelectItem value="gocek">
                                Göcek Marina
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <label className="block text-sm font-medium">Harita Üzerinden Konum Seçin</label>
                            <p className="text-xs text-gray-500">Haritaya tıklayın veya işaretçiyi sürükleyin.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={useCurrentLocation} className="h-9">
                              Mevcut Konumu Kullan
                            </Button>
                            <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                              <DialogTrigger asChild>
                                <Button type="button" variant="secondary" className="h-9">Haritayı Büyüt</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-7xl">
                                <DialogHeader>
                                  <DialogTitle>Harita - Konum Seç</DialogTitle>
                                </DialogHeader>
                                <div className="mt-2">
                                  <MapPicker
                                    value={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
                                    onChange={(coords) => {
                                      setFormData((prev) => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
                                    }}
                                    height={600}
                                    zoom={12}
                                  />
                                  <div className="mt-2 text-sm text-gray-600">Seçilen Koordinatlar: {formData.latitude?.toFixed(5) ?? "-"}, {formData.longitude?.toFixed(5) ?? "-"}</div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        <div className="border rounded-xl p-3 bg-white w-full">
                          <MapPicker
                            value={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
                            onChange={(coords) => {
                              setFormData((prev) => ({
                                ...prev,
                                latitude: coords.lat,
                                longitude: coords.lng,
                              }));
                            }}
                            height={420}
                            zoom={12}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Enlem (Latitude)</label>
                            <Input
                              type="number"
                              step="0.00001"
                              placeholder="41.0082"
                              value={formData.latitude ?? ""}
                              onChange={(e) => {
                                const v = e.target.value ? parseFloat(e.target.value) : undefined;
                                setFormData((prev) => ({ ...prev, latitude: isNaN(v as number) ? undefined : (v as number) }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Boylam (Longitude)</label>
                            <Input
                              type="number"
                              step="0.00001"
                              placeholder="28.9784"
                              value={formData.longitude ?? ""}
                              onChange={(e) => {
                                const v = e.target.value ? parseFloat(e.target.value) : undefined;
                                setFormData((prev) => ({ ...prev, longitude: isNaN(v as number) ? undefined : (v as number) }));
                              }}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button type="button" variant="outline" className="w-full" onClick={() => setFormData((prev) => ({ ...prev, latitude: undefined, longitude: undefined }))}>
                              Koordinatları Temizle
                            </Button>
                          </div>
                        </div>
                      </div>

                      
                    </div>
                  </TabsContent>

                  <TabsContent value="photos" className="p-6">
                    
                    <h2 className="text-xl font-medium mb-4">Fotoğraflar</h2>
                    <div className="space-y-6">
                      {/* Mevcut Fotoğraflar - Düzenleme modunda göster */}
                      {editingVesselId &&
                        formData.existingImages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Mevcut Fotoğraflar (
                              {formData.existingImages.length})
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {formData.existingImages.map((image, index) => (
                                <div key={image.id} className="relative group">
                                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={image.imageUrl}
                                      alt={`Mevcut fotoğraf ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveExistingImage(image.id)
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                  {image.isPrimary && (
                                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                      Ana
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    Mevcut #{image.displayOrder}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.length) { handleImageUpload(e.dataTransfer.files); } }}>
                        <Image className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          Fotoğrafları Sürükle & Bırak
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          veya fotoğraf seçmek için tıklayın
                        </p>

                        {/* Hidden file input */}
                        <input
                          type="file"
                          id="image-upload"
                          multiple
                          accept="image/png,image/jpg,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleImageUpload(e.target.files);
                            }
                          }}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          Dosyaları Seç
                        </Button>

                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP formatları desteklenir (maks. 5MB)</p>
                      </div>

                      {/* Yeni Eklenen Fotoğraflar */}
                      {formData.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Yeni Eklenen Fotoğraflar ({formData.images.length})
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {formData.images.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Yeni fotoğraf ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNewImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  Yeni
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {file.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      
                    </div>
                  </TabsContent>

                  <TabsContent value="descriptions" className="p-6">
                    
                    <h2 className="text-xl font-medium mb-4">Açıklamalar</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Kısa Açıklama
                        </label>
                        <Textarea
                          placeholder="Teknenizin kısa bir özetini yazın (maksimum 200 karakter)"
                          maxLength={200}
                          value={formData.shortDescription}
                          onChange={handleInputChange("shortDescription")}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Bu açıklama tekne listelerinde ve arama sonuçlarında
                          gösterilecektir.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Detaylı Açıklama
                        </label>
                        <Textarea
                          placeholder="Teknenizin detaylı tanıtımını yapın..."
                          className="min-h-[200px]"
                          value={formData.detailedDescription}
                          onChange={handleInputChange("detailedDescription")}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Teknenizin özellikleri, avantajları ve diğer
                          özelliklerini detaylandırın.
                        </p>
                      </div>

                      
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="p-6">
                    
                    <h2 className="text-xl font-medium mb-4">Özellikler</h2>

                    {/* Seçili Özellikler */}
                    {formData.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Seçili Özellikler</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.features.map((f) => (
                            <span key={f} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                              {f}
                              <button
                                type="button"
                                className="ml-1 text-primary hover:text-primary/80"
                                onClick={() => handleMultiSelectToggle("features", f)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Önerilen Özellikler */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Önerilen Özellikler</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "GPS Navigation",
                          "Air Conditioning",
                          "Sound System",
                          "Wi-Fi",
                          "Safety Equipment",
                          "Fishing Gear",
                          "Sunshade",
                          "Kitchenette",
                        ].map((feature) => {
                          const selected = formData.features.includes(feature);
                          return (
                            <button
                              type="button"
                              key={feature}
                              onClick={() => handleMultiSelectToggle("features", feature)}
                              className={`px-3 py-1 rounded-full border text-sm transition ${selected ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                            >
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Özel Özellik Ekle */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Özel Özellik Ekle</label>
                        <Input
                          placeholder="Örn: Underwater Lights"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const value = newFeature.trim();
                              if (value && !formData.features.includes(value)) {
                                setFormData((prev) => ({ ...prev, features: [...prev.features, value] }));
                                setNewFeature("");
                              }
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          onClick={() => {
                            const value = newFeature.trim();
                            if (value && !formData.features.includes(value)) {
                              setFormData((prev) => ({ ...prev, features: [...prev.features, value] }));
                              setNewFeature("");
                            }
                          }}
                          className="w-full"
                          disabled={loading}
                        >
                          Özellik Ekle
                        </Button>
                      </div>
                    </div>

                    
                  </TabsContent>
                </Tabs>
                {/* Yapışkan alt aksiyon çubuğu */}
                <div className="sticky bottom-0 z-20 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-xs text-gray-600 hidden sm:block">Tüm sekmelerdeki bilgiler tek seferde kaydedilir.</div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToList}
                      disabled={loading}
                    >
                      Vazgeç
                    </Button>
                    <Button type="submit" className="px-6" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Kaydediliyor...
                        </span>
                      ) : editingVesselId ? (
                        "Güncellemeyi Kaydet"
                      ) : (
                        "Kaydet"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CaptainLayout>
  );
};

export default VesselsPage;
