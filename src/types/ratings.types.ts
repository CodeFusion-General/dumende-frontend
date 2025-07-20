export interface MockReviewData {
  id: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string;
  date: string;
  category: "boat" | "tour";
  entityName: string;
  entityId: string;
  isVerified: boolean;
  helpfulCount: number;
  location: string;
}

export interface MockRatingStats {
  averageRating: number;
  totalReviews: number;
  recentReviews: number;
  distribution: Array<{
    stars: number;
    count: number;
  }>;
  trends: Array<{
    date: string;
    rating: number;
    count: number;
  }>;
  categoryBreakdown: {
    boats: number;
    tours: number;
  };
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
