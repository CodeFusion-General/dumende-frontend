import {
  BoatDocumentDTO,
  TourDocumentDTO,
  BoatDocumentType,
  TourDocumentType,
} from "./document.types";

// Admin Document View - Unified view for all documents
export interface AdminDocumentView {
  id: number;
  documentName: string;
  documentType: BoatDocumentType | TourDocumentType;
  entityType: "boat" | "tour";
  entityId: number;
  entityName: string;
  ownerInfo: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  filePath: string;
  documentUrl: string;
  expiryDate?: string;
  isVerified: boolean;
  verificationNotes?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  // Status indicators
  isExpired: boolean;
  isExpiringSoon: boolean; // within 30 days
  daysUntilExpiry?: number;
}

// Document verification update request
export interface DocumentVerificationUpdate {
  documentId: number;
  isVerified: boolean;
  verificationNotes?: string;
}

// Bulk document operations
export interface BulkDocumentOperation {
  documentIds: number[];
  operation: "approve" | "reject" | "delete";
  verificationNotes?: string;
}

// Document statistics for admin dashboard
export interface AdminDocumentStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  expired: number;
  expiringSoon: number;
  byType: {
    boat: {
      total: number;
      verified: number;
      pending: number;
    };
    tour: {
      total: number;
      verified: number;
      pending: number;
    };
  };
  byDocumentType: Record<string, number>;
}

// Document filter options for admin
export interface AdminDocumentFilter {
  entityType?: "boat" | "tour";
  documentType?: string;
  verificationStatus?: "verified" | "pending" | "rejected";
  expiryStatus?: "valid" | "expired" | "expiring_soon";
  ownerId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Document sort options for admin
export interface AdminDocumentSort {
  field:
    | "createdAt"
    | "updatedAt"
    | "expiryDate"
    | "documentName"
    | "entityName"
    | "ownerName"
    | "verificationStatus";
  direction: "asc" | "desc";
}

// Paginated document response
export interface AdminDocumentListResponse {
  documents: AdminDocumentView[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: AdminDocumentStats;
}

// Document type management
export interface DocumentTypeConfig {
  type: BoatDocumentType | TourDocumentType;
  entityType: "boat" | "tour";
  label: string;
  description?: string;
  isRequired: boolean;
  hasExpiryDate: boolean;
  validationRules?: {
    maxFileSize?: number;
    acceptedFormats?: string[];
    customValidation?: string;
  };
  isActive: boolean;
  displayOrder: number;
}

// Document reupload request
export interface DocumentReuploadRequest {
  documentId: number;
  reason: string;
  deadline?: string;
  notifyOwner: boolean;
}

// Document notification settings
export interface DocumentNotificationSettings {
  expiryWarningDays: number[];
  autoRejectAfterDays?: number;
  reminderFrequency: "daily" | "weekly" | "monthly";
  notificationChannels: ("email" | "sms" | "push")[];
}
