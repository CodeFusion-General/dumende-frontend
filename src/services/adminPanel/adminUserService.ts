import { BaseService } from "../base/BaseService";
import { userService } from "../userService";
import {
  AdminUserView,
  AdminUserFilters,
  AdminUserAction,
  BulkUserAction,
  UserStatistics,
  UserActivityLog,
  AdminUserUpdateCommand,
  AdminPasswordResetRequest,
  AdminUserSearchResult,
  AdminNote,
} from "@/types/adminUser";
import { UserDTO } from "@/types/contact.types";
import { UserType } from "@/types/auth.types";

class AdminUserService extends BaseService {
  constructor() {
    super("/admin/users");
  }

  // Get all users with admin-specific information
  public async getAdminUsers(
    filters?: AdminUserFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<AdminUserSearchResult> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<AdminUserSearchResult>(`?${queryString}`);
  }

  // Get single user with admin view
  public async getAdminUserById(id: number): Promise<AdminUserView> {
    return this.get<AdminUserView>(`/${id}`);
  }

  // Search users with advanced filters
  public async searchUsers(
    query: string,
    filters?: AdminUserFilters
  ): Promise<AdminUserView[]> {
    const params = {
      q: query,
      ...filters,
    };
    const queryString = this.buildQueryString(params);
    return this.get<AdminUserView[]>(`/search?${queryString}`);
  }

  // Update user information (admin only)
  public async updateUser(
    data: AdminUserUpdateCommand
  ): Promise<AdminUserView> {
    return this.put<AdminUserView>(`/${data.id}`, data);
  }

  // Perform admin action on user
  public async performUserAction(
    action: AdminUserAction
  ): Promise<AdminUserView> {
    return this.post<AdminUserView>(`/${action.userId}/actions`, action);
  }

  // Bulk operations on multiple users
  public async performBulkAction(
    action: BulkUserAction
  ): Promise<AdminUserView[]> {
    return this.post<AdminUserView[]>("/bulk-actions", action);
  }

  // Get user statistics
  public async getUserStatistics(): Promise<UserStatistics> {
    return this.get<UserStatistics>("/statistics");
  }

  // Get user activity log
  public async getUserActivityLog(
    userId: number,
    page?: number,
    size?: number
  ): Promise<{
    activities: UserActivityLog[];
    totalCount: number;
    totalPages: number;
  }> {
    const params = { page, size };
    const queryString = this.buildQueryString(params);
    return this.get(`/${userId}/activity?${queryString}`);
  }

  // Add admin note to user
  public async addUserNote(
    userId: number,
    note: string,
    type: "info" | "warning" | "important"
  ): Promise<AdminNote> {
    return this.post<AdminNote>(`/${userId}/notes`, { note, type });
  }

  // Get user notes
  public async getUserNotes(userId: number): Promise<AdminNote[]> {
    return this.get<AdminNote[]>(`/${userId}/notes`);
  }

  // Delete user note
  public async deleteUserNote(userId: number, noteId: number): Promise<void> {
    return this.delete<void>(`/${userId}/notes/${noteId}`);
  }

  // Reset user password
  public async resetUserPassword(
    request: AdminPasswordResetRequest
  ): Promise<{ temporaryPassword?: string; message: string }> {
    return this.post(`/${request.userId}/reset-password`, request);
  }

  // Get users by role
  public async getUsersByRole(
    role: UserType,
    page?: number,
    size?: number
  ): Promise<AdminUserSearchResult> {
    const params = { role, page, size };
    const queryString = this.buildQueryString(params);
    return this.get<AdminUserSearchResult>(`/by-role?${queryString}`);
  }

  // Get users with pending verification
  public async getPendingVerificationUsers(): Promise<AdminUserView[]> {
    return this.get<AdminUserView[]>("/pending-verification");
  }

  // Get suspended users
  public async getSuspendedUsers(): Promise<AdminUserView[]> {
    return this.get<AdminUserView[]>("/suspended");
  }

  // Get users with high risk score
  public async getHighRiskUsers(
    threshold: number = 7
  ): Promise<AdminUserView[]> {
    return this.get<AdminUserView[]>(`/high-risk?threshold=${threshold}`);
  }

  // Export users data
  public async exportUsers(
    filters?: AdminUserFilters,
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    const params = { ...filters, format };
    const queryString = this.buildQueryString(params);
    return this.getBlob(`/export?${queryString}`);
  }

  // Get user booking history for admin view
  public async getUserBookingHistory(userId: number): Promise<any[]> {
    return this.get<any[]>(`/${userId}/bookings`);
  }

  // Get user payment history for admin view
  public async getUserPaymentHistory(userId: number): Promise<any[]> {
    return this.get<any[]>(`/${userId}/payments`);
  }

  // Verify user account
  public async verifyUser(
    userId: number,
    adminNote?: string
  ): Promise<AdminUserView> {
    return this.post<AdminUserView>(`/${userId}/verify`, { adminNote });
  }

  // Reject user verification
  public async rejectUserVerification(
    userId: number,
    reason: string,
    adminNote?: string
  ): Promise<AdminUserView> {
    return this.post<AdminUserView>(`/${userId}/reject`, { reason, adminNote });
  }

  // Suspend user account
  public async suspendUser(
    userId: number,
    reason: string,
    adminNote?: string
  ): Promise<AdminUserView> {
    return this.post<AdminUserView>(`/${userId}/suspend`, {
      reason,
      adminNote,
    });
  }

  // Activate user account
  public async activateUser(
    userId: number,
    adminNote?: string
  ): Promise<AdminUserView> {
    return this.post<AdminUserView>(`/${userId}/activate`, { adminNote });
  }

  // Ban user account
  public async banUser(
    userId: number,
    reason: string,
    adminNote?: string
  ): Promise<AdminUserView> {
    return this.post<AdminUserView>(`/${userId}/ban`, { reason, adminNote });
  }

  // Mock implementation for development - converts UserDTO to AdminUserView
  private convertToAdminUserView(user: UserDTO): AdminUserView {
    return {
      ...user,
      registrationDate: user.createdAt,
      lastLoginDate: undefined, // Would come from backend
      status: "active", // Default status
      verificationStatus: "verified", // Default verification
      totalBookings: user.bookings?.length || 0,
      totalSpent: 0, // Would be calculated from bookings
      riskScore: Math.floor(Math.random() * 10), // Mock risk score
      notes: [], // Empty notes array
      role: (user.account?.role as UserType) || UserType.CUSTOMER,
      email: user.account?.email || "",
      username: user.account?.username || "",
      isEnabled: user.account?.isEnabled || true,
    };
  }

  // Temporary method to use existing userService for development
  public async getAdminUsersFromUserService(
    filters?: AdminUserFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<AdminUserSearchResult> {
    try {
      // Use existing userService to get users
      const result = await userService.getUsersPaginated(filters);

      // Convert to AdminUserView format
      const adminUsers = result.content.map((user) =>
        this.convertToAdminUserView(user)
      );

      return {
        users: adminUsers,
        totalCount: result.totalElements,
        page: result.number,
        size: result.size,
        totalPages: result.totalPages,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Mock statistics for development
  public async getMockUserStatistics(): Promise<UserStatistics> {
    try {
      const users = await userService.getUsers();
      const totalUsers = users.length;

      return {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.85),
        suspendedUsers: Math.floor(totalUsers * 0.1),
        bannedUsers: Math.floor(totalUsers * 0.05),
        newUsersThisMonth: Math.floor(totalUsers * 0.15),
        usersByRole: {
          customers: Math.floor(totalUsers * 0.7),
          boatOwners: Math.floor(totalUsers * 0.25),
          admins: Math.floor(totalUsers * 0.05),
        },
        verificationStats: {
          verified: Math.floor(totalUsers * 0.8),
          pending: Math.floor(totalUsers * 0.15),
          rejected: Math.floor(totalUsers * 0.05),
        },
      };
    } catch (error) {
      // Return mock data if service fails
      return {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        bannedUsers: 0,
        newUsersThisMonth: 0,
        usersByRole: {
          customers: 0,
          boatOwners: 0,
          admins: 0,
        },
        verificationStats: {
          verified: 0,
          pending: 0,
          rejected: 0,
        },
      };
    }
  }
}

export const adminUserService = new AdminUserService();
