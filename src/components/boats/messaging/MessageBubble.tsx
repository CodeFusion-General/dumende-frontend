import React from "react";
import { MessageDTO, ReadStatus } from "@/types/message.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock } from "lucide-react";

export interface MessageBubbleProps {
  message: MessageDTO;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showTimestamp = true,
  showAvatar = true,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("tr-TR", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getReadStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.readStatus) {
      case ReadStatus.READ:
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case ReadStatus.UNREAD:
        return <Check className="w-3 h-3 text-gray-400" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-2 mb-3 max-w-[85%] sm:max-w-[75%] md:max-w-[70%]",
        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={message.sender.profileImage}
              alt={message.sender.fullName}
            />
            <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
              {getUserInitials(message.sender.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {/* Sender Name (only for captain messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 px-1">
            {message.sender.fullName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative px-4 py-2 rounded-2xl break-words",
            "transition-all duration-200 ease-in-out",
            "shadow-sm hover:shadow-md",
            isOwnMessage
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md",
            // Responsive text size
            "text-sm sm:text-base"
          )}
        >
          {/* Message Text */}
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.message}
          </p>

          {/* Message Info Footer */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            )}
          >
            {/* Timestamp */}
            {showTimestamp && (
              <span className="opacity-75">
                {formatTimestamp(message.createdAt)}
              </span>
            )}

            {/* Read Status Icon */}
            {getReadStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
