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
  month: controlledMonth,
  onMonthChange: onMonthChangeProp,
}) => {
  const [serviceAvailability, setServiceAvailability] =
    useState<CalendarAvailability[] | null>(null);
  const [internalMonth, setInternalMonth] = useState<Date>(
    selected || new Date()
  );

  const effectiveMonth = controlledMonth || internalMonth;

  // İlk yüklemede, seçili tarih yoksa ve dışarıdan month kontrol edilmiyorsa,
  // tur tarihleri içindeki en yakın gelecekteki tarihin ayına hizala.
  useEffect(() => {
    if (controlledMonth || selected) return;
    if (!tourDates || tourDates.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateObjs = tourDates
      .map((d) => new Date(d.startDate))
      .sort((a, b) => a.getTime() - b.getTime());

    const future = dateObjs.find((d) => d >= today) ?? dateObjs[0];
    if (future) {
      const targetMonth = startOfMonth(future);
      setInternalMonth(targetMonth);
    }
  }, [tourDates, controlledMonth, selected]);

  useEffect(() => {
    const m = effectiveMonth || selected || new Date();
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
  }, [tourId, effectiveMonth, selected]);

  const availabilityData: CalendarAvailability[] = useMemo(() => {
    const tourDateMap = new Map<string, TourDateDTO>();
    (tourDates || []).forEach((d) => {
      const key = d.startDate.split("T")[0];
      tourDateMap.set(key, d);
    });

    const monthStart = startOfMonth(effectiveMonth || new Date());
    const monthEnd = endOfMonth(effectiveMonth || new Date());
    const isInVisibleMonth = (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00");
      return d >= monthStart && d <= monthEnd;
    };

    if (serviceAvailability && serviceAvailability.length > 0) {
      const merged = serviceAvailability.map((sa) => {
        const td = tourDateMap.get(sa.date);
        const status = (td?.availabilityStatus || "").toUpperCase();
        const blockedByTourDate = status === "CANCELLED" || status === "FULLY_BOOKED";
        return {
          ...sa,
          isAvailable: Boolean(sa.isAvailable && !blockedByTourDate),
        } as CalendarAvailability;
      });
      return merged;
    }

    return Array.from(tourDateMap.keys())
      .filter(isInVisibleMonth)
      .map((date) => ({
        date,
        isAvailable:
          (tourDateMap.get(date)?.availabilityStatus || "AVAILABLE").toUpperCase() !==
          "CANCELLED" &&
          (tourDateMap.get(date)?.availabilityStatus || "AVAILABLE").toUpperCase() !==
          "FULLY_BOOKED",
        isOverride: false,
        price: undefined,
        hasBookings: false,
        bookingCount: 0,
        isInstantConfirmation: true,
      }));
  }, [tourDates, serviceAvailability, effectiveMonth]);

  return (
    <AvailabilityCalendar
      selected={selected}
      onSelect={onSelect}
      availabilityData={availabilityData}
      isLoading={isLoading}
      language="tr"
      className={className}
      month={effectiveMonth}
      onMonthChange={(m) => {
        setInternalMonth(m);
        onMonthChangeProp && onMonthChangeProp(m);
      }}
      context="tour"
    />
  );
};

export default TourAvailabilityCalendar;


