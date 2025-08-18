/**
 * Skeleton Loading Components
 *
 * Provides skeleton loading states for better perceived performance during progressive loading.
 *
 * Requirements: 3.2, 3.3 - Progressive loading and skeleton states
 */

import React from "react";
import { createOptimizedComponent } from "@/utils/componentMemoization";
import { mobileDetection } from "@/utils/mobileDetection";

/**
 * Base skeleton component with animation
 */
const SkeletonBase: React.FC<{
  className?: string;
  animate?: boolean;
  children?: React.ReactNode;
}> = ({ className = "", animate = true, children }) => {
  const deviceInfo = React.useMemo(
    () => mobileDetection.detectMobileDevice(),
    []
  );

  // Reduce animation on low-end devices
  const shouldAnimate = animate && !deviceInfo.isLowEndDevice;

  return (
    <div
      className={`bg-gray-200 rounded ${
        shouldAnimate ? "animate-pulse" : ""
      } ${className}`}
      role="status"
      aria-label="Loading..."
    >
      {children}
    </div>
  );
};

/**
 * Skeleton for boat/tour cards
 */
export const CardSkeleton: React.FC<{
  viewMode?: "grid" | "list";
  showImage?: boolean;
  showPrice?: boolean;
}> = ({ viewMode = "grid", showImage = true, showPrice = true }) => {
  const deviceInfo = React.useMemo(
    () => mobileDetection.detectMobileDevice(),
    []
  );
  const isMobile = deviceInfo.isMobile;

  const imageHeight =
    viewMode === "list"
      ? isMobile
        ? "h-32"
        : "h-40"
      : isMobile
      ? "h-48"
      : "h-56";

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Image skeleton */}
      {showImage && (
        <div className="relative">
          <SkeletonBase className={`w-full ${imageHeight}`} />

          {/* Price badge skeleton */}
          {showPrice && (
            <div className="absolute top-3 right-3">
              <SkeletonBase className="w-20 h-6 rounded-full" />
            </div>
          )}
        </div>
      )}

      {/* Content skeleton */}
      <div
        className={`p-4 space-y-3 ${
          viewMode === "list" ? "space-y-2" : "space-y-3"
        }`}
      >
        {/* Title */}
        <SkeletonBase className="h-5 w-3/4" />

        {/* Location */}
        <div className="flex items-center space-x-2">
          <SkeletonBase className="w-4 h-4 rounded" />
          <SkeletonBase className="h-4 w-1/2" />
        </div>

        {/* Details */}
        <div className="flex justify-between items-center">
          <SkeletonBase className="h-4 w-1/3" />
          <SkeletonBase className="h-4 w-1/4" />
        </div>

        {/* Description (only in grid mode) */}
        {viewMode === "grid" && (
          <div className="space-y-2">
            <SkeletonBase className="h-3 w-full" />
            <SkeletonBase className="h-3 w-2/3" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton for list items
 */
export const ListItemSkeleton: React.FC<{
  showAvatar?: boolean;
  lines?: number;
}> = ({ showAvatar = true, lines = 2 }) => (
  <div className="flex items-start space-x-3 p-4">
    {showAvatar && (
      <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />
    )}

    <div className="flex-1 space-y-2">
      <SkeletonBase className="h-4 w-1/4" />

      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  </div>
);

/**
 * Skeleton for testimonials
 */
export const TestimonialSkeleton: React.FC = () => {
  const deviceInfo = React.useMemo(
    () => mobileDetection.detectMobileDevice(),
    []
  );
  const isMobile = deviceInfo.isMobile;

  return (
    <div
      className={`bg-white rounded-3xl ${
        isMobile ? "p-6" : "p-8 md:p-12"
      } text-center shadow-xl border border-gray-100`}
    >
      {/* Quote icon skeleton */}
      <div className="relative mb-8">
        <SkeletonBase
          className={`${
            isMobile ? "w-12 h-12" : "w-16 h-16"
          } rounded-full mx-auto mb-6`}
        />

        {/* Stars skeleton */}
        <div className="flex justify-center mb-6">
          <SkeletonBase className="w-32 h-8 rounded-full" />
        </div>
      </div>

      {/* Quote text skeleton */}
      <div className="mb-10 space-y-3">
        <SkeletonBase className="h-6 w-full" />
        <SkeletonBase className="h-6 w-5/6 mx-auto" />
        <SkeletonBase className="h-6 w-3/4 mx-auto" />
      </div>

      {/* Customer info skeleton */}
      <div className="flex items-center justify-center space-x-4">
        <SkeletonBase
          className={`${isMobile ? "w-12 h-12" : "w-16 h-16"} rounded-full`}
        />

        <div className="text-left space-y-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-3 w-20" />
          <SkeletonBase className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for navigation menu
 */
export const NavigationSkeleton: React.FC<{
  itemCount?: number;
  horizontal?: boolean;
}> = ({ itemCount = 5, horizontal = true }) => (
  <div className={`flex ${horizontal ? "space-x-6" : "flex-col space-y-3"}`}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <SkeletonBase
        key={index}
        className={`h-4 ${horizontal ? "w-16" : "w-full"}`}
      />
    ))}
  </div>
);

/**
 * Skeleton for form fields
 */
export const FormSkeleton: React.FC<{
  fields?: number;
  showLabels?: boolean;
  showButton?: boolean;
}> = ({ fields = 3, showLabels = true, showButton = true }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        {showLabels && <SkeletonBase className="h-4 w-1/4" />}
        <SkeletonBase className="h-10 w-full rounded-md" />
      </div>
    ))}

    {showButton && <SkeletonBase className="h-10 w-32 rounded-md" />}
  </div>
);

/**
 * Skeleton for image gallery
 */
export const ImageGallerySkeleton: React.FC<{
  imageCount?: number;
  showThumbnails?: boolean;
}> = ({ imageCount = 4, showThumbnails = true }) => {
  const deviceInfo = React.useMemo(
    () => mobileDetection.detectMobileDevice(),
    []
  );
  const isMobile = deviceInfo.isMobile;

  return (
    <div className="space-y-4">
      {/* Main image */}
      <SkeletonBase
        className={`w-full ${isMobile ? "h-64" : "h-96"} rounded-lg`}
      />

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="flex space-x-2 overflow-x-auto">
          {Array.from({ length: imageCount }).map((_, index) => (
            <SkeletonBase
              key={index}
              className="w-20 h-20 rounded-md flex-shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton for statistics/metrics
 */
export const StatsSkeleton: React.FC<{
  statCount?: number;
  layout?: "horizontal" | "grid";
}> = ({ statCount = 3, layout = "horizontal" }) => (
  <div
    className={`${
      layout === "grid"
        ? `grid grid-cols-${Math.min(statCount, 3)} gap-4`
        : "flex justify-between"
    }`}
  >
    {Array.from({ length: statCount }).map((_, index) => (
      <div key={index} className="text-center space-y-2">
        <SkeletonBase className="h-8 w-16 mx-auto" />
        <SkeletonBase className="h-4 w-20 mx-auto" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for table rows
 */
export const TableRowSkeleton: React.FC<{
  columns?: number;
  rows?: number;
}> = ({ columns = 4, rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonBase key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Skeleton for content blocks
 */
export const ContentBlockSkeleton: React.FC<{
  showTitle?: boolean;
  paragraphs?: number;
  showImage?: boolean;
}> = ({ showTitle = true, paragraphs = 3, showImage = false }) => (
  <div className="space-y-4">
    {showTitle && <SkeletonBase className="h-6 w-1/2" />}

    {showImage && <SkeletonBase className="w-full h-48 rounded-lg" />}

    <div className="space-y-2">
      {Array.from({ length: paragraphs }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase
            className={`h-4 ${index === paragraphs - 1 ? "w-2/3" : "w-full"}`}
          />
        </div>
      ))}
    </div>
  </div>
);

// Export optimized versions
export const OptimizedCardSkeleton = createOptimizedComponent(CardSkeleton, {
  displayName: "CardSkeleton",
  autoOptimize: true,
});

export const OptimizedListItemSkeleton = createOptimizedComponent(
  ListItemSkeleton,
  {
    displayName: "ListItemSkeleton",
    autoOptimize: true,
  }
);

export const OptimizedTestimonialSkeleton = createOptimizedComponent(
  TestimonialSkeleton,
  {
    displayName: "TestimonialSkeleton",
    autoOptimize: true,
  }
);
