import { MockRatingsService } from "../services/mockRatingsService";
import { MockReviewData, MockRatingStats } from "../types/ratings.types";

// Generate consistent mock data
export const mockReviews: MockReviewData[] =
  MockRatingsService.generateReviews(75);
export const mockRatingStats: MockRatingStats =
  MockRatingsService.getStatistics(mockReviews);

// Export utility functions for easy access
export const getMockReviews = () => mockReviews;
export const getMockStats = () => mockRatingStats;
export const getFilteredReviews = MockRatingsService.filterReviews;
export const getSortedReviews = MockRatingsService.sortReviews;
export const getRatingDistribution = MockRatingsService.getRatingDistribution;
export const getRecentActivity = MockRatingsService.getRecentActivity;
export const getLocationStats = MockRatingsService.getLocationStats;
