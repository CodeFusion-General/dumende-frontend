import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarAvailability } from '@/types/availability.types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AvailabilityCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  availabilityData: CalendarAvailability[];
  isLoading?: boolean;
  language?: string;
  className?: string;
}

interface AvailabilityLegendProps {
  language?: string;
}

const AvailabilityLegend: React.FC<AvailabilityLegendProps> = ({ language = 'tr' }) => {
  const legendItems = [
    {
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-800',
      label: language === 'tr' ? 'Müsait' : 'Available',
      icon: '✓'
    },
    {
      color: 'bg-red-100 border-red-300',
      textColor: 'text-red-800',
      label: language === 'tr' ? 'Müsait Değil' : 'Unavailable',
      icon: '✗'
    },
    {
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-800',
      label: language === 'tr' ? 'Özel Fiyat' : 'Special Price',
      icon: '$'
    },
    {
      color: 'bg-gray-100 border-gray-300',
      textColor: 'text-gray-600',
      label: language === 'tr' ? 'Geçmiş Tarih' : 'Past Date',
      icon: '—'
    }
  ];

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        {language === 'tr' ? 'Müsaitlik Durumu' : 'Availability Status'}
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center text-xs font-bold",
              item.color,
              item.textColor
            )}>
              {item.icon}
            </div>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selected,
  onSelect,
  availabilityData,
  isLoading = false,
  language = 'tr',
  className
}) => {
  // Create a map for quick availability lookup
  const availabilityMap = React.useMemo(() => {
    const map = new Map<string, CalendarAvailability>();
    availabilityData.forEach(item => {
      map.set(item.date, item);
    });
    return map;
  }, [availabilityData]);

  // Custom day renderer with availability styling
  const renderDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const availability = availabilityMap.get(dateStr);
    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
    
    let dayClasses = "relative w-full h-full flex items-center justify-center text-sm font-medium transition-all duration-200";
    let bgClasses = "";
    let textClasses = "";
    let indicator = "";

    if (isPast) {
      bgClasses = "bg-gray-100 border-gray-200";
      textClasses = "text-gray-400";
      indicator = "—";
    } else if (availability) {
      if (availability.isAvailable) {
        if (availability.isOverride && availability.price) {
          bgClasses = "bg-blue-100 border-blue-300 hover:bg-blue-200";
          textClasses = "text-blue-800";
          indicator = "$";
        } else {
          bgClasses = "bg-green-100 border-green-300 hover:bg-green-200";
          textClasses = "text-green-800";
          indicator = "✓";
        }
      } else {
        bgClasses = "bg-red-100 border-red-300";
        textClasses = "text-red-800";
        indicator = "✗";
      }
    } else {
      // No availability data - assume unavailable
      bgClasses = "bg-gray-100 border-gray-200";
      textClasses = "text-gray-500";
      indicator = "?";
    }

    if (isToday) {
      bgClasses += " ring-2 ring-blue-500 ring-opacity-50";
    }

    return (
      <div className={cn(dayClasses, bgClasses, textClasses, "border rounded-md")}>
        <span className="relative z-10">{day.getDate()}</span>
        <div className="absolute top-0 right-0 w-3 h-3 flex items-center justify-center text-xs font-bold">
          {indicator}
        </div>
        {availability?.price && (
          <div className="absolute bottom-0 left-0 right-0 text-xs font-semibold bg-white bg-opacity-80 px-1 rounded-b-md">
            ${availability.price}
          </div>
        )}
      </div>
    );
  };

  // Disable dates that are unavailable or in the past
  const disabledDates = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const disabled: Date[] = [];
    
    // Add past dates
    for (let i = 1; i <= 30; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      disabled.push(pastDate);
    }
    
    // Add unavailable future dates
    availabilityData.forEach(item => {
      if (!item.isAvailable) {
        const date = new Date(item.date);
        if (date >= today) {
          disabled.push(date);
        }
      }
    });
    
    return disabled;
  }, [availabilityData]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <AvailabilityLegend language={language} />
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="text-sm text-gray-600">
              {language === 'tr' ? 'Müsaitlik bilgileri yükleniyor...' : 'Loading availability...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <AvailabilityLegend language={language} />
      
      <div className="border rounded-lg p-3 bg-white">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          disabled={disabledDates}
          locale={language === 'tr' ? tr : undefined}
          className="w-full"
          components={{
            Day: ({ date }) => renderDay(date)
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </div>
      
      {availabilityData.length === 0 && !isLoading && (
        <div className="text-center p-4 text-gray-500 text-sm">
          {language === 'tr' 
            ? 'Bu tarih aralığı için müsaitlik bilgisi bulunamadı.' 
            : 'No availability information found for this date range.'}
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;