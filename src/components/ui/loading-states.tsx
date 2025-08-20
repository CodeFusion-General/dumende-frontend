import React from "react";
import { Loader2, FileText, Upload, Image, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

interface DocumentLoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function DocumentLoadingSkeleton({
  count = 3,
  className,
}: DocumentLoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface DocumentCardLoadingProps {
  className?: string;
}

export function DocumentCardLoading({ className }: DocumentCardLoadingProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Skeleton className="h-12 w-12 rounded" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex-shrink-0 flex space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UploadLoadingProps {
  progress?: number;
  status?: string;
  fileName?: string;
  className?: string;
}

export function UploadLoading({
  progress = 0,
  status = "Uploading...",
  fileName,
  className,
}: UploadLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200",
        className
      )}
    >
      <div className="flex-shrink-0">
        <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-blue-900 truncate">
            {fileName || "Document"}
          </p>
          <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-blue-600 mt-1">{status}</p>
      </div>
    </div>
  );
}

interface ImageLoadingProps {
  width?: number;
  height?: number;
  className?: string;
  showIcon?: boolean;
}

export function ImageLoading({
  width = 200,
  height = 150,
  className,
  showIcon = true,
}: ImageLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gray-100 rounded animate-pulse",
        className
      )}
      style={{ width, height }}
    >
      {showIcon && <Image className="h-8 w-8 text-gray-400" />}
    </div>
  );
}

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  src,
  alt,
  fallback,
  loadingComponent,
  errorComponent,
  threshold = 0.1,
  rootMargin = "50px",
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(img);

    return () => observer.unobserve(img);
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded",
          className
        )}
      >
        {errorComponent || (
          <div className="flex flex-col items-center text-gray-500 p-4">
            <AlertCircle className="h-8 w-8 mb-2" />
            <span className="text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    );
  }

  if (!isInView || !isLoaded) {
    return (
      <div ref={imgRef} className={cn("relative", className)}>
        {loadingComponent || <ImageLoading className="w-full h-full" />}
        {isInView && (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            {...props}
          />
        )}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  loadingComponent,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          {loadingComponent || (
            <div className="flex flex-col items-center space-y-2">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ProgressIndicatorProps {
  progress: number;
  status?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressIndicator({
  progress,
  status,
  showPercentage = true,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        {status && <span className="text-sm text-gray-600">{status}</span>}
        {showPercentage && (
          <span className="text-sm font-medium text-gray-900">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
