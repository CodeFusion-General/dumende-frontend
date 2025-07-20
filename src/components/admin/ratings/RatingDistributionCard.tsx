import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { ComponentErrorWrapper } from "@/components/admin/ratings/errors/ErrorStates";
import { StatisticsEmpty } from "@/components/admin/ratings/empty/EmptyStates";

interface RatingDistributionCardProps {
  distribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
  totalReviews: number;
}

const RatingDistributionCard: React.FC<RatingDistributionCardProps> = ({
  distribution,
  totalReviews,
}) => {
  const [animatedPercentages, setAnimatedPercentages] = useState<number[]>(
    new Array(5).fill(0)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Color palette for different star ratings
  const getBarColor = (stars: number): string => {
    const colors = {
      5: "bg-gradient-to-r from-green-500 to-green-400",
      4: "bg-gradient-to-r from-green-400 to-green-300",
      3: "bg-gradient-to-r from-yellow-400 to-yellow-300",
      2: "bg-gradient-to-r from-orange-400 to-orange-300",
      1: "bg-gradient-to-r from-red-400 to-red-300",
    };
    return colors[stars as keyof typeof colors] || colors[3];
  };

  const getBarHoverColor = (stars: number): string => {
    const colors = {
      5: "hover:from-green-600 hover:to-green-500",
      4: "hover:from-green-500 hover:to-green-400",
      3: "hover:from-yellow-500 hover:to-yellow-400",
      2: "hover:from-orange-500 hover:to-orange-400",
      1: "hover:from-red-500 hover:to-red-400",
    };
    return colors[stars as keyof typeof colors] || colors[3];
  };

  // Animate percentages on mount
  useEffect(() => {
    setIsAnimating(true);
    const duration = 1200; // 1.2 seconds
    const steps = 60;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const newPercentages = distribution.map((item) =>
        Math.round(item.percentage * easedProgress)
      );

      setAnimatedPercentages(newPercentages);

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedPercentages(distribution.map((item) => item.percentage));
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [distribution]);

  // Render star icons
  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: count }, (_, i) => (
          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    );
  };

  return (
    <ComponentErrorWrapper
      componentName="Puan Dağılımı Kartı"
      onError={() => setHasError(true)}
    >
      <Card
        className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2"
        role="region"
        aria-labelledby="rating-distribution-title"
      >
        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"
          aria-hidden="true"
        />

        <CardHeader className="relative pb-4">
          <CardTitle
            id="rating-distribution-title"
            className="text-base xs:text-lg font-montserrat text-gray-900 flex items-center gap-2"
          >
            <div
              className="p-1.5 xs:p-2 rounded-lg bg-primary/10"
              aria-hidden="true"
            >
              <Star className="w-4 h-4 xs:w-5 xs:h-5 text-primary" />
            </div>
            Puan Dağılımı
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Distribution bars */}
          <div className="space-y-3">
            {distribution
              .slice()
              .reverse() // Show 5 stars first
              .map((item, index) => {
                const reversedIndex = distribution.length - 1 - index;
                const animatedPercentage =
                  animatedPercentages[reversedIndex] || 0;
                const maxPercentage = Math.max(
                  ...distribution.map((d) => d.percentage)
                );
                const barWidth =
                  maxPercentage > 0
                    ? (animatedPercentage / maxPercentage) * 100
                    : 0;

                return (
                  <div
                    key={item.stars}
                    className="group/bar flex items-center gap-2 xs:gap-3 py-2 px-1 rounded-lg hover:bg-white/50 transition-all duration-200 focus-within:bg-white/50"
                    role="progressbar"
                    aria-valuenow={animatedPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.stars} yıldız: ${item.count} değerlendirme, ${animatedPercentage}%`}
                    tabIndex={0}
                  >
                    {/* Star rating */}
                    <div
                      className="flex items-center gap-1 xs:gap-2 w-16 xs:w-20 flex-shrink-0"
                      aria-hidden="true"
                    >
                      {renderStars(item.stars)}
                    </div>

                    {/* Progress bar container */}
                    <div className="flex-1 relative">
                      <div className="h-5 xs:h-6 bg-gray-100 rounded-full overflow-hidden relative">
                        {/* Animated progress bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-300 ease-out ${getBarColor(
                            item.stars
                          )} ${getBarHoverColor(
                            item.stars
                          )} relative overflow-hidden`}
                          style={{
                            width: `${barWidth}%`,
                            transition: isAnimating
                              ? "width 0.05s ease-out"
                              : "width 0.3s ease-out",
                          }}
                          aria-hidden="true"
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse" />
                        </div>

                        {/* Percentage label inside bar */}
                        {animatedPercentage > 15 && (
                          <div className="absolute inset-0 flex items-center justify-start pl-2 xs:pl-3">
                            <span className="text-white text-xs xs:text-sm font-medium font-montserrat drop-shadow-sm">
                              {animatedPercentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Count and percentage */}
                    <div className="flex flex-col items-end w-12 xs:w-16 flex-shrink-0">
                      <span className="text-xs xs:text-sm font-semibold text-gray-900 font-montserrat">
                        {item.count}
                      </span>
                      {animatedPercentage <= 15 && (
                        <span className="text-xs text-gray-500 font-roboto">
                          {animatedPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Summary footer */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-roboto">
                Toplam Değerlendirme
              </span>
              <span className="font-semibold text-gray-900 font-montserrat">
                {totalReviews.toLocaleString("tr-TR")} değerlendirme
              </span>
            </div>
          </div>

          {/* Hover tooltip for mobile */}
          <div className="md:hidden text-xs text-gray-500 text-center font-roboto">
            Detayları görmek için satırlara dokunun
          </div>
        </CardContent>
      </Card>
    </ComponentErrorWrapper>
  );
};

export default RatingDistributionCard;
