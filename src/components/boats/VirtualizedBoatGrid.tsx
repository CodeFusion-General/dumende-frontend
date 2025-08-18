/**
 * Virtualized Boat Grid Component
 *
 * High-performance boat listing with virtual scrolling for mobile optimization.
 *
 * Requirements: 1.4, 4.2 - List performance optimization and mobile scroll performance
 */

import React, { useMemo, useCallback, useState, useRef } from "react";
import {
  VirtualizedList,
  MobileOptimizedGrid,
  VirtualizedListRef,
} from "@/components/ui/VirtualizedList";
import { createOptimizedComponent } from "@/utils/componentMemoization";
import { mobileDetection } from "@/utils/mobileDetection";
import { BoatDTO } from "@/types/boat.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Props for VirtualizedBoatGrid
 */
export interface VirtualizedBoatGridProps {
  /** Array of boats to display */
  boats: BoatDTO[];
  /** View mode: grid or list */
  viewMode?: "grid" | "list";
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Custom className */
  className?: string;
  /** Callback when boat is clicked */
  onBoatClick?: (boat: BoatDTO) => void;
  /** Enable virtualization for large lists */
  enableVirtualization?: boolean;
  /** Container height for virtualization */
  containerHeight?: number;
  /** Show compare functionality */
  showCompare?: boolean;
  /** Selected boats for comparison */
  selectedBoats?: BoatDTO[];
  /** Callback when boat is selected for comparison */
  onBoatSelect?: (boat: BoatDTO) => void;
}

/**
 * Individual boat card component optimized for performance
 */
const BoatCard = React.memo<{
  boat: BoatDTO;
  viewMode: "grid" | "list";
  onBoatClick?: (boat: BoatDTO) => void;
  showCompare?: boolean;
  isSelected?: boolean;
  onBoatSelect?: (boat: BoatDTO) => void;
}>(({ boat, viewMode, onBoatClick, showCompare, isSelected, onBoatSelect }) => {
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;

  // Memoize image URL processing
  const primaryImage = useMemo(() => {
    if (!boat.images || boat.images.length === 0) {
      return "/placeholder-boat.jpg";
    }
    return boat.images[0].imageUrl || "/placeholder-boat.jpg";
  }, [boat.images]);

  // Memoize rating display
  const ratingDisplay = useMemo(() => {
    const rating = boat.rating || 0;
    return {
      stars: Math.floor(rating),
      hasHalfStar: rating % 1 >= 0.5,
      value: rating.toFixed(1),
    };
  }, [boat.rating]);

  // Handle boat click
  const handleBoatClick = useCallback(() => {
    onBoatClick?.(boat);
  }, [boat, onBoatClick]);

  // Handle selection for comparison
  const handleSelectClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onBoatSelect?.(boat);
    },
    [boat, onBoatSelect]
  );

  const cardContent = (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${isMobile ? "hover:scale-[1.02]" : "hover:scale-105"}`}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={primaryImage}
            alt={boat.name}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              viewMode === "list" ? "h-32 sm:h-40" : "h-48 sm:h-56"
            }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-boat.jpg";
            }}
          />

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-900 font-semibold">
              ${boat.dailyPrice}/day
            </Badge>
          </div>

          {/* Compare Checkbox */}
          {showCompare && (
            <div className="absolute top-3 left-3">
              <button
                onClick={handleSelectClick}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white/90 border-gray-300 hover:border-blue-500"
                }`}
              >
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {boat.type}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div
          className={`p-4 ${viewMode === "list" ? "space-y-2" : "space-y-3"}`}
        >
          {/* Title and Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-gray-900 line-clamp-2 ${
                viewMode === "list" ? "text-base" : "text-lg"
              }`}
            >
              {boat.name}
            </h3>

            {boat.rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {ratingDisplay.value}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{boat.location}</span>
          </div>

          {/* Capacity and Year */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{boat.capacity} guests</span>
            </div>

            {boat.year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{boat.year}</span>
              </div>
            )}
          </div>

          {/* Description (only in grid mode) */}
          {viewMode === "grid" && boat.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {boat.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link to={`/boats/${boat.id}`} onClick={handleBoatClick} className="block">
      {cardContent}
    </Link>
  );
});

BoatCard.displayName = "BoatCard";

/**
 * Main virtualized boat grid component
 */
const VirtualizedBoatGridComponent: React.FC<VirtualizedBoatGridProps> = ({
  boats,
  viewMode = "grid",
  loading = false,
  error = null,
  className = "",
  onBoatClick,
  enableVirtualization = true,
  containerHeight = 600,
  showCompare = false,
  selectedBoats = [],
  onBoatSelect,
}) => {
  const listRef = useRef<VirtualizedListRef>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Detect mobile device for optimizations
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;
  const isLowEndDevice = deviceInfo.isLowEndDevice;

  // Determine if virtualization should be used
  const shouldVirtualize = useMemo(() => {
    if (!enableVirtualization) return false;

    // Use virtualization for large lists or on low-end devices
    const threshold = isLowEndDevice ? 10 : isMobile ? 20 : 50;
    return boats.length > threshold;
  }, [boats.length, enableVirtualization, isMobile, isLowEndDevice]);

  // Calculate item height based on view mode and device
  const itemHeight = useMemo(() => {
    if (viewMode === "list") {
      return isMobile ? 120 : 140;
    }
    return isMobile ? 280 : 320;
  }, [viewMode, isMobile]);

  // Create selected boats set for quick lookup
  const selectedBoatIds = useMemo(() => {
    return new Set(selectedBoats.map((boat) => boat.id));
  }, [selectedBoats]);

  // Render individual boat item
  const renderBoatItem = useCallback(
    (boat: BoatDTO, index: number) => {
      return (
        <div className={`${viewMode === "list" ? "mb-4" : "mb-6"}`}>
          <BoatCard
            boat={boat}
            viewMode={viewMode}
            onBoatClick={onBoatClick}
            showCompare={showCompare}
            isSelected={selectedBoatIds.has(boat.id)}
            onBoatSelect={onBoatSelect}
          />
        </div>
      );
    },
    [viewMode, onBoatClick, showCompare, selectedBoatIds, onBoatSelect]
  );

  // Handle scroll events
  const handleScroll = useCallback((scrollTop: number) => {
    setIsScrolling(true);

    // Debounce scroll end detection
    const timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToTop();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading boats...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (boats.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🛥️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No boats found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      </div>
    );
  }

  // Render with virtualization for large lists
  if (shouldVirtualize) {
    return (
      <div className={className}>
        {/* Scroll to top button */}
        {isScrolling && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-10 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            ↑
          </button>
        )}

        <VirtualizedList
          ref={listRef}
          items={boats}
          itemHeight={itemHeight}
          height={containerHeight}
          renderItem={renderBoatItem}
          onScroll={handleScroll}
          mobileOptimized={true}
          overscan={isLowEndDevice ? 2 : 5}
        />
      </div>
    );
  }

  // Render with mobile-optimized grid for smaller lists
  return (
    <div className={className}>
      <MobileOptimizedGrid
        items={boats}
        renderItem={renderBoatItem}
        columns={viewMode === "list" ? 1 : isMobile ? 1 : 2}
        gap={isMobile ? 12 : 16}
      />
    </div>
  );
};

/**
 * Optimized virtualized boat grid with performance monitoring
 */
export const VirtualizedBoatGrid = createOptimizedComponent(
  VirtualizedBoatGridComponent,
  {
    displayName: "VirtualizedBoatGrid",
    autoOptimize: true,
    enableProfiling: process.env.NODE_ENV === "development",
    deepCompare: false, // Shallow comparison is sufficient for boat arrays
  }
);

export default VirtualizedBoatGrid;
