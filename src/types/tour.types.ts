// Tour ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

import {
  TourDocumentDTO,
  CreateTourDocumentDTO,
  UpdateTourDocumentDTO,
} from "./document.types";

// Guide data interface for tour guides
export interface GuideData {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  responseRate: number;
  responseTime: string;
  isCertified: boolean;
  isVerified: boolean;
  joinDate: string;
  description: string;
  rating: number;
  reviewCount: number;
  totalTours: number;
  certifications?: string[];
  languages?: string[];
  specialties?: string[];
  experience: number; // years of experience
  location?: string;
}

// ✅ BACKEND UYUMLU: Tour Date (Tur Tarihleri) Types
export interface TourDateDTO {
  id: number;
  tourId: number;
  startDate: string; // LocalDateTime -> string
  endDate?: string; // LocalDateTime -> string (opsiyonel)
  durationText: string; // Örn: "4 Saat", "2 Gün"
  durationMinutes?: number;
  availabilityStatus: string;
  maxGuests: number;
  price?: number; // ✅ EKLE: Backend'de BigDecimal -> number
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourDateDTO {
  tourId: number;
  startDate: string; // LocalDateTime -> string
  endDate?: string; // LocalDateTime -> string (opsiyonel)
  durationText: string; // Örn: "4 Saat", "2 Gün"
  durationMinutes?: number;
  availabilityStatus: string;
  maxGuests: number;
  price?: number; // ✅ EKLE: Backend'de BigDecimal -> number
}

export interface UpdateTourDateDTO {
  id: number;
  tourId?: number;
  startDate?: string; // LocalDateTime -> string
  endDate?: string; // LocalDateTime -> string (opsiyonel)
  durationText?: string; // Örn: "4 Saat", "2 Gün"
  durationMinutes?: number;
  availabilityStatus?: string;
  maxGuests?: number;
  price?: number; // ✅ EKLE: Backend'de BigDecimal -> number (opsiyonel)
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
  tourId?: number; // create sırasında backend parametresiyle bağlanır
  imageData: string; // base64 string olarak gönderilir (backend byte[])
  fileName?: string;
  contentType?: string;
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
  fullDescription?: string;
  guideId: number; // Rehber/Kaptan ID'si
  price: number; // BigDecimal -> number
  capacity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  rating?: number; // Double -> number, nullable
  status: string;
  tourType?: TourType;
  tourDates: TourDateDTO[];
  tourImages: TourImageDTO[];
  tourDocuments: TourDocumentDTO[];
  features?: string[];
  // Terms & Policies
  cancellationPolicy?: string;
  // Additional Info
  includedServices?: string;
  requirements?: string;
  notAllowed?: string;
  notSuitableFor?: string;
  // Location details
  routeDescription?: string;
  locationDescription?: string;
  // Languages and Highlights
  languages?: string[];
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourDTO {
  name: string;
  description: string;
  fullDescription?: string;
  guideId: number; // Rehber/Kaptan ID'si
  price: number; // BigDecimal -> number
  capacity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  status: string;
  tourType?: TourType;
  tourDates: CreateTourDateDTO[];
  tourImages: CreateTourImageDTO[];
  tourDocuments?: CreateTourDocumentDTO[];
  features?: string[];
  // Terms & Policies
  cancellationPolicy?: string;
  // Additional Info
  includedServices?: string;
  requirements?: string;
  notAllowed?: string;
  notSuitableFor?: string;
  // Location details
  routeDescription?: string;
  locationDescription?: string;
  // Languages and Highlights
  languages?: string[];
  highlights?: string[];
}

export interface UpdateTourDTO {
  id: number;
  name?: string;
  description?: string;
  fullDescription?: string;
  guideId?: number; // Rehber/Kaptan ID'si
  price?: number; // BigDecimal -> number
  capacity?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  tourType?: TourType;
  tourDatesToUpdate?: UpdateTourDateDTO[];
  tourDatesToAdd?: CreateTourDateDTO[];
  tourDateIdsToRemove?: number[]; // List<Long> -> number[]
  tourImagesToUpdate?: UpdateTourImageDTO[];
  tourImagesToAdd?: CreateTourImageDTO[];
  tourImageIdsToRemove?: number[]; // List<Long> -> number[]
  tourDocumentsToAdd?: CreateTourDocumentDTO[];
  tourDocumentsToUpdate?: UpdateTourDocumentDTO[];
  tourDocumentIdsToRemove?: number[]; // List<Long> -> number[]
  features?: string[];
  // Terms & Policies
  cancellationPolicy?: string;
  // Additional Info
  includedServices?: string;
  requirements?: string;
  notAllowed?: string;
  notSuitableFor?: string;
  // Location details
  routeDescription?: string;
  locationDescription?: string;
  // Languages and Highlights
  languages?: string[];
  highlights?: string[];
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
  FULLY_BOOKED = "FULLY_BOOKED",
  CANCELLED = "CANCELLED",
}

// Backend TourType ile uyumlu enum
export enum TourType {
  HIKING = "HIKING",
  CULTURAL = "CULTURAL",
  FOOD = "FOOD",
  CITY = "CITY",
  NATURE = "NATURE",
  BOAT = "BOAT",
  PHOTOGRAPHY = "PHOTOGRAPHY",
  DIVING = "DIVING",
}

// Filtreleme için kullanılan interface
export interface TourFilters {
  name?: string;
  location?: string;
  guideId?: number;
  status?: TourStatus;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
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
