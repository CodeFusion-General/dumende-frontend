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
    const queryString = this.buildQueryString(query);
    return this.get<ReviewDTO[]>(`/search?${queryString}`);
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

  public async getBoatRating(boatId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    return this.get(`/boat/${boatId}/rating`);
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
}

export const reviewService = new ReviewService();
