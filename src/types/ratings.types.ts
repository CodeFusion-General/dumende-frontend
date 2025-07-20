// Import ReviewDTO from the backend service types
import { ReviewDTO } from "@/services/reviewService";

// Use ReviewDTO from backend instead of MockReviewData
export type ReviewData = ReviewDTO;

// Real API response types for rating statistics
export interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  recentTrend: string;
  lastReviewDate?: string;
  previousMonthAverage?: number;
  previousMonthCount?: number;
}

export interface FilterOptions {
  rating?: number;
  category?: "boat" | "tour" | "all";
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  isVerified?: boolean;
  location?: string;
}

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "rating-desc"
  | "rating-asc"
  | "helpful-desc"
  | "helpful-asc";

export interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

export interface RatingTrend {
  date: string;
  rating: number;
  count: number;
}
