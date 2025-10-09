import { BaseService } from "./base/BaseService";

// Account History DTO interfaces (backend DTO'larla uyumlu)
export interface AccountHistoryDTO {
  id: number;
  userId: number;
  username: string;
  actionType: string;
  actionDetails: string;
  entityType: string;
  entityId: number;
  ipAddress: string;
  userAgent: string;
  requestDate: string;
  responseStatus: string;
  metadata?: string;
  sessionId?: string;
  deviceInfo?: string;
  locationInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountHistorySummaryDTO {
  userId: number;
  username: string;
  totalActions: number;
  firstActionDate: string;
  lastActionDate: string;
  actionCounts: Record<string, number>;
  uniqueIpAddresses: string[];
  ipAddressCount: number;
  recentActions: AccountHistoryDTO[];
  summaryStartDate: string;
  summaryEndDate: string;
}

export interface CreateAccountHistoryDTO {
  userId: number;
  actionType: string;
  actionDetails: string;
  entityType?: string;
  entityId?: number;
  ipAddress: string;
  userAgent?: string;
  metadata?: string;
  sessionId?: string;
  deviceInfo?: string;
  locationInfo?: string;
}

export interface AccountHistoryFilterDTO {
  userId?: number;
  actionTypes?: string[];
  entityTypes?: string[];
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  sessionId?: string;
}

class AccountHistoryService extends BaseService {
  constructor() {
    super("/v1/account-history");
  }

  // **QUERY ENDPOINTS**

  /**
   * Get account history by ID
   * Backend: GET /api/v1/account-history/{id}
   */
  public async getAccountHistoryById(id: number): Promise<AccountHistoryDTO> {
    return this.get<AccountHistoryDTO>(`/${id}`);
  }

  /**
   * Get all account history (Admin only)
   * Backend: GET /api/v1/account-history/
   */
  public async getAllAccountHistory(): Promise<AccountHistoryDTO[]> {
    return this.get<AccountHistoryDTO[]>("/");
  }

  /**
   * Get user's account history
   * Backend: GET /api/v1/account-history/user/{userId}
   */
  public async getUserAccountHistory(userId: number): Promise<AccountHistoryDTO[]> {
    return this.get<AccountHistoryDTO[]>(`/user/${userId}`);
  }

  /**
   * Get user's account history by action type
   * Backend: GET /api/v1/account-history/user/{userId}/action/{actionType}
   */
  public async getUserAccountHistoryByAction(
    userId: number, 
    actionType: string
  ): Promise<AccountHistoryDTO[]> {
    return this.get<AccountHistoryDTO[]>(`/user/${userId}/action/${actionType}`);
  }

  /**
   * Get user's account history by date range
   * Backend: GET /api/v1/account-history/user/{userId}/date-range
   */
  public async getUserAccountHistoryByDateRange(
    userId: number,
    start: string,
    end: string
  ): Promise<AccountHistoryDTO[]> {
    return this.get<AccountHistoryDTO[]>(`/user/${userId}/date-range`, { start, end });
  }

  /**
   * Get account history by entity
   * Backend: GET /api/v1/account-history/entity/{entityType}/{entityId}
   */
  public async getAccountHistoryByEntity(
    entityType: string,
    entityId: number
  ): Promise<AccountHistoryDTO[]> {
    return this.get<AccountHistoryDTO[]>(`/entity/${entityType}/${entityId}`);
  }

  /**
   * Get user's account history summary
   * Backend: GET /api/v1/account-history/user/{userId}/summary
   */
  public async getUserAccountHistorySummary(userId: number): Promise<AccountHistorySummaryDTO> {
    return this.get<AccountHistorySummaryDTO>(`/user/${userId}/summary`);
  }

  /**
   * Get user's IP addresses
   * Backend: GET /api/v1/account-history/user/{userId}/ip-addresses
   */
  public async getUserIpAddresses(userId: number): Promise<string[]> {
    return this.get<string[]>(`/user/${userId}/ip-addresses`);
  }

  /**
   * Get user's account history count
   * Backend: GET /api/v1/account-history/user/{userId}/count
   */
  public async getUserAccountHistoryCount(userId: number): Promise<number> {
    return this.get<number>(`/user/${userId}/count`);
  }

  /**
   * Search account history with filters
   * Backend: POST /api/v1/account-history/search
   */
  public async searchAccountHistory(filters: AccountHistoryFilterDTO): Promise<AccountHistoryDTO[]> {
    return this.post<AccountHistoryDTO[]>("/search", filters);
  }

  // **COMMAND ENDPOINTS (Admin only)**

  /**
   * Create account history entry
   * Backend: POST /api/v1/account-history/
   */
  public async createAccountHistory(data: CreateAccountHistoryDTO): Promise<AccountHistoryDTO> {
    return this.post<AccountHistoryDTO>("/", data);
  }

  /**
   * Delete account history entry
   * Backend: DELETE /api/v1/account-history/{id}
   */
  public async deleteAccountHistory(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  /**
   * Delete user's account history
   * Backend: DELETE /api/v1/account-history/user/{userId}
   */
  public async deleteUserAccountHistory(userId: number): Promise<void> {
    return this.delete<void>(`/user/${userId}`);
  }

  // **CONVENIENCE METHODS**

  /**
   * Get current user's account history
   */
  public async getMyAccountHistory(): Promise<AccountHistoryDTO[]> {
    // This would require getting current user ID from auth context
    throw new Error("Method requires authentication context. Use getUserAccountHistory with specific userId.");
  }

  /**
   * Get current user's summary
   */
  public async getMyAccountHistorySummary(): Promise<AccountHistorySummaryDTO> {
    // This would require getting current user ID from auth context
    throw new Error("Method requires authentication context. Use getUserAccountHistorySummary with specific userId.");
  }

  /**
   * Get user's recent activity (last 10 actions)
   */
  public async getUserRecentActivity(userId: number): Promise<AccountHistoryDTO[]> {
    const history = await this.getUserAccountHistory(userId);
    return history.slice(0, 10); // Return first 10 (most recent)
  }

  /**
   * Get user's login history
   */
  public async getUserLoginHistory(userId: number): Promise<AccountHistoryDTO[]> {
    return this.getUserAccountHistoryByAction(userId, "USER_LOGIN");
  }

  /**
   * Get user's password change history
   */
  public async getUserPasswordChangeHistory(userId: number): Promise<AccountHistoryDTO[]> {
    return this.getUserAccountHistoryByAction(userId, "PASSWORD_CHANGE");
  }
}

export const accountHistoryService = new AccountHistoryService();