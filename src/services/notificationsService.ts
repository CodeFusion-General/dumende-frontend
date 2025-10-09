import { BaseService } from './base/BaseService';
import { NotificationDTO } from '../types/notification.types';

class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }

  // ✅ DÜZELT: Backend /me endpoint pattern kullanıyor (userId gereksiz)
  // Backend authentication context'ten current user ID alıyor

  public async fetchNotificationCount(): Promise<number> {
    // Backend: GET /api/notifications/me/count
    return this.get<number>(`/me/count`);
  }

  public async fetchUnreadCount(): Promise<number> {
    // Backend: GET /api/notifications/me/unread/count
    return this.get<number>(`/me/unread/count`);
  }

  public async fetchUnreadNotifications(): Promise<NotificationDTO[]> {
    // Backend: GET /api/notifications/me/unread
    const notifications = await this.get<NotificationDTO[]>(`/me/unread`);
    return notifications
      .filter(notification => !notification.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3); // Show only top 3 in dropdown
  }

  public async fetchNotificationsPage(
    page: number,
    size: number
  ): Promise<{
    content: NotificationDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    // Backend: GET /api/notifications/me?page={page}&size={size}
    return this.getPaginated<NotificationDTO>(`/me`, { page, size });
  }

  public async markNotificationRead(notificationId: number): Promise<void> {
    // Backend: PUT /api/notifications/{notificationId}/read
    await this.put(`/${notificationId}/read`);
  }

  public async markAllNotificationsRead(): Promise<void> {
    // Backend: PUT /api/notifications/me/read-all
    await this.put(`/me/read-all`);
  }

  // **ADMIN NOTIFICATION ENDPOINTS**

  /**
   * Admin: Mark notification as read (Backend: PUT /api/notifications/admin/{notificationId}/read)
   */
  public async markNotificationReadByAdmin(notificationId: number): Promise<void> {
    await this.put(`/admin/${notificationId}/read`);
  }

  /**
   * Admin: Mark all notifications read for a user (Backend: PUT /api/notifications/admin/user/{userId}/read-all)
   */
  public async markAllNotificationsReadByAdmin(userId: number): Promise<void> {
    await this.put(`/admin/user/${userId}/read-all`);
  }

  /**
   * Admin: Delete notification (Backend: DELETE /api/notifications/admin/{notificationId})
   */
  public async deleteNotificationByAdmin(notificationId: number): Promise<void> {
    await this.delete(`/admin/${notificationId}`);
  }

  /**
   * Admin: Bulk cleanup notifications (Backend: POST /api/notifications/admin/bulk-cleanup)
   */
  public async bulkCleanupNotifications(
    daysOld: number, 
    userIds?: number[]
  ): Promise<string> {
    const params: any = { daysOld };
    if (userIds && userIds.length > 0) {
      params.userIds = userIds.join(',');
    }
    return this.post<string>('/admin/bulk-cleanup', null, params);
  }

  /**
   * Admin: Get notifications for a specific user (Backend: GET /api/notifications/admin/user/{userId})
   */
  public async getNotificationsByUserId(userId: number): Promise<NotificationDTO[]> {
    return this.get<NotificationDTO[]>(`/admin/user/${userId}`);
  }

  /**
   * Admin: Get notifications by entity (Backend: GET /api/notifications/entity/{entityType}/{entityId})
   */
  public async getNotificationsByEntity(
    entityType: string, 
    entityId: number
  ): Promise<NotificationDTO[]> {
    return this.get<NotificationDTO[]>(`/entity/${entityType}/${entityId}`);
  }

  /**
   * Get notification statistics (Backend: GET /api/notifications/me/stats)
   */
  public async getNotificationStats(): Promise<{
    totalCount: number;
    unreadCount: number;
    criticalCount: number;
    recentCount: number;
  }> {
    return this.get('/me/stats');
  }

  /**
   * Get critical notifications (Backend: GET /api/notifications/me/critical)
   */
  public async getCriticalNotifications(): Promise<NotificationDTO[]> {
    return this.get<NotificationDTO[]>('/me/critical');
  }

  /**
   * Get notifications by type (Backend: GET /api/notifications/me/type/{type})
   */
  public async getNotificationsByType(type: string): Promise<NotificationDTO[]> {
    return this.get<NotificationDTO[]>(`/me/type/${type}`);
  }

  /**
   * Delete notification for current user (Backend: DELETE /api/notifications/{notificationId})
   */
  public async deleteNotification(notificationId: number): Promise<void> {
    await this.delete(`/${notificationId}`);
  }

  /**
   * Cleanup old notifications (Backend: DELETE /api/notifications/me/cleanup)
   */
  public async cleanupOldNotifications(daysOld: number): Promise<void> {
    await this.delete(`/me/cleanup?daysOld=${daysOld}`);
  }

}

export const notificationService = new NotificationService();