import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { httpClient } from "@/lib/axios";

const PaymentReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingIdParam = searchParams.get("bookingId");
  const startParam = searchParams.get("start"); // expected "iframe" or "3ds"

  const bookingId = useMemo(() => {
    const id = Number(bookingIdParam);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  }, [bookingIdParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"awaiting_approval" | "payment_disabled" | "token_expired" | "general" | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);

  // Refresh payment token
  const handleRefreshToken = useCallback(async () => {
    if (!bookingId || refreshingToken) return;

    try {
      setRefreshingToken(true);
      setError(null);
      setErrorType(null);
      setLoading(true);

      // Call backend to refresh token
      const response = await httpClient.post(`/iyzico/booking/${bookingId}/refresh-token`);
      const data = response.data?.data;

      if (data?.paymentUrl) {
        const url = paymentService.buildIframeUrl(data.paymentUrl);
        setIframeUrl(url);
        setLoading(false);
      } else {
        throw new Error("Yeni ödeme bağlantısı oluşturulamadı");
      }
    } catch (e: any) {
      console.error("Error refreshing token:", e);
      setError(e?.response?.data?.message || e?.message || "Token yenileme başarısız oldu");
      setErrorType("general");
      setLoading(false);
    } finally {
      setRefreshingToken(false);
    }
  }, [bookingId, refreshingToken]);

  // Check payment status periodically
  const checkPaymentStatus = useCallback(async () => {
    if (!bookingId || checkingPayment) return;
    
    try {
      setCheckingPayment(true);
      const status = await paymentService.getPaymentStatus(bookingId);
      
      if (status.paymentCompleted) {
        setPaymentSuccess(true);
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          navigate("/my-bookings?payment=success");
        }, 2000);
        return true; // Payment completed
      }
      
      // Also check booking status directly
      try {
        const booking = await bookingService.getBookingById(bookingId);
        if (booking.status === "CONFIRMED") {
          setPaymentSuccess(true);
          setTimeout(() => {
            navigate("/my-bookings?payment=success");
          }, 2000);
          return true;
        }
      } catch {
        // ignore
      }
      
      return false; // Payment not completed yet
    } catch (e) {
      console.error("Error checking payment status:", e);
      return false;
    } finally {
      setCheckingPayment(false);
    }
  }, [bookingId, checkingPayment, navigate]);

  // Start polling for payment status when iframe is loaded
  useEffect(() => {
    if (!iframeUrl || !bookingId || paymentSuccess) return;

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const completed = await checkPaymentStatus();
      if (completed) {
        clearInterval(interval);
      }
    }, 3000);

    // Also check immediately after a short delay (give iframe time to load)
    const initialCheck = setTimeout(() => {
      checkPaymentStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialCheck);
    };
  }, [iframeUrl, bookingId, paymentSuccess, checkPaymentStatus]);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      if (!bookingId) {
        setError("Geçersiz rezervasyon bilgisi.");
        setErrorType("general");
        setLoading(false);
        return;
      }
      try {
        // First check booking status
        let booking = null;
        try {
          booking = await bookingService.getBookingById(bookingId);
        } catch {
          // ignore
        }

        // If booking is already confirmed, redirect to success
        if (booking && booking.status === "CONFIRMED") {
          navigate("/my-bookings?payment=success");
          return;
        }

        // If booking is awaiting owner approval, show appropriate message
        if (booking && booking.status === "AWAITING_OWNER_APPROVAL") {
          setError("Bu rezervasyon henüz tekne sahibinin onayını bekliyor. Onay sonrası ödeme yapabileceksiniz.");
          setErrorType("awaiting_approval");
          setLoading(false);
          return;
        }

        // Check if token needs refresh
        try {
          const tokenStatus = await httpClient.get(`/iyzico/booking/${bookingId}/token-status`);
          if (tokenStatus.data?.data?.needsRefresh) {
            // Token expired, show refresh option
            setError("Ödeme süresi doldu. Yeni bir ödeme oturumu başlatmak için aşağıdaki butona tıklayın.");
            setErrorType("token_expired");
            setLoading(false);
            return;
          }
        } catch {
          // Token status check failed, continue with normal flow
        }

        const status = await paymentService.getPaymentStatus(bookingId);
        if (status.paymentCompleted) {
          navigate("/my-bookings?payment=success");
          return;
        }
        if (!status.paymentUrl) {
          // Check if it's a token expiry issue
          if (booking && (booking.status === "RESERVED" || booking.status === "APPROVED_PENDING_PAYMENT")) {
            // Try to check token status more explicitly
            try {
              const tokenStatus = await httpClient.get(`/iyzico/booking/${bookingId}/token-status`);
              if (tokenStatus.data?.data?.needsRefresh) {
                setError("Ödeme süresi doldu. Yeni bir ödeme oturumu başlatmak için aşağıdaki butona tıklayın.");
                setErrorType("token_expired");
                setLoading(false);
                return;
              }
            } catch {
              // Ignore
            }
            
            setError("Ödeme sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin veya destek ile iletişime geçin.");
            setErrorType("payment_disabled");
          } else {
            setError("Ödeme bağlantısı oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
            setErrorType("general");
          }
          setLoading(false);
          return;
        }
        const url = paymentService.buildIframeUrl(status.paymentUrl);
        if (isMounted) {
          setIframeUrl(url);
          setLoading(false);
        }
      } catch (e: any) {
        // Check if error indicates token expiry
        const errorMessage = e?.response?.data?.message || e?.message || "";
        if (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("token")) {
          setError("Ödeme süresi doldu. Yeni bir ödeme oturumu başlatmak için aşağıdaki butona tıklayın.");
          setErrorType("token_expired");
        } else {
          setError(errorMessage || "Ödeme durumu alınamadı.");
          setErrorType("general");
        }
        setLoading(false);
      }
    };
    // Only start iframe flow if requested or by default
    if (startParam === "iframe" || !startParam || startParam === "3ds") {
      bootstrap();
    } else {
      // Unknown start parameter -> fallback to iframe
      bootstrap();
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId, startParam, navigate]);

  // Payment success screen
  if (paymentSuccess) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4" }}>
        <div style={{ maxWidth: 560, width: "100%", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ marginBottom: 12, color: "#16a34a", fontSize: 24 }}>Ödeme Başarılı!</h2>
          <p style={{ color: "#166534", marginBottom: 24 }}>
            Rezervasyonunuz onaylandı. Rezervasyonlarım sayfasına yönlendiriliyorsunuz...
          </p>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #bbf7d0",
              borderTop: "3px solid #16a34a",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}
          </style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, width: "100%", padding: 24, textAlign: "center" }}>
          {errorType === "awaiting_approval" ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h2 style={{ marginBottom: 12, color: "#f59e0b" }}>Onay Bekleniyor</h2>
            </>
          ) : errorType === "payment_disabled" ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
              <h2 style={{ marginBottom: 12, color: "#6b7280" }}>Ödeme Sistemi</h2>
            </>
          ) : errorType === "token_expired" ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
              <h2 style={{ marginBottom: 12, color: "#f59e0b" }}>Ödeme Süresi Doldu</h2>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h2 style={{ marginBottom: 12 }}>Ödeme Sayfası Yüklenemedi</h2>
            </>
          )}
          <p style={{ color: "#666", marginBottom: 24 }}>{error}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {errorType === "token_expired" && (
              <button
                onClick={handleRefreshToken}
                disabled={refreshingToken}
                style={{ 
                  padding: "12px 24px", 
                  borderRadius: 6, 
                  background: refreshingToken ? "#9ca3af" : "#16a34a", 
                  color: "#fff", 
                  border: "none", 
                  cursor: refreshingToken ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                {refreshingToken ? "Yenileniyor..." : "🔄 Yeni Ödeme Oturumu Başlat"}
              </button>
            )}
            {errorType !== "awaiting_approval" && errorType !== "token_expired" && (
              <button
                onClick={() => window.location.reload()}
                style={{ padding: "10px 16px", borderRadius: 6, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Sayfayı Yenile
              </button>
            )}
            <button
              onClick={() => navigate("/my-bookings")}
              style={{ padding: "10px 16px", borderRadius: 6, background: "#6b7280", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Rezervasyonlarım
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ width: "100%", maxWidth: 900, background: "#fff", border: "1px solid #e5e7eb" }}>
        {/* Loading overlay */}
        {loading && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #e5e7eb",
                borderTop: "3px solid #2563eb",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 1s linear infinite",
              }}
            />
            <div style={{ color: "#64748b" }}>
              {refreshingToken ? "Yeni ödeme oturumu başlatılıyor..." : "Ödeme formu hazırlanıyor..."}
            </div>
            <style>
              {`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}
            </style>
          </div>
        )}

        {/* Iframe */}
        {!loading && iframeUrl && (
          <>
            <iframe
              title="Iyzico Payment"
              src={iframeUrl}
              style={{ width: "100%", height: 680, border: "none", display: "block" }}
              allow="payment"
            />
            {/* Status check indicator */}
            <div style={{ 
              padding: "8px 16px", 
              background: "#f1f5f9", 
              borderTop: "1px solid #e5e7eb",
              fontSize: 12,
              color: "#64748b",
              textAlign: "center"
            }}>
              {checkingPayment ? "Ödeme durumu kontrol ediliyor..." : "Ödeme tamamlandığında otomatik yönlendirileceksiniz"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;
