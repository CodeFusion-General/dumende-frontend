import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { tourService } from "@/services/tourService";
import { TourDateDTO, TourDTO } from "@/types/tour.types";

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  status: "AVAILABLE" | "FULL" | "CANCELLED";
  tourId: number;
  maxGuests: number;
  tourName?: string;
}

const TourCalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tours, setTours] = useState<TourDTO[]>([]);

  useEffect(() => {
    fetchTourCalendarData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterEventsByDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchTourCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: guideId'yi auth context'ten al
      const currentGuideId = 1;

      // Get all tours for the guide
      const toursData = await tourService.getToursByGuideId(currentGuideId);
      setTours(toursData);

      // Get all tour dates and convert to calendar events
      const allEvents: CalendarEvent[] = [];

      for (const tour of toursData) {
        const tourDates = await tourService.getTourDatesByTourId(tour.id);

        for (const tourDate of tourDates) {
          allEvents.push({
            id: tourDate.id,
            date: format(parseISO(tourDate.startDate), "yyyy-MM-dd"),
            title: `${tour.name} - ${format(
              parseISO(tourDate.startDate),
              "HH:mm"
            )}`,
            status: tourDate.availabilityStatus as
              | "AVAILABLE"
              | "FULL"
              | "CANCELLED",
            tourId: tour.id,
            maxGuests: tourDate.maxGuests,
            tourName: tour.name,
          });
        }
      }

      setEvents(allEvents);
      console.log(
        "✅ Tur takvimi başarıyla yüklendi:",
        allEvents.length,
        "etkinlik"
      );
    } catch (error) {
      console.error("❌ Tur takvimi yükleme hatası:", error);
      setError("Tur takvimi yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description:
          "Tur takvimi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr);
  };

  const handleStatusChange = async (eventId: number, newStatus: string) => {
    try {
      await tourService.updateTourDateAvailabilityStatus(eventId, newStatus);
      await fetchTourCalendarData(); // Refresh calendar data
      toast({
        title: "Başarılı",
        description: "Tur durumu güncellendi.",
      });
    } catch (error) {
      console.error("❌ Tur durumu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Tur durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("Bu tur tarihini silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await tourService.deleteTourDate(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast({
        title: "Başarılı",
        description: "Tur tarihi silindi.",
      });
    } catch (error) {
      console.error("❌ Tur tarihi silme hatası:", error);
      toast({
        title: "Hata",
        description: "Tur tarihi silinemedi.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500";
      case "FULL":
        return "bg-orange-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "FULL":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Müsait";
      case "FULL":
        return "Dolu";
      case "CANCELLED":
        return "İptal";
      default:
        return status;
    }
  };

  // Create a date matcher function for the calendar
  const isDateWithEvent = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.some((event) => event.date === dateStr);
  };

  // Create a custom day content render function
  const dayClassName = (date: Date, events: CalendarEvent[]) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const eventForDate = events.find((event) => event.date === dateStr);

    if (eventForDate) {
      return cn(
        "relative flex h-9 w-9 items-center justify-center text-white",
        getStatusColor(eventForDate.status)
      );
    }

    return "relative flex h-9 w-9 items-center justify-center";
  };

  // Loading state
  if (loading) {
    return (
      <CaptainLayout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Tur Takvimi</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-600">Takvim yükleniyor...</p>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CaptainLayout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Tur Takvimi</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-red-600">{error}</p>
            <div className="text-center mt-4">
              <button
                onClick={fetchTourCalendarData}
                className="bg-[#15847c] hover:bg-[#0e5c56] text-white px-4 py-2 rounded"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  const selectedDateEvents = selectedDate
    ? filterEventsByDate(selectedDate)
    : [];

  return (
    <CaptainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Tur Takvimi</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="w-full md:w-auto">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  modifiers={{
                    hasEvent: isDateWithEvent,
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: "bold",
                    },
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      return (
                        <div className={dayClassName(date, events)} {...props}>
                          {date.getDate()}
                        </div>
                      );
                    },
                  }}
                />

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Müsait</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span>Dolu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>İptal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">
                {selectedDate
                  ? `${format(selectedDate, "dd MMMM yyyy", {
                      locale: tr,
                    })} - Turlar`
                  : "Tarih seçin"}
              </h2>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <Card key={event.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-600">
                            Maksimum {event.maxGuests} kişi
                          </p>
                          <p className="text-sm text-gray-600">
                            Tur: {event.tourName}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {getStatusText(event.status)}
                          </Badge>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleStatusChange(event.id, "AVAILABLE")
                              }
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                              disabled={event.status === "AVAILABLE"}
                            >
                              Müsait
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(event.id, "FULL")
                              }
                              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded"
                              disabled={event.status === "FULL"}
                            >
                              Dolu
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(event.id, "CANCELLED")
                              }
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                              disabled={event.status === "CANCELLED"}
                            >
                              İptal
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Bu tarihte hiç tur bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </CaptainLayout>
  );
};

export default TourCalendarPage;
