import { BaseService } from "../base/BaseService";
import { boatService } from "../boatService";
import {
  AdminDocumentView,
  AdminDocumentFilter,
  AdminDocumentSort,
  AdminDocumentListResponse,
  AdminDocumentStats,
  DocumentVerificationUpdate,
  BulkDocumentOperation,
  DocumentTypeConfig,
  DocumentReuploadRequest,
} from "@/types/adminDocument";
import {
  BoatDocumentDTO,
  TourDocumentDTO,
  BoatDocumentType,
  TourDocumentType,
} from "@/types/document.types";

/**
 * AdminDocumentService - Admin panel için doküman yönetimi servisi
 * 
 * NOT: Backend'de /api/admin/documents endpoint'i henüz mevcut değil.
 * Bu servis geçici olarak mevcut boat/tour endpoint'lerini kullanarak çalışıyor.
 * Backend endpoint'i oluşturulduğunda bu servis güncellenecek.
 */
class AdminDocumentService extends BaseService {
  constructor() {
    // TODO: Backend'de /api/admin/documents endpoint'i oluşturulduğunda değiştirilecek
    super("/boats"); // Geçici olarak boats endpoint'ini kullanıyoruz
  }

  /**
   * Get all documents with admin view and filtering
   * Geçici implementasyon: Tüm teknelerden dokümanları toplar
   */
  async getAllDocuments(
    filter?: AdminDocumentFilter,
    sort?: AdminDocumentSort,
    page: number = 1,
    limit: number = 20
  ): Promise<AdminDocumentListResponse> {
    try {
      // Geçici: Tüm teknelerden dokümanları topla
      const boats = await boatService.getBoats();
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      // Tüm dokümanları AdminDocumentView formatına dönüştür
      let allDocuments: AdminDocumentView[] = boats.flatMap((boat) =>
        (boat.documents || []).map((doc) => {
          const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
          const isExpired = expiryDate ? expiryDate < now : false;
          const isExpiringSoon = expiryDate
            ? expiryDate > now && expiryDate <= thirtyDaysFromNow
            : false;

          return {
            id: doc.id,
            documentName: doc.documentName,
            documentType: doc.documentType,
            entityType: "boat" as const,
            entityId: boat.id,
            entityName: boat.name,
            ownerInfo: {
              id: boat.ownerId,
              name: boat.ownerName || "Bilinmiyor",
              email: "",
              phone: "",
            },
            filePath: doc.filePath,
            documentUrl: doc.documentUrl,
            expiryDate: doc.expiryDate,
            isVerified: doc.isVerified,
            verificationNotes: doc.verificationNotes,
            displayOrder: doc.displayOrder,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            isExpired,
            isExpiringSoon,
            daysUntilExpiry: expiryDate
              ? Math.ceil(
                  (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                )
              : undefined,
          };
        })
      );

      // Filtreleme uygula
      if (filter) {
        if (filter.entityType) {
          allDocuments = allDocuments.filter(
            (d) => d.entityType === filter.entityType
          );
        }
        if (filter.documentType) {
          allDocuments = allDocuments.filter(
            (d) => d.documentType === filter.documentType
          );
        }
        if (filter.verificationStatus) {
          if (filter.verificationStatus === "verified") {
            allDocuments = allDocuments.filter((d) => d.isVerified);
          } else if (filter.verificationStatus === "pending") {
            allDocuments = allDocuments.filter((d) => !d.isVerified);
          }
        }
        if (filter.expiryStatus) {
          if (filter.expiryStatus === "expired") {
            allDocuments = allDocuments.filter((d) => d.isExpired);
          } else if (filter.expiryStatus === "expiring_soon") {
            allDocuments = allDocuments.filter((d) => d.isExpiringSoon);
          } else if (filter.expiryStatus === "valid") {
            allDocuments = allDocuments.filter(
              (d) => !d.isExpired && !d.isExpiringSoon
            );
          }
        }
        if (filter.ownerId) {
          allDocuments = allDocuments.filter(
            (d) => d.ownerInfo.id === filter.ownerId
          );
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          allDocuments = allDocuments.filter(
            (d) =>
              d.documentName.toLowerCase().includes(searchLower) ||
              d.entityName.toLowerCase().includes(searchLower)
          );
        }
      }

      // Sıralama uygula
      if (sort) {
        allDocuments.sort((a, b) => {
          const aVal = a[sort.field as keyof AdminDocumentView];
          const bVal = b[sort.field as keyof AdminDocumentView];
          const compare =
            typeof aVal === "string"
              ? aVal.localeCompare(bVal as string)
              : (aVal as number) - (bVal as number);
          return sort.direction === "asc" ? compare : -compare;
        });
      }

      // İstatistikleri hesapla
      const stats: AdminDocumentStats = {
        total: allDocuments.length,
        verified: allDocuments.filter((d) => d.isVerified).length,
        pending: allDocuments.filter((d) => !d.isVerified).length,
        rejected: 0, // Backend'den gelecek
        expired: allDocuments.filter((d) => d.isExpired).length,
        expiringSoon: allDocuments.filter((d) => d.isExpiringSoon).length,
        byType: {
          boat: {
            total: allDocuments.filter((d) => d.entityType === "boat").length,
            verified: allDocuments.filter(
              (d) => d.entityType === "boat" && d.isVerified
            ).length,
            pending: allDocuments.filter(
              (d) => d.entityType === "boat" && !d.isVerified
            ).length,
          },
          tour: {
            total: allDocuments.filter((d) => d.entityType === "tour").length,
            verified: allDocuments.filter(
              (d) => d.entityType === "tour" && d.isVerified
            ).length,
            pending: allDocuments.filter(
              (d) => d.entityType === "tour" && !d.isVerified
            ).length,
          },
        },
        byDocumentType: {},
      };

      // Sayfalama uygula
      const startIndex = (page - 1) * limit;
      const paginatedDocuments = allDocuments.slice(
        startIndex,
        startIndex + limit
      );

      return {
        documents: paginatedDocuments,
        pagination: {
          page,
          limit,
          total: allDocuments.length,
          totalPages: Math.ceil(allDocuments.length / limit),
        },
        stats,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get document statistics for admin dashboard
   * Geçici implementasyon: getAllDocuments'tan istatistikleri döndürür
   */
  async getDocumentStats(): Promise<AdminDocumentStats> {
    try {
      const response = await this.getAllDocuments();
      return response.stats;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get single document with admin view
   * Geçici implementasyon: getAllDocuments'tan filtreleyerek döndürür
   */
  async getDocument(documentId: number): Promise<AdminDocumentView> {
    try {
      const response = await this.getAllDocuments();
      const document = response.documents.find((d) => d.id === documentId);
      if (!document) {
        throw new Error(`Document with id ${documentId} not found`);
      }
      return document;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update document verification status
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async updateDocumentVerification(
    update: DocumentVerificationUpdate
  ): Promise<AdminDocumentView> {
    console.warn(
      "updateDocumentVerification: Backend endpoint henüz mevcut değil",
      update
    );
    // Geçici: Mevcut dokümanı döndür
    return await this.getDocument(update.documentId);
  }

  /**
   * Bulk document operations (approve/reject/delete)
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async bulkDocumentOperation(
    operation: BulkDocumentOperation
  ): Promise<{ success: number; failed: number; errors?: string[] }> {
    console.warn(
      "bulkDocumentOperation: Backend endpoint henüz mevcut değil",
      operation
    );
    return { success: 0, failed: operation.documentIds.length, errors: ["Backend endpoint not available"] };
  }

  /**
   * Request document reupload
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async requestDocumentReupload(
    request: DocumentReuploadRequest
  ): Promise<void> {
    console.warn(
      "requestDocumentReupload: Backend endpoint henüz mevcut değil",
      request
    );
  }

  /**
   * Delete document (admin only)
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async deleteDocument(documentId: number): Promise<void> {
    console.warn(
      "deleteDocument: Backend endpoint henüz mevcut değil",
      documentId
    );
  }

  /**
   * Get documents by entity (boat or tour)
   * Geçici implementasyon: getAllDocuments ile filtreleyerek döndürür
   */
  async getDocumentsByEntity(
    entityType: "boat" | "tour",
    entityId: number
  ): Promise<AdminDocumentView[]> {
    try {
      const response = await this.getAllDocuments({ entityType });
      return response.documents.filter((d) => d.entityId === entityId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get documents by owner
   * Geçici implementasyon: getAllDocuments ile filtreleyerek döndürür
   */
  async getDocumentsByOwner(ownerId: number): Promise<AdminDocumentView[]> {
    try {
      const response = await this.getAllDocuments({ ownerId });
      return response.documents;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get expired documents
   * Geçici implementasyon: getAllDocuments ile filtreleyerek döndürür
   */
  async getExpiredDocuments(): Promise<AdminDocumentView[]> {
    try {
      const response = await this.getAllDocuments({ expiryStatus: "expired" });
      return response.documents;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get documents expiring soon
   * Geçici implementasyon: getAllDocuments ile filtreleyerek döndürür
   */
  async getExpiringSoonDocuments(
    days: number = 30
  ): Promise<AdminDocumentView[]> {
    try {
      const response = await this.getAllDocuments({
        expiryStatus: "expiring_soon",
      });
      // days parametresi şimdilik kullanılmıyor, 30 gün varsayılan
      return response.documents;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get pending verification documents
   * Geçici implementasyon: getAllDocuments ile filtreleyerek döndürür
   */
  async getPendingDocuments(): Promise<AdminDocumentView[]> {
    try {
      const response = await this.getAllDocuments({
        verificationStatus: "pending",
      });
      return response.documents;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get document type configurations
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async getDocumentTypeConfigs(): Promise<DocumentTypeConfig[]> {
    console.warn("getDocumentTypeConfigs: Backend endpoint henüz mevcut değil");
    // Varsayılan konfigürasyonları döndür
    return [];
  }

  /**
   * Update document type configuration
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async updateDocumentTypeConfig(
    config: DocumentTypeConfig
  ): Promise<DocumentTypeConfig> {
    console.warn(
      "updateDocumentTypeConfig: Backend endpoint henüz mevcut değil",
      config
    );
    return config;
  }

  /**
   * Create new document type configuration
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async createDocumentTypeConfig(
    config: Omit<DocumentTypeConfig, "displayOrder">
  ): Promise<DocumentTypeConfig> {
    console.warn(
      "createDocumentTypeConfig: Backend endpoint henüz mevcut değil",
      config
    );
    return { ...config, displayOrder: 0 };
  }

  /**
   * Send expiry notifications
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async sendExpiryNotifications(documentIds: number[]): Promise<void> {
    console.warn(
      "sendExpiryNotifications: Backend endpoint henüz mevcut değil",
      documentIds
    );
  }

  /**
   * Get document verification history
   * TODO: Backend /api/admin/documents endpoint'i oluşturulduğunda aktif edilecek
   */
  async getDocumentVerificationHistory(documentId: number): Promise<
    Array<{
      id: number;
      adminId: number;
      adminName: string;
      action: "approved" | "rejected" | "updated";
      verificationNotes?: string;
      timestamp: string;
    }>
  > {
    console.warn(
      "getDocumentVerificationHistory: Backend endpoint henüz mevcut değil",
      documentId
    );
    return [];
  }

  /**
   * Utility method to get document type label
   */
  getDocumentTypeLabel(
    documentType: BoatDocumentType | TourDocumentType,
    entityType: "boat" | "tour"
  ): string {
    const labels = {
      boat: {
        [BoatDocumentType.LICENSE]: "Gemi Ruhsatı",
        [BoatDocumentType.INSURANCE]: "Sigorta Belgesi",
        [BoatDocumentType.SAFETY_CERTIFICATE]: "Güvenlik Sertifikası",
        [BoatDocumentType.INSPECTION_CERTIFICATE]: "Muayene Belgesi",
        [BoatDocumentType.REGISTRATION_CERTIFICATE]: "Kayıt Belgesi",
        [BoatDocumentType.CAPTAIN_LICENSE]: "Kaptan Belgesi",
        [BoatDocumentType.RADIO_LICENSE]: "Telsiz Ruhsatı",
        [BoatDocumentType.OTHER]: "Diğer",
      },
      tour: {
        [TourDocumentType.GUIDE_LICENSE]: "Rehber Ruhsatı",
        [TourDocumentType.TOUR_PERMIT]: "Tur İzni",
        [TourDocumentType.INSURANCE]: "Sigorta Belgesi",
        [TourDocumentType.SAFETY_CERTIFICATE]: "Güvenlik Sertifikası",
        [TourDocumentType.FIRST_AID_CERTIFICATE]: "İlk Yardım Sertifikası",
        [TourDocumentType.LANGUAGE_CERTIFICATE]: "Dil Sertifikası",
        [TourDocumentType.BUSINESS_LICENSE]: "İş Yeri Ruhsatı",
        [TourDocumentType.TAX_DOCUMENT]: "Vergi Belgesi",
        [TourDocumentType.OTHER]: "Diğer",
      },
    };

    return (
      labels[entityType][
        documentType as keyof (typeof labels)[typeof entityType]
      ] || documentType
    );
  }

  /**
   * Utility method to calculate days until expiry
   */
  calculateDaysUntilExpiry(expiryDate?: string): number | undefined {
    if (!expiryDate) return undefined;

    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Utility method to check if document is expired
   */
  isDocumentExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    const days = this.calculateDaysUntilExpiry(expiryDate);
    return days !== undefined && days < 0;
  }

  /**
   * Utility method to check if document is expiring soon
   */
  isDocumentExpiringSoon(
    expiryDate?: string,
    warningDays: number = 30
  ): boolean {
    if (!expiryDate) return false;
    const days = this.calculateDaysUntilExpiry(expiryDate);
    return days !== undefined && days >= 0 && days <= warningDays;
  }
}

export const adminDocumentService = new AdminDocumentService();
