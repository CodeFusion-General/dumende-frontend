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

  public async getBoats(filters?: BoatFilters): Promise<BoatDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<BoatDTO[]>(`?${queryString}`);
  }

  public async getBoatById(id: number): Promise<BoatDTO> {
    return this.get<BoatDTO>(`/${id}`);
  }

  public async createBoat(data: CreateBoatDTO): Promise<BoatDTO> {
    return this.post<BoatDTO>("", data);
  }

  public async updateBoat(id: number, data: UpdateBoatDTO): Promise<BoatDTO> {
    return this.put<BoatDTO>(`/${id}`, data);
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
    location?: string;
    minCapacity?: number;
    maxPrice?: number;
    type?: string;
    features?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<BoatDTO[]> {
    const queryString = this.buildQueryString(params);
    return this.get<BoatDTO[]>(`/search?${queryString}`);
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
}

export const boatService = new BoatService();
