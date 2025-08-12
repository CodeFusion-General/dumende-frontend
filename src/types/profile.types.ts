export interface Address {
  street?: string;
  city: string;
  district?: string;
  postalCode?: string;
  country: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  address?: Address;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
}

export interface ProfessionalInfo {
  licenseNumber: string;
  licenseExpiry: string;
  yearsOfExperience: number;
  certifications: Certification[];
  specializations: string[];
  bio?: string;
}

export interface CaptainStatistics {
  totalTours: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  yearsActive: number;
  totalRevenue?: number;
  repeatCustomers?: number;
}

export interface AccountSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: "public" | "private" | "limited";
  language: string;
  timezone: string;
}

export interface CaptainProfile {
  id: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  statistics: CaptainStatistics;
  accountSettings: AccountSettings;
  createdAt: string;
  updatedAt: string;
}

// Form-specific interfaces for editing
export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  street?: string;
  city: string;
  district?: string;
  postalCode?: string;
  country: string;
}

export interface ProfessionalInfoFormData {
  licenseNumber: string;
  licenseExpiry: string;
  yearsOfExperience: number;
  specializations: string[];
  bio?: string;
}

export interface AccountSettingsFormData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: "public" | "private" | "limited";
  language: string;
  timezone: string;
}

// Profile Completion Types
export interface AddressFormData {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO format
  address: AddressFormData;
  profileImage?: File;
}

export interface CreateUserMultipartCommand {
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  addressJson: string; // JSON serialized AddressDto
  profileImageFile?: File;
  accountId: number;
}
