import { BaseService } from "./base/BaseService";
import {
  ReviewDTO,
  CreateReviewCommand,
  UpdateReviewCommand,
  ReviewQuery,
  ReviewFilters,
} from "@/types/review.types";

class ReviewService extends BaseService {
  constructor() {
    super("/reviews");
  }

  public async getReviews(filters?: ReviewFilters): Promise<ReviewDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<ReviewDTO[]>(`?${queryString}`);
  }

  public async getReviewById(id: number): Promise<ReviewDTO> {
    return this.get<ReviewDTO>(`/${id}`);
  }

  public async getReviewsByQuery(query: ReviewQuery): Promise<ReviewDTO[]> {
    return this.post<ReviewDTO[]>("/query", query);
  }

  public async createReview(data: CreateReviewCommand): Promise<ReviewDTO> {
    return this.post<ReviewDTO>("", data);
  }

  public async updateReview(data: UpdateReviewCommand): Promise<ReviewDTO> {
    return this.put<ReviewDTO>(`/${data.reviewId}`, data);
  }

  public async deleteReview(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  // Boat Reviews
  public async getBoatReviews(boatId: number): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/boat/${boatId}`);
  }

  public async getBoatRating(boatId: number): Promise<number> {
    return this.get(`/boat/${boatId}/average-rating`);
  }

  // Tour Reviews
  public async getTourReviews(tourId: number): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/tour/${tourId}`);
  }

  public async getTourRating(tourId: number): Promise<number> {
    return this.get(`/tour/${tourId}/average-rating`);
  }

  // Customer Reviews
  public async getCustomerReviews(customerId: number): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/customer/${customerId}`);
  }

  // Booking Reviews
  public async getBookingReview(bookingId: number): Promise<ReviewDTO | null> {
    try {
      return await this.get<ReviewDTO>(`/booking/${bookingId}`);
    } catch (error) {
      // Review may not exist for this booking
      return null;
    }
  }

  // Pagination support
  public async getReviewsPaginated(
    filters?: ReviewFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) {
    return this.getPaginated<ReviewDTO>("/paginated", filters);
  }

  // Statistics - Removed non-existent endpoint
  // Use individual methods like getAverageRatingByBoatId, getReviewCountByBoatId etc. instead

  // Public methods for helper services access
  public async getAverageRatingByBoatId(boatId: number): Promise<number> {
    return this.get<number>(`/boat/${boatId}/average-rating`);
  }

  public async getAverageRatingByTourId(tourId: number): Promise<number> {
    return this.get<number>(`/tour/${tourId}/average-rating`);
  }

  public async getReviewCountByBoatId(boatId: number): Promise<number> {
    return this.get<number>(`/boat/${boatId}/count`);
  }

  public async getReviewCountByTourId(tourId: number): Promise<number> {
    return this.get<number>(`/tour/${tourId}/count`);
  }

  public async getReviewsByMinRating(minRating: number): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/rating/${minRating}`);
  }

  public async deleteReviewsByBoatId(boatId: number): Promise<void> {
    return this.delete<void>(`/boat/${boatId}`);
  }

  public async deleteReviewsByTourId(tourId: number): Promise<void> {
    return this.delete<void>(`/tour/${tourId}`);
  }

  // PAGINATION ENDPOINTS
  public async getBoatReviewsPaginated(
    boatId: number,
    params?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ) {
    const queryString = params ? this.buildQueryString(params) : "";
    return this.getPaginated<ReviewDTO>(`/boat/${boatId}/paginated?${queryString}`);
  }

  public async getTourReviewsPaginated(
    tourId: number,
    params?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ) {
    const queryString = params ? this.buildQueryString(params) : "";
    return this.getPaginated<ReviewDTO>(`/tour/${tourId}/paginated?${queryString}`);
  }

  // RATING DISTRIBUTION ENDPOINTS
  public async getBoatRatingDistribution(boatId: number): Promise<Record<number, number>> {
    return this.get<Record<number, number>>(`/boat/${boatId}/rating-distribution`);
  }

  public async getTourRatingDistribution(tourId: number): Promise<Record<number, number>> {
    return this.get<Record<number, number>>(`/tour/${tourId}/rating-distribution`);
  }

  // TREND ANALYSIS ENDPOINTS
  public async getBoatRatingTrends(
    boatId: number,
    period: string = "monthly"
  ): Promise<Array<{
    period: string;
    averageRating: number;
    reviewCount: number;
    periodStart: string;
    periodEnd: string;
  }>> {
    return this.get(`/boat/${boatId}/trends?period=${period}`);
  }

  public async getTourRatingTrends(
    tourId: number,
    period: string = "monthly"
  ): Promise<Array<{
    period: string;
    averageRating: number;
    reviewCount: number;
    periodStart: string;
    periodEnd: string;
  }>> {
    return this.get(`/tour/${tourId}/trends?period=${period}`);
  }

  // SUMMARY STATISTICS ENDPOINTS
  public async getBoatReviewSummary(boatId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    recentTrend: string;
    lastReviewDate?: string;
    previousMonthAverage?: number;
    previousMonthCount?: number;
  }> {
    return this.get(`/boat/${boatId}/summary`);
  }

  public async getTourReviewSummary(tourId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    recentTrend: string;
    lastReviewDate?: string;
    previousMonthAverage?: number;
    previousMonthCount?: number;
  }> {
    return this.get(`/tour/${tourId}/summary`);
  }

  // RECENT ACTIVITIES ENDPOINTS
  public async getRecentReviews(limit: number = 10): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/recent?limit=${limit}`);
  }

  public async getRecentBoatReviews(boatId: number, limit: number = 5): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/boat/${boatId}/recent?limit=${limit}`);
  }

  public async getRecentTourReviews(tourId: number, limit: number = 5): Promise<ReviewDTO[]> {
    return this.get<ReviewDTO[]>(`/tour/${tourId}/recent?limit=${limit}`);
  }

  // ADVANCED FILTERING ENDPOINTS
  public async getFilteredBoatReviews(
    boatId: number,
    filters?: {
      minRating?: number;
      maxRating?: number;
      dateFrom?: string;
      dateTo?: string;
      keyword?: string;
      sortBy?: string;
      sortDirection?: string;
      page?: number;
      size?: number;
    }
  ) {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.getPaginated<ReviewDTO>(`/boat/${boatId}/filtered?${queryString}`);
  }

  public async searchReviews(
    keyword: string,
    filters?: {
      ratings?: number[];
      boatId?: number;
      tourId?: number;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ) {
    const params = { keyword, ...filters };
    const queryString = this.buildQueryString(params);
    return this.getPaginated<ReviewDTO>(`/search?${queryString}`);
  }

  // Note: getBoatsByOwnerId and getToursByBoatId should be called from boat/tour services
  // These methods are removed as they don't belong to review service endpoints
}

export const reviewService = new ReviewService();

// Review Query Service - BaseService kullanarak
export const reviewQueryService = {
  // Get review by ID
  findById: async (id: number): Promise<ReviewDTO> => {
    return reviewService.getReviewById(id);
  },

  // Get all reviews with optional filters
  findAll: async (params?: {
    minRating?: number;
    customerId?: number;
    boatId?: number;
    tourId?: number;
    bookingId?: number;
  }): Promise<ReviewDTO[]> => {
    return reviewService.getReviews(params as ReviewFilters);
  },

  // Query reviews with advanced criteria
  query: async (query: ReviewQuery): Promise<ReviewDTO[]> => {
    return reviewService.getReviewsByQuery(query);
  },

  // Get reviews by customer ID
  findByCustomerId: async (customerId: number): Promise<ReviewDTO[]> => {
    return reviewService.getCustomerReviews(customerId);
  },

  // Get reviews by boat ID
  findByBoatId: async (boatId: number): Promise<ReviewDTO[]> => {
    return reviewService.getBoatReviews(boatId);
  },

  // Get reviews by tour ID
  findByTourId: async (tourId: number): Promise<ReviewDTO[]> => {
    return reviewService.getTourReviews(tourId);
  },

  // Get reviews by booking ID
  findByBookingId: async (bookingId: number): Promise<ReviewDTO[]> => {
    const review = await reviewService.getBookingReview(bookingId);
    return review ? [review] : [];
  },

  // Get average rating by boat ID
  findAverageRatingByBoatId: async (boatId: number): Promise<number> => {
    return reviewService.getAverageRatingByBoatId(boatId);
  },

  // Get average rating by tour ID
  findAverageRatingByTourId: async (tourId: number): Promise<number> => {
    return reviewService.getAverageRatingByTourId(tourId);
  },

  // Count reviews by boat ID
  countByBoatId: async (boatId: number): Promise<number> => {
    return reviewService.getReviewCountByBoatId(boatId);
  },

  // Count reviews by tour ID
  countByTourId: async (tourId: number): Promise<number> => {
    return reviewService.getReviewCountByTourId(tourId);
  },

  // Get reviews by minimum rating
  findByRatingGreaterThanEqual: async (
    minRating: number
  ): Promise<ReviewDTO[]> => {
    return reviewService.getReviewsByMinRating(minRating);
  },

  // PAGINATION METHODS
  findByBoatIdWithPagination: async (
    boatId: number,
    params?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ) => {
    return reviewService.getBoatReviewsPaginated(boatId, params);
  },

  findByTourIdWithPagination: async (
    tourId: number,
    params?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ) => {
    return reviewService.getTourReviewsPaginated(tourId, params);
  },

  findAllWithPagination: async (
    filters?: {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) => {
    return reviewService.getReviewsPaginated(filters);
  },

  // RATING DISTRIBUTION METHODS
  getRatingDistributionByBoatId: async (boatId: number): Promise<Record<number, number>> => {
    return reviewService.getBoatRatingDistribution(boatId);
  },

  getRatingDistributionByTourId: async (tourId: number): Promise<Record<number, number>> => {
    return reviewService.getTourRatingDistribution(tourId);
  },

  // TREND ANALYSIS METHODS
  getRatingTrendsByBoatId: async (
    boatId: number,
    period: string = "monthly"
  ) => {
    return reviewService.getBoatRatingTrends(boatId, period);
  },

  getRatingTrendsByTourId: async (
    tourId: number,
    period: string = "monthly"
  ) => {
    return reviewService.getTourRatingTrends(tourId, period);
  },

  // SUMMARY STATISTICS METHODS
  getReviewSummaryByBoatId: async (boatId: number) => {
    return reviewService.getBoatReviewSummary(boatId);
  },

  getReviewSummaryByTourId: async (tourId: number) => {
    return reviewService.getTourReviewSummary(tourId);
  },

  // RECENT ACTIVITIES METHODS
  getRecentReviews: async (limit: number = 10): Promise<ReviewDTO[]> => {
    return reviewService.getRecentReviews(limit);
  },

  getRecentReviewsByBoatId: async (boatId: number, limit: number = 5): Promise<ReviewDTO[]> => {
    return reviewService.getRecentBoatReviews(boatId, limit);
  },

  getRecentReviewsByTourId: async (tourId: number, limit: number = 5): Promise<ReviewDTO[]> => {
    return reviewService.getRecentTourReviews(tourId, limit);
  },

  // ADVANCED FILTERING METHODS
  findByBoatIdWithFilters: async (
    boatId: number,
    filters?: {
      minRating?: number;
      maxRating?: number;
      dateFrom?: string;
      dateTo?: string;
      keyword?: string;
      sortBy?: string;
      sortDirection?: string;
      page?: number;
      size?: number;
    }
  ) => {
    return reviewService.getFilteredBoatReviews(boatId, filters);
  },

  searchReviews: async (
    keyword: string,
    filters?: {
      ratings?: number[];
      boatId?: number;
      tourId?: number;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }
  ) => {
    return reviewService.searchReviews(keyword, filters);
  },
};

// Review Command Service - BaseService kullanarak
export const reviewCommandService = {
  // Create new review
  createReview: async (command: CreateReviewCommand): Promise<ReviewDTO> => {
    return reviewService.createReview(command);
  },

  // Update existing review
  updateReview: async (
    id: number,
    command: UpdateReviewCommand
  ): Promise<ReviewDTO> => {
    command.reviewId = id;
    return reviewService.updateReview(command);
  },

  // Delete review
  deleteReview: async (id: number): Promise<void> => {
    return reviewService.deleteReview(id);
  },

  // Delete reviews by boat ID
  deleteReviewsByBoatId: async (boatId: number): Promise<void> => {
    return reviewService.deleteReviewsByBoatId(boatId);
  },

  // Delete reviews by tour ID
  deleteReviewsByTourId: async (tourId: number): Promise<void> => {
    return reviewService.deleteReviewsByTourId(tourId);
  },

  // Reply to review
  replyToReview: async (reviewId: number, replyMessage: string): Promise<string> => {
    const requestBody = {
      message: replyMessage,
      isOfficial: true
    };
    return reviewService.post(`/${reviewId}/reply`, requestBody);
  },

  // Flag review
  flagReview: async (reviewId: number): Promise<string> => {
    return reviewService.post(`/${reviewId}/flag`, {});
  },
};

// Helper functions for owner/captain specific data
// Note: These methods require boat and tour service dependencies
export const reviewHelperService = {
  // Get reviews for owner's boats
  // NOTE: This method requires boatService.getBoatsByOwnerId() to be implemented
  getReviewsForOwnerBoats: async (
    ownerId: number,
    boatService?: { getBoatsByOwnerId: (ownerId: number) => Promise<any[]> }
  ): Promise<ReviewDTO[]> => {
    try {
      if (!boatService) {
        console.warn("boatService dependency required for getReviewsForOwnerBoats");
        return [];
      }

      // Get owner's boats from boat service
      const boats = await boatService.getBoatsByOwnerId(ownerId);

      // Get reviews for each boat
      const reviewsPromises = boats.map((boat: any) =>
        reviewService.getBoatReviews(boat.id)
      );

      const reviewsArrays = await Promise.all(reviewsPromises);
      return reviewsArrays.flat();
    } catch (error) {
      console.error("Error fetching reviews for owner boats:", error);
      return [];
    }
  },

  // Get reviews for owner's tours
  // NOTE: This method requires boatService and tourService to be implemented
  getReviewsForOwnerTours: async (
    ownerId: number,
    boatService?: { getBoatsByOwnerId: (ownerId: number) => Promise<any[]> },
    tourService?: { getToursByBoatId: (boatId: number) => Promise<any[]> }
  ): Promise<ReviewDTO[]> => {
    try {
      if (!boatService || !tourService) {
        console.warn("boatService and tourService dependencies required for getReviewsForOwnerTours");
        return [];
      }

      // Get owner's boats first
      const boats = await boatService.getBoatsByOwnerId(ownerId);

      const reviewsPromises: Promise<ReviewDTO[]>[] = [];

      for (const boat of boats) {
        const tours = await tourService.getToursByBoatId(boat.id);

        tours.forEach((tour: any) => {
          reviewsPromises.push(reviewService.getTourReviews(tour.id));
        });
      }

      const reviewsArrays = await Promise.all(reviewsPromises);
      return reviewsArrays.flat();
    } catch (error) {
      console.error("Error fetching reviews for owner tours:", error);
      return [];
    }
  },

  // Get all reviews for an owner (boats + tours)
  // NOTE: This method requires boat and tour service dependencies
  getAllReviewsForOwner: async (
    ownerId: number,
    boatService?: { getBoatsByOwnerId: (ownerId: number) => Promise<any[]> },
    tourService?: { getToursByBoatId: (boatId: number) => Promise<any[]> }
  ): Promise<ReviewDTO[]> => {
    try {
      const [boatReviews, tourReviews] = await Promise.all([
        reviewHelperService.getReviewsForOwnerBoats(ownerId, boatService),
        reviewHelperService.getReviewsForOwnerTours(ownerId, boatService, tourService),
      ]);

      // Combine and deduplicate reviews
      const allReviews = [...boatReviews, ...tourReviews];
      const uniqueReviews = allReviews.filter(
        (review, index, self) =>
          index === self.findIndex((r) => r.id === review.id)
      );

      return uniqueReviews;
    } catch (error) {
      console.error("Error fetching all reviews for owner:", error);
      return [];
    }
  },
};

export default {
  query: reviewQueryService,
  command: reviewCommandService,
  helper: reviewHelperService,
};
