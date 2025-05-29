import { BaseService } from "./base/BaseService";
import {
  BoatDTO,
  CreateBoatDTO,
  UpdateBoatDTO,
  BoatFilters,
  AvailabilityDTO,
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
} from "@/types/boat.types";

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
}

export const boatService = new BoatService();
