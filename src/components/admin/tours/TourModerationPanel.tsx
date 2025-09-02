import React, { useState } from "react";
import {
  AdminTourView,
  TourApprovalRequest,
  AdminTourNote,
} from "@/types/adminTour";
import { TourDocumentDTO } from "@/types/document.types";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { DynamicForm } from "@/components/admin/ui/DynamicForm";
import TourDocumentVerification from "./TourDocumentVerification";
import {
  CheckCircle,
  XCircle,
  Pause,
  Play,
  AlertTriangle,
  FileText,
  Eye,
  MessageSquare,
  Flag,
  Star,
  Clock,
  User,
  Shield,
  Edit3,
} from "lucide-react";

interface TourModerationPanelProps {
  tour: AdminTourView;
  onApprove: (request: TourApprovalRequest) => Promise<void>;
  onReject: (request: TourApprovalRequest) => Promise<void>;
  onSuspend: (tourId: number, reason: string) => Promise<void>;
  onActivate: (tourId: number, note?: string) => Promise<void>;
  onAddNote: (
    tourId: number,
    note: Omit<
      AdminTourNote,
      "id" | "adminId" | "adminName" | "createdAt" | "isVisible"
    >
  ) => Promise<void>;
  loading?: boolean;
}

const TourModerationPanel: React.FC<TourModerationPanelProps> = ({
  tour,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onAddNote,
  loading = false,
}) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDocumentVerification, setShowDocumentVerification] =
    useState(false);

  // Form schemas
  const approvalFormSchema = {
    fields: [
      {
        name: "note",
        label: "Onay Notu",
        type: "textarea",
        placeholder: "Onay ile ilgili notlarınızı yazın...",
        validation: { maxLength: 500 },
      },
      {
        name: "verifyDocuments",
        label: "Belgeleri Doğrula",
        type: "boolean",
        defaultValue: true,
      },
      {
        name: "sendNotification",
        label: "Rehbere Bildirim Gönder",
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
          { value: "incomplete_info", label: "Eksik Bilgiler" },
          { value: "inappropriate_content", label: "Uygunsuz İçerik" },
          { value: "invalid_documents", label: "Geçersiz Belgeler" },
          { value: "policy_violation", label: "Politika İhlali" },
          { value: "safety_concerns", label: "Güvenlik Endişeleri" },
          { value: "duplicate_tour", label: "Tekrar Eden Tur" },
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
      {
        name: "sendNotification",
        label: "Rehbere Bildirim Gönder",
        type: "boolean",
        defaultValue: true,
      },
      {
        name: "allowResubmission",
        label: "Yeniden Başvuru İzni Ver",
        type: "boolean",
        defaultValue: true,
      },
    ],
  };

  const suspensionFormSchema = {
    fields: [
      {
        name: "reason",
        label: "Askıya Alma Sebebi",
        type: "select",
        required: true,
        options: [
          { value: "policy_violation", label: "Politika İhlali" },
          { value: "safety_issues", label: "Güvenlik Sorunları" },
          { value: "customer_complaints", label: "Müşteri Şikayetleri" },
          { value: "document_issues", label: "Belge Sorunları" },
          { value: "quality_issues", label: "Kalite Sorunları" },
          { value: "investigation", label: "Soruşturma" },
          { value: "other", label: "Diğer" },
        ],
      },
      {
        name: "note",
        label: "Detaylı Açıklama",
        type: "textarea",
        required: true,
        placeholder: "Askıya alma sebebini detaylı olarak açıklayın...",
        validation: { minLength: 10, maxLength: 1000 },
      },
      {
        name: "duration",
        label: "Askıya Alma Süresi",
        type: "select",
        options: [
          { value: "temporary", label: "Geçici (İnceleme Süresince)" },
          { value: "7_days", label: "7 Gün" },
          { value: "30_days", label: "30 Gün" },
          { value: "90_days", label: "90 Gün" },
          { value: "indefinite", label: "Belirsiz" },
        ],
      },
      {
        name: "sendNotification",
        label: "Rehbere Bildirim Gönder",
        type: "boolean",
        defaultValue: true,
      },
    ],
  };

  const noteFormSchema = {
    fields: [
      {
        name: "type",
        label: "Not Türü",
        type: "select",
        required: true,
        options: [
          { value: "info", label: "Bilgi" },
          { value: "warning", label: "Uyarı" },
          { value: "important", label: "Önemli" },
        ],
      },
      {
        name: "note",
        label: "Not",
        type: "textarea",
        required: true,
        placeholder: "Notunuzu yazın...",
        validation: { minLength: 5, maxLength: 1000 },
      },
      {
        name: "isVisible",
        label: "Rehber Tarafından Görülebilir",
        type: "boolean",
        defaultValue: false,
      },
    ],
  };

  // Event handlers
  const handleApprove = async (formData: any) => {
    try {
      const request: TourApprovalRequest = {
        tourId: tour.id,
        action: "approve",
        note: formData.note,
        documentVerifications: formData.verifyDocuments
          ? tour.tourDocuments.map((doc) => ({
              documentId: doc.id,
              status: "verified" as const,
              verifiedBy: 1, // Would get from auth context
              verifiedAt: new Date().toISOString(),
            }))
          : undefined,
      };

      await onApprove(request);
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error approving tour:", error);
    }
  };

  const handleReject = async (formData: any) => {
    try {
      const request: TourApprovalRequest = {
        tourId: tour.id,
        action: "reject",
        reason: formData.reason,
        note: formData.note,
      };

      await onReject(request);
      setShowRejectionModal(false);
    } catch (error) {
      console.error("Error rejecting tour:", error);
    }
  };

  const handleSuspend = async (formData: any) => {
    try {
      const reason = `${formData.reason}: ${formData.note}`;
      await onSuspend(tour.id, reason);
      setShowSuspensionModal(false);
    } catch (error) {
      console.error("Error suspending tour:", error);
    }
  };

  const handleActivate = async () => {
    try {
      await onActivate(tour.id, "Tur admin tarafından aktifleştirildi");
    } catch (error) {
      console.error("Error activating tour:", error);
    }
  };

  const handleAddNote = async (formData: any) => {
    try {
      await onAddNote(tour.id, {
        note: formData.note,
        type: formData.type,
        isVisible: formData.isVisible,
      });
      setShowNoteModal(false);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Content analysis
  const analyzeContent = () => {
    const issues = [];

    // Check for inappropriate content keywords
    const inappropriateKeywords = [
      "alkol",
      "sigara",
      "kumar",
      "yasal olmayan",
      "tehlikeli",
      "güvensiz",
      "lisanssız",
      "kaçak",
    ];

    const contentToCheck = `${tour.name} ${tour.description} ${
      tour.fullDescription || ""
    }`.toLowerCase();

    inappropriateKeywords.forEach((keyword) => {
      if (contentToCheck.includes(keyword)) {
        issues.push(`Uygunsuz içerik: "${keyword}" kelimesi tespit edildi`);
      }
    });

    // Check for missing information
    if (!tour.fullDescription || tour.fullDescription.length < 50) {
      issues.push("Detaylı açıklama eksik veya çok kısa");
    }

    if (!tour.tourImages || tour.tourImages.length === 0) {
      issues.push("Tur resmi bulunmuyor");
    }

    if (!tour.tourDates || tour.tourDates.length === 0) {
      issues.push("Tur tarihi belirtilmemiş");
    }

    // Check pricing
    if (tour.price <= 0) {
      issues.push("Geçersiz fiyat bilgisi");
    }

    return issues;
  };

  // Risk assessment
  const getRiskLevel = () => {
    let riskScore = 0;
    const contentIssues = analyzeContent();

    // Document issues
    if (tour.documentStatus.expired > 0) riskScore += 3;
    if (tour.documentStatus.pending > 0) riskScore += 2;

    // Content issues
    riskScore += contentIssues.length;

    // Reports
    if (tour.reportCount > 0) riskScore += tour.reportCount * 2;

    // Guide verification
    if (!tour.guideInfo.isVerified) riskScore += 2;
    if (!tour.guideInfo.isCertified) riskScore += 1;

    // Activity
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(tour.lastActivity).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastActivity > 30) riskScore += 1;

    // Low booking rate
    if (
      tour.bookingStats.totalBookings === 0 &&
      Math.floor(
        (Date.now() - new Date(tour.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      ) > 30
    ) {
      riskScore += 1;
    }

    if (riskScore >= 8)
      return { level: "critical", color: "red", label: "Kritik Risk" };
    if (riskScore >= 5)
      return { level: "high", color: "orange", label: "Yüksek Risk" };
    if (riskScore >= 3)
      return { level: "medium", color: "yellow", label: "Orta Risk" };
    return { level: "low", color: "green", label: "Düşük Risk" };
  };

  const riskAssessment = getRiskLevel();
  const contentIssues = analyzeContent();

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div
        className={`bg-${riskAssessment.color}-50 border border-${riskAssessment.color}-200 rounded-lg p-4`}
      >
        <div className="flex items-center">
          <Shield className={`w-5 h-5 text-${riskAssessment.color}-600 mr-2`} />
          <h3 className={`font-medium text-${riskAssessment.color}-800`}>
            Risk Değerlendirmesi
          </h3>
        </div>
        <p className={`mt-1 text-sm text-${riskAssessment.color}-700`}>
          Bu tur <strong>{riskAssessment.label}</strong> kategorisinde
          değerlendirilmiştir.
        </p>
      </div>

      {/* Content Analysis */}
      {contentIssues.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Flag className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="font-medium text-orange-800">İçerik Kontrolü</h3>
          </div>
          <div className="space-y-2">
            {contentIssues.map((issue, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-orange-700">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Mevcut Durum</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tur Durumu
            </label>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tour.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : tour.status === "INACTIVE"
                  ? "bg-red-100 text-red-800"
                  : tour.status === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {tour.status === "ACTIVE"
                ? "Aktif"
                : tour.status === "INACTIVE"
                ? "Pasif"
                : tour.status === "DRAFT"
                ? "Taslak"
                : "İptal"}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Onay Durumu
            </label>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tour.approvalStatus === "approved"
                  ? "bg-green-100 text-green-800"
                  : tour.approvalStatus === "rejected"
                  ? "bg-red-100 text-red-800"
                  : tour.approvalStatus === "suspended"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {tour.approvalStatus === "approved"
                ? "Onaylandı"
                : tour.approvalStatus === "rejected"
                ? "Reddedildi"
                : tour.approvalStatus === "suspended"
                ? "Askıya Alındı"
                : "Beklemede"}
            </span>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Belge Durumu</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {tour.documentStatus.total}
            </div>
            <div className="text-sm text-gray-600">Toplam</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tour.documentStatus.verified}
            </div>
            <div className="text-sm text-gray-600">Doğrulandı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tour.documentStatus.pending}
            </div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tour.documentStatus.expired}
            </div>
            <div className="text-sm text-gray-600">Süresi Dolmuş</div>
          </div>
        </div>

        {tour.documentStatus.expired > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Dikkat</h3>
                <div className="mt-2 text-sm text-red-700">
                  {tour.documentStatus.expired} belgenin süresi dolmuş. Bu tur
                  onaylanmadan önce belgeler yenilenmelidir.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Rehber Bilgileri</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {tour.guideInfo.name}
              </p>
              <div className="flex items-center mt-1">
                {tour.guideInfo.isVerified && (
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                )}
                {tour.guideInfo.isCertified && (
                  <Star className="w-3 h-3 text-yellow-500 mr-1" />
                )}
                <span className="text-xs text-gray-500">
                  {tour.guideInfo.isVerified ? "Doğrulanmış" : "Doğrulanmamış"}
                  {tour.guideInfo.isCertified && " • Sertifikalı"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {tour.guideInfo.totalTours} tur
            </div>
            <div className="text-xs text-gray-500">
              ⭐ {tour.guideInfo.rating.toFixed(1)} • %
              {tour.guideInfo.responseRate} yanıt
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Moderasyon İşlemleri</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tour.approvalStatus === "pending" && (
            <>
              <button
                onClick={() => setShowApprovalModal(true)}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Onayla
              </button>

              <button
                onClick={() => setShowRejectionModal(true)}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reddet
              </button>
            </>
          )}

          {tour.isActive ? (
            <button
              onClick={() => setShowSuspensionModal(true)}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              <Pause className="w-4 h-4 mr-2" />
              Askıya Al
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Aktifleştir
            </button>
          )}

          <button
            onClick={() => setShowNoteModal(true)}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Not Ekle
          </button>

          <button
            onClick={() => setShowDocumentVerification(true)}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Belgeleri İncele
            {tour.documentStatus.pending > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                {tour.documentStatus.pending}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Recent Notes */}
      {tour.moderationNotes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Son Notlar</h3>
          <div className="space-y-3">
            {tour.moderationNotes.slice(0, 3).map((note) => (
              <div key={note.id} className="bg-white rounded-md p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {note.adminName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{note.note}</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    note.type === "info"
                      ? "bg-blue-100 text-blue-800"
                      : note.type === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {note.type === "info"
                    ? "Bilgi"
                    : note.type === "warning"
                    ? "Uyarı"
                    : "Önemli"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showApprovalModal && (
        <AdminModal
          title="Turu Onayla"
          size="md"
          onClose={() => setShowApprovalModal(false)}
        >
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Tur Onayı
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    Bu turu onayladığınızda, tur aktif hale gelecek ve
                    rezervasyon alabilecektir.
                  </div>
                </div>
              </div>
            </div>

            <DynamicForm
              schema={approvalFormSchema}
              onSubmit={handleApprove}
              loading={loading}
            />
          </div>
        </AdminModal>
      )}

      {showRejectionModal && (
        <AdminModal
          title="Turu Reddet"
          size="md"
          onClose={() => setShowRejectionModal(false)}
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Tur Reddi
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    Bu turu reddettiğinizde, tur pasif hale gelecek ve rehbere
                    bildirim gönderilecektir.
                  </div>
                </div>
              </div>
            </div>

            <DynamicForm
              schema={rejectionFormSchema}
              onSubmit={handleReject}
              loading={loading}
            />
          </div>
        </AdminModal>
      )}

      {showSuspensionModal && (
        <AdminModal
          title="Turu Askıya Al"
          size="md"
          onClose={() => setShowSuspensionModal(false)}
        >
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex">
                <Pause className="h-5 w-5 text-orange-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Tur Askıya Alma
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    Bu turu askıya aldığınızda, tur geçici olarak pasif hale
                    gelecek ve yeni rezervasyon alamayacaktır.
                  </div>
                </div>
              </div>
            </div>

            <DynamicForm
              schema={suspensionFormSchema}
              onSubmit={handleSuspend}
              loading={loading}
            />
          </div>
        </AdminModal>
      )}

      {showNoteModal && (
        <AdminModal
          title="Not Ekle"
          size="md"
          onClose={() => setShowNoteModal(false)}
        >
          <DynamicForm
            schema={noteFormSchema}
            onSubmit={handleAddNote}
            loading={loading}
          />
        </AdminModal>
      )}

      {showDocumentVerification && (
        <AdminModal
          title="Belge Doğrulama"
          size="xl"
          onClose={() => setShowDocumentVerification(false)}
        >
          <TourDocumentVerification
            documents={tour.tourDocuments || []}
            onVerifyDocument={async (documentId, status, reason) => {
              // This would be handled by the parent component
              console.log("Document verification:", {
                documentId,
                status,
                reason,
              });
            }}
            onBulkVerify={async (documentIds, status, reason) => {
              // This would be handled by the parent component
              console.log("Bulk document verification:", {
                documentIds,
                status,
                reason,
              });
            }}
            loading={loading}
          />
        </AdminModal>
      )}
    </div>
  );
};

export default TourModerationPanel;
