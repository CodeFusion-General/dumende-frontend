import React, { useEffect, useState } from 'react';
import { AlertCircle, CreditCard, Lock, CheckCircle, Loader } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { BinCheckResponseDto, ThreeDSInitializeRequestDto } from '@/types/payment.types';

type Props = { bookingId: number; totalAmount: number };

const ThreeDSPaymentFlow: React.FC<Props> = ({ bookingId, totalAmount }) => {
  const [step, setStep] = useState<'card-input' | '3ds-verification' | 'processing' | 'complete'>('card-input');
  const [cardData, setCardData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    installment: 1,
  });
  const [binInfo, setBinInfo] = useState<BinCheckResponseDto | null>(null);
  const [installmentOptions, setInstallmentOptions] = useState<Array<{ installmentNumber: number; totalPrice: number }>>([]);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
  const [initInfo, setInitInfo] = useState<{ paymentId?: string; conversationId?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    const handlePopState = () => {

      checkForCallbackResult();
    };
    window.addEventListener('popstate', handlePopState);
    checkForCallbackResult();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const checkForCallbackResult = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const returnedBookingId = urlParams.get('bookingId');
      const errorText = urlParams.get('error');

      // Backend'e eksik paramları (paymentId, status) tamamlayan ek callback isteği gönder
      if (status && returnedBookingId === String(bookingId)) {
        sendSupplementaryCallbackIfNeeded(status);
      }
      if (!status) return;
      if (returnedBookingId !== String(bookingId)) return;
      if (status === 'success') {
        setStep('complete');
        paymentService.getPaymentStatus(bookingId)
          .then(result => setPaymentResult(result))
          .catch(console.error);
      } else if (status === 'failed') {
        setError(errorText || 'Ödeme başarısız oldu');
        setStep('card-input');
      } else if (status === 'error') {
        setError(errorText || 'İşlem sırasında hata oluştu');
        setStep('card-input');
      }
    } catch (e) {

    }
  };

  // Callback'i güçlendiren ek istek: init'te alınan paymentId'yi backend callback'ine iletir
  const sendSupplementaryCallbackIfNeeded = async (status: string) => {
    try {
      const key = `threeds:init:${bookingId}`;
      const persisted = sessionStorage.getItem(key);
      const info = initInfo || (persisted ? JSON.parse(persisted) : null);
      if (!info || !info.paymentId) return;
      // Tekrar çağrılmayı önlemek için guard
      const sentKey = `${key}:sent`;
      if (sessionStorage.getItem(sentKey)) return;
      sessionStorage.setItem(sentKey, '1');
      const qs = new URLSearchParams({
        bookingId: String(bookingId),
        conversationId: info.conversationId || String(bookingId),
        paymentId: info.paymentId,
        status: status || 'success'
      }).toString();
      // GET ile çağır; yönlendirme fetch kapsamında kalacak, sayfa konumunu değiştirmez
      await fetch(`/api/payments/callback?${qs}`, { method: 'GET', credentials: 'include' });
    } catch (e) {

    }
  };

  useEffect(() => {
    if (cardData.cardNumber.replace(/\s/g, '').length >= 6) {
      const bin = cardData.cardNumber.replace(/\s/g, '').slice(0, 6);
      checkBinNumber(bin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData.cardNumber]);

  const checkBinNumber = async (bin: string) => {
    try {
      const data = await paymentService.binCheck(bin, totalAmount);
      setBinInfo(data);
      setInstallmentOptions(data.installmentPrices || []);
    } catch (err) {

    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts: string[] = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const validateForm = () => {
    if (!cardData.cardHolderName || cardData.cardHolderName.length < 3) {
      setError('Lütfen kart sahibinin adını girin');
      return false;
    }
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 15) {
      setError('Lütfen geçerli bir kart numarası girin');
      return false;
    }
    if (!cardData.expireMonth || !cardData.expireYear) {
      setError('Lütfen son kullanma tarihini girin');
      return false;
    }
    const rawMonth = cardData.expireMonth.trim();
    if (!/^\d{1,2}$/.test(rawMonth)) {
      setError('Ay alanı sayısal olmalıdır');
      return false;
    }
    const monthNum = Number(rawMonth);
    if (monthNum < 1 || monthNum > 12) {
      setError('Ay 01-12 arasında olmalıdır');
      return false;
    }
    let rawYear = cardData.expireYear.trim();
    if (!/^\d{2,4}$/.test(rawYear)) {
      setError('Yıl alanı sayısal olmalıdır');
      return false;
    }
    if (rawYear.length === 2) {
      rawYear = `20${rawYear}`;
    }
    if (!/^20[2-9]\d$/.test(rawYear)) {
      setError('Lütfen yılı YYYY formatında (ör. 2027) girin');
      return false;
    }
    if (!cardData.cvc || cardData.cvc.length < 3) {
      setError('Lütfen CVC kodunu girin');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const normalizedMonth = String(Number(cardData.expireMonth.trim())).padStart(2, '0');
      const normalizedYear = (cardData.expireYear.trim().length === 2)
        ? `20${cardData.expireYear.trim()}`
        : cardData.expireYear.trim();
      const payload: ThreeDSInitializeRequestDto = {
        bookingId,
        cardHolderName: cardData.cardHolderName,
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        expireMonth: normalizedMonth,
        expireYear: normalizedYear,
        cvc: cardData.cvc,
        installment: cardData.installment,
      };
      const data = await paymentService.initialize3DS(payload);
      // init bilgilerini sakla: state + sessionStorage (redirect sonrası kullanılacak)
      setInitInfo({ paymentId: data.paymentId, conversationId: data.conversationId });
      try {
        sessionStorage.setItem(`threeds:init:${bookingId}`,
          JSON.stringify({ paymentId: data.paymentId, conversationId: data.conversationId })
        );
      } catch {}
      if (data.status === 'success' && data.threeDSHtmlContent) {
        setThreeDSContent(data.threeDSHtmlContent);
        setStep('3ds-verification');
        render3DSContent(data.threeDSHtmlContent);
      } else {
        setError(data.errorMessage || 'Ödeme başlatılamadı');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const render3DSContent = (encodedContent: string) => {
    const tryDecodeBase64 = (input: string): string => {
      try {
        let clean = (input || '').trim().replace(/\s+/g, '');
        clean = clean.replace(/-/g, '+').replace(/_/g, '/');
        const pad = clean.length % 4;
        if (pad) clean = clean + '='.repeat(4 - pad);
        const decoded = atob(clean);
        if (decoded.includes('<') && decoded.includes('>')) return decoded;
        return input;
      } catch {
        return input;
      }
    };

    let html = tryDecodeBase64(encodedContent);

    // paymentId ve status parametrelerini callback formuna enjekte et
    try {
      const key = `threeds:init:${bookingId}`;
      const persisted = sessionStorage.getItem(key);
      const info = initInfo || (persisted ? JSON.parse(persisted) : null);
      const pid = info?.paymentId?.trim();
      if (pid) {
        const hiddenInputs = `\n<input type="hidden" name="paymentId" value="${pid}" />\n<input type="hidden" name="status" value="success" />\n`;
        // Her <form> açılışından sonra ve kapanışından önce ekle
        html = html.replace(/(<form[^>]*>)/gi, (match) => match + hiddenInputs);
        html = html.replace(/<\/form>/gi, hiddenInputs + '</form>');
      }
    } catch {}

    if (typeof window !== 'undefined' && html.includes('action=') && html.includes('mdStatus')) {

    }

    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/payments/3ds/relay';
      form.target = '_self';
      form.acceptCharset = 'UTF-8';
      form.enctype = 'application/x-www-form-urlencoded';
      form.style.display = 'none';
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'content';
      const payloadUpdated = btoa(unescape(encodeURIComponent(html)));
      input.value = payloadUpdated;
      form.appendChild(input);
      document.body.appendChild(form);
      setStep('processing');
      setTimeout(() => {
        try { form.submit(); } catch (e) { console.error('❌ Form submit failed:', e); }
      }, 100);
    } catch {
      try {
        const newWin = window.open('', '_self');
        if (newWin) {
          newWin.document.open();
          newWin.document.write(html);
          newWin.document.close();
        }
      } catch {/* ignore */}
    }
  };

  const renderCardInput = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Ödeme Bilgileri
        </h2>
        <p className="text-gray-600 mt-2">
          Toplam Tutar: <span className="font-bold">{totalAmount} TL</span>
        </p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
          <input
            type="text"
            value={cardData.cardHolderName}
            onChange={(e) => setCardData({ ...cardData, cardHolderName: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="JOHN DOE"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
          <div className="relative">
            <input
              type="text"
              value={formatCardNumber(cardData.cardNumber)}
              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
            />
            {binInfo && binInfo.cardAssociation && (
              <div className="absolute right-3 top-2 text-xs font-semibold text-blue-600">{binInfo.cardAssociation}</div>
            )}
          </div>
          {binInfo && (
            <p className="text-xs text-gray-600 mt-1">
              {binInfo.bankName} - {binInfo.cardType}
              {!!binInfo.force3ds && (
                <span className="ml-2 text-green-600">
                  <Lock className="inline w-3 h-3" /> 3D Secure
                </span>
              )}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cardData.expireMonth}
                onChange={(e) => setCardData({ ...cardData, expireMonth: e.target.value })}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MM"
                maxLength={2}
                required
              />
              <input
                type="text"
                value={cardData.expireYear}
                onChange={(e) => setCardData({ ...cardData, expireYear: e.target.value })}
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YYYY"
                maxLength={4}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text sm font-medium text-gray-700 mb-1">CVC</label>
            <input
              type="text"
              value={cardData.cvc}
              onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>
        {installmentOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taksit Seçenekleri</label>
            <div className="grid grid-cols-3 gap-2">
              {installmentOptions.map((o) => (
                <button
                  key={o.installmentNumber}
                  type="button"
                  onClick={() => setCardData({ ...cardData, installment: o.installmentNumber })}
                  className={`p-2 border rounded-md text-sm ${
                    cardData.installment === o.installmentNumber ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">{o.installmentNumber === 1 ? 'Tek Çekim' : `${o.installmentNumber} Taksit`}</div>
                  <div className="text-xs">{o.totalPrice ? o.totalPrice.toFixed(2) : totalAmount} TL</div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-md flex items-start gap-2">
          <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-semibold mb-1">Güvenli Ödeme</p>
            <p>Kartınız 3D Secure ile korunmaktadır. Bankanızdan SMS ile gelen şifreyi girerek ödemenizi tamamlayabilirsiniz.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" /> İşleniyor...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" /> Güvenli Ödeme Yap
            </>
          )}
        </button>
      </div>
    </div>
  );

  const render3DSVerification = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-600" /> 3D Secure Doğrulama
        </h2>
        <p className="text-gray-600 mb-4">Bankanızdan gelen SMS kodunu girerek ödemenizi tamamlayın.</p>
        <div id="threeds-container" className="border rounded-lg overflow-hidden bg-white" style={{ minHeight: '500px' }} />
        <p className="text-xs text-gray-500 mt-4">Bu sayfa bankanız tarafından sağlanmaktadır ve güvenlidir.</p>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Ödemeniz İşleniyor</h2>
        <p className="text-gray-600">Lütfen bekleyin, ödemeniz kontrol ediliyor...</p>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ödemeniz Başarılı!</h2>
        <p className="text-gray-600 mb-4">Rezervasyonunuz onaylandı. Detaylar e-posta adresinize gönderildi.</p>
        {paymentResult && (
          <div className="bg-gray-50 rounded-md p-4 text-left">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Rezervasyon:</span> {paymentResult.bookingId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tutar:</span> {paymentResult.paidAmount} TL
            </p>
          </div>
        )}
        <button onClick={() => (window.location.href = '/my-bookings')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Rezervasyonlarıma Git
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {step === 'card-input' && renderCardInput()}
      {step === '3ds-verification' && render3DSVerification()}
      {step === 'processing' && renderProcessing()}
      {step === 'complete' && renderComplete()}
    </div>
  );
};

export default ThreeDSPaymentFlow;

