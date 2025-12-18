import React, { useState } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { BulkDocumentOperation } from "@/types/adminDocument";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface BulkDocumentActionsProps {
  selectedDocumentIds: number[];
  onBulkOperation: (operation: BulkDocumentOperation) => void;
  onClearSelection: () => void;
  isOperating?: boolean;
}

export const BulkDocumentActions: React.FC<BulkDocumentActionsProps> = ({
  selectedDocumentIds,
  onBulkOperation,
  onClearSelection,
  isOperating = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [operationType, setOperationType] = useState<
    "approve" | "reject" | "delete"
  >("approve");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadReason, setReuploadReason] = useState("");
  const [reuploadDeadline, setReuploadDeadline] = useState("");

  const handleBulkAction = (action: "approve" | "reject" | "delete") => {
    setOperationType(action);
    setVerificationNotes("");
    setShowModal(true);
  };

  const handleReuploadRequest = () => {
    setReuploadReason("");
    setReuploadDeadline("");
    setShowReuploadModal(true);
  };

  const executeBulkOperation = () => {
    const operation: BulkDocumentOperation = {
      documentIds: selectedDocumentIds,
      operation: operationType,
      verificationNotes: verificationNotes.trim() || undefined,
    };

    onBulkOperation(operation);
    setShowModal(false);
    setVerificationNotes("");
  };

  const executeReuploadRequest = () => {
    // This would be handled by a separate service method
    // For now, we'll just close the modal
    setShowReuploadModal(false);
    setReuploadReason("");
    setReuploadDeadline("");
  };

  const getModalTitle = () => {
    switch (operationType) {
      case "approve":
        return "Toplu Onaylama";
      case "reject":
        return "Toplu Reddetme";
      case "delete":
        return "Toplu Silme";
      default:
        return "Toplu İşlem";
    }
  };

  const getModalDescription = () => {
    const count = selectedDocumentIds.length;
    switch (operationType) {
      case "approve":
        return `${count} belge onaylanacak. Bu işlem geri alınabilir.`;
      case "reject":
        return `${count} belge reddedilecek. Bu işlem geri alınabilir.`;
      case "delete":
        return `${count} belge kalıcı olarak silinecek. Bu işlem geri alınamaz!`;
      default:
        return "";
    }
  };

  const getActionButtonColor = () => {
    switch (operationType) {
      case "approve":
        return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
      case "reject":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "delete":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      default:
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    }
  };

  if (selectedDocumentIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedDocumentIds.length} belge seçildi
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction("approve")}
              disabled={isOperating}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Toplu Onayla
            </button>

            <button
              onClick={() => handleBulkAction("reject")}
              disabled={isOperating}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              Toplu Reddet
            </button>

            <button
              onClick={handleReuploadRequest}
              disabled={isOperating}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Yeniden Yükleme Talep Et
            </button>

            <button
              onClick={() => handleBulkAction("delete")}
              disabled={isOperating}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Toplu Sil
            </button>

            <button
              onClick={onClearSelection}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Seçimi Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Operation Modal */}
      <AdminModal
        title={getModalTitle()}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        actions={[
          {
            label: "İptal",
            variant: "secondary",
            onClick: () => setShowModal(false),
          },
          {
            label: "Onayla",
            variant: operationType === "delete" ? "danger" : "primary",
            onClick: executeBulkOperation,
            loading: isOperating,
            disabled: operationType === "reject" && !verificationNotes.trim(),
          },
        ]}
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon
              className={`h-6 w-6 mt-0.5 ${
                operationType === "delete" ? "text-red-500" : "text-yellow-500"
              }`}
            />
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {getModalDescription()}
              </p>
              {operationType === "delete" && (
                <p className="text-sm text-red-600 mt-1">
                  Dikkat: Bu işlem geri alınamaz!
                </p>
              )}
            </div>
          </div>

          {(operationType === "approve" || operationType === "reject") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doğrulama Notları
                {operationType === "reject" && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  operationType === "approve"
                    ? "Onay notlarını buraya yazın... (isteğe bağlı)"
                    : "Red sebebini buraya yazın... (zorunlu)"
                }
                required={operationType === "reject"}
              />
              {operationType === "reject" && !verificationNotes.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  Red işlemi için sebep belirtilmelidir
                </p>
              )}
            </div>
          )}
        </div>
      </AdminModal>

      {/* Reupload Request Modal */}
      <AdminModal
        title="Yeniden Yükleme Talebi"
        isOpen={showReuploadModal}
        onClose={() => setShowReuploadModal(false)}
        actions={[
          {
            label: "İptal",
            variant: "secondary",
            onClick: () => setShowReuploadModal(false),
          },
          {
            label: "Talep Gönder",
            variant: "primary",
            onClick: executeReuploadRequest,
            disabled: !reuploadReason.trim(),
            icon: <EnvelopeIcon className="h-4 w-4" />,
          },
        ]}
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <ArrowPathIcon className="h-6 w-6 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {selectedDocumentIds.length} belge için yeniden yükleme talebi
                gönderilecek.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Belge sahiplerine otomatik bildirim gönderilecektir.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeniden Yükleme Sebebi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reuploadReason}
              onChange={(e) => setReuploadReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Yeniden yükleme sebebini buraya yazın..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Son Tarih (İsteğe Bağlı)
            </label>
            <input
              type="date"
              value={reuploadDeadline}
              onChange={(e) => setReuploadDeadline(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Belirtilmezse 30 gün süre verilecektir
            </p>
          </div>
        </div>
      </AdminModal>
    </>
  );
};
