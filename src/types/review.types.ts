// Review ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// CustomerDTO tanımı (backend CustomerDTO ile uyumlu)
export interface CustomerDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string; // Base64 encoded string veya URL
}

// Review Types
export interface ReviewDTO {
  id: number;
  bookingId: number;
  customer: CustomerDTO; // Güncellenmiş CustomerDTO kullanıyoruz
  boatId?: number; // Tekne değerlendirmesi için
  tourId?: number; // Tur değerlendirmesi için
  rating: number; // 1-5 arası
  comment?: string; // Opsiyonel yorum (max 500 karakter)
  date: string; // LocalDate -> string
  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
}

export interface CreateReviewCommand {
  bookingId: number;
  rating: number; // 1-5 arası zorunlu
  comment?: string; // Opsiyonel (max 500 karakter)
  date?: string; // LocalDate -> string, opsiyonel
}

export interface UpdateReviewCommand {
  reviewId: number;
  rating: number; // 1-5 arası zorunlu
  comment?: string; // Opsiyonel (max 500 karakter)
}

export interface ReviewQuery {
  id?: number;
  bookingId?: number;
  customerId?: number;
  boatId?: number;
  tourId?: number;
  minRating?: number; // Minimum değerlendirme puanı
  maxRating?: number; // Maximum değerlendirme puanı
  fromDate?: string; // Başlangıç tarihi (LocalDate -> string)
  toDate?: string; // Bitiş tarihi (LocalDate -> string)
  includeDeleted?: boolean;
}

// UserDTO tanımı (review içinde kullanılan basit versiyon)
export interface UserDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string; // byte[] -> string (base64 veya URL)
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Review extends Omit<ReviewDTO, "customer"> {
  userId: number; // customer.id yerine
  userName?: string; // customer.fullName yerine
}

export interface ReviewCreateRequest extends CreateReviewCommand {}
export interface ReviewUpdateRequest extends UpdateReviewCommand {}

// Filtreleme için kullanılan interface
export interface ReviewFilters {
  boatId?: number;
  tourId?: number;
  customerId?: number;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  hasComment?: boolean; // Yorumu olan değerlendirmeler
}
