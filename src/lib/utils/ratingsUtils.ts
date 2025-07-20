import {
  MockReviewData,
  FilterOptions,
  SortOption,
} from "../../types/ratings.types";

/**
 * Utility functions for ratings data manipulation and calculations
 */

/**
 * Calculate average rating from an array of reviews
 */
export const calculateAverageRating = (reviews: MockReviewData[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

/**
 * Get rating distribution with percentages
 */
export const calculateRatingDistribution = (reviews: MockReviewData[]) => {
  const totalReviews = reviews.length;
  const distribution = [1, 2, 3, 4, 5].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  return distribution;
};

/**
 * Filter reviews by date range
 */
export const filterByDateRange = (
  reviews: MockReviewData[],
  startDate: string,
  endDate: string
): MockReviewData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return reviews.filter((review) => {
    const reviewDate = new Date(review.date);
    return reviewDate >= start && reviewDate <= end;
  });
};

/**
 * Get reviews from the last N days
 */
export const getRecentReviews = (
  reviews: MockReviewData[],
  days: number
): MockReviewData[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return reviews.filter((review) => new Date(review.date) >= cutoffDate);
};

/**
 * Search reviews by text in multiple fields
 */
export const searchReviews = (
  reviews: MockReviewData[],
  searchTerm: string
): MockReviewData[] => {
  if (!searchTerm.trim()) return reviews;

  const searchLower = searchTerm.toLowerCase();
  return reviews.filter(
    (review) =>
      review.userName.toLowerCase().includes(searchLower) ||
      review.comment.toLowerCase().includes(searchLower) ||
      review.entityName.toLowerCase().includes(searchLower) ||
      review.location.toLowerCase().includes(searchLower)
  );
};

/**
 * Group reviews by category and calculate stats
 */
export const getCategoryStats = (reviews: MockReviewData[]) => {
  const boatReviews = reviews.filter((review) => review.category === "boat");
  const tourReviews = reviews.filter((review) => review.category === "tour");

  return {
    boat: {
      count: boatReviews.length,
      averageRating: calculateAverageRating(boatReviews),
      percentage:
        reviews.length > 0
          ? Math.round((boatReviews.length / reviews.length) * 100)
          : 0,
    },
    tour: {
      count: tourReviews.length,
      averageRating: calculateAverageRating(tourReviews),
      percentage:
        reviews.length > 0
          ? Math.round((tourReviews.length / reviews.length) * 100)
          : 0,
    },
  };
};

/**
 * Get top rated entities (boats/tours)
 */
export const getTopRatedEntities = (
  reviews: MockReviewData[],
  limit: number = 5
) => {
  const entityMap = new Map<
    string,
    {
      name: string;
      category: string;
      ratings: number[];
      totalReviews: number;
      averageRating: number;
    }
  >();

  reviews.forEach((review) => {
    const key = `${review.category}-${review.entityId}`;
    const existing = entityMap.get(key);

    if (existing) {
      existing.ratings.push(review.rating);
      existing.totalReviews++;
      existing.averageRating =
        existing.ratings.reduce((sum, r) => sum + r, 0) /
        existing.ratings.length;
    } else {
      entityMap.set(key, {
        name: review.entityName,
        category: review.category,
        ratings: [review.rating],
        totalReviews: 1,
        averageRating: review.rating,
      });
    }
  });

  return Array.from(entityMap.values())
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
};

/**
 * Calculate rating trends over time periods
 */
export const calculateRatingTrends = (
  reviews: MockReviewData[],
  days: number = 30
) => {
  const trends = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayReviews = reviews.filter((review) => review.date === dateStr);
    const averageRating =
      dayReviews.length > 0
        ? dayReviews.reduce((sum, review) => sum + review.rating, 0) /
          dayReviews.length
        : 0;

    trends.push({
      date: dateStr,
      rating: Math.round(averageRating * 10) / 10,
      count: dayReviews.length,
    });
  }

  return trends;
};

/**
 * Get location-based statistics
 */
export const getLocationStatistics = (reviews: MockReviewData[]) => {
  const locationMap = new Map<
    string,
    {
      count: number;
      totalRating: number;
      averageRating: number;
      categories: { boat: number; tour: number };
    }
  >();

  reviews.forEach((review) => {
    const existing = locationMap.get(review.location) || {
      count: 0,
      totalRating: 0,
      averageRating: 0,
      categories: { boat: 0, tour: 0 },
    };

    existing.count++;
    existing.totalRating += review.rating;
    existing.averageRating =
      Math.round((existing.totalRating / existing.count) * 10) / 10;
    existing.categories[review.category]++;

    locationMap.set(review.location, existing);
  });

  return Array.from(locationMap.entries())
    .map(([location, stats]) => ({ location, ...stats }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Validate filter options
 */
export const validateFilterOptions = (
  filters: FilterOptions
): FilterOptions => {
  const validatedFilters: FilterOptions = {};

  if (filters.rating && filters.rating >= 1 && filters.rating <= 5) {
    validatedFilters.rating = filters.rating;
  }

  if (filters.category && ["boat", "tour", "all"].includes(filters.category)) {
    validatedFilters.category = filters.category;
  }

  if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    if (startDate <= endDate) {
      validatedFilters.dateRange = filters.dateRange;
    }
  }

  if (filters.searchTerm && typeof filters.searchTerm === "string") {
    validatedFilters.searchTerm = filters.searchTerm.trim();
  }

  if (typeof filters.isVerified === "boolean") {
    validatedFilters.isVerified = filters.isVerified;
  }

  if (filters.location && typeof filters.location === "string") {
    validatedFilters.location = filters.location;
  }

  return validatedFilters;
};

/**
 * Validate sort option
 */
export const validateSortOption = (sortBy: string): SortOption => {
  const validSortOptions: SortOption[] = [
    "date-desc",
    "date-asc",
    "rating-desc",
    "rating-asc",
    "helpful-desc",
    "helpful-asc",
  ];

  return validSortOptions.includes(sortBy as SortOption)
    ? (sortBy as SortOption)
    : "date-desc";
};

/**
 * Format date for Turkish locale
 */
export const formatTurkishDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format rating with stars
 */
export const formatRatingStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    "★".repeat(fullStars) + (hasHalfStar ? "☆" : "") + "☆".repeat(emptyStars)
  );
};
