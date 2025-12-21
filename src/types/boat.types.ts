// Boat ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

import {
  BoatDocumentDTO,
  CreateBoatDocumentDTO,
  UpdateBoatDocumentDTO,
} from "./document.types";

// BoatService Types (Backend ile uyumlu)
export enum ServiceType {
  FOOD = "FOOD",
  PACKAGE = "PACKAGE",
  EXTRA = "EXTRA",
}

export interface BoatServiceDTO {
  id: number;
  boatId: number;
  name: string;
  description?: string;
  serviceType: ServiceType;
  price: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatServiceDTO {
  boatId: number;
  name: string;
  description?: string;
  serviceType: ServiceType;
  price: number;
  quantity?: number;
}

// Service Type Labels (for internationalization)
export interface ServiceTypeLabels {
  [key: string]: {
    tr: string;
    en: string;
  };
}

export const SERVICE_TYPE_LABELS: ServiceTypeLabels = {
  [ServiceType.FOOD]: {
    tr: "Yemek",
    en: "Food",
  },
  [ServiceType.PACKAGE]: {
    tr: "Paket",
    en: "Package",
  },
  [ServiceType.EXTRA]: {
    tr: "Ekstra",
    en: "Extra",
  },
};

export interface UpdateBoatServiceDTO {
  id: number;
  name: string;
  description?: string;
  serviceType: ServiceType;
  price: number;
  quantity?: number;
}

// Availability (Müsaitlik) Types
export interface AvailabilityDTO {
  id: number;
  boatId: number;
  date: string; // LocalDate -> string
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number, nullable
  isInstantConfirmation?: boolean; // Anında rezervasyon özelliği
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityDTO {
  boatId: number;
  date: string; // LocalDate -> string
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number, nullable
  isInstantConfirmation?: boolean; // Anında rezervasyon özelliği
}

export interface UpdateAvailabilityDTO {
  id: number;
  date?: string; // LocalDate -> string
  isAvailable?: boolean;
  priceOverride?: number; // BigDecimal -> number, nullable
  isInstantConfirmation?: boolean; // Anında rezervasyon özelliği
}

export interface CreateAvailabilityPeriodCommand {
  boatId: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  priceOverride?: number; // Özel fiyat özelliği
  isInstantConfirmation?: boolean; // Anında rezervasyon özelliği
}

// Boat Feature (Özellik) Types
export interface BoatFeatureDTO {
  id: number;
  boatId: number;
  featureName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatFeatureDTO {
  featureName: string;
}

export interface UpdateBoatFeatureDTO {
  id: number;
  featureName: string;
}

// Boat Image (Resim) Types
export interface BoatImageDTO {
  id: number;
  boatId: number;
  imageUrl: string; // ⚠️ DEPRECATED - Use variant URLs instead (kept for backward compatibility)
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;

  // CloudFlare Images Integration (Backend commit 7eb759e)
  imageId?: string; // CloudFlare image ID
  storageType?: string; // CLOUDFLARE_IMAGES, CLOUDFLARE_R2, FIREBASE, LOCAL
  publicUrl?: string; // Default variant (original size)
  thumbnailUrl?: string; // 200x200 - List views
  smallUrl?: string; // 400x300 - Mobile detail pages
  mediumUrl?: string; // 800x600 - Tablet/desktop detail pages
  largeUrl?: string; // 1600x1200 - Full-screen views
  fullUrl?: string; // Original quality (same as publicUrl)
}

export interface CreateBoatImageDTO {
  imageData: string; // Base64 data
  isPrimary: boolean;
  displayOrder: number;
}

export interface UpdateBoatImageDTO {
  id: number;
  imageUrl?: string; // URL olarak güncelleniyor
  isPrimary?: boolean;
  displayOrder?: number;
}

// Ana Boat Types
export interface BoatDTO {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  shortDescription?: string;
  model: string;
  year: number;
  length: number; // Double -> number
  capacity: number;
  dailyPrice: number; // BigDecimal -> number
  hourlyPrice: number; // BigDecimal -> number
  location: string;
  latitude?: number;
  longitude?: number;
  rating?: number; // Double -> number, nullable
  type: string;
  status: string;
  brandModel: string;
  buildYear: number;
  captainIncluded: boolean;
  images: BoatImageDTO[];
  features: BoatFeatureDTO[];
  availabilities: AvailabilityDTO[];
  services: BoatServiceDTO[]; // Gemi hizmetleri
  documents: BoatDocumentDTO[]; // Gemi belgeleri
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatDTO {
  name: string;
  description?: string;
  shortDescription?: string;
  model?: string;
  year?: number;
  length?: number; // Double -> number
  capacity: number;
  dailyPrice: number; // BigDecimal -> number
  hourlyPrice: number; // BigDecimal -> number
  location: string;
  latitude?: number;
  longitude?: number;
  type: string;
  status?: string;
  brandModel?: string;
  buildYear?: number;
  captainIncluded?: boolean;
  images?: CreateBoatImageDTO[];
  features?: CreateBoatFeatureDTO[];
  services?: CreateBoatServiceDTO[]; // YENİ: Boat services
  documents?: CreateBoatDocumentDTO[]; // YENİ: Boat documents
}

export interface UpdateBoatDTO {
  id: number;
  name?: string;
  description?: string;
  shortDescription?: string;
  model?: string;
  year?: number;
  length?: number; // Double -> number
  capacity?: number;
  dailyPrice?: number; // BigDecimal -> number
  hourlyPrice?: number; // BigDecimal -> number
  location?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  status?: string;
  brandModel?: string;
  buildYear?: number;
  captainIncluded?: boolean;
  imagesToAdd?: UpdateBoatImageDTO[];
  imageIdsToRemove?: number[]; // List<Long> -> number[]
  featuresToAdd?: UpdateBoatFeatureDTO[];
  featureIdsToRemove?: number[]; // List<Long> -> number[]
  documentsToAdd?: CreateBoatDocumentDTO[];
  documentsToUpdate?: UpdateBoatDocumentDTO[];
  documentIdsToRemove?: number[]; // List<Long> -> number[]
}

// Frontend filtreleme için kullanılan interface
export interface BoatFilters {
  types?: string[];
  locations?: string[];
  features?: string[];
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  service?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Boat extends BoatDTO {}
export interface BoatCreateRequest extends CreateBoatDTO {}
export interface BoatUpdateRequest extends UpdateBoatDTO {}

// VesselsPage için alias'lar
export interface CreateVesselDTO extends CreateBoatDTO {}
export interface UpdateVesselDTO extends UpdateBoatDTO {}
export interface VesselDTO extends BoatDTO {}
