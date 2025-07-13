import React, { useEffect, useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Users, Clock, Ship } from 'lucide-react';
import { format } from 'date-fns';
import { bookingHelperService } from '@/services/bookingService';
import { authService } from '@/services/authService';

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

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-[#1A5F7A]" />
            <span className="font-montserrat font-medium text-gray-800">
              {formatDateRange(booking.startDate, booking.endDate)}
            </span>
          </div>
          <Badge 
            className={`font-roboto text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}
          >
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center space-x-2">
            <Ship className="h-4 w-4 text-[#1A5F7A]" />
            <span className="font-roboto text-sm text-gray-700">
              {booking.boatName}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-[#1A5F7A]" />
            <span className="font-roboto text-sm text-gray-700">
              Müşteri #{booking.customerId}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-4 w-4 text-[#1A5F7A]" />
          <span className="font-roboto text-sm text-gray-700">
            {booking.passengerCount} {booking.passengerCount === 1 ? 'Yolcu' : 'Yolcu'}
          </span>
        </div>

        {booking.notes && (
          <div className="bg-gray-50 rounded-md p-3 mb-3">
            <p className="font-roboto text-sm text-gray-600 italic">
              "{booking.notes}"
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="font-roboto text-xs text-gray-500">
            Oluşturuldu: {format(new Date(booking.createdAt), 'dd MMM yyyy HH:mm')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const BookingsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // ownerId token'dan otomatik alınacak, account/id kontrolü gereksiz
        const data = await bookingHelperService.getAllBookingsForOwner();
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
        setBookings(mapped);
      } catch (err: any) {
        if (err?.message?.includes('token')) {
          setError('Kullanıcı bulunamadı veya oturum süresi doldu. Lütfen tekrar giriş yapın.');
        } else {
          setError('Rezervasyonlar yüklenirken bir hata oluştu.');
        }
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Tour Bookings</h1>
            <p className="text-gray-600 font-roboto">Müşteri rezervasyonlarınızı görüntüleyin ve yönetin</p>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.PENDING || 0}</div>
            <div className="text-sm text-gray-500">Bekleyen</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.CONFIRMED || 0}</div>
            <div className="text-sm text-gray-500">Onaylı</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.COMPLETED || 0}</div>
            <div className="text-sm text-gray-500">Tamamlandı</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.CANCELLED || 0}</div>
            <div className="text-sm text-gray-500">İptal</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.NO_SHOW || 0}</div>
            <div className="text-sm text-gray-500">Gelmedi</div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-[#1A5F7A] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tümü ({bookings.length})
            </button>
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-[#1A5F7A] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        </Card>

        {/* Bookings List */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <span>Yükleniyor...</span>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center">
              <div className="text-red-500">
                <span>{error}</span>
              </div>
            </Card>
          ) : filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Rezervasyon Bulunamadı</h3>
                <p>Seçilen kriterlere uygun rezervasyon bulunmuyor.</p>
              </div>
            </Card>
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