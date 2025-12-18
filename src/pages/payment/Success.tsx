import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get("conversationId");

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ maxWidth: 720, width: "100%", background: "#fff", border: "1px solid #e5e7eb", padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <h1 style={{ color: "#16a34a", margin: "0 0 12px 0" }}>Ödeme Başarılı</h1>
        <p style={{ color: "#475569", marginBottom: 16 }}>
          Ödemeniz başarıyla tamamlandı. Rezervasyonunuz onaylandı ve kısa süre içinde e-posta ile bilgilendirileceksiniz.
        </p>
        {conversationId && (
          <div style={{ background: "#f1f5f9", padding: 16, border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Konuşma ID</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{conversationId}</span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate("/my-bookings")}
            style={{ padding: "10px 16px", borderRadius: 6, background: "#2563eb", color: "#fff", border: "none" }}
          >
            Rezervasyonlarım
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "10px 16px", borderRadius: 6, background: "#6b7280", color: "#fff", border: "none" }}
          >
            Ana Sayfa
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;


