// Booking ve Payment ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// BoatService ilgili types (yeni eklenen)
export interface SelectedServiceDTO {
  boatServiceId: number;
  quantity: number;
}

export interface BookingServiceDTO {
  id: number;
  bookingId: number;
  boatServiceId: number;
  serviceName: string;
  serviceDescription?: string;
  serviceType: string; // ServiceType enum: FOOD, PACKAGE, EXTRA
  quantity: number;
  unitPrice: number;
  totalServicePrice: number;
  createdAt: string;
  updatedAt: string;
}

// Booking (Rezervasyon) Types
export interface BookingDTO {
  id: number;
  customerId: number;
  boatId?: number;
  tourId?: number; // ✅ Backend'de nullable = true, Opsiyonel
  startDate: string; // ✅ LocalDateTime -> string (ISO format)
  endDate: string; // ✅ LocalDateTime -> string (ISO format)
  status: string; // BookingStatus enum değeri
  totalPrice: number; // ✅ BigDecimal -> number
  passengerCount: number;
  notes?: string; // Opsiyonel
  services: BookingServiceDTO[]; // YENİ: Seçilen hizmetler
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDTO {
  // ❌ customerId KALDIRILDI - JWT'den çekiliyor
  boatId?: number;
  tourId?: number; // ✅ Opsiyonel olarak düzeltildi
  startDate: string; // ✅ LocalDateTime -> string (ISO format: "2024-01-15T14:30:00")
  endDate: string; // ✅ LocalDateTime -> string (ISO format: "2024-01-15T18:30:00")
  // ❌ totalPrice KALDIRILDI - Backend hesaplıyor
  selectedServices?: SelectedServiceDTO[]; // YENİ: Seçilen hizmetler (opsiyonel)
  passengerCount: number;
  notes?: string; // Opsiyonel
}

export interface UpdateBookingDTO {
  id: number; // Güncellenecek kaydın ID'si
  // ❌ customerId KALDIRILDI - Backend'de ownership kontrolü yapılıyor
  boatId?: number;
  tourId?: number;
  startDate?: string; // ✅ LocalDateTime -> string (ISO format)
  endDate?: string; // ✅ LocalDateTime -> string (ISO format)
  status?: string; // BookingStatus enum değeri
  totalPrice?: number; // ✅ BigDecimal -> number
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
  transactionId?: string;
  paymentDate?: string; // LocalDateTime -> string
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
  PROCESSING = "PROCESSING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  NO_SHOW = "NO_SHOW",
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
  boatId?: number;
  tourId?: number;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minPassengers?: number;
  maxPassengers?: number;
}

// Extended Booking with related data (frontend için)
export interface BookingWithDetails {
  id: number;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  boatId: number;
  boatName?: string;
  boatType?: string;
  boatLocation?: string;
  tourId?: number;
  tourName?: string;
  tourDescription?: string;
  startDate: string; // ISO DateTime format
  endDate: string; // ISO DateTime format
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
