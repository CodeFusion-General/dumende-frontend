// Simplified Boat Card Component for Low-End Devices
// Minimal design with essential information only

import React, { memo, useMemo } from "react";
import { MapPin, Users, Star } from "lucide-react";
import {
  useSimplifiedUI,
  usePerformanceAwareFeatures,
} from "../../hooks/useLowEndOptimization";

interface Boat {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  features?: string[];
}

interface SimplifiedBoatCardProps {
  boat: Boat;
  onSelect?: (boat: Boat) => void;
  showFeatures?: boolean;
  className?: string;
}

// Memoized price component
const PriceDisplay = memo(({ price }: { price: number }) => {
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  }, [price]);

  return (
    <div className="text-right">
      <span className="text-lg font-bold text-blue-600">{formattedPrice}</span>
      <span className="text-sm text-gray-500 block">per day</span>
    </div>
  );
});

PriceDisplay.displayName = "PriceDisplay";

// Memoized rating component
const RatingDisplay = memo(
  ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-current" />
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500">({reviewCount})</span>
      </div>
    );
  }
);

RatingDisplay.displayName = "RatingDisplay";

// Optimized image component
const BoatImage = memo(
  ({
    src,
    alt,
    className = "",
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => {
    const { imageConfig } = usePerformanceAwareFeatures();

    const optimizedSrc = useMemo(() => {
      const url = new URL(src, window.location.origin);
      url.searchParams.set("q", imageConfig.quality.toString());
      url.searchParams.set("w", "300");
      url.searchParams.set("h", "200");
      return url.toString();
    }, [src, imageConfig.quality]);

    return (
      <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover"
          width={300}
          height={200}
        />
      </div>
    );
  }
);

BoatImage.displayName = "BoatImage";

export const SimplifiedBoatCard: React.FC<SimplifiedBoatCardProps> = ({
  boat,
  onSelect,
  showFeatures = false,
  className = "",
}) => {
  const { shouldSimplify, config, getProps } = useSimplifiedUI("BoatCard");
  const { featureFlags } = usePerformanceAwareFeatures();

  // Get optimized props
  const optimizedProps = getProps({
    boat,
    onSelect,
    showFeatures,
    className,
  });

  // Limit features for performance
  const displayFeatures = useMemo(() => {
    if (!optimizedProps.showFeatures || config.disableNonEssentialFeatures) {
      return [];
    }
    return (optimizedProps.boat.features || []).slice(
      0,
      shouldSimplify ? 2 : 3
    );
  }, [
    optimizedProps.showFeatures,
    optimizedProps.boat.features,
    shouldSimplify,
    config.disableNonEssentialFeatures,
  ]);

  const handleClick = () => {
    if (optimizedProps.onSelect) {
      optimizedProps.onSelect(optimizedProps.boat);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${optimizedProps.className}`}
      onClick={handleClick}
      data-component="BoatCard"
    >
      {/* Image */}
      <BoatImage
        src={optimizedProps.boat.imageUrl}
        alt={optimizedProps.boat.name}
        className="aspect-video"
      />

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {optimizedProps.boat.name}
            </h3>
            <p className="text-sm text-gray-600">{optimizedProps.boat.type}</p>
          </div>
          <PriceDisplay price={optimizedProps.boat.pricePerDay} />
        </div>

        {/* Location and capacity */}
        <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{optimizedProps.boat.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{optimizedProps.boat.capacity} guests</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex justify-between items-center">
          <RatingDisplay
            rating={optimizedProps.boat.rating}
            reviewCount={optimizedProps.boat.reviewCount}
          />

          {/* Simple book button */}
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Book
          </button>
        </div>

        {/* Features - only show if enabled and not simplified */}
        {displayFeatures.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {displayFeatures.map((feature, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(SimplifiedBoatCard);
