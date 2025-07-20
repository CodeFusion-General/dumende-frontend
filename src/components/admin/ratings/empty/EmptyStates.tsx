import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Star,
  Filter,
  Search,
  BarChart3,
  Users,
  Calendar,
  RefreshCw,
  Plus,
  TrendingUp,
  FileText,
} from "lucide-react";

interface BaseEmptyStateProps {
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

// Generic Empty State Component
interface EmptyStateProps extends BaseEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  showAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  showAction = true,
  actionLabel = "Yenile",
  onAction,
  className = "",
}) => (
  <Card className={`border-gray-200 ${className}`}>
    <CardContent className="p-12 text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 font-roboto leading-relaxed max-w-md mx-auto">
        {description}
      </p>

      {/* Action Button */}
      {showAction && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="font-montserrat hover:bg-primary/5 hover:border-primary/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);

// No Reviews Empty State
export const NoReviewsEmpty: React.FC<BaseEmptyStateProps> = ({
  onAction,
  className,
}) => (
  <EmptyState
    icon={<MessageSquare className="h-8 w-8 text-gray-400" />}
    title="Henüz Değerlendirme Yok"
    description="Müşterilerinizden henüz değerlendirme gelmemiş. İlk değerlendirmeler geldiğinde burada görüntülenecek."
    showAction={false}
    className={className}
  />
);

// Filtered Results Empty State
export const FilteredResultsEmpty: React.FC<
  BaseEmptyStateProps & {
    onClearFilters?: () => void;
  }
> = ({ onAction, onClearFilters, className }) => (
  <Card className={`border-gray-200 ${className}`}>
    <CardContent className="p-12 text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Filter className="h-8 w-8 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">
        Filtreye Uygun Sonuç Bulunamadı
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 font-roboto leading-relaxed max-w-md mx-auto">
        Seçilen filtrelere uygun değerlendirme bulunamadı. Filtreleri
        değiştirerek tekrar deneyebilir veya tüm değerlendirmeleri
        görüntüleyebilirsiniz.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="font-montserrat"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtreleri Temizle
          </Button>
        )}
        {onAction && (
          <Button
            onClick={onAction}
            variant="default"
            className="font-montserrat bg-primary hover:bg-primary-dark"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Search Results Empty State
export const SearchResultsEmpty: React.FC<
  BaseEmptyStateProps & {
    searchTerm?: string;
    onClearSearch?: () => void;
  }
> = ({ searchTerm, onClearSearch, onAction, className }) => (
  <Card className={`border-gray-200 ${className}`}>
    <CardContent className="p-12 text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="h-8 w-8 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">
        Arama Sonucu Bulunamadı
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 font-roboto leading-relaxed max-w-md mx-auto">
        {searchTerm
          ? `"${searchTerm}" için herhangi bir değerlendirme bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.`
          : "Arama kriterlerinize uygun değerlendirme bulunamadı."}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onClearSearch && (
          <Button
            onClick={onClearSearch}
            variant="outline"
            className="font-montserrat"
          >
            <Search className="h-4 w-4 mr-2" />
            Aramayı Temizle
          </Button>
        )}
        {onAction && (
          <Button
            onClick={onAction}
            variant="default"
            className="font-montserrat bg-primary hover:bg-primary-dark"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// No Data Available Empty State
export const NoDataEmpty: React.FC<BaseEmptyStateProps> = ({
  onAction,
  className,
}) => (
  <EmptyState
    icon={<BarChart3 className="h-8 w-8 text-gray-400" />}
    title="Veri Bulunmuyor"
    description="Bu dönem için herhangi bir veri bulunmuyor. Farklı bir zaman aralığı seçmeyi deneyin."
    actionLabel="Yenile"
    onAction={onAction}
    className={className}
  />
);

// Chart Empty State (smaller, for chart containers)
export const ChartEmpty: React.FC<{
  title?: string;
  description?: string;
  className?: string;
}> = ({
  title = "Veri Yok",
  description = "Bu dönem için veri bulunmuyor",
  className = "",
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
      <TrendingUp className="h-6 w-6 text-gray-400" />
    </div>
    <h4 className="text-sm font-medium text-gray-900 mb-1 font-montserrat">
      {title}
    </h4>
    <p className="text-xs text-gray-500 font-roboto">{description}</p>
  </div>
);

// Recent Activity Empty State
export const RecentActivityEmpty: React.FC<BaseEmptyStateProps> = ({
  className,
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
      <Calendar className="h-6 w-6 text-gray-400" />
    </div>
    <h4 className="text-sm font-medium text-gray-900 mb-1 font-montserrat">
      Son Aktivite Yok
    </h4>
    <p className="text-xs text-gray-500 font-roboto">
      Son 7 günde yeni değerlendirme bulunmuyor
    </p>
  </div>
);

// Statistics Empty State
export const StatisticsEmpty: React.FC<BaseEmptyStateProps> = ({
  onAction,
  className,
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
      <Users className="h-6 w-6 text-gray-400" />
    </div>
    <h4 className="text-sm font-medium text-gray-900 mb-1 font-montserrat">
      İstatistik Yok
    </h4>
    <p className="text-xs text-gray-500 mb-3 font-roboto">
      Henüz yeterli veri bulunmuyor
    </p>
    {onAction && (
      <Button
        onClick={onAction}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Yenile
      </Button>
    )}
  </div>
);

// Welcome State (for first-time users)
export const WelcomeState: React.FC<{
  onGetStarted?: () => void;
  className?: string;
}> = ({ onGetStarted, className = "" }) => (
  <Card className={`border-primary/20 bg-primary/5 ${className}`}>
    <CardContent className="p-12 text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Star className="h-8 w-8 text-primary" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 font-montserrat">
        Değerlendirme Yönetimine Hoş Geldiniz
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 font-roboto leading-relaxed max-w-md mx-auto">
        Müşteri değerlendirmelerinizi buradan takip edebilir, analiz edebilir ve
        yönetebilirsiniz. İlk değerlendirmeleriniz geldiğinde burada
        görüntülenecek.
      </p>

      {/* Action Button */}
      {onGetStarted && (
        <Button
          onClick={onGetStarted}
          className="font-montserrat bg-primary hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          Başlayın
        </Button>
      )}
    </CardContent>
  </Card>
);

// Maintenance State
export const MaintenanceState: React.FC<{
  message?: string;
  className?: string;
}> = ({
  message = "Bu özellik şu anda bakım altında. Lütfen daha sonra tekrar deneyin.",
  className = "",
}) => (
  <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
    <CardContent className="p-8 text-center">
      {/* Icon */}
      <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
        <FileText className="h-6 w-6 text-yellow-600" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-yellow-900 mb-2 font-montserrat">
        Bakım Modu
      </h3>

      {/* Description */}
      <p className="text-yellow-700 font-roboto text-sm">{message}</p>
    </CardContent>
  </Card>
);
