import React, { useEffect, useState } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  User,
  Users,
  Clock,
  Ship,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  ClockAlert,
  CreditCard,
} from "lucide-react";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { tr } from "date-fns/locale";
import { bookingService } from "@/services/bookingService";
import { BookingDTO } from "@/types/booking.types";
import PendingApprovalModal from "@/components/bookings/PendingApprovalModal";
import { useToast } from "@/hooks/use-toast";

const PendingApprovalsPage: React.FC = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPendingBookings = async () => {
    try {
      const data = await bookingService.getPendingApprovalBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch pending bookings:", error);
      toast({
        title: "Hata",
        description: "Bekleyen rezervasyonlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchPendingBookings, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPendingBookings();
  };

  const handleOpenModal = (booking: BookingDTO) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleApprovalComplete = () => {
    fetchPendingBookings();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy HH:mm", { locale: tr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const getTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate <= now) {
      return { text: "Süre Doldu!", isExpired: true };
    }

    const hoursLeft = differenceInHours(deadlineDate, now);
    const minutesLeft = differenceInMinutes(deadlineDate, now) % 60;

    if (hoursLeft > 0) {
      return { text: `${hoursLeft} saat ${minutesLeft} dakika kaldı`, isExpired: false };
    } else {
      return { text: `${minutesLeft} dakika kaldı`, isExpired: false };
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-green-100 p-4 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bekleyen Rezervasyon Yok
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Şu anda onay bekleyen rezervasyon bulunmuyor. Yeni talepler geldiğinde
          burada görüntülenecek.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <CaptainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClockAlert className="h-7 w-7 text-purple-500" />
              Bekleyen Rezervasyonlar
            </h1>
            <p className="text-gray-500 mt-1">
              Onay bekleyen rezervasyon taleplerini görüntüleyin ve yönetin
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>

        {/* Summary Card */}
        {!isLoading && bookings.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Toplam Bekleyen</p>
                  <p className="text-4xl font-bold">{bookings.length}</p>
                  <p className="text-purple-100 text-sm mt-1">
                    rezervasyon onayınızı bekliyor
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <ClockAlert className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const timeInfo = booking.ownerApprovalDeadline
                ? getTimeRemaining(booking.ownerApprovalDeadline)
                : null;

              return (
                <Card
                  key={booking.id}
                  className={`overflow-hidden transition-all hover:shadow-lg ${
                    timeInfo?.isExpired
                      ? "border-red-300 bg-red-50"
                      : "border-purple-200 hover:border-purple-400"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-purple-100 text-purple-700 border-purple-300"
                          >
                            #{booking.id}
                          </Badge>
                          {timeInfo && (
                            <div
                              className={`flex items-center gap-1 text-sm ${
                                timeInfo.isExpired
                                  ? "text-red-600 font-semibold"
                                  : "text-amber-600"
                              }`}
                            >
                              <AlertCircle className="h-4 w-4" />
                              {timeInfo.text}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              Müşteri #{booking.customerId}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {booking.passengerCount} kişi
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {formatDate(booking.startDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="text-green-600 font-medium">
                              {formatCurrency(booking.totalPrice || 0)}
                            </span>
                          </div>
                        </div>

                        {booking.notes && (
                          <p className="text-sm text-gray-500 italic">
                            "{booking.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 lg:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(booking)}
                          className="border-gray-300"
                        >
                          Detayları Gör
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenModal(booking)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={timeInfo?.isExpired}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          İşlem Yap
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Approval Modal */}
        {selectedBooking && (
          <PendingApprovalModal
            booking={selectedBooking}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onApprovalComplete={handleApprovalComplete}
          />
        )}
      </div>
    </CaptainLayout>
  );
};

export default PendingApprovalsPage;
