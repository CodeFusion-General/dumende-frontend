import { TourDTO, TourStatus, TourType } from "./tour.types";

// Admin-specific tour view with additional information
export interface AdminTourView extends TourDTO {
  guideInfo: {
    id: number;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    isVerified: boolean;
    isCertified: boolean;
    totalTours: number;
    rating: number;
    responseRate: number;
  };
  approvalStatus: "pending" | "approved" | "rejected" | "suspended";
  approvalDate?: string;
  approvedBy?: number;
  rejectionReason?: string;
  moderationNotes: AdminTourNote[];
  documentStatus: {
    total: number;
    verified: number;
    pending: number;
    expired: number;
    expiringSoon: number;
  };
  bookingStats: {
    totalBookings: number;
    thisMonthBookings: number;
    revenue: number;
    averageRating: number;
    completionRate: number;
  };
  lastActivity: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  reportCount: number;
  lastModeratedAt?: string;
  lastModeratedBy?: number;
}

// Admin tour note system
export interface AdminTourNote {
  id: number;
  adminId: number;
  adminName: string;
  note: string;
  type: "info" | "warning" | "important" | "approval" | "rejection";
  createdAt: string;
  isVisible: boolean;
}

// Tour moderation actions
export interface TourModerationAction {
  action:
    | "approve"
    | "reject"
    | "suspend"
    | "activate"
    | "feature"
    | "unfeature";
  reason?: string;
  note?: string;
}

// Tour filters for admin panel
export interface AdminTourFilters {
  status?: TourStatus[];
  approvalStatus?: ("pending" | "approved" | "rejected" | "suspended")[];
  tourType?: TourType[];
  guideId?: number;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  hasDocumentIssues?: boolean;
  isReported?: boolean;
  isFeatured?: boolean;
  lastActivityDays?: number;
  searchQuery?: string;
}

// Tour statistics for admin dashboard
export interface AdminTourStats {
  total: number;
  active: number;
  pending: number;
  rejected: number;
  suspended: number;
  draft: number;
  newThisMonth: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  averageRating: number;
  totalBookings: number;
  completionRate: number;
  reportedTours: number;
  expiredDocuments: number;
  expiringSoonDocuments: number;
}

// Bulk operations for tours
export interface TourBulkOperation {
  tourIds: number[];
  operation:
    | "approve"
    | "reject"
    | "suspend"
    | "activate"
    | "delete"
    | "feature"
    | "unfeature";
  reason?: string;
  note?: string;
}

// Tour document verification
export interface TourDocumentVerification {
  documentId: number;
  status: "verified" | "rejected" | "pending";
  reason?: string;
  verifiedBy: number;
  verifiedAt: string;
}

// Tour approval request
export interface TourApprovalRequest {
  tourId: number;
  action: "approve" | "reject";
  reason?: string;
  note?: string;
  documentVerifications?: TourDocumentVerification[];
}

// Tour search and sort options
export interface AdminTourSearchOptions {
  query?: string;
  filters?: AdminTourFilters;
  sortBy?:
    | "name"
    | "createdAt"
    | "updatedAt"
    | "rating"
    | "bookings"
    | "revenue"
    | "lastActivity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Tour management permissions
export interface AdminTourPermissions {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canSuspend: boolean;
  canDelete: boolean;
  canFeature: boolean;
  canViewDocuments: boolean;
  canVerifyDocuments: boolean;
  canViewFinancials: boolean;
  canBulkOperations: boolean;
}
