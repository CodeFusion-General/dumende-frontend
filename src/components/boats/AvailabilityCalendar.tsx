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
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-800',
      label: language === 'tr' ? 'Anında Onay' : 'Instant Confirmation',
      icon: '⚡'
    },
    {
      color: 'bg-purple-100 border-purple-300',
      textColor: 'text-purple-800',
      label: language === 'tr' ? 'Özel Fiyat' : 'Special Price',
      icon: '$'
    },
    {
      color: 'bg-red-100 border-red-300',
      textColor: 'text-red-800',
      label: language === 'tr' ? 'Müsait Değil' : 'Unavailable',
      icon: '✗'
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
      past: [] as Date[]
    };

    availabilityData.forEach(item => {
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
    
    availabilityData.forEach(item => {
      const date = new Date(item.date);
      const isPast = date < today;

      // Disable if: past date, not available, or has existing bookings
      if (isPast || !item.isAvailable || item.hasBookings) {
        disabled.push(date);
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
          modifiers={getDayModifiers}
          modifiersStyles={{
            available: {
              backgroundColor: 'rgb(220 252 231)', // bg-green-100
              borderColor: 'rgb(134 239 172)', // border-green-300
              color: 'rgb(22 101 52)' // text-green-800
            },
            unavailable: {
              backgroundColor: 'rgb(254 226 226)', // bg-red-100
              borderColor: 'rgb(252 165 165)', // border-red-300
              color: 'rgb(153 27 27)' // text-red-800
            },
            instantConfirmation: {
              backgroundColor: 'rgb(219 234 254)', // bg-blue-100
              borderColor: 'rgb(147 197 253)', // border-blue-300
              color: 'rgb(30 64 175)' // text-blue-800
            },
            specialPrice: {
              backgroundColor: 'rgb(243 232 255)', // bg-purple-100
              borderColor: 'rgb(196 181 253)', // border-purple-300
              color: 'rgb(107 33 168)' // text-purple-800
            },
            hasBookings: {
              backgroundColor: 'rgb(254 226 226)', // bg-red-100
              borderColor: 'rgb(252 165 165)', // border-red-300
              color: 'rgb(153 27 27)' // text-red-800
            },
            past: {
              backgroundColor: 'rgb(243 244 246)', // bg-gray-100
              borderColor: 'rgb(209 213 219)', // border-gray-300
              color: 'rgb(156 163 175)' // text-gray-400
            }
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
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground ring-2 ring-blue-500 ring-opacity-50",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
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

