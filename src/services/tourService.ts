import { BaseService } from "./base/BaseService";
import {
  TourDTO,
  CreateTourDTO,
  UpdateTourDTO,
  TourFilters,
  TourStatus,
  TourDateDTO,
  CreateTourDateDTO,
  UpdateTourDateDTO,
  TourImageDTO,
  CreateTourImageDTO,
  UpdateTourImageDTO,
  TourAvailabilityStatus,
} from "@/types/tour.types";

class TourService extends BaseService {
  constructor() {
    super("/tours");
  }

  public async getTours(filters?: TourFilters): Promise<TourDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<TourDTO[]>(`?${queryString}`);
  }

  public async getTourById(id: number): Promise<TourDTO> {
    return this.get<TourDTO>(`/${id}`);
  }

  public async createTour(data: CreateTourDTO): Promise<TourDTO> {
    return this.post<TourDTO>("", data);
  }

  public async updateTour(data: UpdateTourDTO): Promise<TourDTO> {
    return this.put<TourDTO>(`/${data.id}`, data);
  }

  public async deleteTour(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  public async updateTourStatus(
    id: number,
    status: TourStatus
  ): Promise<TourDTO> {
    return this.patch<TourDTO>(`/${id}/status`, { status });
  }

  // Tour Date Management
  public async getTourDates(tourId: number): Promise<TourDateDTO[]> {
    return this.get<TourDateDTO[]>(`/${tourId}/dates`);
  }

  public async createTourDate(data: CreateTourDateDTO): Promise<TourDateDTO> {
    return this.post<TourDateDTO>("/dates", data);
  }

  public async updateTourDate(data: UpdateTourDateDTO): Promise<TourDateDTO> {
    return this.put<TourDateDTO>(`/dates/${data.id}`, data);
  }

  public async deleteTourDate(id: number): Promise<void> {
    return this.delete<void>(`/dates/${id}`);
  }

  public async updateTourDateAvailability(
    dateId: number,
    status: TourAvailabilityStatus
  ): Promise<TourDateDTO> {
    return this.patch<TourDateDTO>(`/dates/${dateId}/availability`, {
      availabilityStatus: status,
    });
  }

  // Tour Image Management
  public async getTourImages(tourId: number): Promise<TourImageDTO[]> {
    return this.get<TourImageDTO[]>(`/${tourId}/images`);
  }

  public async uploadTourImage(
    tourId: number,
    file: File,
    displayOrder = 1
  ): Promise<TourImageDTO> {
    return this.uploadFile<TourImageDTO>(`/${tourId}/images`, file, {
      displayOrder,
    });
  }

  public async updateTourImage(
    data: UpdateTourImageDTO
  ): Promise<TourImageDTO> {
    return this.put<TourImageDTO>(`/images/${data.id}`, data);
  }

  public async deleteTourImage(id: number): Promise<void> {
    return this.delete<void>(`/images/${id}`);
  }

  // Availability and Booking
  public async getTourAvailability(
    id: number,
    date: string
  ): Promise<{
    available: boolean;
    availableSpots: number;
    maxGuests: number;
    status: TourAvailabilityStatus;
  }> {
    return this.get(`/${id}/availability`, { date });
  }

  public async getAvailableTourDates(
    tourId: number,
    month?: string
  ): Promise<TourDateDTO[]> {
    const params = month ? { month } : {};
    return this.get<TourDateDTO[]>(`/${tourId}/available-dates`, params);
  }

  // Related queries
  public async getToursByBoat(boatId: number): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/boat/${boatId}`);
  }

  public async getToursByGuide(guideId: number): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/guide/${guideId}`);
  }

  public async getToursByLocation(location: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/location/${encodeURIComponent(location)}`);
  }

  // Search and Filter
  public async searchTours(params: {
    name?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
    capacity?: number;
    guideId?: number;
    boatId?: number;
  }): Promise<TourDTO[]> {
    const queryString = this.buildQueryString(params);
    return this.get<TourDTO[]>(`/search?${queryString}`);
  }

  public async getPopularTours(limit = 10): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/popular?limit=${limit}`);
  }

  public async getFeaturedTours(limit = 5): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/featured?limit=${limit}`);
  }

  // Pricing
  public async calculateTourPrice(
    tourId: number,
    data: {
      startDate: string;
      endDate?: string;
      passengerCount: number;
    }
  ): Promise<{
    basePrice: number;
    totalPrice: number;
    breakdown: {
      perPerson: number;
      persons: number;
      seasonMultiplier: number;
      taxes: number;
      fees: number;
    };
  }> {
    return this.post(`/${tourId}/calculate-price`, data);
  }

  // Pagination support
  public async getToursPaginated(
    filters?: TourFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) {
    return this.getPaginated<TourDTO>("/paginated", filters);
  }

  // Statistics
  public async getTourStatistics(tourId?: number): Promise<{
    totalTours: number;
    activeTours: number;
    averageRating: number;
    totalBookings: number;
    totalRevenue: number;
    popularLocations: string[];
    bookingRate: number;
    seasonalData: Array<{ month: string; bookings: number; revenue: number }>;
  }> {
    const url = tourId ? `/statistics/${tourId}` : "/statistics";
    return this.get(url);
  }
}

export const tourService = new TourService();
