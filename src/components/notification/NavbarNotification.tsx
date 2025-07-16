import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationDTO } from '@/types/notification.types';
import { notificationService} from '@/services/notificationsService';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useNavigate } from 'react-router-dom';

interface NavbarNotificationProps {
  userId: number;
}

export function NavbarNotification({ userId }: NavbarNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationDTO[]>([]);
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      try {
        const notifications = await notificationService.fetchUnreadNotifications(userId);
        setUnreadNotifications(notifications);
      } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
      }
    };

    if (isOpen) {
      loadUnreadNotifications();
    }
  }, [isOpen, userId]);

  const handleMarkRead = async (notificationId: number) => {
    try {
      await notificationService.markNotificationRead(notificationId);
      setUnreadNotifications(prev => prev.filter(n => n.id !== notificationId));
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleShowAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="text-white hover:text-accent p-2 rounded-full transition-colors relative"
      >
        <Bell size={24} />
        {unreadCount > 1 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <NotificationDropdown
            unreadNotifications={unreadNotifications}
            onMarkRead={handleMarkRead}
            onShowAll={handleShowAll}
          />
        </>
      )}
    </div>
  );
}