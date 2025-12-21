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
import {
  TourDocumentDTO,
  CreateTourDocumentDTO,
  UpdateTourDocumentDTO,
} from "@/types/document.types";
import { documentService } from "./documentService";
import { compressImage, validateImageFile } from "@/lib/imageUtils";

class TourService extends BaseService {
  constructor() {
    super("/tours");
  }

  // ======= Tour CRUD Operations =======
  public async getTours(): Promise<TourDTO[]> {
    return this.get<TourDTO[]>("");
  }

  public async getTourById(id: number): Promise<TourDTO> {
    const tour = await this.get<TourDTO>(`/${id}`);

    // Fetch tour documents during tour loading
    try {
      tour.tourDocuments = await documentService.getTourDocuments(id);
    } catch (error) {
      console.warn(`Failed to load documents for tour ${id}:`, error);
      tour.tourDocuments = [];
    }

    return tour;
  }

  public async getTourWithDocuments(id: number): Promise<TourDTO> {
    return this.getTourById(id);
  }

  public async createTour(data: CreateTourDTO): Promise<TourDTO> {
    try {
      // Create the tour first
      const result = await this.post<TourDTO>("", data);

      // If tour documents are provided, create them
      if (data.tourDocuments && data.tourDocuments.length > 0) {
        try {
          const createdDocuments =
            await documentService.createTourDocumentsBatch(
              result.id,
              data.tourDocuments
            );
          result.tourDocuments = createdDocuments;
        } catch (documentError) {
          console.warn(
            `Failed to create documents for tour ${result.id}:`,
            documentError
          );
          result.tourDocuments = [];
        }
      }

      return result;
    } catch (error) {
      console.error("TourService.createTour hatası:", error);
      throw error;
    }
  }

  public async updateTour(data: UpdateTourDTO): Promise<TourDTO> {
    try {
      // Update the tour first
      const result = await this.put<TourDTO>("", data);

      // Handle document operations if provided
      if (data.tourDocumentsToAdd && data.tourDocumentsToAdd.length > 0) {
        try {
          const createdDocuments =
            await documentService.createTourDocumentsBatch(
              result.id,
              data.tourDocumentsToAdd
            );
          result.tourDocuments = [
            ...(result.tourDocuments || []),
            ...createdDocuments,
          ];
        } catch (documentError) {
          console.warn(
            `Failed to create new documents for tour ${result.id}:`,
            documentError
          );
        }
      }

      if (data.tourDocumentsToUpdate && data.tourDocumentsToUpdate.length > 0) {
        try {
          for (const docUpdate of data.tourDocumentsToUpdate) {
            await documentService.updateTourDocument(docUpdate);
          }
        } catch (documentError) {
          console.warn(
            `Failed to update documents for tour ${result.id}:`,
            documentError
          );
        }
      }

      if (
        data.tourDocumentIdsToRemove &&
        data.tourDocumentIdsToRemove.length > 0
      ) {
        try {
          for (const docId of data.tourDocumentIdsToRemove) {
            await documentService.deleteTourDocument(docId);
          }
          // Filter out removed documents from result
          if (result.tourDocuments) {
            result.tourDocuments = result.tourDocuments.filter(
              (doc) => !data.tourDocumentIdsToRemove!.includes(doc.id)
            );
          }
        } catch (documentError) {
          console.warn(
            `Failed to delete documents for tour ${result.id}:`,
            documentError
          );
        }
      }

      return result;
    } catch (error) {
      console.error("TourService.updateTour hatası:", error);
      throw error;
    }
  }

  public async deleteTour(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  public async updateTourStatus(id: number, status: string): Promise<void> {
    return this.patch<void>(`/${id}/status?status=${status}`);
  }

  public async updateTourRating(id: number, rating: number): Promise<void> {
    return this.patch<void>(`/${id}/rating?rating=${rating}`);
  }

  // ======= Tour Query Operations =======
  public async getToursByGuideId(guideId: number): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/guide/${guideId}`);
  }

  public async searchToursByName(name: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/search/name?name=${encodeURIComponent(name)}`);
  }

  public async searchToursByType(type: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/search/type?type=${encodeURIComponent(type)}`);
  }

  public async getTourTypes(): Promise<string[]> {
    return this.get<string[]>(`/types`);
  }

  public async searchToursByLocation(location: string): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(
      `/search/location?location=${encodeURIComponent(location)}`
    );
  }

  public async searchToursByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(
      `/search/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
  }

  public async searchToursByCapacity(minCapacity: number): Promise<TourDTO[]> {
    return this.get<TourDTO[]>(`/search/capacity?minCapacity=${minCapacity}`);
  }

  public async existsTourById(id: number): Promise<boolean> {
    return this.get<boolean>(`/exists/${id}`);
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
      .get<TourDateDTO[]>(
        `/tour-dates/tour/${tourId}/overlapping?${params.toString()}`
      )
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

  /**
   * Optimized base64 image upload to CloudFlare Images.
   * Frontend'den compress edilmiş görselleri base64 formatında backend'e gönderir.
   */
  public async uploadOptimizedImages(
    tourId: number,
    images: Array<{
      imageData: string;
      displayOrder: number;
    }>
  ): Promise<TourImageDTO[]> {
    try {
      const response = await this.api.post<TourImageDTO[]>(
        `/tour-images/tour/${tourId}/batch-from-base64`,
        images
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Compress and upload images to CloudFlare Images.
   * Dosyaları otomatik olarak optimize eder ve backend'e base64 olarak gönderir.
   */
  public async compressAndUploadImages(
    tourId: number,
    files: FileList | File[]
  ): Promise<TourImageDTO[]> {
    const compressedImages: Array<{
      imageData: string;
      displayOrder: number;
    }> = [];

    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

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
          displayOrder: i + 1,
        });
      } catch (error) {
        console.error(`${file.name} compress edilemedi:`, error);
        throw new Error(`Resim işlenemedi: ${file.name}`);
      }
    }

    // Compress edilmiş resimleri backend'e gönder
    return this.uploadOptimizedImages(tourId, compressedImages);
  }

  // ======= Tour Document Operations =======
  public async getTourDocuments(tourId: number): Promise<TourDocumentDTO[]> {
    try {
      return await documentService.getTourDocuments(tourId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getTourDocument(documentId: number): Promise<TourDocumentDTO> {
    try {
      return await documentService.getTourDocument(documentId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async createTourDocument(
    tourId: number,
    data: CreateTourDocumentDTO
  ): Promise<TourDocumentDTO> {
    try {
      return await documentService.createTourDocument(tourId, data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async createTourDocumentsBatch(
    tourId: number,
    documents: CreateTourDocumentDTO[]
  ): Promise<TourDocumentDTO[]> {
    try {
      return await documentService.createTourDocumentsBatch(tourId, documents);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateTourDocument(
    data: UpdateTourDocumentDTO
  ): Promise<TourDocumentDTO> {
    try {
      return await documentService.updateTourDocument(data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async deleteTourDocument(documentId: number): Promise<void> {
    try {
      return await documentService.deleteTourDocument(documentId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateTourDocumentDisplayOrder(
    documentId: number,
    displayOrder: number
  ): Promise<void> {
    try {
      return await documentService.updateTourDocumentDisplayOrder(
        documentId,
        displayOrder
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateTourDocumentsDisplayOrder(
    updates: Array<{ id: number; displayOrder: number }>
  ): Promise<void> {
    try {
      return await documentService.updateTourDocumentsDisplayOrder(updates);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async checkTourDocumentExists(documentId: number): Promise<boolean> {
    try {
      return await documentService.checkTourDocumentExists(documentId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
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

  // ======= Paginated Search Method =======
  // TODO: Backend'de /api/tours/search/advanced endpoint'i mevcut değil.
  // Bu method şimdilik client-side pagination ile çalışacak şekilde düzenlendi.
  // Backend'e bu endpoint eklendiğinde gerçek API çağrısına dönülmeli.
  public async advancedSearchPaginated(
    filters: {
      name?: string;
      location?: string;
      type?: string;
      minPrice?: number;
      maxPrice?: number;
      minCapacity?: number;
    },
    pagination: {
      page: number;
      size: number;
      sort?: string;
    }
  ): Promise<{
    content: TourDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    // Backend'de advanced search endpoint'i olmadığı için
    // mevcut endpoint'leri kullanarak client-side filtreleme yapıyoruz
    let allTours: TourDTO[] = [];

    try {
      if (filters.name) {
        allTours = await this.searchToursByName(filters.name);
      } else if (filters.location) {
        allTours = await this.searchToursByLocation(filters.location);
      } else if (filters.type) {
        allTours = await this.searchToursByType(filters.type);
      } else if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        allTours = await this.searchToursByPriceRange(filters.minPrice, filters.maxPrice);
      } else if (filters.minCapacity !== undefined) {
        allTours = await this.searchToursByCapacity(filters.minCapacity);
      } else {
        allTours = await this.getTours();
      }
    } catch {
      console.warn('[TourService] Advanced search fallback: fetching all tours');
      allTours = await this.getTours();
    }

    // Client-side pagination
    const startIndex = pagination.page * pagination.size;
    const endIndex = startIndex + pagination.size;
    const paginatedContent = allTours.slice(startIndex, endIndex);

    return {
      content: paginatedContent,
      totalElements: allTours.length,
      totalPages: Math.ceil(allTours.length / pagination.size),
      size: pagination.size,
      number: pagination.page,
    };
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
    return this.delete<void>(`/guide/${guideId}`);
  }
}

export const tourService = new TourService();
