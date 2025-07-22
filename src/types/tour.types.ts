// Tour ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// Tour Date (Tur Tarihleri) Types
export interface TourDateDTO {
  id: number;
  tourId: number;
  startDate: string; // LocalDateTime -> string
  endDate: string; // LocalDateTime -> string
  availabilityStatus: string;
  maxGuests: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourDateDTO {
  tourId: number;
  startDate: string; // LocalDateTime -> string
  endDate: string; // LocalDateTime -> string
  availabilityStatus: string;
  maxGuests: number;
}

export interface UpdateTourDateDTO {
  id: number;
  tourId?: number;
  startDate?: string; // LocalDateTime -> string
  endDate?: string; // LocalDateTime -> string
  availabilityStatus?: string;
  maxGuests?: number;
}

// Tour Image (Tur Resimleri) Types
export interface TourImageDTO {
  id: number;
  tourId: number;
  imageUrl: string; // URL olarak tutuluyor artık
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourImageDTO {
  tourId: number;
  imageUrl: string; // URL olarak gönderiliyor
  displayOrder: number;
}

export interface UpdateTourImageDTO {
  id: number;
  tourId?: number;
  imageUrl?: string; // URL olarak güncelleniyor
  displayOrder?: number;
}

// Ana Tour Types
export interface TourDTO {
  id: number;
  name: string;
  description: string;
  boatId: number;
  guideId: number; // Rehber/Kaptan ID'si
  seasonStartDate: string; // LocalDateTime -> string
  seasonEndDate: string; // LocalDateTime -> string
  price: number; // BigDecimal -> number
  capacity: number;
  location: string;
  rating?: number; // Double -> number, nullable
  status: string;
  tourDates: TourDateDTO[];
  tourImages: TourImageDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourDTO {
  name: string;
  description: string;
  boatId: number;
  guideId: number; // Rehber/Kaptan ID'si
  seasonStartDate: string; // LocalDateTime -> string
  seasonEndDate: string; // LocalDateTime -> string
  price: number; // BigDecimal -> number
  capacity: number;
  location: string;
  status: string;
  tourDates: CreateTourDateDTO[];
  tourImages: CreateTourImageDTO[];
}

export interface UpdateTourDTO {
  id: number;
  name?: string;
  description?: string;
  boatId?: number;
  guideId?: number; // Rehber/Kaptan ID'si
  seasonStartDate?: string; // LocalDateTime -> string
  seasonEndDate?: string; // LocalDateTime -> string
  price?: number; // BigDecimal -> number
  capacity?: number;
  location?: string;
  status?: string;
  tourDatesToUpdate?: UpdateTourDateDTO[];
  tourDatesToAdd?: CreateTourDateDTO[];
  tourDateIdsToRemove?: number[]; // List<Long> -> number[]
  tourImagesToUpdate?: UpdateTourImageDTO[];
  tourImagesToAdd?: CreateTourImageDTO[];
  tourImageIdsToRemove?: number[]; // List<Long> -> number[]
}

// Tour Status Enum
export enum TourStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
  CANCELLED = "CANCELLED",
}

// Tour Availability Status Enum
export enum TourAvailabilityStatus {
  AVAILABLE = "AVAILABLE",
  FULL = "FULL",
  CANCELLED = "CANCELLED",
}

// Filtreleme için kullanılan interface
export interface TourFilters {
  name?: string;
  location?: string;
  boatId?: number;
  guideId?: number;
  status?: TourStatus;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  rating?: number;
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Tour extends TourDTO {
  // Eski alanları eşleştir
  captainId?: number; // guideId ile aynı
  duration?: number; // Hesaplanabilir alan
  maxParticipants?: number; // capacity ile aynı
  startLocation?: string; // location ile aynı
  route?: string[]; // Eski alan, kaldırılabilir
  includes?: string[]; // Eski alan, kaldırılabilir
  images?: string[]; // tourImages'den türetilebilir
  available?: boolean; // status'ten türetilebilir
}

export interface TourCreateRequest extends CreateTourDTO {}
export interface TourUpdateRequest extends Partial<UpdateTourDTO> {}
