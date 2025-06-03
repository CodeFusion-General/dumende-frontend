// Booking ve Payment ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// Helper type for Long (Java Long to TypeScript)
type Long = number;

// Booking (Rezervasyon) Types
export interface BookingDTO {
  id: Long;
  customerId: Long;
  boatId: Long;
  tourId?: Long; // Opsiyonel, tour ile ilişkilendirme varsa
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
  customerId: Long;
  boatId: Long;
  tourId?: Long; // Opsiyonel, tour ile ilişkilendirme yapılacaksa
  startDate: string; // LocalDate -> string
  endDate: string; // LocalDate -> string
  totalPrice: number; // Double -> number
  passengerCount: number;
  notes?: string; // Opsiyonel
}

export interface UpdateBookingDTO {
  id: Long; // Güncellenecek kaydın ID'si
  customerId?: Long;
  boatId?: Long;
  tourId?: Long;
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
  bookingId: Long;
  amount: number; // Double -> number
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  paymentDate?: string; // LocalDateTime -> string
  notes?: string; // Opsiyonel
}

export interface UpdatePaymentDTO {
  id: Long;
  bookingId?: Long;
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
  REJECTED = "REJECTED",
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
  status?: BookingStatus[];
  boatId?: Long;
  tourId?: Long;
  customerId?: Long;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minPassengers?: number;
  maxPassengers?: number;
}

// Extended Booking with related data (frontend için)
export interface BookingWithDetails {
  id: Long;
  customerId: Long;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  boatId: Long;
  boatName?: string;
  boatType?: string;
  boatLocation?: string;
  tourId?: Long;
  tourName?: string;
  tourDescription?: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  passengerCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Booking statistics
export interface BookingStatistics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  thisMonthBookings: number;
  thisMonthRevenue: number;
}

// Calendar event for booking display
export interface BookingCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: BookingStatus;
  color: string;
  customerName?: string;
  passengerCount: number;
  totalPrice: number;
  notes?: string;
}

// Booking query parameters
export interface BookingQuery {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  filters?: BookingFilters;
}
