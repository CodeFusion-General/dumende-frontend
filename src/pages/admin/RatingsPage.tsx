import React, { useState, useMemo, useCallback } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import RatingsHeader from "@/components/admin/ratings/RatingsHeader";
import RatingsSummaryCard from "@/components/admin/ratings/RatingsSummaryCard";
import RatingDistributionCard from "@/components/admin/ratings/RatingDistributionCard";
import RecentActivityCard from "@/components/admin/ratings/RecentActivityCard";
import RatingTrendsChart from "@/components/admin/ratings/RatingTrendsChart";
import CategoryBreakdownChart from "@/components/admin/ratings/CategoryBreakdownChart";
import ReviewsFilterBar from "@/components/admin/ratings/ReviewsFilterBar";
import ReviewsGrid from "@/components/admin/ratings/ReviewsGrid";
import ErrorBoundary from "@/components/admin/ratings/errors/ErrorBoundary";
import { DataLoadingError } from "@/components/admin/ratings/errors/ErrorStates";
import { PageLoading } from "@/components/admin/ratings/loading/LoadingStates";
import { RatingsPageSkeleton } from "@/components/admin/ratings/skeletons/SkeletonLoaders";
import { FilteredResultsEmpty } from "@/components/admin/ratings/empty/EmptyStates";
import { MockRatingsService } from "@/services/mockRatingsService";
import { useAsyncOperation } from "@/hooks/useRetry";
import { FilterOptions, SortOption } from "@/types/ratings.types";
import { Star, Users, TrendingUp, Activity } from "lucide-react";

const RatingsPage: React.FC = () => {
  // State management for filters, sorting, and data loading
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
  });
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [initialLoading, setInitialLoading] = useState(true);

  // Simulate initial data loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Generate mock data (as per task requirements)
  const mockReviews = useMemo(
    () => MockRatingsService.generateReviews(150),
    []
  );

  const mockStats = useMemo(
    () => MockRatingsService.getStatistics(mockReviews),
    [mockReviews]
  );

  // Apply filters and sorting to mock data
  const filteredAndSortedReviews = useMemo(() => {
    const filtered = MockRatingsService.filterReviews(mockReviews, filters);
    return MockRatingsService.sortReviews(filtered, sortBy);
  }, [mockReviews, filters, sortBy]);

  // Calculate statistics from filtered data
  const currentStats = useMemo(() => {
    const totalReviews = filteredAndSortedReviews.length;
    const averageRating =
      totalReviews > 0
        ? filteredAndSortedReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews
        : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReviews = filteredAndSortedReviews.filter(
      (review) => new Date(review.date) >= sevenDaysAgo
    );

    const averageRecentRating =
      recentReviews.length > 0
        ? recentReviews.reduce((sum, review) => sum + review.rating, 0) /
          recentReviews.length
        : 0;

    // Calculate trend (comparing last 7 days to previous 7 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const previousWeekReviews = filteredAndSortedReviews.filter((review) => {
      const reviewDate = new Date(review.date);
      return reviewDate >= fourteenDaysAgo && reviewDate < sevenDaysAgo;
    });

    const previousWeekAverage =
      previousWeekReviews.length > 0
        ? previousWeekReviews.reduce((sum, review) => sum + review.rating, 0) /
          previousWeekReviews.length
        : 0;

    const trend =
      previousWeekAverage > 0
        ? ((averageRecentRating - previousWeekAverage) / previousWeekAverage) *
          100
        : 0;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      recentReviews: recentReviews.length,
      averageRecentRating: Math.round(averageRecentRating * 10) / 10,
      trend: {
        value: Math.abs(Math.round(trend)),
        isPositive: trend >= 0,
      },
    };
  }, [filteredAndSortedReviews]);

  // Get rating distribution for current filtered data
  const ratingDistribution = useMemo(() => {
    return MockRatingsService.getRatingDistribution(filteredAndSortedReviews);
  }, [filteredAndSortedReviews]);

  // Get recent activity data
  const recentActivityData = useMemo(() => {
    return MockRatingsService.getRecentActivity(filteredAndSortedReviews, 7);
  }, [filteredAndSortedReviews]);

  // Async operation for data refresh
  const refreshOperation = useAsyncOperation(
    async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real app, this would refetch data from the API
    },
    {
      onSuccess: () => {
        console.log("Data refreshed successfully");
      },
      onError: (error) => {
        console.error("Failed to refresh data:", error);
      },
      retryOptions: {
        maxAttempts: 3,
        delay: 1000,
        onRetry: (attempt) => {
          console.log(`Retry attempt ${attempt}`);
        },
      },
    }
  );

  // Event handlers
  const handleRefresh = useCallback(() => {
    refreshOperation.execute();
  }, [refreshOperation]);

  const handleExport = useCallback(() => {
    // Simulate export functionality
    console.log("Exporting ratings data...");
    // In a real app, this would generate and download a file
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ category: "all" });
    setSortBy("date-desc");
  }, []);

  // Review action handlers
  const handleReply = useCallback((reviewId: string) => {
    console.log("Reply to review:", reviewId);
    // In a real app, this would open a reply modal or navigate to reply page
  }, []);

  const handleFlag = useCallback((reviewId: string) => {
    console.log("Flag review:", reviewId);
    // In a real app, this would flag the review for moderation
  }, []);

  const handleDelete = useCallback((reviewId: string) => {
    console.log("Delete review:", reviewId);
    // In a real app, this would delete the review after confirmation
  }, []);

  // Initial loading state
  if (initialLoading) {
    return (
      <CaptainLayout>
        <RatingsPageSkeleton />
      </CaptainLayout>
    );
  }

  // Data loading error state
  if (refreshOperation.error) {
    return (
      <CaptainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <DataLoadingError
            onRetry={
              refreshOperation.canRetry ? refreshOperation.retry : undefined
            }
            className="max-w-md"
          />
        </div>
      </CaptainLayout>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("RatingsPage Error:", error, errorInfo);
      }}
    >
      <CaptainLayout>
        <div
          className="min-h-screen bg-gray-50"
          role="main"
          aria-label="Müşteri değerlendirmeleri yönetim sayfası"
        >
          {/* Header Section */}
          <RatingsHeader
            totalReviews={currentStats.totalReviews}
            averageRating={currentStats.averageRating}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8">
            {/* Empty State */}
            {currentStats.totalReviews === 0 ? (
              <FilteredResultsEmpty
                onClearFilters={handleResetFilters}
                onAction={handleRefresh}
              />
            ) : (
              <div className="space-y-8">
                {/* Summary Cards Section */}
                <section
                  aria-labelledby="summary-heading"
                  className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6"
                >
                  <h2 id="summary-heading" className="sr-only">
                    Değerlendirme özeti
                  </h2>
                  <RatingsSummaryCard
                    icon={<Star className="w-6 h-6" />}
                    title="Ortalama Puan"
                    value={currentStats.averageRating.toFixed(1)}
                    subtitle="5 üzerinden"
                    trend={currentStats.trend}
                    gradient="from-yellow-500/20 to-yellow-400/10"
                  />

                  <RatingsSummaryCard
                    icon={<Users className="w-6 h-6" />}
                    title="Toplam Değerlendirme"
                    value={currentStats.totalReviews}
                    subtitle="Tüm zamanlar"
                    gradient="from-blue-500/20 to-blue-400/10"
                  />

                  <RatingsSummaryCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Son 7 Gün"
                    value={currentStats.recentReviews}
                    subtitle="Yeni değerlendirme"
                    gradient="from-green-500/20 to-green-400/10"
                  />

                  <RatingsSummaryCard
                    icon={<Activity className="w-6 h-6" />}
                    title="Son Hafta Ortalaması"
                    value={currentStats.averageRecentRating.toFixed(1)}
                    subtitle="Son 7 günün ortalaması"
                    trend={currentStats.trend}
                    gradient="from-purple-500/20 to-purple-400/10"
                  />
                </section>

                {/* Analytics Section */}
                <section
                  aria-labelledby="analytics-heading"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6"
                >
                  <h2 id="analytics-heading" className="sr-only">
                    Değerlendirme analizleri
                  </h2>
                  {/* Rating Distribution Card */}
                  <RatingDistributionCard
                    distribution={ratingDistribution}
                    totalReviews={currentStats.totalReviews}
                  />

                  {/* Rating Trends Chart */}
                  <RatingTrendsChart trends={mockStats.trends} />

                  {/* Recent Activity Card */}
                  <RecentActivityCard
                    recentReviews={recentActivityData}
                    totalRecentCount={currentStats.recentReviews}
                    averageRecentRating={currentStats.averageRecentRating}
                    trend={currentStats.trend}
                  />
                </section>

                {/* Category Breakdown Chart */}
                <section
                  aria-labelledby="breakdown-heading"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6"
                >
                  <h2 id="breakdown-heading" className="sr-only">
                    Kategori dağılımı
                  </h2>
                  <CategoryBreakdownChart
                    categoryBreakdown={mockStats.categoryBreakdown}
                  />

                  {/* Additional space for future analytics */}
                  <div
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center"
                    role="region"
                    aria-label="Gelecek analizler için ayrılmış alan"
                  >
                    <div className="text-center text-gray-500">
                      <TrendingUp
                        className="h-12 w-12 mx-auto mb-4 text-gray-300"
                        aria-hidden="true"
                      />
                      <p className="font-roboto">
                        Gelecek analizler için ayrılmış alan
                      </p>
                    </div>
                  </div>
                </section>

                {/* Reviews Management Section */}
                <section
                  aria-labelledby="reviews-heading"
                  className="space-y-4 xs:space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2
                      id="reviews-heading"
                      className="text-lg xs:text-xl font-montserrat font-semibold text-gray-900"
                    >
                      Değerlendirme Yönetimi
                    </h2>
                  </div>

                  {/* Filter Bar */}
                  <ReviewsFilterBar
                    filters={filters}
                    sortBy={sortBy}
                    onFiltersChange={handleFiltersChange}
                    onSortChange={handleSortChange}
                    onResetFilters={handleResetFilters}
                    totalResults={filteredAndSortedReviews.length}
                  />

                  {/* Reviews Grid */}
                  <ReviewsGrid
                    reviews={filteredAndSortedReviews}
                    loading={refreshOperation.loading}
                    onReply={handleReply}
                    onFlag={handleFlag}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                  />
                </section>
              </div>
            )}
          </div>
        </div>
      </CaptainLayout>
    </ErrorBoundary>
  );
};

export default RatingsPage;
