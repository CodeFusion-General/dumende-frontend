// Admin Boat Management Types
import { BoatDTO, BoatFilters } from "./boat.types";
import { BoatDocumentDTO } from "./document.types";

// Admin-specific boat view with additional information
export interface AdminBoatView extends BoatDTO {
  ownerInfo: {
    id: number;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
  };
  approvalStatus: "pending" | "approved" | "rejected";
  approvalDate?: string;
  approvedBy?: number;
  rejectionReason?: string;
  documentStatus: {
    total: number;
    verified: number;
    pending: number;
    expired: number;
  };
  bookingStats: {
    totalBookings: number;
    thisMonthBookings: number;
    revenue: number;
    averageRating: number;
  };
  lastActivity: string;
}

// Admin boat filters extending base filters
export interface AdminBoatFilters extends BoatFilters {
  approvalStatus?: "pending" | "approved" | "rejected";
  ownerId?: number;
  ownerName?: string;
  documentStatus?: "verified" | "pending" | "expired";
  hasExpiredDocuments?: boolean;
  lastActivityAfter?: string;
  lastActivityBefore?: string;
  revenueMin?: number;
  revenueMax?: number;
  bookingsMin?: number;
  bookingsMax?: number;
  ratingMin?: number;
  ratingMax?: number;
}

// Admin boat actions
export interface AdminBoatAction {
  boatId: number;
  action: "approve" | "reject" | "suspend" | "activate";
  reason?: string;
  adminNote?: string;
}

// Bulk boat operations
export interface BulkBoatAction {
  boatIds: number[];
  action: "approve" | "reject" | "suspend" | "activate";
  reason?: string;
  adminNote?: string;
}

// Boat approval/rejection command
export interface BoatApprovalCommand {
  boatId: number;
  approved: boolean;
  reason?: string;
  adminNote?: string;
  documentVerifications?: DocumentVerification[];
}

// Document verification for boat approval
export interface DocumentVerification {
  documentId: number;
  verified: boolean;
  notes?: string;
  expiryDate?: string;
}

// Boat statistics for admin dashboard
export interface BoatStatistics {
  totalBoats: number;
  activeBoats: number;
  pendingBoats: number;
  rejectedBoats: number;
  suspendedBoats: number;
  newBoatsThisMonth: number;
  boatsByType: {
    [type: string]: number;
  };
  boatsByLocation: {
    [location: string]: number;
  };
  documentStats: {
    totalDocuments: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    expiredDocuments: number;
    expiringSoonDocuments: number;
  };
}

// Boat activity log
export interface BoatActivityLog {
  id: number;
  boatId: number;
  action: string;
  description: string;
  performedBy: number;
  performedByName: string;
  timestamp: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

// Admin boat update command
export interface AdminBoatUpdateCommand {
  id: number;
  name?: string;
  description?: string;
  capacity?: number;
  dailyPrice?: number;
  hourlyPrice?: number;
  location?: string;
  type?: string;
  status?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  adminNote?: string;
}

// Boat search result for admin
export interface AdminBoatSearchResult {
  boats: AdminBoatView[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

// Boat document management
export interface BoatDocumentManagement {
  boatId: number;
  documents: BoatDocumentDTO[];
  verificationStatus: "all_verified" | "pending" | "expired" | "missing";
  expiringSoon: BoatDocumentDTO[];
  expired: BoatDocumentDTO[];
}

// Admin notes for boats
export interface AdminBoatNote {
  id: number;
  boatId: number;
  adminId: number;
  adminName: string;
  note: string;
  type: "info" | "warning" | "important" | "approval" | "rejection";
  createdAt: string;
}

// Boat approval history
export interface BoatApprovalHistory {
  id: number;
  boatId: number;
  action: "approved" | "rejected" | "suspended" | "activated";
  reason?: string;
  adminId: number;
  adminName: string;
  timestamp: string;
  documentSnapshot?: BoatDocumentDTO[];
}

// Boat owner information for admin view
export interface BoatOwnerInfo {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  totalBoats: number;
  activeBoats: number;
  totalRevenue: number;
  averageRating: number;
  verificationStatus: "verified" | "pending" | "rejected";
  riskScore: number;
}

// Boat performance metrics
export interface BoatPerformanceMetrics {
  boatId: number;
  bookingRate: number; // Percentage of available days booked
  averageRating: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number[];
  monthlyBookings: number[];
  popularFeatures: string[];
  competitorComparison: {
    averagePriceInLocation: number;
    averageRatingInLocation: number;
    priceRank: number;
    ratingRank: number;
  };
}

// Boat tab types for the management interface
export type BoatManagementTab = "pending" | "active" | "rejected" | "all";

// Boat status options
export const BOAT_STATUS_OPTIONS = [
  { value: "active", label: "Aktif", color: "green" },
  { value: "inactive", label: "Pasif", color: "gray" },
  { value: "suspended", label: "Askıya Alınmış", color: "red" },
  { value: "maintenance", label: "Bakımda", color: "yellow" },
] as const;

// Boat approval status options
export const BOAT_APPROVAL_STATUS_OPTIONS = [
  { value: "pending", label: "Onay Bekliyor", color: "yellow" },
  { value: "approved", label: "Onaylandı", color: "green" },
  { value: "rejected", label: "Reddedildi", color: "red" },
] as const;

// Boat type options
export const BOAT_TYPE_OPTIONS = [
  "Yelkenli",
  "Motorlu",
  "Katamaran",
  "Gulet",
  "Yat",
  "Tekne",
  "Sürat Teknesi",
  "Balıkçı Teknesi",
] as const;
