import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MessageDTO } from "@/types/message.types";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VirtualMessageListProps {
  messages: MessageDTO[];
  currentUserId: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMessageVisible?: (messageId: number) => void;
  className?: string;
  itemHeight?: number;
  overscan?: number;
  autoScroll?: boolean;
  showScrollToBottom?: boolean;
}

interface VirtualItem {
  index: number;
  message: MessageDTO;
  height: number;
  offset: number;
}

interface ScrollState {
  scrollTop: number;
  isScrolling: boolean;
  isNearBottom: boolean;
  showScrollButton: boolean;
}

export const VirtualMessageList: React.FC<VirtualMessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onMessageVisible,
  className,
  itemHeight = 80, // Estimated height per message
  overscan = 5, // Number of items to render outside visible area
  autoScroll = true,
  showScrollToBottom = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const measurementCache = useRef<Map<number, number>>(new Map());
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(messages.length);

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    isScrolling: false,
    isNearBottom: true,
    showScrollButton: false,
  });

  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate total height and visible range
  const { totalHeight, visibleRange, virtualItems } = useMemo(() => {
    let totalHeight = 0;
    const virtualItems: VirtualItem[] = [];

    // Calculate heights and offsets for all messages
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const cachedHeight = measurementCache.current.get(message.id);
      const height = cachedHeight || itemHeight;

      virtualItems.push({
        index: i,
        message,
        height,
        offset: totalHeight,
      });

      totalHeight += height;
    }

    // Calculate visible range
    const scrollTop = scrollState.scrollTop;
    const viewportHeight = containerHeight;

    let startIndex = 0;
    let endIndex = messages.length - 1;

    // Find start index
    for (let i = 0; i < virtualItems.length; i++) {
      if (virtualItems[i].offset + virtualItems[i].height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    for (let i = startIndex; i < virtualItems.length; i++) {
      if (virtualItems[i].offset > scrollTop + viewportHeight) {
        endIndex = Math.min(virtualItems.length - 1, i + overscan);
        break;
      }
    }

    const visibleRange = { startIndex, endIndex };

    return { totalHeight, visibleRange, virtualItems };
  }, [messages, scrollState.scrollTop, containerHeight, itemHeight, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return virtualItems.slice(
      visibleRange.startIndex,
      visibleRange.endIndex + 1
    );
  }, [virtualItems, visibleRange]);

  // Handle scroll events
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const scrollHeight = e.currentTarget.scrollHeight;
      const clientHeight = e.currentTarget.clientHeight;

      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      const showScrollButton = scrollTop < scrollHeight - clientHeight - 200;

      setScrollState((prev) => ({
        ...prev,
        scrollTop,
        isScrolling: true,
        isNearBottom,
        showScrollButton,
      }));

      // Clear scrolling state after a delay
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setScrollState((prev) => ({ ...prev, isScrolling: false }));
      }, 150);

      // Trigger load more when near top
      if (scrollTop < 200 && hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }

      // Notify about visible messages
      if (onMessageVisible) {
        visibleItems.forEach((item) => {
          onMessageVisible(item.message.id);
        });
      }
    },
    [hasMore, isLoadingMore, onLoadMore, onMessageVisible, visibleItems]
  );

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({
        top: scrollElementRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (
      autoScroll &&
      messages.length > lastMessageCountRef.current &&
      scrollState.isNearBottom
    ) {
      setTimeout(() => scrollToBottom(), 100);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length, autoScroll, scrollState.isNearBottom, scrollToBottom]);

  // Set up resize observer for container
  useEffect(() => {
    if (!containerRef.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.current.observe(containerRef.current);

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, []);

  // Set up intersection observer for message height measurement
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = parseInt(
              entry.target.getAttribute("data-message-id") || "0"
            );
            const height = entry.boundingClientRect.height;

            if (height > 0) {
              measurementCache.current.set(messageId, height);
            }
          }
        });
      },
      {
        root: scrollElementRef.current,
        rootMargin: "50px",
      }
    );

    // Observe all visible message elements
    const messageElements =
      containerRef.current?.querySelectorAll("[data-message-id]");
    messageElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [visibleItems]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Mesajlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative h-full", className)}>
      {/* Scrollable container */}
      <div
        ref={scrollElementRef}
        className="h-full overflow-y-auto overflow-x-hidden"
        onScroll={handleScroll}
        style={{ scrollBehavior: scrollState.isScrolling ? "auto" : "smooth" }}
      >
        {/* Load more indicator at top */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              onClick={onLoadMore}
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

        {/* Virtual scrolling container */}
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map((item) => (
            <div
              key={item.message.id}
              data-message-id={item.message.id}
              style={{
                position: "absolute",
                top: item.offset,
                left: 0,
                right: 0,
                minHeight: item.height,
              }}
              className="px-4 py-1"
            >
              <MessageBubble
                message={item.message}
                isOwnMessage={item.message.sender.id === currentUserId}
                showTimestamp={true}
                showAvatar={true}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
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
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && scrollState.showScrollButton && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={() => scrollToBottom()}
            size="sm"
            className="rounded-full shadow-lg"
            variant="secondary"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Performance debug info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 text-xs text-gray-400 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          Visible: {visibleRange.startIndex}-{visibleRange.endIndex} /{" "}
          {messages.length}
          <br />
          Height: {totalHeight}px
        </div>
      )}
    </div>
  );
};

export default VirtualMessageList;
