
import React from 'react';
import ReviewCard from './ReviewCard';

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
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
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
          userName={review.userName}
          date={review.date}
          rating={review.rating}
          comment={review.comment}
          tourName={review.tourName}
          boatName={review.boatName}
        />
      ))}
    </div>
  );
};

export default ReviewsList;
