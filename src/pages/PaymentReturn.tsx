import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Clock, RefreshCcw } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { PaymentStatusResponseDto, ThreeDSInitializeRequestDto, ThreeDSInitializeResponseDto } from '@/types/payment.types';
import ThreeDSPaymentFlow from './ThreeDSPaymentFlow';
import { toast } from '@/components/ui/use-toast';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [showCardFlow, setShowCardFlow] = useState(false);

  // Extract booking ID from URL params
  const bookingId = searchParams.get('bookingId');
  const success = searchParams.get('success');
  const status = searchParams.get('status');
  const token = searchParams.get('token'); // Iyzico callback token
  const retryParam = searchParams.get('retry');
  const startParam = searchParams.get('start');
  const amountParam = searchParams.get('amount');

  // Direkt 3DS akışını başlatmak için opsiyonel parametre
  useEffect(() => {
    if (startParam === '3ds' && bookingId) {
      setShowCardFlow(true);
    }
  }, [startParam, bookingId]);

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID bulunamadı');
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        // Eksik parametreleri (paymentId, status) backend callback'ine takviye et
        await sendSupplementaryCallbackIfNeeded(bookingId, status);

        // Small initial delay to allow Iyzico -> Backend -> DB senkronizasyonu
        const shouldDelay = success === 'true' || status === 'success' || status === 'COMPLETED' || !!token;
        if (shouldDelay) {
          const INITIAL_DELAY_MS = 5000; // 5s bekleme
          await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY_MS));
        }

        // If URL indicates success, use enhanced polling
        if (success === 'true' || status === 'success' || status === 'COMPLETED') {
          // Use enhanced polling with status updates
          const finalStatus = await paymentService.pollPaymentStatusWithCallback(
            parseInt(bookingId),
            (currentStatus) => {
              setPaymentStatus(currentStatus);
              setPollingCount(prev => prev + 1);
              
              // Show intermediate updates
              if (currentStatus.paymentCompleted) {
                toast({
                  title: 'Ödeme Onaylandı!',
                  description: 'Rezervasyonunuz başarıyla tamamlandı.',
                });
              }
            },
            3, // max 3 deneme
            6000 // istekler arası 4 saniye
          );
          
          setPaymentStatus(finalStatus);
          
          if (finalStatus.paymentCompleted) {
            toast({
              title: 'Ödeme Başarılı!',
              description: 'Rezervasyonunuz onaylandı. Rezervasyonlarım sayfasına yönlendiriliyorsunuz.',
            });
            
            // Auto redirect after successful payment
            setTimeout(() => {
              navigate('/my-bookings');
            }, 3000);
          }
        } else {
          // Just check current status once, but use manual check for accuracy
          const currentStatus = await paymentService.checkAndUpdatePaymentStatus(parseInt(bookingId));
          setPaymentStatus(currentStatus);
          
          if (currentStatus.paymentCompleted) {
            toast({
              title: 'Ödeme Zaten Tamamlanmış',
              description: 'Bu rezervasyon için ödeme zaten tamamlanmış.',
            });
          }
        }
      } catch (err) {
        console.error('Payment status check failed:', err);
        
        // Try to get at least the basic status
        try {
          const basicStatus = await paymentService.getPaymentStatus(parseInt(bookingId));
          setPaymentStatus(basicStatus);
        } catch (basicError) {
          setError('Ödeme durumu kontrol edilemedi');
        }
        
        toast({
          title: 'Kontrol Hatası',
          description: 'Ödeme durumu tam olarak kontrol edilemedi. Manuel kontrol butonunu kullanabilirsiniz.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId, success, status, token, navigate]);

  // 3DS callback'i güçlendiren ek istek: init'te alınan paymentId'yi backend'e iletir
  const sendSupplementaryCallbackIfNeeded = async (bookingIdStr: string, statusParam: string | null) => {
    try {
      const key = `threeds:init:${bookingIdStr}`;
      const persisted = sessionStorage.getItem(key);
      if (!persisted) return;
      const info = JSON.parse(persisted) as { paymentId?: string; conversationId?: string };
      if (!info?.paymentId) return;
      // URL zaten paymentId içeriyorsa veya daha önce gönderdiysek atla
      if (new URLSearchParams(window.location.search).get('paymentId')) return;
      const sentKey = `${key}:sent-return`;
      if (sessionStorage.getItem(sentKey)) return;
      sessionStorage.setItem(sentKey, '1');

      const qs = new URLSearchParams({
        bookingId: bookingIdStr,
        conversationId: info.conversationId || bookingIdStr,
        paymentId: info.paymentId,
        status: statusParam || 'success'
      }).toString();
      await fetch(`/api/payments/callback?${qs}`, { method: 'GET', credentials: 'include' });
    } catch (e) {
    }
  };

  // ✅ Yeni: Backend callback status endpoint'ine polling (status pending ise)
  useEffect(() => {
    if (!bookingId || showCardFlow) return;
    const shouldStartPolling = !success && (status === 'pending' || !status);
    if (!shouldStartPolling) return;

    let cancelled = false;
    const MAX_RETRIES = 3;
    const RETRY_INTERVAL = 4000;

    type CallbackStatus = {
      bookingId: number;
      paymentStatus: string;
      isComplete: boolean;
      isPending: boolean;
      message?: string;
      shouldRetry?: boolean;
    };

    const poll = async () => {
      setIsPolling(true);
      setPollingCount(0);
      let attempt = 0;

      const doAttempt = async (): Promise<void> => {
        if (cancelled) return;
        if (attempt >= MAX_RETRIES) {
          setIsPolling(false);
          // Zaman aşımı: pending görünümünde bırak
          return;
        }
        try {
          const resp = await fetch(`/api/payments/callback/status?bookingId=${bookingId}`);
          const data: CallbackStatus = await resp.json();
          if (cancelled) return;

          // Başarı/başarısız kontrolü
          const isSuccess = data.isComplete || data.paymentStatus === 'COMPLETED' || data.paymentStatus === 'PARTIAL';
          const isFailed = data.paymentStatus === 'FAILED' || data.paymentStatus === 'CANCELLED';

          if (isSuccess) {
            // Güncel durumu da yansıt
            try {
              const latest = await paymentService.getPaymentStatus(parseInt(bookingId));
              setPaymentStatus(latest);
            } catch (_) {}
            setIsPolling(false);
            toast({ title: 'Ödeme Onaylandı!', description: 'Rezervasyonunuz başarıyla tamamlandı.' });
            setTimeout(() => navigate('/my-bookings'), 3000);
            return;
          }
          if (isFailed) {
            try {
              const latest = await paymentService.getPaymentStatus(parseInt(bookingId));
              setPaymentStatus(latest);
            } catch (_) {}
            setIsPolling(false);
            toast({ title: 'Ödeme Başarısız', description: 'Ödeme işlemi başarısız oldu.', variant: 'destructive' });
            return;
          }

          // Devam: pending
          attempt += 1;
          setPollingCount(attempt);
          setTimeout(doAttempt, RETRY_INTERVAL);
        } catch (e) {
          attempt += 1;
          setPollingCount(attempt);
          if (attempt >= MAX_RETRIES) {
            setIsPolling(false);
          } else {
            setTimeout(doAttempt, RETRY_INTERVAL);
          }
        }
      };

      // İlk deneme, küçük bir bekleme ile (retry param geldiyse bekleme yok)
      const initialDelay = retryParam ? 0 : 2000;
      setTimeout(doAttempt, initialDelay);
    };

    poll();

    return () => {
      cancelled = true;
      setIsPolling(false);
    };
  }, [bookingId, status, success, retryParam, navigate, showCardFlow]);

  const handleGoToBookings = () => {
    navigate('/my-bookings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // ✅ Improved manual check using paymentService
  const handleManualCheck = async () => {
    if (!bookingId) return;
    
    setChecking(true);
    try {
      // Use the enhanced check method
      const updatedStatus = await paymentService.checkAndUpdatePaymentStatus(parseInt(bookingId));
      setPaymentStatus(updatedStatus);
      
      if (updatedStatus.paymentCompleted) {
        toast({
          title: 'Ödeme Onaylandı!',
          description: 'Ödemeniz başarıyla tamamlandı.',
        });
      } else if (updatedStatus.paymentStatus === 'FAILED') {
        toast({
          title: 'Ödeme Başarısız',
          description: 'Ödeme işlemi başarısız oldu.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Durum Güncellendi',
          description: `Ödeme durumu: ${updatedStatus.paymentStatus}`,
        });
      }
    } catch (error) {
      console.error('Manual check failed:', error);
      toast({
        title: 'Kontrol Hatası',
        description: 'Ödeme durumu kontrol edilemedi. Lütfen tekrar deneyiniz.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  // ✅ Enhanced retry payment
  const handleRetryPayment = async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      
      // Get current status first
      const currentStatus = await paymentService.getPaymentStatus(parseInt(bookingId));
      
      if (currentStatus.paymentCompleted) {
        toast({
          title: 'Ödeme Zaten Tamamlanmış',
          description: 'Bu rezervasyon için ödeme zaten tamamlanmış.',
        });
        return;
      }
      
      if (currentStatus.paymentUrl) {
        // Existing payment URL available
        paymentService.redirectToPayment(currentStatus.paymentUrl);
      } else {
        // 3DS akışı: kart bilgileri ile ödeme başlat
        setShowCardFlow(true);
      }
    } catch (error) {
      console.error('Retry payment failed:', error);
      toast({
        title: 'Ödeme Başlatılamadı',
        description: 'Ödeme sayfası açılamadı. Lütfen tekrar deneyiniz.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showCardFlow && bookingId) {
    const amountFromParam = amountParam ? parseFloat(amountParam) : undefined;
    const amount = amountFromParam ?? paymentStatus?.depositAmount ?? paymentStatus?.totalAmount ?? 0;
    return <ThreeDSPaymentFlow bookingId={parseInt(bookingId)} totalAmount={amount} />;
  }

  if (loading || isPolling) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Ödeme Durumu Kontrol Ediliyor</h2>
            <p className="text-gray-600 text-center text-sm">
              Lütfen bekleyin, ödeme durumunuz kontrol ediliyor...
            </p>
            {pollingCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Kontrol #{pollingCount}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-6 w-6 mr-2" />
              Hata Oluştu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            
            {bookingId && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Rezervasyon ID: <span className="font-semibold">#{bookingId}</span>
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              {bookingId && (
                <Button 
                  onClick={handleManualCheck} 
                  disabled={checking}
                  variant="outline" 
                  className="w-full"
                >
                  {checking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kontrol Ediliyor...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Tekrar Dene
                    </>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus) {
    const statusInfo = paymentService.getStatusDisplayInfo(paymentStatus);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className={`flex items-center ${statusInfo.statusColor}`}>
              {statusInfo.isSuccess ? (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Ödeme Başarılı
                </>
              ) : statusInfo.isFailed ? (
                <>
                  <XCircle className="h-6 w-6 mr-2" />
                  Ödeme Başarısız
                </>
              ) : (
                <>
                  <Clock className="h-6 w-6 mr-2" />
                  Ödeme Bekleniyor
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between col-span-2 border-b border-gray-200 pb-2 mb-2">
                    <span>Rezervasyon ID:</span>
                    <span className="font-semibold">#{paymentStatus.bookingId}</span>
                  </div>
                  
                  <div className="flex justify-between col-span-2">
                    <span>Toplam Tutar:</span>
                    <span className="font-semibold">₺{paymentStatus.totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between col-span-2">
                    <span>Ödenen Tutar:</span>
                    <span className={`font-semibold ${paymentStatus.paidAmount > 0 ? 'text-green-600' : ''}`}>
                      ₺{paymentStatus.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  {paymentStatus.remainingAmount > 0 && (
                    <div className="flex justify-between col-span-2">
                      <span>Kalan Tutar:</span>
                      <span className="font-semibold text-orange-600">
                        ₺{paymentStatus.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.statusColor} text-center`}>
                  Durum: {statusInfo.statusText}
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {statusInfo.isSuccess 
                    ? 'Rezervasyonunuz başarıyla onaylandı. Detayları rezervasyonlarım sayfasından görebilirsiniz.'
                    : statusInfo.isFailed 
                    ? 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz veya farklı bir ödeme yöntemi kullanın.'
                    : 'Ödeme işlemi devam ediyor. Lütfen bekleyin veya manuel kontrol yapın.'
                  }
                </p>
                
                {statusInfo.isSuccess && (
                  <p className="text-xs text-green-600 mt-2">
                    3 saniye içinde rezervasyonlarım sayfasına yönlendirileceksiniz.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Manual Check Button - Show for pending/unknown states */}
                {!statusInfo.isSuccess && !statusInfo.isFailed && (
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
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Ödeme Durumunu Kontrol Et
                      </>
                    )}
                  </Button>
                )}
                
                {/* Retry Payment Button - Show for failed payments */}
                {statusInfo.isFailed && (
                  <Button 
                    onClick={handleRetryPayment}
                    className="w-full"
                    variant="default"
                  >
                    Ödemeyi Tekrar Dene
                  </Button>
                )}
                {!statusInfo.isSuccess && (
                  <Button 
                    onClick={() => setShowCardFlow(true)}
                    className="w-full"
                    variant="default"
                  >
                    Kart Bilgileriyle Öde (3DS)
                  </Button>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handleGoHome} variant="outline" className="flex-1">
                    Ana Sayfa
                  </Button>
                  <Button 
                    onClick={handleGoToBookings} 
                    className="flex-1"
                    variant={statusInfo.isSuccess ? "default" : "secondary"}
                  >
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