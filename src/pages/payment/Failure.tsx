import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ maxWidth: 720, width: "100%", background: "#fff", border: "1px solid #e5e7eb", padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <h1 style={{ color: "#dc2626", margin: "0 0 12px 0" }}>Ödeme Başarısız</h1>
        <p style={{ color: "#475569", marginBottom: 16 }}>
          Üzgünüz, ödemeniz tamamlanamadı. Lütfen aşağıdaki bilgileri kontrol ederek tekrar deneyin.
        </p>
        {error && (
          <div style={{ background: "#fee2e2", padding: 16, border: "1px solid #fecaca", borderRadius: 8, marginBottom: 16, color: "#991b1b" }}>
            <div>Hata: {error}</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: "10px 16px", borderRadius: 6, background: "#dc2626", color: "#fff", border: "none" }}
          >
            Tekrar Dene
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
};

export default PaymentFailure;


