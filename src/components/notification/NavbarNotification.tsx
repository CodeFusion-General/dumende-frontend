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
        className="group relative p-3 rounded-full transition-all duration-300 ease-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {/* Background with glassmorphism effect */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Bell icon with enhanced styling */}
        <div className="relative">
          <Bell 
            size={24} 
            className={`text-white transition-all duration-300 ${
              unreadCount > 0 
                ? 'drop-shadow-lg group-hover:text-yellow-200' 
                : 'group-hover:text-blue-200'
            }`}
          />
          
          {/* Notification pulse effect for unread notifications */}
          {unreadCount > 0 && (
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping" />
          )}
        </div>

        {/* Enhanced badge with modern styling */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <div className="relative">
              {/* Badge glow effect */}
              <div className="absolute inset-0 bg-red-500/50 rounded-full blur-sm animate-pulse" />
              
              {/* Main badge */}
              <Badge 
                variant="destructive" 
                className="relative h-6 w-6 flex items-center justify-center text-xs p-0 min-w-[1.5rem] bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg font-bold font-montserrat"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </div>
          </div>
        )}

        {/* Subtle ring indicator for active state */}
        {isOpen && (
          <div className="absolute inset-0 rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-transparent" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Enhanced backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" 
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