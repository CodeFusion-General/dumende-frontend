export interface NotificationDTO {
  id: number;
  userId: number;
  userFullName: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'MESSAGE'; // NotificationType enum
  isRead: boolean;
  relatedEntityId: number;
  relatedEntityType: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

// Export a mock array of at least 10 items, with 3 unread at top
export const notificationsMock: NotificationDTO[] = [
  {
    id: 1,
    userId: 1,
    userFullName: "John Smith",
    title: "New Booking Confirmed",
    message: "Your sunset cruise booking for August 15th has been confirmed.",
    type: 'INFO',
    isRead: false,
    relatedEntityId: 101,
    relatedEntityType: 'booking',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    userFullName: "Captain Maria Rodriguez",
    title: "Weather Alert",
    message: "High winds expected tomorrow. Your tour may need to be rescheduled.",
    type: 'ALERT',
    isRead: false,
    relatedEntityId: 102,
    relatedEntityType: 'tour',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    userFullName: "Sarah Johnson",
    title: "New Message",
    message: "Hi! I have a question about the dolphin watching tour options.",
    type: 'MESSAGE',
    isRead: false,
    relatedEntityId: 103,
    relatedEntityType: 'message',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    userId: 1,
    userFullName: "System",
    title: "Payment Processed",
    message: "Payment of $450.00 has been successfully processed for your booking.",
    type: 'INFO',
    isRead: true,
    relatedEntityId: 104,
    relatedEntityType: 'payment',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    userId: 1,
    userFullName: "Captain Mike Torres",
    title: "Tour Update",
    message: "Great news! We spotted a family of dolphins on your upcoming route.",
    type: 'INFO',
    isRead: true,
    relatedEntityId: 105,
    relatedEntityType: 'tour',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    userId: 1,
    userFullName: "David Chen",
    title: "Booking Reminder",
    message: "Don't forget your island hopping tour is tomorrow at 9:00 AM.",
    type: 'INFO',
    isRead: true,
    relatedEntityId: 106,
    relatedEntityType: 'booking',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    userId: 1,
    userFullName: "Emma Wilson",
    title: "New Message",
    message: "Thank you for the amazing tour! Left a 5-star review.",
    type: 'MESSAGE',
    isRead: true,
    relatedEntityId: 107,
    relatedEntityType: 'review',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    userId: 1,
    userFullName: "System",
    title: "Booking Cancelled",
    message: "Your booking for July 20th has been cancelled due to weather conditions.",
    type: 'ALERT',
    isRead: true,
    relatedEntityId: 108,
    relatedEntityType: 'booking',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    userId: 1,
    userFullName: "Lisa Anderson",
    title: "Special Offer",
    message: "Get 20% off your next booking when you book before the end of the month!",
    type: 'INFO',
    isRead: true,
    relatedEntityId: 109,
    relatedEntityType: 'promotion',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    userId: 1,
    userFullName: "Captain Alex Thompson",
    title: "Welcome to Ocean Adventures",
    message: "Welcome aboard! We're excited to provide you with unforgettable boat tour experiences.",
    type: 'INFO',
    isRead: true,
    relatedEntityId: 110,
    relatedEntityType: 'welcome',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 11,
    userId: 1,
    userFullName: "Tom Mitchell",
    title: "Group Booking Inquiry",
    message: "Hi, I'm interested in booking a private tour for 15 people. Can you help?",
    type: 'MESSAGE',
    isRead: true,
    relatedEntityId: 111,
    relatedEntityType: 'inquiry',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 12,
    userId: 1,
    userFullName: "System",
    title: "Account Verified",
    message: "Your account has been successfully verified. You can now make bookings.",
    type: 'INFO',
    isRead: true,
    relatedEntityId: 112,
    relatedEntityType: 'account',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];