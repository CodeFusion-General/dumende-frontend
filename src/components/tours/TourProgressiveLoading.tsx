import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { TourCardSkeleton } from "./TourCardSkeleton";
import { TourDetailPageSkeleton } from "./TourDetailPageSkeleton";

// Progressive loading wrapper for tour components
interface ProgressiveLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton: React.ReactNode;
  delay?: number;
  minLoadingTime?: number;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  isLoading,
  skeleton,
  delay = 0,
  minLoadingTime = 500,
}) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setLoadingStartTime(Date.now());
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Ensure minimum loading time for better UX
      if (loadingStartTime) {
        const elapsed = Date.now() - loadingStartTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          setShowSkeleton(false);
        }, remaining);
      } else {
        setShowSkeleton(false);
      }
    }
  }, [isLoading, delay, minLoadingTime, loadingStartTime]);

  if (showSkeleton) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
};

// Staggered loading for tour grids
interface StaggeredTourGridProps {
  tours: any[];
  renderTour: (tour: any, index: number) => React.ReactNode;
  viewMode: "grid" | "list";
  isLoading: boolean;
  staggerDelay?: number;
}

export const StaggeredTourGrid: React.FC<StaggeredTourGridProps> = ({
  tours,
  renderTour,
  viewMode,
  isLoading,
  staggerDelay = 100,
}) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isLoading && tours.length > 0) {
      setVisibleCount(0);
      const timer = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev >= tours.length) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, staggerDelay);

      return () => clearInterval(timer);
    }
  }, [tours, isLoading, staggerDelay]);

  if (isLoading) {
    const skeletonCount = 12;
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-6"
        }
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <TourCardSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6"
      }
    >
      {tours.map((tour, index) => (
        <div
          key={tour.id}
          className={`transition-all duration-500 ${
            index < visibleCount
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: `${Math.min(index * 50, 500)}ms`,
          }}
        >
          {index < visibleCount ? (
            renderTour(tour, index)
          ) : (
            <TourCardSkeleton viewMode={viewMode} />
          )}
        </div>
      ))}
    </div>
  );
};

// Section-based progressive loading for tour detail page
interface TourDetailProgressiveLoadingProps {
  sections: {
    hero: { isLoading: boolean; content: React.ReactNode };
    info: { isLoading: boolean; content: React.ReactNode };
    features: { isLoading: boolean; content: React.ReactNode };
    reviews: { isLoading: boolean; content: React.ReactNode };
    similar: { isLoading: boolean; content: React.ReactNode };
    booking: { isLoading: boolean; content: React.ReactNode };
  };
}

export const TourDetailProgressiveLoading: React.FC<
  TourDetailProgressiveLoadingProps
> = ({ sections }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5">
      {/* Hero Section */}
      <ProgressiveLoading
        isLoading={sections.hero.isLoading}
        skeleton={<TourHeroSkeleton />}
      >
        {sections.hero.content}
      </ProgressiveLoading>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info Section */}
            <ProgressiveLoading
              isLoading={sections.info.isLoading}
              skeleton={<TourInfoSkeleton />}
              delay={200}
            >
              {sections.info.content}
            </ProgressiveLoading>

            {/* Features Section */}
            <ProgressiveLoading
              isLoading={sections.features.isLoading}
              skeleton={<TourFeaturesSkeleton />}
              delay={400}
            >
              {sections.features.content}
            </ProgressiveLoading>

            {/* Reviews Section */}
            <ProgressiveLoading
              isLoading={sections.reviews.isLoading}
              skeleton={<TourReviewsSkeleton />}
              delay={600}
            >
              {sections.reviews.content}
            </ProgressiveLoading>

            {/* Similar Tours Section */}
            <ProgressiveLoading
              isLoading={sections.similar.isLoading}
              skeleton={<SimilarToursSkeleton />}
              delay={800}
            >
              {sections.similar.content}
            </ProgressiveLoading>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProgressiveLoading
              isLoading={sections.booking.isLoading}
              skeleton={<TourBookingSkeleton />}
              delay={300}
            >
              {sections.booking.content}
            </ProgressiveLoading>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual skeleton components for progressive loading
const TourHeroSkeleton: React.FC = () => (
  <section className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/5 via-transparent to-[#2c3e50]/5" />
    <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <GlassCard className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 animate-pulse">
        <div className="aspect-[16/10] bg-gray-300/50 rounded-2xl" />
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-20 bg-gray-300/50 rounded-xl"
            />
          ))}
        </div>
      </GlassCard>
    </div>
  </section>
);

const TourInfoSkeleton: React.FC = () => (
  <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 animate-pulse">
    <div className="h-8 w-32 bg-gray-300/50 rounded-lg mb-6" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center p-4 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20"
        >
          <div className="w-12 h-12 bg-gray-300/50 rounded-full mb-3" />
          <div className="h-4 w-16 bg-gray-300/50 rounded mb-1" />
          <div className="h-5 w-20 bg-gray-300/50 rounded" />
        </div>
      ))}
    </div>
    <div className="space-y-3">
      <div className="h-4 w-full bg-gray-300/50 rounded" />
      <div className="h-4 w-5/6 bg-gray-300/50 rounded" />
      <div className="h-4 w-4/5 bg-gray-300/50 rounded" />
    </div>
  </GlassCard>
);

const TourFeaturesSkeleton: React.FC = () => (
  <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 animate-pulse">
    <div className="h-8 w-40 bg-gray-300/50 rounded-lg mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center p-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20"
        >
          <div className="w-8 h-8 bg-gray-300/50 rounded-full mr-3" />
          <div className="h-4 w-24 bg-gray-300/50 rounded" />
        </div>
      ))}
    </div>
  </GlassCard>
);

const TourReviewsSkeleton: React.FC = () => (
  <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 animate-pulse">
    <div className="h-8 w-32 bg-gray-300/50 rounded-lg mb-6" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20"
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gray-300/50 rounded-full mr-3" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-300/50 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-300/50 rounded" />
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-4 h-4 bg-gray-300/50 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-300/50 rounded" />
            <div className="h-4 w-3/4 bg-gray-300/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  </GlassCard>
);

const SimilarToursSkeleton: React.FC = () => (
  <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 animate-pulse">
    <div className="h-8 w-32 bg-gray-300/50 rounded-lg mb-6" />
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-shrink-0 w-64">
          <div className="h-40 bg-gray-300/50 rounded-lg mb-3" />
          <div className="h-4 w-3/4 bg-gray-300/50 rounded mb-2" />
          <div className="h-3 w-1/2 bg-gray-300/50 rounded" />
        </div>
      ))}
    </div>
  </GlassCard>
);

const TourBookingSkeleton: React.FC = () => (
  <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 animate-pulse sticky top-8">
    <div className="h-6 w-32 bg-gray-300/50 rounded-lg mb-6" />
    <div className="h-64 w-full bg-gray-300/50 rounded-lg mb-6" />
    <div className="space-y-4 mb-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="p-4 bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20"
        >
          <div className="h-4 w-24 bg-gray-300/50 rounded mb-2" />
          <div className="h-6 w-32 bg-gray-300/50 rounded" />
        </div>
      ))}
    </div>
    <div className="h-12 w-full bg-gray-300/50 rounded-xl" />
  </GlassCard>
);

export default ProgressiveLoading;
