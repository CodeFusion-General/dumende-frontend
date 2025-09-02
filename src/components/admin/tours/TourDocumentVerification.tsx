import React, { useState } from "react";
import {
  TourDocumentDTO,
  TOUR_DOCUMENT_TYPE_LABELS,
} from "@/types/document.types";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { DynamicForm } from "@/components/admin/ui/DynamicForm";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,
  ZoomIn,
  RotateCw,
  MessageSquare,
  Clock,
  Shield,
  User,
} from "lucide-react";

interface TourDocumentVerificationProps {
  documents: TourDocumentDTO[];
  onVerifyDocument: (
    documentId: number,
    status: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;
  onBulkVerify: (
    documentIds: number[],
    status: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;
  loading?: boolean;
}

interface DocumentVerificationModalData {
  document: TourDocumentDTO;
  action: "verify" | "reject";
}

const TourDocumentVerification: React.FC<TourDocumentVerificationProps> = ({
  documents,
  onVerifyDocument,
  onBulkVerify,
  loading = false,
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [verificationData, setVerificationData] =
    useState<DocumentVerificationModalData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"verify" | "reject">("verify");

  // Form schemas
  const verificationFormSchema = {
    fields: [
      {
        name: "reason",
        label: "Doğrulama Notu",
        type: "textarea",
        placeholder: "Doğrulama ile ilgili notlarınızı yazın...",
        validation: { maxLength: 500 },
      },
      {
        name: "expiryDateCheck",
        label: "Son Kullanma Tarihi Kontrolü",
        type: "boolean",
        defaultValue: true,
      },
    ],
  };

  const rejectionFormSchema = {
    fields: [
      {
        name: "reason",
        label: "Red Sebebi",
        type: "select",
        required: true,
        options: [
          { value: "invalid_document", label: "Geçersiz Belge" },
          { value: "expired", label: "Süresi Dolmuş" },
          { value: "poor_quality", label: "Kalitesiz Görüntü" },
          { value: "incomplete_info", label: "Eksik Bilgiler" },
          { value: "wrong_type", label: "Yanlış Belge Türü" },
          { value: "fraudulent", label: "Sahte Belge Şüphesi" },
          { value: "other", label: "Diğer" },
        ],
      },
      {
        name: "note",
        label: "Detaylı Açıklama",
        type: "textarea",
        required: true,
        placeholder: "Red sebebini detaylı olarak açıklayın...",
        validation: { minLength: 10, maxLength: 1000 },
      },
    ],
  };

  const bulkVerificationFormSchema = {
    fields: [
      {
        name: "reason",
        label: bulkAction === "verify" ? "Toplu Onay Notu" : "Toplu Red Sebebi",
        type: bulkAction === "verify" ? "textarea" : "select",
        required: bulkAction === "reject",
        options:
          bulkAction === "reject"
            ? [
                { value: "invalid_document", label: "Geçersiz Belge" },
                { value: "expired", label: "Süresi Dolmuş" },
                { value: "poor_quality", label: "Kalitesiz Görüntü" },
                { value: "incomplete_info", label: "Eksik Bilgiler" },
                { value: "wrong_type", label: "Yanlış Belge Türü" },
                { value: "fraudulent", label: "Sahte Belge Şüphesi" },
                { value: "other", label: "Diğer" },
              ]
            : undefined,
        placeholder:
          bulkAction === "verify"
            ? "Toplu onay ile ilgili notlarınızı yazın..."
            : undefined,
        validation: { maxLength: 1000 },
      },
      ...(bulkAction === "reject"
        ? [
            {
              name: "note",
              label: "Detaylı Açıklama",
              type: "textarea",
              required: true,
              placeholder: "Red sebebini detaylı olarak açıklayın...",
              validation: { minLength: 10, maxLength: 1000 },
            },
          ]
        : []),
    ],
  };

  // Event handlers
  const handleDocumentSelect = (documentId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((doc) => doc.id));
    }
  };

  const handleVerifyDocument = (document: TourDocumentDTO) => {
    setVerificationData({ document, action: "verify" });
    setShowVerificationModal(true);
  };

  const handleRejectDocument = (document: TourDocumentDTO) => {
    setVerificationData({ document, action: "reject" });
    setShowVerificationModal(true);
  };

  const handleBulkAction = (action: "verify" | "reject") => {
    if (selectedDocuments.length === 0) return;
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const handleViewDocument = (documentUrl: string) => {
    setSelectedImage(documentUrl);
    setShowImageModal(true);
  };

  const submitVerification = async (formData: any) => {
    if (!verificationData) return;

    try {
      const status =
        verificationData.action === "verify" ? "verified" : "rejected";
      const reason =
        verificationData.action === "verify"
          ? formData.reason
          : `${formData.reason}: ${formData.note || ""}`;

      await onVerifyDocument(verificationData.document.id, status, reason);
      setShowVerificationModal(false);
      setVerificationData(null);
    } catch (error) {
      console.error("Error verifying document:", error);
    }
  };

  const submitBulkVerification = async (formData: any) => {
    try {
      const status = bulkAction === "verify" ? "verified" : "rejected";
      const reason =
        bulkAction === "verify"
          ? formData.reason
          : `${formData.reason}: ${formData.note || ""}`;

      await onBulkVerify(selectedDocuments, status, reason);
      setShowBulkModal(false);
      setSelectedDocuments([]);
    } catch (error) {
      console.error("Error bulk verifying documents:", error);
    }
  };

  // Helper functions
  const getDocumentStatusBadge = (document: TourDocumentDTO) => {
    const isExpired =
      document.expiryDate && new Date(document.expiryDate) < new Date();
    const isExpiringSoon =
      document.expiryDate &&
      new Date(document.expiryDate) <
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Süresi Dolmuş
        </span>
      );
    }

    if (isExpiringSoon) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Yakında Dolacak
        </span>
      );
    }

    if (document.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Doğrulandı
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Beklemede
      </span>
    );
  };

  const getDocumentTypeLabel = (documentType: string) => {
    return TOUR_DOCUMENT_TYPE_LABELS[documentType]?.tr || documentType;
  };

  const getVerificationStats = () => {
    const total = documents.length;
    const verified = documents.filter((doc) => doc.isVerified).length;
    const expired = documents.filter(
      (doc) => doc.expiryDate && new Date(doc.expiryDate) < new Date()
    ).length;
    const expiringSoon = documents.filter(
      (doc) =>
        doc.expiryDate &&
        new Date(doc.expiryDate) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
        new Date(doc.expiryDate) >= new Date()
    ).length;

    return {
      total,
      verified,
      expired,
      expiringSoon,
      pending: total - verified,
    };
  };

  const stats = getVerificationStats();

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">
          Belge Doğrulama Özeti
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Toplam</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.verified}
            </div>
            <div className="text-sm text-gray-600">Doğrulandı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.expiringSoon}
            </div>
            <div className="text-sm text-gray-600">Yakında Dolacak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.expired}
            </div>
            <div className="text-sm text-gray-600">Süresi Dolmuş</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {documents.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedDocuments.length === documents.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Tümünü Seç ({selectedDocuments.length}/{documents.length})
              </span>
            </label>
          </div>

          {selectedDocuments.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("verify")}
                disabled={loading}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Toplu Onayla ({selectedDocuments.length})
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                disabled={loading}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Toplu Reddet ({selectedDocuments.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz belge eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => handleDocumentSelect(document.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {getDocumentTypeLabel(document.documentType)}
                      </h4>
                      {getDocumentStatusBadge(document)}
                    </div>

                    {document.documentName && (
                      <p className="text-sm text-gray-600 mb-1">
                        Dosya: {document.documentName}
                      </p>
                    )}

                    {document.expiryDate && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Son kullanma:{" "}
                        {new Date(document.expiryDate).toLocaleDateString(
                          "tr-TR"
                        )}
                      </div>
                    )}

                    {document.verificationNotes && (
                      <div className="flex items-start text-sm text-gray-600 mt-2">
                        <MessageSquare className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{document.verificationNotes}</span>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Yüklendi:{" "}
                      {new Date(document.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDocument(document.documentUrl)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Belgeyi Görüntüle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => window.open(document.documentUrl, "_blank")}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!document.isVerified && (
                    <>
                      <button
                        onClick={() => handleVerifyDocument(document)}
                        disabled={loading}
                        className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                        title="Onayla"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRejectDocument(document)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                        title="Reddet"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && verificationData && (
        <AdminModal
          title={`Belgeyi ${
            verificationData.action === "verify" ? "Onayla" : "Reddet"
          }`}
          size="md"
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationData(null);
          }}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {getDocumentTypeLabel(verificationData.document.documentType)}
              </h4>
              <p className="text-sm text-gray-600">
                {verificationData.document.documentName}
              </p>
              {verificationData.document.expiryDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Son kullanma:{" "}
                  {new Date(
                    verificationData.document.expiryDate
                  ).toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>

            <DynamicForm
              schema={
                verificationData.action === "verify"
                  ? verificationFormSchema
                  : rejectionFormSchema
              }
              onSubmit={submitVerification}
              loading={loading}
            />
          </div>
        </AdminModal>
      )}

      {/* Bulk Verification Modal */}
      {showBulkModal && (
        <AdminModal
          title={`Toplu ${bulkAction === "verify" ? "Onay" : "Red"}`}
          size="md"
          onClose={() => setShowBulkModal(false)}
        >
          <div className="space-y-4">
            <div
              className={`border rounded-md p-4 ${
                bulkAction === "verify"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex">
                {bulkAction === "verify" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      bulkAction === "verify"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    Toplu {bulkAction === "verify" ? "Onay" : "Red"}
                  </h3>
                  <div
                    className={`mt-2 text-sm ${
                      bulkAction === "verify"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {selectedDocuments.length} belge{" "}
                    {bulkAction === "verify" ? "onaylanacak" : "reddedilecek"}.
                  </div>
                </div>
              </div>
            </div>

            <DynamicForm
              schema={bulkVerificationFormSchema}
              onSubmit={submitBulkVerification}
              loading={loading}
            />
          </div>
        </AdminModal>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && selectedImage && (
        <AdminModal
          title="Belge Görüntüleyici"
          size="full"
          onClose={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="max-w-4xl max-h-full overflow-auto">
              <img
                src={selectedImage}
                alt="Document"
                className="max-w-full h-auto"
              />
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => window.open(selectedImage, "_blank")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Tam Boyut
              </button>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = selectedImage;
                  link.download = "document";
                  link.click();
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                İndir
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default TourDocumentVerification;
