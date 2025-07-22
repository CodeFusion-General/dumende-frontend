import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Camera, Anchor } from "lucide-react";

// Professional skeleton loading screens for all components

export const ImageGallerySkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "relative bg-white rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden",
      className
    )}
  >
    <div className="aspect-video relative bg-gray-100 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <Camera className="h-8 w-8 text-gray-400 animate-pulse" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

export const BoatInfoSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("space-y-6", className)}>
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <Skeleton className="w-10 h-10 rounded-full mx-auto" />
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  </div>
);

export const BoatFeaturesSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("space-y-6", className)}>
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="space-y-3">
              <Skeleton className="w-8 h-8 rounded-full mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const HostInfoSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("space-y-6", className)}>
    <Skeleton className="h-8 w-48" />
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const ReviewsSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("space-y-6", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const SimilarBoatsSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("space-y-6", className)}>
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-white shadow-sm border border-gray-100">
          <div className="aspect-video bg-gray-100 animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <Anchor className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const BookingFormSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <Card className={cn("bg-white shadow-lg border border-gray-100", className)}>
    <CardHeader className="space-y-4">
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </CardContent>
  </Card>
);

export const AvailabilityCalendarSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn("bg-white rounded-lg border border-gray-200 p-4", className)}
  >
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  </div>
);

// Progressive loading component with smooth transitions
export const ProgressiveLoader: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, skeleton, className }) => (
  <div className={cn("relative", className)}>
    <div
      className={cn(
        "transition-opacity duration-500",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {skeleton}
    </div>
    <div
      className={cn(
        "transition-opacity duration-500",
        isLoading
          ? "opacity-0 pointer-events-none absolute inset-0"
          : "opacity-100"
      )}
    >
      {children}
    </div>
  </div>
);

// Loading spinner with professional styling
export const LoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}> = ({ size = "md", className, text }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );
};

// Inline loading state for buttons and small components
export const InlineLoader: React.FC<{
  className?: string;
  text?: string;
}> = ({ className, text = "Loading..." }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Loader2 className="w-4 h-4 animate-spin text-primary" />
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);
