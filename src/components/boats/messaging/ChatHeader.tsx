import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Captain } from "@/types/captain.types";
import { BookingStatus } from "@/types/booking.types";

export interface ChatHeaderProps {
  captain: Captain;
  bookingId: number;
  bookingStatus: BookingStatus;
  onClose: () => void;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  captain,
  bookingId,
  bookingStatus,
  onClose,
  className,
}) => {
  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "default"; // Green
      case BookingStatus.PENDING:
        return "secondary"; // Yellow/Orange
      case BookingStatus.CANCELLED:
      case BookingStatus.REJECTED:
        return "destructive"; // Red
      case BookingStatus.COMPLETED:
        return "outline"; // Gray
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "Onaylandı";
      case BookingStatus.PENDING:
        return "Beklemede";
      case BookingStatus.CANCELLED:
        return "İptal Edildi";
      case BookingStatus.REJECTED:
        return "Reddedildi";
      case BookingStatus.COMPLETED:
        return "Tamamlandı";
      default:
        return status;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b bg-white",
        "sticky top-0 z-10 shadow-sm",
        className
      )}
    >
      {/* Left side - Captain info and booking details */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Captain Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
            <AvatarImage src={captain.photo} alt={captain.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {getUserInitials(captain.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Captain and Booking Info */}
        <div className="flex-1 min-w-0">
          {/* Captain Name */}
          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
            {captain.name}
          </h3>

          {/* Booking Info Row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Booking ID */}
            <span className="text-xs text-gray-500">
              Rezervasyon #{bookingId}
            </span>

            {/* Status Badge */}
            <Badge
              variant={getStatusBadgeVariant(bookingStatus)}
              className="text-xs px-2 py-0.5"
            >
              {getStatusText(bookingStatus)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Close button */}
      <div className="flex-shrink-0 ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className={cn(
            "h-8 w-8 p-0 rounded-full",
            "hover:bg-gray-100 transition-colors",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}
          aria-label="Sohbeti kapat"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
