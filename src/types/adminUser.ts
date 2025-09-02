// Admin User Management Types
import { UserDTO, UserFilters } from "./contact.types";
import { UserType } from "./auth.types";

// Admin-specific user view with additional information
export interface AdminUserView extends UserDTO {
  registrationDate: string;
  lastLoginDate?: string;
  status: "active" | "suspended" | "banned";
  verificationStatus: "verified" | "pending" | "rejected";
  totalBookings: number;
  totalSpent: number;
  riskScore: number;
  notes: AdminNote[];
  role: UserType;
  email: string; // From account
  username: string; // From account
  isEnabled: boolean; // From account
}

// Admin notes system for user management
export interface AdminNote {
  id: number;
  adminId: number;
  adminName: string;
  note: string;
  type: "info" | "warning" | "important";
  createdAt: string;
}

// Admin user filters extending base filters
export interface AdminUserFilters extends UserFilters {
  role?: UserType;
  status?: "active" | "suspended" | "banned";
  verificationStatus?: "verified" | "pending" | "rejected";
  riskScoreMin?: number;
  riskScoreMax?: number;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  totalBookingsMin?: number;
  totalBookingsMax?: number;
  totalSpentMin?: number;
  totalSpentMax?: number;
  hasNotes?: boolean;
}

// Admin user actions
export interface AdminUserAction {
  userId: number;
  action: "suspend" | "activate" | "ban" | "verify" | "reject";
  reason?: string;
  adminNote?: string;
}

// Bulk operations
export interface BulkUserAction {
  userIds: number[];
  action: "suspend" | "activate" | "ban" | "verify" | "reject";
  reason?: string;
  adminNote?: string;
}

// User statistics for admin dashboard
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    customers: number;
    boatOwners: number;
    admins: number;
  };
  verificationStats: {
    verified: number;
    pending: number;
    rejected: number;
  };
}

// User activity log
export interface UserActivityLog {
  id: number;
  userId: number;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Admin user update command
export interface AdminUserUpdateCommand {
  id: number;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
  role?: UserType; // Only SUPER_ADMIN can change roles
  status?: "active" | "suspended" | "banned";
  verificationStatus?: "verified" | "pending" | "rejected";
  adminNote?: string;
}

// Password reset request
export interface AdminPasswordResetRequest {
  userId: number;
  newPassword?: string; // If not provided, generates temporary password
  sendEmail: boolean;
  adminNote?: string;
}

// User search result
export interface AdminUserSearchResult {
  users: AdminUserView[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}
