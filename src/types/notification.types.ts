export interface NotificationDTO {
  id: number;
  userId: number;
  userFullName: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM' | 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'BOAT_CREATED' | 'BOAT_AVAILABILITY_CHANGED'; // NotificationType enum
  isRead: boolean;
  relatedEntityId: number;
  relatedEntityType: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}