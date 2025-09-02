import React, { useState } from "react";
import {
  AdminDocumentView,
  DocumentVerificationUpdate,
} from "@/types/adminDocument";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface DocumentVerificationPanelProps {
  document: AdminDocumentView;
  onVerificationUpdate: (update: DocumentVerificationUpdate) => void;
  isUpdating?: boolean;
}

export const DocumentVerificationPanel: React.FC<
  DocumentVerificationPanelProps
> = ({ document, onVerificationUpdate, isUpdating = false }) => {
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState(
    document.verificationNotes || ""
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | "update">(
    "approve"
  );

  const handleVerificationAction = (action: "approve" | "reject") => {
    setActionType(action);
    setShowNotesForm(true);
  };

  const handleUpdateNotes = () => {
    setActionType("update");
    setShowNotesForm(true);
  };

  const submitVerification = () => {
    if (actionType === "reject" && !verificationNotes.trim()) {
      alert("Red sebebi belirtilmelidir");
      return;
    }

    const update: DocumentVerificationUpdate = {
      documentId: document.id,
      isVerified:
        actionType === "approve" ||
        (actionType === "update" && document.isVerified),
      verificationNotes: verificationNotes.trim() || undefined,
    };

    onVerificationUpdate(update);
    setShowNotesForm(false);
  };

  const getStatusDisplay = () => {
    if (document.isVerified) {
      return (
        <div className="flex items-center space-x-2 text-green-700">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-medium">Onaylanmış</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-yellow-700">
          <ClockIcon className="h-5 w-5" />
          <span className="font-medium">Beklemede</span>
        </div>
      );
    }
  };

  const getExpiryWarning = () => {
    if (!document.expiryDate) return null;

    if (document.isExpired) {
      return (
        <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-2 rounded-md">
          <XCircleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            Bu belgenin süresi{" "}
            {format(new Date(document.expiryDate), "dd MMMM yyyy", {
              locale: tr,
            })}{" "}
            tarihinde dolmuş
          </span>
        </div>
      );
    }

    if (document.isExpiringSoon) {
      return (
        <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-2 rounded-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            Bu belgenin süresi {document.daysUntilExpiry} gün içinde dolacak (
            {format(new Date(document.expiryDate), "dd MMMM yyyy", {
              locale: tr,
            })}
            )
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Doğrulama Durumu</h3>
        {getStatusDisplay()}
      </div>

      {/* Expiry Warning */}
      {getExpiryWarning()}

      {/* Current Verification Notes */}
      {document.verificationNotes && (
        <div className="bg-gray-50 rounded-md p-3">
          <div className="flex items-center space-x-2 mb-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Doğrulama Notları
            </span>
          </div>
          <p className="text-sm text-gray-600">{document.verificationNotes}</p>
        </div>
      )}

      {/* Verification Actions */}
      {!showNotesForm && (
        <div className="flex items-center space-x-3">
          {!document.isVerified ? (
            <>
              <button
                onClick={() => handleVerificationAction("approve")}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Onayla
              </button>
              <button
                onClick={() => handleVerificationAction("reject")}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Reddet
              </button>
            </>
          ) : (
            <button
              onClick={() => handleVerificationAction("reject")}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Onayı Geri Al
            </button>
          )}

          <button
            onClick={handleUpdateNotes}
            disabled={isUpdating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            Notları Güncelle
          </button>
        </div>
      )}

      {/* Notes Form */}
      {showNotesForm && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doğrulama Notları
              {actionType === "reject" && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                actionType === "approve"
                  ? "Onay notlarını buraya yazın... (isteğe bağlı)"
                  : actionType === "reject"
                  ? "Red sebebini buraya yazın... (zorunlu)"
                  : "Güncellenmiş notları buraya yazın..."
              }
              required={actionType === "reject"}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={submitVerification}
              disabled={
                isUpdating ||
                (actionType === "reject" && !verificationNotes.trim())
              }
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  : actionType === "reject"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : actionType === "approve" ? (
                <CheckCircleIcon className="h-4 w-4 mr-2" />
              ) : actionType === "reject" ? (
                <XCircleIcon className="h-4 w-4 mr-2" />
              ) : (
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              )}
              {actionType === "approve"
                ? "Onayla"
                : actionType === "reject"
                ? "Reddet"
                : "Güncelle"}
            </button>

            <button
              onClick={() => {
                setShowNotesForm(false);
                setVerificationNotes(document.verificationNotes || "");
              }}
              disabled={isUpdating}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Document Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>
          Son güncelleme:{" "}
          {format(new Date(document.updatedAt), "dd MMMM yyyy HH:mm", {
            locale: tr,
          })}
        </div>
        <div>
          Yüklenme tarihi:{" "}
          {format(new Date(document.createdAt), "dd MMMM yyyy HH:mm", {
            locale: tr,
          })}
        </div>
      </div>
    </div>
  );
};
