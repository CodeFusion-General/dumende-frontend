
import React, { useState, useEffect } from "react";
import { Star, ChevronDown, ChevronUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { reviewService } from "@/services/reviewService";
interface Review {
  id: number;
  userName: string;
  userImage?: string;
  rating: number;
  date: string;
  comment: string;
}

interface ReviewsProps {
  boatId?: number;
}

const Reviews: React.FC<ReviewsProps> = ({ boatId }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  useEffect(() => {
    const fetchReviews = async () => {
      if (!boatId) return;
      try {
        const reviewDtos = await reviewService.getBoatReviews(boatId);
        const reviews: Review[] = reviewDtos.map((review) => ({
          id: review.id,
          userName: review.customer.fullName,
          rating: review.rating,
          date: new Date(review.createdAt).toLocaleDateString(),
          comment: review.comment,
        }));
        setReviews(reviews);
        setReviewCount(reviews.length);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const fetchAverageRating = async () => {
      if (!boatId) return;
      try {
        const average = await reviewService.getBoatRating(boatId);
        if (average === null || average === undefined) {
          setAverageRating(0);
          return;
        }
        setAverageRating(average);
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    fetchReviews();
    fetchAverageRating();
  }, [boatId]);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <>
      {reviews.length === 0 ? (
        <>
        <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Yorumlar</h2>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Henüz yorum yapılmamış.</p>
        </div>
        </>
      ) : (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Yorumlar</h2>
          <div className="flex items-center mb-6">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 font-medium">{averageRating}</span>
            <span className="text-gray-500 ml-1">({reviewCount} yorum)</span>
          </div>
          
          <div className="space-y-6">
            {displayedReviews.map((review, index) => (
              <Card key={review.id ?? index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {review.userImage ? (
                        <img 
                          src={review.userImage} 
                          alt={review.userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm">{review.rating}</span>
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{review.comment}</p>
              </Card>
            ))}
          </div>

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-6 text-primary hover:text-primary/90 font-medium flex items-center"
            >
              {showAllReviews ? (
                <>Show less <ChevronUp className="ml-1 w-4 h-4" /></>
              ) : (
                <>Show all reviews <ChevronDown className="ml-1 w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Reviews;
