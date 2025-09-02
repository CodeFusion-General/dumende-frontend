import React, { useState } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { AdminBookingView, AdminBookingAction } from "@/types/adminBooking";
import { BookingStatus, PaymentStatus } from "@/types/booking.types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Edit,
  RefreshCw,
} from "lucide-react";

interface BookingDetailModalProps {
  booking: AdminBookingView;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: AdminBookingAction) => Promise<void>;
  loading?: boolean;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onAction,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "details" | "payment" | "notes" | "history"
  >("details");
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    AdminBookingAction["type"] | null
  >(null);
  const [actionReason, setActionReason] = useState("");
  const [newNote, setNewNote] = useState("");

  if (!isOpen) return null;

  // Handle action confirmation
  const handleActionConfirm = async () => {
    if (!selectedAction) return;

    const action: AdminBookingAction = {
      type: selectedAction,
      bookingId: booking.id,
      reason: actionReason || undefined,
      note: selectedAction === "add_note" ? newNote : undefined,
    };

    await onAction(action);
    setShowActionModal(false);
    setSelectedAction(null);
    setActionReason("");
    setNewNote("");
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      [BookingStatus.PENDING]: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Bekliyor",
      },
      [BookingStatus.CONFIRMED]: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Onaylandı",
      },
      [BookingStatus.COMPLETED]: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        label: "Tamamlandı",
      },
      [BookingStatus.CANCELLED]: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "İptal Edildi",
      },
      [BookingStatus.REJECTED]: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Reddedildi",
      },
      [BookingStatus.NO_SHOW]: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertCircle,
        label: "Gelmedi",
      },
    };

    return (
      statusConfig[status as BookingStatus] || {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertCircle,
        label: status,
      }
    );
  };

  const statusDisplay = getStatusDisplay(booking.status);
  const StatusIcon = statusDisplay.icon;

  // Available actions based on status
  const getAvailableActions = () => {
    const actions = [];

    if (booking.status === BookingStatus.PENDING) {
      actions.push(
        {
          type: "approve" as const,
          label: "Onayla",
          color: "green",
          icon: CheckCircle,
        },
        {
          type: "reject" as const,
          label: "Reddet",
          color: "red",
          icon: XCircle,
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
        color: "red",
        icon: XCircle,
      });
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      actions.push({
        type: "complete" as const,
        label: "Tamamla",
        color: "blue",
        icon: CheckCircle,
      });
    }

    actions.push({
      type: "add_note" as const,
      label: "Not Ekle",
      color: "gray",
      icon: MessageSquare,
    });

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <>
      <AdminModal
        title={`Rezervasyon Detayları - #${booking.id}`}
        size="xl"
        onClose={onClose}
        actions={[
          {
            label: "Kapat",
            variant: "secondary",
            onClick: onClose,
          },
        ]}
      >
        <div className="space-y-6">
          {/* Header with Status and Actions */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.color}`}
              >
                <StatusIcon className="w-4 h-4 mr-2" />
                {statusDisplay.label}
              </div>
              <div className="text-sm text-gray-500">
                Oluşturulma:{" "}
                {new Date(booking.createdAt).toLocaleString("tr-TR")}
              </div>
            </div>

            {availableActions.length > 0 && (
              <div className="flex items-center space-x-2">
                {availableActions.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => {
                      setSelectedAction(action.type);
                      setShowActionModal(true);
                    }}
                    disabled={loading}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                      action.color === "green"
                        ? "bg-green-600 hover:bg-green-700"
                        : action.color === "red"
                        ? "bg-red-600 hover:bg-red-700"
                        : action.color === "blue"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    } disabled:opacity-50`}
                  >
                    <action.icon className="w-4 h-4 mr-1" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "details", label: "Detaylar", icon: FileText },
                { key: "payment", label: "Ödeme", icon: CreditCard },
                { key: "notes", label: "Notlar", icon: MessageSquare },
                { key: "history", label: "Geçmiş", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "details" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Müşteri Bilgileri
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.customerInfo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Müşteri ID: {booking.customerInfo.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-900">
                          {booking.customerInfo.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          Doğrulama:{" "}
                          {booking.customerInfo.verificationStatus ===
                          "verified"
                            ? "Doğrulanmış"
                            : "Bekliyor"}
                        </div>
                      </div>
                    </div>
                    {booking.customerInfo.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div className="text-gray-900">
                          {booking.customerInfo.phone}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Kayıt Tarihi
                        </div>
                        <div className="text-gray-900">
                          {new Date(
                            booking.customerInfo.registrationDate
                          ).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Toplam Rezervasyon
                        </div>
                        <div className="text-gray-900">
                          {booking.customerInfo.totalBookings}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Hizmet Bilgileri
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {booking.boatInfo && (
                      <>
                        <div>
                          <div className="text-sm text-gray-500">Tekne</div>
                          <div className="font-medium text-gray-900">
                            {booking.boatInfo.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.boatInfo.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Sahip</div>
                          <div className="text-gray-900">
                            {booking.boatInfo.ownerName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.boatInfo.ownerEmail}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div className="text-gray-900">
                            {booking.boatInfo.location}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div className="text-gray-900">
                            Kapasite: {booking.boatInfo.capacity} kişi
                          </div>
                        </div>
                      </>
                    )}

                    {booking.tourInfo && (
                      <>
                        <div>
                          <div className="text-sm text-gray-500">Tur</div>
                          <div className="font-medium text-gray-900">
                            {booking.tourInfo.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Rehber</div>
                          <div className="text-gray-900">
                            {booking.tourInfo.guideName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.tourInfo.guideEmail}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div className="text-gray-900">
                            {booking.tourInfo.location}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div className="text-gray-900">
                            Süre: {booking.tourInfo.duration} saat
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div className="text-gray-900">
                            Max: {booking.tourInfo.maxParticipants} kişi
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Rezervasyon Detayları
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Başlangıç</div>
                        <div className="font-medium text-gray-900">
                          {new Date(booking.startDate).toLocaleDateString(
                            "tr-TR"
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(booking.startDate).toLocaleTimeString(
                            "tr-TR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Bitiş</div>
                        <div className="font-medium text-gray-900">
                          {new Date(booking.endDate).toLocaleDateString(
                            "tr-TR"
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(booking.endDate).toLocaleTimeString(
                            "tr-TR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Kişi Sayısı</div>
                        <div className="font-medium text-gray-900 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {booking.passengerCount}
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">Notlar</div>
                        <div className="text-gray-900 mt-1">
                          {booking.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Ödeme Bilgileri
                </h3>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        ₺
                        {booking.paymentInfo.totalAmount.toLocaleString(
                          "tr-TR"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Toplam Tutar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ₺
                        {booking.paymentInfo.paidAmount.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-sm text-gray-500">Ödenen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        ₺
                        {booking.paymentInfo.remainingAmount.toLocaleString(
                          "tr-TR"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Kalan</div>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Ödeme Durumu</div>
                      <div
                        className={`text-lg font-medium ${
                          booking.paymentInfo.paymentStatus ===
                          PaymentStatus.COMPLETED
                            ? "text-green-600"
                            : booking.paymentInfo.paymentStatus ===
                              PaymentStatus.FAILED
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {booking.paymentInfo.paymentStatus}
                      </div>
                    </div>
                    {booking.paymentInfo.paymentMethod && (
                      <div>
                        <div className="text-sm text-gray-500">
                          Ödeme Yöntemi
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          {booking.paymentInfo.paymentMethod}
                        </div>
                      </div>
                    )}
                  </div>

                  {booking.paymentInfo.lastPaymentDate && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Son Ödeme Tarihi
                      </div>
                      <div className="text-gray-900">
                        {new Date(
                          booking.paymentInfo.lastPaymentDate
                        ).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  )}

                  {booking.paymentInfo.refundAmount &&
                    booking.paymentInfo.refundAmount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-500">İade Tutarı</div>
                        <div className="text-red-600 font-medium">
                          ₺
                          {booking.paymentInfo.refundAmount.toLocaleString(
                            "tr-TR"
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Payment Actions */}
                {booking.paymentInfo.paymentStatus !==
                  PaymentStatus.COMPLETED && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedAction("refund");
                        setShowActionModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      İade İşlemi
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Admin Notları
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedAction("add_note");
                      setShowActionModal(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Not Ekle
                  </button>
                </div>

                {booking.adminNotes.length > 0 ? (
                  <div className="space-y-4">
                    {booking.adminNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {note.adminName}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  note.type === "important"
                                    ? "bg-red-100 text-red-800"
                                    : note.type === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {note.type === "important"
                                  ? "Önemli"
                                  : note.type === "warning"
                                  ? "Uyarı"
                                  : "Bilgi"}
                              </span>
                            </div>
                            <p className="text-gray-700">{note.note}</p>
                          </div>
                          <div className="text-sm text-gray-500 ml-4">
                            {new Date(note.createdAt).toLocaleString("tr-TR")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz not eklenmemiş</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  İşlem Geçmişi
                </h3>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          Rezervasyon Oluşturuldu
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.lastModifiedBy && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            Son Güncelleme
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.lastModifiedBy.adminName} tarafından
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(
                              booking.lastModifiedBy.modifiedAt
                            ).toLocaleString("tr-TR")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminModal>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedAction && (
        <AdminModal
          title={`${
            selectedAction === "approve"
              ? "Rezervasyonu Onayla"
              : selectedAction === "reject"
              ? "Rezervasyonu Reddet"
              : selectedAction === "cancel"
              ? "Rezervasyonu İptal Et"
              : selectedAction === "complete"
              ? "Rezervasyonu Tamamla"
              : selectedAction === "add_note"
              ? "Not Ekle"
              : selectedAction === "refund"
              ? "İade İşlemi"
              : "İşlem Onayla"
          }`}
          size="md"
          onClose={() => {
            setShowActionModal(false);
            setSelectedAction(null);
            setActionReason("");
            setNewNote("");
          }}
          actions={[
            {
              label: "İptal",
              variant: "secondary",
              onClick: () => {
                setShowActionModal(false);
                setSelectedAction(null);
                setActionReason("");
                setNewNote("");
              },
            },
            {
              label: "Onayla",
              variant: "primary",
              onClick: handleActionConfirm,
              disabled:
                loading || (selectedAction === "add_note" && !newNote.trim()),
            },
          ]}
        >
          <div className="space-y-4">
            {selectedAction === "add_note" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notunuzu buraya yazın..."
                />
              </div>
            ) : (
              <>
                <p className="text-gray-700">
                  Bu işlemi gerçekleştirmek istediğinizden emin misiniz?
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sebep (Opsiyonel)
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="İşlem sebebini belirtebilirsiniz..."
                  />
                </div>
              </>
            )}
          </div>
        </AdminModal>
      )}
    </>
  );
};
