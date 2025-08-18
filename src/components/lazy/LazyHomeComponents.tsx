import { Suspense } from "react";
import { createLazyComponent } from "../../utils/lazyLoading";

// Lazy load Testimonials component (known performance issue)
export const LazyTestimonials = createLazyComponent(
  () => import("../home/Testimonials"),
  {
    priority: "medium",
    mobileOptimized: true,
    preload: false, // Don't preload due to performance issues
  }
);

// Simple loading fallback for testimonials
const TestimonialsLoadingFallback = () => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Wrapped Testimonials with Suspense
export const Testimonials = () => (
  <Suspense fallback={<TestimonialsLoadingFallback />}>
    <LazyTestimonials />
  </Suspense>
);
