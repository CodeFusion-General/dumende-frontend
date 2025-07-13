import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { bookingService } from '@/services/bookingService';
import { authService } from '@/services/authService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  totalPrice: number;
  passengerCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusBadgeVariant = (status: Booking['status']) => {
  switch (status) {
    case 'PENDING':
      return 'outline';
    case 'CONFIRMED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    case 'COMPLETED':
      return 'success';
    case 'NO_SHOW':
      return 'warning';
    default:
      return 'outline';
  }
};

const getStatusBadgeColor = (status: Booking['status']) => {
  switch (status) {
    case 'PENDING':
      return 'text-muted-foreground';
    case 'CONFIRMED':
      return 'text-primary-foreground';
    case 'CANCELLED':
      return 'text-destructive-foreground';
    case 'COMPLETED':
      return 'text-white';
    case 'NO_SHOW':
      return 'text-white';
    default:
      return 'text-muted-foreground';
  }
};

const BookingCard: React.FC<{ booking: Booking; language: string; t: any }> = ({ booking, language, t }) => {
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dateFormat = language === 'tr' ? 'dd MMM yyyy' : 'MMM dd, yyyy';
    const shortFormat = language === 'tr' ? 'dd MMM' : 'MMM dd';
    const locale = language === 'tr' ? tr : undefined;
    
    if (startDate === endDate) {
      return format(start, dateFormat, { locale });
    }
    
    return `${format(start, shortFormat, { locale })} - ${format(end, dateFormat, { locale })}`;
  };

  return (
    <Card className="w-full mb-4 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-montserrat font-medium text-foreground">
              {formatDateRange(booking.startDate, booking.endDate)}
            </span>
          </div>
          <Badge 
            variant={getStatusBadgeVariant(booking.status)}
            className={`font-roboto text-xs ${getStatusBadgeColor(booking.status)}`}
          >
            {booking.status === 'PENDING' && t.myBookings.status.pending}
            {booking.status === 'CONFIRMED' && t.myBookings.status.confirmed}
            {booking.status === 'CANCELLED' && t.myBookings.status.cancelled}
            {booking.status === 'COMPLETED' && t.myBookings.status.completed}
            {booking.status === 'NO_SHOW' && t.myBookings.status.noShow}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Price and Passengers */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="font-montserrat font-semibold text-lg text-foreground">
                ${booking.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-roboto text-sm text-muted-foreground">
                {booking.passengerCount} {booking.passengerCount === 1 ? t.myBookings.card.passenger : t.myBookings.card.passengers}
              </span>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-muted rounded-md p-3">
              <p className="font-roboto text-sm text-muted-foreground italic">
                "{booking.notes}"
              </p>
            </div>
          )}

          {/* Created At */}
          <div className="flex items-center space-x-2 pt-2 border-t border-border">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-roboto text-xs text-muted-foreground">
              {t.myBookings.card.bookedOn} {format(new Date(booking.createdAt), language === 'tr' ? 'dd MMM yyyy \'saat\' HH:mm' : 'MMM dd, yyyy \'at\' HH:mm', { locale: language === 'tr' ? tr : undefined })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC<{ t: any }> = ({ t }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
      <Calendar className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="font-montserrat font-semibold text-xl text-foreground mb-2">
      {t.myBookings.empty.title}
    </h3>
    <p className="font-roboto text-muted-foreground text-center max-w-sm">
      {t.myBookings.empty.message}
    </p>
  </div>
);

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Yeni: userId token'dan otomatik çekiliyor, account/id kontrolü gereksiz
        const data = await bookingService.getCustomerBookings();
        // BookingDTO[] -> Booking[] map
        const mapped = (data as any[]).map((b) => ({
          id: b.id.toString(),
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status as Booking['status'],
          totalPrice: b.totalPrice,
          passengerCount: b.passengerCount,
          notes: b.notes,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        }));
        setBookings(mapped);
      } catch (err: any) {
        if (err?.message?.includes('token')) {
          setError(t.myBookings.errors.userNotFound);
        } else {
          setError(t.myBookings.errors.loadFailed);
        }
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.startDate) > new Date() && booking.status !== 'CANCELLED'
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.startDate) <= new Date() || booking.status === 'CANCELLED'
  );

  const hasBookings = bookings.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-montserrat font-bold text-3xl text-foreground mb-2">
            {t.myBookings.title}
          </h1>
          <p className="font-roboto text-muted-foreground">
            {t.myBookings.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <span className="text-muted-foreground">{t.myBookings.card.loading}</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-16">
            <span className="text-destructive">{error}</span>
          </div>
        ) : !hasBookings ? (
          <EmptyState t={t} />
        ) : (
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="font-montserrat font-semibold text-xl text-foreground mb-4">
                  {t.myBookings.tabs.upcoming}
                </h2>
                <div>
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} language={language} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="font-montserrat font-semibold text-xl text-foreground mb-4">
                  {t.myBookings.tabs.past}
                </h2>
                <div>
                  {pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} language={language} t={t} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBookings;