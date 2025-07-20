import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { Star, Reply, Flag, Trash2, CheckCircle, MessageCircle } from "lucide-react";
import { HoverAnimation } from "./animations/AnimationUtils";

import { ReviewData } from "@/types/ratings.types";
import { ReplyDTO } from "@/types/review.types";

interface ReviewCardProps {
  review: ReviewData;
  onReply: (reviewId: string) => void;
  onFlag: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
  showDeleteButton?: boolean; // Controls whether delete button is visible
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onReply,
  onFlag,
  onDelete,
  showDeleteButton = true, // Default to true for backward compatibility
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [actionStates, setActionStates] = useState({
    reply: false,
    flag: false,
    delete: false,
  });

  // Helper functions for ReviewDTO
  const getUserName = () => {
    return review.customer?.fullName || `Müşteri ${review.customer?.id || review.id}`;
  };

  const getUserInitials = () => {
    const fullName = review.customer?.fullName;
    if (!fullName) return "M";
    
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getCategory = (): "boat" | "tour" => {
    return review.boatId ? "boat" : "tour";
  };

  const getEntityName = () => {
    return review.boatName || review.tourName || "Bilinmeyen";
  };

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
        aria-label={`${getUserName()} tarafından ${getEntityName()} için yapılan ${review.rating} yıldızlı değerlendirme`}
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
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </HoverAnimation>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-montserrat font-semibold text-gray-900 text-sm xs:text-base truncate">
                  {getUserName()}
                </h4>
                {/* Verification status - can be added to ReviewDTO later if needed */}
              </div>
              <p className="text-xs xs:text-sm text-gray-500 font-roboto">
                <time
                  dateTime={review.createdAt}
                  aria-label={`Değerlendirme tarihi: ${formatDate(
                    review.createdAt
                  )}`}
                >
                  {formatDate(review.createdAt)}
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
            variant={getCategoryColor(getCategory())}
            className="font-montserrat font-medium text-xs xs:text-sm"
          >
            {getCategoryLabel(getCategory())}
          </Badge>
          <Badge
            variant="outline"
            className="font-roboto text-xs xs:text-sm truncate max-w-32 xs:max-w-none"
          >
            {getEntityName()}
          </Badge>
        </div>

        {/* Review Comment */}
        <div className="mb-4">
          <ExpandableText
            text={review.comment}
            maxLength={200}
            className="text-gray-700 font-roboto leading-relaxed"
          />
        </div>

        {/* Replies Section */}
        {review.replies && review.replies.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <MessageCircle className="h-4 w-4" />
              <span>Kaptan Yanıtları ({review.replies.length})</span>
            </div>
            
            <div className="space-y-3">
              {review.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-blue-50 border-l-4 border-blue-200 rounded-r-lg p-4 ml-4"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 bg-blue-100 border-2 border-blue-200 flex-shrink-0">
                      <AvatarFallback className="bg-blue-500 text-white font-montserrat font-semibold text-xs">
                        {reply.userFullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-montserrat font-semibold text-blue-900 text-sm">
                            {reply.userFullName}
                          </h5>
                          {reply.isOfficial && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resmi Yanıt
                            </Badge>
                          )}
                        </div>
                        <time
                          dateTime={reply.createdAt}
                          className="text-xs text-blue-600 font-roboto"
                        >
                          {formatDate(reply.createdAt)}
                        </time>
                      </div>
                      
                      <p className="text-blue-800 font-roboto text-sm leading-relaxed">
                        {reply.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0 pt-4 border-t border-gray-100">
          {/* Helpful Count - Not available in ReviewDTO */}
          <div className="text-xs xs:text-sm text-gray-500 font-roboto">
            {/* Helpful count feature can be added later if needed */}
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
              aria-label={`${getUserName()} kullanıcısının değerlendirmesini bayrakla`}
            >
              <Flag className="h-3 w-3 xs:h-4 xs:w-4 mr-1" aria-hidden="true" />
              <span className="hidden xs:inline">Bayrakla</span>
            </Button>
            {showDeleteButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(review.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 text-xs xs:text-sm px-2 xs:px-3"
                aria-label={`${getUserName()} kullanıcısının değerlendirmesini sil`}
              >
                <Trash2
                  className="h-3 w-3 xs:h-4 xs:w-4 mr-1"
                  aria-hidden="true"
                />
                <span className="hidden xs:inline">Sil</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </HoverAnimation>
  );
};

export default ReviewCard;
