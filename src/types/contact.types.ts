import { AccountDTO } from "./auth.types";
import { BookingDTO } from "./booking.types";
import { ReviewDTO } from "./review.types";
import { BoatDTO } from "./boat.types";

// User Types
export interface UserDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string; // URL olarak tutuluyor
  account: AccountDTO;
  bookings: BookingDTO[];
  reviews: ReviewDTO[];
  boats: BoatDTO[]; // Kullanıcının sahip olduğu tekneler
  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
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
