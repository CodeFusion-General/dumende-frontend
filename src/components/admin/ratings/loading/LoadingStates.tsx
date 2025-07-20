import React from "react";
import { Loader2, BarChart3, TrendingUp, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Generic Loading Spinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin mx-auto text-primary`}
        />
        {text && (
          <p
            className={`mt-2 text-gray-600 font-roboto ${textSizeClasses[size]}`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Page Loading Component
export const PageLoading: React.FC<{ message?: string }> = ({
  message = "Sayfa yükleniyor...",
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <BarChart3 className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2 font-montserrat">
        Değerlendirmeler Yükleniyor
      </h2>
      <p className="text-gray-600 font-roboto">{message}</p>
    </div>
  </div>
);

// Card Loading Component
export const CardLoading: React.FC<{
  title?: string;
  height?: string;
  className?: string;
}> = ({ title, height = "h-32", className = "" }) => (
  <Card className={`border-0 shadow-lg ${className}`}>
    <CardContent className={`p-6 flex items-center justify-center ${height}`}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
        {title && <p className="text-sm text-gray-600 font-roboto">{title}</p>}
      </div>
    </CardContent>
  </Card>
);

// Chart Loading Component
export const ChartLoading: React.FC<{
  title?: string;
  className?: string;
}> = ({ title = "Grafik yükleniyor...", className = "" }) => (
  <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
    <div className="relative mb-4">
      <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
      <TrendingUp className="h-4 w-4 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
    <p className="text-sm text-gray-600 font-roboto">{title}</p>
  </div>
);

// Data Loading with Progress
export const DataLoadingProgress: React.FC<{
  progress?: number;
  message?: string;
  className?: string;
}> = ({ progress, message = "Veriler yükleniyor...", className = "" }) => (
  <div className={`text-center ${className}`}>
    <div className="relative mb-4">
      <div className="w-12 h-12 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto"></div>
      <Users className="h-4 w-4 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </div>

    <p className="text-sm text-gray-700 font-medium mb-2 font-montserrat">
      {message}
    </p>

    {progress !== undefined && (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    )}

    {progress !== undefined && (
      <p className="text-xs text-gray-500 font-roboto">
        %{Math.round(progress)} tamamlandı
      </p>
    )}
  </div>
);

// Inline Loading Component (for buttons, etc.)
export const InlineLoading: React.FC<{
  text?: string;
  size?: "sm" | "md";
  className?: string;
}> = ({ text, size = "sm", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-current`} />
      {text && <span className="text-sm font-roboto">{text}</span>}
    </div>
  );
};

// Shimmer Loading Effect
export const ShimmerLoading: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className = "", lines = 3 }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`bg-gray-200 rounded h-4 mb-2 ${
          i === lines - 1 ? "w-3/4" : "w-full"
        }`}
        style={{
          animationDelay: `${i * 0.1}s`,
        }}
      ></div>
    ))}
  </div>
);

// Loading Overlay Component
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  className?: string;
}> = ({ isVisible, message = "Yükleniyor...", className = "" }) => {
  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 ${className}`}
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-700 font-roboto">{message}</p>
      </div>
    </div>
  );
};

// Skeleton with shimmer effect
export const SkeletonShimmer: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = "", children }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer ${className}`}
  >
    {children}
  </div>
);

// Pulsing Dot Loader
export const PulsingDots: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className = "" }) => {
  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSizes[size]} bg-primary rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        ></div>
      ))}
    </div>
  );
};
