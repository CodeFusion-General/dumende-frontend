import { AccountDTO } from "./auth.types";
import { BookingDTO } from "./booking.types";
import { ReviewDTO } from "./review.types";
import { BoatDTO } from "./boat.types";

// ✅ BACKEND UYUMLU: UserDTO - Backend UserDTO.java ile tam uyumlu
export interface UserDTO {
  id: number;

  // ✅ EKLE: Name fields (Backend'den gelen field'lar)
  firstName?: string;
  lastName?: string;
  fullName: string;

  phoneNumber: string;

  // ✅ EKLE: Additional profile fields
  dateOfBirth?: string; // LocalDate -> ISO 8601 format (YYYY-MM-DD)
  address?: AddressDto;

  // ✅ DEĞİŞTİR: profileImage → profileImageUrl (Backend field ismi)
  profileImageUrl?: string; // URL olarak tutuluyor
  profileImageFilePath?: string; // Backend'deki internal file path

  // ✅ EKLE: Company info (for boat owners)
  company?: CompanyDTO;

  account: AccountDTO;

  // ✅ EKLE: Captain-specific fields (backend'den gelen field'lar)
  professionalInfo?: ProfessionalInfoDto;
  statistics?: CaptainStatisticsDto;
  certifications?: CertificationDto[];

  // Existing relational fields
  bookings: BookingDTO[];
  reviews: ReviewDTO[];
  boats: BoatDTO[]; // Kullanıcının sahip olduğu tekneler

  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
}

// ✅ EKLE: Supporting DTOs (Backend'den gelen nested types)

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface CompanyDTO {
  legalName?: string;
  displayName?: string;
  taxNumber?: string;
  taxOffice?: string;
  authorizedPerson?: string;
  companyEmail?: string;
  nationalIdNumber?: string;
  mobilePhone?: string;
  landlinePhone?: string;
  billingAddress?: string;
  iban?: string;
}

export interface ProfessionalInfoDto {
  licenseNumber?: string;
  licenseExpiry?: string; // LocalDate -> ISO 8601
  yearsOfExperience?: number;
  certifications?: CertificationDto[];
  specializations?: string[];
  bio?: string;
}

export interface CaptainStatisticsDto {
  totalTrips?: number;
  totalHours?: number;
  averageRating?: number;
  totalEarnings?: number;
  completionRate?: number;
}

export interface CertificationDto {
  id: number;
  name: string;
  issuer?: string;
  issueDate?: string; // LocalDate -> ISO 8601
  expiryDate?: string; // LocalDate -> ISO 8601
  certificateNumber?: string;
}

export interface CreateUserCommand {
  fullName: string; // 3-100 karakter arası
  phoneNumber: string; // Türkiye telefon formatı
  profileImage?: string; // Opsiyonel profil resmi
  accountId: number; // Hesap ID zorunlu
}

export interface UpdateUserCommand {
  id: number;
  fullName: string; // 3-100 karakter arası
  phoneNumber: string; // Türkiye telefon formatı
  profileImage?: string; // Opsiyonel profil resmi
}

export interface UserQuery {
  id?: number;
  fullName?: string;
  phoneNumber?: string;
  email?: string; // Account'tan gelir
  accountId?: number;
  boatId?: number; // Bu kullanıcının teknesini arayabilmek için
  bookingId?: number; // Bu kullanıcının rezervasyonunu arayabilmek için
}

// Basit User interface (diğer DTO'larda referans için)
export interface SimpleUserDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string;
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Contact
  extends Omit<UserDTO, "account" | "bookings" | "reviews" | "boats"> {
  name: string; // fullName yerine
  email?: string; // account.email'den gelir
  message?: string; // Eski contact formu için
}

export interface ContactCreateRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactUpdateRequest extends Partial<ContactCreateRequest> {}

// User filtreleme için kullanılan interface
export interface UserFilters {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string; // Account'tan gelir
  hasBookings?: boolean;
  hasBoats?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}
