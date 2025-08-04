import { useState, useEffect, useCallback, useRef } from "react";
import { BookingDTO, BookingStatus } from "@/types/booking.types";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "./useMessages";
import {
  generateBookingConversationId,
  extractCaptainIdFromBooking,
  validateBookingMessagingAccess,
  isMessagingEnabledForBookingStatus,
} from "@/utils/conversationUtils";
import {
  classifyError,
  showErrorToast,
  handleAuthenticationError,
  ErrorType,
} from "@/utils/errorHandling";

interface UseBookingMessagingOptions {
  pollingInterval?: number;
  maxRetries?: number;
  enableRealTime?: boolean;
  autoLoadMessages?: boolean;
}

interface UseBookingMessagingReturn {
  // Messaging state
  conversationId: string | null;
  captainId: number | null;
  isMessagingEnabled: boolean;
  hasAccess: boolean;
  accessError: string | null;
  accessErrorType: ErrorType | null;

  // Loading states
  isInitializing: boolean;
  isValidating: boolean;

  // Message functionality (from useMessages)
  messages: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  errorType: ErrorType | null;
  hasMore: boolean;
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  isOnline: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
  retry: () => Promise<void>;
  clearError: () => void;
  retryFailedMessage: (messageId: number) => Promise<void>;

  // Booking-specific actions
  initializeMessaging: () => Promise<void>;
  validateAccess: () => Promise<void>;
  cleanup: () => void;
}

export function useBookingMessaging(
  booking: BookingDTO | null,
  options: UseBookingMessagingOptions = {}
): UseBookingMessagingReturn {
    const {
    pollingInterval = 30000, // 3 saniye yerine 30 saniye
    maxRetries = 3,
    enableRealTime = true,
    autoLoadMessages = true,
  } = options;

  const { user } = useAuth();

  // State for booking-specific messaging logic
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [isMessagingEnabled, setIsMessagingEnabled] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessErrorType, setAccessErrorType] = useState<ErrorType | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Refs for cleanup
  const initializationRef = useRef<boolean>(false);

  // Use the messages hook with the conversation ID
  const messagesHook = useMessages(conversationId || "", {
    pollingInterval,
    maxRetries,
    enableRealTime: enableRealTime && hasAccess && isMessagingEnabled,
    cacheKey: conversationId || undefined,
    booking,
    captainId,
    enableSecurityValidation: true,
  });

  // Enhanced error handling for booking messaging
  const handleBookingError = useCallback((error: unknown, context: string) => {
    const errorDetails = classifyError(error);
    setAccessError(errorDetails.message);
    setAccessErrorType(errorDetails.type);

    // Handle authentication errors
    if (errorDetails.type === ErrorType.AUTHENTICATION) {
      handleAuthenticationError();
      return;
    }

    // Show toast for critical errors
    if (context === "initialize" || context === "validate") {
      showErrorToast(errorDetails, {
        showRetry: errorDetails.retryable,
        onRetry: () => {
          if (context === "initialize") {
            initializeMessaging();
          } else if (context === "validate") {
            validateAccess();
          }
        },
      });
    }

    console.error(`Booking messaging error in ${context}:`, error);
  }, []);

  // Extract captain ID from booking data
  const extractCaptainId = useCallback(
    async (bookingData: BookingDTO): Promise<number> => {
      try {
        const extractedCaptainId = await extractCaptainIdFromBooking(
          bookingData
        );
        return extractedCaptainId;
      } catch (error) {
        const errorDetails = classifyError(error);
        throw new Error(`Kaptan ID'si alınamadı: ${errorDetails.message}`);
      }
    },
    []
  );

  // Generate conversation ID for booking context
  const generateConversationId = useCallback(
    (bookingData: BookingDTO, captainId: number): string => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      return generateBookingConversationId(bookingData.id, user.id, captainId);
    },
    [user]
  );

  // Validate user access to booking messaging
  const validateAccess = useCallback(async (): Promise<void> => {
    if (!booking || !user) {
      setHasAccess(false);
      setAccessError("Rezervasyon veya kullanıcı bilgisi mevcut değil");
      setAccessErrorType(ErrorType.VALIDATION);
      return;
    }

    setIsValidating(true);
    setAccessError(null);
    setAccessErrorType(null);

    try {
      const validation = await validateBookingMessagingAccess(booking, user.id);

      setHasAccess(validation.hasAccess);

      if (!validation.hasAccess) {
        setAccessError(validation.reason || "Erişim reddedildi");
        setAccessErrorType(ErrorType.AUTHORIZATION);
        setIsMessagingEnabled(false);
      } else {
        setAccessError(null);
        setAccessErrorType(null);
        if (validation.captainId) {
          setCaptainId(validation.captainId);
        }
      }
    } catch (error) {
      setHasAccess(false);
      handleBookingError(error, "validate");
    } finally {
      setIsValidating(false);
    }
  }, [booking, user, handleBookingError]);

  // Initialize messaging for the booking
  const initializeMessaging = useCallback(async (): Promise<void> => {
    if (!booking || !user || initializationRef.current) {
      return;
    }

    setIsInitializing(true);
    setAccessError(null);
    setAccessErrorType(null);
    initializationRef.current = true;

    try {
      // Step 1: Validate booking status
      const statusValid = isMessagingEnabledForBookingStatus(
        booking.status as BookingStatus
      );
      if (!statusValid) {
        setIsMessagingEnabled(false);
        setAccessError(
          `${booking.status} durumundaki rezervasyonlar için mesajlaşma mevcut değil`
        );
        setAccessErrorType(ErrorType.VALIDATION);
        return;
      }

      // Step 2: Extract captain ID
      let extractedCaptainId = captainId;
      if (!extractedCaptainId) {
        extractedCaptainId = await extractCaptainId(booking);
        setCaptainId(extractedCaptainId);
      }

      // Step 3: Generate conversation ID
      const generatedConversationId = generateConversationId(
        booking,
        extractedCaptainId
      );
      setConversationId(generatedConversationId);

      // Step 4: Validate access
      const validation = await validateBookingMessagingAccess(booking, user.id);

      setHasAccess(validation.hasAccess);

      if (!validation.hasAccess) {
        setAccessError(validation.reason || "Erişim reddedildi");
        setAccessErrorType(ErrorType.AUTHORIZATION);
        setIsMessagingEnabled(false);
        return;
      } else {
        setAccessError(null);
        setAccessErrorType(null);
        if (validation.captainId && !captainId) {
          setCaptainId(validation.captainId);
        }
      }

      // Step 5: Enable messaging if all validations pass
      setIsMessagingEnabled(true);
    } catch (error) {
      handleBookingError(error, "initialize");
      setIsMessagingEnabled(false);
      setHasAccess(false);
    } finally {
      setIsInitializing(false);
      initializationRef.current = false;
    }
  }, [
    booking,
    user,
    captainId,
    extractCaptainId,
    generateConversationId,
    handleBookingError,
  ]);

  // Send message with captain ID and enhanced validation
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!captainId) {
        const error = "Kaptan ID'si mevcut değil";
        setAccessError(error);
        setAccessErrorType(ErrorType.VALIDATION);
        throw new Error(error);
      }

      if (!hasAccess || !isMessagingEnabled) {
        const error = "Mesajlaşma erişimi mevcut değil";
        setAccessError(error);
        setAccessErrorType(ErrorType.AUTHORIZATION);
        throw new Error(error);
      }

      try {
        return await messagesHook.sendMessage(content, captainId);
      } catch (error) {
        // Let the useMessages hook handle the error
        throw error;
      }
    },
    [captainId, hasAccess, isMessagingEnabled, messagesHook]
  );

  // Cleanup logic for component unmounting
  const cleanup = useCallback(() => {
    // Reset all state
    setConversationId(null);
    setCaptainId(null);
    setIsMessagingEnabled(false);
    setHasAccess(false);
    setAccessError(null);
    setAccessErrorType(null);
    setIsInitializing(false);
    setIsValidating(false);

    // Reset initialization flag
    initializationRef.current = false;
  }, []);

  // Auto-initialize when booking changes
  useEffect(() => {
    if (booking && user && autoLoadMessages) {
      initializeMessaging();
    }
  }, [booking?.id, user?.id, autoLoadMessages, initializeMessaging]);

  // Update messaging enabled status when booking status changes
  useEffect(() => {
    if (booking) {
      const statusValid = isMessagingEnabledForBookingStatus(
        booking.status as BookingStatus
      );
      if (!statusValid && isMessagingEnabled) {
        setIsMessagingEnabled(false);
        setAccessError(
          `${booking.status} durumundaki rezervasyonlar için mesajlaşma mevcut değil`
        );
        setAccessErrorType(ErrorType.VALIDATION);
      }
    }
  }, [booking?.status, isMessagingEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Messaging state
    conversationId,
    captainId,
    isMessagingEnabled,
    hasAccess,
    accessError,
    accessErrorType,

    // Loading states
    isInitializing,
    isValidating,

    // Message functionality (from useMessages)
    messages: messagesHook.messages,
    isLoading: messagesHook.isLoading,
    isLoadingMore: messagesHook.isLoadingMore,
    isSending: messagesHook.isSending,
    error: accessError || messagesHook.error,
    errorType: accessErrorType || messagesHook.errorType,
    hasMore: messagesHook.hasMore,
    connectionStatus: messagesHook.connectionStatus,
    isOnline: messagesHook.isOnline,

    // Actions
    sendMessage,
    loadMore: messagesHook.loadMore,
    refresh: messagesHook.refresh,
    markAsRead: messagesHook.markAsRead,
    retry: messagesHook.retry,
    clearError: () => {
      messagesHook.clearError();
      setAccessError(null);
      setAccessErrorType(null);
    },
    retryFailedMessage: messagesHook.retryFailedMessage,

    // Booking-specific actions
    initializeMessaging,
    validateAccess,
    cleanup,
  };
}
