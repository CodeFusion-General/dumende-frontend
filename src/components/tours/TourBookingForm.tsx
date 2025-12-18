import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import TourAvailabilityCalendar from "./TourAvailabilityCalendar";
import { BookingDTO, CreateBookingDTO } from "@/types/booking.types";
import { bookingService } from "@/services/bookingService";
import { TourDTO, TourDateDTO } from "@/types/tour.types";
import { toast } from "@/components/ui/use-toast";
import {
  Calendar,
  CreditCard,
  Users,
  Clock,
  ChevronDown,
  X,
  MapPin,
  Star,
  Shield,
  CheckCircle,
} from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { useNavigate } from "react-router-dom";

interface TourBookingFormProps {
  tour: TourDTO;
  className?: string;
}

const TourBookingForm: React.FC<TourBookingFormProps> = ({
  tour,
  className,
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [groupSize, setGroupSize] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const selectedTourDate: TourDateDTO | undefined = useMemo(() => {
    if (!selectedDate) return undefined;
    const iso = format(selectedDate, "yyyy-MM-dd");
    return tour.tourDates?.find((d) => d.startDate.startsWith(iso));
  }, [selectedDate, tour.tourDates]);

  const price = Number(tour.price) || 0;
  const maxGuests = Number(tour.capacity) || 1;

  // Fallback vars when TourDate kaydı yoksa (servis takvimi ile uyum)
  const fallbackDurationHours = useMemo(() => {
    // Turun herhangi bir tarihindeki süreyi referans al, yoksa 4 saat
    const anyDurationText = tour.tourDates?.[0]?.durationText || "4 Saat";
    const match = anyDurationText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 4;
  }, [tour.tourDates]);
  const fallbackStartHour = 10; // 10:00 varsayılan başlama saati
  const totalPrice = price * groupSize;
  const serviceFee = Math.round(totalPrice * 0.2); // 20% service fee
  const finalPrice = totalPrice + serviceFee;

  const handleCreateBooking = async () => {
    if (!selectedDate) {
      toast({ title: "Tarih seçiniz", variant: "destructive" });
      return;
    }
    if (groupSize > maxGuests) {
      toast({
        title: "Grup büyüklüğü kapasiteyi aşıyor",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      let startISO: string;
      let endISO: string;

      if (selectedTourDate) {
        // Backend LocalDateTime (ISO, timezone'suz) format bekliyor.
        // TourDateDTO zaten backend'den bu formatta geliyor, mümkünse direkt kullanıyoruz.
        const start = selectedTourDate.startDate;
        const end =
          selectedTourDate.endDate ||
          (() => {
            const match = selectedTourDate.durationText?.match(/(\d+)/);
            if (match) {
              const hours = parseInt(match[1], 10);
              const startDateObj = new Date(start);
              const endObj = new Date(
                startDateObj.getTime() + hours * 60 * 60 * 1000
              );
              // `toISOString()` yerine backend ile uyumlu olacak şekilde timezone'suz string üret
              return format(endObj, "yyyy-MM-dd'T'HH:mm:ss");
            }
            return start;
          })();

        startISO = start;
        endISO = end;
      } else {
        // TourDate yoksa: servis takvimi ile müsaitlik seçildi demektir.
        // Varsayılan 10:00 başlangıç ve turdan türetilen süre (yoksa 4 saat) kullanılır.
        const startObj = new Date(selectedDate);
        startObj.setHours(fallbackStartHour, 0, 0, 0);
        const endObj = new Date(
          startObj.getTime() + fallbackDurationHours * 60 * 60 * 1000
        );

        // Backend CreateBookingDTO -> LocalDateTime ile birebir uyumlu format
        startISO = format(startObj, "yyyy-MM-dd'T'HH:mm:ss");
        endISO = format(endObj, "yyyy-MM-dd'T'HH:mm:ss");
      }

      const command: CreateBookingDTO = {
        tourId: tour.id,
        startDate: startISO,
        endDate: endISO,
        passengerCount: groupSize,
      };
      const created: BookingDTO = await bookingService.createBooking(command);
      toast({ title: "Rezervasyon oluşturuldu" });
      setIsFormOpen(false); // Close mobile form on success

      // Ödeme sayfasına yönlendirme (BookingForm akışına benzer)
      try {
        const paymentInfo = await paymentService.getPaymentStatus(created.id);

        if (paymentInfo.paymentRequired && paymentInfo.paymentUrl) {
          toast({ title: "Ödeme sayfasına yönlendiriliyorsunuz" });
          // Backend'in döndürdüğü URL'i doğrudan kullan
          paymentService.redirectToPayment(paymentInfo.paymentUrl);
        } else if (paymentInfo.paymentCompleted) {
          toast({ title: "Ödeme zaten tamamlanmış" });
          navigate("/my-bookings");
        } else {
          // Ödeme gerekmiyorsa rezervasyonlar sayfasına yönlendir
          navigate("/my-bookings");
        }
      } catch (err) {
        console.error("Payment redirect failed:", err);
        toast({
          title: "Ödeme sayfası yüklenemedi",
          description:
            "Rezervasyon oluşturuldu ancak ödeme sayfasına yönlendirilemedi. Lütfen rezervasyonlarım sayfasından ödemeyi tamamlayın.",
          variant: "destructive",
        });
        // Yine de rezervasyonlar sayfasına yönlendir
        navigate("/my-bookings");
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Rezervasyon başarısız", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Mobile booking button sticky footer
  const MobileBookingFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 p-4 md:hidden z-40 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <div className="font-bold text-lg text-[#2c3e50] font-montserrat bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent">
            ₺{finalPrice.toLocaleString("tr-TR")}
          </div>
          <div className="text-sm text-gray-600 font-roboto">
            {groupSize} kişi için toplam
          </div>
        </div>

        <Button
          className="px-8 bg-gradient-to-r from-[#3498db] to-[#2c3e50] hover:from-[#2c3e50] hover:to-[#3498db] text-white font-montserrat font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => setIsFormOpen(true)}
          disabled={!selectedTourDate}
        >
          Rezervasyon Yap
        </Button>
      </div>
    </div>
  );

  // Mobile full-screen booking form
  const MobileBookingForm = () => (
    <div
      className={cn(
        "fixed inset-0 bg-white/95 backdrop-blur-md z-50 transition-transform transform md:hidden",
        isFormOpen ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-white/20 bg-white/40 backdrop-blur-sm">
        <h2 className="font-semibold text-lg font-montserrat text-[#2c3e50]">
          Tur Rezervasyonu
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFormOpen(false)}
          className="hover:bg-white/20"
        >
          <X size={24} />
        </Button>
      </div>

      <div className="p-4 overflow-y-auto h-full pb-24 max-h-[calc(100vh-80px)]">
        <div className="space-y-6">
          {/* Calendar Section */}
          <div className="bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#3498db]" />
              Tarih Seçin
            </h3>
            <TourAvailabilityCalendar
              tourDates={tour.tourDates || []}
              selected={selectedDate}
              onSelect={(next) => {
                setSelectedDate(next);
              }}
              tourId={tour.id}
            />
          </div>

          {/* Group Size Selection */}
          <div className="bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#3498db]" />
              Grup Büyüklüğü
            </h3>
            <Select
              value={groupSize.toString()}
              onValueChange={(value) => setGroupSize(parseInt(value))}
            >
              <SelectTrigger className="w-full bg-white/60 backdrop-blur-sm border-white/30">
                <SelectValue placeholder="Kişi sayısı seçin" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                  (num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "kişi" : "kişi"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#3498db]" />
              Fiyat Detayı
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-roboto">
                  ₺{price.toLocaleString("tr-TR")} x {groupSize} kişi
                </span>
                <span className="font-semibold text-[#2c3e50] font-montserrat">
                  ₺{totalPrice.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-roboto">Hizmet bedeli</span>
                <span className="font-semibold text-[#2c3e50] font-montserrat">
                  ₺{serviceFee.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="border-t border-white/20 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#2c3e50] font-montserrat">
                    Toplam
                  </span>
                  <span className="text-xl font-bold text-[#2c3e50] font-montserrat bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent">
                    ₺{finalPrice.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedTourDate && (
            <div className="bg-gradient-to-r from-[#3498db]/10 to-[#2c3e50]/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-[#2c3e50] font-montserrat">
                  Seçilen Tarih
                </span>
              </div>
              <div className="text-gray-700 font-roboto">
                {new Date(selectedTourDate.startDate).toLocaleString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-sm text-gray-600 font-roboto mt-1">
                Süre: {selectedTourDate.durationText}
              </div>
            </div>
          )}

          {/* Book Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#3498db] to-[#2c3e50] hover:from-[#2c3e50] hover:to-[#3498db] text-white font-montserrat font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            onClick={handleCreateBooking}
          disabled={!selectedDate || submitting}
          >
            {submitting ? "İşleniyor..." : "Rezervasyonu Onayla"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Desktop Booking Form */}
      <div className="hidden md:block">
        <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 sticky top-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-semibold mb-6 font-montserrat text-[#2c3e50] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#3498db]" />
            Rezervasyon Yap
          </h3>

          {/* Calendar */}
          <div className="mb-6">
            <TourAvailabilityCalendar
              tourDates={tour.tourDates || []}
              selected={selectedDate}
              onSelect={setSelectedDate}
              tourId={tour.id}
            />
          </div>

          {/* Group Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700 font-roboto flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3498db]" />
              Grup Büyüklüğü
            </label>
            <Select
              value={groupSize.toString()}
              onValueChange={(value) => setGroupSize(parseInt(value))}
            >
              <SelectTrigger className="w-full bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/70 transition-all duration-200">
                <SelectValue placeholder="Kişi sayısı seçin" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                  (num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "kişi" : "kişi"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Date & Duration Info */}
          {selectedTourDate && (
            <div className="mb-6 p-4 bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#3498db]" />
                <span className="text-sm text-gray-600 font-roboto">
                  Seçilen Tarih
                </span>
              </div>
              <div className="font-semibold text-[#2c3e50] font-montserrat">
                {new Date(selectedTourDate.startDate).toLocaleString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-sm text-gray-600 font-roboto mt-1">
                Süre: {selectedTourDate.durationText}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="mb-6 p-4 bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-[#3498db]" />
              <span className="text-sm text-gray-600 font-roboto">
                Fiyat Detayı
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-roboto">
                  ₺{price.toLocaleString("tr-TR")} x {groupSize} kişi
                </span>
                <span className="font-semibold text-[#2c3e50] font-montserrat">
                  ₺{totalPrice.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-roboto">
                  Hizmet bedeli
                </span>
                <span className="font-semibold text-[#2c3e50] font-montserrat">
                  ₺{serviceFee.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="border-t border-white/20 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#2c3e50] font-montserrat">
                    Toplam
                  </span>
                  <span className="font-bold text-xl text-[#2c3e50] font-montserrat bg-gradient-to-r from-[#3498db] to-[#2c3e50] bg-clip-text text-transparent">
                    ₺{finalPrice.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#3498db] to-[#2c3e50] hover:from-[#2c3e50] hover:to-[#3498db] text-white font-montserrat font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleCreateBooking}
            disabled={!selectedDate || submitting}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                İşleniyor...
              </div>
            ) : (
              "Rezervasyon Yap"
            )}
          </Button>
        </GlassCard>

        {/* Tour Summary Card */}
        <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-semibold mb-4 font-montserrat text-[#2c3e50] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#3498db]" />
            Tur Bilgileri
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/30 transition-all duration-200">
              <span className="text-gray-600 font-roboto flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Konum:
              </span>
              <span className="font-semibold text-[#2c3e50] font-montserrat">
                {tour.location}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/30 transition-all duration-200">
              <span className="text-gray-600 font-roboto flex items-center gap-2">
                <Users className="h-4 w-4" />
                Maksimum Kapasite:
              </span>
              <span className="font-semibold text-[#2c3e50] font-montserrat">
                {tour.capacity} kişi
              </span>
            </div>
            {tour.rating && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/30 transition-all duration-200">
                <span className="text-gray-600 font-roboto flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Değerlendirme:
                </span>
                <span className="font-semibold text-[#2c3e50] font-montserrat flex items-center gap-1">
                  {tour.rating.toFixed(1)}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/30 transition-all duration-200">
              <span className="text-gray-600 font-roboto flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Durum:
              </span>
              <span className="font-semibold text-[#2c3e50] font-montserrat">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tour.status.toLowerCase() === "active"
                      ? "bg-green-500/20 text-green-700 border border-green-500/30"
                      : "bg-gray-500/20 text-gray-700 border border-gray-500/30"
                  } backdrop-blur-sm`}
                >
                  {tour.status === "active" ? "Aktif" : tour.status}
                </span>
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Mobile View Components */}
      <MobileBookingFooter />
      <MobileBookingForm />
    </div>
  );
};

export default TourBookingForm;

