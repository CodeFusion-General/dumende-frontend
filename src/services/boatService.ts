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
    return this.get<boolean>(`/${id}/availability`, { startDate, endDate });
  }

  public async getBoatAvailabilities(
    boatId: number
  ): Promise<AvailabilityDTO[]> {
    return this.get<AvailabilityDTO[]>(`/${boatId}/availabilities`);
  }

  public async createAvailability(
    data: CreateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return this.post<AvailabilityDTO>("/availabilities", data);
  }

  public async updateAvailability(
    data: UpdateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return this.put<AvailabilityDTO>(`/availabilities/${data.id}`, data);
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
    return this.uploadFile<BoatDTO>(`/${boatId}/images`, file, {
      isPrimary,
      displayOrder,
    });
  }

  public async deleteBoatImage(boatId: number, imageId: number): Promise<void> {
    return this.delete<void>(`/${boatId}/images/${imageId}`);
  }

  // Feature Management
  public async addBoatFeature(
    boatId: number,
    featureName: string
  ): Promise<BoatDTO> {
    return this.post<BoatDTO>(`/${boatId}/features`, { featureName });
  }

  public async removeBoatFeature(
    boatId: number,
    featureId: number
  ): Promise<void> {
    return this.delete<void>(`/${boatId}/features/${featureId}`);
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
    if (params.minCapacity) queryParams.append("minCapacity", params.minCapacity.toString());
    if (params.type) queryParams.append("type", params.type);
    if (params.minPrice) queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    return this.get<BoatDTO[]>(`/search?${queryParams.toString()}`);
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
