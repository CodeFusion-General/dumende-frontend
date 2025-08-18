// Adaptive Component Loader
// Automatically selects between regular and simplified components based on device capabilities

import React, { Suspense, lazy, memo } from "react";
import {
  useLowEndOptimization,
  useMemoryConsciousLoading,
} from "../../hooks/useLowEndOptimization";

// Lazy load components for better performance
const RegularTestimonials = lazy(() => import("../home/Testimonials"));
const SimplifiedTestimonials = lazy(
  () => import("../simplified/SimplifiedTestimonials")
);

const RegularImageGallery = lazy(() => import("../ui/ImageGallery"));
const SimplifiedImageGallery = lazy(
  () => import("../simplified/SimplifiedImageGallery")
);

const RegularBoatCard = lazy(() => import("../boats/BoatCard"));
const SimplifiedBoatCard = lazy(
  () => import("../simplified/SimplifiedBoatCard")
);

// Loading fallback component
const ComponentSkeleton = memo(
  ({
    type = "default",
    className = "",
  }: {
    type?: "card" | "gallery" | "testimonials" | "default";
    className?: string;
  }) => {
    const getSkeletonContent = () => {
      switch (type) {
        case "card":
          return (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            </div>
          );

        case "gallery":
          return (
            <div className="space-y-3">
              <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          );

        case "testimonials":
          return (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto animate-pulse" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded p-4"
                >
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          );

        default:
          return <div className="bg-gray-200 rounded animate-pulse h-32" />;
      }
    };

    return <div className={`${className}`}>{getSkeletonContent()}</div>;
  }
);

ComponentSkeleton.displayName = "ComponentSkeleton";

// Error boundary for component loading failures
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Component loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
            <p className="text-red-700 text-sm">Failed to load component</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Adaptive Testimonials Component
export const AdaptiveTestimonials = memo((props: any) => {
  const { shouldUseSimplifiedComponent, shouldLoadComponent } =
    useLowEndOptimization();
  const { loadComponent } = useMemoryConsciousLoading();

  // Check if component should be loaded
  if (!shouldLoadComponent("Testimonials", 40)) {
    return null;
  }

  // Load component in memory-conscious way
  if (!loadComponent("Testimonials", 40)) {
    return (
      <ComponentSkeleton type="testimonials" className={props.className} />
    );
  }

  const useSimplified = shouldUseSimplifiedComponent("Testimonials");
  const Component = useSimplified
    ? SimplifiedTestimonials
    : RegularTestimonials;

  return (
    <ComponentErrorBoundary
      fallback={<ComponentSkeleton type="testimonials" />}
    >
      <Suspense
        fallback={
          <ComponentSkeleton type="testimonials" className={props.className} />
        }
      >
        <Component {...props} />
      </Suspense>
    </ComponentErrorBoundary>
  );
});

AdaptiveTestimonials.displayName = "AdaptiveTestimonials";

// Adaptive Image Gallery Component
export const AdaptiveImageGallery = memo((props: any) => {
  const { shouldUseSimplifiedComponent, shouldLoadComponent } =
    useLowEndOptimization();
  const { loadComponent } = useMemoryConsciousLoading();

  // Check if component should be loaded
  if (!shouldLoadComponent("ImageGallery", 50)) {
    return null;
  }

  // Load component in memory-conscious way
  if (!loadComponent("ImageGallery", 50)) {
    return <ComponentSkeleton type="gallery" className={props.className} />;
  }

  const useSimplified = shouldUseSimplifiedComponent("ImageGallery");
  const Component = useSimplified
    ? SimplifiedImageGallery
    : RegularImageGallery;

  return (
    <ComponentErrorBoundary fallback={<ComponentSkeleton type="gallery" />}>
      <Suspense
        fallback={
          <ComponentSkeleton type="gallery" className={props.className} />
        }
      >
        <Component {...props} />
      </Suspense>
    </ComponentErrorBoundary>
  );
});

AdaptiveImageGallery.displayName = "AdaptiveImageGallery";

// Adaptive Boat Card Component
export const AdaptiveBoatCard = memo((props: any) => {
  const { shouldUseSimplifiedComponent, shouldLoadComponent } =
    useLowEndOptimization();
  const { loadComponent } = useMemoryConsciousLoading();

  // Check if component should be loaded
  if (!shouldLoadComponent("BoatCard", 70)) {
    return null;
  }

  // Load component in memory-conscious way
  if (!loadComponent("BoatCard", 70)) {
    return <ComponentSkeleton type="card" className={props.className} />;
  }

  const useSimplified = shouldUseSimplifiedComponent("BoatCard");
  const Component = useSimplified ? SimplifiedBoatCard : RegularBoatCard;

  return (
    <ComponentErrorBoundary fallback={<ComponentSkeleton type="card" />}>
      <Suspense
        fallback={<ComponentSkeleton type="card" className={props.className} />}
      >
        <Component {...props} />
      </Suspense>
    </ComponentErrorBoundary>
  );
});

AdaptiveBoatCard.displayName = "AdaptiveBoatCard";

// Generic Adaptive Component Loader
interface AdaptiveComponentProps {
  componentName: string;
  regularComponent: React.ComponentType<any>;
  simplifiedComponent?: React.ComponentType<any>;
  priority?: number;
  skeletonType?: "card" | "gallery" | "testimonials" | "default";
  fallback?: React.ReactNode;
  [key: string]: any;
}

export const AdaptiveComponent = memo<AdaptiveComponentProps>(
  ({
    componentName,
    regularComponent: RegularComponent,
    simplifiedComponent: SimplifiedComponent,
    priority = 50,
    skeletonType = "default",
    fallback,
    ...props
  }) => {
    const { shouldUseSimplifiedComponent, shouldLoadComponent } =
      useLowEndOptimization();
    const { loadComponent } = useMemoryConsciousLoading();

    // Check if component should be loaded
    if (!shouldLoadComponent(componentName, priority)) {
      return null;
    }

    // Load component in memory-conscious way
    if (!loadComponent(componentName, priority)) {
      return (
        fallback || (
          <ComponentSkeleton type={skeletonType} className={props.className} />
        )
      );
    }

    // Determine which component to use
    const useSimplified =
      shouldUseSimplifiedComponent(componentName) && SimplifiedComponent;
    const Component = useSimplified ? SimplifiedComponent : RegularComponent;

    return (
      <ComponentErrorBoundary
        fallback={fallback || <ComponentSkeleton type={skeletonType} />}
      >
        <Suspense
          fallback={
            fallback || (
              <ComponentSkeleton
                type={skeletonType}
                className={props.className}
              />
            )
          }
        >
          <Component {...props} />
        </Suspense>
      </ComponentErrorBoundary>
    );
  }
);

AdaptiveComponent.displayName = "AdaptiveComponent";

// Hook for creating adaptive components
export function useAdaptiveComponent(
  componentName: string,
  regularComponent: React.ComponentType<any>,
  simplifiedComponent?: React.ComponentType<any>
) {
  const { shouldUseSimplifiedComponent, shouldLoadComponent } =
    useLowEndOptimization();

  return {
    shouldLoad: (priority: number = 50) =>
      shouldLoadComponent(componentName, priority),
    shouldSimplify:
      shouldUseSimplifiedComponent(componentName) && !!simplifiedComponent,
    Component:
      shouldUseSimplifiedComponent(componentName) && simplifiedComponent
        ? simplifiedComponent
        : regularComponent,
  };
}

export default AdaptiveComponent;
