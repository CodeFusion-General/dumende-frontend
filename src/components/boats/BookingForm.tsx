import { useState, useEffect } from "react";
import { format, addHours, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  Star,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { bookingService } from "@/services/bookingService";
import { availabilityService } from "@/services/availabilityService";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { CalendarAvailability } from "@/types/availability.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingFormProps {
  dailyPrice: number;
  hourlyPrice: number;
  isHourly?: boolean;
  maxGuests: number;
  boatId: string;
}

export function BookingForm({
  dailyPrice,
  hourlyPrice,
  isHourly: defaultIsHourly = true,
  maxGuests,
  boatId,
}: BookingFormProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("10:00");
  const [duration, setDuration] = useState<number>(4);
  const [guests, setGuests] = useState<number>(2);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Toggle between hourly and daily pricing
  const [isHourlyMode, setIsHourlyMode] = useState<boolean>(defaultIsHourly);

  // State for available dates and time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [calendarAvailability, setCalendarAvailability] = useState<
    CalendarAvailability[]
  >([]);
  const [isDateLoading, setIsDateLoading] = useState<boolean>(false);
  const [isTimeSlotLoading, setIsTimeSlotLoading] = useState<boolean>(false);

  // Fetch available dates for the next 6 months (180 days)
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsDateLoading(true);
      try {
        // Get current date and date 6 months from now (180 days)
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);

        // Format dates for API
        const startDate = format(today, "yyyy-MM-dd");
        const endDate = format(sixMonthsLater, "yyyy-MM-dd");

        // Get calendar availability for the date range
        const calendarData = await availabilityService.getCalendarAvailability(
          Number(boatId),
          startDate,
          endDate
        );

        // Filter for available dates and convert to Date objects
        const availableDays = calendarData
          .filter((day) => day.isAvailable)
          .map((day) => new Date(day.date));

        setAvailableDates(availableDays);
        setCalendarAvailability(calendarData);
      } catch (error) {
        console.error("Failed to fetch available dates:", error);
        toast({
          title: "Müsait tarihler yüklenemedi",
          description: "Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } finally {
        setIsDateLoading(false);
      }
    };

    fetchAvailableDates();
  }, [boatId]);

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (date) {
        setIsTimeSlotLoading(true);
        try {
          const slots = await bookingService.getAvailableTimeSlots(
            Number(boatId),
            format(date, "yyyy-MM-dd")
          );

          // Convert 24-hour format to 12-hour format with AM/PM
          const formattedSlots = slots.map((slot) => {
            const hour = parseInt(slot.split(":")[0]);
            return `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
          });

          setAvailableTimeSlots(formattedSlots);

          // If current selected time is not available, reset it
          if (
            formattedSlots.length > 0 &&
            !formattedSlots.includes(startTime)
          ) {
            setStartTime(formattedSlots[0]);
          }
        } catch (error) {
          console.error("Failed to fetch available time slots:", error);
          toast({
            title: "Müsait saatler yüklenemedi",
            description: "Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
          setAvailableTimeSlots([]);
        } finally {
          setIsTimeSlotLoading(false);
        }
      } else {
        setAvailableTimeSlots([]);
      }
    };

    fetchAvailableTimeSlots();
  }, [date, boatId]);

  // Fallback time slots if API fails
  const fallbackTimeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8; // Start at 8 AM
    return `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
  });

  // Use available time slots if we have them, otherwise use fallback
  const timeSlots =
    availableTimeSlots.length > 0 ? availableTimeSlots : fallbackTimeSlots;

  // Helper function to determine if the current selection is valid for booking
  const isBookingValid = () => {
    // Check if date is selected and is in availableDates
    if (!date) return false;

    const isDateAvailable = availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
    );

    // Check if time slot is available
    const isTimeSlotAvailable = availableTimeSlots.length > 0;

    return isDateAvailable && isTimeSlotAvailable;
  };

  // Helper function to disable dates that are not available
  const disabledDates = {
    before: new Date(), // Disable past dates
    dayOfWeek: [], // Don't disable specific days of the week
    dates: isDateLoading
      ? []
      : Array.from({ length: 365 })
          .map((_, i) => {
            // Create a date for each day in the next year
            const day = new Date();
            day.setDate(day.getDate() + i);

            // Disable dates beyond 180 days (make them red and non-selectable)
            if (i >= 180) {
              return day;
            }

            // For dates within 180 days, check if they are in the availableDates array
            const isAvailable = availableDates.some(
              (availableDate) =>
                availableDate.getDate() === day.getDate() &&
                availableDate.getMonth() === day.getMonth() &&
                availableDate.getFullYear() === day.getFullYear()
            );

            // Return the date if it's not available (to be disabled)
            return isAvailable ? null : day;
          })
          .filter(Boolean), // Remove null values
  };

  // Dynamic duration options based on mode
  const durationOptions = isHourlyMode ? [2, 4, 6, 8] : [1, 2, 3, 4];

  // Calculate total price
  const totalUnits = duration; // hours or days depending on mode
  const subtotal = isHourlyMode
    ? hourlyPrice * totalUnits
    : dailyPrice * totalUnits;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  // Booking function
  const handleBooking = async () => {
    if (!date || !startTime) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen tarih ve saat seçin.",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected date and time are available
    if (!isBookingValid()) {
      toast({
        title: "Müsait değil",
        description:
          "Seçilen tarih veya saat için tekne müsait değil. Lütfen başka bir tarih veya saat seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Parse the start time
      const [hourStr, minuteStr] = startTime.split(":");
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);

      // Create start date with the selected time
      const startDate = new Date(date);
      startDate.setHours(hour, minute, 0, 0);

      // Calculate end date based on duration and mode (hourly or daily)
      let endDate;
      if (isHourlyMode) {
        endDate = addHours(startDate, duration);
      } else {
        endDate = addDays(startDate, duration);
      }

      // Check availability with the backend before proceeding
      const formattedDate = format(date, "yyyy-MM-dd");
      const isAvailable = await availabilityService.isBoatAvailableOnDate(
        Number(boatId),
        formattedDate
      );

      if (!isAvailable) {
        toast({
          title: "Müsait değil",
          description:
            "Seçilen tarih için tekne müsait değil. Lütfen başka bir tarih seçin.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const bookingData = {
        boatId: Number(boatId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        passengerCount: guests,
        totalPrice: total,
        notes: `Booking created on ${new Date().toISOString()}`,
      };

      const response = await bookingService.createBooking(bookingData);

      toast({
        title: "Rezervasyon talebi gönderildi",
        description: "Tekne sahibi en kısa sürede size dönüş yapacaktır.",
      });

      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking failed:", error);
      toast({
        title: "Rezervasyon yapılamadı",
        description: "Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Mode Toggle Component
  const ModeToggle = ({ className = "" }: { className?: string }) => (
    <div className={cn("relative bg-gray-100 rounded-lg p-1", className)}>
      <div
        className={cn(
          "absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-out",
          isHourlyMode ? "left-1 right-1/2 mr-0.5" : "right-1 left-1/2 ml-0.5"
        )}
      />
      <div className="relative flex">
        <button
          type="button"
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200",
            isHourlyMode
              ? "text-[#1A5F7A] bg-transparent"
              : "text-gray-600 hover:text-gray-800"
          )}
          onClick={() => setIsHourlyMode(true)}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Hourly
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200",
            !isHourlyMode
              ? "text-[#1A5F7A] bg-transparent"
              : "text-gray-600 hover:text-gray-800"
          )}
          onClick={() => setIsHourlyMode(false)}
        >
          <CalendarIcon className="w-4 h-4 inline mr-2" />
          Daily
        </button>
      </div>
    </div>
  );

  // Enhanced Price Display Component
  const PriceDisplay = ({ className = "" }: { className?: string }) => (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          ${isHourlyMode ? hourlyPrice : dailyPrice}
        </span>
        <span className="text-gray-500 font-medium">
          {isHourlyMode ? "per hour" : "per day"}
        </span>
      </div>
      {isHourlyMode && (
        <p className="text-sm text-gray-500">
          Minimum {durationOptions[0]} hours
        </p>
      )}
    </div>
  );

  // Enhanced Price Breakdown Component
  const PriceBreakdown = ({ className = "" }: { className?: string }) => (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            ${isHourlyMode ? hourlyPrice : dailyPrice} × {totalUnits}{" "}
            {isHourlyMode ? "hours" : totalUnits === 1 ? "day" : "days"}
          </span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Service fee</span>
          <span className="font-medium">${serviceFee.toFixed(2)}</span>
        </div>
      </div>
      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-[#1A5F7A]">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  // Enhanced CTA Button Component
  const CTAButton = ({
    onClick,
    disabled,
    loading,
    className = "",
    children,
  }: {
    onClick: () => void;
    disabled: boolean;
    loading: boolean;
    className?: string;
    children: React.ReactNode;
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-12 text-base font-semibold transition-all duration-200",
        "bg-gradient-to-r from-[#1A5F7A] to-[#002B5B] hover:from-[#002B5B] hover:to-[#1A5F7A]",
        "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg",
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {bookingSuccess && <CheckCircle className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );

  // Mobile booking button sticky footer
  const MobileBookingFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 md:hidden shadow-lg z-40 safe-area-inset-bottom">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <PriceDisplay />
        </div>
        <Button
          className="px-6 sm:px-8 h-12 bg-gradient-to-r from-[#1A5F7A] to-[#002B5B] hover:from-[#002B5B] hover:to-[#1A5F7A] shadow-lg touch-manipulation flex-shrink-0"
          onClick={() => setIsFormOpen(true)}
        >
          Book Now
        </Button>
      </div>
    </div>
  );

  // Mobile full-screen booking form
  const MobileBookingForm = () => (
    <div
      className={cn(
        "fixed inset-0 bg-white z-50 transition-all duration-300 ease-out md:hidden",
        isFormOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Book this boat
          </h2>
          <p className="text-sm text-gray-500">Complete your reservation</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFormOpen(false)}
          className="rounded-full"
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Booking Type
            </label>
            <ModeToggle />
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left h-14 border-2 touch-manipulation",
                      !date && "text-gray-500",
                      date && "border-[#1A5F7A]/20"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-[#1A5F7A]" />
                    {date
                      ? format(date, "EEEE, MMMM do, yyyy")
                      : "Choose your date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <AvailabilityCalendar
                    selected={date}
                    onSelect={setDate}
                    availabilityData={calendarAvailability}
                    isLoading={isDateLoading}
                    language={language}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Start Time
                </label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="h-14 border-2 touch-manipulation">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {isTimeSlotLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="ml-2 text-sm">Loading times...</span>
                      </div>
                    ) : (
                      timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="h-12">
                          <Clock className="w-4 h-4 inline mr-2" />
                          {time}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duration
                </label>
                <Select
                  value={duration.toString()}
                  onValueChange={(value) => setDuration(parseInt(value))}
                >
                  <SelectTrigger className="h-14 border-2 touch-manipulation">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((val) => (
                      <SelectItem
                        key={val}
                        value={val.toString()}
                        className="h-12"
                      >
                        {val}{" "}
                        {isHourlyMode ? "hours" : val === 1 ? "day" : "days"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Number of Guests
              </label>
              <Select
                value={guests.toString()}
                onValueChange={(value) => setGuests(parseInt(value))}
              >
                <SelectTrigger className="h-14 border-2 touch-manipulation">
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                    (num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        className="h-12"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        {num} {num === 1 ? "guest" : "guests"}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Price Breakdown</h3>
            <PriceBreakdown />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t bg-white safe-area-inset-bottom">
          <CTAButton
            onClick={handleBooking}
            disabled={!isBookingValid()}
            loading={loading}
            className="h-14 touch-manipulation"
          >
            {loading
              ? "Processing your request..."
              : bookingSuccess
              ? "Booking confirmed!"
              : isBookingValid()
              ? "Request to Book"
              : "Select date and time"}
          </CTAButton>
          <p className="text-center text-sm text-gray-500 mt-3">
            You won't be charged until the host accepts
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Enhanced Desktop Booking Form */}
      <Card className="sticky top-24 hidden md:block shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4 space-y-4">
          {/* Price Display */}
          <PriceDisplay />

          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Type
            </label>
            <ModeToggle />
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left h-11 border-2 transition-colors",
                    !date && "text-gray-500",
                    date && "border-[#1A5F7A]/20 bg-[#1A5F7A]/5"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4 text-[#1A5F7A]" />
                  {date ? format(date, "EEEE, MMM do") : "Choose your date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <AvailabilityCalendar
                  selected={date}
                  onSelect={setDate}
                  availabilityData={calendarAvailability}
                  isLoading={isDateLoading}
                  language={language}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {isTimeSlotLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="ml-2 text-sm">Loading...</span>
                    </div>
                  ) : (
                    timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <Clock className="w-4 h-4 inline mr-2 text-[#1A5F7A]" />
                        {time}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((val) => (
                    <SelectItem key={val} value={val.toString()}>
                      {val}{" "}
                      {isHourlyMode ? "hours" : val === 1 ? "day" : "days"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger className="h-11 border-2">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                  (num) => (
                    <SelectItem key={num} value={num.toString()}>
                      <Users className="w-4 h-4 inline mr-2 text-[#1A5F7A]" />
                      {num} {num === 1 ? "guest" : "guests"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* CTA Button */}
          <CTAButton
            onClick={handleBooking}
            disabled={!isBookingValid()}
            loading={loading}
          >
            {loading
              ? "Processing your request..."
              : bookingSuccess
              ? "Booking confirmed!"
              : isBookingValid()
              ? "Request to Book"
              : "Select date and time"}
          </CTAButton>

          <p className="text-center text-sm text-gray-500">
            You won't be charged until the host accepts
          </p>
        </CardContent>

        {/* Enhanced Price Breakdown */}
        <CardFooter className="border-t bg-gray-50/50 rounded-b-lg">
          <div className="w-full">
            <h3 className="font-medium text-gray-900 mb-3">Price Breakdown</h3>
            <PriceBreakdown />
          </div>
        </CardFooter>
      </Card>

      {/* Mobile View Components */}
      <MobileBookingFooter />
      <MobileBookingForm />
    </>
  );
}

export default BookingForm;
