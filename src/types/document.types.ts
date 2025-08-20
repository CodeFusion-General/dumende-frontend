// Document Management Types - Backend DTO'larıyla uyumlu

// Document Type Enums
export enum BoatDocumentType {
  LICENSE = "LICENSE",
  INSURANCE = "INSURANCE",
  SAFETY_CERTIFICATE = "SAFETY_CERTIFICATE",
  INSPECTION_CERTIFICATE = "INSPECTION_CERTIFICATE",
  REGISTRATION_CERTIFICATE = "REGISTRATION_CERTIFICATE",
  CAPTAIN_LICENSE = "CAPTAIN_LICENSE",
  RADIO_LICENSE = "RADIO_LICENSE",
  OTHER = "OTHER",
}

export enum TourDocumentType {
  GUIDE_LICENSE = "GUIDE_LICENSE",
  TOUR_PERMIT = "TOUR_PERMIT",
  INSURANCE = "INSURANCE",
  SAFETY_CERTIFICATE = "SAFETY_CERTIFICATE",
  FIRST_AID_CERTIFICATE = "FIRST_AID_CERTIFICATE",
  LANGUAGE_CERTIFICATE = "LANGUAGE_CERTIFICATE",
  BUSINESS_LICENSE = "BUSINESS_LICENSE",
  TAX_DOCUMENT = "TAX_DOCUMENT",
  OTHER = "OTHER",
}

// Base Document Interface
interface BaseDocumentDTO {
  id: number;
  documentName: string;
  filePath: string;
  documentUrl: string;
  expiryDate?: string;
  isVerified: boolean;
  verificationNotes?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Boat Document DTOs
export interface BoatDocumentDTO extends BaseDocumentDTO {
  boatId: number;
  documentType: BoatDocumentType;
}

export interface CreateBoatDocumentDTO {
  documentType: BoatDocumentType;
  documentName?: string;
  documentData: string; // base64
  expiryDate?: string;
  isVerified?: boolean;
  verificationNotes?: string;
  displayOrder?: number;
}

export interface UpdateBoatDocumentDTO {
  id: number;
  documentType?: BoatDocumentType;
  documentName?: string;
  documentData?: string; // base64
  expiryDate?: string;
  isVerified?: boolean;
  verificationNotes?: string;
  displayOrder?: number;
}

// Tour Document DTOs
export interface TourDocumentDTO extends BaseDocumentDTO {
  tourId: number;
  documentType: TourDocumentType;
}

export interface CreateTourDocumentDTO {
  documentType: TourDocumentType;
  documentName?: string;
  documentData: string; // base64
  expiryDate?: string;
  isVerified?: boolean;
  verificationNotes?: string;
  displayOrder?: number;
}

export interface UpdateTourDocumentDTO {
  id: number;
  documentType?: TourDocumentType;
  documentName?: string;
  documentData?: string; // base64
  expiryDate?: string;
  isVerified?: boolean;
  verificationNotes?: string;
  displayOrder?: number;
}

// Document Metadata Interface
export interface DocumentMetadata {
  documentName?: string;
  expiryDate?: string;
  verificationNotes?: string;
}

// Document Error Interface
export interface DocumentError {
  type: "VALIDATION" | "UPLOAD" | "SERVER" | "NETWORK";
  message: string;
  field?: string;
  code?: string;
}

// Document Upload Configuration
export interface DocumentUploadConfig {
  maxFileSize: number; // in bytes
  acceptedTypes: string[];
  compressionQuality?: number;
}

// Document Display Labels (for internationalization)
export interface DocumentTypeLabels {
  [key: string]: {
    tr: string;
    en: string;
  };
}

// Boat Document Type Labels
export const BOAT_DOCUMENT_TYPE_LABELS: DocumentTypeLabels = {
  [BoatDocumentType.LICENSE]: {
    tr: "Gemi Ruhsatı",
    en: "Boat License",
  },
  [BoatDocumentType.INSURANCE]: {
    tr: "Sigorta Belgesi",
    en: "Insurance Certificate",
  },
  [BoatDocumentType.SAFETY_CERTIFICATE]: {
    tr: "Güvenlik Sertifikası",
    en: "Safety Certificate",
  },
  [BoatDocumentType.INSPECTION_CERTIFICATE]: {
    tr: "Muayene Belgesi",
    en: "Inspection Certificate",
  },
  [BoatDocumentType.REGISTRATION_CERTIFICATE]: {
    tr: "Kayıt Belgesi",
    en: "Registration Certificate",
  },
  [BoatDocumentType.CAPTAIN_LICENSE]: {
    tr: "Kaptan Belgesi",
    en: "Captain License",
  },
  [BoatDocumentType.RADIO_LICENSE]: {
    tr: "Telsiz Ruhsatı",
    en: "Radio License",
  },
  [BoatDocumentType.OTHER]: {
    tr: "Diğer",
    en: "Other",
  },
};

// Tour Document Type Labels
export const TOUR_DOCUMENT_TYPE_LABELS: DocumentTypeLabels = {
  [TourDocumentType.GUIDE_LICENSE]: {
    tr: "Rehber Ruhsatı",
    en: "Guide License",
  },
  [TourDocumentType.TOUR_PERMIT]: {
    tr: "Tur İzni",
    en: "Tour Permit",
  },
  [TourDocumentType.INSURANCE]: {
    tr: "Sigorta Belgesi",
    en: "Insurance Certificate",
  },
  [TourDocumentType.SAFETY_CERTIFICATE]: {
    tr: "Güvenlik Sertifikası",
    en: "Safety Certificate",
  },
  [TourDocumentType.FIRST_AID_CERTIFICATE]: {
    tr: "İlk Yardım Sertifikası",
    en: "First Aid Certificate",
  },
  [TourDocumentType.LANGUAGE_CERTIFICATE]: {
    tr: "Dil Sertifikası",
    en: "Language Certificate",
  },
  [TourDocumentType.BUSINESS_LICENSE]: {
    tr: "İş Yeri Ruhsatı",
    en: "Business License",
  },
  [TourDocumentType.TAX_DOCUMENT]: {
    tr: "Vergi Belgesi",
    en: "Tax Document",
  },
  [TourDocumentType.OTHER]: {
    tr: "Diğer",
    en: "Other",
  },
};

// Form Data Interfaces for Document Management
export interface DocumentFormData<T> {
  existing: T[];
  toAdd: T extends BoatDocumentDTO
    ? CreateBoatDocumentDTO[]
    : CreateTourDocumentDTO[];
  toUpdate: T extends BoatDocumentDTO
    ? UpdateBoatDocumentDTO[]
    : UpdateTourDocumentDTO[];
  toRemove: number[];
}

// Specific form data interfaces
export interface BoatDocumentFormData {
  existing: BoatDocumentDTO[];
  toAdd: CreateBoatDocumentDTO[];
  toUpdate: UpdateBoatDocumentDTO[];
  toRemove: number[];
}

export interface TourDocumentFormData {
  existing: TourDocumentDTO[];
  toAdd: CreateTourDocumentDTO[];
  toUpdate: UpdateTourDocumentDTO[];
  toRemove: number[];
}

// Document validation result
export interface DocumentValidationResult {
  isValid: boolean;
  errors: DocumentError[];
}

// Document upload progress
export interface DocumentUploadProgress {
  documentId?: number;
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "success" | "error";
  error?: string;
}

// Document filter options
export interface DocumentFilterOptions {
  documentType?: string;
  isVerified?: boolean;
  isExpired?: boolean;
  isExpiringSoon?: boolean; // within 30 days
}

// Document sort options
export interface DocumentSortOptions {
  field:
    | "createdAt"
    | "updatedAt"
    | "expiryDate"
    | "displayOrder"
    | "documentName";
  direction: "asc" | "desc";
}
