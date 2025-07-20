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
    <div className="absolute right-0 top-full mt-4 w-96 bg-white/95 border-0 shadow-2xl rounded-2xl z-50 overflow-hidden backdrop-blur-xl">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80" />
      
      {/* Header with enhanced styling */}
      <div className="relative bg-gradient-to-r from-[#3498db]/10 via-[#2c3e50]/5 to-[#3498db]/10 p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-white/30 backdrop-blur-sm">
              <Bell className="w-5 h-5 text-[#2c3e50]" />
            </div>
            <h3 className="font-montserrat font-bold text-lg text-[#2c3e50]">Notifications</h3>
          </div>
          {unreadNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-pulse shadow-sm"></div>
              <span className="text-xs font-roboto font-medium text-gray-600">
                {unreadNotifications.length} new
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative max-h-96 overflow-y-auto custom-scrollbar">
        {unreadNotifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3498db]/20 to-[#2c3e50]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bell className="w-8 h-8 text-[#3498db]" />
                </div>
              </div>
              {/* Floating accent circles */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-60 animate-pulse delay-300"></div>
            </div>
            <h4 className="font-montserrat font-bold text-lg text-[#2c3e50] mb-2">All caught up!</h4>
            <p className="text-sm text-gray-600 font-roboto">No new notifications to show</p>
            <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {unreadNotifications.slice(0, 3).map((notification, index) => (
              <div key={notification.id} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <NotificationItem
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Enhanced Footer */}
      <div className="relative p-4 bg-gradient-to-r from-white/40 to-white/20 border-t border-white/20 backdrop-blur-sm">
        <Button
          variant="ghost"
          className="group w-full text-[#3498db] hover:bg-[#3498db]/10 hover:text-[#2c3e50] font-montserrat font-semibold transition-all duration-300 rounded-xl py-3 backdrop-blur-sm border border-transparent hover:border-[#3498db]/20 hover:shadow-lg transform hover:scale-105"
          onClick={onShowAll}
        >
          <span>View All Notifications</span>
          <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}