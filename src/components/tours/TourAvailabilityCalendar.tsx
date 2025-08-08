import React, { useEffect, useMemo, useState } from "react";
import AvailabilityCalendar from "@/components/boats/AvailabilityCalendar";
import { CalendarAvailability } from "@/types/availability.types";
import { TourDateDTO } from "@/types/tour.types";
import { availabilityService } from "@/services/availabilityService";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface TourAvailabilityCalendarProps {
  tourDates: TourDateDTO[];
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  isLoading?: boolean;
  className?: string;
  tourId?: number;
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

const TourAvailabilityCalendar: React.FC<TourAvailabilityCalendarProps> = ({
  tourDates,
  selected,
  onSelect,
  isLoading = false,
  className,
  tourId,
  month,
  onMonthChange,
}) => {
  const [serviceAvailability, setServiceAvailability] = useState<CalendarAvailability[] | null>(null);

  useEffect(() => {
    const m = month || selected || new Date();
    if (!tourId) {
      setServiceAvailability(null);
      return;
    }
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    availabilityService
      .getTourCalendarAvailability(tourId, format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"))
      .then((data) => setServiceAvailability(data))
      .catch(() => setServiceAvailability(null));
  }, [tourId, month, selected]);

  const availabilityData: CalendarAvailability[] = useMemo(() => {
    const tourDateMap = new Map<string, TourDateDTO>();
    (tourDates || []).forEach((d) => {
      const key = d.startDate.split("T")[0];
      tourDateMap.set(key, d);
    });

    // Eğer servis verisi varsa, sadece hem turDates hem servis available olan günleri AVAILABLE say
    if (serviceAvailability && serviceAvailability.length > 0) {
      return serviceAvailability.map((sa) => {
        const td = tourDateMap.get(sa.date);
        const dateIsInTourDates = !!td;
        const tourDateAvailable = td
          ? (td.availabilityStatus || "").toUpperCase() === "AVAILABLE"
          : false;
        return {
          ...sa,
          isAvailable: Boolean(dateIsInTourDates && tourDateAvailable && sa.isAvailable),
        } as CalendarAvailability;
      });
    }

    // Fallback: sadece turDates'e göre göster
    return Array.from(tourDateMap.keys()).map((date) => ({
      date,
      isAvailable:
        (tourDateMap.get(date)?.availabilityStatus || "").toUpperCase() ===
        "AVAILABLE",
      isOverride: false,
      price: undefined,
      hasBookings: false,
      bookingCount: 0,
      isInstantConfirmation: true,
    }));
  }, [tourDates, serviceAvailability]);

  return (
    <AvailabilityCalendar
      selected={selected}
      onSelect={onSelect}
      availabilityData={availabilityData}
      isLoading={isLoading}
      language="tr"
      className={className}
      month={month}
      onMonthChange={onMonthChange}
      context="tour"
    />
  );
};

export default TourAvailabilityCalendar;


