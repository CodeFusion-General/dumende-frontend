import { BaseService } from "./base/BaseService";
import {
  BoatDTO,
  CreateBoatDTO,
  UpdateBoatDTO,
  BoatFilters,
  AvailabilityDTO,
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  CreateVesselDTO,
  UpdateVesselDTO,
  BoatServiceDTO,
  CreateBoatServiceDTO,
  UpdateBoatServiceDTO,
  ServiceType,
} from "@/types/boat.types";
import {
  BoatDocumentDTO,
  CreateBoatDocumentDTO,
  UpdateBoatDocumentDTO,
} from "@/types/document.types";
import { compressImage, validateImageFile } from "@/lib/imageUtils";
import { availabilityService } from "./availabilityService";
import { documentService } from "./documentService";

// Yeni tip tanımları
export interface LocationStatistic {
  location: string;
  boatCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface TypeStatistic {
  type: string;
  boatCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface AdvancedSearchRequest {
  location?: string;
  type?: string;
  locations?: string[];
  types?: string[];
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  captainIncluded?: boolean;
  instantConfirmation?: boolean;
  minYear?: number;
  maxYear?: number;
  minLength?: number;
  maxLength?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: "LOCATION" | "BOAT";
}

class BoatService extends BaseService {
  constructor() {
    super("/boats");
  }

  public async getBoats(): Promise<BoatDTO[]> {
    return this.getPublic<BoatDTO[]>("");
  }

  public async getBoatById(id: number): Promise<BoatDTO> {
    return this.getPublic<BoatDTO>(`/${id}`);
  }

  public async createBoat(data: CreateBoatDTO): Promise<BoatDTO> {
    return this.post<BoatDTO>("", data);
  }

  public async updateBoat(data: UpdateBoatDTO): Promise<BoatDTO> {
    return this.put<BoatDTO>("", data);
  }

  public async deleteBoat(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  // Availability Management
  public async getBoatAvailability(
    id: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    return availabilityService.isBoatAvailableBetweenDates(
      id,
      startDate,
      endDate
    );
  }

  public async getBoatAvailabilities(
    boatId: number
  ): Promise<AvailabilityDTO[]> {
    return availabilityService.getAvailabilitiesByBoatId(boatId);
  }

  public async createAvailability(
    data: CreateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return availabilityService.createAvailability(data);
  }

  public async updateAvailability(
    data: UpdateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return availabilityService.updateAvailability(data);
  }

  public async deleteAvailability(id: number): Promise<void> {
    return availabilityService.deleteAvailability(id);
  }

  // Owner/User based queries
  public async getBoatsByOwner(ownerId: number): Promise<BoatDTO[]> {
    return this.get<BoatDTO[]>(`/owner/${ownerId}`);
  }

  public async getBoatsByCaptain(captainId: number): Promise<BoatDTO[]> {
    return this.get<BoatDTO[]>(`/captain/${captainId}`);
  }

  // Image Management
  public async uploadBoatImage(
    boatId: number,
    file: File,
    isPrimary = false,
    displayOrder = 1
  ): Promise<BoatDTO> {
    return this.uploadFile<BoatDTO>(`/boat-images/boat/${boatId}`, file, {
      isPrimary,
      displayOrder,
    });
  }

  public async deleteBoatImage(boatId: number, imageId: number): Promise<void> {
    return this.delete<void>(`/boat-images/${imageId}`);
  }

  // Feature Management
  public async addBoatFeature(
    boatId: number,
    featureName: string
  ): Promise<BoatDTO> {
    return this.post<BoatDTO>(`/boat-features/boat/${boatId}`, {
      featureName,
    });
  }

  public async removeBoatFeature(
    boatId: number,
    featureId: number
  ): Promise<void> {
    return this.delete<void>(`/boat-features/${featureId}`);
  }

  // Search and Filter (BoatListing sayfası için public)
  public async searchBoats(params: {
    name?: string;
    location?: string;
    minCapacity?: number;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<BoatDTO[]> {
    const queryParams = new URLSearchParams();

    if (params.name) queryParams.append("name", params.name);
    if (params.location) queryParams.append("location", params.location);
    if (params.minCapacity)
      queryParams.append("minCapacity", params.minCapacity.toString());
    if (params.type) queryParams.append("type", params.type);
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    return this.getPublic<BoatDTO[]>(`/search?${queryParams.toString()}`);
  }

  // *** YENİ API'LER - Backend Entegrasyonu ***

  // Lokasyonlar (Ana sayfa için public)
  public async getAllLocations(): Promise<string[]> {
    return this.getPublic<string[]>("/locations");
  }

  // İstatistikler (Ana sayfa için public)
  public async getLocationStatistics(): Promise<LocationStatistic[]> {
    return this.getPublic<LocationStatistic[]>("/statistics/by-location");
  }

  public async getTypeStatistics(): Promise<TypeStatistic[]> {
    return this.getPublic<TypeStatistic[]>("/statistics/by-type");
  }

  public async countBoatsByLocation(location: string): Promise<number> {
    return this.get<number>(`/count/location/${encodeURIComponent(location)}`);
  }

  public async countBoatsByType(type: string): Promise<number> {
    return this.get<number>(`/count/type/${encodeURIComponent(type)}`);
  }

  // Gelişmiş arama (Ana sayfa için public)
  public async advancedSearch(
    searchRequest: AdvancedSearchRequest
  ): Promise<BoatDTO[]> {
    return this.postPublic<BoatDTO[]>("/search/advanced", searchRequest);
  }

  // Gelişmiş arama + sayfalama (Ana sayfa için public POST)
  public async advancedSearchPaginated(
    searchRequest: AdvancedSearchRequest,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: BoatDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    const { page = 0, size = 12, sort = "popularity,desc" } = params || {};
    const response = await this.api.post(
      `${this.baseUrl}/search/advanced/paginated`,
      searchRequest,
      {
        params: { page, size, sort },
        // No auth headers for public endpoint
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  // Arama önerileri (Ana sayfa için public)
  public async getSuggestions(
    query: string,
    limit: number = 6
  ): Promise<SearchSuggestion[]> {
    return this.getPublic<SearchSuggestion[]>(`/suggestions`, { query, limit });
  }

  // Pagination support
  public async getBoatsPaginated(
    filters?: BoatFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) {
    return this.getPaginated<BoatDTO>("/paginated", filters);
  }

  // Statistics
  public async getBoatStatistics(boatId?: number): Promise<{
    totalBoats: number;
    averageRating: number;
    totalBookings: number;
    totalRevenue: number;
    popularFeatures: string[];
    bookingRate: number;
  }> {
    const url = boatId ? `/statistics/${boatId}` : "/statistics";
    return this.get(url);
  }

  // Boat Status Operations
  public async updateBoatStatus(id: number, status: string): Promise<void> {
    return this.patch<void>(`/${id}/status?status=${status}`);
  }

  public async updateBoatRating(id: number, rating: number): Promise<void> {
    return this.patch<void>(`/${id}/rating?rating=${rating}`);
  }

  // Existence check
  public async existsBoatById(id: number): Promise<boolean> {
    return this.get<boolean>(`/exists/${id}`);
  }

  // *** VESSELS PAGE İÇİN ÖZEL API'LER ***

  // Admin tarafından tekne yönetimi
  public async getVesselsByOwner(ownerId: number): Promise<BoatDTO[]> {
    return this.get<BoatDTO[]>(`/owner/${ownerId}`);
  }

  public async createVessel(vesselData: CreateVesselDTO): Promise<BoatDTO> {
    return this.post<BoatDTO>("", vesselData);
  }

  public async updateVessel(vesselData: UpdateVesselDTO): Promise<BoatDTO> {
    return this.put<BoatDTO>("", vesselData);
  }

  public async deleteVessel(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  public async updateVesselStatus(id: number, status: string): Promise<void> {
    return this.patch<void>(
      `/${id}/status?status=${encodeURIComponent(status)}`
    );
  }

  // Tekne fotoğrafları yönetimi
  public async uploadVesselImages(
    boatId: number,
    files: FileList
  ): Promise<BoatDTO> {
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append("images", file);
      formData.append(`displayOrder_${index}`, (index + 1).toString());
    });

    try {
      const response = await this.api.post(
        `/boat-images/boat/${boatId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async deleteVesselImage(imageId: number): Promise<void> {
    try {
      const response = await this.api.delete(`/boat-images/${imageId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ✅ DÜZELT: Tekne özelliklerini toplu güncelleme
  // Backend endpoint: /batch (bulk değil)
  public async updateVesselFeatures(
    boatId: number,
    features: string[]
  ): Promise<BoatDTO> {
    try {
      const response = await this.api.post(
        `/boat-features/boat/${boatId}/batch`, // ✅ DÜZELT: bulk → batch
        { features }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Form validation için tip kontrolü
  public async validateVesselData(
    vesselData: Partial<CreateVesselDTO>
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    try {
      return this.post<{ isValid: boolean; errors: string[] }>(
        "/validate",
        vesselData
      );
    } catch (error) {
      return {
        isValid: false,
        errors: ["Validation servisine ulaşılamıyor"],
      };
    }
  }

  // *** OPTIMIZE EDİLMİŞ RESIM YÜKLEMESİ ***
  public async createVesselWithOptimizedImages(
    vesselData: CreateVesselDTO
  ): Promise<BoatDTO> {
    // Önce resimler olmadan tekneyi oluştur
    const vesselDataWithoutImages = { ...vesselData, images: [] };
    const createdVessel = await this.post<BoatDTO>("", vesselDataWithoutImages);

    // Eğer resim varsa, compress edip ayrı ayrı yükle
    if (vesselData.images && vesselData.images.length > 0) {
      const optimizedImages = await Promise.all(
        vesselData.images.map(async (imageDto, index) => ({
          imageData: imageDto.imageData, // Zaten base64 format
          isPrimary: index === 0,
          displayOrder: index + 1,
        }))
      );

      // Toplu resim yükleme
      await this.uploadOptimizedImages(createdVessel.id!, optimizedImages);
    }

    return createdVessel;
  }

  public async uploadOptimizedImages(
    boatId: number,
    images: Array<{
      imageData: string;
      isPrimary: boolean;
      displayOrder: number;
    }>
  ): Promise<void> {
    // baseURL zaten /api olduğu için /api prefix'i eklememeliyiz
    try {
      const response = await this.api.post(
        `/boat-images/boat/${boatId}/batch-from-base64`,
        images
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async compressAndUploadImages(
    boatId: number,
    files: FileList
  ): Promise<BoatDTO> {
    const compressedImages: Array<{
      imageData: string;
      isPrimary: boolean;
      displayOrder: number;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Dosya validasyonu
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(`Dosya ${file.name}: ${validation.error}`);
      }

      try {
        // Resmi compress et
        const compressedBase64 = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.8,
          outputFormat: "image/jpeg",
        });

        compressedImages.push({
          imageData: compressedBase64,
          isPrimary: i === 0,
          displayOrder: i + 1,
        });
      } catch (error) {
        console.error(`${file.name} compress edilemedi:`, error);
        throw new Error(`Resim işlenemedi: ${file.name}`);
      }
    }

    // Optimize edilmiş resimleri yükle
    await this.uploadOptimizedImages(boatId, compressedImages);

    // Güncellenmiş tekne bilgilerini getir
    return this.getBoatById(boatId);
  }

  // ==================== BOAT SERVICES API ====================

  // Boat Services - Query Methods
  public async getBoatServiceById(id: number): Promise<BoatServiceDTO> {
    try {
      const response = await this.api.get(`/boat-services/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getBoatServicesByBoatId(
    boatId: number
  ): Promise<BoatServiceDTO[]> {
    try {
      const response = await this.api.get(`/boat-services/boat/${boatId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getBoatServicesByType(
    serviceType: ServiceType
  ): Promise<BoatServiceDTO[]> {
    try {
      const response = await this.api.get(
        `/boat-services/type/${serviceType}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getBoatServicesByBoatIdAndType(
    boatId: number,
    serviceType: ServiceType
  ): Promise<BoatServiceDTO[]> {
    try {
      const response = await this.api.get(
        `/boat-services/boat/${boatId}/type/${serviceType}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async searchBoatServicesByName(
    boatId: number,
    name: string
  ): Promise<BoatServiceDTO[]> {
    try {
      const response = await this.api.get(
        `/boat-services/boat/${boatId}/search`,
        {
          params: { name },
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Boat Services - Command Methods
  public async createBoatService(
    data: CreateBoatServiceDTO
  ): Promise<BoatServiceDTO> {
    try {
      const response = await this.api.post("/boat-services", data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async createBoatServices(
    data: CreateBoatServiceDTO[]
  ): Promise<BoatServiceDTO[]> {
    try {
      const response = await this.api.post("/boat-services/batch", data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateBoatService(
    data: UpdateBoatServiceDTO
  ): Promise<BoatServiceDTO> {
    try {
      const response = await this.api.put("/boat-services", data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async deleteBoatService(id: number): Promise<void> {
    try {
      const response = await this.api.delete(`/boat-services/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async deleteBoatServicesByBoatId(boatId: number): Promise<void> {
    try {
      const response = await this.api.delete(`/boat-services/boat/${boatId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Helper method for getting services with price calculation
  public async getBoatServicesWithPricing(
    boatId: number
  ): Promise<BoatServiceDTO[]> {
    const services = await this.getBoatServicesByBoatId(boatId);

    // Add calculated total prices for each service
    return services.map((service) => ({
      ...service,
      totalPrice:
        service.serviceType === ServiceType.FOOD
          ? service.price * service.quantity
          : service.price,
    }));
  }

  // ==================== BOAT DOCUMENT INTEGRATION ====================

  /**
   * Fetches boat documents during boat loading
   * @param boatId - The boat ID
   * @returns Promise with boat documents
   */
  public async getBoatDocuments(boatId: number): Promise<BoatDocumentDTO[]> {
    try {
      return await documentService.getBoatDocuments(boatId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gets boat with documents included
   * @param boatId - The boat ID
   * @returns Promise with boat data including documents
   */
  public async getBoatWithDocuments(boatId: number): Promise<BoatDTO> {
    try {
      const [boat, documents] = await Promise.all([
        this.getBoatById(boatId),
        this.getBoatDocuments(boatId),
      ]);

      return {
        ...boat,
        documents,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Creates a boat with documents in a single transaction-like operation
   * @param boatData - Boat creation data including documents
   * @returns Promise with created boat
   */
  public async createBoatWithDocuments(
    boatData: CreateBoatDTO
  ): Promise<BoatDTO> {
    try {
      // Extract documents from boat data
      const { documents, ...boatDataWithoutDocuments } = boatData;

      // Create boat first
      const createdBoat = await this.createBoat(boatDataWithoutDocuments);

      // If documents are provided, create them
      if (documents && documents.length > 0) {
        const createdDocuments = await Promise.all(
          documents.map((doc) =>
            documentService.createBoatDocument(createdBoat.id!, doc)
          )
        );

        // Return boat with documents
        return {
          ...createdBoat,
          documents: createdDocuments,
        };
      }

      return createdBoat;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Updates a boat with document operations
   * @param boatData - Boat update data including document operations
   * @returns Promise with updated boat
   */
  public async updateBoatWithDocuments(
    boatData: UpdateBoatDTO
  ): Promise<BoatDTO> {
    try {
      const {
        documentsToAdd,
        documentsToUpdate,
        documentIdsToRemove,
        ...boatDataWithoutDocuments
      } = boatData;

      // Update boat first
      const updatedBoat = await this.updateBoat(boatDataWithoutDocuments);

      // Handle document operations in parallel
      const documentOperations: Promise<any>[] = [];

      // Add new documents
      if (documentsToAdd && documentsToAdd.length > 0) {
        documentOperations.push(
          ...documentsToAdd.map((doc) =>
            documentService.createBoatDocument(updatedBoat.id!, doc)
          )
        );
      }

      // Update existing documents
      if (documentsToUpdate && documentsToUpdate.length > 0) {
        documentOperations.push(
          ...documentsToUpdate.map((doc) =>
            documentService.updateBoatDocument(doc)
          )
        );
      }

      // Remove documents
      if (documentIdsToRemove && documentIdsToRemove.length > 0) {
        documentOperations.push(
          ...documentIdsToRemove.map((id) =>
            documentService.deleteBoatDocument(id)
          )
        );
      }

      // Wait for all document operations to complete
      if (documentOperations.length > 0) {
        await Promise.all(documentOperations);
      }

      // Fetch updated boat with documents
      return await this.getBoatWithDocuments(updatedBoat.id!);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Creates a vessel with optimized images and documents
   * @param vesselData - Vessel creation data
   * @returns Promise with created vessel
   */
  public async createVesselWithDocumentsAndImages(
    vesselData: CreateVesselDTO
  ): Promise<BoatDTO> {
    try {
      // Extract documents and images
      const { documents, images, ...vesselDataWithoutDocuments } = vesselData;

      // Create vessel first without images and documents
      const createdVessel = await this.post<BoatDTO>(
        "",
        vesselDataWithoutDocuments
      );

      // Handle images and documents in parallel
      const operations: Promise<any>[] = [];

      // Upload optimized images if provided
      if (images && images.length > 0) {
        const optimizedImages = images.map((imageDto, index) => ({
          imageData: imageDto.imageData,
          isPrimary: index === 0,
          displayOrder: index + 1,
        }));

        operations.push(
          this.uploadOptimizedImages(createdVessel.id!, optimizedImages)
        );
      }

      // Create documents if provided
      if (documents && documents.length > 0) {
        operations.push(
          ...documents.map((doc) =>
            documentService.createBoatDocument(createdVessel.id!, doc)
          )
        );
      }

      // Wait for all operations to complete
      if (operations.length > 0) {
        await Promise.all(operations);
      }

      // Return vessel with all data
      return await this.getBoatWithDocuments(createdVessel.id!);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Validates boat data including documents before creation/update
   * @param boatData - Boat data to validate
   * @returns Promise with validation result
   */
  public async validateBoatWithDocuments(
    boatData: Partial<CreateBoatDTO | UpdateBoatDTO>
  ): Promise<{
    isValid: boolean;
    errors: string[];
    documentErrors?: Array<{ document: any; errors: string[] }>;
  }> {
    try {
      // Validate basic boat data
      const boatValidation = await this.validateVesselData(boatData);
      const errors = [...boatValidation.errors];
      const documentErrors: Array<{ document: any; errors: string[] }> = [];

      // Validate documents if present
      if ("documents" in boatData && boatData.documents) {
        for (const doc of boatData.documents) {
          const docValidation = documentService.validateDocumentCreationData(
            doc as CreateBoatDocumentDTO,
            "boat"
          );
          if (!docValidation.isValid) {
            documentErrors.push({
              document: doc,
              errors: docValidation.errors.map((err) => err.message),
            });
          }
        }
      }

      // Validate documents to add if present (for updates)
      if ("documentsToAdd" in boatData && boatData.documentsToAdd) {
        for (const doc of boatData.documentsToAdd) {
          const docValidation = documentService.validateDocumentCreationData(
            doc as CreateBoatDocumentDTO,
            "boat"
          );
          if (!docValidation.isValid) {
            documentErrors.push({
              document: doc,
              errors: docValidation.errors.map((err) => err.message),
            });
          }
        }
      }

      const hasDocumentErrors = documentErrors.length > 0;
      const allErrors = hasDocumentErrors
        ? [...errors, "Some documents have validation errors"]
        : errors;

      return {
        isValid: boatValidation.isValid && !hasDocumentErrors,
        errors: allErrors,
        documentErrors: hasDocumentErrors ? documentErrors : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Validation service unavailable"],
      };
    }
  }

  /**
   * Gets boats by owner with documents included
   * @param ownerId - The owner ID
   * @returns Promise with boats including documents
   */
  public async getBoatsByOwnerWithDocuments(
    ownerId: number
  ): Promise<BoatDTO[]> {
    try {
      const boats = await this.getBoatsByOwner(ownerId);

      // Fetch documents for all boats in parallel
      const boatsWithDocuments = await Promise.all(
        boats.map(async (boat) => {
          try {
            const documents = await this.getBoatDocuments(boat.id!);
            return { ...boat, documents };
          } catch (error) {
            // If document fetching fails, return boat without documents
            console.warn(
              `Failed to fetch documents for boat ${boat.id}:`,
              error
            );
            return { ...boat, documents: [] };
          }
        })
      );

      return boatsWithDocuments;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gets vessels by owner with documents (alias for compatibility)
   * @param ownerId - The owner ID
   * @returns Promise with vessels including documents
   */
  public async getVesselsByOwnerWithDocuments(
    ownerId: number
  ): Promise<BoatDTO[]> {
    return this.getBoatsByOwnerWithDocuments(ownerId);
  }

  /**
   * Batch creates boat services with proper ServiceType handling
   * @param boatId - The boat ID
   * @param services - Array of service creation data
   * @returns Promise with created services
   */
  public async createBoatServicesWithPricing(
    boatId: number,
    services: Omit<CreateBoatServiceDTO, "boatId">[]
  ): Promise<BoatServiceDTO[]> {
    try {
      // Add boatId to each service and calculate pricing
      const servicesWithBoatId = services.map((service) => ({
        ...service,
        boatId,
        // Ensure quantity is set for food services
        quantity:
          service.serviceType === ServiceType.FOOD
            ? service.quantity || 1
            : service.quantity || 1,
      }));

      const createdServices = await this.createBoatServices(servicesWithBoatId);

      // Return services with calculated total prices
      return createdServices.map((service) => ({
        ...service,
        totalPrice:
          service.serviceType === ServiceType.FOOD
            ? service.price * service.quantity
            : service.price,
      }));
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Updates boat services with proper pricing calculation
   * @param services - Array of service update data
   * @returns Promise with updated services
   */
  public async updateBoatServicesWithPricing(
    services: UpdateBoatServiceDTO[]
  ): Promise<BoatServiceDTO[]> {
    try {
      const updatedServices = await Promise.all(
        services.map((service) => this.updateBoatService(service))
      );

      // Return services with calculated total prices
      return updatedServices.map((service) => ({
        ...service,
        totalPrice:
          service.serviceType === ServiceType.FOOD
            ? service.price * service.quantity
            : service.price,
      }));
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ==================== ADMIN-SPECIFIC METHODS ====================

  /**
   * Admin method to get all boats with additional metadata
   * @returns Promise with all boats including admin-specific data
   */
  public async getAllBoatsForAdmin(): Promise<BoatDTO[]> {
    try {
      return this.get<BoatDTO[]>("/admin/all");
    } catch (error) {
      // Fallback to regular getBoats if admin endpoint is not available
      return this.getBoats();
    }
  }

  /**
   * Admin method to approve a boat
   * @param boatId - The boat ID to approve
   * @param adminNote - Optional admin note
   * @returns Promise with updated boat
   */
  public async approveBoat(
    boatId: number,
    adminNote?: string
  ): Promise<BoatDTO> {
    try {
      return this.post<BoatDTO>(`/api/admin/boats/${boatId}/approve`, { 
        approved: true,
        adminNotes: adminNote || "Approved by admin"
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to reject a boat
   * @param boatId - The boat ID to reject
   * @param reason - Rejection reason
   * @param adminNote - Optional admin note
   * @returns Promise with updated boat
   */
  public async rejectBoat(
    boatId: number,
    reason: string,
    adminNote?: string
  ): Promise<BoatDTO> {
    try {
      return this.post<BoatDTO>(`/api/admin/boats/${boatId}/reject`, {
        approved: false,
        adminNotes: adminNote || reason
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to suspend a boat
   * @param boatId - The boat ID to suspend
   * @param reason - Suspension reason
   * @returns Promise with updated boat
   */
  public async suspendBoat(boatId: number, reason: string): Promise<BoatDTO> {
    try {
      return this.post<BoatDTO>(`/admin/${boatId}/suspend`, { reason });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to activate a suspended boat
   * @param boatId - The boat ID to activate
   * @returns Promise with updated boat
   */
  public async activateBoat(boatId: number): Promise<BoatDTO> {
    try {
      return this.post<BoatDTO>(`/admin/${boatId}/activate`, {});
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to get boat approval history
   * @param boatId - The boat ID
   * @returns Promise with approval history
   */
  public async getBoatApprovalHistory(boatId: number): Promise<any[]> {
    try {
      return this.get<any[]>(`/admin/${boatId}/approval-history`);
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /**
   * Admin method to add a note to a boat
   * @param boatId - The boat ID
   * @param note - The note content
   * @param type - The note type
   * @returns Promise with success status
   */
  public async addBoatNote(
    boatId: number,
    note: string,
    type: string = "info"
  ): Promise<void> {
    try {
      await this.post(`/admin/${boatId}/notes`, { note, type });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to get boat notes
   * @param boatId - The boat ID
   * @returns Promise with boat notes
   */
  public async getBoatNotes(boatId: number): Promise<any[]> {
    try {
      return this.get<any[]>(`/admin/${boatId}/notes`);
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /**
   * Admin method to bulk approve boats
   * @param boatIds - Array of boat IDs to approve
   * @param adminNote - Optional admin note
   * @returns Promise with operation result
   */
  public async bulkApproveBoats(
    boatIds: number[],
    adminNote?: string
  ): Promise<void> {
    try {
      await this.post("/admin/bulk-approve", { boatIds, adminNote });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to bulk reject boats
   * @param boatIds - Array of boat IDs to reject
   * @param reason - Rejection reason
   * @param adminNote - Optional admin note
   * @returns Promise with operation result
   */
  public async bulkRejectBoats(
    boatIds: number[],
    reason: string,
    adminNote?: string
  ): Promise<void> {
    try {
      await this.post("/admin/bulk-reject", { boatIds, reason, adminNote });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Admin method to get boat statistics for dashboard
   * @returns Promise with boat statistics
   */
  public async getAdminBoatStatistics(): Promise<{
    totalBoats: number;
    activeBoats: number;
    pendingBoats: number;
    rejectedBoats: number;
    suspendedBoats: number;
    newBoatsThisMonth: number;
    boatsByType: { [type: string]: number };
    boatsByLocation: { [location: string]: number };
  }> {
    try {
      return this.get("/admin/statistics");
    } catch (error) {
      this.handleError(error);
      // Return default statistics if endpoint is not available
      return {
        totalBoats: 0,
        activeBoats: 0,
        pendingBoats: 0,
        rejectedBoats: 0,
        suspendedBoats: 0,
        newBoatsThisMonth: 0,
        boatsByType: {},
        boatsByLocation: {},
      };
    }
  }

  /**
   * Get a random default boat image from the backend
   * @returns Promise with image blob
   */
  public async getDefaultImage(): Promise<Blob> {
    try {
      // Backend endpoint returns a random default boat image as byte array
      const response = await this.getPublic<ArrayBuffer>("/default-image", {
        responseType: "arraybuffer" as any
      });
      return new Blob([response], { type: "image/jpeg" });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get a default boat image URL (data URL format)
   * @returns Promise with data URL string
   */
  public async getDefaultImageUrl(): Promise<string> {
    try {
      const blob = await this.getDefaultImage();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export const boatService = new BoatService();
