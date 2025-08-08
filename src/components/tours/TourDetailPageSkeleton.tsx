import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TourDetailPageSkeletonProps {
  className?: string;
}

const TourDetailPageSkeleton: React.FC<TourDetailPageSkeletonProps> = ({
  className,
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5 ${
        className || ""
      }`}
    >
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
          <div className="relative animate-pulse">
            <GlassCard className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="aspect-[16/10] relative overflow-hidden bg-gray-300/50 animate-pulse">
                  {/* Image placeholder */}
                  <div className="w-full h-full bg-gradient-to-r from-gray-200/50 via-gray-300/50 to-gray-200/50 animate-pulse"></div>

                  {/* Overlay content skeleton */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-4">
                        {/* Title skeleton */}
                        <div className="h-10 w-80 bg-white/20 rounded-lg animate-pulse"></div>

                        {/* Info badges skeleton */}
                        <div className="flex flex-wrap gap-6">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-8 w-24 bg-white/20 rounded-full animate-pulse"
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Price skeleton */}
                      <div className="text-right space-y-2">
                        <div className="h-8 w-32 bg-white/20 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-20 bg-white/20 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail strip skeleton */}
              <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-20 h-20 bg-gray-300/50 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Grid Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-8 w-32 bg-gray-300/50 rounded-lg animate-pulse mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                  >
                    <div className="w-12 h-12 bg-gray-300/50 rounded-full animate-pulse mb-3"></div>
                    <div className="h-4 w-16 bg-gray-300/50 rounded animate-pulse mb-1"></div>
                    <div className="h-5 w-20 bg-gray-300/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Description Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-8 w-40 bg-gray-300/50 rounded-lg animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-300/50 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-300/50 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-300/50 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-300/50 rounded animate-pulse"></div>
              </div>
            </GlassCard>

            {/* Location Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-8 w-48 bg-gray-300/50 rounded-lg animate-pulse mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                  >
                    <div className="w-5 h-5 bg-gray-300/50 rounded animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-gray-300/50 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-300/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map skeleton */}
              <div className="mt-6">
                <div className="h-6 w-16 bg-gray-300/50 rounded animate-pulse mb-3"></div>
                <div className="h-64 w-full bg-gray-300/50 rounded-xl animate-pulse"></div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Booking Form Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-6 w-32 bg-gray-300/50 rounded-lg animate-pulse mb-6"></div>

              {/* Calendar skeleton */}
              <div className="mb-6">
                <div className="h-64 w-full bg-gray-300/50 rounded-lg animate-pulse"></div>
              </div>

              {/* Info cards skeleton */}
              <div className="space-y-4 mb-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                  >
                    <div className="h-4 w-24 bg-gray-300/50 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-32 bg-gray-300/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Button skeleton */}
              <div className="h-12 w-full bg-gray-300/50 rounded-xl animate-pulse"></div>
            </GlassCard>

            {/* Summary Skeleton */}
            <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
              <div className="h-6 w-24 bg-gray-300/50 rounded-lg animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                  >
                    <div className="h-4 w-20 bg-gray-300/50 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-300/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPageSkeleton;
