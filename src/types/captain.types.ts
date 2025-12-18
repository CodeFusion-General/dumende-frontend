// ✅ BACKEND UYUMLU: Captain - Backend CaptainDTO.java ile tam uyumlu
export interface Captain {
    id: number;

    // ✅ EKLE: Backend'deki name fields
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string; // Geriye uyumluluk için (deprecated, fullName kullan)

    // ✅ EKLE: Contact information
    email?: string;
    phoneNumber?: string;

    // Profile information
    bio?: string;

    // ✅ GÜNCELLE: photo → profileImageUrl (Backend field ismi)
    profileImageUrl?: string;
    photo?: string; // Geriye uyumluluk için (deprecated, profileImageUrl kullan)

    // ✅ EKLE: Captain status and licensing
    status?: string;
    licenseNumber?: string;
    licenseExpiryDate?: string; // LocalDate -> ISO 8601

    // ✅ EKLE: Online presence (messaging için)
    isOnline?: boolean;
    lastSeen?: string; // LocalDateTime -> ISO 8601
    responseRate?: number; // 0-100 arası yüzde
    averageResponseTime?: string; // Örn: "~1 saat"

    // Existing fields
    experience?: number; // yearsOfExperience ile aynı anlama gelebilir
    rating?: number;
    available?: boolean; // isOnline ile overlap olabilir
    certifications?: string[]; // ProfessionalInfoDto'da daha detaylı
    languages?: string[];

    createdAt: string;
    updatedAt: string;
}

export interface CaptainCreateRequest {
    name: string;
    experience: number;
    bio: string;
    photo: string;
    certifications: string[];
    languages: string[];
}

export interface CaptainUpdateRequest extends Partial<CaptainCreateRequest> {} 

// Captain Application domain (backend uyumlu)
export type CaptainApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CompanyInfo {
  legalName: string;
  displayName: string;
  taxNumber: string;
  taxOffice: string;
  authorizedPerson: string;
  companyEmail: string;
  nationalIdNumber: string;
  mobilePhone: string;
  landlinePhone?: string;
  billingAddress: string;
  iban: string;
}

export interface CertificationDto {
  id: number;
  name: string;
  issuer: string;
  issueDate: string; // ISO date
  expiryDate: string; // ISO date
  certificateNumber: string;
}

export interface ProfessionalInfoDto {
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  yearsOfExperience: number;
  certifications?: CertificationDto[];
  specializations?: string[];
  bio?: string;
}

export interface CaptainApplication {
  id: number;
  userId: number;
  status: CaptainApplicationStatus;
  rejectionReason?: string;
  fullName?: string;
  phoneNumber?: string;
  company?: CompanyInfo;
  professionalInfo?: ProfessionalInfoDto;
  documentFilePaths?: string[];
  createdLicenseExpiry?: string; // başvuru anındaki expiry (ISO)
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaptainApplicationRequest {
  userId: number;
  licenseNumber: string;
  licenseExpiry: string; // ISO date (YYYY-MM-DD)
  yearsOfExperience: number;
  specializations?: string[];
  bio?: string;
  company?: CompanyInfo;
  contractApproved: boolean;
  contractVersion: string;
}

export interface CreateCaptainApplicationMultipartRequest {
  userId: number;
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  yearsOfExperience: number;
  specializations?: string[];
  bio?: string;
  documents?: File[];
  company?: CompanyInfo | string; // string (JSON) veya obje kabul edelim
  contractApproved: boolean;
  contractVersion: string;
}

export interface ReviewCaptainApplicationRequest {
  status: Exclude<CaptainApplicationStatus, "PENDING">; // APPROVED | REJECTED
  rejectionReason?: string; // REJECTED ise zorunlu
}

// Contract Approval types
export interface ContractApproval {
  id: number;
  accountId: number;
  userName: string;
  companyName?: string;
  userEmail: string;
  ipAddress: string;
  approvalDateTime: string;
  contractVersion: string;
  browserInfo: string;
  contractType: string;
  applicationType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractApprovalRequest {
  accountId: number;
  userName: string;
  companyName?: string;
  userEmail: string;
  contractVersion: string;
  contractType: string;
  applicationType?: string;
}