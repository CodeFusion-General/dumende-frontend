/**
 * Virtualized Tour Grid Component
 *
 * High-performance tour listing with virtual scrolling for mobile optimization.
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
import { TourDTO } from "@/types/tour.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

/**
 * Props for VirtualizedTourGrid
 */
export interface VirtualizedTourGridProps {
  /** Array of tours to display */
  tours: TourDTO[];
  /** View mode: grid or list */
  viewMode?: "grid" | "list";
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Custom className */
  className?: string;
  /** Callback when tour is clicked */
  onTourClick?: (tour: TourDTO) => void;
  /** Enable virtualization for large lists */
  enableVirtualization?: boolean;
  /** Container height for virtualization */
  containerHeight?: number;
  /** Show compare functionality */
  showCompare?: boolean;
  /** Selected tours for comparison */
  selectedTours?: TourDTO[];
  /** Callback when tour is selected for comparison */
  onTourSelect?: (tour: TourDTO) => void;
}

/**
 * Individual tour card component optimized for performance
 */
const TourCard = React.memo<{
  tour: TourDTO;
  viewMode: "grid" | "list";
  onTourClick?: (tour: TourDTO) => void;
  showCompare?: boolean;
  isSelected?: boolean;
  onTourSelect?: (tour: TourDTO) => void;
}>(({ tour, viewMode, onTourClick, showCompare, isSelected, onTourSelect }) => {
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;

  // Memoize image URL processing
  const primaryImage = useMemo(() => {
    if (!tour.images || tour.images.length === 0) {
      return "/placeholder-tour.jpg";
    }
    return tour.images[0] || "/placeholder-tour.jpg";
  }, [tour.images]);

  // Memoize rating display
  const ratingDisplay = useMemo(() => {
    const rating = tour.rating || 0;
    return {
      stars: Math.floor(rating),
      hasHalfStar: rating % 1 >= 0.5,
      value: rating.toFixed(1),
    };
  }, [tour.rating]);

  // Memoize duration formatting
  const formattedDuration = useMemo(() => {
    if (!tour.duration) return "Duration not specified";

    const hours = Math.floor(tour.duration / 60);
    const minutes = tour.duration % 60;

    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  }, [tour.duration]);

  // Memoize next available date
  const nextAvailableDate = useMemo(() => {
    if (!tour.availableDates || tour.availableDates.length === 0) {
      return "Dates available on request";
    }

    const nextDate = new Date(tour.availableDates[0]);
    return format(nextDate, "MMM dd, yyyy");
  }, [tour.availableDates]);

  // Handle tour click
  const handleTourClick = useCallback(() => {
    onTourClick?.(tour);
  }, [tour, onTourClick]);

  // Handle selection for comparison
  const handleSelectClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTourSelect?.(tour);
    },
    [tour, onTourSelect]
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
            alt={tour.title}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              viewMode === "list" ? "h-32 sm:h-40" : "h-48 sm:h-56"
            }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-tour.jpg";
            }}
          />

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-900 font-semibold">
              ${tour.price}/person
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

          {/* Duration Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {formattedDuration}
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
              {tour.title}
            </h3>

            {tour.rating && (
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
            <span className="text-sm truncate">{tour.location}</span>
          </div>

          {/* Capacity and Next Date */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Up to {tour.maxParticipants} people</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="truncate">{nextAvailableDate}</span>
            </div>
          </div>

          {/* Description (only in grid mode) */}
          {viewMode === "grid" && tour.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {tour.description}
            </p>
          )}

          {/* Highlights (only in grid mode) */}
          {viewMode === "grid" &&
            tour.highlights &&
            tour.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tour.highlights.slice(0, 3).map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
                {tour.highlights.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tour.highlights.length - 3} more
                  </Badge>
                )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link to={`/tours/${tour.id}`} onClick={handleTourClick} className="block">
      {cardContent}
    </Link>
  );
});

TourCard.displayName = "TourCard";

/**
 * Main virtualized tour grid component
 */
const VirtualizedTourGridComponent: React.FC<VirtualizedTourGridProps> = ({
  tours,
  viewMode = "grid",
  loading = false,
  error = null,
  className = "",
  onTourClick,
  enableVirtualization = true,
  containerHeight = 600,
  showCompare = false,
  selectedTours = [],
  onTourSelect,
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
    return tours.length > threshold;
  }, [tours.length, enableVirtualization, isMobile, isLowEndDevice]);

  // Calculate item height based on view mode and device
  const itemHeight = useMemo(() => {
    if (viewMode === "list") {
      return isMobile ? 140 : 160;
    }
    return isMobile ? 320 : 380;
  }, [viewMode, isMobile]);

  // Create selected tours set for quick lookup
  const selectedTourIds = useMemo(() => {
    return new Set(selectedTours.map((tour) => tour.id));
  }, [selectedTours]);

  // Render individual tour item
  const renderTourItem = useCallback(
    (tour: TourDTO, index: number) => {
      return (
        <div className={`${viewMode === "list" ? "mb-4" : "mb-6"}`}>
          <TourCard
            tour={tour}
            viewMode={viewMode}
            onTourClick={onTourClick}
            showCompare={showCompare}
            isSelected={selectedTourIds.has(tour.id)}
            onTourSelect={onTourSelect}
          />
        </div>
      );
    },
    [viewMode, onTourClick, showCompare, selectedTourIds, onTourSelect]
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
          <p className="text-gray-600">Loading tours...</p>
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
  if (tours.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tours found
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
          items={tours}
          itemHeight={itemHeight}
          height={containerHeight}
          renderItem={renderTourItem}
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
        items={tours}
        renderItem={renderTourItem}
        columns={viewMode === "list" ? 1 : isMobile ? 1 : 2}
        gap={isMobile ? 12 : 16}
      />
    </div>
  );
};

/**
 * Optimized virtualized tour grid with performance monitoring
 */
export const VirtualizedTourGrid = createOptimizedComponent(
  VirtualizedTourGridComponent,
  {
    displayName: "VirtualizedTourGrid",
    autoOptimize: true,
    enableProfiling: process.env.NODE_ENV === "development",
    deepCompare: false, // Shallow comparison is sufficient for tour arrays
  }
);

export default VirtualizedTourGrid;
