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
    super("/admin/users"); // axios baseURL zaten /api
  }

  // Get all users with admin-specific information
  public async getAdminUsers(
    filters?: AdminUserFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<AdminUserSearchResult> {
    // Transform frontend filter keys to backend expected keys
    const backendFilters: Record<string, any> = {};
    if (filters) {
      // Map role -> userType (backend enum name)
      if (filters.role) {
        backendFilters.userType = filters.role;
      }
      // Map status -> isEnabled (active=true, suspended=false)
      if (filters.status === "active") {
        backendFilters.isEnabled = true;
      } else if (filters.status === "suspended") {
        backendFilters.isEnabled = false;
      }
      // Pass pagination params directly
      if (filters.page !== undefined) backendFilters.page = filters.page;
      if (filters.size !== undefined) backendFilters.size = filters.size;
      // Map frontend sort field names to backend field names
      if (filters.sort) {
        const sortFieldMapping: Record<string, string> = {
          user: "fullName",
          role: "account.userType",
          status: "account.isEnabled",
          verification: "account.isEmailVerified",
          fullName: "fullName",
          email: "account.email",
          createdAt: "createdAt",
        };
        const [field, direction] = filters.sort.split(",");
        const mappedField = sortFieldMapping[field] || field;
        backendFilters.sort = `${mappedField},${direction}`;
      }
    }
    const queryString = Object.keys(backendFilters).length > 0
      ? this.buildQueryString(backendFilters)
      : "";
    console.log("[AdminUserService] getAdminUsers called with filters:", filters);
    console.log("[AdminUserService] Backend filters:", backendFilters);
    console.log("[AdminUserService] Query string:", queryString);
    // Backend returns Spring Page format, convert to AdminUserSearchResult
    const response = await this.get<{
      content: any[];
      totalElements: number;
      number: number;
      size: number;
      totalPages: number;
    }>(`?${queryString}`);

    // Convert backend AdminUserListDTO to frontend AdminUserView format
    const users: AdminUserView[] = response.content.map((user: any) => ({
      id: user.id,
      fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      registrationDate: user.createdAt,
      lastLoginDate: user.lastLoginDate,
      status: user.isEnabled ? 'active' : 'suspended',
      verificationStatus: user.isEmailVerified ? 'verified' : 'pending',
      totalBookings: user.bookingCount || 0,
      totalSpent: 0, // Backend doesn't provide this yet
      riskScore: 0, // Backend doesn't provide this yet
      notes: [],
      role: user.userType as UserType,
      email: user.email,
      username: user.email?.split('@')[0] || '',
      isEnabled: user.isEnabled ?? true,
    }));

    return {
      users,
      totalCount: response.page?.totalElements ?? 0,
      page: response.page?.number ?? 0,
      size: response.page?.size ?? 20,
      totalPages: response.page?.totalPages ?? 0,
    };
  }

  /**
   * Alias for getAdminUsers - authService compatibility
   */
  public async getAllUsers(
    filters?: AdminUserFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ): Promise<AdminUserSearchResult> {
    return this.getAdminUsers(filters);
  }

  // Get single user with admin view
  public async getAdminUserById(id: number): Promise<AdminUserView> {
    return this.get<AdminUserView>(`/${id}`);
  }

  /**
   * Alias for getAdminUserById - authService compatibility
   */
  public async getUserById(id: number): Promise<AdminUserView> {
    return this.getAdminUserById(id);
  }

  // Search users with advanced filters (Backend: POST /api/admin/users/search)
  public async searchUsers(
    searchCriteria: AdminUserFilters & { query?: string }
  ): Promise<AdminUserView[]> {
    const searchDto = {
      name: searchCriteria.query,
      email: searchCriteria.email,
      phone: searchCriteria.phoneNumber,
      username: searchCriteria.username,
      userType: searchCriteria.role,
      isEnabled: searchCriteria.status === "active",
      registeredAfter: searchCriteria.registrationDateFrom,
      registeredBefore: searchCriteria.registrationDateTo,
      lastLoginAfter: searchCriteria.lastLoginAfter,
      lastLoginBefore: searchCriteria.lastLoginBefore,
      hasBoats: searchCriteria.hasBoats,
      hasBookings: searchCriteria.hasBookings,
      minBookingCount: searchCriteria.totalBookingsMin,
      maxBookingCount: searchCriteria.totalBookingsMax,
      city: searchCriteria.city,
      country: searchCriteria.country,
      hasRecentActivity: searchCriteria.hasRecentActivity
    };
    return this.post<AdminUserView[]>("/search", searchDto);
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
    // Backend returns AdminUserStatisticsDTO, convert to frontend UserStatistics format
    const response = await this.get<{
      totalUsers: number;
      activeUsers: number;
      suspendedUsers: number;
      customerCount: number;
      boatOwnerCount: number;
      adminCount: number;
      newUsersThisMonth: number;
      verifiedUsers: number;
      unverifiedUsers: number;
    }>("/statistics");

    return {
      totalUsers: response.totalUsers || 0,
      activeUsers: response.activeUsers || 0,
      suspendedUsers: response.suspendedUsers || 0,
      bannedUsers: 0, // Backend doesn't track banned users separately yet
      newUsersThisMonth: response.newUsersThisMonth || 0,
      usersByRole: {
        customers: response.customerCount || 0,
        boatOwners: response.boatOwnerCount || 0,
        admins: response.adminCount || 0,
      },
      verificationStats: {
        verified: response.verifiedUsers || 0,
        pending: response.unverifiedUsers || 0,
        rejected: 0, // Backend doesn't track rejected separately
      },
    };
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

  // Get users by role (Backend: GET /api/admin/users/type/{userType})
  public async getUsersByRole(
    role: UserType,
    page?: number,
    size?: number
  ): Promise<AdminUserSearchResult> {
    const params = { page, size };
    const queryString = this.buildQueryString(params);
    return this.get<AdminUserSearchResult>(`/type/${role}?${queryString}`);
  }

  /**
   * Alias for getUsersByRole - authService compatibility
   */
  public async getUsersByType(
    userType: UserType,
    page?: number,
    size?: number
  ): Promise<AdminUserSearchResult> {
    return this.getUsersByRole(userType, page, size);
  }

  // Get recent users (Backend: GET /api/admin/users/recent)
  public async getRecentUsers(): Promise<AdminUserView[]> {
    return this.get<AdminUserView[]>("/recent");
  }

  // Get active users (Backend: GET /api/admin/users/active)
  public async getActiveUsers(): Promise<AdminUserView[]> {
    return this.get<AdminUserView[]>("/active");
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

