/**
 * Progressive Loading Components
 *
 * Pre-configured progressive loading components with appropriate priorities and fallbacks.
 *
 * Requirements: 3.2, 3.3 - Progressive loading and code splitting
 */

import React from "react";
import { createProgressiveComponent } from "@/utils/progressiveLoading";
import {
  CardSkeleton,
  TestimonialSkeleton,
  NavigationSkeleton,
  FormSkeleton,
  ImageGallerySkeleton,
  ContentBlockSkeleton,
} from "@/components/ui/SkeletonLoaders";

/**
 * Critical components - loaded immediately
 */

// Navigation components
export const ProgressiveNavbar = createProgressiveComponent(
  () => import("@/components/layout/Navbar"),
  {
    priority: "critical",
    fallback: () => <NavigationSkeleton />,
    preload: true,
  }
);

export const ProgressiveFooter = createProgressiveComponent(
  () => import("@/components/layout/Footer"),
  {
    priority: "critical",
    fallback: () => <div className="h-32 bg-gray-100" />,
  }
);

// Hero section
export const ProgressiveHero = createProgressiveComponent(
  () => import("@/components/hero/Hero"),
  {
    priority: "critical",
    fallback: () => (
      <div className="h-96 bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse" />
    ),
    preload: true,
  }
);

/**
 * High priority components - loaded after critical
 */

// Search and filters
export const ProgressiveSearchBar = createProgressiveComponent(
  () => import("@/components/search/SearchBar"),
  {
    priority: "high",
    fallback: () => (
      <FormSkeleton fields={1} showLabels={false} showButton={false} />
    ),
    intersectionLoading: true,
  }
);

export const ProgressiveFilterSidebar = createProgressiveComponent(
  () => import("@/components/boats/FilterSidebar"),
  {
    priority: "high",
    fallback: () => <FormSkeleton fields={5} />,
    intersectionLoading: true,
  }
);

// Featured content
export const ProgressiveFeaturedBoats = createProgressiveComponent(
  () => import("@/components/home/FeaturedBoats"),
  {
    priority: "high",
    fallback: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    ),
    intersectionLoading: true,
    intersectionOptions: { rootMargin: "100px" },
  }
);

export const ProgressiveTestimonials = createProgressiveComponent(
  () => import("@/components/home/Testimonials"),
  {
    priority: "high",
    fallback: TestimonialSkeleton,
    intersectionLoading: true,
    intersectionOptions: { rootMargin: "200px" },
  }
);

/**
 * Medium priority components - loaded when visible
 */

// Boat and tour grids
export const ProgressiveBoatGrid = createProgressiveComponent(
  () => import("@/components/boats/AnimatedBoatGrid"),
  {
    priority: "medium",
    fallback: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    ),
    intersectionLoading: true,
  }
);

export const ProgressiveTourGrid = createProgressiveComponent(
  () => import("@/components/tours/AnimatedTourGrid"),
  {
    priority: "medium",
    fallback: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    ),
    intersectionLoading: true,
  }
);

// Image galleries
export const ProgressiveImageGallery = createProgressiveComponent(
  () => import("@/components/ui/ImageGallery"),
  {
    priority: "medium",
    fallback: ImageGallerySkeleton,
    intersectionLoading: true,
  }
);

// Maps
export const ProgressiveMap = createProgressiveComponent(
  () => import("@/components/ui/Map"),
  {
    priority: "medium",
    fallback: () => (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
    intersectionLoading: true,
    delay: 500, // Delay to avoid loading maps too early
  }
);

/**
 * Low priority components - loaded when needed
 */

// Admin components
export const ProgressiveAdminDashboard = createProgressiveComponent(
  () => import("@/pages/admin/Dashboard"),
  {
    priority: "low",
    fallback: () => <ContentBlockSkeleton showTitle paragraphs={5} />,
    delay: 200,
  }
);

export const ProgressiveVesselsPage = createProgressiveComponent(
  () => import("@/pages/admin/VesselsPage"),
  {
    priority: "low",
    fallback: () => (
      <div className="space-y-6">
        <FormSkeleton fields={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    ),
  }
);

// Chat and messaging
export const ProgressiveMessaging = createProgressiveComponent(
  () => import("@/components/messaging/CustomerCaptainChat"),
  {
    priority: "low",
    fallback: () => (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    ),
    delay: 300,
  }
);

// Reviews and ratings
export const ProgressiveReviewSystem = createProgressiveComponent(
  () => import("@/components/reviews/ReviewSystem"),
  {
    priority: "low",
    fallback: () => <ContentBlockSkeleton paragraphs={3} />,
    intersectionLoading: true,
  }
);

/**
 * Idle priority components - loaded when browser is idle
 */

// Analytics and tracking
export const ProgressiveAnalytics = createProgressiveComponent(
  () => import("@/components/analytics/Analytics"),
  {
    priority: "idle",
    fallback: () => null, // No visual fallback needed
    delay: 1000,
  }
);

// Help and support
export const ProgressiveHelpCenter = createProgressiveComponent(
  () => import("@/components/help/HelpCenter"),
  {
    priority: "idle",
    fallback: () => <ContentBlockSkeleton showTitle paragraphs={4} />,
    intersectionLoading: true,
  }
);

// Blog components
export const ProgressiveBlogPost = createProgressiveComponent(
  () => import("@/pages/BlogPost"),
  {
    priority: "medium",
    fallback: () => <ContentBlockSkeleton showTitle paragraphs={6} showImage />,
  }
);

export const ProgressiveBlogGrid = createProgressiveComponent(
  () => import("@/components/blog/BlogGrid"),
  {
    priority: "medium",
    fallback: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <CardSkeleton key={i} showPrice={false} />
        ))}
      </div>
    ),
    intersectionLoading: true,
  }
);

/**
 * Utility components for progressive loading
 */

// Generic progressive wrapper
export const ProgressiveWrapper: React.FC<{
  children: React.ReactNode;
  priority?: "critical" | "high" | "medium" | "low" | "idle";
  fallback?: React.ComponentType;
  intersectionLoading?: boolean;
  delay?: number;
}> = ({
  children,
  priority = "medium",
  fallback: FallbackComponent,
  intersectionLoading = false,
  delay = 0,
}) => {
  const ProgressiveChild = createProgressiveComponent(
    () => Promise.resolve({ default: () => children }),
    {
      priority,
      fallback: FallbackComponent,
      intersectionLoading,
      delay,
    }
  );

  return <ProgressiveChild />;
};

// Progressive section wrapper
export const ProgressiveSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  priority?: "critical" | "high" | "medium" | "low" | "idle";
  skeletonHeight?: string;
}> = ({
  children,
  className = "",
  priority = "medium",
  skeletonHeight = "h-64",
}) => {
  const FallbackComponent = () => (
    <div
      className={`${skeletonHeight} bg-gray-100 animate-pulse rounded-lg ${className}`}
    />
  );

  return (
    <ProgressiveWrapper
      priority={priority}
      fallback={FallbackComponent}
      intersectionLoading={true}
    >
      <div className={className}>{children}</div>
    </ProgressiveWrapper>
  );
};
