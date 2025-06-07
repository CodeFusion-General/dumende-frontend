import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, ChevronUp, ChevronDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface BookingFormProps {
  dailyPrice: number;
  hourlyPrice: number;
  isHourly?: boolean;
  maxGuests: number;
  boatId: string;
}

export function BookingForm({ dailyPrice, hourlyPrice, isHourly: defaultIsHourly = true, maxGuests, boatId }: BookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("10:00");
  const [duration, setDuration] = useState<number>(4);
  const [guests, setGuests] = useState<number>(2);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Toggle between hourly and daily pricing
  const [isHourlyMode, setIsHourlyMode] = useState<boolean>(defaultIsHourly);
  
  /* Backend hazır olduğunda kullanılacak state:
  const [loading, setLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (date) {
        try {
          const slots = await bookingService.getAvailableTimeSlots(boatId, format(date, 'yyyy-MM-dd'));
          setAvailableTimeSlots(slots);
        } catch (error) {
          console.error('Failed to fetch available time slots:', error);
          toast({
            title: "Müsait saatler yüklenemedi",
            description: "Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        }
      }
    };

    fetchAvailableTimeSlots();
  }, [date, boatId]);
  */
  
  // Generate available time slots
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8; // Start at 8 AM
    return `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  });

  // Dynamic duration options based on mode
  const durationOptions = isHourlyMode ? [2, 4, 6, 8] : [1, 2, 3, 4];

  // Calculate total price
  const totalUnits = duration; // hours or days depending on mode
  const subtotal = isHourlyMode ? hourlyPrice * totalUnits : dailyPrice * totalUnits;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  /* Backend hazır olduğunda kullanılacak rezervasyon fonksiyonu:
  const handleBooking = async () => {
    if (!date || !startTime) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen tarih ve saat seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        boatId,
        date: format(date, 'yyyy-MM-dd'),
        startTime,
        duration,
        guests,
        totalPrice: total
      };

      const response = await bookingService.createBooking(bookingData);
      
      toast({
        title: "Rezervasyon talebi gönderildi",
        description: "Tekne sahibi en kısa sürede size dönüş yapacaktır.",
      });

      // Rezervasyon sayfasına yönlendir
      navigate(`/bookings/${response.id}`);
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
  */

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
        >
          Book Now
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
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
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
        
        <Button className="w-full">Request to Book</Button>
        
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
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
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

          <Button className="w-full">Request to Book</Button>

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
