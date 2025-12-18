import React, { useEffect, useState, useRef } from "react";
import { TourCard } from "@/components/tours/TourCard";
import { TourDTO } from "@/types/tour.types";
import { staggerAnimation } from "@/lib/animations";

interface AnimatedTourGridProps {
  tours: TourDTO[];
  viewMode: "grid" | "list";
  comparedTours: string[];
  onCompareToggle: (id: string) => void;
  loading?: boolean;
}

const AnimatedTourGridComponent: React.FC<AnimatedTourGridProps> = ({
  tours,
  viewMode,
  comparedTours,
  onCompareToggle,
  loading = false,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const previousToursLength = useRef(tours.length);

  // Trigger staggered animation when tours change
  useEffect(() => {
    if (tours.length !== previousToursLength.current) {
      setAnimationKey((prev) => prev + 1);
      previousToursLength.current = tours.length;

      // Apply staggered animation to tour cards
      if (gridRef.current && tours.length > 0) {
        const cards = gridRef.current.querySelectorAll(".tour-card");
        if (cards.length > 0) {
          // Reset animation classes
          cards.forEach((card) => {
            card.classList.remove("animate-fade-in-up", "opacity-0");
            card.classList.add("opacity-0");
          });

          // Apply staggered animation
          setTimeout(() => {
            staggerAnimation(cards, "animate-fade-in-up", 100);
          }, 50);
        }
      }
    }
  }, [tours.length]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div
      className={`grid transition-all duration-500 ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      } gap-6`}
    >
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="animate-pulse">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
            <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      ref={gridRef}
      key={animationKey}
      className={`grid transition-all duration-500 ease-glass ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      } gap-6`}
    >
      {tours.map((tour, index) => (
        <div key={tour.id} className="tour-card opacity-100 visible">
          <TourCard
            tour={tour}
            viewMode={viewMode}
            variant="listing"
            isCompared={comparedTours.includes(tour.id.toString())}
            onCompareToggle={onCompareToggle}
          />
        </div>
      ))}
    </div>
  );
};

const AnimatedTourGrid = React.memo(AnimatedTourGridComponent);

export default AnimatedTourGrid;
