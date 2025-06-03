import React from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import RatingDistributionChart from "@/components/admin/ratings/RatingDistributionChart";
import ReviewsFilter from "@/components/admin/ratings/ReviewsFilter";
import ReviewsList from "@/components/admin/ratings/ReviewsList";
import RatingSummary from "@/components/admin/ratings/RatingSummary";
import { useRatingsData } from "@/hooks/useRatingsData";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

const RatingsPage: React.FC = () => {
  // TODO: Replace with actual logged-in user ID
  const ownerId = 2; // Ahmet Yılmaz (test data)

  const {
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
  } = useRatingsData(ownerId);

  // Loading state
  if (loading) {
    return (
      <CaptainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Yorumlar yükleniyor...</p>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CaptainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshReviews}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  return (
    <CaptainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Puanlarım ve Yorumlarım
            </h1>
            <p className="text-muted-foreground">
              Müşterilerinizden aldığınız geri bildirimleri görüntüleyin ve
              değerlendirme performansınızı takip edin.
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshReviews}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>

        {/* No reviews state */}
        {totalReviews === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-6.93-4.001c.001-.001.001-.002.002-.003L6 16c1-4 4-8 6-8s5 4 6 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz değerlendirme yok
            </h3>
            <p className="text-gray-500">
              Tekne ve turlarınız için müşteri yorumları henüz bulunmuyor. İlk
              rezervasyonlarınızı aldıktan sonra değerlendirmeler burada
              görünecek.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <RatingSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
              lastMonthReviews={lastMonthReviews}
            />

            {/* Rating Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <RatingDistributionChart
                distribution={ratingDistribution}
                total={totalReviews}
              />
            </div>

            {/* Reviews Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <ReviewsFilter
                sorting={sorting}
                onSortingChange={setSorting}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
              />
            </div>

            {/* Reviews List */}
            <div className="mb-8">
              <ReviewsList reviews={sortedReviews} />
            </div>
          </>
        )}
      </div>
    </CaptainLayout>
  );
};

export default RatingsPage;
