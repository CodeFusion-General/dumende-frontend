import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "@/services/paymentService";

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
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      if (!bookingId) {
        setError("Geçersiz rezervasyon bilgisi.");
        setLoading(false);
        return;
      }
      try {
        const status = await paymentService.getPaymentStatus(bookingId);
        if (status.paymentCompleted) {
          navigate("/my-bookings");
          return;
        }
        if (!status.paymentUrl) {
          setError("Ödeme bağlantısı oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
          setLoading(false);
          return;
        }
        const url = paymentService.buildIframeUrl(status.paymentUrl);
        if (isMounted) {
          setIframeUrl(url);
          setLoading(false);
        }
      } catch (e: any) {
        setError(e?.message || "Ödeme durumu alınamadı.");
        setLoading(false);
      }
    };
    // Only start iframe flow if requested or by default
    if (startParam === "iframe" || !startParam) {
      bootstrap();
    } else {
      // Unknown start parameter -> fallback to iframe
      bootstrap();
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId, startParam, navigate]);

  if (error) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, width: "100%", padding: 24 }}>
          <h2 style={{ marginBottom: 12 }}>Ödeme Sayfası Yüklenemedi</h2>
          <p style={{ color: "#666", marginBottom: 16 }}>{error}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "10px 16px", borderRadius: 6, background: "#2563eb", color: "#fff", border: "none" }}
            >
              Sayfayı Yenile
            </button>
            <button
              onClick={() => navigate("/my-bookings")}
              style={{ padding: "10px 16px", borderRadius: 6, background: "#6b7280", color: "#fff", border: "none" }}
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
            <div style={{ color: "#64748b" }}>Ödeme formu hazırlanıyor...</div>
            <style>
              {`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}
            </style>
          </div>
        )}

        {/* Iframe */}
        {!loading && iframeUrl && (
          <iframe
            title="Iyzico Payment"
            src={iframeUrl}
            style={{ width: "100%", height: 680, border: "none", display: "block" }}
            allow="payment"
          />
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;


