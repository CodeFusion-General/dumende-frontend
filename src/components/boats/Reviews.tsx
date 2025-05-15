
import React, { useState } from "react";
import { Star, ChevronDown, ChevronUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ExpandableText } from "@/components/ui/ExpandableText";

interface Review {
  id: string;
  userName: string;
  userImage?: string;
  rating: number;
  date: string;
  comment: string;
}

interface ReviewsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const Reviews: React.FC<ReviewsProps> = ({ reviews, averageRating, reviewCount }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
      <div className="flex items-center mb-6">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <span className="ml-1 font-medium">{averageRating}</span>
        <span className="text-gray-500 ml-1">({reviewCount} reviews)</span>
      </div>
      
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <Card key={review.id} className="p-4">
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
  );
};

export default Reviews;
