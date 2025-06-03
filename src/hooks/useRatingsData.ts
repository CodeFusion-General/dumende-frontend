import { useState, useEffect } from "react";
import { ReviewDTO } from "@/types/review.types";
import { reviewHelperService } from "@/services/reviewService";

// Define the Review interface for compatibility
export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  tourName?: string;
  boatName?: string;
  customerId?: number;
  boatId?: number;
  tourId?: number;
  bookingId?: number;
}

// Convert ReviewDTO to Review for compatibility with existing components
const convertReviewDTOToReview = (dto: ReviewDTO): Review => {
  return {
    id: dto.reviewId.toString(),
    userName: dto.customerName || `Müşteri ${dto.customerId}`,
    date: new Date(dto.reviewDate).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    rating: dto.rating,
    comment: dto.comment,
    tourName: dto.tourName,
    boatName: dto.boatName,
    customerId: dto.customerId,
    boatId: dto.boatId,
    tourId: dto.tourId,
    bookingId: dto.bookingId,
  };
};

export const useRatingsData = (ownerId: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<string>("newest");
  const [filters, setFilters] = useState({
    fiveStars: false,
    fourStars: false,
    threeStars: false,
    twoStars: false,
    oneStars: false,
  });

  // Load reviews from backend
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const reviewDTOs = await reviewHelperService.getAllReviewsForOwner(
          ownerId
        );
        const convertedReviews = reviewDTOs.map(convertReviewDTOToReview);

        setReviews(convertedReviews);
      } catch (err) {
        console.error("Error loading reviews:", err);
        setError("Yorumlar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      loadReviews();
    }
  }, [ownerId]);

  // Calculate summary data
  const totalReviews = reviews.length;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  // Last month reviews (30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const lastMonthReviews = reviews.filter((review) => {
    const reviewDate = new Date(review.date);
    return reviewDate > thirtyDaysAgo;
  }).length;

  // Calculate rating distribution
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const ratingDistribution = [
    { name: "5 ⭐", count: ratingCounts[5], color: "#2ecc71" },
    { name: "4 ⭐", count: ratingCounts[4], color: "#f39c12" },
    { name: "3 ⭐", count: ratingCounts[3], color: "#f39c12" },
    { name: "2 ⭐", count: ratingCounts[2], color: "#e74c3c" },
    { name: "1 ⭐", count: ratingCounts[1], color: "#e74c3c" },
  ];

  // Apply filters
  const filteredReviews = reviews.filter((review) => {
    // If no stars filter is selected, show all
    const anyStarFilterActive = Object.values(filters).some((value) => value);
    if (!anyStarFilterActive) return true;

    // Otherwise, filter by stars
    if (review.rating === 5 && filters.fiveStars) return true;
    if (review.rating === 4 && filters.fourStars) return true;
    if (review.rating === 3 && filters.threeStars) return true;
    if (review.rating === 2 && filters.twoStars) return true;
    if (review.rating === 1 && filters.oneStars) return true;

    return false;
  });

  // Apply sorting
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sorting) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const handleFilterChange = (name: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const resetFilters = () => {
    setFilters({
      fiveStars: false,
      fourStars: false,
      threeStars: false,
      twoStars: false,
      oneStars: false,
    });
    setSorting("newest");
  };

  // Refresh data function
  const refreshReviews = async () => {
    if (!ownerId) return;

    try {
      setLoading(true);
      setError(null);

      const reviewDTOs = await reviewHelperService.getAllReviewsForOwner(
        ownerId
      );
      const convertedReviews = reviewDTOs.map(convertReviewDTOToReview);

      setReviews(convertedReviews);
    } catch (err) {
      console.error("Error refreshing reviews:", err);
      setError("Yorumlar yenilenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    sorting,
    filters,
    totalReviews,
    averageRating,
    lastMonthReviews,
    ratingDistribution,
    sortedReviews,
    setSorting,
    handleFilterChange,
    resetFilters,
    refreshReviews,
  };
};
