import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { PaymentStatusResponseDto } from '@/types/payment.types';
import { toast } from '@/components/ui/use-toast';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Extract booking ID from URL params
  const bookingId = searchParams.get('bookingId');
  const success = searchParams.get('success');
  const status = searchParams.get('status');

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID bulunamadı');
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        setLoading(true);

        // If URL indicates success, start polling for payment confirmation
        if (success === 'true' || status === 'success') {
          // Poll payment status for up to 1 minute
          const finalStatus = await paymentService.pollPaymentStatus(
            parseInt(bookingId), 
            30, // 30 retries
            2000 // 2 seconds interval
          );
          
          setPaymentStatus(finalStatus);
          
          if (finalStatus.paymentCompleted) {
            toast({
              title: 'Ödeme Başarılı!',
              description: 'Rezervasyonunuz onaylandı.',
            });
          }
        } else {
          // Just check current status once
          const currentStatus = await paymentService.getPaymentStatus(parseInt(bookingId));
          setPaymentStatus(currentStatus);
        }
      } catch (err) {
        console.error('Payment status check failed:', err);
        setError('Ödeme durumu kontrol edilemedi');
        
        toast({
          title: 'Hata',
          description: 'Ödeme durumu kontrol edilemedi. Lütfen rezervasyonlarım sayfasından kontrol edin.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId, success, status]);

  const handleGoToBookings = () => {
    navigate('/my-bookings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleManualCheck = async () => {
    if (!bookingId) return;
    
    setChecking(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/payment/check-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const updatedStatus = await response.json();
        setPaymentStatus(updatedStatus);
        
        if (updatedStatus.paymentCompleted) {
          toast({
            title: 'Ödeme Onaylandı!',
            description: 'Ödemeniz başarıyla tamamlandı.',
          });
        }
      } else {
        toast({
          title: 'Kontrol Edilemedi',
          description: 'Ödeme durumu kontrol edilemedi. Lütfen tekrar deneyiniz.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Manual check failed:', error);
      toast({
        title: 'Hata',
        description: 'Ödeme durumu kontrol edilemedi.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Ödeme Durumu Kontrol Ediliyor</h2>
            <p className="text-gray-600 text-center">
              Lütfen bekleyin, ödeme durumunuz kontrol ediliyor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-6 w-6 mr-2" />
              Hata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                Ana Sayfa
              </Button>
              <Button onClick={handleGoToBookings} className="flex-1">
                Rezervasyonlarım
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus) {
    const isSuccess = paymentStatus.paymentCompleted || paymentStatus.paymentStatus === 'COMPLETED';
    const isFailed = paymentStatus.paymentStatus === 'FAILED';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className={`flex items-center ${isSuccess ? 'text-green-600' : isFailed ? 'text-red-600' : 'text-yellow-600'}`}>
              {isSuccess ? (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Ödeme Başarılı
                </>
              ) : isFailed ? (
                <>
                  <XCircle className="h-6 w-6 mr-2" />
                  Ödeme Başarısız
                </>
              ) : (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Ödeme Bekleniyor
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span>Rezervasyon ID:</span>
                  <span className="font-semibold">#{paymentStatus.bookingId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Toplam Tutar:</span>
                  <span className="font-semibold">₺{paymentStatus.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ödenen Tutar:</span>
                  <span className="font-semibold">₺{paymentStatus.paidAmount.toLocaleString()}</span>
                </div>
                {paymentStatus.remainingAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Kalan Tutar:</span>
                    <span className="font-semibold">₺{paymentStatus.remainingAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm text-center">
                {isSuccess 
                  ? 'Rezervasyonunuz başarıyla onaylandı. Detayları rezervasyonlarım sayfasından görebilirsiniz.'
                  : isFailed 
                  ? 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.'
                  : 'Ödeme işlemi devam ediyor. Lütfen bekleyin.'
                }
              </p>

              <div className="space-y-2">
                {!isSuccess && !isFailed && (
                  <Button 
                    onClick={handleManualCheck} 
                    disabled={checking}
                    className="w-full"
                    variant="outline"
                  >
                    {checking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kontrol Ediliyor...
                      </>
                    ) : (
                      'Ödeme Durumunu Kontrol Et'
                    )}
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleGoHome} variant="outline" className="flex-1">
                    Ana Sayfa
                  </Button>
                  <Button onClick={handleGoToBookings} className="flex-1">
                    Rezervasyonlarım
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
