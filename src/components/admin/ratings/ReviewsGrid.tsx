import React, { useState, useMemo } from "react";
import { MockReviewData } from "@/types/ratings.types";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare, Star } from "lucide-react";

interface ReviewsGridProps {
  reviews: MockReviewData[];
  loading?: boolean;
  onReply: (reviewId: string) => void;
  onFlag: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
  onRefresh?: () => void;
  itemsPerPage?: number;
}

const ReviewsGrid: React.FC<ReviewsGridProps> = ({
  reviews,
  loading = false,
  onReply,
  onFlag,
  onDelete,
  onRefresh,
  itemsPerPage = 12,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  // Reset to first page when reviews change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [reviews]);

  // Generate pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          items.push(i);
        }
        items.push("ellipsis");
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        items.push(1);
        items.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        // Show middle pages
        items.push(1);
        items.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push("ellipsis");
        items.push(totalPages);
      }
    }

    return items;
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading skeleton component
  const ReviewCardSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded" />
          ))}
        </div>
      </div>

      {/* Tags skeleton */}
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageSquare className="h-12 w-12 text-gray-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-montserrat font-semibold text-gray-900 mb-2">
          Henüz değerlendirme bulunmuyor
        </h3>

        {/* Description */}
        <p className="text-gray-500 font-roboto mb-6 leading-relaxed">
          Seçilen filtrelere uygun değerlendirme bulunamadı. Filtreleri
          değiştirerek tekrar deneyebilir veya tüm değerlendirmeleri
          görüntüleyebilirsiniz.
        </p>

        {/* Action button */}
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            className="font-montserrat"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="space-y-4 xs:space-y-6"
      role="region"
      aria-label="Değerlendirmeler listesi"
    >
      {/* Results summary */}
      {!loading && reviews.length > 0 && (
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-xs xs:text-sm text-gray-600 font-roboto">
          <span role="status" aria-live="polite">
            Toplam {reviews.length} değerlendirmeden {startIndex + 1}-
            {Math.min(endIndex, reviews.length)} arası gösteriliyor
          </span>
          <span aria-label={`Sayfa ${currentPage} / ${totalPages}`}>
            Sayfa {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {/* Grid container */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-6"
        role="list"
        aria-label="Değerlendirme kartları"
      >
        {loading ? (
          // Loading skeletons
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <ReviewCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : reviews.length === 0 ? (
          // Empty state
          <EmptyState />
        ) : (
          // Review cards
          currentReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReply={onReply}
              onFlag={onFlag}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && reviews.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              {/* Previous button */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={`cursor-pointer ${
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-gray-50"
                  }`}
                />
              </PaginationItem>

              {/* Page numbers */}
              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(item as number)}
                      isActive={currentPage === item}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next button */}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={`cursor-pointer ${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-gray-50"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Load more info for large datasets */}
      {!loading && reviews.length > 100 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 font-roboto">
            Performans için sayfalama kullanılmaktadır. Tüm sonuçları görmek
            için filtreleri kullanın.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsGrid;
