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

  public async getTourRating(tourId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    return this.get(`/tour/${tourId}/rating`);
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

  // Statistics
  public async getReviewStatistics(): Promise<{
    totalReviews: number;
    averageRating: number;
    reviewsThisMonth: number;
    topRatedBoats: Array<{
      boatId: number;
      rating: number;
      reviewCount: number;
    }>;
    topRatedTours: Array<{
      tourId: number;
      rating: number;
      reviewCount: number;
    }>;
  }> {
    return this.get("/statistics");
  }

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

  public async getBoatsByOwnerId(ownerId: number): Promise<any[]> {
    return this.get<any[]>(`/boats/owner/${ownerId}`);
  }

  public async getToursByBoatId(boatId: number): Promise<any[]> {
    return this.get<any[]>(`/tours/boat/${boatId}`);
  }
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
};

// Helper functions for owner/captain specific data - BaseService kullanarak
export const reviewHelperService = {
  // Get reviews for owner's boats
  getReviewsForOwnerBoats: async (ownerId: number): Promise<ReviewDTO[]> => {
    try {
      // Boat service kullanarak owner'ın teknelerini al
      const boats = await reviewService.getBoatsByOwnerId(ownerId);

      // Her tekne için review'ları getir
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
  getReviewsForOwnerTours: async (ownerId: number): Promise<ReviewDTO[]> => {
    try {
      // Önce owner'ın teknelerini, sonra bu teknelerin turlarını al
      const boats = await reviewService.getBoatsByOwnerId(ownerId);

      const reviewsPromises: Promise<ReviewDTO[]>[] = [];

      for (const boat of boats) {
        const tours = await reviewService.getToursByBoatId(boat.id);

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
  getAllReviewsForOwner: async (ownerId: number): Promise<ReviewDTO[]> => {
    try {
      const [boatReviews, tourReviews] = await Promise.all([
        reviewHelperService.getReviewsForOwnerBoats(ownerId),
        reviewHelperService.getReviewsForOwnerTours(ownerId),
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
