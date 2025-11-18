import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addHours, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  Star,
  MessageCircle,
  Package,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bookingService } from "@/services/bookingService";
import { availabilityService } from "@/services/availabilityService";
import { boatService } from "@/services/boatService";
import { captainService } from "@/services/captainService";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { CalendarAvailability } from "@/types/availability.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { CustomerCaptainChat } from "./messaging/CustomerCaptainChat";
import {
  BookingDTO,
  BookingStatus,
  SelectedServiceDTO,
  CreateBookingDTO,
} from "@/types/booking.types";
import { BoatServiceDTO } from "@/types/boat.types";
import { Captain } from "@/types/captain.types";
import { PaymentStatusResponseDto } from "@/types/payment.types";
import { extractCaptainIdFromBooking } from "@/utils/conversationUtils";
import { paymentService } from "@/services/paymentService";
import ServiceSelector from "./ServiceSelector";

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
  const { isCustomer, isAuthenticated, user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("10:00");
  const [duration, setDuration] = useState<number>(4);
  const [guests, setGuests] = useState<number>(2);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Messaging state
  const [showMessaging, setShowMessaging] = useState(false);
  const [lastBooking, setLastBooking] = useState<BookingDTO | null>(null);
  const [captain, setCaptain] = useState<Captain | null>(null);
  const [captainLoading, setCaptainLoading] = useState(false);

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

  // Services state
  const [selectedServices, setSelectedServices] = useState<
    SelectedServiceDTO[]
  >([]);
  const [servicesPrice, setServicesPrice] = useState<number>(0);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Payment state
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusResponseDto | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Memoize the boatId number to prevent unnecessary re-renders
  const boatIdNumber = useMemo(() => Number(boatId), [boatId]);

  // ✅ OPTIMIZED: Ek hizmetleri React Query ile tek noktadan ve cache'li yönet
  // Bu sayede BookingForm ve ServiceSelector aynı data setini paylaşır, aynı tekne
  // için birden fazla istek atılmaz ve in-flight dedup + client cache birlikte çalışır.
  const {
    data: boatServices,
    isLoading: isBoatServicesLoading,
    isError: isBoatServicesError,
    error: boatServicesError,
  } = useQuery({
    queryKey: ["boat-services-with-pricing", boatIdNumber],
    queryFn: () =>
      boatService.getBoatServicesWithPricing(boatIdNumber as number),
    enabled: !!boatIdNumber,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const availableServices: BoatServiceDTO[] = useMemo(() => {
    if (!boatServices) return [];

    // Aynı servis birden fazla kez dönse bile tekilleştir
    return boatServices.filter(
      (service, index, self) =>
        index === self.findIndex((s) => s.id === service.id)
    );
  }, [boatServices]);

  const boatServicesErrorMessage: string | null = isBoatServicesError
    ? ((boatServicesError as any)?.message as string) ||
      "Hizmetler yüklenirken bir hata oluştu."
    : null;

  // Memoize date formatting to prevent unnecessary calculations
  const formattedDateForSlots = useMemo(() => {
    return date ? format(date, "yyyy-MM-dd") : null;
  }, [date]);

  // Prefill form fields from URL (runs once)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get("start");
    const end = params.get("end");
    const guestsParam = params.get("guests");

    if (start) {
      const startD = new Date(start);
      if (!isNaN(startD.getTime())) setDate(startD);
    }
    if (guestsParam) {
      const min = parseInt(guestsParam.split("-")[0]);
      if (!isNaN(min)) setGuests(min);
    }
    if (end && start) {
      const startD = new Date(start);
      const endD = new Date(end);
      const diffDays = Math.max(
        1,
        Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))
      );
      if (!isNaN(diffDays)) {
        setIsHourlyMode(false);
        setDuration(diffDays);
      }
    }
  }, []);

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
        const startDate = format(today, "yyyy-MM-dd");
        const endDate = format(sixMonthsLater, "yyyy-MM-dd");

        // Get calendar availability for the date range
        const calendarData = await availabilityService.getCalendarAvailability(
          boatIdNumber,
          startDate,
          endDate
        );

        if (isMounted) {
          // Filter for available dates and convert to Date objects
          const availableDays = calendarData
            .filter((day) => day.isAvailable)
            .map((day) => new Date(day.date));

          setAvailableDates(availableDays);
          setCalendarAvailability(calendarData);
        }
      } catch (error) {
        console.error("Failed to fetch available dates:", error);
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
    let timeoutId: ReturnType<typeof setTimeout>;

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
          const formattedSlots = slots.map((slot) => {
            const hour = parseInt(slot.split(":")[0]);
            return `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
          });

          setAvailableTimeSlots(formattedSlots);

          // If current selected time is not available and we don't have a selected time yet, set first available
          if (
            formattedSlots.length > 0 &&
            (!startTime || !formattedSlots.includes(startTime))
          ) {
            setStartTime(formattedSlots[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch available time slots:", error);
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
  }, [formattedDateForSlots, boatIdNumber]); // Remove startTime to prevent infinite loop

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
    // E2E testleri ve kurumsal UX için masaüstü/mobil akışta tek bir ana CTA kullanıyoruz
    // Testler `Book Now` metnini beklediği için burada bunu döndürüyoruz.
    return "Book Now";
  };

  // Messaging functions
  const loadCaptainInfo = useCallback(async (booking: BookingDTO) => {
    if (!booking) return;

    setCaptainLoading(true);
    try {
      const captainId = await extractCaptainIdFromBooking(booking);
      const captainData = await captainService.getCaptainById(captainId);
      setCaptain(captainData);
    } catch (error) {
      console.error("Failed to load captain info:", error);
      toast({
        title: "Kaptan bilgileri yüklenemedi",
        description: "Mesajlaşma özelliği şu anda kullanılamıyor.",
        variant: "destructive",
      });
    } finally {
      setCaptainLoading(false);
    }
  }, []);

  const handleOpenMessaging = useCallback(() => {
    if (lastBooking && captain) {
      setShowMessaging(true);
    }
  }, [lastBooking, captain]);

  const handleCloseMessaging = useCallback(() => {
    setShowMessaging(false);
  }, []);

  // Check if messaging should be available for the booking
  const isMessagingAvailable = useCallback(() => {
    if (!lastBooking || !isAuthenticated || !isCustomer()) {
      return false;
    }

    const allowedStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED,
    ];

    return allowedStatuses.includes(lastBooking.status as BookingStatus);
  }, [lastBooking, isAuthenticated, isCustomer, captain, captainLoading]);

  // Payment redirect function
  const handlePaymentRedirect = useCallback(
    async (bookingId: number) => {
      try {
        setPaymentLoading(true);

        // Get payment status from backend
        const paymentInfo = await paymentService.getPaymentStatus(bookingId);
        setPaymentStatus(paymentInfo);

        // If payment is required and we have a payment URL, redirect
        if (paymentInfo.paymentRequired && paymentInfo.paymentUrl) {
          // Show payment info briefly before redirect
          setShowPaymentInfo(true);

          // ✅ iFrame akışına yönlendir
          setTimeout(() => {
            navigate(`/payment/return?bookingId=${bookingId}&start=iframe`);
          }, 1500);
        } else if (paymentInfo.paymentRequired && !paymentInfo.paymentUrl) {
          // 3DS akışı: ödeme linki yoksa kart bilgisi akışına yönlendir
          navigate(`/payment/return?bookingId=${bookingId}&start=3ds`);
          return;
        } else if (paymentInfo.paymentCompleted) {
          // Payment already completed
          toast({
            title: "Ödeme zaten tamamlanmış",
            description: "Bu rezervasyon için ödeme zaten tamamlanmış durumda.",
          });

          // Redirect to bookings page
          navigate("/my-bookings");
        } else {
          // No payment required
          toast({
            title: "Rezervasyon tamamlandı",
            description:
              "Ödeme gerektirmeyen rezervasyon başarıyla oluşturuldu.",
          });

          // Redirect to bookings page
          navigate("/my-bookings");
        }
      } catch (error) {
        console.error("Payment redirect failed:", error);
        toast({
          title: "Ödeme sayfası yüklenemedi",
          description:
            "Rezervasyon oluşturuldu ancak ödeme sayfasına yönlendirilemedi. Lütfen rezervasyonlarım sayfasından ödemeyi tamamlayın.",
          variant: "destructive",
        });

        // Still redirect to bookings page so user can see their reservation
        setTimeout(() => {
          navigate("/my-bookings");
        }, 3000);
      } finally {
        setPaymentLoading(false);
        setShowPaymentInfo(false);
      }
    },
    [navigate]
  );

  // Cleanup messaging state when component unmounts
  useEffect(() => {
    return () => {
      setShowMessaging(false);
      setLastBooking(null);
      setCaptain(null);
      setPaymentStatus(null);
      setShowPaymentInfo(false);
    };
  }, []);

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

  // Calculate total price - ℹ️ Bu sadece tahmin, gerçek fiyat backend'de hesaplanacak
  const totalUnits = duration; // hours or days depending on mode
  const rentalPrice = isHourlyMode
    ? hourlyPrice * totalUnits
    : dailyPrice * totalUnits;
  const estimatedTotal = rentalPrice + servicesPrice; // Tahminî toplam (service fee backend'de)

  // Payment calculations
  const depositAmount = paymentService.calculateDepositAmount(
    estimatedTotal,
    20
  );
  const remainingAmount = estimatedTotal - depositAmount;

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
      const formattedStartDate = format(date, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // For multi-day bookings, check the entire date range
      let isAvailable;
      if (isHourlyMode) {
        // For hourly bookings, check single date
        isAvailable =
          await availabilityService.isBoatAvailableOnDateWithBookings(
            Number(boatId),
            formattedStartDate
          );
      } else {
        // For daily bookings, check the entire date range
        isAvailable = await availabilityService.isBoatAvailableBetweenDates(
          Number(boatId),
          formattedStartDate,
          formattedEndDate
        );
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

      const bookingData: CreateBookingDTO = {
        boatId: Number(boatId),
        // Backend CreateBookingDTO LocalDateTime alanları için timezone'suz ISO format bekliyor
        // örn: 2025-11-28T10:00:00
        startDate: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        passengerCount: guests,
        selectedServices:
          selectedServices.length > 0 ? selectedServices : undefined,
        notes: `Booking created on ${new Date().toISOString()}`,
      };

      const response = await bookingService.createBooking(bookingData);

      // Save booking for messaging
      setLastBooking(response);

      // Load captain info for messaging
      await loadCaptainInfo(response);

      toast({
        title: "Rezervasyon oluşturuldu",
        description: "Ödeme sayfasına yönlendiriliyorsunuz...",
      });

      // Get payment status and redirect to payment (3DS fallback yoksa PaymentReturn'da başlatılacak)
      await handlePaymentRedirect(response.id);

      try {
        const status = await paymentService.getPaymentStatus(response.id);
        const hasLink = !!status.paymentUrl;
        if (!hasLink) {
          // PaymentReturn sayfasında start=3ds parametresi ile kart formu gösterilecek
          const amount = status.depositAmount ?? status.totalAmount ?? 0;
          navigate(
            `/payment/return?bookingId=${response.id}&start=3ds&amount=${amount}`
          );
        }
      } catch (e) {
        // Sessiz geç, kullanıcı zaten ödeme modali/redirect deneyimini gördü
      }
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

  // Mobile booking button sticky footer
  const MobileBookingFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <span className="text-lg font-semibold">
            ₺{isHourlyMode ? hourlyPrice : dailyPrice}
          </span>
          <span className="text-gray-500 ml-1">
            {isHourlyMode ? "/saat" : "/gün"}
          </span>
        </div>

        <Button
          className="px-8"
          onClick={() => setIsFormOpen(true)}
          disabled={!canUserBook()}
        >
          {!isAuthenticated
            ? "Login Required"
            : !isCustomer()
            ? "Customer Access Only"
            : "Book Now"}
        </Button>
      </div>
    </div>
  );

  // Mobile full-screen booking form
  const MobileBookingForm = () => (
    <div
      className={cn(
        "fixed inset-0 bg-white z-50 transition-transform transform md:hidden",
        isFormOpen ? "translate-y-0" : "translate-y-full"
      )}
    >
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

      <div className="p-4 overflow-y-auto h-full pb-24 max-h-[calc(100vh-80px)]">
        <div className="flex mb-3 ">
          <Button
            variant="outline"
            className={cn(
              "flex-1 rounded-none rounded-l-md",
              isHourlyMode && "bg-gray-200"
            )}
            onClick={() => setIsHourlyMode(true)}
          >
            Hourly
          </Button>
          <Button
            variant="outline"
            className={cn(
              "flex-1 rounded-none rounded-r-md",
              !isHourlyMode && "bg-gray-200"
            )}
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
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <Select value={startTime} onValueChange={setStartTime}>
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
                      {val}{" "}
                      {isHourlyMode ? "hours" : val === 1 ? "day" : "days"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Guests
            </label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                  (num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection - Compact Button */}
          <div className="border-t pt-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Ek Hizmetler
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowServiceModal(true)}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Hizmet Seç ({selectedServices.length})
                </Button>
              </div>

              {selectedServices.length > 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 space-y-2 border border-primary/20">
                  <div className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Seçilen Hizmetler ({selectedServices.length})
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedServices.map((selected) => {
                      const service = availableServices.find(
                        (s) => s.id === selected.boatServiceId
                      );
                      if (!service) return null;
                      return (
                        <div
                          key={selected.boatServiceId}
                          className="flex justify-between items-center text-xs text-gray-700"
                        >
                          <span className="truncate mr-2">
                            {service.name} x{selected.quantity}
                          </span>
                          <span className="font-medium text-primary">
                            ₺
                            {(
                              service.price * selected.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-sm text-primary">
                    <span>Hizmet Toplamı:</span>
                    <span>₺{servicesPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div className="mt-6 space-y-3 border-t border-b py-4 my-4">
          <div className="flex justify-between">
            <span className="text-gray-600">
              ₺{isHourlyMode ? hourlyPrice : dailyPrice} × {totalUnits}{" "}
              {isHourlyMode ? "saat" : totalUnits === 1 ? "gün" : "gün"}
            </span>
            <span>₺{rentalPrice.toLocaleString()}</span>
          </div>
          {servicesPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ek hizmetler</span>
              <span>₺{servicesPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-3 border-t">
            <span>Toplam tutar</span>
            <span>₺{estimatedTotal.toLocaleString()}</span>
          </div>

          {/* Payment breakdown */}
          <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 font-medium flex items-center">
                💳 Online ön ödeme tutarı
                <span className="ml-1 text-xs bg-blue-200 text-blue-800 px-1 rounded">
                  %20
                </span>
              </span>
              <span className="font-semibold text-blue-800">
                ₺{depositAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Teknede ödenecek tutar</span>
              <span className="text-gray-700">
                ₺{remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            *Gerçek fiyat rezervasyon sırasında hesaplanacaktır
          </p>
        </div>

        <Button
          className="w-full"
          onClick={handleBooking}
          disabled={loading || !isBookingValid() || !canUserBook()}
        >
          {getBookingButtonText()}
        </Button>

        {/* Message Captain Button - Show after successful booking */}
        {lastBooking && isMessagingAvailable() && (
          <Button
            className="w-full mt-2"
            variant="outline"
            onClick={handleOpenMessaging}
            disabled={captainLoading || !captain}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {captainLoading ? "Loading..." : "Message Captain"}
          </Button>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          You won't be charged yet
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Card className="sticky top-20 sm:top-24 lg:top-20 xl:top-24 hidden md:block max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-100px)] xl:max-h-[calc(100vh-120px)] overflow-y-auto">
        <CardHeader className="pb-3 px-4 sm:px-6 lg:px-4 xl:px-6 pt-4 sm:pt-6 lg:pt-4 xl:pt-6">
          <div className="flex mb-3">
            <Button
              variant="outline"
              className={cn(
                "flex-1 rounded-none rounded-l-md",
                isHourlyMode && "bg-gray-200"
              )}
              onClick={() => setIsHourlyMode(true)}
            >
              Hourly
            </Button>
            <Button
              variant="outline"
              className={cn(
                "flex-1 rounded-none rounded-r-md",
                !isHourlyMode && "bg-gray-200"
              )}
              onClick={() => setIsHourlyMode(false)}
            >
              Daily
            </Button>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="text-lg font-semibold">
                ₺{isHourlyMode ? hourlyPrice : dailyPrice}
              </span>
              <span className="text-gray-500 ml-1">
                {isHourlyMode ? "/saat" : "/gün"}
              </span>
            </div>
            {/*<div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium">4.9</span>
              <span className="text-sm text-gray-500 ml-1">(32)</span>
            </div>*/}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 py-4 sm:py-6">
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
                  onSelect={(next) => {
                    // Tarih seçildiğinde popover'ı kapatmak için butona programatik tıklama
                    setDate(next);
                    if (next) {
                      // Kullanıcı akışını bozmadan popover'ı kapat
                      requestAnimationFrame(() => {
                        const trigger = document.querySelector(
                          'button:has(svg[class*="CalendarIcon"]), button:has(svg[class*="calendar"])'
                        ) as HTMLButtonElement | null;
                        trigger?.click();
                      });
                    }
                  }}
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
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <Select value={startTime} onValueChange={setStartTime}>
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
                      {val}{" "}
                      {isHourlyMode ? "hours" : val === 1 ? "day" : "days"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Guests
            </label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                  (num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection - Compact Button */}
          <div className="border-t pt-3 sm:pt-4 lg:pt-3 xl:pt-4">
            <div className="space-y-2 sm:space-y-3 lg:space-y-2 xl:space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Ek Hizmetler
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowServiceModal(true)}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Hizmet Seç ({selectedServices.length})
                </Button>
              </div>

              {selectedServices.length > 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 space-y-2 border border-primary/20">
                  <div className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Seçilen Hizmetler ({selectedServices.length})
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedServices.map((selected) => {
                      const service = availableServices.find(
                        (s) => s.id === selected.boatServiceId
                      );
                      if (!service) return null;
                      return (
                        <div
                          key={selected.boatServiceId}
                          className="flex justify-between items-center text-xs text-gray-700"
                        >
                          <span className="truncate mr-2">
                            {service.name} x{selected.quantity}
                          </span>
                          <span className="font-medium text-primary">
                            ₺
                            {(
                              service.price * selected.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-sm text-primary">
                    <span>Hizmet Toplamı:</span>
                    <span>₺{servicesPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleBooking}
            disabled={loading || !isBookingValid() || !canUserBook()}
          >
            {getBookingButtonText()}
          </Button>

          {/* Message Captain Button - Show after successful booking */}
          {lastBooking && isMessagingAvailable() && (
            <Button
              className="w-full mt-2"
              variant="outline"
              onClick={handleOpenMessaging}
              disabled={captainLoading || !captain}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {captainLoading ? "Loading..." : "Message Captain"}
            </Button>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            You won't be charged yet
          </p>
        </CardContent>

        <CardFooter className="border-t pt-4 px-4 sm:px-6 lg:px-4 xl:px-6 pb-4 sm:pb-6 lg:pb-4 xl:pb-6">
          <div className="space-y-3 w-full">
            <div className="flex justify-between">
              <span className="text-gray-600">
                ₺{isHourlyMode ? hourlyPrice : dailyPrice} × {totalUnits}{" "}
                {isHourlyMode ? "saat" : totalUnits === 1 ? "gün" : "gün"}
              </span>
              <span>₺{rentalPrice.toLocaleString()}</span>
            </div>
            {servicesPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ek hizmetler</span>
                <span>₺{servicesPrice.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-3 border-t">
              <span>Toplam tutar</span>
              <span>₺{estimatedTotal.toLocaleString()}</span>
            </div>

            {/* Payment breakdown */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 font-medium flex items-center">
                  💳 Online ön ödeme tutarı
                  <span className="ml-1 text-xs bg-blue-200 text-blue-800 px-1 rounded">
                    %20
                  </span>
                </span>
                <span className="font-semibold text-blue-800">
                  ₺{depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teknede ödenecek tutar</span>
                <span className="text-gray-700">
                  ₺{remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              *Gerçek fiyat rezervasyon sırasında hesaplanacaktır
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Mobile View Components */}
      <MobileBookingFooter />
      <MobileBookingForm />

      {/* Customer Captain Chat Modal */}
      {lastBooking && captain && (
        <CustomerCaptainChat
          isOpen={showMessaging}
          onClose={handleCloseMessaging}
          booking={lastBooking}
          captain={captain}
        />
      )}

      {/* Payment Info Modal */}
      <Dialog open={showPaymentInfo} onOpenChange={setShowPaymentInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              💳 Ödeme Sayfasına Yönlendiriliyorsunuz
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentStatus && (
              <>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Rezervasyon Başarıyla Oluşturuldu!
                  </h3>
                  <p className="text-sm text-green-700">
                    Rezervasyon ID: #{paymentStatus.bookingId}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Tutar:</span>
                    <span className="font-semibold">
                      ₺{paymentStatus.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Şimdi Ödenecek (Depozito):</span>
                    <span className="font-bold">
                      ₺{paymentStatus.depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Teknede Ödenecek:</span>
                    <span>
                      ₺{paymentStatus.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    ⏰ Güvenli ödeme sayfasına yönlendiriliyorsunuz...
                  </p>
                </div>
              </>
            )}

            {paymentLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Ödeme sayfası hazırlanıyor...
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Selection Modal */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ekstralarınızı Seçiniz
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
              onClick={() => setShowServiceModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <ServiceSelector
              boatId={boatIdNumber}
              availableServices={availableServices}
              loading={isBoatServicesLoading}
              error={boatServicesErrorMessage}
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
              onPriceChange={setServicesPrice}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowServiceModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={() => setShowServiceModal(false)}
              className="bg-primary hover:bg-primary/90"
            >
              Seçimi Tamamla ({selectedServices.length} hizmet)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BookingForm;
