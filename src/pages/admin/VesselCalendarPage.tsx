import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { bookingHelperService } from "@/services/bookingService";
import { BookingWithDetails, BookingStatus } from "@/types/booking.types";
import { BoatDTO } from "@/types/boat.types";
import { boatService } from "@/services/boatService";

const VesselCalendarPage: React.FC = () => {
  // TODO: Replace with actual logged-in user ID
  const ownerId = 2; // Ahmet Yılmaz (test data)

  const [boats, setBoats] = useState<BoatDTO[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load owner's boats
  useEffect(() => {
    const loadBoats = async () => {
      try {
        setLoading(true);
        const boatsData = await boatService.getBoatsByOwner(ownerId);
        setBoats(boatsData);
      } catch (err) {
        console.error("Error loading boats:", err);
        setError("Tekneler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadBoats();
  }, [ownerId]);

  // Load bookings for selected vessel
  useEffect(() => {
    if (selectedVessel && showCalendar) {
      loadBookingsForVessel(parseInt(selectedVessel));
    }
  }, [selectedVessel, showCalendar]);

  const loadBookingsForVessel = async (boatId: number) => {
    try {
      setLoading(true);
      setError(null);

      const bookingsWithDetails =
        await bookingHelperService.getBookingsWithDetailsForBoat(boatId);
      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Rezervasyonlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVessel = (vesselId: string) => {
    setSelectedVessel(vesselId);
  };

  const handleViewCalendar = () => {
    if (!selectedVessel) {
      toast({
        title: "Lütfen bir tekne seçin",
        description: "Takvimi görüntülemek için önce bir tekne seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    setShowCalendar(true);
  };

  const handleRefresh = () => {
    if (selectedVessel) {
      loadBookingsForVessel(parseInt(selectedVessel));
    }
  };

  // Get bookings for selected date
  const getBookingsForDate = (date: Date): BookingWithDetails[] => {
    if (!date) return [];

    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    return bookings.filter((booking) => {
      const startDate = new Date(booking.startDate).toISOString().split("T")[0];
      const endDate = new Date(booking.endDate).toISOString().split("T")[0];

      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Get status color
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-green-500";
      case BookingStatus.PENDING:
        return "bg-yellow-500";
      case BookingStatus.CANCELLED:
        return "bg-red-500";
      case BookingStatus.COMPLETED:
        return "bg-blue-500";
      case BookingStatus.REJECTED:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "Onaylandı";
      case BookingStatus.PENDING:
        return "Bekliyor";
      case BookingStatus.CANCELLED:
        return "İptal";
      case BookingStatus.COMPLETED:
        return "Tamamlandı";
      case BookingStatus.REJECTED:
        return "Reddedildi";
      default:
        return "Bilinmiyor";
    }
  };

  // Find the vessel name for display
  const selectedVesselName = boats.find(
    (v) => v.id.toString() === selectedVessel
  )?.name;
  const selectedDateBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : [];

  if (loading && boats.length === 0) {
    return (
      <CaptainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Tekneler yükleniyor...</p>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  if (error && boats.length === 0) {
    return (
      <CaptainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tekne Takvimi</h1>
          <p className="text-muted-foreground">
            Teknelerinizin rezervasyonlarını, müsaitliklerini ve bakım günlerini
            bu takvimden yönetebilirsiniz.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          {!showCalendar ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium mb-2">
                    Tekne Seçin
                  </label>
                  <Select
                    value={selectedVessel}
                    onValueChange={handleSelectVessel}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tekne seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {boats.map((boat) => (
                        <SelectItem key={boat.id} value={boat.id.toString()}>
                          {boat.name} - {boat.type} ({boat.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex mt-4 md:mt-0">
                  <Button
                    className="w-full md:w-auto bg-[#00bfa5] hover:bg-[#00a895] text-white"
                    onClick={handleViewCalendar}
                    disabled={!selectedVessel}
                  >
                    Takvime Git <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {boats.length === 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">
                    Henüz kayıtlı tekneniz bulunmuyor. Önce tekne ekleyin.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  {selectedVesselName} - Rezervasyon Takvimi
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Yenile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCalendar(false)}
                  >
                    Tekne Seç
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border w-full lg:w-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    disabled={(date) =>
                      date <
                      new Date(new Date().setDate(new Date().getDate() - 1))
                    }
                  />
                </div>

                <div className="flex-1">
                  <div className="bg-white p-4 rounded-lg shadow-sm border h-full">
                    <h3 className="font-medium mb-4">
                      {selectedDate
                        ? `${selectedDate.toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })} Tarihli Rezervasyonlar`
                        : "Seçili Tarih Yok"}
                    </h3>

                    {/* Status Legend */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>Onaylandı</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span>Bekliyor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span>İptal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span>Tamamlandı</span>
                      </div>
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-3">
                      {selectedDateBookings.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          Bu tarih için rezervasyon bulunmamaktadır.
                        </p>
                      ) : (
                        selectedDateBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3 h-3 rounded-full ${getStatusColor(
                                    booking.status
                                  )}`}
                                ></span>
                                <span className="font-medium">
                                  {getStatusText(booking.status)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(booking.startDate).toLocaleDateString(
                                  "tr-TR"
                                )}{" "}
                                -{" "}
                                {new Date(booking.endDate).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>
                                  {booking.customerName ||
                                    `Müşteri ${booking.customerId}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{booking.passengerCount} kişi</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span>
                                  {booking.totalPrice.toLocaleString("tr-TR")} ₺
                                </span>
                              </div>
                            </div>

                            {booking.tourName && (
                              <div className="text-sm text-gray-600">
                                <strong>Tur:</strong> {booking.tourName}
                              </div>
                            )}

                            {booking.notes && (
                              <div className="text-sm text-gray-600">
                                <strong>Notlar:</strong> {booking.notes}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-6">
                      <Button
                        className="bg-[#00bfa5] hover:bg-[#00a895] text-white"
                        onClick={() => {
                          toast({
                            title: "Yeni Rezervasyon",
                            description: "Bu özellik yakında eklenecek.",
                          });
                        }}
                      >
                        Yeni Rezervasyon Ekle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CaptainLayout>
  );
};

export default VesselCalendarPage;
