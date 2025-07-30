import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  X,
  AlertTriangle,
  Shield,
} from "lucide-react";

import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { useBookingMessaging } from "@/hooks/useBookingMessaging";
import { BookingDTO, BookingStatus } from "@/types/booking.types";
import { Captain } from "@/types/captain.types";
import { ErrorType } from "@/utils/errorHandling";

export interface CustomerCaptainChatProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDTO;
  captain: Captain;
  className?: string;
}

// Error Boundary Component
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat Error Boundary caught an error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bir hata oluştu
          </h3>
          <p className="text-gray-600 mb-4">
            Sohbet yüklenirken bir sorun yaşandı. Lütfen sayfayı yenileyin.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sayfayı Yenile
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton component
const ChatLoadingSkeleton: React.FC = () => (
  <div className="flex flex-col h-full">
    {/* Header skeleton */}
    <div className="flex items-center gap-3 p-4 border-b">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>

    {/* Messages skeleton */}
    <div className="flex-1 p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-2",
            i % 2 === 0 ? "justify-end" : "justify-start"
          )}
        >
          {i % 2 !== 0 && (
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          )}
          <div className={cn("max-w-xs", i % 2 === 0 ? "ml-auto" : "mr-auto")}>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      ))}
    </div>

    {/* Input skeleton */}
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-11" />
        <Skeleton className="w-20 h-11" />
      </div>
    </div>
  </div>
);

// Enhanced connection status indicator
const ConnectionStatus: React.FC<{
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  isOnline: boolean;
}> = ({ connectionStatus, isOnline }) => {
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "Çevrimdışı",
        className: "bg-red-100 text-red-700",
      };
    }

    switch (connectionStatus) {
      case "connected":
        return {
          icon: Wifi,
          text: "Bağlı",
          className: "bg-green-100 text-green-700",
        };
      case "reconnecting":
        return {
          icon: Loader2,
          text: "Bağlanıyor...",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "disconnected":
        return {
          icon: WifiOff,
          text: "Bağlantı Kesildi",
          className: "bg-red-100 text-red-700",
        };
      default:
        return {
          icon: WifiOff,
          text: "Bilinmeyen",
          className: "bg-gray-100 text-gray-700",
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
        className
      )}
    >
      <Icon
        className={cn(
          "w-3 h-3",
          connectionStatus === "reconnecting" && "animate-spin"
        )}
      />
      <span>{text}</span>
    </div>
  );
};

export const CustomerCaptainChat: React.FC<CustomerCaptainChatProps> = ({
  isOpen,
  onClose,
  booking,
  captain,
  className,
}) => {
  // State for component-level error handling
  const [componentError, setComponentError] = useState<string | null>(null);
  const [componentErrorType, setComponentErrorType] =
    useState<ErrorType | null>(null);

  // Refs for auto-scroll functionality
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  // Use booking messaging hook
  const {
    messages,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    errorType,
    hasMore,
    isMessagingEnabled,
    hasAccess,
    accessError,
    accessErrorType,
    isInitializing,
    connectionStatus,
    isOnline,
    sendMessage,
    loadMore,
    refresh,
    markAsRead,
    retry,
    clearError,
    cleanup,
    retryFailedMessage,
  } = useBookingMessaging(booking, {
    enableRealTime: isOpen,
    autoLoadMessages: isOpen,
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  // Component error handling
  const handleComponentError = useCallback(
    (error: unknown, context: string) => {
      const errorMessage =
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu";
      setComponentError(errorMessage);
      setComponentErrorType(ErrorType.UNKNOWN);
      console.error(`Component error in ${context}:`, error);
    },
    []
  );

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      // New messages arrived, scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
      previousMessageCountRef.current = messages.length;
    }
  }, [messages.length, scrollToBottom]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) =>
          msg.readStatus === "UNREAD" && msg.sender.id !== booking.customerId
      );

      unreadMessages.forEach((msg) => {
        markAsRead(msg.id)?.catch?.(console.warn);
      });
    }
  }, [isOpen, messages, booking.customerId, markAsRead]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setComponentError(null);
      clearError();
    }
  }, [isOpen, cleanup, clearError]);

  // Handle message sending
  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        setComponentError(null);
        setComponentErrorType(null);
        await sendMessage(content);
      } catch (err) {
        handleComponentError(err, "sendMessage");
      }
    },
    [sendMessage, handleComponentError]
  );

  // Handle retry action
  const handleRetry = useCallback(async () => {
    setComponentError(null);
    setComponentErrorType(null);
    clearError();
    try {
      await retry();
    } catch (err) {
      handleComponentError(err, "retry");
    }
  }, [retry, clearError, handleComponentError]);

  // Handle refresh action
  const handleRefresh = useCallback(async () => {
    setComponentError(null);
    setComponentErrorType(null);
    clearError();
    try {
      await refresh();
    } catch (err) {
      handleComponentError(err, "refresh");
    }
  }, [refresh, clearError, handleComponentError]);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    cleanup();
    setComponentError(null);
    setComponentErrorType(null);
    clearError();
    onClose();
  }, [cleanup, clearError, onClose]);

  // Handle error boundary errors
  const handleErrorBoundaryError = useCallback((error: Error) => {
    setComponentError(`Kritik hata: ${error.message}`);
    setComponentErrorType(ErrorType.UNKNOWN);
  }, []);

  // Determine current error to display
  const currentError = componentError || accessError || error;
  const currentErrorType = componentErrorType || accessErrorType || errorType;

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "p-0 gap-0 max-w-md w-full h-[600px] max-h-[90vh]",
          "sm:max-w-lg sm:h-[700px]",
          "md:max-w-xl md:h-[600px]",
          "flex flex-col overflow-hidden",
          className
        )}
      >
        <VisuallyHidden>
          <DialogTitle>
            {captain?.name
              ? `${captain.name} ile Mesajlaşma`
              : "Kaptan ile Mesajlaşma"}
          </DialogTitle>
          <DialogDescription>
            Rezervasyon #{booking.id} için kaptan ile mesajlaşma penceresi
          </DialogDescription>
        </VisuallyHidden>
        <ChatErrorBoundary onError={handleErrorBoundaryError}>
          {/* Loading State */}
          {(isLoading || isInitializing) && <ChatLoadingSkeleton />}

          {/* Error State */}
          {currentError && !isLoading && !isInitializing && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 id="chat-title" className="text-lg font-semibold">
                  Mesajlaşma
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-center p-6">
                <Alert
                  className={cn(
                    "max-w-sm",
                    currentErrorType === ErrorType.NETWORK &&
                      "border-orange-200 bg-orange-50",
                    currentErrorType === ErrorType.AUTHENTICATION &&
                      "border-red-200 bg-red-50",
                    currentErrorType === ErrorType.AUTHORIZATION &&
                      "border-yellow-200 bg-yellow-50",
                    currentErrorType === ErrorType.SERVER &&
                      "border-red-200 bg-red-50"
                  )}
                >
                  {currentErrorType === ErrorType.NETWORK && (
                    <WifiOff className="h-4 w-4 text-orange-600" />
                  )}
                  {currentErrorType === ErrorType.AUTHENTICATION && (
                    <Shield className="h-4 w-4 text-red-600" />
                  )}
                  {currentErrorType === ErrorType.AUTHORIZATION && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  {currentErrorType === ErrorType.SERVER && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {(!currentErrorType ||
                    currentErrorType === ErrorType.UNKNOWN) && (
                    <AlertCircle className="h-4 w-4" />
                  )}

                  <AlertDescription className="mt-2">
                    {currentError}
                  </AlertDescription>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    {(currentErrorType === ErrorType.NETWORK ||
                      currentErrorType === ErrorType.SERVER ||
                      !currentErrorType) && (
                      <Button onClick={handleRetry} size="sm" variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tekrar Dene
                      </Button>
                    )}

                    <Button onClick={handleRefresh} size="sm" variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Yenile
                    </Button>

                    {currentErrorType === ErrorType.AUTHENTICATION && (
                      <Button
                        onClick={() => (window.location.href = "/login")}
                        size="sm"
                        variant="default"
                      >
                        Giriş Yap
                      </Button>
                    )}
                  </div>
                </Alert>
              </div>
            </div>
          )}

          {/* Main Chat Interface */}
          {!currentError &&
            !isLoading &&
            !isInitializing &&
            hasAccess &&
            isMessagingEnabled && (
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="relative">
                  <ChatHeader
                    captain={captain}
                    bookingId={booking.id}
                    bookingStatus={booking.status as BookingStatus}
                    onClose={handleClose}
                  />

                  {/* Connection Status */}
                  <div className="absolute top-2 right-12">
                    <ConnectionStatus
                      connectionStatus={connectionStatus}
                      isOnline={isOnline}
                    />
                  </div>
                </div>

                {/* Messages Container */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {/* Load More Button */}
                  {hasMore && messages.length > 0 && (
                    <div className="text-center pb-4">
                      <Button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          "Daha Fazla Mesaj Yükle"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Messages List */}
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg
                          className="w-16 h-16 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Henüz mesaj yok. İlk mesajı gönderin!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.sender.id === booking.customerId}
                        showTimestamp={true}
                        showAvatar={true}
                      />
                    ))
                  )}

                  {/* Auto-scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={!isOnline || isSending || !isMessagingEnabled}
                  loading={isSending}
                  placeholder={
                    !isOnline
                      ? "İnternet bağlantısı bekleniyor..."
                      : !isMessagingEnabled
                      ? "Mesajlaşma şu anda mevcut değil"
                      : "Mesajınızı yazın..."
                  }
                  maxLength={1000}
                />
              </div>
            )}

          {/* Access Denied State */}
          {!hasAccess && !isLoading && !isInitializing && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 id="chat-title" className="text-lg font-semibold">
                  Mesajlaşma
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Erişim Kısıtlı
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bu rezervasyon için mesajlaşma özelliği kullanılamıyor.
                  </p>
                  <p className="text-sm text-gray-500">
                    {accessError ||
                      "Rezervasyon durumu mesajlaşmaya uygun değil."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ChatErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerCaptainChat;
