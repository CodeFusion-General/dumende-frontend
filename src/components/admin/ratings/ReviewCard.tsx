import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { Star, Reply, Flag, Trash2, CheckCircle } from "lucide-react";
import { HoverAnimation } from "./animations/AnimationUtils";

interface ReviewCardProps {
  review: {
    id: string;
    userName: string;
    userInitials: string;
    date: string;
    rating: number;
    comment: string;
    category: "boat" | "tour";
    entityName: string;
    isVerified: boolean;
    helpfulCount: number;
  };
  onReply: (reviewId: string) => void;
  onFlag: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onReply,
  onFlag,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [actionStates, setActionStates] = useState({
    reply: false,
    flag: false,
    delete: false,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryColor = (category: "boat" | "tour") => {
    return category === "boat" ? "info" : "success";
  };

  const getCategoryLabel = (category: "boat" | "tour") => {
    return category === "boat" ? "Tekne" : "Tur";
  };

  const handleAction = async (action: 'reply' | 'flag' | 'delete', callback: () => void) => {
    setActionStates(prev => ({ ...prev, [action]: true }));
    try {
      await callback();
    } finally {
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [action]: false }));
      }, 500);
    }
  };

  return (
    <HoverAnimation>
      <Card
        className="group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 hover:border-primary/20"
        role="listitem"
        aria-label={`${review.userName} tarafından ${review.entityName} için yapılan ${review.rating} yıldızlı değerlendirme`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <CardContent className="p-4 xs:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 xs:space-x-4 flex-1 min-w-0">
            {/* User Avatar */}
            <HoverAnimation scale={1.1}>
              <Avatar className="h-10 w-10 xs:h-12 xs:w-12 bg-primary/10 border-2 border-primary/20 flex-shrink-0 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-montserrat font-semibold text-xs xs:text-sm">
                  {review.userInitials}
                </AvatarFallback>
              </Avatar>
            </HoverAnimation>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-montserrat font-semibold text-gray-900 text-sm xs:text-base truncate">
                  {review.userName}
                </h4>
                {review.isVerified && (
                  <CheckCircle
                    className="h-4 w-4 text-green-500 flex-shrink-0"
                    aria-label="Doğrulanmış kullanıcı"
                  />
                )}
              </div>
              <p className="text-xs xs:text-sm text-gray-500 font-roboto">
                <time
                  dateTime={review.date}
                  aria-label={`Değerlendirme tarihi: ${formatDate(
                    review.date
                  )}`}
                >
                  {formatDate(review.date)}
                </time>
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div
            className="flex items-center space-x-1 flex-shrink-0 ml-2"
            role="img"
            aria-label={`${review.rating} yıldız üzerinden 5 yıldız`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 xs:h-5 xs:w-5 transition-all duration-300 hover:scale-110 ${
                  i < review.rating
                    ? "text-accent fill-accent group-hover:animate-pulse-gentle"
                    : "text-gray-300 group-hover:text-gray-400"
                }`}
                aria-hidden="true"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <span className="ml-1 xs:ml-2 text-xs xs:text-sm font-medium text-gray-700 sr-only">
              {review.rating}/5
            </span>
          </div>
        </div>

        {/* Category and Entity Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge
            variant={getCategoryColor(review.category)}
            className="font-montserrat font-medium text-xs xs:text-sm"
          >
            {getCategoryLabel(review.category)}
          </Badge>
          <Badge
            variant="outline"
            className="font-roboto text-xs xs:text-sm truncate max-w-32 xs:max-w-none"
          >
            {review.entityName}
          </Badge>
          {review.isVerified && (
            <Badge variant="success" size="sm" className="font-roboto text-xs">
              Doğrulanmış
            </Badge>
          )}
        </div>

        {/* Review Comment */}
        <div className="mb-4">
          <ExpandableText
            text={review.comment}
            maxLength={200}
            className="text-gray-700 font-roboto leading-relaxed"
          />
        </div>

        {/* Footer Section */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0 pt-4 border-t border-gray-100">
          {/* Helpful Count */}
          <div className="text-xs xs:text-sm text-gray-500 font-roboto">
            {review.helpfulCount > 0 && (
              <span
                role="status"
                aria-label={`${review.helpfulCount} kişi bu değerlendirmeyi faydalı buldu`}
              >
                {review.helpfulCount} kişi faydalı buldu
              </span>
            )}
          </div>

          {/* Admin Action Buttons */}
          <div
            className="flex items-center gap-1 xs:gap-2"
            role="group"
            aria-label="Değerlendirme yönetim işlemleri"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(review.id)}
              className="text-primary hover:text-primary-dark hover:bg-primary/10 transition-colors focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 text-xs xs:text-sm px-2 xs:px-3"
              aria-label={`${review.userName} kullanıcısının değerlendirmesini yanıtla`}
            >
              <Reply
                className="h-3 w-3 xs:h-4 xs:w-4 mr-1"
                aria-hidden="true"
              />
              <span className="hidden xs:inline">Yanıtla</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFlag(review.id)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 text-xs xs:text-sm px-2 xs:px-3"
              aria-label={`${review.userName} kullanıcısının değerlendirmesini bayrakla`}
            >
              <Flag className="h-3 w-3 xs:h-4 xs:w-4 mr-1" aria-hidden="true" />
              <span className="hidden xs:inline">Bayrakla</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(review.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 text-xs xs:text-sm px-2 xs:px-3"
              aria-label={`${review.userName} kullanıcısının değerlendirmesini sil`}
            >
              <Trash2
                className="h-3 w-3 xs:h-4 xs:w-4 mr-1"
                aria-hidden="true"
              />
              <span className="hidden xs:inline">Sil</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </HoverAnimation>
  );
};

export default ReviewCard;
