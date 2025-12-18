import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarAvailability } from "@/types/availability.types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  CheckCircle,
  Zap,
  Star,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface AvailabilityCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  availabilityData: CalendarAvailability[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  language?: string;
  className?: string;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  context?: "boat" | "tour"; // UI etiketi/legend için bağlam
}

interface AvailabilityLegendProps {
  language?: string;
}

const AvailabilityLegend: React.FC<AvailabilityLegendProps> = ({
  language = "tr",
}) => {
  const legendItems = [
    {
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-800",
      label: language === "tr" ? "Müsait" : "Available",
    },
    {
      icon: Zap,
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      iconColor: "text-primary",
      textColor: "text-primary-dark",
      label: language === "tr" ? "Anında Onay" : "Instant Confirmation",
    },
    {
      icon: Star,
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
      iconColor: "text-accent-dark",
      textColor: "text-accent-dark",
      label: language === "tr" ? "Özel Fiyat" : "Special Price",
    },
    {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      textColor: "text-red-700",
      label: language === "tr" ? "Müsait Değil" : "Unavailable",
    },
    {
      icon: Clock,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      iconColor: "text-gray-400",
      textColor: "text-gray-600",
      label: language === "tr" ? "Geçmiş Tarih" : "Past Date",
    },
  ];

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <h4 className="text-sm font-montserrat font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full"></div>
        {language === "tr" ? "Müsaitlik Durumu" : "Availability Legend"}
      </h4>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
        {legendItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 hover:shadow-sm",
                item.bgColor,
                item.borderColor
              )}
            >
              <div className={cn("flex-shrink-0", item.iconColor)}>
                <IconComponent size={16} />
              </div>
              <span className={cn("text-xs font-medium", item.textColor)}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selected,
  onSelect,
  availabilityData,
  isLoading = false,
  error,
  onRetry,
  language = "tr",
  className,
  month,
  onMonthChange,
  context = "boat",
}) => {
  // İç ay state'i: parent month prop vermiyorsa, availability'ye göre ilk uygun ayı seç
  const [internalMonth, setInternalMonth] = React.useState<Date | undefined>(
    month
  );

  React.useEffect(() => {
    // Dışarıdan month kontrol ediliyorsa, iç state'i senkronize et
    if (month) {
      setInternalMonth(month);
      return;
    }

    // İlk kez yüklenirken ve availabilityData geldiyse, en erken future availability ayına git
    if (!internalMonth && availabilityData.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dates = availabilityData
        .map((item) => new Date(item.date))
        .sort((a, b) => a.getTime() - b.getTime());

      const future = dates.find((d) => d >= today) ?? dates[0];
      if (future) {
        const monthStart = new Date(future);
        monthStart.setDate(1);
        setInternalMonth(monthStart);
      }
    }
  }, [month, availabilityData, internalMonth]);
  // Create a map for quick availability lookup
  const availabilityMap = React.useMemo(() => {
    const map = new Map<string, CalendarAvailability>();
    availabilityData.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [availabilityData]);

  // Custom day modifier to style dates based on availability
  const getDayModifiers = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const modifiers = {
      available: [] as Date[],
      unavailable: [] as Date[],
      specialPrice: [] as Date[],
      instantConfirmation: [] as Date[],
      hasBookings: [] as Date[],
      past: [] as Date[],
    };

    availabilityData.forEach((item) => {
      const date = new Date(item.date);
      const isPast = date < today;

      if (isPast) {
        modifiers.past.push(date);
      } else if (item.isAvailable && !item.hasBookings) {
        if (item.isInstantConfirmation) {
          modifiers.instantConfirmation.push(date);
        } else if (item.isOverride && item.price) {
          modifiers.specialPrice.push(date);
        } else {
          modifiers.available.push(date);
        }
      } else {
        modifiers.unavailable.push(date);
      }
    });

    return modifiers;
  }, [availabilityData]);

  // Disable dates that are unavailable, have bookings, or are in the past
  const disabledDates = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const disabled: Date[] = [];

    availabilityData.forEach((item) => {
      const date = new Date(item.date);
      const isPast = date < today;

      // Disable if: past date, not available, or has existing bookings
      if (isPast || !item.isAvailable || item.hasBookings) {
        disabled.push(date);
      }
    });

    return disabled;
  }, [availabilityData]);

  // Enhanced loading state with skeleton
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <AvailabilityLegend language={language} />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-primary"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-3 border-transparent border-t-primary/30 animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {language === "tr"
                  ? "Müsaitlik bilgileri yükleniyor..."
                  : "Loading availability..."}
              </p>
              <p className="text-xs text-gray-500">
                {language === "tr"
                  ? "Lütfen bekleyiniz"
                  : "Please wait a moment"}
              </p>
            </div>
          </div>

          {/* Calendar skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="flex space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <AvailabilityLegend language={language} />
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-red-800">
                {language === "tr"
                  ? "Müsaitlik bilgileri yüklenemedi"
                  : "Failed to load availability"}
              </h3>
              <p className="text-xs text-red-600 max-w-sm">
                {error ||
                  (language === "tr"
                    ? "Bir hata oluştu. Lütfen tekrar deneyin."
                    : "An error occurred. Please try again.")}
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <RefreshCw size={14} />
                {language === "tr" ? "Tekrar Dene" : "Try Again"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <AvailabilityLegend language={language} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          month={month ?? internalMonth}
          showOutsideDays={false}
          onMonthChange={(m) => {
            if (!month) {
              setInternalMonth(m);
            }
            onMonthChange?.(m);
          }}
          disabled={disabledDates}
          locale={language === "tr" ? tr : undefined}
          className="w-full"
          modifiers={getDayModifiers}
          modifiersStyles={{
            available: {
              backgroundColor: "rgb(236 253 245)", // Enhanced emerald-50
              borderColor: "rgb(167 243 208)", // Enhanced emerald-300
              color: "rgb(5 150 105)", // Enhanced emerald-600
              fontWeight: "500",
            },
            unavailable: {
              backgroundColor: "rgb(254 242 242)", // Enhanced red-50
              borderColor: "rgb(252 165 165)", // red-300
              color: "rgb(220 38 38)", // Enhanced red-600
              fontWeight: "500",
            },
            instantConfirmation: {
              backgroundColor: "rgba(26, 95, 122, 0.1)", // Primary color with opacity
              borderColor: "rgba(26, 95, 122, 0.3)", // Primary border
              color: "#1A5F7A", // Primary color
              fontWeight: "600",
            },
            specialPrice: {
              backgroundColor: "rgba(248, 203, 46, 0.1)", // Accent color with opacity
              borderColor: "rgba(248, 203, 46, 0.3)", // Accent border
              color: "#e5b919", // Accent dark
              fontWeight: "600",
            },
            hasBookings: {
              backgroundColor: "rgb(254 242 242)", // Enhanced red-50
              borderColor: "rgb(252 165 165)", // red-300
              color: "rgb(220 38 38)", // Enhanced red-600
              fontWeight: "500",
            },
            past: {
              backgroundColor: "rgb(249 250 251)", // Enhanced gray-50
              borderColor: "rgb(229 231 235)", // Enhanced gray-200
              color: "rgb(156 163 175)", // gray-400
              fontWeight: "400",
            },
          }}
          classNames={{
            months:
              "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-2 pb-4 relative items-center",
            caption_label:
              "text-base font-montserrat font-semibold text-gray-800",
            nav: "space-x-2 flex items-center",
            nav_button: cn(
              "h-8 w-8 bg-white border border-gray-200 rounded-lg p-0",
              "hover:bg-primary hover:text-white hover:border-primary",
              "transition-all duration-200 shadow-sm hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            ),
            nav_button_previous: "absolute left-0",
            nav_button_next: "absolute right-0",
            table: "w-full border-collapse space-y-2",
            head_row: "flex mb-2",
            head_cell: cn(
              "text-gray-600 rounded-md w-10 h-10 font-medium text-sm",
              "flex items-center justify-center font-montserrat"
            ),
            row: "flex w-full mt-1",
            cell: cn(
              "h-10 w-10 text-center text-sm p-0 relative",
              "focus-within:relative focus-within:z-20"
            ),
            day: cn(
              "h-10 w-10 p-0 font-medium rounded-lg border border-transparent",
              "cursor-pointer transition-all duration-200",
              "hover:scale-105 hover:shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "active:scale-95"
            ),
            day_range_end: "day-range-end",
            day_selected: cn(
              "bg-primary text-white border-primary shadow-md",
              "hover:bg-primary-dark hover:border-primary-dark",
              "focus:bg-primary-dark focus:border-primary-dark",
              "ring-2 ring-primary/20"
            ),
            day_today: cn(
              "bg-accent/10 text-accent-dark border-accent/30",
              "ring-2 ring-accent/20 font-semibold"
            ),
            day_outside: cn(
              "text-gray-400 opacity-50",
              "hover:opacity-70 hover:text-gray-500"
            ),
            day_disabled: cn(
              "text-gray-400 opacity-40 cursor-not-allowed",
              "hover:scale-100 hover:shadow-none"
            ),
            day_range_middle:
              "aria-selected:bg-accent/20 aria-selected:text-accent-dark",
            day_hidden: "invisible",
          }}
        />
      </div>

      {/* Enhanced empty state */}
      {availabilityData.length === 0 && !isLoading && !error && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <div className="text-center space-y-3">
            <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {language === "tr"
                  ? "Müsaitlik Bilgisi Bulunamadı"
                  : "No Availability Information"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {language === "tr"
                  ? "Bu tarih aralığı için müsaitlik bilgisi bulunamadı. Lütfen farklı bir tarih aralığı seçin."
                  : "No availability information found for this date range. Please try selecting a different date range."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
