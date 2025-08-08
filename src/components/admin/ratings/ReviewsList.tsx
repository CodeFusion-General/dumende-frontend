
import React from 'react';
import ReviewCard from './ReviewCard';
import { ReviewData } from '@/types/ratings.types';

interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  tourName?: string;
  boatName?: string;
}

interface ReviewsListProps {
  reviews: Review[];
  onReply?: (reviewId: string) => void;
  onFlag?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  showDeleteButton?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  onReply,
  onFlag,
  onDelete,
  showDeleteButton = false,
}) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-600 mb-1">Henüz Yorum Yok</h3>
        <p className="text-gray-500">Müşterilerinizden aldığınız yorumlar burada görünecek.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={{
            id: Number(review.id),
            customer: {
              id: 0,
              fullName: review.userName,
              phoneNumber: '',
            },
            boatName: review.boatName,
            tourName: review.tourName,
            rating: review.rating,
            comment: review.comment,
            reviewDate: review.date,
            isActive: true,
            createdAt: review.date,
            updatedAt: review.date,
          } as ReviewData}
          onReply={onReply ?? (() => {})}
          onFlag={onFlag ?? (() => {})}
          onDelete={onDelete ?? (() => {})}
          showDeleteButton={showDeleteButton}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
