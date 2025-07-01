import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import VesselsList from "@/components/admin/vessels/VesselsList";
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
  Calendar,
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
  getImageUrl,
} from "@/lib/imageUtils";

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
}

const VesselsPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [editingVesselId, setEditingVesselId] = useState<number | null>(null);
  const [formTab, setFormTab] = useState("details");

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
  });

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
    try {
      setLoading(true);
      setError(null);

      // Mock owner ID - gerçek uygulamada auth'dan gelecek
      const ownerId = 1;
      const data = await boatService.getVesselsByOwner(ownerId);
      setVessels(data);

    } catch (err) {
      console.error("Vessels yükleme hatası:", err);
      setError("Tekneler yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description:
          "Tekneler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
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
      ownerId: 1, // Mock - gerçek uygulamada auth'dan gelecek
      name: data.name.trim(),
      description: data.detailedDescription || data.shortDescription || "",
      model: data.brandModel,
      year: parseInt(data.buildYear) || new Date().getFullYear(),
      length: parseFloat(data.length) || 0,
      capacity: parseInt(data.fullCapacity) || 0,
      dailyPrice: parseFloat(data.dailyPrice) || 0,
      hourlyPrice: parseFloat(data.hourlyPrice) || 0,
      location: data.location.trim(),
      type: data.type,
      status: "INACTIVE", // Yeni tekneler inactive olarak başlar
      brandModel: data.brandModel,
      buildYear: parseInt(data.buildYear) || new Date().getFullYear(),
      pricePerHour: parseFloat(data.hourlyPrice) || 0,
      pricePerDay: parseFloat(data.dailyPrice) || 0,
      captainIncluded: false, // Default false
      images: imagesDTOs, // Base64 formatında fotoğraflar (prefix'siz)
      features: data.features.map((name) => ({ featureName: name })),
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
      <div className="space-y-6">
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center">
                  <Ship className="mr-2" />
                  {editingVesselId ? "Taşıt Düzenle" : "Yeni Taşıt Ekle"}
                  {loading && (
                    <span className="ml-2 text-sm text-gray-500">
                      Yükleniyor...
                    </span>
                  )}
                </h1>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-lg shadow"
              >
                <Tabs
                  defaultValue={formTab}
                  className="w-full"
                  onValueChange={setFormTab}
                >
                  <TabsList className="w-full justify-start border-b rounded-none">
                    <TabsTrigger
                      value="details"
                      className="flex items-center gap-1"
                    >
                      <FileText size={16} />
                      Taşıt Detayları
                    </TabsTrigger>
                    <TabsTrigger
                      value="terms"
                      className="flex items-center gap-1"
                    >
                      <Shield size={16} />
                      Şartlar
                    </TabsTrigger>
                    <TabsTrigger
                      value="services"
                      className="flex items-center gap-1"
                    >
                      <Utensils size={16} />
                      Servisler
                    </TabsTrigger>
                    <TabsTrigger
                      value="location"
                      className="flex items-center gap-1"
                    >
                      <MapPin size={16} />
                      Lokasyon
                    </TabsTrigger>
                    <TabsTrigger
                      value="photos"
                      className="flex items-center gap-1"
                    >
                      <Image size={16} />
                      Fotoğraflar
                    </TabsTrigger>
                    <TabsTrigger
                      value="descriptions"
                      className="flex items-center gap-1"
                    >
                      <FileText size={16} />
                      Açıklamalar
                    </TabsTrigger>
                    <TabsTrigger
                      value="organizations"
                      className="flex items-center gap-1"
                    >
                      <Calendar size={16} />
                      Organizasyonlar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="vesselType"
                          >
                            Taşıt Tipi *
                          </label>
                          <Select
                            value={formData.type}
                            onValueChange={handleSelectChange("type")}
                          >
                            <SelectTrigger id="vesselType">
                              <SelectValue placeholder="Seçiniz" />
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

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
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
                          />
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

                        <div>
                          <label
                            className="block text-sm font-medium mb-1"
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
                          />
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

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                        >
                          {loading
                            ? "Kaydediliyor..."
                            : editingVesselId
                            ? "Güncelle"
                            : "Kaydet"}
                        </Button>
                      </div>
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

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="button"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                          onClick={() => {
                            toast({
                              title: "Bilgi",
                              description:
                                "Şartlar kaydedildi. Ana kaydetme için 'Taşıt Detayları' sekmesine gidin.",
                            });
                          }}
                        >
                          Şartları Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="p-6">
                    <h2 className="text-xl font-medium mb-4">Servisler</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Yemek Servisi
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="included">Dahil</SelectItem>
                              <SelectItem value="optional">
                                Opsiyonel
                              </SelectItem>
                              <SelectItem value="not-available">
                                Mevcut Değil
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            DJ / Müzik
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="included">Dahil</SelectItem>
                              <SelectItem value="optional">
                                Opsiyonel
                              </SelectItem>
                              <SelectItem value="not-available">
                                Mevcut Değil
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Su Sporları
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="included">Dahil</SelectItem>
                              <SelectItem value="optional">
                                Opsiyonel
                              </SelectItem>
                              <SelectItem value="not-available">
                                Mevcut Değil
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Diğer Servisler
                        </label>
                        <Textarea placeholder="Sunduğunuz diğer servisleri buraya ekleyebilirsiniz..." />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="button"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                          onClick={() => {
                            toast({
                              title: "Bilgi",
                              description:
                                "Servisler kaydedildi. Ana kaydetme için 'Taşıt Detayları' sekmesine gidin.",
                            });
                          }}
                        >
                          Servisleri Kaydet
                        </Button>
                      </div>
                    </div>
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

                      <div className="border rounded-lg p-4 bg-gray-50 h-[300px] flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MapPin className="mx-auto h-12 w-12 mb-2 opacity-50" />
                          <p>Harita bileşeni burada gösterilecek.</p>
                          <p className="text-sm">
                            Konumu harita üzerinde işaretleyebileceksiniz.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="button"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                          onClick={() => {
                            toast({
                              title: "Bilgi",
                              description:
                                "Lokasyon kaydedildi. Ana kaydetme için 'Taşıt Detayları' sekmesine gidin.",
                            });
                          }}
                        >
                          Lokasyonu Kaydet
                        </Button>
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
                                      src={getImageUrl(image.id)}
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

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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

                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, WEBP formatları desteklenmektedir (maks.
                          5MB)
                        </p>
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

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                        >
                          {loading
                            ? "Kaydediliyor..."
                            : editingVesselId
                            ? "Güncelle"
                            : "Kaydet"}
                        </Button>
                      </div>
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

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="button"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                          onClick={() => {
                            toast({
                              title: "Bilgi",
                              description:
                                "Açıklamalar kaydedildi. Ana kaydetme için 'Taşıt Detayları' sekmesine gidin.",
                            });
                          }}
                        >
                          Açıklamaları Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="organizations" className="p-6">
                    <h2 className="text-xl font-medium mb-4">
                      Organizasyonlar
                    </h2>
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        Teknenizin hangi organizasyon tiplerine uygun olduğunu
                        seçin:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">
                            Doğum Günü Partisi
                          </h3>
                          <p className="text-sm text-gray-500">
                            Özel günlerde unutulmaz kutlamalar için
                          </p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Evlilik Teklifi</h3>
                          <p className="text-sm text-gray-500">
                            Romantik anlara özel düzenlemeler
                          </p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">İş Toplantısı</h3>
                          <p className="text-sm text-gray-500">
                            Profesyonel görüşmeler için ideal ortam
                          </p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Düğün</h3>
                          <p className="text-sm text-gray-500">
                            Unutulmaz bir düğün günü için
                          </p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Bekarlığa Veda</h3>
                          <p className="text-sm text-gray-500">
                            Eğlenceli bir kutlama için
                          </p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Özel Tur</h3>
                          <p className="text-sm text-gray-500">
                            Kişiselleştirilmiş rotalar ve deneyimler
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ek Organizasyon Detayları
                        </label>
                        <Textarea placeholder="Organizasyonlar ile ilgili ek bilgiler..." />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          disabled={loading}
                        >
                          Geri Dön
                        </Button>
                        <Button
                          type="button"
                          className="bg-[#2ecc71] hover:bg-[#25a25a]"
                          disabled={loading}
                          onClick={() => {
                            toast({
                              title: "Bilgi",
                              description:
                                "Organizasyon bilgileri kaydedildi. Ana kaydetme için 'Taşıt Detayları' sekmesine gidin.",
                            });
                          }}
                        >
                          Organizasyonları Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CaptainLayout>
  );
};

export default VesselsPage;
