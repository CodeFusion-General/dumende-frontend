// Booking ve Payment ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// Booking (Rezervasyon) Types
export interface BookingDTO {
  id: number;
  customerId: number;
  boatId: number;
  tourId?: number; // Opsiyonel, tour ile ilişkilendirme varsa
  startDate: string; // LocalDate -> string
  endDate: string; // LocalDate -> string
  status: string; // BookingStatus enum değeri
  totalPrice: number; // Double -> number
  passengerCount: number;
  notes?: string; // Opsiyonel
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDTO {
  customerId: number;
  boatId: number;
  tourId?: number; // Opsiyonel, tour ile ilişkilendirme yapılacaksa
  startDate: string; // LocalDate -> string
  endDate: string; // LocalDate -> string
  totalPrice: number; // Double -> number
  passengerCount: number;
  notes?: string; // Opsiyonel
}

export interface UpdateBookingDTO {
  id: number; // Güncellenecek kaydın ID'si
  customerId?: number;
  boatId?: number;
  tourId?: number;
  startDate?: string; // LocalDate -> string
  endDate?: string; // LocalDate -> string
  status?: string; // BookingStatus enum değeri
  totalPrice?: number; // Double -> number
  passengerCount?: number;
  notes?: string;
}

// Payment (Ödeme) Types
export interface PaymentDTO {
  id: number;
  bookingId: number;
  amount: number; // Double -> number
  currency: string;
  paymentMethod: string;
  status: string; // PaymentStatus enum değeri
  transactionId: string;
  paymentDate: string; // LocalDateTime -> string
  notes?: string; // Opsiyonel
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  bookingId: number;
  amount: number; // Double -> number
  currency: string;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string; // LocalDateTime -> string
  notes?: string; // Opsiyonel
}

export interface UpdatePaymentDTO {
  id: number;
  bookingId?: number;
  amount?: number; // Double -> number
  currency?: string;
  paymentMethod?: string;
  status?: string; // PaymentStatus enum değeri
  transactionId?: string;
  paymentDate?: string; // LocalDateTime -> string
  notes?: string;
}

// Enum Types
export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Booking extends BookingDTO {}
export interface BookingCreateRequest extends CreateBookingDTO {}
export interface BookingUpdateRequest extends UpdateBookingDTO {}

// Filtreleme için kullanılan interface
export interface BookingFilters {
  customerId?: number;
  boatId?: number;
  tourId?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
}
