// Simplified Testimonials Component for Low-End Devices
// Reduced complexity version with minimal animations and optimized rendering

import React, { memo, useMemo } from "react";
import { Star } from "lucide-react";
import { useSimplifiedUI } from "../../hooks/useLowEndOptimization";

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string;
  boatName?: string;
}

interface SimplifiedTestimonialsProps {
  reviews?: Review[];
  maxReviews?: number;
  showBoatName?: boolean;
  className?: string;
}

// Memoized star component to prevent re-renders
const StarRating = memo(({ rating }: { rating: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  }, [rating]);

  return <div className="flex gap-0.5">{stars}</div>;
});

StarRating.displayName = "StarRating";

// Simplified review card with minimal styling
const SimplifiedReviewCard = memo(({ review }: { review: Review }) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-3 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <StarRating rating={review.rating} />
          <p className="text-sm font-medium text-gray-900 mt-1">
            {review.customerName}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(review.date).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

      {review.boatName && (
        <p className="text-xs text-gray-500 mt-2">Boat: {review.boatName}</p>
      )}
    </div>
  );
});

SimplifiedReviewCard.displayName = "SimplifiedReviewCard";

export const SimplifiedTestimonials: React.FC<SimplifiedTestimonialsProps> = ({
  reviews = [],
  maxReviews = 3,
  showBoatName = false,
  className = "",
}) => {
  const { shouldSimplify, config, getProps } = useSimplifiedUI("Testimonials");

  // Get optimized props for low-end devices
  const optimizedProps = getProps({
    reviews,
    maxReviews,
    showBoatName,
    className,
  });

  // Filter and limit reviews for performance
  const displayReviews = useMemo(() => {
    const filteredReviews = optimizedProps.reviews
      .filter((review: Review) => review.rating >= 4) // Only show good reviews
      .slice(
        0,
        shouldSimplify
          ? Math.min(3, optimizedProps.maxReviews)
          : optimizedProps.maxReviews
      );

    return filteredReviews;
  }, [optimizedProps.reviews, optimizedProps.maxReviews, shouldSimplify]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (displayReviews.length === 0) return 0;
    const sum = displayReviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / displayReviews.length) * 10) / 10;
  }, [displayReviews]);

  if (displayReviews.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-8 ${optimizedProps.className}`}
      data-component="Testimonials"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Simplified header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Customer Reviews
          </h2>
          <div className="flex items-center justify-center gap-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-gray-600">
              {averageRating} ({displayReviews.length} reviews)
            </span>
          </div>
        </div>

        {/* Reviews list - simple vertical layout */}
        <div className="space-y-0">
          {displayReviews.map((review) => (
            <SimplifiedReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Simple call-to-action */}
        {!config.disableNonEssentialFeatures && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Join our satisfied customers and book your yacht today!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

// Default export with memo for performance
export default memo(SimplifiedTestimonials);
