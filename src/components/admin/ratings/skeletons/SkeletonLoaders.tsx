import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Skeleton for RatingsSummaryCard
export const RatingsSummaryCardSkeleton: React.FC = () => (
  <Card className="border-0 shadow-lg">
    <CardContent className="p-6 flex flex-col items-center text-center">
      {/* Icon skeleton */}
      <div className="mb-4 p-3 rounded-full bg-gray-100">
        <Skeleton className="h-6 w-6" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-4 w-24 mb-2" />

      {/* Value skeleton */}
      <Skeleton className="h-8 w-16 mb-2" />

      {/* Subtitle skeleton */}
      <Skeleton className="h-3 w-20 mb-2" />

      {/* Trend skeleton */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-8" />
      </div>
    </CardContent>
  </Card>
);

// Skeleton for RatingDistributionCard
export const RatingDistributionCardSkeleton: React.FC = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-4" />
              ))}
            </div>
            <div className="flex-1">
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Skeleton for RatingTrendsChart
export const RatingTrendsChartSkeleton: React.FC = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-12" />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-8 mx-auto mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton for CategoryBreakdownChart
export const CategoryBreakdownChartSkeleton: React.FC = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton for RecentActivityCard
export const RecentActivityCardSkeleton: React.FC = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-28" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-3" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Skeleton for ReviewCard
export const ReviewCardSkeleton: React.FC = () => (
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

// Skeleton for RatingsHeader
export const RatingsHeaderSkeleton: React.FC = () => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Header content skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Quick stats skeleton */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for ReviewsFilterBar
export const ReviewsFilterBarSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search skeleton */}
      <div className="flex-1">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>

    {/* Active filters skeleton */}
    <div className="flex flex-wrap gap-2 mt-4">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

// Combined skeleton for the entire page
export const RatingsPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <RatingsHeaderSkeleton />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <RatingsSummaryCardSkeleton key={i} />
          ))}
        </div>

        {/* Analytics section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RatingDistributionCardSkeleton />
          <RatingTrendsChartSkeleton />
          <RecentActivityCardSkeleton />
        </div>

        {/* Category breakdown skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdownChartSkeleton />
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
            <Skeleton className="h-32 w-32" />
          </div>
        </div>

        {/* Reviews section skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <ReviewsFilterBarSkeleton />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
