export interface Captain {
    id: number;
    name: string;
    experience: number;
    bio: string;
    photo: string;
    rating: number;
    available: boolean;
    certifications: string[];
    languages: string[];
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