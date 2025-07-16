import { BaseService } from './base/BaseService';
import { NotificationDTO } from '../types/notification.types';

class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }

  public async fetchNotificationCount(userId: number): Promise<number> {
    return this.get<number>(`/user/${userId}/count`);
  }
  
  public async fetchUnreadCount(userId: number): Promise<number> {
  return this.get<number>(`/user/${userId}/unread/count`);
  }

  public async fetchUnreadNotifications(userId: number): Promise<NotificationDTO[]> {
    const notifications = await this.get<NotificationDTO[]>(`/user/${userId}/unread`);
    return notifications
      .filter(notification => notification.userId === userId && !notification.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3); // Show only top 3 in dropdown
  }

  public async fetchNotificationsPage(
    userId: number,
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
    return this.getPaginated<NotificationDTO>(`/user/${userId}`, { page, size });
  }

  public async markNotificationRead(notificationId: number): Promise<void> {
    await this.put(`/${notificationId}/read`);
  }

  public async markAllNotificationsRead(userId: number): Promise<void> {
    await this.put(`/user/${userId}/read-all`);
  }

}

export const notificationService = new NotificationService();