import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TourCardSkeletonProps {
  viewMode: "grid" | "list";
  variant?: "homepage" | "listing";
}

export const TourCardSkeleton: React.FC<TourCardSkeletonProps> = ({
  viewMode,
  variant = "listing",
}) => {
  if (viewMode === "grid") {
    return <TourCardGridSkeleton variant={variant} />;
  }
  return <TourCardListSkeleton variant={variant} />;
};

const TourCardGridSkeleton: React.FC<{
  variant?: "homepage" | "listing";
}> = ({ variant = "listing" }) => {
  return (
    <GlassCard className="overflow-hidden bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl h-full flex flex-col animate-pulse">
      {/* Image Section Skeleton */}
      <div className="relative overflow-hidden h-60 flex-shrink-0">
        <div className="w-full h-full bg-gradient-to-r from-gray-200/50 via-gray-300/50 to-gray-200/50 animate-pulse" />

        {/* Status badge skeleton */}
        <div className="absolute top-4 left-4 w-20 h-7 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />

        {/* Heart button skeleton - Hidden on homepage */}
        {variant !== "homepage" && (
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
        )}

        {/* Compare button skeleton - Hidden on homepage */}
        {variant !== "homepage" && (
          <div className="absolute bottom-4 right-4 w-24 h-8 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
        )}
      </div>

      {/* Content Section Skeleton */}
      <div className="p-6 bg-gradient-to-b from-white/20 to-white/40 backdrop-blur-sm flex-1 flex flex-col">
        {/* Title and rating skeleton */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-2">
            <div className="h-6 w-3/4 bg-gray-300/50 rounded animate-pulse mb-1" />
            <div className="h-4 w-1/2 bg-gray-300/50 rounded animate-pulse" />
          </div>
          <div className="w-16 h-8 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse flex-shrink-0" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center mb-4">
          <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse mr-2" />
          <div className="h-4 w-32 bg-gray-300/50 rounded animate-pulse" />
        </div>

        {/* Capacity and date skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse mr-2" />
            <div className="h-4 w-16 bg-gray-300/50 rounded animate-pulse" />
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse mr-2" />
            <div className="h-4 w-20 bg-gray-300/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Features section skeleton */}
        <div className="flex-1 mb-6">
          <div className="flex flex-wrap gap-2 h-16 overflow-hidden items-start content-start">
            <div className="h-7 w-20 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
            <div className="h-7 w-24 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
          </div>
        </div>

        {/* Price and button skeleton */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
          <div>
            <div className="h-6 w-24 bg-gray-300/50 rounded animate-pulse mb-1" />
            <div className="h-3 w-8 bg-gray-300/50 rounded animate-pulse" />
          </div>
          <div className="w-20 h-10 bg-gradient-to-r from-gray-300/50 to-gray-400/50 rounded-xl animate-pulse" />
        </div>
      </div>
    </GlassCard>
  );
};

const TourCardListSkeleton: React.FC<{
  variant?: "homepage" | "listing";
}> = ({ variant = "listing" }) => {
  return (
    <GlassCard className="overflow-hidden bg-white/40 backdrop-blur-sm border border-white/20 shadow-xl animate-pulse">
      <div className="flex">
        {/* Image Section Skeleton */}
        <div className="relative w-64 h-48 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-r from-gray-200/50 via-gray-300/50 to-gray-200/50 animate-pulse" />

          {/* Status badge skeleton */}
          <div className="absolute top-4 left-4 w-20 h-7 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />

          {/* Heart button skeleton - Hidden on homepage */}
          {variant !== "homepage" && (
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
          )}
        </div>

        {/* Content Section Skeleton */}
        <div className="flex-1 p-6 bg-gradient-to-r from-white/20 to-white/40 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mr-4">
              <div className="h-7 w-3/4 bg-gray-300/50 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-gray-300/50 rounded animate-pulse" />
            </div>
            <div className="w-16 h-8 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
          </div>

          {/* Location skeleton */}
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse mr-2" />
            <div className="h-4 w-40 bg-gray-300/50 rounded animate-pulse" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-gray-300/50 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-300/50 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-gray-300/50 rounded animate-pulse" />
          </div>

          {/* Features skeleton */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="h-6 w-20 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
            <div className="h-6 w-16 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
            <div className="h-6 w-24 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 animate-pulse" />
          </div>

          {/* Bottom section skeleton */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse mr-2" />
                <div className="h-4 w-16 bg-gray-300/50 rounded animate-pulse" />
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse mr-2" />
                <div className="h-4 w-20 bg-gray-300/50 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <div className="h-6 w-24 bg-gray-300/50 rounded animate-pulse mb-1" />
                <div className="h-3 w-8 bg-gray-300/50 rounded animate-pulse" />
              </div>
              <div className="w-20 h-10 bg-gradient-to-r from-gray-300/50 to-gray-400/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TourCardSkeleton;
