import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { TourCardSkeleton } from "./TourCardSkeleton";

interface TourListingSkeletonProps {
  viewMode?: "grid" | "list";
  itemCount?: number;
}

export const TourListingSkeleton: React.FC<TourListingSkeletonProps> = ({
  viewMode = "grid",
  itemCount = 12,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5">
      {/* Header Skeleton */}
      <div className="bg-white/40 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4">
          <div className="h-10 w-24 bg-white/20 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,152,219,0.1),transparent_50%)]" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center space-y-6 animate-pulse">
            <div className="h-12 w-80 bg-white/20 rounded-lg mx-auto animate-pulse"></div>
            <div className="h-6 w-96 bg-white/20 rounded-lg mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar Skeleton */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Search Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-6 w-16 bg-gray-300/50 rounded animate-pulse mb-4"></div>
              <div className="h-10 w-full bg-gray-300/50 rounded-lg animate-pulse"></div>
            </GlassCard>

            {/* Filter Sections Skeleton */}
            {[1, 2, 3, 4].map((section) => (
              <GlassCard
                key={section}
                className="bg-white/40 backdrop-blur-sm border border-white/20 p-6"
              >
                <div className="h-6 w-24 bg-gray-300/50 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-300/50 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-300/50 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}

            {/* Price Range Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-6 w-20 bg-gray-300/50 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-gray-300/50 rounded-full animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="h-4 w-12 bg-gray-300/50 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="flex-1">
            {/* Listing Header Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 mb-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-32 bg-gray-300/50 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-300/50 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* View mode toggles skeleton */}
                  <div className="flex bg-white/20 rounded-lg p-1">
                    <div className="w-10 h-8 bg-gray-300/50 rounded animate-pulse mr-1"></div>
                    <div className="w-10 h-8 bg-gray-300/50 rounded animate-pulse"></div>
                  </div>
                  {/* Sort dropdown skeleton */}
                  <div className="h-10 w-32 bg-gray-300/50 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </GlassCard>

            {/* Tour Grid/List Skeleton */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: itemCount }).map((_, index) => (
                  <TourCardSkeleton key={index} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from({ length: itemCount }).map((_, index) => (
                  <TourCardSkeleton key={index} viewMode="list" />
                ))}
              </div>
            )}

            {/* Pagination Skeleton */}
            <div className="flex justify-center items-center space-x-2 mt-12">
              <div className="h-10 w-10 bg-gray-300/50 rounded-lg animate-pulse"></div>
              <div className="h-10 w-8 bg-gray-300/50 rounded-lg animate-pulse"></div>
              <div className="h-10 w-8 bg-gray-300/50 rounded-lg animate-pulse"></div>
              <div className="h-10 w-8 bg-gray-300/50 rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-300/50 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourListingSkeleton;
