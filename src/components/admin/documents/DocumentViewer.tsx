import React, { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import {
  AdminDocumentView,
  DocumentVerificationUpdate,
} from "@/types/adminDocument";
import { adminDocumentService } from "@/services/adminPanel/adminDocumentService";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "react-hot-toast";

interface DocumentViewerProps {
  document: AdminDocumentView;
  isOpen: boolean;
  onClose: () => void;
  onVerificationUpdate?: (update: DocumentVerificationUpdate) => void;
}

interface VerificationHistory {
  id: number;
  adminId: number;
  adminName: string;
  action: "approved" | "rejected" | "updated";
  verificationNotes?: string;
  timestamp: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onVerificationUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<
    VerificationHistory[]
  >([]);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationAction, setVerificationAction] = useState<
    "approve" | "reject"
  >("approve");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load verification history when document changes
  useEffect(() => {
    if (document && isOpen) {
      loadVerificationHistory();
    }
  }, [document, isOpen]);

  const loadVerificationHistory = async () => {
    try {
      setIsLoading(true);
      const history = await adminDocumentService.getDocumentVerificationHistory(
        document.id
      );
      setVerificationHistory(history);
    } catch (error) {
      console.error("Failed to load verification history:", error);
      toast.error("Doğrulama geçmişi yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (verificationAction === "reject" && !verificationNotes.trim()) {
      toast.error("Red sebebi belirtilmelidir");
      return;
    }

    try {
      setIsUpdating(true);

      const update: DocumentVerificationUpdate = {
        documentId: document.id,
        isVerified: verificationAction === "approve",
        verificationNotes: verificationNotes.trim() || undefined,
      };

      await adminDocumentService.updateDocumentVerification(update);

      if (onVerificationUpdate) {
        onVerificationUpdate(update);
      }

      toast.success(
        verificationAction === "approve"
          ? "Belge başarıyla onaylandı"
          : "Belge reddedildi"
      );

      setShowVerificationForm(false);
      setVerificationNotes("");
      loadVerificationHistory(); // Reload history
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Doğrulama durumu güncellenirken hata oluştu"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadDocument = () => {
    if (document.documentUrl) {
      window.open(document.documentUrl, "_blank");
    }
  };

  const getStatusBadge = () => {
    if (document.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Onaylanmış
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-4 w-4 mr-1" />
          Beklemede
        </span>
      );
    }
  };

  const getExpiryStatus = () => {
    if (!document.expiryDate) return null;

    if (document.isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Süresi Dolmuş
        </span>
      );
    }

    if (document.isExpiringSoon) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          Yakında Sona Erecek
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        Geçerli
      </span>
    );
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "approved":
        return "Onaylandı";
      case "rejected":
        return "Reddedildi";
      case "updated":
        return "Güncellendi";
      default:
        return action;
    }
  };

  return (
    <AdminModal
      title="Belge Görüntüleyici"
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        {
          label: "İndir",
          variant: "secondary",
          onClick: downloadDocument,
          icon: <DocumentArrowDownIcon className="h-4 w-4" />,
        },
        ...(document.isVerified
          ? []
          : [
              {
                label: "Onayla",
                variant: "primary" as const,
                onClick: () => {
                  setVerificationAction("approve");
                  setShowVerificationForm(true);
                },
              },
              {
                label: "Reddet",
                variant: "danger" as const,
                onClick: () => {
                  setVerificationAction("reject");
                  setShowVerificationForm(true);
                },
              },
            ]),
        {
          label: "Kapat",
          variant: "secondary",
          onClick: onClose,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Document Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {document.documentName}
                </h3>
                <p className="text-sm text-gray-500">
                  {adminDocumentService.getDocumentTypeLabel(
                    document.documentType,
                    document.entityType
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {getExpiryStatus()}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Temel Bilgiler
            </h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Varlık:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {document.entityName} (
                    {document.entityType === "boat" ? "Tekne" : "Tur"})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Sahip:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {document.ownerInfo.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Yüklenme Tarihi:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {format(
                      new Date(document.createdAt),
                      "dd MMMM yyyy HH:mm",
                      { locale: tr }
                    )}
                  </span>
                </div>
              </div>

              {document.expiryDate && (
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Son Kullanma:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {format(new Date(document.expiryDate), "dd MMMM yyyy", {
                        locale: tr,
                      })}
                    </span>
                    {document.daysUntilExpiry !== undefined && (
                      <span className="ml-1 text-xs text-gray-500">
                        (
                        {document.daysUntilExpiry > 0
                          ? `${document.daysUntilExpiry} gün kaldı`
                          : "Süresi dolmuş"}
                        )
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Sahip Bilgileri
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Ad Soyad:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {document.ownerInfo.name}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">
                  E-posta:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {document.ownerInfo.email}
                </span>
              </div>

              {document.ownerInfo.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Telefon:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {document.ownerInfo.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Verification Notes */}
        {document.verificationNotes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Doğrulama Notları
            </h4>
            <p className="text-sm text-gray-700">
              {document.verificationNotes}
            </p>
          </div>
        )}

        {/* Document Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">
              Belge Önizleme
            </h4>
            <button
              onClick={downloadDocument}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Tam Boyut Görüntüle
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Belgeyi tam boyut görüntülemek için "Tam Boyut Görüntüle" butonuna
              tıklayın
            </p>
          </div>
        </div>

        {/* Verification History */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            Doğrulama Geçmişi
          </h4>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : verificationHistory.length > 0 ? (
            <div className="space-y-3">
              {verificationHistory.map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.adminName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getActionLabel(entry.action)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(entry.timestamp), "dd MMM yyyy HH:mm", {
                        locale: tr,
                      })}
                    </span>
                  </div>
                  {entry.verificationNotes && (
                    <p className="text-sm text-gray-700 mt-2">
                      {entry.verificationNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Henüz doğrulama geçmişi bulunmuyor
            </p>
          )}
        </div>
      </div>

      {/* Verification Form Modal */}
      {showVerificationForm && (
        <AdminModal
          title={`Belgeyi ${
            verificationAction === "approve" ? "Onayla" : "Reddet"
          }`}
          isOpen={showVerificationForm}
          onClose={() => setShowVerificationForm(false)}
          actions={[
            {
              label: "İptal",
              variant: "secondary",
              onClick: () => setShowVerificationForm(false),
            },
            {
              label: verificationAction === "approve" ? "Onayla" : "Reddet",
              variant: verificationAction === "approve" ? "primary" : "danger",
              onClick: handleVerificationSubmit,
              loading: isUpdating,
            },
          ]}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bu belgeyi{" "}
              {verificationAction === "approve" ? "onaylamak" : "reddetmek"}{" "}
              istediğinizden emin misiniz?
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doğrulama Notları{" "}
                {verificationAction === "reject" && "(Zorunlu)"}
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  verificationAction === "approve"
                    ? "Onay notlarını buraya yazın... (isteğe bağlı)"
                    : "Red sebebini buraya yazın... (zorunlu)"
                }
                required={verificationAction === "reject"}
              />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminModal>
  );
};
