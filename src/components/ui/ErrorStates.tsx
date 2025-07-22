import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Camera,
  Anchor,
  MapPin,
  Clock,
  Users,
  Star,
  MessageCircle,
  Calendar,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";

// Professional error handling with user-friendly messages

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: "error" | "warning" | "info";
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error. Please try again.",
  onRetry,
  retryText = "Try Again",
  className,
  variant = "error",
  showIcon = true,
}) => {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const variants = {
    error: "destructive",
    warning: "default",
    info: "default",
  } as const;

  const Icon = icons[variant];

  return (
    <Alert variant={variants[variant]} className={cn("", className)}>
      {showIcon && <Icon className="h-4 w-4" />}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p>{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {retryText}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Network error component
export const NetworkError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <Card className={cn("bg-red-50 border-red-200", className)}>
    <CardContent className="p-6 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <WifiOff className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-900">
            Connection Error
          </h3>
          <p className="text-red-700">
            Unable to connect to the server. Please check your internet
            connection.
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Image loading error component
export const ImageError: React.FC<{
  onRetry?: () => void;
  className?: string;
  alt?: string;
}> = ({ onRetry, className, alt = "Image" }) => (
  <div
    className={cn(
      "aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center",
      className
    )}
  >
    <div className="text-center space-y-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
        <Camera className="h-6 w-6 text-gray-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">
          Failed to load {alt.toLowerCase()}
        </p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Boat not found error
export const BoatNotFoundError: React.FC<{
  onGoBack?: () => void;
  className?: string;
}> = ({ onGoBack, className }) => (
  <Card className={cn("bg-amber-50 border-amber-200", className)}>
    <CardContent className="p-8 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Anchor className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-amber-900">
            Boat Not Found
          </h3>
          <p className="text-amber-700">
            The boat you're looking for doesn't exist or has been removed.
          </p>
        </div>
        {onGoBack && (
          <Button
            variant="outline"
            onClick={onGoBack}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            Go Back to Listings
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// No data available error
export const NoDataError: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  onRefresh?: () => void;
  className?: string;
}> = ({
  title = "No Data Available",
  message = "There's no data to display at the moment.",
  icon,
  onRefresh,
  className,
}) => (
  <Card className={cn("bg-gray-50 border-gray-200", className)}>
    <CardContent className="p-8 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          {icon || <AlertCircle className="h-8 w-8 text-gray-500" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Booking error states
export const BookingError: React.FC<{
  type: "unavailable" | "validation" | "payment" | "general";
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}> = ({ type, onRetry, onGoBack, className }) => {
  const errorConfig = {
    unavailable: {
      icon: Calendar,
      title: "Boat Unavailable",
      message:
        "This boat is not available for the selected dates. Please choose different dates.",
      color: "amber",
    },
    validation: {
      icon: XCircle,
      title: "Invalid Information",
      message: "Please check your booking details and try again.",
      color: "red",
    },
    payment: {
      icon: AlertCircle,
      title: "Payment Error",
      message: "There was an issue processing your payment. Please try again.",
      color: "red",
    },
    general: {
      icon: AlertTriangle,
      title: "Booking Failed",
      message: "We couldn't complete your booking. Please try again later.",
      color: "red",
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        `bg-${config.color}-50 border-${config.color}-200`,
        className
      )}
    >
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div
            className={`w-16 h-16 bg-${config.color}-100 rounded-full flex items-center justify-center mx-auto`}
          >
            <Icon className={`h-8 w-8 text-${config.color}-600`} />
          </div>
          <div className="space-y-2">
            <h3 className={`text-lg font-semibold text-${config.color}-900`}>
              {config.title}
            </h3>
            <p className={`text-${config.color}-700`}>{config.message}</p>
          </div>
          <div className="flex gap-3 justify-center">
            {onGoBack && (
              <Button
                variant="outline"
                onClick={onGoBack}
                className={`border-${config.color}-300 text-${config.color}-700 hover:bg-${config.color}-50`}
              >
                Go Back
              </Button>
            )}
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className={`border-${config.color}-300 text-${config.color}-700 hover:bg-${config.color}-50`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component-specific error states
export const ReviewsError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <NoDataError
    title="Reviews Unavailable"
    message="We couldn't load the reviews for this boat."
    icon={<MessageCircle className="h-8 w-8 text-gray-500" />}
    onRefresh={onRetry}
    className={className}
  />
);

export const SimilarBoatsError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <NoDataError
    title="Similar Boats Unavailable"
    message="We couldn't load similar boats at the moment."
    icon={<Anchor className="h-8 w-8 text-gray-500" />}
    onRefresh={onRetry}
    className={className}
  />
);

export const AvailabilityError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <NoDataError
    title="Availability Unavailable"
    message="We couldn't load the availability calendar."
    icon={<Calendar className="h-8 w-8 text-gray-500" />}
    onRefresh={onRetry}
    className={className}
  />
);

// Error boundary fallback component
export const ErrorBoundaryFallback: React.FC<{
  error?: Error;
  resetError?: () => void;
  className?: string;
}> = ({ error, resetError, className }) => (
  <Card className={cn("bg-red-50 border-red-200", className)}>
    <CardContent className="p-8 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-red-900">
            Something went wrong
          </h3>
          <p className="text-red-700">
            An unexpected error occurred. Please refresh the page or try again
            later.
          </p>
          {error && process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-800 bg-red-100 p-3 rounded overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        {resetError && (
          <Button
            variant="outline"
            onClick={resetError}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Toast-style error notifications
export const ErrorToast = {
  network: {
    title: "Connection Error",
    description: "Please check your internet connection and try again.",
    variant: "destructive" as const,
  },
  booking: {
    title: "Booking Failed",
    description: "We couldn't complete your booking. Please try again.",
    variant: "destructive" as const,
  },
  validation: {
    title: "Invalid Information",
    description: "Please check your details and try again.",
    variant: "destructive" as const,
  },
  general: {
    title: "Error",
    description: "Something went wrong. Please try again later.",
    variant: "destructive" as const,
  },
  imageLoad: {
    title: "Image Load Failed",
    description: "Some images couldn't be loaded.",
    variant: "default" as const,
  },
};
