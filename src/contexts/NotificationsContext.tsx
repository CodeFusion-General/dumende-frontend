import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService } from '@/services/notificationsService';

interface NotificationsContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

interface NotificationsProviderProps {
  children: ReactNode;
  userId: number;
}

export function NotificationsProvider({ children, userId }: NotificationsProviderProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = async () => {
    try {
      console.log('[DEBUG_LOG] NotificationsContext: Fetching unread count for userId:', userId);
      const count = await notificationService.fetchUnreadCount(userId);
      console.log('[DEBUG_LOG] NotificationsContext: Received unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('[DEBUG_LOG] NotificationsContext: Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [userId]);

  const value = {
    unreadCount,
    setUnreadCount,
    refreshUnreadCount,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}