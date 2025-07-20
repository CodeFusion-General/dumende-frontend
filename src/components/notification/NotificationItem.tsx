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

  const getTypeGradient = (type: NotificationDTO['type']) => {
    switch (type) {
      case 'INFO':
        return 'from-blue-50 to-indigo-50';
      case 'SUCCESS':
        return 'from-green-50 to-emerald-50';
      case 'WARNING':
        return 'from-yellow-50 to-orange-50';
      case 'ERROR':
        return 'from-red-50 to-pink-50';
      case 'SYSTEM':
        return 'from-gray-50 to-slate-50';
      case 'BOOKING_CREATED':
        return 'from-blue-50 to-indigo-50';
      case 'BOOKING_CONFIRMED':
        return 'from-green-50 to-emerald-50';
      case 'BOOKING_CANCELLED':
        return 'from-yellow-50 to-orange-50';
      case 'BOOKING_COMPLETED':
        return 'from-green-50 to-emerald-50';
      case 'BOAT_CREATED':
        return 'from-blue-50 to-indigo-50';
      case 'BOAT_AVAILABILITY_CHANGED':
        return 'from-yellow-50 to-orange-50';
      default:
        return 'from-gray-50 to-slate-50';
    }
  };

  const getTypeAccentColor = (type: NotificationDTO['type']) => {
    switch (type) {
      case 'INFO':
        return 'from-blue-400 to-indigo-400';
      case 'SUCCESS':
        return 'from-green-400 to-emerald-400';
      case 'WARNING':
        return 'from-yellow-400 to-orange-400';
      case 'ERROR':
        return 'from-red-400 to-pink-400';
      case 'SYSTEM':
        return 'from-gray-400 to-slate-400';
      case 'BOOKING_CREATED':
        return 'from-blue-400 to-indigo-400';
      case 'BOOKING_CONFIRMED':
        return 'from-green-400 to-emerald-400';
      case 'BOOKING_CANCELLED':
        return 'from-yellow-400 to-orange-400';
      case 'BOOKING_COMPLETED':
        return 'from-green-400 to-emerald-400';
      case 'BOAT_CREATED':
        return 'from-blue-400 to-indigo-400';
      case 'BOAT_AVAILABILITY_CHANGED':
        return 'from-yellow-400 to-orange-400';
      default:
        return 'from-gray-400 to-slate-400';
    }
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-0.5 cursor-pointer focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 ${
        !notification.isRead ? 'bg-gradient-to-r from-accent/5 to-transparent border-l-2 border-l-accent' : ''
      }`}
      onClick={handleClick}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(notification.type)} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
        aria-hidden="true"
      />

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Status Accent Line */}
      {!notification.isRead && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${getTypeAccentColor(notification.type)}`} />
      )}

      <div className="relative flex items-start space-x-4 p-4">
        {/* Left: Enhanced Icon with background */}
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 backdrop-blur-sm ${
              notification.isRead
                ? 'bg-white/30'
                : 'bg-white/40 shadow-lg'
            }`}
          >
            <div className={`p-1.5 rounded-full ${notification.isRead ? 'bg-gray-100/50' : `${getDotColor(notification.type)}/20`}`}>
              {getIcon(notification.type)}
            </div>
          </div>
        </div>

        {/* Middle: Enhanced Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <p
                  className={`text-sm font-montserrat leading-tight text-[#2c3e50] ${
                    !notification.isRead ? 'font-bold' : 'font-semibold'
                  }`}
                >
                  {notification.title}
                </p>
                {!notification.isRead && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${getTypeAccentColor(notification.type)} animate-pulse shadow-sm`}
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 font-roboto leading-relaxed line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/30">
                <span className="text-xs text-gray-500 font-roboto font-medium">
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
                    className="text-xs h-7 px-3 text-[#3498db] hover:bg-[#3498db]/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full font-roboto font-medium backdrop-blur-sm"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${getTypeAccentColor(notification.type)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </div>
  );
}