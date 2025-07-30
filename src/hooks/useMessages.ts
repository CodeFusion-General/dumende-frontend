import { useState, useEffect, useCallback, useRef } from "react";
import { messageService } from "@/services/messageService";
import {
  MessageDTO,
  CreateMessageCommand,
  ReadStatus,
} from "@/types/message.types";
import { useAuth } from "@/contexts/AuthContext";
import { useRetry } from "./useRetry";
import {
  classifyError,
  showErrorToast,
  showSuccessToast,
  isOnline,
  createOfflineHandler,
  globalRateLimiter,
  handleAuthenticationError,
  ErrorType,
} from "@/utils/errorHandling";
import {
  validateMessageSecurity,
  recordMessageAttempt,
  logSecurityEvent,
} from "@/utils/messagingSecurity";
import { BookingDTO } from "@/types/booking.types";
import { MessageCache } from "@/utils/messageCache";
import { MessagePagination } from "@/utils/messagePagination";
import { DebouncedPoller } from "@/utils/debouncedPolling";

interface UseMessagesOptions {
  pollingInterval?: number;
  maxRetries?: number;
  cacheKey?: string;
  pageSize?: number;
  enableRealTime?: boolean;
  booking?: BookingDTO;
  captainId?: number;
  enableSecurityValidation?: boolean;
  enableVirtualScrolling?: boolean;
  enablePagination?: boolean;
  enableAdvancedCaching?: boolean;
  enableDebouncedPolling?: boolean;
  maxCacheSize?: number;
  cacheMaxAge?: number;
}

interface UseMessagesReturn {
  messages: MessageDTO[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  errorType: ErrorType | null;
  hasMore: boolean;
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  isOnline: boolean;
  sendMessage: (content: string, recipientId: number) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
  retry: () => Promise<void>;
  clearError: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  retryFailedMessage: (messageId: number) => Promise<void>;
  // Performance optimization methods
  getCacheStats: () => any;
  clearCache: () => void;
  preloadMessages: (messages: MessageDTO[]) => void;
  recordActivity: () => void;
  getPerformanceMetrics: () => any;
}

const MESSAGE_CACHE_PREFIX = "messages_cache_";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function useMessages(
  conversationId: string,
  options: UseMessagesOptions = {}
): UseMessagesReturn {
  const {
    pollingInterval = 3000, // Changed from 3000 to 120000ms (2 minutes)
    maxRetries = 3,
    cacheKey = conversationId,
    pageSize = 50,
    enableRealTime = false, // Changed from true to false
    booking,
    captainId,
    enableSecurityValidation = true,
    enableVirtualScrolling = false,
    enablePagination = true,
    enableAdvancedCaching = true,
    enableDebouncedPolling = false, // Changed from true to false
    maxCacheSize = 1000,
    cacheMaxAge = 5 * 60 * 1000,
  } = options;

  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isOnlineState, setIsOnlineState] = useState(isOnline());

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);
  const optimisticMessagesRef = useRef<MessageDTO[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const failedPollCountRef = useRef(0);
  const isPollingActiveRef = useRef(false);
  const failedMessagesRef = useRef<
    Map<number, { content: string; recipientId: number; attempts: number }>
  >(new Map());
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("connected");

  // Performance optimization instances
  const messageCache = useRef<MessageCache | null>(null);
  const messagePagination = useRef<MessagePagination | null>(null);
  const debouncedPoller = useRef<DebouncedPoller | null>(null);
  const performanceMetrics = useRef({
    loadTimes: [] as number[],
    cacheHits: 0,
    cacheMisses: 0,
    pollCount: 0,
    lastPollTime: 0,
  });

  // Cache utilities (must be defined before useEffect)
  const getCacheKey = useCallback(
    () => `${MESSAGE_CACHE_PREFIX}${cacheKey}`,
    [cacheKey]
  );

  const setCachedMessages = useCallback(
    (messages: MessageDTO[]) => {
      if (enableAdvancedCaching && messageCache.current) {
        messageCache.current.set(conversationId, messages);
        return;
      }

      // Fallback to localStorage
      try {
        const cacheData = {
          data: messages,
          timestamp: Date.now(),
        };
        localStorage.setItem(getCacheKey(), JSON.stringify(cacheData));
      } catch (error) {
        console.warn("Failed to cache messages:", error);
      }
    },
    [getCacheKey, conversationId, enableAdvancedCaching]
  );

  const getCachedMessages = useCallback((): MessageDTO[] | null => {
    if (enableAdvancedCaching && messageCache.current) {
      const cached = messageCache.current.get(conversationId);
      if (cached) {
        performanceMetrics.current.cacheHits++;
        return cached;
      }
      performanceMetrics.current.cacheMisses++;
      return null;
    }

    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(getCacheKey());
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
        localStorage.removeItem(getCacheKey());
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }, [getCacheKey, conversationId, enableAdvancedCaching]);

  // Initialize performance optimization instances
  useEffect(() => {
    if (enableAdvancedCaching && !messageCache.current) {
      messageCache.current = new MessageCache({
        maxAge: cacheMaxAge,
        maxSize: maxCacheSize,
        persistToDisk: true,
        compressionEnabled: false,
      });
    }

    if (enablePagination && !messagePagination.current) {
      messagePagination.current = new MessagePagination(conversationId, {
        pageSize,
        maxCacheSize,
        prefetchThreshold: 10,
      });
    }

    if (enableDebouncedPolling && !debouncedPoller.current) {
      const pollFunction = async () => {
        performanceMetrics.current.pollCount++;

        const latestMessages = await messageService.getMessagesByConversationId(
          conversationId
        );
        const sortedMessages = latestMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Only update if there are new messages
        if (sortedMessages.length > lastMessageCountRef.current) {
          setMessages(sortedMessages);
          setCachedMessages(sortedMessages);
          lastMessageCountRef.current = sortedMessages.length;
        }
      };

      const debouncedPollerOptions = {
        interval: pollingInterval,
        maxInterval: 30000,
        backoffMultiplier: 1.5,
        maxRetries: 5,
        debounceDelay: 500,
        adaptivePolling: true,
        activityThreshold: 60000,
      };

      const debouncedPollerCallbacks = {
        onError: (error: unknown) => {
          console.warn("Debounced polling failed:", error);
          failedPollCountRef.current++;

          if (failedPollCountRef.current >= 3) {
            setConnectionStatus("disconnected");
          }
        },
        onSuccess: () => {
          failedPollCountRef.current = 0;
          if (connectionStatus !== "connected") {
            setConnectionStatus("connected");
          }
        },
      };

      debouncedPoller.current = new DebouncedPoller(
        pollFunction,
        debouncedPollerOptions,
        debouncedPollerCallbacks
      );
    }
  }, [
    conversationId,
    enableAdvancedCaching,
    enablePagination,
    enableDebouncedPolling,
    pageSize,
    maxCacheSize,
    cacheMaxAge,
    pollingInterval,
    setCachedMessages,
    connectionStatus,
  ]);

  // Enhanced error handling function
  const handleError = useCallback((error: unknown, context: string) => {
    const errorDetails = classifyError(error);
    setError(errorDetails.message);
    setErrorType(errorDetails.type);

    // Handle authentication errors
    if (errorDetails.type === ErrorType.AUTHENTICATION) {
      handleAuthenticationError();
      return;
    }

    // Show toast notification for user-facing errors
    if (context !== "polling") {
      // Don't show toast for polling errors to avoid spam
      showErrorToast(errorDetails, {
        showRetry: errorDetails.retryable,
        onRetry: () => {
          clearError();
          if (context === "load") {
            loadMessages(false);
          } else if (context === "loadMore") {
            loadMore();
          }
        },
      });
    }

    console.error(`Error in ${context}:`, error);
  }, []);

  // Load messages with retry logic
  const loadMessagesWithRetry = useRetry(
    async () => {
      const loadedMessages = await messageService.getMessagesByConversationId(
        conversationId
      );
      return loadedMessages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    {
      maxAttempts: maxRetries,
      initialDelay: 1000,
      onError: (error) => {
        handleError(error, "load");
      },
    }
  );

  // Load initial messages
  const loadMessages = useCallback(
    async (useCache = true) => {
      if (!conversationId || !user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Try to load from cache first
        if (useCache) {
          const cachedMessages = getCachedMessages();
          if (cachedMessages) {
            setMessages(cachedMessages);
            setIsLoading(false);
            // Still load fresh data in background
            setTimeout(() => loadMessages(false), 100);
            return;
          }
        }

        const loadedMessages = await loadMessagesWithRetry.execute();
        if (loadedMessages) {
          setMessages(loadedMessages);
          setCachedMessages(loadedMessages);
          lastMessageCountRef.current = loadedMessages.length;
          setHasMore(loadedMessages.length >= pageSize);
          setCurrentPage(1);
        }
      } catch (err) {
        handleError(err, "load");
      } finally {
        setIsLoading(false);
      }
    },
    [
      conversationId,
      user,
      loadMessagesWithRetry,
      getCachedMessages,
      setCachedMessages,
      pageSize,
    ]
  );

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!conversationId || !user || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      // In a real implementation, this would use pagination parameters
      // For now, we'll simulate by checking if we have more messages
      const allMessages = await messageService.getMessagesByConversationId(
        conversationId
      );
      const sortedMessages = allMessages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (sortedMessages.length > messages.length) {
        setMessages(sortedMessages);
        setCachedMessages(sortedMessages);
        setCurrentPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      handleError(err, "loadMore");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    conversationId,
    user,
    isLoadingMore,
    hasMore,
    messages.length,
    messageService,
    setCachedMessages,
  ]);

  // Send message with optimistic updates and enhanced error handling
  const sendMessage = useCallback(
    async (content: string, recipientId: number) => {
      if (!conversationId || !user || !content.trim()) return;

      // Enhanced security validation
      if (enableSecurityValidation && booking) {
        const securityValidation = await validateMessageSecurity(
          content,
          user.id,
          booking,
          captainId
        );

        if (!securityValidation.isValid) {
          const securityError = securityValidation.errors[0];
          setError(securityError);
          setErrorType(ErrorType.VALIDATION);
          showErrorToast({
            type: ErrorType.VALIDATION,
            message: securityError,
            retryable: false,
          });

          // Log security event
          logSecurityEvent({
            type: "message_blocked",
            userId: user.id,
            bookingId: booking.id,
            details: securityValidation.errors.join(", "),
            timestamp: new Date(),
            severity: securityValidation.securityAnalysis.riskLevel,
          });

          return;
        }

        // Use sanitized content
        if (securityValidation.sanitizedContent) {
          content = securityValidation.sanitizedContent;
        }

        // Show warnings if any
        if (securityValidation.warnings.length > 0) {
          console.warn(
            "Message security warnings:",
            securityValidation.warnings
          );
        }
      } else {
        // Fallback validation for backward compatibility
        if (content.length > 1000) {
          const validationError = "Mesaj 1000 karakteri geçemez";
          setError(validationError);
          setErrorType(ErrorType.VALIDATION);
          showErrorToast({
            type: ErrorType.VALIDATION,
            message: validationError,
            retryable: false,
          });
          return;
        }
      }

      // Check if online
      if (!isOnlineState) {
        const networkError =
          "İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.";
        setError(networkError);
        setErrorType(ErrorType.NETWORK);
        showErrorToast({
          type: ErrorType.NETWORK,
          message: networkError,
          retryable: true,
        });
        return;
      }

      setSending(true);
      setError(null);
      setErrorType(null);

      // Record message attempt for rate limiting
      recordMessageAttempt(user.id);

      // Create optimistic message
      const optimisticMessage: MessageDTO = {
        id: Date.now(), // Temporary ID
        conversationId,
        sender: {
          id: user.id,
          fullName: user.username || "You",
          email: user.email,
        },
        recipient: {
          id: recipientId,
          fullName: "Captain", // Will be updated when real message arrives
          email: "",
        },
        message: content,
        readStatus: ReadStatus.UNREAD,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic message to state
      optimisticMessagesRef.current = [optimisticMessage];
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const command: CreateMessageCommand = {
          conversationId,
          senderId: user.id,
          recipientId,
          message: content,
        };

        const sentMessage = await messageService.createMessage(command);

        // Replace optimistic message with real message
        setMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (msg) => msg.id !== optimisticMessage.id
          );
          const updated = [...withoutOptimistic, sentMessage].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setCachedMessages(updated);
          return updated;
        });

        optimisticMessagesRef.current = [];

        // Show success feedback for important messages
        if (content.length > 100) {
          showSuccessToast("Mesaj gönderildi");
        }
      } catch (err) {
        // Remove optimistic message on failure
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        optimisticMessagesRef.current = [];

        // Store failed message for retry
        failedMessagesRef.current.set(optimisticMessage.id, {
          content,
          recipientId,
          attempts: 1,
        });

        handleError(err, "send");
      } finally {
        setSending(false);
      }
    },
    [conversationId, user, setCachedMessages, isOnlineState, handleError]
  );

  // Retry failed message
  const retryFailedMessage = useCallback(
    async (messageId: number) => {
      const failedMessage = failedMessagesRef.current.get(messageId);
      if (!failedMessage) return;

      // Check if we've exceeded max retry attempts
      if (failedMessage.attempts >= 3) {
        failedMessagesRef.current.delete(messageId);
        showErrorToast({
          type: ErrorType.SERVER,
          message: "Mesaj gönderilemedi. Maksimum deneme sayısına ulaşıldı.",
          retryable: false,
        });
        return;
      }

      // Increment attempt count
      failedMessage.attempts++;
      failedMessagesRef.current.set(messageId, failedMessage);

      // Retry sending the message
      await sendMessage(failedMessage.content, failedMessage.recipientId);
    },
    [sendMessage]
  );

  // Mark message as read with error handling
  const markAsRead = useCallback(
    async (messageId: number) => {
      if (!user) return;

      try {
        await messageService.markAsRead(messageId);

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, readStatus: ReadStatus.READ } : msg
          )
        );
      } catch (err) {
        // Don't show error toast for read status failures as they're not critical
        console.warn("Failed to mark message as read:", err);
        const errorDetails = classifyError(err);

        // Only handle authentication errors
        if (errorDetails.type === ErrorType.AUTHENTICATION) {
          handleAuthenticationError();
        }
      }
    },
    [user, handleError]
  );

  // Enhanced real-time polling with automatic reconnection
  const startPolling = useCallback(() => {
    if (
      !enableRealTime ||
      !conversationId ||
      !user ||
      isPollingActiveRef.current
    )
      return;

    // If debounced polling is enabled, use it instead of manual polling
    if (enableDebouncedPolling && debouncedPoller.current) {
      debouncedPoller.current.start();
      isPollingActiveRef.current = true;
      setConnectionStatus("connected");
      failedPollCountRef.current = 0;
      return;
    }

    isPollingActiveRef.current = true;
    setConnectionStatus("connected");
    failedPollCountRef.current = 0;

    const pollMessages = async () => {
      try {
        const latestMessages = await messageService.getMessagesByConversationId(
          conversationId
        );
        const sortedMessages = latestMessages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Only update if there are new messages
        if (sortedMessages.length > lastMessageCountRef.current) {
          setMessages(sortedMessages);
          setCachedMessages(sortedMessages);
          lastMessageCountRef.current = sortedMessages.length;
        }

        // Reset failed poll count on success
        failedPollCountRef.current = 0;
        if (connectionStatus !== "connected") {
          setConnectionStatus("connected");
        }
      } catch (err) {
        console.warn("Polling failed:", err);
        failedPollCountRef.current++;

        const errorDetails = classifyError(err);

        // Handle authentication errors immediately
        if (errorDetails.type === ErrorType.AUTHENTICATION) {
          stopPolling();
          handleAuthenticationError();
          return;
        }

        // If we've failed multiple times, set status to disconnected
        if (failedPollCountRef.current >= 3) {
          setConnectionStatus("disconnected");

          // Only show error toast once when disconnected
          if (failedPollCountRef.current === 3) {
            handleError(err, "polling");
            attemptReconnection();
          }
        }
      }
    };

    // Initial poll
    pollMessages();

    // Set up interval
    pollingIntervalRef.current = setInterval(pollMessages, pollingInterval);
  }, [
    enableRealTime,
    conversationId,
    user,
    pollingInterval,
    setCachedMessages,
    connectionStatus,
    enableDebouncedPolling
  ]);

  // Automatic reconnection logic
  const attemptReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionStatus("reconnecting");

    // Exponential backoff for reconnection attempts
    const reconnectDelay = Math.min(
      1000 * Math.pow(2, Math.min(failedPollCountRef.current - 3, 5)),
      30000
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isPollingActiveRef.current && enableRealTime) {
        // Stop current polling and restart
        stopPolling();
        startPolling();
      }
    }, reconnectDelay);
  }, [enableRealTime, startPolling]);

  // Enhanced stop polling with cleanup
  const stopPolling = useCallback(() => {
    isPollingActiveRef.current = false;

    // Stop debounced polling if active
    if (enableDebouncedPolling && debouncedPoller.current) {
      debouncedPoller.current.stop();
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionStatus("disconnected");
    failedPollCountRef.current = 0;
  }, [enableDebouncedPolling]);

  // Refresh messages
  const refresh = useCallback(async () => {
    await loadMessages(false);
  }, [loadMessages]);

  // Retry failed operations
  const retry = useCallback(async () => {
    if (loadMessagesWithRetry.canRetry) {
      await loadMessages(false);
    }
  }, [loadMessagesWithRetry.canRetry, loadMessages]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  // Record activity
  const recordActivity = useCallback(() => {
    // Use debounced poller if available
    if (enableDebouncedPolling && debouncedPoller.current) {
      debouncedPoller.current.recordActivity();
    } else if (isPollingActiveRef.current) {
      // For manual polling, we can trigger an immediate poll if needed
      // But we'll be more conservative about it
      if (pollingIntervalRef.current) {
        // Clear and reset the interval to ensure we don't poll too frequently
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = setInterval(
          () => {
            // This will be handled by the existing polling mechanism
          },
          Math.max(pollingInterval / 2, 1000) // Minimum 1 second
        );
      }
    }

    // Update last activity time for performance tracking
    performanceMetrics.current.lastPollTime = Date.now();
  }, [enableDebouncedPolling, pollingInterval]);

  // Initialize and cleanup
  useEffect(() => {
    if (conversationId && user) {
      loadMessages();
      if (enableRealTime) {
        startPolling();
      }
    }

    return () => {
      stopPolling();
    };
  }, [conversationId, user?.id, enableRealTime]);

  // Handle online/offline events for better connection management
  useEffect(() => {
    const cleanup = createOfflineHandler((online) => {
      setIsOnlineState(online);

      if (online) {
        if (enableRealTime && conversationId && user) {
          setConnectionStatus("reconnecting");
          clearError(); // Clear any network errors
          // Restart polling when coming back online
          stopPolling();
          setTimeout(() => startPolling(), 1000);
        }
      } else {
        setConnectionStatus("disconnected");
        stopPolling();
        setError("İnternet bağlantısı kesildi");
        setErrorType(ErrorType.NETWORK);
      }
    });

    return cleanup;
  }, [
    enableRealTime,
    conversationId,
    user,
    startPolling,
    stopPolling,
    clearError,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      optimisticMessagesRef.current = [];
    };
  }, [stopPolling]);

  // Performance optimization methods
  const getCacheStats = useCallback(() => {
    if (enableAdvancedCaching && messageCache.current) {
      return messageCache.current.getStats();
    }

    // Fallback stats for localStorage cache
    const cacheKey = getCacheKey();
    const cached = localStorage.getItem(cacheKey);
    return {
      totalEntries: cached ? 1 : 0,
      totalSize: cached ? cached.length : 0,
      hitRate:
        performanceMetrics.current.cacheHits /
          (performanceMetrics.current.cacheHits +
            performanceMetrics.current.cacheMisses) || 0,
      oldestEntry: cached ? JSON.parse(cached).timestamp : 0,
      newestEntry: cached ? JSON.parse(cached).timestamp : 0,
    };
  }, [enableAdvancedCaching, getCacheKey]);

  const clearCache = useCallback(() => {
    if (enableAdvancedCaching && messageCache.current) {
      messageCache.current.clear(conversationId);
    } else {
      localStorage.removeItem(getCacheKey());
    }

    // Reset performance metrics
    performanceMetrics.current = {
      loadTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      pollCount: 0,
      lastPollTime: 0,
    };
  }, [enableAdvancedCaching, conversationId, getCacheKey]);

  const preloadMessages = useCallback(
    (messages: MessageDTO[]) => {
      if (enableAdvancedCaching && messageCache.current) {
        messageCache.current.preload(conversationId, messages);
      } else {
        setCachedMessages(messages);
      }
    },
    [enableAdvancedCaching, conversationId, setCachedMessages]
  );

  const getPerformanceMetrics = useCallback(() => {
    const metrics = performanceMetrics.current;
    const avgLoadTime =
      metrics.loadTimes.length > 0
        ? metrics.loadTimes.reduce((a, b) => a + b, 0) /
          metrics.loadTimes.length
        : 0;

    return {
      averageLoadTime: avgLoadTime,
      totalLoads: metrics.loadTimes.length,
      cacheHitRate:
        metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
      totalCacheHits: metrics.cacheHits,
      totalCacheMisses: metrics.cacheMisses,
      pollCount: metrics.pollCount,
      lastPollTime: metrics.lastPollTime,
      messagesInMemory: messages.length,
      optimisticMessagesCount: optimisticMessagesRef.current.length,
      failedMessagesCount: failedMessagesRef.current.size,
    };
  }, [messages.length]);

  return {
    messages,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    errorType,
    hasMore,
    connectionStatus,
    isOnline: isOnlineState,
    sendMessage,
    loadMore,
    refresh,
    markAsRead,
    retry,
    clearError,
    startPolling,
    stopPolling,
    retryFailedMessage,
    // Performance optimization methods
    getCacheStats,
    clearCache,
    preloadMessages,
    recordActivity,
    getPerformanceMetrics,
  };
}
