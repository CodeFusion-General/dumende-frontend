// Availability ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// AvailabilityDTO tanımı (backend'deki AvailabilityDTO'ya uygun)
export interface AvailabilityDTO {
  id: number;
  boatId: number;
  date: string; // LocalDate -> string (YYYY-MM-DD format)
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number (nullable)
  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
}

// CreateAvailabilityDTO tanımı
export interface CreateAvailabilityDTO {
  boatId: number;
  date: string; // LocalDate -> string (YYYY-MM-DD format)
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number (nullable)
}

// UpdateAvailabilityDTO tanımı
export interface UpdateAvailabilityDTO {
  id: number;
  date?: string; // LocalDate -> string (YYYY-MM-DD format)
  isAvailable?: boolean;
  priceOverride?: number; // BigDecimal -> number (nullable)
}

// Frontend için genişletilmiş availability interface
export interface Availability extends AvailabilityDTO {
  // Frontend'de kullanım kolaylığı için ek alanlar
  displayDate?: string; // Formatlanmış tarih
  status?: "available" | "unavailable" | "reserved"; // UI durumu için
}

// Availability period için command
export interface CreateAvailabilityPeriodCommand {
  boatId: number;
  startDate: string; // LocalDate -> string (YYYY-MM-DD format)
  endDate: string; // LocalDate -> string (YYYY-MM-DD format)
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number (nullable)
}

// Update period command
export interface UpdateAvailabilityPeriodCommand {
  boatId: number;
  startDate: string; // LocalDate -> string (YYYY-MM-DD format)
  endDate: string; // LocalDate -> string (YYYY-MM-DD format)
  isAvailable?: boolean;
  priceOverride?: number; // BigDecimal -> number (nullable)
}

// Query parameters for availability
export interface AvailabilityQuery {
  boatId?: number;
  startDate?: string;
  endDate?: string;
  isAvailable?: boolean;
}

// Filtreleme için kullanılan interface
export interface AvailabilityFilters {
  boatId?: number;
  startDate?: string;
  endDate?: string;
  isAvailable?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Calendar view için helper interface
export interface CalendarAvailability {
  date: string;
  isAvailable: boolean;
  price?: number;
  isOverride?: boolean;
  availabilityId?: number;
}

// Availability statistics
export interface AvailabilityStats {
  totalDays: number;
  availableDays: number;
  unavailableDays: number;
  averagePrice?: number;
  boatId: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
