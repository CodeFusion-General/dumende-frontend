import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { reviewService, reviewQueryService } from "@/services/reviewService";
import { ReplyDTO } from "@/types/review.types";
import { ReviewsSkeleton } from "@/components/ui/LoadingStates";
import { ReviewsError } from "@/components/ui/ErrorStates";
import { useRetry } from "@/hooks/useRetry";
import {
  useMicroInteractions,
  useScrollAnimation,
} from "@/hooks/useMicroInteractions";
import { VisualFeedback, AnimatedButton } from "@/components/ui/VisualFeedback";

interface Review {
  id: number;
  userName: string;
  userImage?: string;
  rating: number;
  date: string;
  comment: string;
  replies?: ReplyDTO[];
}

interface ReviewsProps {
  boatId?: number;
}

// Helper component for star rating display
const StarRating: React.FC<{ rating: number; size?: "sm" | "md" | "lg" }> = ({
  rating,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 fill-gray-300"
          )}
        />
      ))}
    </div>
  );
};

// Helper component for professional user avatar
const UserAvatar: React.FC<{
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ name, image, size = "md", className }) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientClass = (name: string) => {
    const gradients = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-red-500 to-red-600",
    ];

    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "border-2 border-white shadow-md",
        className
      )}
    >
      {image ? (
        <AvatarImage src={image} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback
        className={cn("font-semibold text-white", getGradientClass(name))}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

const Reviews: React.FC<ReviewsProps> = ({ boatId }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Micro-interactions
  const { staggerAnimation, fadeIn, prefersReducedMotion } =
    useMicroInteractions();
  const { elementRef: reviewsRef, isVisible } = useScrollAnimation(0.3);
  const reviewCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Memoize boatId to prevent unnecessary re-renders
  const memoizedBoatId = useMemo(() => boatId, [boatId]);

  // Stable fetch functions using useCallback to prevent infinite loops
  const fetchReviews = useCallback(async () => {
    if (!memoizedBoatId) return [];

    const reviewDtos = await reviewService.getBoatReviews(memoizedBoatId);

    // Fetch replies for each review with individual error handling
    const reviewsWithReplies = await Promise.all(
      reviewDtos.map(async (review) => {
        try {
          const replies = await reviewQueryService.getRepliesByReviewId(
            review.id
          );
          return {
            id: review.id,
            userName: review.customer.fullName,
            userImage: review.customer.profileImage,
            rating: review.rating,
            date: new Date(review.createdAt).toLocaleDateString(),
            comment: review.comment,
            replies: replies,
          };
        } catch (error) {
          console.warn(
            `Failed to fetch replies for review ${review.id}:`,
            error
          );
          return {
            id: review.id,
            userName: review.customer.fullName,
            userImage: review.customer.profileImage,
            rating: review.rating,
            date: new Date(review.createdAt).toLocaleDateString(),
            comment: review.comment,
            replies: [],
          };
        }
      })
    );

    return reviewsWithReplies;
  }, [memoizedBoatId]);

  const fetchAverageRating = useCallback(async () => {
    if (!memoizedBoatId) return 0;

    const average = await reviewService.getBoatRating(memoizedBoatId);
    return average === null || average === undefined ? 0 : average;
  }, [memoizedBoatId]);

  // Single useEffect with proper cleanup and dependency management
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchData = async () => {
      if (!memoizedBoatId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch both reviews and rating in parallel with abort signal
        const [reviewsData, ratingData] = await Promise.all([
          fetchReviews(),
          fetchAverageRating(),
        ]);

        if (isMounted && !abortController.signal.aborted) {
          setReviews(reviewsData);
          setReviewCount(reviewsData.length);
          setAverageRating(ratingData);
          setError(null);
        }
      } catch (error) {
        if (isMounted && !abortController.signal.aborted) {
          console.error("Error fetching review data:", error);
          setError("Unable to load reviews. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [memoizedBoatId, fetchReviews, fetchAverageRating]);

  // Animate reviews when they come into view
  useEffect(() => {
    if (isVisible && !prefersReducedMotion && reviews.length > 0) {
      const validRefs = reviewCardRefs.current.filter(
        (ref) => ref !== null
      ) as HTMLElement[];
      if (validRefs.length > 0) {
        staggerAnimation(validRefs, "slideInUp", 200);
      }
    }
  }, [isVisible, staggerAnimation, prefersReducedMotion, reviews.length]);

  // Retry function for manual retries
  const handleRetry = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [reviewsData, ratingData] = await Promise.all([
        fetchReviews(),
        fetchAverageRating(),
      ]);
      setReviews(reviewsData);
      setReviewCount(reviewsData.length);
      setAverageRating(ratingData);
      setError(null);
    } catch (err) {
      console.error("Retry failed:", err);
      setError("Unable to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchReviews, fetchAverageRating]);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Yorumlar</h2>
        </div>
        <ReviewsSkeleton />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Yorumlar</h2>
        </div>
        <ReviewsError
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Yorumlar</h2>

        {/* Prominent Overall Rating Display */}
        {reviews.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                    {averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={Math.round(averageRating)} size="lg" />
                </div>
                <div className="border-l border-gray-300 pl-4 sm:pl-6">
                  <div className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {reviewCount} Yorum
                  </div>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Müşteri deneyimlerini keşfedin
                  </p>
                </div>
              </div>
              <div className="flex sm:hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>Doğrulanmış yorumlar</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Henüz yorum yapılmamış
              </h3>
              <p className="text-gray-500">
                Bu tekne için ilk yorumu siz yapın ve deneyiminizi paylaşın.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Individual Review Cards */}
          <div ref={reviewsRef} className="space-y-4 sm:space-y-6">
            {displayedReviews.map((review, index) => (
              <VisualFeedback
                key={review.id ?? index}
                variant="lift"
                intensity="sm"
                className="opacity-0 animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card
                  ref={(el) => (reviewCardRefs.current[index] = el)}
                  className="p-4 sm:p-6 bg-white border border-gray-200 shadow-sm transition-all duration-300 rounded-xl"
                >
                  {/* Review Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <UserAvatar
                        name={review.userName}
                        image={review.userImage}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {review.userName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200 w-fit"
                          >
                            Doğrulanmış
                          </Badge>
                        </div>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 w-fit sm:flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-yellow-700">
                        {review.rating}
                      </span>
                    </div>
                  </div>

                  {/* Review Content with Expandable Text */}
                  <div className="mb-4">
                    <ExpandableText
                      text={review.comment}
                      maxLength={200}
                      className="text-gray-700 leading-relaxed"
                    />
                  </div>

                  {/* Enhanced Captain Replies Section */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                        <MessageCircle className="h-4 w-4" />
                        <span>Kaptan Yanıtları ({review.replies.length})</span>
                      </div>

                      <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                        {review.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl p-4 border border-blue-100 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <UserAvatar
                                name={reply.userFullName}
                                size="sm"
                                className="bg-blue-100 border-blue-200"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-blue-900">
                                      {reply.userFullName}
                                    </h5>
                                    {reply.isOfficial && (
                                      <Badge className="text-xs bg-blue-600 text-white border-0 hover:bg-blue-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Resmi Yanıt
                                      </Badge>
                                    )}
                                  </div>
                                  <time
                                    dateTime={reply.createdAt}
                                    className="text-xs text-blue-600 font-medium"
                                  >
                                    {new Date(
                                      reply.createdAt
                                    ).toLocaleDateString()}
                                  </time>
                                </div>

                                <ExpandableText
                                  text={reply.message}
                                  maxLength={150}
                                  className="text-blue-800 leading-relaxed"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </VisualFeedback>
            ))}
          </div>

          {/* Show More/Less Button */}
          {reviews.length > 3 && (
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md touch-manipulation min-h-[44px]"
              >
                {showAllReviews ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span className="hidden xs:inline">Daha az göster</span>
                    <span className="xs:hidden">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span className="hidden xs:inline">
                      Tüm yorumları göster ({reviews.length - 3} daha)
                    </span>
                    <span className="xs:hidden">
                      Show All ({reviews.length - 3})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;
