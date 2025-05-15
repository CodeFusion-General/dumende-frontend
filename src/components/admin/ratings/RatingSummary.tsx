
import React from 'react';
import { Star, Users, Calendar } from 'lucide-react';
import RatingsSummaryCard from '@/components/admin/ratings/RatingsSummaryCard';

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  lastMonthReviews: number;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ 
  averageRating, 
  totalReviews, 
  lastMonthReviews 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RatingsSummaryCard
        icon={<Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />}
        title="Ortalama Puan"
        value={
          <div className="flex items-center justify-center">
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-gray-400 text-base">/5.0</span>
          </div>
        }
      />
      
      <RatingsSummaryCard
        icon={<Users className="w-8 h-8" />}
        title="Toplam Değerlendirme"
        value={`${totalReviews} yorum`}
      />
      
      <RatingsSummaryCard
        icon={<Calendar className="w-8 h-8" />}
        title="Son 30 Gün"
        value={`${lastMonthReviews} yeni yorum`}
      />
    </div>
  );
};

export default RatingSummary;
