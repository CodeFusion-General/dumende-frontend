import React, { useState, useEffect } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { toast } from '@/components/ui/use-toast';

interface Event {
  date: string;
  title: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const TourCalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchTourEvents = async () => {
      try {
        setLoading(true);
        const response = await tourService.getTourEvents();
        setEvents(response);
      } catch (error) {
        console.error('Failed to fetch tour events:', error);
        setError('Tur takvimi yüklenirken bir hata oluştu.');
        toast({
          title: "Hata",
          description: "Tur takvimi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTourEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const fetchDateEvents = async () => {
        try {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const response = await tourService.getDateEvents(dateStr);
          setEvents(prev => {
            const filtered = prev.filter(event => event.date !== dateStr);
            return [...filtered, ...response];
          });
        } catch (error) {
          console.error('Failed to fetch date events:', error);
          toast({
            title: "Hata",
            description: "Seçilen tarihteki turlar yüklenemedi.",
            variant: "destructive",
          });
        }
      };

      fetchDateEvents();
    }
  }, [selectedDate]);
  */

  // Mock implementation - Backend hazır olduğunda kaldırılacak
  const [events, setEvents] = useState<Event[]>([
    { date: '2024-07-10', title: 'Adalar Turu', status: 'scheduled' },
    { date: '2024-07-15', title: 'Gün Batımı Turu', status: 'completed' },
    { date: '2024-07-20', title: 'Özel Tekne Kiralama', status: 'cancelled' },
  ]);

  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth');
    return () => document.documentElement.classList.remove('scroll-smooth');
  }, []);

  /* Backend hazır olduğunda kullanılacak fonksiyonlar:
  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      await tourService.updateTourStatus(eventId, newStatus);
      const response = await tourService.getTourEvents();
      setEvents(response);
      toast({
        title: "Başarılı",
        description: "Tur durumu güncellendi.",
      });
    } catch (error) {
      console.error('Failed to update tour status:', error);
      toast({
        title: "Hata",
        description: "Tur durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await tourService.deleteTourEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Başarılı",
        description: "Tur silindi.",
      });
    } catch (error) {
      console.error('Failed to delete tour event:', error);
      toast({
        title: "Hata",
        description: "Tur silinemedi.",
        variant: "destructive",
      });
    }
  };
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  // Create a date matcher function for the calendar
  const isDateWithEvent = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => event.date === dateStr);
  };

  // Create a custom day content render function
  const dayClassName = (date: Date, events: Event[]) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const eventForDate = events.find((event) => event.date === dateStr);
    
    if (eventForDate) {
      return cn(
        "relative flex h-9 w-9 items-center justify-center",
        getStatusColor(eventForDate.status)
      );
    }
    
    return "relative flex h-9 w-9 items-center justify-center";
  };

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
                    hasEvent: isDateWithEvent
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: "bold"
                    }
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      return (
                        <div className={dayClassName(date, events)} {...props}>
                          {date.getDate()}
                        </div>
                      );
                    }
                  }}
                />

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span>Planlanmış</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Tamamlanmış</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>İptal Edilmiş</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1">
              {selectedDate && (
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-lg font-semibold mb-4">
                      {format(selectedDate, 'd MMMM yyyy', { locale: tr })} Tarihindeki Turlar
                    </h2>
                    
                    {events.filter(event => event.date === format(selectedDate, 'yyyy-MM-dd')).length > 0 ? (
                      <ul className="space-y-3">
                        {events
                          .filter(event => event.date === format(selectedDate, 'yyyy-MM-dd'))
                          .map((event, index) => (
                            <li key={index} className="flex justify-between items-center p-3 border rounded-md">
                              <span>{event.title}</span>
                              <Badge variant={getStatusBadgeVariant(event.status)}>
                                {event.status === 'scheduled' ? 'Planlandı' : 
                                 event.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                              </Badge>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Bu tarihte planlanmış tur bulunmamaktadır.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </CaptainLayout>
  );
};

export default TourCalendarPage;
