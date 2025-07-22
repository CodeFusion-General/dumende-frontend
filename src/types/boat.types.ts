// Boat ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// Availability (Müsaitlik) Types
export interface AvailabilityDTO {
  id: number;
  boatId: number;
  date: string; // LocalDate -> string
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number, nullable
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityDTO {
  boatId: number;
  date: string; // LocalDate -> string
  isAvailable: boolean;
  priceOverride?: number; // BigDecimal -> number, nullable
}

export interface UpdateAvailabilityDTO {
  id: number;
  date?: string; // LocalDate -> string
  isAvailable?: boolean;
  priceOverride?: number; // BigDecimal -> number, nullable
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
  imageUrl: string; // URL olarak tutuluyor artık
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatImageDTO {
  imageUrl: string; // URL olarak gönderiliyor
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
  model: string;
  year: number;
  length: number; // Double -> number
  capacity: number;
  dailyPrice: number; // BigDecimal -> number
  hourlyPrice: number; // BigDecimal -> number
  location: string;
  rating?: number; // Double -> number, nullable
  type: string;
  status: string;
  brandModel: string;
  buildYear: number;
  captainIncluded: boolean;
  images: BoatImageDTO[];
  features: BoatFeatureDTO[];
  availabilities: AvailabilityDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoatDTO {
  name: string;
  description?: string;
  model?: string;
  year?: number;
  length?: number; // Double -> number
  capacity: number;
  dailyPrice: number; // BigDecimal -> number
  hourlyPrice: number; // BigDecimal -> number
  location: string;
  type: string;
  status?: string;
  brandModel?: string;
  buildYear?: number;
  captainIncluded?: boolean;
  images?: CreateBoatImageDTO[];
  features?: CreateBoatFeatureDTO[];
}

export interface UpdateBoatDTO {
  id: number;
  name?: string;
  description?: string;
  model?: string;
  year?: number;
  length?: number; // Double -> number
  capacity?: number;
  dailyPrice?: number; // BigDecimal -> number
  hourlyPrice?: number; // BigDecimal -> number
  location?: string;
  type?: string;
  status?: string;
  brandModel?: string;
  buildYear?: number;
  captainIncluded?: boolean;
  imagesToAdd?: UpdateBoatImageDTO[];
  imageIdsToRemove?: number[]; // List<Long> -> number[]
  featuresToAdd?: UpdateBoatFeatureDTO[];
  featureIdsToRemove?: number[]; // List<Long> -> number[]
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
