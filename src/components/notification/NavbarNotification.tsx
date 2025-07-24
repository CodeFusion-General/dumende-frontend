import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "./NotificationDropdown";
import { NotificationDTO } from "@/types/notification.types";
import { notificationService } from "@/services/notificationsService";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useNavigate } from "react-router-dom";

interface NavbarNotificationProps {
  userId: number;
  isScrolled?: boolean;
}

export function NavbarNotification({
  userId,
  isScrolled = false,
}: NavbarNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<
    NotificationDTO[]
  >([]);
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      try {
        const notifications =
          await notificationService.fetchUnreadNotifications(userId);
        setUnreadNotifications(notifications);
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
      }
    };

    if (isOpen) {
      loadUnreadNotifications();
    }
  }, [isOpen, userId]);

  const handleMarkRead = async (notificationId: number) => {
    try {
      await notificationService.markNotificationRead(notificationId);
      setUnreadNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      await refreshUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleShowAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`group relative p-2 rounded-xl transition-all duration-300 ease-out transform hover:scale-105 focus:outline-none ${
          isScrolled
            ? "hover:bg-[#3498db]/10 focus:ring-2 focus:ring-[#3498db]/20"
            : "hover:bg-white/10 focus:ring-2 focus:ring-white/20"
        }`}
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
      >
        {/* Bell icon with enhanced styling and bold appearance */}
        <div className="relative">
          <Bell
            size={22}
            strokeWidth={2.5}
            className={`transition-all duration-300 ${
              isScrolled
                ? `text-[#2c3e50] ${
                    unreadCount > 0
                      ? "group-hover:text-[#3498db]"
                      : "group-hover:text-[#3498db]"
                  }`
                : `text-white ${
                    unreadCount > 0
                      ? "drop-shadow-lg group-hover:text-yellow-200"
                      : "group-hover:text-accent"
                  }`
            }`}
          />

          {/* Notification pulse effect for unread notifications */}
          {unreadCount > 0 && (
            <div
              className={`absolute inset-0 rounded-full animate-ping ${
                isScrolled ? "bg-[#3498db]/30" : "bg-yellow-400/30"
              }`}
            />
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
                className="relative h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem] bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg font-bold font-montserrat"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </div>
          </div>
        )}

        {/* Subtle ring indicator for active state */}
        {isOpen && (
          <div
            className={`absolute inset-0 rounded-xl ring-2 ring-offset-2 ring-offset-transparent ${
              isScrolled ? "ring-[#3498db]/30" : "ring-white/30"
            }`}
          />
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          unreadNotifications={unreadNotifications}
          onMarkRead={handleMarkRead}
          onShowAll={handleShowAll}
        />
      )}
    </div>
  );
}
