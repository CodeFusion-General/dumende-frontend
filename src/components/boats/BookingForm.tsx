import { useState, useEffect, useMemo, useCallback } from "react";
import { format, addHours, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Users, ChevronUp, ChevronDown, Star } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";

interface BookingFormProps {
  dailyPrice: number;
  hourlyPrice: number;
  isHourly?: boolean;
  maxGuests: number;
  boatId: string;
}

export function BookingForm({ dailyPrice, hourlyPrice, isHourly: defaultIsHourly = true, maxGuests, boatId }: BookingFormProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isCustomer, isAuthenticated } = useAuth();
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("10:00");
  const [duration, setDuration] = useState<number>(4);
  const [guests, setGuests] = useState<number>(2);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toggle between hourly and daily pricing
  const [isHourlyMode, setIsHourlyMode] = useState<boolean>(defaultIsHourly);
  
  // State for available dates and time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [calendarAvailability, setCalendarAvailability] = useState<CalendarAvailability[]>([]);
  const [isDateLoading, setIsDateLoading] = useState<boolean>(false);
  const [isTimeSlotLoading, setIsTimeSlotLoading] = useState<boolean>(false);
  
  // Memoize the boatId number to prevent unnecessary re-renders
  const boatIdNumber = useMemo(() => Number(boatId), [boatId]);

  // Memoize date formatting to prevent unnecessary calculations
  const formattedDateForSlots = useMemo(() => {
    return date ? format(date, 'yyyy-MM-dd') : null;
  }, [date]);

  // Fetch available dates for the next 6 months (180 days) - Only run once per boatId
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const fetchAvailableDates = async () => {
      if (!boatIdNumber) return;

      setIsDateLoading(true);
      try {
        // Get current date and date 6 months from now (180 days)
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);
        
        // Format dates for API
        const startDate = format(today, 'yyyy-MM-dd');
        const endDate = format(sixMonthsLater, 'yyyy-MM-dd');
        
        // Get calendar availability for the date range
        const calendarData = await availabilityService.getCalendarAvailability(
          boatIdNumber,
          startDate,
          endDate
        );
        
        if (isMounted) {
          // Filter for available dates and convert to Date objects
          const availableDays = calendarData
            .filter(day => day.isAvailable)
            .map(day => new Date(day.date));

          setAvailableDates(availableDays);
          setCalendarAvailability(calendarData);
        }
      } catch (error) {
        console.error('Failed to fetch available dates:', error);
        if (isMounted) {
          toast({
            title: "Müsait tarihler yüklenemedi",
            description: "Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsDateLoading(false);
        }
      }
    };
    
    fetchAvailableDates();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [boatIdNumber]); // Only depend on boatIdNumber, not all the state setters

  // Fetch available time slots when date changes - Add debouncing
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchAvailableTimeSlots = async () => {
      if (!formattedDateForSlots || !boatIdNumber) {
        if (isMounted) {
          setAvailableTimeSlots([]);
        }
        return;
      }

      setIsTimeSlotLoading(true);
      try {
        const slots = await bookingService.getAvailableTimeSlots(
          boatIdNumber,
          formattedDateForSlots
        );

        if (isMounted) {
          // Convert 24-hour format to 12-hour format with AM/PM
          const formattedSlots = slots.map(slot => {
            const hour = parseInt(slot.split(':')[0]);
            return `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
          });
          
          setAvailableTimeSlots(formattedSlots);
          
          // If current selected time is not available, reset it
          if (formattedSlots.length > 0 && !formattedSlots.includes(startTime)) {
            setStartTime(formattedSlots[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch available time slots:', error);
        if (isMounted) {
          toast({
            title: "Müsait saatler yüklenemedi",
            description: "Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
          setAvailableTimeSlots([]);
        }
      } finally {
        if (isMounted) {
          setIsTimeSlotLoading(false);
        }
      }
    };

    // Debounce the API call to prevent too many requests
    timeoutId = setTimeout(() => {
      fetchAvailableTimeSlots();
    }, 300);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [formattedDateForSlots, boatIdNumber, startTime]); // Remove toast from dependencies

  // Fallback time slots if API fails
  const fallbackTimeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8; // Start at 8 AM
    return `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  });
  
  // Use available time slots if we have them, otherwise use fallback
  const timeSlots = availableTimeSlots.length > 0 ? availableTimeSlots : fallbackTimeSlots;
  
  // Helper function to determine if the current selection is valid for booking
  const isBookingValid = () => {
    // Check if date is selected and is in availableDates
    if (!date) return false;
    
    const isDateAvailable = availableDates.some(
      availableDate => 
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
    );
    
    // Check if time slot is available
    const isTimeSlotAvailable = availableTimeSlots.length > 0;
    
    return isDateAvailable && isTimeSlotAvailable;
  };

  // Helper function to check if user can make bookings
  const canUserBook = () => {
    return isAuthenticated && isCustomer();
  };

  // Helper function to get appropriate button text
  const getBookingButtonText = () => {
    if (!isAuthenticated) {
      return "Login Required";
    }
    if (!isCustomer()) {
      return "Customer Access Only";
    }
    if (loading) {
      return "Processing...";
    }
    if (!isBookingValid()) {
      return "No Availability";
    }
    return "Request to Book";
  };
  
  // Helper function to disable dates that are not available
  const disabledDates = {
    before: new Date(), // Disable past dates
    dayOfWeek: [], // Don't disable specific days of the week
    dates: isDateLoading ? [] : Array.from({ length: 365 }).map((_, i) => {
      // Create a date for each day in the next year
      const day = new Date();
      day.setDate(day.getDate() + i);
      
      // Disable dates beyond 180 days (make them red and non-selectable)
      if (i >= 180) {
        return day;
      }
      
      // For dates within 180 days, check if they are in the availableDates array
      const isAvailable = availableDates.some(
        availableDate => 
          availableDate.getDate() === day.getDate() &&
          availableDate.getMonth() === day.getMonth() &&
          availableDate.getFullYear() === day.getFullYear()
      );
      
      // Return the date if it's not available (to be disabled)
      return isAvailable ? null : day;
    }).filter(Boolean) // Remove null values
  };

  // Dynamic duration options based on mode
  const durationOptions = isHourlyMode ? [2, 4, 6, 8] : [1, 2, 3, 4];

  // Calculate total price
  const totalUnits = duration; // hours or days depending on mode
  const subtotal = isHourlyMode ? hourlyPrice * totalUnits : dailyPrice * totalUnits;
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
        description: "Seçilen tarih veya saat için tekne müsait değil. Lütfen başka bir tarih veya saat seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Parse the start time
      const [hourStr, minuteStr] = startTime.split(':');
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
      const formattedStartDate = format(date, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // For multi-day bookings, check the entire date range
      let isAvailable;
      if (isHourlyMode) {
        // For hourly bookings, check single date
        isAvailable = await availabilityService.isBoatAvailableOnDateWithBookings(Number(boatId), formattedStartDate);
      } else {
        // For daily bookings, check the entire date range
        isAvailable = await availabilityService.isBoatAvailableBetweenDates(Number(boatId), formattedStartDate, formattedEndDate);
      }
      
      if (!isAvailable) {
        toast({
          title: "Müsait değil",
          description: isHourlyMode 
            ? "Seçilen tarih için tekne müsait değil. Lütfen başka bir tarih seçin."
            : "Seçilen tarih aralığında tekne müsait değil. Lütfen başka tarihler seçin.",
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
        notes: `Booking created on ${new Date().toISOString()}`
      };

      const response = await bookingService.createBooking(bookingData);
      
      toast({
        title: "Rezervasyon talebi gönderildi",
        description: "Tekne sahibi en kısa sürede size dönüş yapacaktır.",
      });

      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Rezervasyon yapılamadı",
        description: "Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mobile booking button sticky footer
  const MobileBookingFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <span className="text-lg font-semibold">${isHourlyMode ? hourlyPrice : dailyPrice}</span>
          <span className="text-gray-500 ml-1">{isHourlyMode ? '/hour' : '/day'}</span>
        </div>
        
        <Button 
          className="px-8" 
          onClick={() => setIsFormOpen(true)}
          disabled={!canUserBook()}
        >
          {!isAuthenticated ? "Login Required" : !isCustomer() ? "Customer Access Only" : "Book Now"}
        </Button>
      </div>
    </div>
  );
  
  // Mobile full-screen booking form
  const MobileBookingForm = () => (
    <div className={cn(
      "fixed inset-0 bg-white z-50 transition-transform transform md:hidden",
      isFormOpen ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Book this boat</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsFormOpen(false)}
        >
          <ChevronDown size={24} />
        </Button>
      </div>
      
      <div className="p-4 overflow-auto h-full pb-24">
        <div className="flex mb-3 ">
          <Button
            variant="outline"
            className={cn("flex-1 rounded-none rounded-l-md", isHourlyMode && "bg-gray-200")}
            onClick={() => setIsHourlyMode(true)}
          >
            Hourly
          </Button>
          <Button
            variant="outline"
            className={cn("flex-1 rounded-none rounded-r-md", !isHourlyMode && "bg-gray-200")}
            onClick={() => setIsHourlyMode(false)}
          >
            Daily
          </Button>
        </div>
        {/* Form fields - duplicate of desktop for mobile */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !date && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <AvailabilityCalendar
                  selected={date}
                  onSelect={setDate}
                  availabilityData={calendarAvailability}
                  isLoading={isDateLoading}
                  language={language}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Select
                value={startTime}
                onValueChange={setStartTime}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
              <SelectContent>
                {durationOptions.map((val) => (
                  <SelectItem key={val} value={val.toString()}>
                    {val} {isHourlyMode ? 'hours' : val === 1 ? 'day' : 'days'}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Number of Guests</label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Price summary */}
        <div className="mt-6 space-y-3 border-t border-b py-4 my-4">
          <div className="flex justify-between">
            <span className="text-gray-600">${isHourlyMode ? hourlyPrice : dailyPrice} × {totalUnits} {isHourlyMode ? 'hours' : totalUnits === 1 ? 'day' : 'days'}</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleBooking}
          disabled={loading || !isBookingValid() || !canUserBook()}
        >
          {getBookingButtonText()}
        </Button>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          You won't be charged yet
        </p>
      </div>
    </div>
  );
  
  return (
    <>
      <Card className="sticky top-24 hidden md:block">
        <CardHeader className="pb-3">
          <div className="flex mb-3">
            <Button
              variant="outline"
              className={cn("flex-1 rounded-none rounded-l-md", isHourlyMode && "bg-gray-200")}
              onClick={() => setIsHourlyMode(true)}
            >
              Hourly
            </Button>
            <Button
              variant="outline"
              className={cn("flex-1 rounded-none rounded-r-md", !isHourlyMode && "bg-gray-200")}
              onClick={() => setIsHourlyMode(false)}
            >
              Daily
            </Button>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="text-lg font-semibold">${isHourlyMode ? hourlyPrice : dailyPrice}</span>
              <span className="text-gray-500 ml-1">{isHourlyMode ? '/hour' : '/day'}</span>
            </div>
            {/*<div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium">4.9</span>
              <span className="text-sm text-gray-500 ml-1">(32)</span>
            </div>*/}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !date && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <AvailabilityCalendar
                  selected={date}
                  onSelect={setDate}
                  availabilityData={calendarAvailability}
                  isLoading={isDateLoading}
                  language={language}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Select
                value={startTime}
                onValueChange={setStartTime}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((val) => (
                    <SelectItem key={val} value={val.toString()}>
                      {val} {isHourlyMode ? 'hours' : val === 1 ? 'day' : 'days'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Number of Guests</label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full"
            onClick={handleBooking}
            disabled={loading || !isBookingValid() || !canUserBook()}
          >
            {getBookingButtonText()}
          </Button>

          <p className="text-center text-sm text-gray-500">
            You won't be charged yet
          </p>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="space-y-3 w-full">
            <div className="flex justify-between">
              <span className="text-gray-600">${isHourlyMode ? hourlyPrice : dailyPrice} × {totalUnits} {isHourlyMode ? 'hours' : totalUnits === 1 ? 'day' : 'days'}</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-3 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
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
