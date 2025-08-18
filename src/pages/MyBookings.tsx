import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Clock, Ship } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { bookingService } from '@/services/bookingService';
import { authService } from '@/services/authService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

interface Booking {
  id: string;
  boatId: number;
  boatName?: string;
  boatType?: string;
  boatLocation?: string;
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
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (booking.boatId) {
      navigate(`/boats/${booking.boatId}`);
    }
  };
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

  const getStatusGradient = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return 'from-yellow-50 to-orange-50';
      case 'CONFIRMED':
        return 'from-blue-50 to-indigo-50';
      case 'CANCELLED':
        return 'from-red-50 to-pink-50';
      case 'COMPLETED':
        return 'from-green-50 to-emerald-50';
      case 'NO_SHOW':
        return 'from-gray-50 to-slate-50';
      default:
        return 'from-gray-50 to-slate-50';
    }
  };

  const getStatusAccentColor = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return 'from-yellow-400 to-orange-400';
      case 'CONFIRMED':
        return 'from-blue-400 to-indigo-400';
      case 'CANCELLED':
        return 'from-red-400 to-pink-400';
      case 'COMPLETED':
        return 'from-green-400 to-emerald-400';
      case 'NO_SHOW':
        return 'from-gray-400 to-slate-400';
      default:
        return 'from-gray-400 to-slate-400';
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 mb-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(booking.status)} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
        aria-hidden="true"
      />

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Status Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusAccentColor(booking.status)}`} />

      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
              <Calendar className="h-5 w-5 text-[#2c3e50]" />
            </div>
            <div>
              <span className="font-montserrat font-semibold text-lg text-[#2c3e50] block">
                {formatDateRange(booking.startDate, booking.endDate)}
              </span>
              {booking.boatName && (
                <div className="flex items-center space-x-2 mt-1">
                  <Ship className="h-4 w-4 text-[#3498db]" />
                  <span className="font-roboto text-sm text-[#2c3e50] font-medium">
                    {booking.boatName}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Badge 
            variant={getStatusBadgeVariant(booking.status)}
            className={`font-roboto text-xs px-3 py-1 rounded-full shadow-sm ${getStatusBadgeColor(booking.status)} backdrop-blur-sm`}
          >
            {booking.status === 'PENDING' && t.myBookings.status.pending}
            {booking.status === 'CONFIRMED' && t.myBookings.status.confirmed}
            {booking.status === 'CANCELLED' && t.myBookings.status.cancelled}
            {booking.status === 'COMPLETED' && t.myBookings.status.completed}
            {booking.status === 'NO_SHOW' && t.myBookings.status.noShow}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        <div className="space-y-4">
          {/* Price and Passengers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
              <div className="p-2 rounded-full bg-[#3498db]/10">
                <DollarSign className="h-5 w-5 text-[#3498db]" />
              </div>
              <div>
                <span className="font-montserrat font-bold text-xl text-[#2c3e50] block">
                  ₺{booking.totalPrice.toFixed(2)}
                </span>
                <span className="font-roboto text-xs text-gray-600 uppercase tracking-wide">
                  {t.myBookings.card.totalPrice || 'Total Price'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
              <div className="p-2 rounded-full bg-[#3498db]/10">
                <Users className="h-5 w-5 text-[#3498db]" />
              </div>
              <div>
                <span className="font-montserrat font-bold text-xl text-[#2c3e50] block">
                  {booking.passengerCount}
                </span>
                <span className="font-roboto text-xs text-gray-600 uppercase tracking-wide">
                  {booking.passengerCount === 1 ? t.myBookings.card.passenger : t.myBookings.card.passengers}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border-l-4 border-[#3498db]">
              <p className="font-roboto text-sm text-[#2c3e50] italic leading-relaxed">
                "{booking.notes}"
              </p>
            </div>
          )}

          {/* Created At */}
          <div className="flex items-center space-x-3 pt-3 border-t border-white/30">
            <div className="p-1.5 rounded-full bg-white/20">
              <Clock className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-roboto text-xs text-gray-600">
              {t.myBookings.card.bookedOn} {format(new Date(booking.createdAt), language === 'tr' ? 'dd MMM yyyy \'saat\' HH:mm' : 'MMM dd, yyyy \'at\' HH:mm', { locale: language === 'tr' ? tr : undefined })}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusAccentColor(booking.status)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </Card>
  );
};

const EmptyState: React.FC<{ t: any }> = ({ t }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="relative mb-8">
      {/* Gradient background circle */}
      <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
        <div className="w-24 h-24 bg-gradient-to-br from-[#3498db]/20 to-[#2c3e50]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Calendar className="h-12 w-12 text-[#3498db]" />
        </div>
      </div>
      {/* Floating accent circles */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-60 animate-pulse delay-300"></div>
    </div>
    <h3 className="font-montserrat font-bold text-2xl text-[#2c3e50] mb-3 text-center">
      {t.myBookings.empty.title}
    </h3>
    <p className="font-roboto text-gray-600 text-center max-w-md leading-relaxed">
      {t.myBookings.empty.message}
    </p>
    {/* Decorative line */}
    <div className="mt-6 w-20 h-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full"></div>
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
        // BookingWithDetailsDTO[] -> Booking[] map
        const mapped = (data as any[]).map((b) => ({
          id: b.id.toString(),
          boatId: b.boatId,
          boatName: b.boatName,
          boatType: b.boatType,
          boatLocation: b.boatLocation,
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="relative inline-block mb-4">
            <h1 className="font-montserrat font-bold text-4xl text-[#2c3e50] mb-3">
              {t.myBookings.title}
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full"></div>
          </div>
          <p className="font-roboto text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.myBookings.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#3498db]"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3498db]/10 to-transparent"></div>
            </div>
            <span className="text-gray-600 font-roboto text-lg">{t.myBookings.card.loading}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-2xl">⚠</span>
              </div>
            </div>
            <span className="text-red-600 font-roboto text-lg text-center max-w-md">{error}</span>
          </div>
        ) : !hasBookings ? (
          <EmptyState t={t} />
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-montserrat font-bold text-2xl text-[#2c3e50]">
                      {t.myBookings.tabs.upcoming}
                    </h2>
                  </div>
                  <div className="flex-1 ml-4 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
                </div>
                <div className="grid gap-6">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} language={language} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-slate-400 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-montserrat font-bold text-2xl text-[#2c3e50]">
                      {t.myBookings.tabs.past}
                    </h2>
                  </div>
                  <div className="flex-1 ml-4 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>
                <div className="grid gap-6">
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