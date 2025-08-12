import React, { useEffect, useState, useRef } from "react";
import { BoatCard } from "@/components/boats/BoatCard";
import { BoatDTO } from "@/types/boat.types";
import { staggerAnimation } from "@/lib/animations";

interface AnimatedBoatGridProps {
  boats: BoatDTO[];
  viewMode: "grid" | "list";
  isHourlyMode: boolean;
  comparedBoats: string[];
  onCompareToggle: (id: string) => void;
  loading?: boolean;
  // Detay linkini özelleştirmek için isteğe bağlı builder (arama parametrelerini korumak vb.)
  detailLinkBuilder?: (boat: BoatDTO) => string;
}

const AnimatedBoatGrid: React.FC<AnimatedBoatGridProps> = ({
  boats,
  viewMode,
  isHourlyMode,
  comparedBoats,
  onCompareToggle,
  loading = false,
  detailLinkBuilder,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const previousBoatsLength = useRef(boats.length);

  // Trigger staggered animation when boats change
  useEffect(() => {
    if (boats.length !== previousBoatsLength.current) {
      setAnimationKey((prev) => prev + 1);
      previousBoatsLength.current = boats.length;

      // Apply staggered animation to boat cards
      if (gridRef.current && boats.length > 0) {
        const cards = gridRef.current.querySelectorAll(".boat-card");
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
  }, [boats.length]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      {boats.map((boat, index) => (
        <div key={boat.id} className="boat-card opacity-100 visible">
          <BoatCard
            boat={boat}
            viewMode={viewMode}
            isHourlyMode={isHourlyMode}
            isCompared={comparedBoats.includes(boat.id.toString())}
            onCompareToggle={onCompareToggle}
            detailLinkBuilder={detailLinkBuilder}
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedBoatGrid;
