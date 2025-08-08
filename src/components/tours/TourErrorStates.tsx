import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  RefreshCw,
  WifiOff,
  MapPin,
  Calendar,
  Users,
  Star,
  MessageCircle,
  Compass,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  Filter,
} from "lucide-react";

// Base error state component for tours
interface TourErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: "error" | "warning" | "info";
  showIcon?: boolean;
}

export const TourErrorState: React.FC<TourErrorStateProps> = ({
  title = "Bir şeyler ters gitti",
  message = "Bir hata oluştu. Lütfen tekrar deneyin.",
  onRetry,
  retryText = "Tekrar Dene",
  className,
  variant = "error",
  showIcon = true,
}) => {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconColors = {
    error: "text-red-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  };

  const buttonColors = {
    error: "border-red-300 text-red-700 hover:bg-red-50",
    warning: "border-amber-300 text-amber-700 hover:bg-amber-50",
    info: "border-blue-300 text-blue-700 hover:bg-blue-50",
  };

  const Icon = icons[variant];

  return (
    <Card className={cn(colors[variant], className)}>
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          {showIcon && (
            <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/30">
              <Icon className={cn("h-8 w-8", iconColors[variant])} />
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-montserrat">{title}</h3>
            <p className="font-roboto">{message}</p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className={cn("flex items-center gap-2", buttonColors[variant])}
            >
              <RefreshCw className="h-4 w-4" />
              {retryText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Network error for tours
export const TourNetworkError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <Card className={cn("bg-red-50 border-red-200", className)}>
    <CardContent className="p-8 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <WifiOff className="h-10 w-10 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-red-900 font-montserrat">
            Bağlantı Hatası
          </h3>
          <p className="text-red-700 font-roboto">
            Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin ve
            tekrar deneyin.
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Bağlantıyı Yenile
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Tour not found error
export const TourNotFoundError: React.FC<{
  onGoBack?: () => void;
  className?: string;
}> = ({ onGoBack, className }) => (
  <Card className={cn("bg-amber-50 border-amber-200", className)}>
    <CardContent className="p-8 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Compass className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-amber-900 font-montserrat">
            Tur Bulunamadı
          </h3>
          <p className="text-amber-700 font-roboto">
            Aradığınız tur mevcut değil veya kaldırılmış olabilir.
          </p>
        </div>
        {onGoBack && (
          <Button
            variant="outline"
            onClick={onGoBack}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            Tur Listesine Dön
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// No tours found (empty state)
export const NoToursFoundError: React.FC<{
  onReset?: () => void;
  searchQuery?: string;
  hasActiveFilters?: boolean;
  className?: string;
}> = ({ onReset, searchQuery, hasActiveFilters = false, className }) => (
  <Card className={cn("bg-gray-50 border-gray-200", className)}>
    <CardContent className="p-12 text-center">
      <div className="space-y-6">
        <div className="w-24 h-24 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full flex items-center justify-center mx-auto">
          <Search className="h-12 w-12 text-white" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-gray-900 font-montserrat">
            {searchQuery ? "Arama sonucu bulunamadı" : "Tur bulunamadı"}
          </h3>
          <p className="text-gray-600 font-roboto max-w-md mx-auto">
            {searchQuery
              ? `"${searchQuery}" için tur bulunamadı. Farklı anahtar kelimeler deneyin.`
              : hasActiveFilters
              ? "Seçtiğiniz filtrelere uygun tur bulunamadı. Filtreleri değiştirmeyi deneyin."
              : "Henüz tur bulunmuyor. Daha sonra tekrar kontrol edin."}
          </p>
        </div>

        {(hasActiveFilters || searchQuery) && onReset && (
          <Button
            onClick={onReset}
            className="bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white hover:from-[#2c3e50] hover:to-[#3498db] font-medium px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg font-montserrat"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtreleri Temizle
          </Button>
        )}

        <div className="flex flex-col space-y-3 text-sm text-gray-500 font-roboto">
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Farklı lokasyonları deneyin</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Daha genel anahtar kelimeler kullanın</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Farklı tarih aralıkları seçin</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Tour loading error
export const TourLoadingError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <TourErrorState
    title="Turlar Yüklenemedi"
    message="Tur bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
    icon={<Compass className="h-8 w-8 text-red-500" />}
    onRetry={onRetry}
    className={className}
  />
);

// Tour booking error states
export const TourBookingError: React.FC<{
  type: "unavailable" | "validation" | "payment" | "general";
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}> = ({ type, onRetry, onGoBack, className }) => {
  const errorConfig = {
    unavailable: {
      icon: Calendar,
      title: "Tur Müsait Değil",
      message:
        "Bu tur seçilen tarihler için müsait değil. Lütfen farklı tarihler seçin.",
      color: "amber",
    },
    validation: {
      icon: XCircle,
      title: "Geçersiz Bilgi",
      message: "Rezervasyon bilgilerinizi kontrol edin ve tekrar deneyin.",
      color: "red",
    },
    payment: {
      icon: AlertCircle,
      title: "Ödeme Hatası",
      message: "Ödeme işleminizde bir sorun oluştu. Lütfen tekrar deneyin.",
      color: "red",
    },
    general: {
      icon: AlertTriangle,
      title: "Rezervasyon Başarısız",
      message:
        "Rezervasyonunuz tamamlanamadı. Lütfen daha sonra tekrar deneyin.",
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
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div
            className={`w-16 h-16 bg-${config.color}-100 rounded-full flex items-center justify-center mx-auto`}
          >
            <Icon className={`h-8 w-8 text-${config.color}-600`} />
          </div>
          <div className="space-y-2">
            <h3
              className={`text-lg font-semibold text-${config.color}-900 font-montserrat`}
            >
              {config.title}
            </h3>
            <p className={`text-${config.color}-700 font-roboto`}>
              {config.message}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            {onGoBack && (
              <Button
                variant="outline"
                onClick={onGoBack}
                className={`border-${config.color}-300 text-${config.color}-700 hover:bg-${config.color}-50`}
              >
                Geri Dön
              </Button>
            )}
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className={`border-${config.color}-300 text-${config.color}-700 hover:bg-${config.color}-50`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component-specific error states for tours
export const TourReviewsError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <TourErrorState
    title="Yorumlar Yüklenemedi"
    message="Tur yorumları yüklenirken bir hata oluştu."
    icon={<MessageCircle className="h-8 w-8 text-gray-500" />}
    onRetry={onRetry}
    variant="info"
    className={className}
  />
);

export const SimilarToursError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <TourErrorState
    title="Benzer Turlar Yüklenemedi"
    message="Benzer turlar şu anda yüklenemiyor."
    icon={<Compass className="h-8 w-8 text-gray-500" />}
    onRetry={onRetry}
    variant="info"
    className={className}
  />
);

export const TourAvailabilityError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <TourErrorState
    title="Müsaitlik Bilgisi Yüklenemedi"
    message="Tur müsaitlik takvimi yüklenemiyor."
    icon={<Calendar className="h-8 w-8 text-gray-500" />}
    onRetry={onRetry}
    variant="info"
    className={className}
  />
);

// Error boundary fallback for tours
export const TourErrorBoundaryFallback: React.FC<{
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
          <h3 className="text-xl font-semibold text-red-900 font-montserrat">
            Beklenmeyen Hata
          </h3>
          <p className="text-red-700 font-roboto">
            Tur sayfasında beklenmeyen bir hata oluştu. Sayfayı yenileyin veya
            daha sonra tekrar deneyin.
          </p>
          {error && process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                Hata Detayları (Geliştirme)
              </summary>
              <pre className="mt-2 text-xs text-red-800 bg-red-100 p-3 rounded overflow-auto max-h-32">
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
            Tekrar Dene
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Toast-style error notifications for tours
export const TourErrorToast = {
  network: {
    title: "Bağlantı Hatası",
    description: "İnternet bağlantınızı kontrol edin ve tekrar deneyin.",
    variant: "destructive" as const,
  },
  booking: {
    title: "Rezervasyon Başarısız",
    description: "Rezervasyonunuz tamamlanamadı. Lütfen tekrar deneyin.",
    variant: "destructive" as const,
  },
  validation: {
    title: "Geçersiz Bilgi",
    description: "Bilgilerinizi kontrol edin ve tekrar deneyin.",
    variant: "destructive" as const,
  },
  general: {
    title: "Hata",
    description: "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.",
    variant: "destructive" as const,
  },
  imageLoad: {
    title: "Resim Yüklenemedi",
    description: "Bazı resimler yüklenemedi.",
    variant: "default" as const,
  },
  tourLoad: {
    title: "Tur Yüklenemedi",
    description: "Tur bilgileri yüklenirken bir hata oluştu.",
    variant: "destructive" as const,
  },
};
