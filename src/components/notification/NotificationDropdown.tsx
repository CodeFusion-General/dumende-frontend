import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { NotificationDTO } from '@/types/notification.types';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';

interface NotificationDropdownProps {
  unreadNotifications: NotificationDTO[];
  onMarkRead: (id: number) => void;
  onShowAll: () => void;
}

export function NotificationDropdown({ 
  unreadNotifications, 
  onMarkRead, 
  onShowAll 
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-3 w-96 bg-background border border-border/10 shadow-2xl rounded-2xl z-50 overflow-hidden backdrop-blur-xl bg-background/95">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-4 border-b border-border/10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-lg">Notifications</h3>
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {unreadNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
              <Bell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">No new notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/5">
            {unreadNotifications.slice(0, 3).map((notification, index) => (
              <div key={notification.id} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <NotificationItem
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-muted/5 border-t border-border/10">
        <Button
          variant="ghost"
          className="w-full text-primary hover:bg-primary/10 hover:text-primary font-medium transition-all duration-200 rounded-xl"
          onClick={onShowAll}
        >
          View All Notifications
          <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}