import React, { useEffect, useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Users, Clock, Ship } from 'lucide-react';
import { format } from 'date-fns';
import { bookingHelperService } from '@/services/bookingService';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  customerId: number;
  boatId: number;
  boatName: string;
  passengerCount: number;
  notes?: string;
  createdAt: string;
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

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'PENDING':
      return 'text-gray-600 bg-gray-100';
    case 'CONFIRMED':
      return 'text-blue-600 bg-blue-100';
    case 'CANCELLED':
      return 'text-red-600 bg-red-100';
    case 'COMPLETED':
      return 'text-green-600 bg-green-100';
    case 'NO_SHOW':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return format(start, 'MMM dd, yyyy');
    }
    
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
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
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 mb-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
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
            </div>
          </div>
          <Badge 
            className={`font-roboto text-xs px-3 py-1 rounded-full shadow-sm ${getStatusColor(booking.status)} backdrop-blur-sm`}
          >
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        <div className="space-y-4">
          {/* Boat and Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
              <div className="p-2 rounded-full bg-[#3498db]/10">
                <Ship className="h-5 w-5 text-[#3498db]" />
              </div>
              <div>
                <span className="font-montserrat font-semibold text-sm text-[#2c3e50] block">
                  {booking.boatName}
                </span>
                <span className="font-roboto text-xs text-gray-600 uppercase tracking-wide">
                  Tekne
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
              <div className="p-2 rounded-full bg-[#3498db]/10">
                <User className="h-5 w-5 text-[#3498db]" />
              </div>
              <div>
                <span className="font-montserrat font-semibold text-sm text-[#2c3e50] block">
                  #{booking.customerId}
                </span>
                <span className="font-roboto text-xs text-gray-600 uppercase tracking-wide">
                  Müşteri
                </span>
              </div>
            </div>
          </div>

          {/* Passenger Count */}
          <div className="flex items-center space-x-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg group-hover:bg-white/40 transition-all duration-300">
            <div className="p-2 rounded-full bg-[#3498db]/10">
              <Users className="h-5 w-5 text-[#3498db]" />
            </div>
            <div>
              <span className="font-montserrat font-bold text-lg text-[#2c3e50] block">
                {booking.passengerCount}
              </span>
              <span className="font-roboto text-xs text-gray-600 uppercase tracking-wide">
                Yolcu
              </span>
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
              Oluşturuldu: {format(new Date(booking.createdAt), 'dd MMM yyyy HH:mm')}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusAccentColor(booking.status)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </Card>
  );
};

const BookingsPage: React.FC = () => {
  const { user, isAuthenticated, isBoatOwner, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      // Authentication kontrolü
      if (!isAuthenticated || !user?.id) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setLoading(false);
        toast({
          title: "Kimlik Doğrulama Hatası",
          description: "Oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın.",
          variant: "destructive",
        });
        return;
      }

      // Role kontrolü  
      if (!isBoatOwner() && !isAdmin()) {
        setError('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
        setLoading(false);
        toast({
          title: "Yetki Hatası",
          description: "Rezervasyonlar sayfasına erişim için kaptan yetkisi gereklidir.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching bookings for user ID:', user.id);
        // AuthContext'ten gelen user.id'yi bookingHelperService'e geç
        const data = await bookingHelperService.getAllBookingsForOwner(user.id);
        
        // BookingDTO/BookingWithDetails[] -> Booking[] map
        const mapped = (data as any[]).map((b) => ({
          id: b.id.toString(),
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status as Booking['status'],
          customerId: b.customerId,
          boatId: b.boatId,
          boatName: b.boatName || '',
          passengerCount: b.passengerCount,
          notes: b.notes,
          createdAt: b.createdAt,
        }));
        
        console.log('Bookings fetched successfully:', mapped.length);
        setBookings(mapped);
      } catch (err: any) {
        console.error('Bookings yükleme hatası:', err);
        
        // Daha detaylı error handling
        if (err?.message?.includes('token') || err?.message?.includes('401')) {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          toast({
            title: "Oturum Süresi Doldu",
            description: "Güvenlik için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.",
            variant: "destructive",
          });
        } else if (err?.message?.includes('403')) {
          setError('Bu işlem için yetkiniz bulunmamaktadır.');
          toast({
            title: "Yetki Hatası",
            description: "Bu işlemi gerçekleştirmek için gerekli izniniz bulunmamaktadır.",
            variant: "destructive",
          });
        } else {
          setError('Rezervasyonlar yüklenirken bir hata oluştu.');
          toast({
            title: "Yükleme Hatası", 
            description: "Rezervasyonlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        }
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, isAuthenticated, isBoatOwner, isAdmin]);

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <CaptainLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <h1 className="text-4xl font-bold text-[#2c3e50] font-montserrat mb-3">Tour Bookings</h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full"></div>
          </div>
          <p className="text-gray-600 font-roboto text-lg max-w-2xl mx-auto leading-relaxed">
            Müşteri rezervasyonlarınızı görüntüleyin ve yönetin
          </p>
        </div>

        {/* Enhanced Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
            <CardContent className="relative p-6 text-center">
              <div className="text-3xl font-bold text-[#2c3e50] font-montserrat mb-2">{statusCounts.PENDING || 0}</div>
              <div className="text-sm text-gray-600 font-roboto uppercase tracking-wide">Bekleyen</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
            <CardContent className="relative p-6 text-center">
              <div className="text-3xl font-bold text-[#2c3e50] font-montserrat mb-2">{statusCounts.CONFIRMED || 0}</div>
              <div className="text-sm text-gray-600 font-roboto uppercase tracking-wide">Onaylı</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
            <CardContent className="relative p-6 text-center">
              <div className="text-3xl font-bold text-[#2c3e50] font-montserrat mb-2">{statusCounts.COMPLETED || 0}</div>
              <div className="text-sm text-gray-600 font-roboto uppercase tracking-wide">Tamamlandı</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-pink-400" />
            <CardContent className="relative p-6 text-center">
              <div className="text-3xl font-bold text-[#2c3e50] font-montserrat mb-2">{statusCounts.CANCELLED || 0}</div>
              <div className="text-sm text-gray-600 font-roboto uppercase tracking-wide">İptal</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-slate-400" />
            <CardContent className="relative p-6 text-center">
              <div className="text-3xl font-bold text-[#2c3e50] font-montserrat mb-2">{statusCounts.NO_SHOW || 0}</div>
              <div className="text-sm text-gray-600 font-roboto uppercase tracking-wide">Gelmedi</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-slate-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Card>
        </div>

        {/* Enhanced Filter Bar */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30" />
          <CardContent className="relative p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  statusFilter === 'all' 
                    ? 'bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white shadow-lg transform scale-105' 
                    : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 hover:shadow-md hover:scale-105'
                }`}
              >
                Tümü ({bookings.length})
              </button>
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white shadow-lg transform scale-105'
                      : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  {status} ({count})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Bookings List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#3498db]"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3498db]/10 to-transparent"></div>
              </div>
              <span className="text-gray-600 font-roboto text-lg">Yükleniyor...</span>
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
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#3498db]/20 to-[#2c3e50]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="h-12 w-12 text-[#3498db]" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-60 animate-pulse delay-300"></div>
              </div>
              <h3 className="font-montserrat font-bold text-2xl text-[#2c3e50] mb-3 text-center">
                Rezervasyon Bulunamadı
              </h3>
              <p className="font-roboto text-gray-600 text-center max-w-md leading-relaxed">
                Seçilen kriterlere uygun rezervasyon bulunmuyor.
              </p>
              <div className="mt-6 w-20 h-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full"></div>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </CaptainLayout>
  );
};

export default BookingsPage;