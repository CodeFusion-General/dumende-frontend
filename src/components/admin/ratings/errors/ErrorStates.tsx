import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Server,
  Clock,
  AlertTriangle,
  FileX,
  Search,
} from "lucide-react";

interface BaseErrorProps {
  onRetry?: () => void;
  className?: string;
}

// Generic Error Component
interface ErrorStateProps extends BaseErrorProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  icon,
  actionLabel = "Tekrar Dene",
  showRetry = true,
  onRetry,
  className = "",
}) => (
  <Card className={`border-red-200 bg-red-50/50 ${className}`}>
    <CardContent className="p-8 text-center">
      {/* Error Icon */}
      <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        {icon || <AlertCircle className="h-6 w-6 text-red-500" />}
      </div>

      {/* Error Title */}
      <h3 className="text-lg font-semibold text-red-900 mb-2 font-montserrat">
        {title}
      </h3>

      {/* Error Description */}
      <p className="text-red-700 mb-4 font-roboto text-sm leading-relaxed">
        {description}
      </p>

      {/* Retry Button */}
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);

// Network Error Component
export const NetworkError: React.FC<BaseErrorProps> = ({
  onRetry,
  className,
}) => (
  <ErrorState
    title="Bağlantı Hatası"
    description="İnternet bağlantınızı kontrol edin ve tekrar deneyin. Sunucuya erişilemiyor."
    icon={<WifiOff className="h-6 w-6 text-red-500" />}
    onRetry={onRetry}
    className={className}
  />
);

// Server Error Component
export const ServerError: React.FC<BaseErrorProps> = ({
  onRetry,
  className,
}) => (
  <ErrorState
    title="Sunucu Hatası"
    description="Sunucuda bir sorun oluştu. Lütfen birkaç dakika sonra tekrar deneyin."
    icon={<Server className="h-6 w-6 text-red-500" />}
    onRetry={onRetry}
    className={className}
  />
);

// Timeout Error Component
export const TimeoutError: React.FC<BaseErrorProps> = ({
  onRetry,
  className,
}) => (
  <ErrorState
    title="Zaman Aşımı"
    description="İstek çok uzun sürdü. Lütfen tekrar deneyin."
    icon={<Clock className="h-6 w-6 text-red-500" />}
    onRetry={onRetry}
    className={className}
  />
);

// Data Loading Error Component
export const DataLoadingError: React.FC<BaseErrorProps> = ({
  onRetry,
  className,
}) => (
  <ErrorState
    title="Veri Yükleme Hatası"
    description="Değerlendirme verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
    icon={<FileX className="h-6 w-6 text-red-500" />}
    onRetry={onRetry}
    className={className}
  />
);

// Chart Error Component
export const ChartError: React.FC<BaseErrorProps> = ({
  onRetry,
  className,
}) => (
  <div
    className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}
  >
    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
    <h4 className="text-sm font-medium text-red-900 mb-2 font-montserrat">
      Grafik Yüklenemedi
    </h4>
    <p className="text-xs text-red-700 mb-3 font-roboto">
      Grafik verileri yüklenirken bir sorun oluştu.
    </p>
    {onRetry && (
      <Button
        onClick={onRetry}
        size="sm"
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-100"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Yenile
      </Button>
    )}
  </div>
);

// Empty Search Results Component
export const EmptySearchResults: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchTerm, onClearSearch, className = "" }) => (
  <Card className={`border-gray-200 ${className}`}>
    <CardContent className="p-8 text-center">
      {/* Search Icon */}
      <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="h-6 w-6 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-montserrat">
        Sonuç Bulunamadı
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 font-roboto text-sm leading-relaxed">
        {searchTerm
          ? `"${searchTerm}" için herhangi bir değerlendirme bulunamadı.`
          : "Seçilen filtrelere uygun değerlendirme bulunamadı."}
      </p>

      {/* Clear Search Button */}
      {onClearSearch && (
        <Button
          onClick={onClearSearch}
          variant="outline"
          className="text-gray-700 hover:bg-gray-100"
        >
          Filtreleri Temizle
        </Button>
      )}
    </CardContent>
  </Card>
);

// Component-specific error wrapper
interface ComponentErrorWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: () => void;
  componentName?: string;
}

export const ComponentErrorWrapper: React.FC<ComponentErrorWrapperProps> = ({
  children,
  fallback,
  onError,
  componentName = "Bileşen",
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      if (onError) onError();
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [onError]);

  if (hasError) {
    return (
      fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700 font-roboto">
            {componentName} yüklenirken bir hata oluştu.
          </p>
          <Button
            onClick={() => setHasError(false)}
            size="sm"
            variant="outline"
            className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Tekrar Dene
          </Button>
        </div>
      )
    );
  }

  return <>{children}</>;
};
