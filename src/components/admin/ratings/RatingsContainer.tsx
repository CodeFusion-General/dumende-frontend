import React, { useState, useEffect, useCallback } from "react";
import { reviewService, reviewQueryService, reviewCommandService } from "@/services/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewData, RatingStats, FilterOptions, SortOption } from "@/types/ratings.types";
import RatingsHeader from "./RatingsHeader";
import RatingsSummaryCard from "./RatingsSummaryCard";
import RatingSummary from "./RatingSummary";
import RatingTrendsChart from "./RatingTrendsChart";
import RatingDistributionCard from "./RatingDistributionCard";
import RatingDistributionChart from "./RatingDistributionChart";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
import RecentActivityCard from "./RecentActivityCard";
import ReviewsGrid from "./ReviewsGrid";
import ReviewsFilterBar from "./ReviewsFilterBar";
import ReplyModal from "./ReplyModal";
import { RatingsSummaryCardSkeleton, RatingsPageSkeleton } from "./skeletons/SkeletonLoaders";
import { Star, TrendingUp, Users, MessageSquare, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RatingsContainerProps {
  boatId?: number;
  tourId?: number;
  ownerId?: number;
}

const RatingsContainer: React.FC<RatingsContainerProps> = ({
  boatId,
  tourId,
  ownerId,
}) => {
  // Auth context
  const { user, isAdmin } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewData[]>([]);
  const [recentReviews, setRecentReviews] = useState<ReviewData[]>([]);
  const [summaryStats, setSummaryStats] = useState<RatingStats | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [ratingTrends, setRatingTrends] = useState<any[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Filtering state
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
  });
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  
  // UI state
  const [chartView, setChartView] = useState<"card" | "chart">("card");
  
  // Reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);

  // Helper function to fetch replies for reviews
  const fetchRepliesForReviews = useCallback(async (reviewsToUpdate: ReviewData[]) => {
    try {
      const reviewsWithReplies = await Promise.all(
        reviewsToUpdate.map(async (review) => {
          try {
            const replies = await reviewQueryService.getRepliesByReviewId(parseInt(review.id));
            return { ...review, replies };
          } catch (error) {
            console.warn(`Failed to fetch replies for review ${review.id}:`, error);
            return { ...review, replies: [] };
          }
        })
      );
      return reviewsWithReplies;
    } catch (error) {
      console.error("Error fetching replies for reviews:", error);
      return reviewsToUpdate.map(review => ({ ...review, replies: [] }));
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises: Promise<any>[] = [];

      if (boatId) {
        // Fetch boat-specific data
        promises.push(
          reviewQueryService.getReviewSummaryByBoatId(boatId),
          reviewQueryService.getRatingDistributionByBoatId(boatId),
          reviewQueryService.getRatingTrendsByBoatId(boatId, "monthly"),
          reviewQueryService.getRecentReviewsByBoatId(boatId, 10),
          reviewQueryService.findByBoatIdWithPagination(boatId, {
            page: currentPage,
            size: 12,
            sortBy: "createdAt",
            sortDirection: "desc"
          })
        );
      } else if (tourId) {
        // Fetch tour-specific data
        promises.push(
          reviewQueryService.getReviewSummaryByTourId(tourId),
          reviewQueryService.getRatingDistributionByTourId(tourId),
          reviewQueryService.getRatingTrendsByTourId(tourId, "monthly"),
          reviewQueryService.getRecentReviewsByTourId(tourId, 10),
          reviewQueryService.findByTourIdWithPagination(tourId, {
            page: currentPage,
            size: 12,
            sortBy: "createdAt",
            sortDirection: "desc"
          })
        );
      } else {
        // Fetch all reviews data
        promises.push(
          // For overall stats, we'll need to aggregate or use a general endpoint
          reviewQueryService.getRecentReviews(10),
          reviewQueryService.findAllWithPagination({
            page: currentPage,
            size: 12,
            sort: "createdAt,desc"
          })
        );
      }

      const results = await Promise.all(promises);

      if (boatId || tourId) {
        const [summary, distribution, trends, recent, paginatedReviews] = results;
        
        setSummaryStats(summary);
        setRatingDistribution(distribution);
        setRatingTrends(trends);
        
        // Fetch replies for recent reviews
        const recentWithReplies = await fetchRepliesForReviews(recent);
        setRecentReviews(recentWithReplies);
        
        // Handle paginated reviews
        if (paginatedReviews?.content) {
          // Fetch replies for the reviews
          const reviewsWithReplies = await fetchRepliesForReviews(paginatedReviews.content);
          setReviews(reviewsWithReplies);
          setTotalPages(paginatedReviews.totalPages);
          setTotalReviews(paginatedReviews.totalElements);
        }
      } else {
        const [recent, paginatedReviews] = results;
        
        // Fetch replies for recent reviews
        const recentWithReplies = await fetchRepliesForReviews(recent);
        setRecentReviews(recentWithReplies);
        
        if (paginatedReviews?.content) {
          // Fetch replies for the reviews
          const reviewsWithReplies = await fetchRepliesForReviews(paginatedReviews.content);
          setReviews(reviewsWithReplies);
          setTotalPages(paginatedReviews.totalPages);
          setTotalReviews(paginatedReviews.totalElements);
        }
      }

    } catch (err) {
      console.error("Error fetching ratings data:", err);
      setError("Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [boatId, tourId, currentPage]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      // Implement export functionality
      console.log("Exporting ratings data...");
      // You can implement CSV/Excel export here
    } catch (err) {
      console.error("Export error:", err);
    }
  }, []);

  // Handle filtering
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  }, []);

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ category: "all" });
    setSortBy("date-desc");
  }, []);

  // Apply filters and sorting to reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Apply filters
    if (filters.rating) {
      filtered = filtered.filter(review => review.rating >= filters.rating!);
    }

    if (filters.category && filters.category !== "all") {
      // This would need to be implemented based on your data structure
      // filtered = filtered.filter(review => review.category === filters.category);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-asc":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "rating-desc":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-asc":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, filters, sortBy]);

  // Handle review actions
  const handleReply = useCallback(async (reviewId: string) => {
    try {
      // Find the review to reply to
      const review = reviews.find(r => r.id === reviewId) || filteredReviews.find(r => r.id === reviewId);
      if (review) {
        setSelectedReview(review);
        setReplyModalOpen(true);
      }
    } catch (err) {
      console.error("Reply error:", err);
    }
  }, [reviews, filteredReviews]);

  // Handle reply submission
  const handleReplySubmit = useCallback(async (message: string) => {
    if (!selectedReview) return;
    
    try {
      await reviewCommandService.replyToReview(parseInt(selectedReview.id), message);
      console.log("Reply sent successfully");
      // Refresh data to show the new reply
      await fetchData();
      // You might want to show a success message to the user
    } catch (err) {
      console.error("Reply submission error:", err);
      throw err; // Re-throw to let the modal handle the error
    }
  }, [selectedReview, fetchData]);

  // Handle reply modal close
  const handleReplyModalClose = useCallback(() => {
    setReplyModalOpen(false);
    setSelectedReview(null);
  }, []);

  const handleFlag = useCallback(async (reviewId: string) => {
    try {
      await reviewCommandService.flagReview(parseInt(reviewId));
      console.log("Review flagged successfully");
      // You might want to show a success message to the user
    } catch (err) {
      console.error("Flag error:", err);
      // You might want to show an error message to the user
    }
  }, []);

  const handleDelete = useCallback(async (reviewId: string) => {
    try {
      // Convert string ID to number if needed
      const numericId = parseInt(reviewId);
      await reviewService.deleteReview(numericId);
      await fetchData(); // Refresh data after deletion
    } catch (err) {
      console.error("Delete error:", err);
    }
  }, [fetchData]);

  // Calculate summary data
  const averageRating = summaryStats?.averageRating || 0;
  const totalReviewsCount = summaryStats?.totalReviews || totalReviews;

  // Loading state
  if (loading && !reviews.length) {
    return <RatingsPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <RatingsHeader
        totalReviews={totalReviewsCount}
        averageRating={averageRating}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RatingsSummaryCard
            icon={<Star />}
            title="Ortalama Puan"
            value={averageRating.toFixed(1)}
            subtitle="5 üzerinden"
            trend={{
              value: 5.2,
              isPositive: summaryStats.recentTrend === "increasing"
            }}
            gradient="from-yellow-100 to-yellow-50"
          />
          
          <RatingsSummaryCard
            icon={<MessageSquare />}
            title="Toplam Değerlendirme"
            value={totalReviewsCount}
            subtitle="tüm zamanlar"
            trend={{
              value: 12.3,
              isPositive: true
            }}
            gradient="from-blue-100 to-blue-50"
          />
          
          <RatingsSummaryCard
            icon={<TrendingUp />}
            title="Bu Ay"
            value={summaryStats.previousMonthCount || 0}
            subtitle="yeni değerlendirme"
            trend={{
              value: 8.7,
              isPositive: summaryStats.recentTrend === "increasing"
            }}
            gradient="from-green-100 to-green-50"
          />
          
          <RatingsSummaryCard
            icon={<Users />}
            title="Aktif Müşteriler"
            value={Math.round(totalReviewsCount * 0.8)}
            subtitle="değerlendirme yapan"
            trend={{
              value: 3.1,
              isPositive: true
            }}
            gradient="from-purple-100 to-purple-50"
          />
        </div>
      )}

      {/* Category Breakdown and Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category Breakdown Chart - 40% width */}
        {(boatId || tourId || (!boatId && !tourId)) && (
          <div className="lg:col-span-2">
            <CategoryBreakdownChart
              categoryBreakdown={{
                boats: boatId ? totalReviewsCount : Math.floor(totalReviewsCount * 0.6),
                tours: tourId ? totalReviewsCount : Math.floor(totalReviewsCount * 0.4)
              }}
            />
          </div>
        )}

        {/* Recent Activity - 60% width */}
        {recentReviews.length > 0 && (
          <div className="lg:col-span-3">
            <RecentActivityCard
              recentReviews={recentReviews}
              totalRecentCount={recentReviews.length}
              averageRecentRating={
                recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length
              }
              trend={{
                value: 5.2,
                isPositive: summaryStats?.recentTrend === "increasing"
              }}
            />
          </div>
        )}
      </div>

      {/* Rating Distribution Chart */}
      {Object.keys(ratingDistribution).length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Puan Dağılımı</h3>
            <div className="flex gap-2">
              <Button
                variant={chartView === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartView("card")}
              >
                <PieChart className="w-4 h-4 mr-1" />
                Kart
              </Button>
              <Button
                variant={chartView === "chart" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartView("chart")}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Grafik
              </Button>
            </div>
          </div>
          
          {chartView === "card" ? (
            <RatingDistributionCard distribution={ratingDistribution} />
          ) : (
            <RatingDistributionChart
              distribution={Object.entries(ratingDistribution).map(([stars, count]) => ({
                name: `${stars} Yıldız`,
                count: Number(count),
                color: stars === "5" ? "#22c55e" : stars === "4" ? "#84cc16" : stars === "3" ? "#eab308" : stars === "2" ? "#f97316" : "#ef4444"
              }))}
              total={Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0)}
            />
          )}
        </div>
      )}

      {/* Rating Trends Chart */}
      {ratingTrends.length > 0 && (
        <RatingTrendsChart trends={ratingTrends} />
      )}

      {/* Advanced Filtering */}
      <ReviewsFilterBar
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        totalResults={filteredReviews.length}
      />

      {/* Reviews Grid */}
      <ReviewsGrid
        reviews={filteredReviews}
        loading={loading}
        onReply={handleReply}
        onFlag={handleFlag}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        showDeleteButton={isAdmin} // Only show delete button for admin users
      />

      {/* Reply Modal */}
      <ReplyModal
        isOpen={replyModalOpen}
        onClose={handleReplyModalClose}
        onSubmit={handleReplySubmit}
        review={selectedReview}
        loading={loading}
      />
    </div>
  );
};

export default RatingsContainer;