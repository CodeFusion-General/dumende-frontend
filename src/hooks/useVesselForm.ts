import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { BoatDTO, CreateVesselDTO, UpdateVesselDTO } from "@/types/boat.types";
import { BoatDocumentDTO, BoatDocumentType } from "@/types/document.types";
import { VesselFormData, INITIAL_VESSEL_FORM_DATA } from "@/types/vessel.types";
import { documentService } from "@/services/documentService";
import { compressImage, validateImageFile } from "@/lib/imageUtils";
import { toast } from "@/components/ui/use-toast";

export interface UseVesselFormReturn {
  // State
  formData: VesselFormData;
  editingVesselId: number | null;
  hasUnsavedDocumentChanges: boolean;
  newFeature: string;
  formTab: string;

  // Setters
  setFormData: Dispatch<SetStateAction<VesselFormData>>;
  setEditingVesselId: Dispatch<SetStateAction<number | null>>;
  setHasUnsavedDocumentChanges: Dispatch<SetStateAction<boolean>>;
  setNewFeature: Dispatch<SetStateAction<string>>;
  setFormTab: Dispatch<SetStateAction<string>>;

  // Form Actions
  validateForm: () => { isValid: boolean; errors: string[] };
  validateDocuments: (docs: BoatDocumentDTO[]) => { isValid: boolean; errors: string[] };
  resetForm: () => void;
  populateFormWithVessel: (vessel: BoatDTO) => void;
  formDataToCreateDTO: (data: VesselFormData) => Promise<CreateVesselDTO>;
  formDataToUpdateDTO: (data: VesselFormData, vesselId: number) => UpdateVesselDTO;

  // Handlers
  handleInputChange: (field: keyof VesselFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof VesselFormData) => (value: string) => void;
  handleMultiSelectToggle: (field: keyof VesselFormData, value: string) => void;
  handleImageUpload: (files: FileList, setLoading: (loading: boolean) => void) => Promise<void>;
  handleRemoveExistingImage: (imageId: number) => void;
  handleRemoveNewImage: (index: number) => void;
}

export function useVesselForm(): UseVesselFormReturn {
  const [formData, setFormData] = useState<VesselFormData>(INITIAL_VESSEL_FORM_DATA);
  const [editingVesselId, setEditingVesselId] = useState<number | null>(null);
  const [hasUnsavedDocumentChanges, setHasUnsavedDocumentChanges] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [formTab, setFormTab] = useState("details");

  // Document-specific validation function
  const validateDocuments = useCallback((documents: BoatDocumentDTO[]): { isValid: boolean; errors: string[] } => {
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
  }, []);

  // Enhanced form validation with document validation
  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
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
  }, [formData, validateDocuments]);

  const populateFormWithVessel = useCallback((vessel: BoatDTO) => {
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
      smokingRule: vessel.smokingRule || "",
      petPolicy: vessel.petPolicy || "",
      alcoholPolicy: vessel.alcoholPolicy || "",
      musicPolicy: vessel.musicPolicy || "",
      additionalRules: vessel.additionalRules || "",
      mealService: "",
      djService: "",
      waterSports: "",
      otherServices: "",
      shortDescription: vessel.shortDescription || "",
      detailedDescription: vessel.description || "",
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
      pendingDocuments: [], // Reset pending documents when editing existing vessel
    });

    // Reset unsaved changes flag when loading existing vessel
    setHasUnsavedDocumentChanges(false);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_VESSEL_FORM_DATA);
    setHasUnsavedDocumentChanges(false);
  }, []);

  // Form to DTO conversion
  const formDataToCreateDTO = useCallback(async (data: VesselFormData): Promise<CreateVesselDTO> => {
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

    console.log('[DEBUG] formDataToCreateDTO - shortDescription:', data.shortDescription);
    console.log('[DEBUG] formDataToCreateDTO - detailedDescription:', data.detailedDescription);

    return {
      name: data.name.trim(),
      description: data.detailedDescription || "",
      shortDescription: data.shortDescription || "",
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
      // Boat Rules/Policies (Şartlar)
      smokingRule: data.smokingRule || undefined,
      petPolicy: data.petPolicy || undefined,
      alcoholPolicy: data.alcoholPolicy || undefined,
      musicPolicy: data.musicPolicy || undefined,
      additionalRules: data.additionalRules || undefined,
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
      // CRITICAL: Include pending documents with base64 data for new boat creation
      documents: data.pendingDocuments.length > 0 ? data.pendingDocuments : undefined,
    };
  }, []);

  const formDataToUpdateDTO = useCallback((data: VesselFormData, vesselId: number): UpdateVesselDTO => {
    return {
      id: vesselId,
      name: data.name,
      description: data.detailedDescription || "",
      shortDescription: data.shortDescription || "",
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
      // Boat Rules/Policies (Şartlar)
      smokingRule: data.smokingRule || undefined,
      petPolicy: data.petPolicy || undefined,
      alcoholPolicy: data.alcoholPolicy || undefined,
      musicPolicy: data.musicPolicy || undefined,
      additionalRules: data.additionalRules || undefined,
    };
  }, []);

  const handleInputChange = useCallback(
    (field: keyof VesselFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (field: keyof VesselFormData) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleMultiSelectToggle = useCallback(
    (field: keyof VesselFormData, value: string) => {
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
    },
    []
  );

  const handleRemoveExistingImage = useCallback((imageId: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img.id !== imageId),
      imageIdsToRemove: [...prev.imageIdsToRemove, imageId],
    }));

    toast({
      title: "Fotoğraf Kaldırıldı",
      description: "Fotoğraf kaydedildiğinde silinecek olarak işaretlendi.",
    });
  }, []);

  const handleRemoveNewImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const handleImageUpload = useCallback(async (files: FileList, setLoading: (loading: boolean) => void) => {
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
  }, []);

  return {
    // State
    formData,
    editingVesselId,
    hasUnsavedDocumentChanges,
    newFeature,
    formTab,

    // Setters
    setFormData,
    setEditingVesselId,
    setHasUnsavedDocumentChanges,
    setNewFeature,
    setFormTab,

    // Form Actions
    validateForm,
    validateDocuments,
    resetForm,
    populateFormWithVessel,
    formDataToCreateDTO,
    formDataToUpdateDTO,

    // Handlers
    handleInputChange,
    handleSelectChange,
    handleMultiSelectToggle,
    handleImageUpload,
    handleRemoveExistingImage,
    handleRemoveNewImage,
  };
}
