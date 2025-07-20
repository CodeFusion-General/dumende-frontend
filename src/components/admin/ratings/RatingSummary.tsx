import React from "react";
import { Star, Users, Calendar } from "lucide-react";
import RatingsSummaryCard from "@/components/admin/ratings/RatingsSummaryCard";

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  lastMonthReviews: number;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({
  averageRating,
  totalReviews,
  lastMonthReviews,
}) => {
  // Calculate trend data (mock data for demonstration)
  const averageRatingTrend = {
    value: 8.5,
    isPositive: true,
  };

  const totalReviewsTrend = {
    value: 12.3,
    isPositive: true,
  };

  const monthlyTrend = {
    value: 5.2,
    isPositive: lastMonthReviews > 50,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RatingsSummaryCard
        icon={<Star className="w-6 h-6" />}
        title="Ortalama Puan"
        value={averageRating}
        subtitle="5.0 üzerinden"
        trend={averageRatingTrend}
        gradient="from-yellow-100 to-yellow-50"
        animateValue={true}
      />

      <RatingsSummaryCard
        icon={<Users className="w-6 h-6" />}
        title="Toplam Değerlendirme"
        value={totalReviews}
        subtitle="toplam yorum"
        trend={totalReviewsTrend}
        gradient="from-blue-100 to-blue-50"
        animateValue={true}
      />

      <RatingsSummaryCard
        icon={<Calendar className="w-6 h-6" />}
        title="Son 30 Gün"
        value={lastMonthReviews}
        subtitle="yeni yorum"
        trend={monthlyTrend}
        gradient="from-green-100 to-green-50"
        animateValue={true}
      />
    </div>
  );
};

export default RatingSummary;
