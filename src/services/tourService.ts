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
    super("");
  }

  // ======= Tour CRUD Operations =======
  public async getTours(): Promise<TourDTO[]> {
    return this.get<TourDTO[]>("/tours");
  }

  public async getTourById(id: number): Promise<TourDTO> {
    return this.get<TourDTO>(`/tours/${id}`);
  }

  public async createTour(data: CreateTourDTO): Promise<TourDTO> {
   

    try {
      const result = await this.post<TourDTO>("/tours", data);
      return result;
    } catch (error) {
      console.error("TourService.createTour hatası:", error);
      throw error;
    }
  }

  public async updateTour(data: UpdateTourDTO): Promise<TourDTO> {
    return this.put<TourDTO>("/tours", data);
  }

  public async deleteTour(id: number): Promise<void> {
    return this.delete<void>(`/tours/${id}`);
  }

  public async updateTourStatus(id: number, status: string): Promise<void> {
    return this.patch<void>(`/tours/${id}/status?status=${status}`);
  }

  public async updateTourRating(id: number, rating: number): Promise<void> {
    return this.patch<void>(`/tours/${id}/rating?rating=${rating}`);
  }

  // ======= Tour Query Operations =======
  public async getToursByGuideId(guideId: number): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/tours/guide/${guideId}`);
  }

  public async searchToursByName(name: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(
      `/tours/search/name?name=${encodeURIComponent(name)}`
    );
  }

  public async searchToursByType(type: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/tours/search/type?type=${encodeURIComponent(type)}`);
  }

  public async getTourTypes(): Promise<string[]> {
    return this.get<string[]>(`/tours/types`);
  }

  public async searchToursByLocation(location: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(
      `/tours/search/location?location=${encodeURIComponent(location)}`
    );
  }

  public async searchToursByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(
      `/tours/search/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
  }

  public async searchToursByCapacity(minCapacity: number): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(
      `/tours/search/capacity?minCapacity=${minCapacity}`
    );
  }

  public async existsTourById(id: number): Promise<boolean> {
    return this.get<boolean>(`/tours/exists/${id}`);
  }

  // ======= Tour Date Operations =======
  public async getTourDateById(id: number): Promise<TourDateDTO> {
    try {
      const response = await this.api.get<TourDateDTO>(`/tour-dates/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getAllTourDates(): Promise<TourDateDTO[]> {
    return this.api.get<TourDateDTO[]>("/tour-dates").then((res) => res.data);
  }

  public async getTourDatesByTourId(tourId: number): Promise<TourDateDTO[]> {
    return this.api
      .get<TourDateDTO[]>(`/tour-dates/tour/${tourId}`)
      .then((res) => res.data);
  }

  public async getTourDatesByStatus(status: string): Promise<TourDateDTO[]> {
    return this.api
      .get<TourDateDTO[]>(`/tour-dates/status?status=${status}`)
      .then((res) => res.data);
  }

  public async getTourDatesByTourIdAndStatus(
    tourId: number,
    status: string
  ): Promise<TourDateDTO[]> {
    return this.api
      .get<TourDateDTO[]>(`/tour-dates/tour/${tourId}/status?status=${status}`)
      .then((res) => res.data);
  }

  public async getTourDatesByStartDate(
    startDate: string
  ): Promise<TourDateDTO[]> {
    return this.api
      .get<TourDateDTO[]>(
        `/tour-dates/search/start-date?startDate=${startDate}`
      )
      .then((res) => res.data);
  }

  // endDate ve date-range tabanlı tour date endpoint'leri backend'de kaldırıldı

  public async existsTourDateById(id: number): Promise<boolean> {
    return this.api
      .get<boolean>(`/tour-dates/exists/${id}`)
      .then((res) => res.data);
  }

  public async getOverlappingTourDates(
    tourId: number,
    start: string,
    end: string
  ): Promise<TourDateDTO[]> {
    const params = new URLSearchParams({ start, end });
    return this.api
      .get<TourDateDTO[]>(`/tour-dates/tour/${tourId}/overlapping?${params.toString()}`)
      .then((res) => res.data);
  }

  // ======= Tour Date Command Operations =======
  public async createTourDate(data: CreateTourDateDTO): Promise<TourDateDTO> {
    return this.api
      .post<TourDateDTO>("/tour-dates", data)
      .then((res) => res.data);
  }

  public async createTourDatesBatch(
    tourId: number,
    tourDates: CreateTourDateDTO[]
  ): Promise<TourDateDTO[]> {
    return this.api
      .post<TourDateDTO[]>(`/tour-dates/tour/${tourId}/batch`, tourDates)
      .then((res) => res.data);
  }

  public async updateTourDate(data: UpdateTourDateDTO): Promise<TourDateDTO> {
    return this.api
      .put<TourDateDTO>("/tour-dates", data)
      .then((res) => res.data);
  }

  public async deleteTourDate(id: number): Promise<void> {
    return this.api.delete<void>(`/tour-dates/${id}`).then((res) => res.data);
  }

  public async deleteTourDatesByTourId(tourId: number): Promise<void> {
    return this.api
      .delete<void>(`/tour-dates/tour/${tourId}`)
      .then((res) => res.data);
  }

  public async updateTourDateAvailabilityStatus(
    id: number,
    status: string
  ): Promise<void> {
    return this.api
      .patch<void>(`/tour-dates/${id}/status?status=${status}`)
      .then((res) => res.data);
  }

  // tarih aralığı güncelleme endpoint'i backend'de kaldırıldı

  public async updateTourDateMaxGuests(
    id: number,
    maxGuests: number
  ): Promise<void> {
    return this.api
      .patch<void>(`/tour-dates/${id}/max-guests?maxGuests=${maxGuests}`)
      .then((res) => res.data);
  }

  // ======= Tour Image Operations =======
  public async getTourImageById(id: number): Promise<TourImageDTO> {
    return this.api
      .get<TourImageDTO>(`/tour-images/${id}`)
      .then((res) => res.data);
  }

  public async getAllTourImages(): Promise<TourImageDTO[]> {
    return this.api.get<TourImageDTO[]>("/tour-images").then((res) => res.data);
  }

  public async getTourImagesByTourId(tourId: number): Promise<TourImageDTO[]> {
    return this.api
      .get<TourImageDTO[]>(`/tour-images/tour/${tourId}`)
      .then((res) => res.data);
  }

  public async getTourImagesByTourIdOrdered(
    tourId: number
  ): Promise<TourImageDTO[]> {
    return this.api
      .get<TourImageDTO[]>(`/tour-images/tour/${tourId}/ordered`)
      .then((res) => res.data);
  }

  public async existsTourImageById(id: number): Promise<boolean> {
    return this.api
      .get<boolean>(`/tour-images/exists/${id}`)
      .then((res) => res.data);
  }

  // ======= Tour Image Command Operations =======
  public async createTourImage(
    data: CreateTourImageDTO
  ): Promise<TourImageDTO> {
    return this.api
      .post<TourImageDTO>("/tour-images", data)
      .then((res) => res.data);
  }

  public async createTourImagesBatch(
    tourId: number,
    tourImages: CreateTourImageDTO[]
  ): Promise<TourImageDTO[]> {
    return this.api
      .post<TourImageDTO[]>(`/tour-images/tour/${tourId}/batch`, tourImages)
      .then((res) => res.data);
  }

  public async updateTourImage(
    data: UpdateTourImageDTO
  ): Promise<TourImageDTO> {
    return this.api
      .put<TourImageDTO>("/tour-images", data)
      .then((res) => res.data);
  }

  public async deleteTourImage(id: number): Promise<void> {
    return this.api.delete<void>(`/tour-images/${id}`).then((res) => res.data);
  }

  public async deleteTourImagesByTourId(tourId: number): Promise<void> {
    return this.api
      .delete<void>(`/tour-images/tour/${tourId}`)
      .then((res) => res.data);
  }

  public async updateTourImageDisplayOrder(
    id: number,
    displayOrder: number
  ): Promise<void> {
    return this.api
      .patch<void>(
        `/tour-images/${id}/display-order?displayOrder=${displayOrder}`
      )
      .then((res) => res.data);
  }

  // ======= Helper Methods =======
  public async searchTours(params: {
    name?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
  }): Promise<TourDTO[]> {
    let results: TourDTO[] = [];

    if (params.name) {
      results = await this.searchToursByName(params.name);
    } else if (params.location) {
      results = await this.searchToursByLocation(params.location);
    } else if (params.minPrice && params.maxPrice) {
      results = await this.searchToursByPriceRange(
        params.minPrice,
        params.maxPrice
      );
    } else if (params.minCapacity) {
      results = await this.searchToursByCapacity(params.minCapacity);
    } else {
      results = await this.getTours();
    }

    return results;
  }

  // Backward compatibility methods
  public async getToursByLocation(location: string): Promise<TourDTO[]> {
    return this.searchToursByLocation(location);
  }

  public async getToursByGuide(guideId: number): Promise<TourDTO[]> {
    return this.getToursByGuideId(guideId);
  }

  // getToursByBoat kaldırıldı; boat ile ilişki yok

  public async getTourDates(tourId: number): Promise<TourDateDTO[]> {
    return this.getTourDatesByTourId(tourId);
  }

  public async getTourImages(tourId: number): Promise<TourImageDTO[]> {
    return this.getTourImagesByTourIdOrdered(tourId);
  }

  // deleteToursByBoatId kaldırıldı; boat ile ilişki yok

  public async deleteToursByGuideId(guideId: number): Promise<void> {
    return this.delete<void>(`/tours/guide/${guideId}`);
  }
}

export const tourService = new TourService();
