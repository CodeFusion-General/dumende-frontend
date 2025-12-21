// VesselsPage form için type tanımları

import { BoatImageDTO, ServiceType, BoatServiceDTO } from "./boat.types";
import { BoatDocumentDTO, CreateBoatDocumentDTO } from "./document.types";

// Form data interface - VesselsPage formunda kullanılır
export interface VesselFormData {
  // Temel bilgiler
  type: string;
  brandModel: string;
  name: string;
  buildYear: string;
  lastMaintenanceYear: string;
  toiletCount: string;
  fullCapacity: string;
  diningCapacity: string;
  length: string;
  flag: string;
  material: string;
  description: string;

  // Fiyatlandırma
  dailyPrice: string;
  hourlyPrice: string;

  // Lokasyon
  location: string;
  latitude?: number;
  longitude?: number;
  departurePoint: string;
  returnPoint: string;

  // Şartlar
  smokingRule: string;
  petPolicy: string;
  alcoholPolicy: string;
  musicPolicy: string;
  additionalRules: string;

  // Servisler
  mealService: string;
  djService: string;
  waterSports: string;
  otherServices: string;

  // Açıklamalar
  shortDescription: string;
  detailedDescription: string;

  // Organizasyonlar
  organizationTypes: string[];
  organizationDetails: string;

  // Dosyalar
  images: File[];
  existingImages: BoatImageDTO[];
  imageIdsToRemove: number[];
  features: string[];

  // Boat Services
  boatServices: Array<{
    name: string;
    description: string;
    price: number;
    serviceType: ServiceType;
    quantity: number;
  }>;

  // Documents
  documents: BoatDocumentDTO[];
  // Pending documents for new boats (with base64 data)
  pendingDocuments: CreateBoatDocumentDTO[];
}

// Initial form state
export const INITIAL_VESSEL_FORM_DATA: VesselFormData = {
  type: "",
  brandModel: "",
  name: "",
  buildYear: "",
  lastMaintenanceYear: "",
  toiletCount: "",
  fullCapacity: "",
  diningCapacity: "",
  length: "",
  flag: "",
  material: "",
  description: "",
  dailyPrice: "",
  hourlyPrice: "",
  location: "",
  latitude: undefined,
  longitude: undefined,
  departurePoint: "",
  returnPoint: "",
  smokingRule: "",
  petPolicy: "",
  alcoholPolicy: "",
  musicPolicy: "",
  additionalRules: "",
  mealService: "",
  djService: "",
  waterSports: "",
  otherServices: "",
  shortDescription: "",
  detailedDescription: "",
  organizationTypes: [],
  organizationDetails: "",
  images: [],
  existingImages: [],
  imageIdsToRemove: [],
  features: [],
  boatServices: [],
  documents: [],
  pendingDocuments: [],
};
