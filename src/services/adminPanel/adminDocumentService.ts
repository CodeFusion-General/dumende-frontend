import { BaseService } from "../base/BaseService";
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

class AdminDocumentService extends BaseService {
  constructor() {
    super("/admin"); // axios baseURL zaten /api - Base path for both boat-documents and tour-documents
  }

  /**
   * Get all documents with admin view and filtering
   */
  async getAllDocuments(
    filter?: AdminDocumentFilter,
    sort?: AdminDocumentSort,
    page: number = 1,
    limit: number = 20
  ): Promise<AdminDocumentListResponse> {
    try {
      const params = new URLSearchParams();

      if (filter) {
        if (filter.entityType) params.append("entityType", filter.entityType);
        if (filter.documentType)
          params.append("documentType", filter.documentType);
        if (filter.verificationStatus)
          params.append("verificationStatus", filter.verificationStatus);
        if (filter.expiryStatus)
          params.append("expiryStatus", filter.expiryStatus);
        if (filter.ownerId) params.append("ownerId", filter.ownerId.toString());
        if (filter.search) params.append("search", filter.search);
        if (filter.dateRange) {
          params.append("startDate", filter.dateRange.start);
          params.append("endDate", filter.dateRange.end);
        }
      }

      if (sort) {
        params.append("sortField", sort.field);
        params.append("sortDirection", sort.direction);
      }

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      return await this.get<AdminDocumentListResponse>(`?${params.toString()}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get document statistics for admin dashboard
   */
  async getDocumentStats(): Promise<AdminDocumentStats> {
    try {
      return await this.get<AdminDocumentStats>("/stats");
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get single document with admin view
   */
  async getDocument(documentId: number): Promise<AdminDocumentView> {
    try {
      return await this.get<AdminDocumentView>(`/${documentId}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update document verification status
   */
  async updateDocumentVerification(
    update: DocumentVerificationUpdate
  ): Promise<AdminDocumentView> {
    try {
      return await this.patch<AdminDocumentView>(
        `/${update.documentId}/verification`,
        {
          isVerified: update.isVerified,
          verificationNotes: update.verificationNotes,
        }
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Bulk document operations (approve/reject/delete)
   */
  async bulkDocumentOperation(
    operation: BulkDocumentOperation
  ): Promise<{ success: number; failed: number; errors?: string[] }> {
    try {
      return await this.post<{
        success: number;
        failed: number;
        errors?: string[];
      }>("/bulk-operation", operation);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Request document reupload
   */
  async requestDocumentReupload(
    request: DocumentReuploadRequest
  ): Promise<void> {
    try {
      await this.post<void>("/reupload-request", request);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete document (admin only)
   */
  async deleteDocument(documentId: number): Promise<void> {
    try {
      await this.delete<void>(`/${documentId}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get documents by entity (boat or tour)
   */
  async getDocumentsByEntity(
    entityType: "boat" | "tour",
    entityId: number
  ): Promise<AdminDocumentView[]> {
    try {
      return await this.get<AdminDocumentView[]>(
        `/entity/${entityType}/${entityId}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get documents by owner
   */
  async getDocumentsByOwner(ownerId: number): Promise<AdminDocumentView[]> {
    try {
      return await this.get<AdminDocumentView[]>(`/owner/${ownerId}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get expired documents
   */
  async getExpiredDocuments(): Promise<AdminDocumentView[]> {
    try {
      return await this.get<AdminDocumentView[]>("/expired");
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get documents expiring soon
   */
  async getExpiringSoonDocuments(
    days: number = 30
  ): Promise<AdminDocumentView[]> {
    try {
      return await this.get<AdminDocumentView[]>(`/expiring-soon?days=${days}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get pending verification documents
   */
  async getPendingDocuments(): Promise<AdminDocumentView[]> {
    try {
      return await this.get<AdminDocumentView[]>("/pending");
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get document type configurations
   */
  async getDocumentTypeConfigs(): Promise<DocumentTypeConfig[]> {
    try {
      return await this.get<DocumentTypeConfig[]>("/types/config");
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update document type configuration
   */
  async updateDocumentTypeConfig(
    config: DocumentTypeConfig
  ): Promise<DocumentTypeConfig> {
    try {
      return await this.put<DocumentTypeConfig>("/types/config", config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Create new document type configuration
   */
  async createDocumentTypeConfig(
    config: Omit<DocumentTypeConfig, "displayOrder">
  ): Promise<DocumentTypeConfig> {
    try {
      return await this.post<DocumentTypeConfig>("/types/config", config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }


  /**
   * Send expiry notifications
   */
  async sendExpiryNotifications(documentIds: number[]): Promise<void> {
    try {
      await this.post<void>("/notifications/expiry", { documentIds });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get document verification history
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
    try {
      return await this.get<
        Array<{
          id: number;
          adminId: number;
          adminName: string;
          action: "approved" | "rejected" | "updated";
          verificationNotes?: string;
          timestamp: string;
        }>
      >(`/${documentId}/verification-history`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
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
