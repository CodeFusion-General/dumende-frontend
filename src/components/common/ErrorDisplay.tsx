import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  Info,
  Wifi,
  Shield,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AppError,
  ErrorType,
  getErrorRecoverySuggestions,
} from "@/utils/errorHandling";

interface ErrorDisplayProps {
  error: AppError | Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  showSuggestions?: boolean;
  className?: string;
  variant?: "default" | "compact" | "inline";
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  showSuggestions = true,
  className = "",
  variant = "default",
}) => {
  // Parse error to AppError format
  const appError: AppError = React.useMemo(() => {
    if (typeof error === "string") {
      return {
        name: "Error",
        message: error,
        type: ErrorType.UNKNOWN,
        userMessage: error,
      } as AppError;
    }

    if (error instanceof Error && "type" in error) {
      return error as AppError;
    }

    return {
      name: error.name,
      message: error.message,
      type: ErrorType.UNKNOWN,
      userMessage: error.message,
    } as AppError;
  }, [error]);

  const getErrorIcon = () => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return <Wifi className="h-5 w-5" />;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return <Shield className="h-5 w-5" />;
      case ErrorType.SERVER:
        return <Server className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getErrorColor = () => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return "text-blue-600";
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return "text-orange-600";
      case ErrorType.SERVER:
        return "text-purple-600";
      case ErrorType.VALIDATION:
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  const getBackgroundColor = () => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return "bg-blue-50 border-blue-200";
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return "bg-orange-50 border-orange-200";
      case ErrorType.SERVER:
        return "bg-purple-50 border-purple-200";
      case ErrorType.VALIDATION:
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-red-50 border-red-200";
    }
  };

  const suggestions = React.useMemo(() => {
    return showSuggestions ? getErrorRecoverySuggestions(appError) : [];
  }, [appError, showSuggestions]);

  // Compact variant for inline errors
  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${getErrorColor()} ${className}`}
      >
        {getErrorIcon()}
        <span>{appError.userMessage || appError.message}</span>
        {onRetry && appError.isRetryable && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Tekrar Dene
          </Button>
        )}
      </div>
    );
  }

  // Inline variant for form errors
  if (variant === "inline") {
    return (
      <Alert className={`${getBackgroundColor()} ${className}`}>
        <div className={getErrorColor()}>{getErrorIcon()}</div>
        <AlertDescription className="text-sm">
          {appError.userMessage || appError.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Default variant - full error display
  return (
    <div
      className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getErrorColor()}`}>
          {getErrorIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-medium ${getErrorColor()}`}>
                {getErrorTypeTitle(appError.type)}
              </h4>
              <p className="text-sm text-gray-700 mt-1">
                {appError.userMessage || appError.message}
              </p>
            </div>

            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            )}
          </div>

          {/* Error details (development mode) */}
          {showDetails && process.env.NODE_ENV === "development" && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                Geliştirici Detayları
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto max-h-32">
                <div>
                  <strong>Type:</strong> {appError.type}
                </div>
                <div>
                  <strong>Status:</strong> {appError.statusCode || "N/A"}
                </div>
                <div>
                  <strong>Retryable:</strong>{" "}
                  {appError.isRetryable ? "Yes" : "No"}
                </div>
                {appError.originalError && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {appError.originalError.stack ||
                        appError.originalError.message}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Recovery suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">
                  Çözüm Önerileri:
                </span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          {onRetry && appError.isRetryable && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getErrorTypeTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return "Bağlantı Hatası";
    case ErrorType.AUTHENTICATION:
      return "Kimlik Doğrulama Hatası";
    case ErrorType.AUTHORIZATION:
      return "Yetkilendirme Hatası";
    case ErrorType.VALIDATION:
      return "Doğrulama Hatası";
    case ErrorType.SERVER:
      return "Sunucu Hatası";
    case ErrorType.CLIENT:
      return "İstemci Hatası";
    default:
      return "Hata";
  }
}
