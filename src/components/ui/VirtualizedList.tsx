/**
 * Virtualized List Components
 *
 * High-performance list components with virtual scrolling for mobile optimization.
 *
 * Requirements: 1.4, 4.2 - List performance optimization and mobile scroll performance
 */

import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
} from "react";
import {
  useVirtualScroll,
  useWindowedList,
  useIntersectionObserver,
  useMobileScrollOptimization,
} from "@/utils/virtualization";
import { createOptimizedComponent } from "@/utils/componentMemoization";
import { mobileDetection } from "@/utils/mobileDetection";
import { Loader2 } from "lucide-react";

/**
 * Props for VirtualizedList component
 */
export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container */
  height: number;
  /** Width of the container */
  width?: number | string;
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Custom className for the container */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Error state component */
  errorComponent?: React.ReactNode;
  /** Callback when scrolling */
  onScroll?: (scrollTop: number) => void;
  /** Enable mobile optimizations */
  mobileOptimized?: boolean;
}

/**
 * Ref interface for VirtualizedList
 */
export interface VirtualizedListRef {
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  scrollToTop: () => void;
  getScrollOffset: () => number;
}

/**
 * High-performance virtualized list component
 */
const VirtualizedListComponent = forwardRef<
  VirtualizedListRef,
  VirtualizedListProps<any>
>(
  (
    {
      items,
      itemHeight,
      height,
      width = "100%",
      renderItem,
      overscan = 5,
      className = "",
      loading = false,
      emptyComponent,
      errorComponent,
      onScroll,
      mobileOptimized = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect mobile device for optimizations
    const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
    const isMobile = deviceInfo.isMobile;
    const isLowEndDevice = deviceInfo.isLowEndDevice;

    // Adjust overscan for mobile devices
    const effectiveOverscan = useMemo(() => {
      if (!mobileOptimized) return overscan;
      if (isLowEndDevice) return Math.max(1, overscan - 2);
      if (isMobile) return Math.max(2, overscan - 1);
      return overscan;
    }, [overscan, isMobile, isLowEndDevice, mobileOptimized]);

    // Virtual scroll hook
    const {
      startIndex,
      endIndex,
      totalSize,
      offsetBefore,
      offsetAfter,
      visibleItems,
      scrollElementRef,
      getItemProps,
      scrollToIndex,
      scrollToTop,
    } = useVirtualScroll(items, {
      itemHeight,
      containerHeight: height,
      overscan: effectiveOverscan,
      scrollThreshold: isLowEndDevice ? 5 : 1,
    });

    // Mobile scroll optimization
    const { isOptimized } = useMobileScrollOptimization(
      scrollElementRef,
      mobileOptimized && isMobile
    );

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex,
        scrollToTop,
        getScrollOffset: () => scrollElementRef.current?.scrollTop || 0,
      }),
      [scrollToIndex, scrollToTop]
    );

    // Handle scroll events
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = event.currentTarget.scrollTop;
        onScroll?.(scrollTop);
      },
      [onScroll]
    );

    // Render loading state
    if (loading) {
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ height, width }}
        >
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      );
    }

    // Render empty state
    if (items.length === 0) {
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ height, width }}
        >
          {emptyComponent || (
            <div className="text-center text-gray-500">
              <p>No items to display</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative overflow-auto ${className} ${
          isOptimized ? "scroll-optimized" : ""
        }`}
        style={{
          height,
          width,
          // Mobile-specific optimizations
          WebkitOverflowScrolling: isMobile ? "touch" : undefined,
          overflowScrolling: isMobile ? "touch" : undefined,
        }}
        onScroll={handleScroll}
      >
        <div
          ref={scrollElementRef}
          style={{
            height: totalSize,
            position: "relative",
          }}
        >
          {/* Spacer before visible items */}
          {offsetBefore > 0 && <div style={{ height: offsetBefore }} />}

          {/* Render visible items */}
          {visibleItems.map((itemIndex) => {
            const item = items[itemIndex];
            const itemProps = getItemProps(itemIndex);

            return (
              <div
                key={itemProps.key}
                style={{
                  ...itemProps.style,
                  position: "relative", // Override absolute positioning for simpler layout
                }}
                data-index={itemProps["data-index"]}
              >
                {renderItem(item, itemIndex)}
              </div>
            );
          })}

          {/* Spacer after visible items */}
          {offsetAfter > 0 && <div style={{ height: offsetAfter }} />}
        </div>
      </div>
    );
  }
);

VirtualizedListComponent.displayName = "VirtualizedList";

/**
 * Optimized virtualized list with automatic performance optimizations
 */
export const VirtualizedList = createOptimizedComponent(
  VirtualizedListComponent,
  {
    displayName: "VirtualizedList",
    autoOptimize: true,
    enableProfiling: process.env.NODE_ENV === "development",
  }
);

/**
 * Props for InfiniteScrollList component
 */
export interface InfiniteScrollListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Function to load more items */
  onLoadMore: () => Promise<void>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Loading state */
  loading?: boolean;
  /** Number of items per page/window */
  pageSize?: number;
  /** Custom className */
  className?: string;
  /** Loading component */
  loadingComponent?: React.ReactNode;
  /** End of list component */
  endComponent?: React.ReactNode;
  /** Threshold for triggering load more (pixels from bottom) */
  threshold?: number;
}

/**
 * Infinite scroll list component with windowing
 */
const InfiniteScrollListComponent: React.FC<InfiniteScrollListProps<any>> = ({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading = false,
  pageSize = 20,
  className = "",
  loadingComponent,
  endComponent,
  threshold = 200,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;

  // Windowed list hook
  const {
    visibleItems,
    hasMore: windowedHasMore,
    isLoading: windowedLoading,
    loadMore,
  } = useWindowedList(items, {
    windowSize: pageSize,
    maxWindows: isMobile ? 2 : 3, // Fewer windows on mobile
    preloadThreshold: Math.floor(pageSize * 0.2),
    infiniteScroll: true,
    onLoadMore,
  });

  // Intersection observer for load more trigger
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: `${threshold}px`,
  });

  // Trigger load more when intersection is detected
  React.useEffect(() => {
    if (isIntersecting && hasMore && !loading && !windowedLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loading, windowedLoading, loadMore]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Render visible items */}
      {visibleItems.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}

      {/* Load more trigger */}
      {(hasMore || windowedHasMore) && (
        <div
          ref={(el) => {
            // Combine refs
            if (loadMoreRef.current !== el) loadMoreRef.current = el;
            if (intersectionRef.current !== el) intersectionRef.current = el;
          }}
          className="flex justify-center py-4"
        >
          {loading || windowedLoading ? (
            loadingComponent || (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            )
          ) : (
            <button
              onClick={loadMore}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && !windowedHasMore && (
        <div className="flex justify-center py-4">
          {endComponent || (
            <div className="text-gray-500 text-sm">No more items to load</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Optimized infinite scroll list
 */
export const InfiniteScrollList = createOptimizedComponent(
  InfiniteScrollListComponent,
  {
    displayName: "InfiniteScrollList",
    autoOptimize: true,
    enableProfiling: process.env.NODE_ENV === "development",
  }
);

/**
 * Props for MobileOptimizedGrid component
 */
export interface MobileOptimizedGridProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Number of columns */
  columns?: number;
  /** Gap between items */
  gap?: number;
  /** Custom className */
  className?: string;
  /** Enable virtualization for large lists */
  virtualized?: boolean;
  /** Height for virtualized mode */
  height?: number;
  /** Estimated item height for virtualization */
  itemHeight?: number;
}

/**
 * Mobile-optimized grid component with optional virtualization
 */
const MobileOptimizedGridComponent: React.FC<MobileOptimizedGridProps<any>> = ({
  items,
  renderItem,
  columns = 2,
  gap = 16,
  className = "",
  virtualized = false,
  height = 400,
  itemHeight = 200,
}) => {
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;

  // Adjust columns for mobile
  const effectiveColumns = useMemo(() => {
    if (isMobile && columns > 2) return 2;
    return columns;
  }, [columns, isMobile]);

  // Create grid items with proper layout
  const gridItems = useMemo(() => {
    return items.map((item, index) => ({
      item,
      index,
      column: index % effectiveColumns,
      row: Math.floor(index / effectiveColumns),
    }));
  }, [items, effectiveColumns]);

  const renderGridItem = useCallback(
    (gridItem: any, index: number) => {
      return (
        <div
          key={index}
          className="w-full"
          style={{
            breakInside: "avoid",
          }}
        >
          {renderItem(gridItem.item, gridItem.index)}
        </div>
      );
    },
    [renderItem]
  );

  if (virtualized && items.length > 50) {
    return (
      <VirtualizedList
        items={gridItems}
        itemHeight={itemHeight}
        height={height}
        renderItem={renderGridItem}
        className={className}
        mobileOptimized={true}
      />
    );
  }

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
};

/**
 * Optimized mobile grid
 */
export const MobileOptimizedGrid = createOptimizedComponent(
  MobileOptimizedGridComponent,
  {
    displayName: "MobileOptimizedGrid",
    autoOptimize: true,
    enableProfiling: process.env.NODE_ENV === "development",
  }
);

// Export types
export type { VirtualizedListRef };
