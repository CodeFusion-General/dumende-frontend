
import React from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import RatingDistributionChart from '@/components/admin/ratings/RatingDistributionChart';
import ReviewsFilter from '@/components/admin/ratings/ReviewsFilter';
import ReviewsList from '@/components/admin/ratings/ReviewsList';
import RatingSummary from '@/components/admin/ratings/RatingSummary';
import { useRatingsData } from '@/hooks/useRatingsData';

// Mock data for testing
const mockReviews = [
  {
    id: '1',
    userName: 'Ahmet K.',
    date: '15 Nisan 2025',
    rating: 5,
    comment: 'Harika bir deneyimdi! Kaptan çok yardımcı oldu ve deniz manzarası muhteşemdi. Tekne çok temizdi ve ikramlar mükemmeldi. Kesinlikle tekrar geleceğiz.',
    tourName: 'Günbatımı Turu',
    boatName: 'Mavi Rüzgar'
  },
  {
    id: '2',
    userName: 'Ayşe Y.',
    date: '12 Nisan 2025',
    rating: 4,
    comment: 'Genel olarak çok iyi bir deneyimdi ancak hava biraz olumsuzdu. Buna rağmen kaptan güvenli bir rota seçti.',
    tourName: 'Adalar Turu',
    boatName: 'Deniz Yıldızı'
  },
  {
    id: '3',
    userName: 'Mehmet B.',
    date: '10 Nisan 2025',
    rating: 5,
    comment: 'Mükemmel bir gün geçirdik! Çocuklarımız çok eğlendi, yemekler lezzetliydi. Herkese tavsiye ederim.',
    tourName: 'Özel Yelken Turu',
    boatName: 'Rüzgar Gülü'
  },
  {
    id: '4',
    userName: 'Zeynep T.',
    date: '5 Nisan 2025',
    rating: 3,
    comment: 'Tur genel olarak iyiydi ama biraz kalabalıktı. Biraz daha az kişi olsa daha keyifli olabilirdi.',
    tourName: 'Adalar Turu',
    boatName: 'Deniz Yıldızı'
  },
  {
    id: '5',
    userName: 'Can M.',
    date: '1 Nisan 2025',
    rating: 2,
    comment: 'Tur saati planlandığı gibi başlamadı, 30 dakika gecikme oldu. Ayrıca bazı vaadedilen ikramlar eksikti.',
    tourName: 'Günbatımı Turu',
    boatName: 'Mavi Rüzgar'
  }
];

const RatingsPage: React.FC = () => {
  const {
    sorting,
    filters,
    totalReviews,
    averageRating,
    lastMonthReviews,
    ratingDistribution,
    sortedReviews,
    setSorting,
    handleFilterChange,
    resetFilters
  } = useRatingsData(mockReviews);

  return (
    <CaptainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Puanlarım ve Yorumlarım</h1>
          <p className="text-muted-foreground">
            Müşterilerinizden aldığınız geri bildirimleri görüntüleyin ve değerlendirme performansınızı takip edin.
          </p>
        </div>

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
      </div>
    </CaptainLayout>
  );
};

export default RatingsPage;
