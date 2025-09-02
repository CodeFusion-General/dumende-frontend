import React, { useState } from "react";
import { AdminBookingView, AdminBookingAction } from "@/types/adminBooking";
import { BookingStatus } from "@/types/booking.types";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

interface BookingActionPanelProps {
  booking: AdminBookingView;
  onAction: (action: AdminBookingAction) => Promise<void>;
  loading?: boolean;
}

export const BookingActionPanel: React.FC<BookingActionPanelProps> = ({
  booking,
  onAction,
  loading = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    AdminBookingAction["type"] | null
  >(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  // Handle action initiation
  const handleActionClick = (actionType: AdminBookingAction["type"]) => {
    setSelectedAction(actionType);
    setShowConfirmation(true);
  };

  // Handle action confirmation
  const handleConfirm = async () => {
    if (!selectedAction) return;

    const action: AdminBookingAction = {
      type: selectedAction,
      bookingId: booking.id,
      reason: reason || undefined,
      note: selectedAction === "add_note" ? note : undefined,
    };

    await onAction(action);

    // Reset state
    setShowConfirmation(false);
    setSelectedAction(null);
    setReason("");
    setNote("");
  };

  // Handle cancellation
  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedAction(null);
    setReason("");
    setNote("");
  };

  // Get available actions based on booking status
  const getAvailableActions = () => {
    const actions = [];

    if (booking.status === BookingStatus.PENDING) {
      actions.push(
        {
          type: "approve" as const,
          label: "Onayla",
          icon: CheckCircle,
          color: "bg-green-600 hover:bg-green-700",
          description: "Rezervasyonu onaylayın",
        },
        {
          type: "reject" as const,
          label: "Reddet",
          icon: XCircle,
          color: "bg-red-600 hover:bg-red-700",
          description: "Rezervasyonu reddedin",
        }
      );
    }

    if (
      [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
        booking.status as BookingStatus
      )
    ) {
      actions.push({
        type: "cancel" as const,
        label: "İptal Et",
        icon: XCircle,
        color: "bg-red-600 hover:bg-red-700",
        description: "Rezervasyonu iptal edin",
      });
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      actions.push({
        type: "complete" as const,
        label: "Tamamla",
        icon: CheckCircle,
        color: "bg-blue-600 hover:bg-blue-700",
        description: "Rezervasyonu tamamlandı olarak işaretleyin",
      });
    }

    // Always available actions
    actions.push(
      {
        type: "add_note" as const,
        label: "Not Ekle",
        icon: MessageSquare,
        color: "bg-gray-600 hover:bg-gray-700",
        description: "Rezervasyona not ekleyin",
      },
      {
        type: "reschedule" as const,
        label: "Yeniden Planla",
        icon: Calendar,
        color: "bg-purple-600 hover:bg-purple-700",
        description: "Rezervasyon tarihini değiştirin",
      }
    );

    return actions;
  };

  const availableActions = getAvailableActions();

  // Get contact actions
  const getContactActions = () => {
    const contacts = [];

    // Customer contact
    contacts.push({
      type: "contact_customer" as const,
      label: "Müşteriyi Ara",
      icon: Phone,
      color: "bg-blue-600 hover:bg-blue-700",
      contact: booking.customerInfo.phone,
    });

    contacts.push({
      type: "contact_customer" as const,
      label: "Müşteriye Email",
      icon: Mail,
      color: "bg-blue-600 hover:bg-blue-700",
      contact: booking.customerInfo.email,
    });

    // Owner/Guide contact
    if (booking.boatInfo) {
      contacts.push({
        type: "contact_owner" as const,
        label: "Sahibi Ara",
        icon: Phone,
        color: "bg-green-600 hover:bg-green-700",
        contact: booking.boatInfo.ownerEmail, // Would need phone number
      });

      contacts.push({
        type: "contact_owner" as const,
        label: "Sahibine Email",
        icon: Mail,
        color: "bg-green-600 hover:bg-green-700",
        contact: booking.boatInfo.ownerEmail,
      });
    }

    if (booking.tourInfo) {
      contacts.push({
        type: "contact_owner" as const,
        label: "Rehberi Ara",
        icon: Phone,
        color: "bg-green-600 hover:bg-green-700",
        contact: booking.tourInfo.guideEmail, // Would need phone number
      });

      contacts.push({
        type: "contact_owner" as const,
        label: "Rehbere Email",
        icon: Mail,
        color: "bg-green-600 hover:bg-green-700",
        contact: booking.tourInfo.guideEmail,
      });
    }

    return contacts;
  };

  const contactActions = getContactActions();

  if (showConfirmation && selectedAction) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedAction === "approve" && "Rezervasyonu Onayla"}
          {selectedAction === "reject" && "Rezervasyonu Reddet"}
          {selectedAction === "cancel" && "Rezervasyonu İptal Et"}
          {selectedAction === "complete" && "Rezervasyonu Tamamla"}
          {selectedAction === "add_note" && "Not Ekle"}
          {selectedAction === "reschedule" && "Yeniden Planla"}
        </h3>

        <div className="space-y-4">
          {selectedAction === "add_note" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Not
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notunuzu buraya yazın..."
              />
            </div>
          ) : selectedAction === "reschedule" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Başlangıç Tarihi
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Bitiş Tarihi
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              Bu işlemi gerçekleştirmek istediğinizden emin misiniz?
            </p>
          )}

          {selectedAction !== "add_note" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sebep (Opsiyonel)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İşlem sebebini belirtebilirsiniz..."
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                loading || (selectedAction === "add_note" && !note.trim())
              }
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Onayla"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rezervasyon İşlemleri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableActions.map((action) => (
            <button
              key={action.type}
              onClick={() => handleActionClick(action.type)}
              disabled={loading}
              className={`inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${action.color} disabled:opacity-50 transition-colors`}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">İletişim</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contactActions.map((contact, index) => (
            <button
              key={index}
              onClick={() => {
                if (contact.icon === Mail) {
                  window.open(`mailto:${contact.contact}`, "_blank");
                } else if (contact.icon === Phone) {
                  window.open(`tel:${contact.contact}`, "_blank");
                }
              }}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${contact.color} transition-colors`}
            >
              <contact.icon className="w-4 h-4 mr-2" />
              {contact.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Hızlı Bilgiler
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            Oluşturulma: {new Date(booking.createdAt).toLocaleString("tr-TR")}
          </div>
          <div>
            Son Güncelleme:{" "}
            {new Date(booking.updatedAt).toLocaleString("tr-TR")}
          </div>
          {booking.lastModifiedBy && (
            <div>Son Düzenleyen: {booking.lastModifiedBy.adminName}</div>
          )}
        </div>
      </div>
    </div>
  );
};
