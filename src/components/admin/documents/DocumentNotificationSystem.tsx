import React, { useState } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { AdminDocumentView } from "@/types/adminDocument";
import { adminDocumentService } from "@/services/adminPanel/adminDocumentService";
import {
  BellIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface DocumentNotificationSystemProps {
  expiredDocuments: AdminDocumentView[];
  expiringSoonDocuments: AdminDocumentView[];
  onRefresh?: () => void;
}

export const DocumentNotificationSystem: React.FC<
  DocumentNotificationSystemProps
> = ({ expiredDocuments, expiringSoonDocuments, onRefresh }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState<
    "expired" | "expiring"
  >("expiring");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isSendingNotifications, setIsSendingNotifications] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const handleSendNotifications = async () => {
    if (selectedDocuments.length === 0) {
      toast.error("Lütfen bildirim gönderilecek belgeleri seçin");
      return;
    }

    try {
      setIsSendingNotifications(true);
      await adminDocumentService.sendExpiryNotifications(selectedDocuments);
      toast.success(
        `${selectedDocuments.length} belge sahibine bildirim gönderildi`
      );
      setShowNotificationModal(false);
      setSelectedDocuments([]);
      setCustomMessage("");
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Bildirimler gönderilirken hata oluştu"
      );
    } finally {
      setIsSendingNotifications(false);
    }
  };

  const openNotificationModal = (type: "expired" | "expiring") => {
    setNotificationType(type);
    setSelectedDocuments([]);
    setCustomMessage("");
    setShowNotificationModal(true);
  };

  const toggleDocumentSelection = (documentId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const selectAllDocuments = () => {
    const documents =
      notificationType === "expired" ? expiredDocuments : expiringSoonDocuments;
    const allIds = documents.map((doc) => doc.id);
    setSelectedDocuments(
      selectedDocuments.length === allIds.length ? [] : allIds
    );
  };

  const getDocumentsToShow = () => {
    return notificationType === "expired"
      ? expiredDocuments
      : expiringSoonDocuments;
  };

  const getNotificationTitle = () => {
    return notificationType === "expired"
      ? "Süresi Dolmuş Belgeler İçin Bildirim"
      : "Süresi Yakında Dolacak Belgeler İçin Bildirim";
  };

  const getDefaultMessage = () => {
    return notificationType === "expired"
      ? "Belgenizin süresi dolmuştur. Lütfen en kısa sürede yeni belgenizi yükleyiniz."
      : "Belgenizin süresi yakında dolacaktır. Lütfen yenileme işlemlerinizi zamanında yapınız.";
  };

  return (
    <div className="space-y-4">
      {/* Notification Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expired Documents */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-900">
                  Süresi Dolmuş Belgeler
                </h3>
                <p className="text-xs text-red-700">
                  {expiredDocuments.length} belge
                </p>
              </div>
            </div>
            {expiredDocuments.length > 0 && (
              <button
                onClick={() => openNotificationModal("expired")}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <BellIcon className="h-3 w-3 mr-1" />
                Bildirim Gönder
              </button>
            )}
          </div>
        </div>

        {/* Expiring Soon Documents */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">
                  Yakında Sona Erecek Belgeler
                </h3>
                <p className="text-xs text-yellow-700">
                  {expiringSoonDocuments.length} belge
                </p>
              </div>
            </div>
            {expiringSoonDocuments.length > 0 && (
              <button
                onClick={() => openNotificationModal("expiring")}
                className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <BellIcon className="h-3 w-3 mr-1" />
                Bildirim Gönder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Hızlı İşlemler
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const allExpiredIds = expiredDocuments.map((doc) => doc.id);
              if (allExpiredIds.length > 0) {
                adminDocumentService
                  .sendExpiryNotifications(allExpiredIds)
                  .then(() => {
                    toast.success(
                      "Tüm süresi dolmuş belgeler için bildirim gönderildi"
                    );
                    if (onRefresh) onRefresh();
                  })
                  .catch(() => {
                    toast.error("Bildirimler gönderilirken hata oluştu");
                  });
              }
            }}
            disabled={expiredDocuments.length === 0}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Tüm Süresi Dolmuş Belgelere Bildirim Gönder
          </button>

          <button
            onClick={() => {
              const allExpiringIds = expiringSoonDocuments.map((doc) => doc.id);
              if (allExpiringIds.length > 0) {
                adminDocumentService
                  .sendExpiryNotifications(allExpiringIds)
                  .then(() => {
                    toast.success(
                      "Tüm yakında sona erecek belgeler için bildirim gönderildi"
                    );
                    if (onRefresh) onRefresh();
                  })
                  .catch(() => {
                    toast.error("Bildirimler gönderilirken hata oluştu");
                  });
              }
            }}
            disabled={expiringSoonDocuments.length === 0}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Tüm Yakında Sona Erecek Belgelere Bildirim Gönder
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      <AdminModal
        title={getNotificationTitle()}
        size="lg"
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        actions={[
          {
            label: "İptal",
            variant: "secondary",
            onClick: () => setShowNotificationModal(false),
          },
          {
            label: `${selectedDocuments.length} Belge Sahibine Bildirim Gönder`,
            variant: "primary",
            onClick: handleSendNotifications,
            loading: isSendingNotifications,
            disabled: selectedDocuments.length === 0,
            icon: <EnvelopeIcon className="h-4 w-4" />,
          },
        ]}
      >
        <div className="space-y-6">
          {/* Document Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Bildirim Gönderilecek Belgeler ({getDocumentsToShow().length})
              </h4>
              <button
                onClick={selectAllDocuments}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedDocuments.length === getDocumentsToShow().length
                  ? "Tümünü Kaldır"
                  : "Tümünü Seç"}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {getDocumentsToShow().map((document) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => toggleDocumentSelection(document.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.documentName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {document.ownerInfo.name} - {document.entityName}
                        </p>
                      </div>
                      <div className="text-right">
                        {document.expiryDate && (
                          <p
                            className={`text-xs ${
                              document.isExpired
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {document.daysUntilExpiry !== undefined &&
                            document.daysUntilExpiry > 0
                              ? `${document.daysUntilExpiry} gün kaldı`
                              : "Süresi dolmuş"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Mesajı
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={getDefaultMessage()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakılırsa varsayılan mesaj gönderilecektir
            </p>
          </div>

          {/* Notification Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Kanalları
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">E-posta</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Uygulama içi bildirim
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  SMS (Premium)
                </span>
              </label>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
