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
} from "@/types/boat.types";
import { compressImage, validateImageFile } from "@/lib/imageUtils";

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
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  captainIncluded?: boolean;
  minYear?: number;
  maxYear?: number;
  minLength?: number;
  maxLength?: number;
}

class BoatService extends BaseService {
  constructor() {
    super("/boats");
  }

  public async getBoats(): Promise<BoatDTO[]> {
    return this.get<BoatDTO[]>("");
  }

  public async getBoatById(id: number): Promise<BoatDTO> {
    return this.get<BoatDTO>(`/${id}`);
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
    return this.get<boolean>(`/availabilities/boat/${id}/available-range`, {
      startDate,
      endDate,
    });
  }

  public async getBoatAvailabilities(
    boatId: number
  ): Promise<AvailabilityDTO[]> {
    return this.get<AvailabilityDTO[]>(`/availabilities/boat/${boatId}`);
  }

  public async createAvailability(
    data: CreateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return this.post<AvailabilityDTO>("/availabilities", data);
  }

  public async updateAvailability(
    data: UpdateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return this.put<AvailabilityDTO>(`/availabilities`, data);
  }

  public async deleteAvailability(id: number): Promise<void> {
    return this.delete<void>(`/availabilities/${id}`);
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

  // Search and Filter
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

    return this.get<BoatDTO[]>(`/search?${queryParams.toString()}`);
  }

  // *** YENİ API'LER - Backend Entegrasyonu ***

  // Lokasyonlar
  public async getAllLocations(): Promise<string[]> {
    console.log("🚀 BoatService: Lokasyonlar getiriliyor...");
    return this.get<string[]>("/locations");
  }

  // İstatistikler
  public async getLocationStatistics(): Promise<LocationStatistic[]> {
    console.log("🚀 BoatService: Lokasyon istatistikleri getiriliyor...");
    return this.get<LocationStatistic[]>("/statistics/by-location");
  }

  public async getTypeStatistics(): Promise<TypeStatistic[]> {
    console.log("🚀 BoatService: Tip istatistikleri getiriliyor...");
    return this.get<TypeStatistic[]>("/statistics/by-type");
  }

  public async countBoatsByLocation(location: string): Promise<number> {
    return this.get<number>(`/count/location/${encodeURIComponent(location)}`);
  }

  public async countBoatsByType(type: string): Promise<number> {
    return this.get<number>(`/count/type/${encodeURIComponent(type)}`);
  }

  // Gelişmiş arama
  public async advancedSearch(
    searchRequest: AdvancedSearchRequest
  ): Promise<BoatDTO[]> {
    console.log("🚀 BoatService: Gelişmiş arama yapılıyor...", searchRequest);
    return this.post<BoatDTO[]>("/search/advanced", searchRequest);
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
    console.log(`🚀 BoatService: Owner ${ownerId} tekneleri getiriliyor...`);
    return this.get<BoatDTO[]>(`/owner/${ownerId}`);
  }

  public async createVessel(vesselData: CreateVesselDTO): Promise<BoatDTO> {
    console.log("🚀 BoatService: Yeni tekne oluşturuluyor...", vesselData);
    return this.post<BoatDTO>("", vesselData);
  }

  public async updateVessel(vesselData: UpdateVesselDTO): Promise<BoatDTO> {
    console.log("🚀 BoatService: Tekne güncelleniyor...", vesselData);
    return this.put<BoatDTO>("", vesselData);
  }

  public async deleteVessel(id: number): Promise<void> {
    console.log(`🚀 BoatService: Tekne ${id} siliniyor...`);
    return this.delete<void>(`/${id}`);
  }

  public async updateVesselStatus(id: number, status: string): Promise<void> {
    console.log(
      `🚀 BoatService: Tekne ${id} durumu "${status}" olarak güncelleniyor...`
    );
    return this.patch<void>(
      `/${id}/status?status=${encodeURIComponent(status)}`
    );
  }

  // Tekne fotoğrafları yönetimi
  public async uploadVesselImages(
    boatId: number,
    files: FileList
  ): Promise<BoatDTO> {
    console.log(
      `🚀 BoatService: Tekne ${boatId} için ${files.length} fotoğraf yükleniyor...`
    );

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
    console.log(`🚀 BoatService: Fotoğraf ${imageId} siliniyor...`);
    try {
      const response = await this.api.delete(`/boat-images/${imageId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Tekne özelliklerini toplu güncelleme
  public async updateVesselFeatures(
    boatId: number,
    features: string[]
  ): Promise<BoatDTO> {
    console.log(
      `🚀 BoatService: Tekne ${boatId} özellikleri güncelleniyor...`,
      features
    );
    try {
      const response = await this.api.post(
        `/boat-features/boat/${boatId}/bulk`,
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
    console.log("🚀 BoatService: Tekne verisi doğrulanıyor...", vesselData);
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
    console.log(
      "🚀 BoatService: Optimize edilmiş resimlerle tekne oluşturuluyor...",
      vesselData
    );

    // Önce resimler olmadan tekneyi oluştur
    const vesselDataWithoutImages = { ...vesselData, images: [] };
    const createdVessel = await this.post<BoatDTO>("", vesselDataWithoutImages);

    // Eğer resim varsa, compress edip ayrı ayrı yükle
    if (vesselData.images && vesselData.images.length > 0) {
      console.log(`📷 ${vesselData.images.length} resim optimize ediliyor...`);

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
    console.log(
      `🚀 BoatService: Boat ${boatId} için ${images.length} optimize resim yükleniyor...`
    );

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
    console.log(
      `🚀 BoatService: ${files.length} dosya compress edilip yükleniyor...`
    );

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

        console.log(
          `📷 ${file.name} compress edildi (${(file.size / 1024).toFixed(0)}KB)`
        );
      } catch (error) {
        console.error(`❌ ${file.name} compress edilemedi:`, error);
        throw new Error(`Resim işlenemedi: ${file.name}`);
      }
    }

    // Optimize edilmiş resimleri yükle
    await this.uploadOptimizedImages(boatId, compressedImages);

    // Güncellenmiş tekne bilgilerini getir
    return this.getBoatById(boatId);
  }
}

export const boatService = new BoatService();
