import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Clock, TrendingUp, Activity } from "lucide-react";
import { ComponentErrorWrapper } from "@/components/admin/ratings/errors/ErrorStates";
import { RecentActivityEmpty } from "@/components/admin/ratings/empty/EmptyStates";
import { MockReviewData } from "@/types/ratings.types";

interface RecentActivityCardProps {
  recentReviews: MockReviewData[];
  totalRecentCount: number;
  averageRecentRating: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  recentReviews,
  totalRecentCount,
  averageRecentRating,
  trend,
}) => {
  const [hasError, setHasError] = useState(false);
  // Format timestamp to Turkish format
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Az önce";
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else if (diffInDays === 1) {
      return "Dün";
    } else if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    } else {
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
    }
  };

  // Get category badge color
  const getCategoryBadgeColor = (category: "boat" | "tour"): string => {
    return category === "boat"
      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
      : "bg-green-100 text-green-800 hover:bg-green-200";
  };

  // Get category display text
  const getCategoryText = (category: "boat" | "tour"): string => {
    return category === "boat" ? "Tekne" : "Tur";
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!trend) return null;

    const colorClass = trend.isPositive ? "text-green-500" : "text-red-500";
    const bgClass = trend.isPositive ? "bg-green-50" : "bg-red-50";

    return (
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgClass}`}
      >
        <TrendingUp
          size={12}
          className={`${colorClass} ${!trend.isPositive ? "rotate-180" : ""}`}
        />
        <span className={`text-xs font-medium ${colorClass}`}>
          {Math.abs(trend.value)}%
        </span>
      </div>
    );
  };

  return (
    <ComponentErrorWrapper
      componentName="Son Aktivite Kartı"
      onError={() => setHasError(true)}
    >
      <Card
        className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2"
        role="region"
        aria-labelledby="recent-activity-title"
      >
        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"
          aria-hidden="true"
        />

        <CardHeader className="relative pb-4">
          <CardTitle
            id="recent-activity-title"
            className="text-base xs:text-lg font-montserrat text-gray-900 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0"
          >
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 xs:p-2 rounded-lg bg-primary/10"
                aria-hidden="true"
              >
                <Activity className="w-4 h-4 xs:w-5 xs:h-5 text-primary" />
              </div>
              Son Aktivite
            </div>
            {getTrendIndicator()}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Activity Summary */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0 p-2 xs:p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-gray-500" aria-hidden="true" />
                <span className="text-xs xs:text-sm text-gray-600 font-roboto">
                  Son 7 gün
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 xs:gap-4">
              <div
                className="text-center"
                role="status"
                aria-label={`${totalRecentCount} yeni değerlendirme`}
              >
                <div className="text-base xs:text-lg font-bold text-gray-900 font-montserrat">
                  {totalRecentCount}
                </div>
                <div className="text-xs text-gray-500 font-roboto">
                  Yeni değerlendirme
                </div>
              </div>
              <div
                className="text-center"
                role="status"
                aria-label={`Ortalama puan ${averageRecentRating.toFixed(1)}`}
              >
                <div className="text-base xs:text-lg font-bold text-gray-900 font-montserrat flex items-center gap-1">
                  {averageRecentRating.toFixed(1)}
                  <Star
                    size={12}
                    className="fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-xs text-gray-500 font-roboto">
                  Ortalama puan
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews List */}
          <div className="space-y-2 xs:space-y-3">
            <h4
              id="recent-reviews-heading"
              className="text-xs xs:text-sm font-medium text-gray-700 font-montserrat"
            >
              Son Değerlendirmeler
            </h4>

            {recentReviews.length === 0 ? (
              <div
                className="text-center py-4 xs:py-6"
                role="status"
                aria-label="Son 7 günde yeni değerlendirme bulunmuyor"
              >
                <div className="text-gray-400 mb-2" aria-hidden="true">
                  <Activity size={24} className="mx-auto xs:w-8 xs:h-8" />
                </div>
                <p className="text-xs xs:text-sm text-gray-500 font-roboto">
                  Son 7 günde yeni değerlendirme bulunmuyor
                </p>
              </div>
            ) : (
              <div
                className="space-y-2 max-h-48 xs:max-h-64 overflow-y-auto"
                role="list"
                aria-labelledby="recent-reviews-heading"
                tabIndex={0}
                aria-label="Son değerlendirmeler listesi, kaydırılabilir"
              >
                {recentReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors duration-200 focus-within:bg-white/50"
                    role="listitem"
                    aria-label={`${review.userName} tarafından ${review.entityName} için ${review.rating} yıldızlı değerlendirme`}
                  >
                    {/* User Avatar */}
                    <Avatar className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0">
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {review.userInitials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 xs:gap-2 min-w-0">
                          <span className="text-xs xs:text-sm font-medium text-gray-900 font-montserrat truncate">
                            {review.userName}
                          </span>
                          <div
                            role="img"
                            aria-label={`${review.rating} yıldız`}
                          >
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <time
                          className="text-xs text-gray-500 font-roboto flex-shrink-0"
                          dateTime={review.date}
                          aria-label={`Değerlendirme zamanı: ${formatTimestamp(
                            review.date
                          )}`}
                        >
                          {formatTimestamp(review.date)}
                        </time>
                      </div>

                      <div className="flex items-center gap-1 xs:gap-2 mb-1 xs:mb-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-1.5 xs:px-2 py-0.5 ${getCategoryBadgeColor(
                            review.category
                          )}`}
                        >
                          {getCategoryText(review.category)}
                        </Badge>
                        <span className="text-xs text-gray-600 font-roboto truncate">
                          {review.entityName}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 font-roboto line-clamp-2">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recentReviews.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-gray-500 font-roboto">
                  +{recentReviews.length - 5} daha fazla değerlendirme
                </span>
              </div>
            )}
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </CardContent>
      </Card>
    </ComponentErrorWrapper>
  );
};

export default RecentActivityCard;
