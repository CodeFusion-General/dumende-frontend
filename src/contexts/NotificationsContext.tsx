import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
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

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.fetchUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      // Silently fail - notification count is not critical
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshUnreadCount();
    }
  }, [userId, refreshUnreadCount]);

  // Memoize value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    unreadCount,
    setUnreadCount,
    refreshUnreadCount,
  }), [unreadCount, refreshUnreadCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}