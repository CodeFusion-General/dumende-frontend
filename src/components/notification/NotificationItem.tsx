import React from 'react';
import {
  Bell,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Check,
  CalendarPlus,
  Anchor,
  MapPin
} from 'lucide-react';
import { NotificationDTO } from '@/types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface NotificationItemProps {
  notification: NotificationDTO;
  onMarkRead?: (id: number) => void;
  showMarkAsRead?: boolean;
}

function timeAgo(timestamp: string): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function NotificationItem({
  notification,
  onMarkRead,
  showMarkAsRead = false
}: NotificationItemProps) {
  const getIcon = (type: NotificationDTO['type']) => {
    switch (type) {
      case 'INFO':
        return <Info className="h-4 w-4 text-info" />;
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'SYSTEM':
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      case 'BOOKING_CREATED':
        return <CalendarPlus className="h-4 w-4 text-primary" />;
      case 'BOOKING_CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'BOOKING_CANCELLED':
        return <XCircle className="h-4 w-4 text-warning" />;
      case 'BOOKING_COMPLETED':
        return <Check className="h-4 w-4 text-success" />;
      case 'BOAT_CREATED':
        return <Anchor className="h-4 w-4 text-primary" />;
      case 'BOAT_AVAILABILITY_CHANGED':
        return <MapPin className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDotColor = (type: NotificationDTO['type']) => {
    switch (type) {
      case 'INFO':
        return 'bg-info';
      case 'SUCCESS':
        return 'bg-success';
      case 'WARNING':
        return 'bg-warning';
      case 'ERROR':
        return 'bg-destructive';
      case 'SYSTEM':
        return 'bg-muted-foreground';
      case 'BOOKING_CREATED':
        return 'bg-primary';
      case 'BOOKING_CONFIRMED':
        return 'bg-success';
      case 'BOOKING_CANCELLED':
        return 'bg-warning';
      case 'BOOKING_COMPLETED':
        return 'bg-success';
      case 'BOAT_CREATED':
        return 'bg-primary';
      case 'BOAT_AVAILABILITY_CHANGED':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      className={`group relative flex items-start space-x-4 p-4 hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/5 transition-all duration-300 cursor-pointer ${
        !notification.isRead ? 'bg-gradient-to-r from-accent/5 to-transparent border-l-2 border-l-accent' : ''
      }`}
      onClick={handleClick}
    >
      {/* Left: Icon with background */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
          notification.isRead
            ? 'bg-muted/20'
            : `${getDotColor(notification.type)}/10`
        }`}
      >
        {getIcon(notification.type)}
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <p
                className={`text-sm font-medium text-foreground leading-tight ${
                  !notification.isRead ? 'font-semibold' : ''
                }`}
              >
                {notification.title}
              </p>
              {!notification.isRead && (
                <div
                  className={`w-2 h-2 rounded-full ${getDotColor(notification.type)} animate-pulse`}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground/80 font-medium">
                {timeAgo(notification.createdAt)}
              </span>

              {showMarkAsRead && !notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead?.(notification.id);
                  }}
                  className="text-xs h-6 px-2 text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle hover indicator */}
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-full"></div>
    </div>
  );
}