import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import VesselsList from "@/components/admin/vessels/VesselsList";
import BoatServicesManager from "@/components/boats/BoatServicesManager";
import BoatDocumentsTab from "@/components/boats/BoatDocumentsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Info,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  Camera,
  Anchor,
  Calendar,
  DollarSign,
  Ruler,
  Users,
  Navigation,
  Globe,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { boatService } from "@/services/boatService";
import {
  BoatDTO,
  CreateVesselDTO,
  UpdateVesselDTO,
  BoatImageDTO,
  BoatServiceDTO,
  ServiceType,
} from "@/types/boat.types";
import {
  BoatDocumentDTO,
  CreateBoatDocumentDTO,
  BoatDocumentType,
} from "@/types/document.types";
import { documentService } from "@/services/documentService";
import {
  compressImage,
  validateImageFile,
  isValidImageUrl,
  getDefaultImageUrl,
} from "@/lib/imageUtils";
import { useAuth } from "@/contexts/AuthContext";
import MapPicker from "@/components/common/MapPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  existingImages: BoatImageDTO[];
  imageIdsToRemove: number[];
  features: string[];

  // Boat Services
  boatServices: Array<{
    name: string;
    description: string;
    price: number;
    serviceType: ServiceType;
    quantity: number;
  }>;

  // Documents
  documents: BoatDocumentDTO[];
}

const VesselsPage = () => {
  const { user, isAuthenticated, isBoatOwner, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  const [editingVesselId, setEditingVesselId] = useState<number | null>(null);
  const [formTab, setFormTab] = useState("details");
  const [newFeature, setNewFeature] = useState("");
  const [hasUnsavedDocumentChanges, setHasUnsavedDocumentChanges] =
    useState(false);

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
    documents: [],
  });

  // Harita modalı ve geolocation
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Konum Kullanılamıyor",
        description: "Tarayıcınız konum servisini desteklemiyor.",
        variant: "destructive",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        toast({
          title: "Konum Seçildi",
          description: "Mevcut konumunuz haritaya işlendi.",
        });
      },
      () => {
        toast({
          title: "Konum İzni Gerekli",
          description: "Konumunuzu paylaşmayı reddettiniz.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    if (editingVesselId && currentVessel) {
      populateFormWithVessel(currentVessel);
    } else {
      resetForm();
    }
  }, [editingVesselId, currentVessel]);

  // API Calls
  const fetchVessels = async () => {
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

      console.log("Fetching vessels for user ID:", user.id);
      const ownerId = user.id;
      const data = await boatService.getVesselsByOwner(ownerId);

      console.log("Vessels fetched successfully:", data.length);
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
      existingImages: vessel.images || [],
      imageIdsToRemove: [],
      features: vessel.features?.map((f) => f.featureName) || [],
      boatServices:
        vessel.services?.map((s) => ({
          name: s.name,
          description: s.description || "",
          price: s.price,
          serviceType: s.serviceType,
          quantity: s.quantity,
        })) || [],
      documents: vessel.documents || [],
    });

    // Reset unsaved changes flag when loading existing vessel
    setHasUnsavedDocumentChanges(false);
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
      documents: [],
    });
    setHasUnsavedDocumentChanges(false);
  };

  // Enhanced form validation with document validation
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Basic form validation
    if (!formData.name.trim()) errors.push("Tekne ismi zorunludur");
    if (!formData.type) errors.push("Tekne tipi zorunludur");
    if (!formData.fullCapacity || parseInt(formData.fullCapacity) <= 0)
      errors.push("Geçerli bir kapasite giriniz");
    if (!formData.location.trim()) errors.push("Lokasyon zorunludur");
    if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0)
      errors.push("Geçerli bir günlük fiyat giriniz");

    // Enhanced document validation
    const documentValidation = validateDocuments(formData.documents);
    if (!documentValidation.isValid) {
      errors.push(...documentValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Document-specific validation function
  const validateDocuments = (
    documents: BoatDocumentDTO[]
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for expired documents
    const expiredDocuments = documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      return documentService.isDocumentExpired(doc.expiryDate);
    });

    if (expiredDocuments.length > 0) {
      errors.push(
        `${expiredDocuments.length} belgenin süresi dolmuş. Lütfen güncel belgeler yükleyin.`
      );
    }

    // Check for documents expiring soon
    const expiringSoonDocuments = documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      return (
        documentService.isDocumentExpiringSoon(doc.expiryDate) &&
        !documentService.isDocumentExpired(doc.expiryDate)
      );
    });

    if (expiringSoonDocuments.length > 0) {
      errors.push(
        `${expiringSoonDocuments.length} belgenin süresi 30 gün içinde dolacak. Yenilemeyi düşünün.`
      );
    }

    // Check for unverified documents (warning, not error)
    const unverifiedDocuments = documents.filter((doc) => !doc.isVerified);
    if (unverifiedDocuments.length > 0) {
      // This is a warning, not an error - don't block form submission
      console.warn(`${unverifiedDocuments.length} belge henüz doğrulanmamış.`);
    }

    // Check for required document types (basic validation)
    const requiredDocTypes = [
      BoatDocumentType.LICENSE,
      BoatDocumentType.INSURANCE,
    ];
    const existingDocTypes = documents.map((doc) => doc.documentType);
    const missingRequiredDocs = requiredDocTypes.filter(
      (type) => !existingDocTypes.includes(type)
    );

    if (missingRequiredDocs.length > 0) {
      const missingDocNames = missingRequiredDocs.map((type) => {
        switch (type) {
          case BoatDocumentType.LICENSE:
            return "Gemi Ruhsatı";
          case BoatDocumentType.INSURANCE:
            return "Sigorta Belgesi";
          default:
            return type;
        }
      });
      errors.push(`Zorunlu belgeler eksik: ${missingDocNames.join(", ")}`);
    }

    // Check for duplicate document types
    const docTypeCounts = existingDocTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicateTypes = Object.entries(docTypeCounts)
      .filter(([_, count]) => count > 1)
      .map(([type, _]) => type);

    if (duplicateTypes.length > 0) {
      errors.push(
        `Aynı tipte birden fazla belge yüklenmiş: ${duplicateTypes.join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Form to DTO conversion
  const formDataToCreateDTO = async (
    data: VesselFormData
  ): Promise<CreateVesselDTO> => {
    const imagePromises = data.images.map(async (file, index) => {
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(",")[1];

          resolve({
            imageData: base64Data,
            isPrimary: index === 0,
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
      status: "INACTIVE",
      brandModel: data.brandModel,
      buildYear: parseInt(data.buildYear) || new Date().getFullYear(),
      captainIncluded: false,
      images: imagesDTOs,
      features: data.features.map((name) => ({ featureName: name })),
      services: data.boatServices.map((service) => ({
        boatId: 0, // Will be set by backend
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
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
      imageIdsToRemove: data.imageIdsToRemove,
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
    fetchVesselById(vesselId);
  };

  const handleBackToList = () => {
    if (hasUnsavedDocumentChanges) {
      const confirmLeave = confirm(
        "Kaydedilmemiş belge değişiklikleriniz var. Çıkmak istediğinizden emin misiniz?"
      );
      if (!confirmLeave) {
        return;
      }
    }

    setActiveTab("list");
    setEditingVesselId(null);
    setCurrentVessel(null);
    resetForm();
  };

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

  const handleRemoveNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle document uploads for new boats
  const handleDocumentUploadsForNewBoat = async (boatId: number) => {
    if (formData.documents.length === 0) return;

    try {
      // Upload each document that was prepared during form filling
      for (const document of formData.documents) {
        // Skip if this is already an uploaded document (has a real ID and boatId)
        if (document.boatId && document.boatId > 0) continue;

        // For temporary documents, we need to re-upload them
        // Note: The actual file data should be stored somewhere accessible
        // For now, we'll skip this as the BoatDocumentsTab handles it internally
        console.log(
          `Document ${document.documentName} will be handled by BoatDocumentsTab`
        );
      }
    } catch (error) {
      console.error("Error uploading documents for new boat:", error);
      toast({
        title: "Belge Yükleme Uyarısı",
        description:
          "Bazı belgeler yüklenemedi. Lütfen belgeleri tekrar kontrol edin.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    try {
      setLoading(true);

      const validFiles: File[] = [];
      const errors: string[] = [];

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

      const compressedImages: File[] = [];

      for (const file of validFiles) {
        try {
          const compressedBase64 = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8,
            outputFormat: "image/jpeg",
          });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if the submit was triggered by a document-related action
    // If so, don't process the main form submission
    const target = e.target as HTMLFormElement;
    const submitter = (e.nativeEvent as any)?.submitter;

    // Skip submission if it's coming from document upload area or file input
    if (submitter) {
      const isDocumentArea = submitter.closest("[data-document-area]");
      const isFileInput =
        submitter.type === "file" || submitter.closest('input[type="file"]');
      const isDocumentUploader = submitter.closest("[data-document-uploader]");
      const isDocumentTab = submitter.closest("[data-document-tab-container]");
      const isDocumentFileInput = submitter.hasAttribute(
        "data-document-file-input"
      );

      if (
        isDocumentArea ||
        isFileInput ||
        isDocumentUploader ||
        isDocumentTab ||
        isDocumentFileInput
      ) {
        console.log("Document-related submission prevented");
        return;
      }
    }

    // Additional check for current tab - don't submit if we're on documents tab
    if (formTab === "documents") {
      console.log("Form submission prevented while on documents tab");
      return;
    }

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
        const updateDTO = formDataToUpdateDTO(formData);
        await boatService.updateVessel(updateDTO);

        try {
          const originalFeatures = currentVessel.features || [];
          const originalNames = new Set(
            originalFeatures.map((f) => f.featureName)
          );
          const currentNames = new Set(formData.features);

          const featuresToAdd = formData.features.filter(
            (name) => !originalNames.has(name)
          );
          const featuresToRemove = originalFeatures.filter(
            (f) => !currentNames.has(f.featureName)
          );

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

        if (formData.imageIdsToRemove.length > 0) {
          for (const imageId of formData.imageIdsToRemove) {
            try {
              await boatService.deleteBoatImage(editingVesselId, imageId);
            } catch (error) {
              console.error(`Fotoğraf ${imageId} silinemedi:`, error);
            }
          }
        }

        if (formData.images.length > 0) {
          await boatService.compressAndUploadImages(
            editingVesselId,
            createFileListFromFiles(formData.images)
          );
        }

        // Handle document operations for existing boats
        // Note: Document operations are handled by BoatDocumentsTab component
        // This is just for any additional document-related cleanup or validation

        toast({
          title: "Başarılı",
          description: "Tekne bilgileri güncellendi.",
        });
      } else {
        if (formData.images.length > 0) {
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

          const newVessel = await boatService.createVesselWithOptimizedImages(
            createDTO
          );

          // Handle document uploads for new boat
          await handleDocumentUploadsForNewBoat(newVessel.id);

          toast({
            title: "Başarılı",
            description: "Yeni tekne eklendi.",
          });
        } else {
          const createDTO = await formDataToCreateDTO(formData);
          const newVessel = await boatService.createVessel(createDTO);

          // Handle document uploads for new boat
          await handleDocumentUploadsForNewBoat(newVessel.id);

          toast({
            title: "Başarılı",
            description: "Yeni tekne eklendi.",
          });
        }
      }

      await fetchVessels();
      setHasUnsavedDocumentChanges(false);
      handleBackToList();
    } catch (error) {
      console.error("Vessel kaydetme hatası:", error);

      // Check if error is document-related
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      let description =
        "Tekne kaydedilemedi. Lütfen daha sonra tekrar deneyin.";

      if (errorMessage.includes("document") || errorMessage.includes("belge")) {
        description =
          "Tekne kaydedildi ancak bazı belgeler yüklenemedi. Belgeleri tekrar kontrol edin.";
      }

      toast({
        title: "Hata",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      await fetchVessels();

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
      <div className="space-y-8">
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
              {/* Modern Header Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                <div className="relative p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToList}
                        className="hover:bg-primary/10"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="p-2 bg-primary rounded-lg">
                        <Ship className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                          {editingVesselId
                            ? "Taşıt Düzenle"
                            : "Yeni Taşıt Ekle"}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                          {editingVesselId
                            ? "Mevcut tekne bilgilerinizi güncelleyin"
                            : "Adım adım ilerleyerek yeni teknenizi ekleyin"}
                        </p>
                      </div>
                    </div>
                    {loading && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Yükleniyor
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                onClick={(e) => {
                  // Prevent clicks on document-related elements from triggering form submission
                  const target = e.target as HTMLElement;
                  if (
                    target.closest("[data-document-area]") ||
                    target.closest("[data-document-uploader]") ||
                    target.closest("[data-document-tab-container]") ||
                    target.closest('input[type="file"]') ||
                    target.hasAttribute("data-document-file-input")
                  ) {
                    e.stopPropagation();
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent Enter key from submitting form when in document areas
                  if (e.key === "Enter") {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("[data-document-area]") ||
                      target.closest("[data-document-uploader]") ||
                      target.closest("[data-document-tab-container]")
                    ) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }
                }}
              >
                <Tabs
                  defaultValue={formTab}
                  className="w-full"
                  onValueChange={setFormTab}
                >
                  {/* Modern Tab Navigation */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <TabsList className="w-full justify-start bg-gradient-to-r from-gray-50 to-white border-0 rounded-none p-0 h-auto">
                      <div className="flex flex-wrap gap-2 p-6">
                        <TabsTrigger
                          value="details"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            1
                          </span>
                          <FileText size={16} />
                          <span className="font-medium">Detaylar</span>
                        </TabsTrigger>

                        <TabsTrigger
                          value="terms"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            2
                          </span>
                          <Shield size={16} />
                          <span className="font-medium">Şartlar</span>
                        </TabsTrigger>

                        <TabsTrigger
                          value="services"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            3
                          </span>
                          <Utensils size={16} />
                          <span className="font-medium">Servisler</span>
                          {formData.boatServices.length > 0 && (
                            <Badge className="ml-1 bg-primary/10 text-primary border-primary/20">
                              {formData.boatServices.length}
                            </Badge>
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="location"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            4
                          </span>
                          <MapPin size={16} />
                          <span className="font-medium">Lokasyon</span>
                          {formData.latitude && formData.longitude && (
                            <Badge className="ml-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Seçildi
                            </Badge>
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="photos"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            5
                          </span>
                          <Camera size={16} />
                          <span className="font-medium">Fotoğraflar</span>
                          {formData.existingImages.length +
                            formData.images.length >
                            0 && (
                            <Badge className="ml-1 bg-primary/10 text-primary border-primary/20">
                              {formData.existingImages.length +
                                formData.images.length}
                            </Badge>
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="documents"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            6
                          </span>
                          <FileText size={16} />
                          <span className="font-medium">Belgeler</span>
                          {formData.documents.length > 0 && (
                            <Badge className="ml-1 bg-primary/10 text-primary border-primary/20">
                              {formData.documents.length}
                            </Badge>
                          )}
                          {hasUnsavedDocumentChanges && (
                            <div
                              className="w-2 h-2 bg-orange-500 rounded-full ml-1"
                              title="Kaydedilmemiş değişiklikler"
                            />
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="features"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            7
                          </span>
                          <Sparkles size={16} />
                          <span className="font-medium">Özellikler</span>
                          {formData.features.length > 0 && (
                            <Badge className="ml-1 bg-primary/10 text-primary border-primary/20">
                              {formData.features.length}
                            </Badge>
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="descriptions"
                          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white transition-all duration-300 border border-gray-200 data-[state=active]:border-primary shadow-sm hover:shadow-md"
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 group-data-[state=active]:bg-white group-data-[state=active]:text-primary">
                            8
                          </span>
                          <FileText size={16} />
                          <span className="font-medium">Açıklamalar</span>
                        </TabsTrigger>
                      </div>
                    </TabsList>

                    {/* Tab Contents with Modern Design */}
                    <TabsContent value="details" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <Anchor className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Temel Bilgiler
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizin temel özelliklerini ve detaylarını
                              girin
                            </p>
                          </div>
                        </div>

                        {/* Form Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Ship className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">
                                  Tekne Bilgileri
                                </h3>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Taşıt Tipi *
                                </label>
                                <Select
                                  value={formData.type}
                                  onValueChange={handleSelectChange("type")}
                                >
                                  <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
                                    <SelectValue placeholder="Tekne tipini seçiniz" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SAILBOAT">
                                      Yelkenli
                                    </SelectItem>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Tekne İsmi *
                                </label>
                                <Input
                                  placeholder="Tekne ismi giriniz"
                                  value={formData.name}
                                  onChange={handleInputChange("name")}
                                  required
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Marka / Model
                                </label>
                                <Input
                                  placeholder="Örn: Azimut 55"
                                  value={formData.brandModel}
                                  onChange={handleInputChange("brandModel")}
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>
                            </div>
                          </Card>

                          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">
                                  Teknik Detaylar
                                </h3>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Yapım Yılı
                                </label>
                                <Input
                                  type="number"
                                  placeholder="Örn: 2015"
                                  value={formData.buildYear}
                                  onChange={handleInputChange("buildYear")}
                                  min="1970"
                                  max={new Date().getFullYear()}
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <Users className="inline h-4 w-4 mr-1" />
                                  Kapasite *
                                </label>
                                <Input
                                  type="number"
                                  placeholder="Örn: 12"
                                  value={formData.fullCapacity}
                                  onChange={handleInputChange("fullCapacity")}
                                  min="1"
                                  required
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <Ruler className="inline h-4 w-4 mr-1" />
                                  Uzunluk (metre)
                                </label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Örn: 15.5"
                                  value={formData.length}
                                  onChange={handleInputChange("length")}
                                  min="0"
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>
                            </div>
                          </Card>

                          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Fiyatlandırma</h3>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Günlük Fiyat (₺) *
                                </label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Örn: 2500"
                                  value={formData.dailyPrice}
                                  onChange={handleInputChange("dailyPrice")}
                                  min="0"
                                  required
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Saatlik Fiyat (₺)
                                </label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Örn: 300"
                                  value={formData.hourlyPrice}
                                  onChange={handleInputChange("hourlyPrice")}
                                  min="0"
                                  className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                />
                              </div>
                            </div>
                          </Card>

                          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Globe className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Bölge</h3>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Lokasyon *
                                </label>
                                <Select
                                  value={formData.location}
                                  onValueChange={handleSelectChange("location")}
                                >
                                  <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="İstanbul">
                                      İstanbul
                                    </SelectItem>
                                    <SelectItem value="Bodrum">
                                      Bodrum
                                    </SelectItem>
                                    <SelectItem value="Fethiye">
                                      Fethiye
                                    </SelectItem>
                                    <SelectItem value="Marmaris">
                                      Marmaris
                                    </SelectItem>
                                    <SelectItem value="Çeşme">Çeşme</SelectItem>
                                    <SelectItem value="Antalya">
                                      Antalya
                                    </SelectItem>
                                    <SelectItem value="Göcek">Göcek</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                          <div className="flex gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-1">İpucu:</p>
                              <p>
                                * işaretli alanlar zorunludur. Detaylı bilgi
                                girmek müşterilerinizin doğru seçim yapmasına
                                yardımcı olur.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="terms" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <Shield className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Şartlar ve Koşullar
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizde uygulanacak kuralları ve politikaları
                              belirleyin
                            </p>
                          </div>
                        </div>

                        <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sigara İçme Kuralı
                              </label>
                              <Select>
                                <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Evcil Hayvan
                              </label>
                              <Select>
                                <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alkol
                              </label>
                              <Select>
                                <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
                                  <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="allowed">
                                    İzin Verilir
                                  </SelectItem>
                                  <SelectItem value="prohibited">
                                    İzin Verilmez
                                  </SelectItem>
                                  <SelectItem value="byo">
                                    Kendi Getir
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Müzik
                              </label>
                              <Select>
                                <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
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

                          <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ek Kurallar
                            </label>
                            <Textarea
                              placeholder="Müşterilerinizin bilmesi gereken diğer kuralları veya şartları buraya yazabilirsiniz..."
                              className="min-h-[120px] border-2 hover:border-primary focus:border-primary transition-colors resize-none"
                            />
                          </div>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="services" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <Utensils className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Ek Hizmetler
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizde sunduğunuz ek hizmetleri ve fiyatlarını
                              belirleyin
                            </p>
                          </div>
                        </div>

                        <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <BoatServicesManager
                            services={formData.boatServices}
                            onServicesChange={(services) =>
                              setFormData((prev) => ({
                                ...prev,
                                boatServices: services,
                              }))
                            }
                          />
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="location" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <MapPin className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Lokasyon
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizin konumunu ve kalkış/dönüş noktalarını
                              belirleyin
                            </p>
                          </div>
                        </div>

                        <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <Navigation className="inline h-4 w-4 mr-1" />
                                  Kalkış Noktası
                                </label>
                                <Select>
                                  <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <Navigation className="inline h-4 w-4 mr-1" />
                                  Dönüş Noktası
                                </label>
                                <Select>
                                  <SelectTrigger className="h-12 border-2 hover:border-primary focus:border-primary transition-colors">
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
                                  <label className="block text-sm font-medium text-gray-700">
                                    Harita Üzerinden Konum Seçin
                                  </label>
                                  <p className="text-xs text-gray-500">
                                    Haritaya tıklayın veya işaretçiyi
                                    sürükleyin.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={useCurrentLocation}
                                    className="h-9"
                                  >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Mevcut Konum
                                  </Button>
                                  <Dialog
                                    open={isMapDialogOpen}
                                    onOpenChange={setIsMapDialogOpen}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="h-9"
                                      >
                                        Haritayı Büyüt
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-7xl">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Harita - Konum Seç
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="mt-2">
                                        <MapPicker
                                          value={
                                            formData.latitude &&
                                            formData.longitude
                                              ? {
                                                  lat: formData.latitude,
                                                  lng: formData.longitude,
                                                }
                                              : undefined
                                          }
                                          onChange={(coords) => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              latitude: coords.lat,
                                              longitude: coords.lng,
                                            }));
                                          }}
                                          height={600}
                                          zoom={12}
                                        />
                                        <div className="mt-2 text-sm text-gray-600">
                                          Seçilen Koordinatlar:{" "}
                                          {formData.latitude?.toFixed(5) ?? "-"}
                                          ,{" "}
                                          {formData.longitude?.toFixed(5) ??
                                            "-"}
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>

                              <div className="border-2 rounded-xl p-2 bg-white hover:border-primary transition-colors">
                                <MapPicker
                                  value={
                                    formData.latitude && formData.longitude
                                      ? {
                                          lat: formData.latitude,
                                          lng: formData.longitude,
                                        }
                                      : undefined
                                  }
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
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enlem (Latitude)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="41.0082"
                                    value={formData.latitude ?? ""}
                                    onChange={(e) => {
                                      const v = e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined;
                                      setFormData((prev) => ({
                                        ...prev,
                                        latitude: isNaN(v as number)
                                          ? undefined
                                          : (v as number),
                                      }));
                                    }}
                                    className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Boylam (Longitude)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="28.9784"
                                    value={formData.longitude ?? ""}
                                    onChange={(e) => {
                                      const v = e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined;
                                      setFormData((prev) => ({
                                        ...prev,
                                        longitude: isNaN(v as number)
                                          ? undefined
                                          : (v as number),
                                      }));
                                    }}
                                    className="h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        latitude: undefined,
                                        longitude: undefined,
                                      }))
                                    }
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Temizle
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="photos" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <Camera className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Fotoğraflar
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizin en iyi fotoğraflarını ekleyin. İlk
                              fotoğraf ana görsel olarak kullanılacaktır.
                            </p>
                          </div>
                        </div>

                        <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="space-y-6">
                            {/* Existing Images */}
                            {editingVesselId &&
                              formData.existingImages.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Mevcut Fotoğraflar (
                                    {formData.existingImages.length})
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {formData.existingImages.map(
                                      (image, index) => (
                                        <div
                                          key={image.id}
                                          className="relative group"
                                        >
                                          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
                                            <img
                                              src={image.imageUrl}
                                              alt={`Mevcut fotoğraf ${
                                                index + 1
                                              }`}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveExistingImage(
                                                image.id
                                              )
                                            }
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                          >
                                            ×
                                          </button>
                                          {image.isPrimary && (
                                            <Badge className="absolute top-2 left-2 bg-primary text-white">
                                              Ana
                                            </Badge>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Upload Area */}
                            <div
                              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary transition-colors bg-gradient-to-br from-gray-50 to-white"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer?.files?.length) {
                                  handleImageUpload(e.dataTransfer.files);
                                }
                              }}
                            >
                              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                                <Camera className="h-8 w-8 text-primary" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Fotoğrafları Sürükle & Bırak
                              </h3>
                              <p className="text-gray-600 mb-6">
                                veya fotoğraf seçmek için tıklayın
                              </p>

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
                                onClick={() =>
                                  document
                                    .getElementById("image-upload")
                                    ?.click()
                                }
                                className="bg-primary hover:bg-primary/90 text-white"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Fotoğraf Seç
                              </Button>

                              <p className="mt-4 text-xs text-gray-500">
                                PNG, JPG, WEBP formatları desteklenir (maks.
                                5MB)
                              </p>
                            </div>

                            {/* New Images */}
                            {formData.images.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                  Yeni Eklenen Fotoğraflar (
                                  {formData.images.length})
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                  {formData.images.map((file, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`Yeni fotoğraf ${index + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveNewImage(index)
                                        }
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                      >
                                        ×
                                      </button>
                                      <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                                        Yeni
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="p-8">
                      <div
                        className="space-y-8"
                        data-document-area
                        data-no-submit
                      >
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Belgeler
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Tekneniz için gerekli belgeleri yükleyin ve
                              yönetin
                            </p>
                          </div>
                        </div>

                        <BoatDocumentsTab
                          boatId={editingVesselId || undefined}
                          documents={formData.documents}
                          onDocumentsChange={(documents) => {
                            const previousCount = formData.documents.length;
                            const newCount = documents.length;

                            setFormData((prev) => ({ ...prev, documents }));
                            setHasUnsavedDocumentChanges(true);

                            // Show success notification for document operations
                            if (newCount > previousCount) {
                              toast({
                                title: "Belge Yüklendi",
                                description:
                                  "Belge başarıyla yüklendi ve listeye eklendi.",
                                variant: "default",
                              });
                            } else if (newCount < previousCount) {
                              toast({
                                title: "Belge Silindi",
                                description:
                                  "Belge başarıyla listeden kaldırıldı.",
                                variant: "default",
                              });
                            }
                          }}
                          loading={loading}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="features" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <Sparkles className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Özellikler
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizin öne çıkan özelliklerini seçin veya
                              ekleyin
                            </p>
                          </div>
                        </div>

                        <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          {/* Selected Features */}
                          {formData.features.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Seçili Özellikler ({formData.features.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {formData.features.map((f) => (
                                  <Badge
                                    key={f}
                                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm hover:bg-primary/20 transition-colors"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {f}
                                    <button
                                      type="button"
                                      className="ml-2 hover:text-red-600 transition-colors"
                                      onClick={() =>
                                        handleMultiSelectToggle("features", f)
                                      }
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggested Features */}
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Önerilen Özellikler
                            </h4>
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
                                const selected =
                                  formData.features.includes(feature);
                                return (
                                  <button
                                    type="button"
                                    key={feature}
                                    onClick={() =>
                                      handleMultiSelectToggle(
                                        "features",
                                        feature
                                      )
                                    }
                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                                      selected
                                        ? "bg-primary text-white border-primary shadow-md transform scale-105"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-primary/5"
                                    }`}
                                  >
                                    {selected && (
                                      <CheckCircle className="inline h-3 w-3 mr-1" />
                                    )}
                                    {feature}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Feature Add */}
                          <div className="border-t pt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Özel Özellik Ekle
                            </h4>
                            <div className="flex gap-3">
                              <Input
                                placeholder="Örn: Underwater Lights"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const value = newFeature.trim();
                                    if (
                                      value &&
                                      !formData.features.includes(value)
                                    ) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        features: [...prev.features, value],
                                      }));
                                      setNewFeature("");
                                    }
                                  }
                                }}
                                className="flex-1 h-12 border-2 hover:border-primary focus:border-primary transition-colors"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const value = newFeature.trim();
                                  if (
                                    value &&
                                    !formData.features.includes(value)
                                  ) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      features: [...prev.features, value],
                                    }));
                                    setNewFeature("");
                                  }
                                }}
                                className="h-12 px-6 bg-primary hover:bg-primary/90 text-white"
                                disabled={loading}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Ekle
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="descriptions" className="p-8">
                      <div className="space-y-8">
                        {/* Section Header */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-2xl opacity-10"></div>
                          <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-primary rounded-lg">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                Açıklamalar
                              </h2>
                            </div>
                            <p className="text-gray-600 ml-11">
                              Teknenizi detaylı bir şekilde tanıtın
                            </p>
                          </div>
                        </div>

                        <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kısa Açıklama
                              </label>
                              <Textarea
                                placeholder="Teknenizin kısa bir özetini yazın (maksimum 200 karakter)"
                                maxLength={200}
                                value={formData.shortDescription}
                                onChange={handleInputChange("shortDescription")}
                                className="min-h-[100px] border-2 hover:border-primary focus:border-primary transition-colors resize-none"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Bu açıklama tekne listelerinde ve arama
                                sonuçlarında gösterilecektir.
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Detaylı Açıklama
                              </label>
                              <Textarea
                                placeholder="Teknenizin detaylı tanıtımını yapın..."
                                className="min-h-[200px] border-2 hover:border-primary focus:border-primary transition-colors resize-none"
                                value={formData.detailedDescription}
                                onChange={handleInputChange(
                                  "detailedDescription"
                                )}
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Teknenizin özellikleri, avantajları ve diğer
                                özelliklerini detaylandırın.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Modern Bottom Action Bar */}
                    <div className="sticky bottom-0 z-20 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 px-8 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 hidden sm:block">
                          <Info className="inline h-4 w-4 mr-1" />
                          Tüm sekmelerdeki bilgiler tek seferde kaydedilir.
                        </p>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackToList}
                            disabled={loading}
                            className="hover:bg-gray-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Vazgeç
                          </Button>
                          <Button
                            type="submit"
                            className="px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Kaydediliyor...
                              </span>
                            ) : editingVesselId ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Güncellemeyi Kaydet
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Tekneyi Kaydet
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tabs>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        {/* Decorative Elements */}
        <div className="fixed -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl pointer-events-none" />
        <div className="fixed -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-lg pointer-events-none" />
      </div>
    </CaptainLayout>
  );
};

export default VesselsPage;
