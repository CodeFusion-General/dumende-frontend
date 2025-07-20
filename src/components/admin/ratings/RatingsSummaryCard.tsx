import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RatingsSummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
  animateValue?: boolean;
}

const RatingsSummaryCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  gradient = "from-primary/10 to-primary/5",
  animateValue = true,
}: RatingsSummaryCardProps) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Extract numeric value for animation
  const numericValue =
    typeof value === "number"
      ? value
      : parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;
  const isDecimal = numericValue % 1 !== 0;

  useEffect(() => {
    if (animateValue && numericValue > 0) {
      setIsAnimating(true);
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, numericValue);

        // Use easing function for smooth animation
        const progress = step / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const easedValue = numericValue * easedProgress;

        setDisplayValue(easedValue);

        if (step >= steps) {
          clearInterval(timer);
          setDisplayValue(numericValue);
          setIsAnimating(false);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(numericValue);
    }
  }, [numericValue, animateValue]);

  const formatDisplayValue = (val: number): string => {
    if (typeof value === "string" && value.includes("%")) {
      return `${isDecimal ? val.toFixed(1) : Math.round(val)}%`;
    }
    if (typeof value === "string" && value.includes("₺")) {
      return `₺${val.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;
    }
    return isDecimal ? val.toFixed(1) : Math.round(val).toString();
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    const IconComponent = trend.isPositive ? TrendingUp : TrendingDown;
    const colorClass = trend.isPositive ? "text-green-500" : "text-red-500";

    return (
      <div
        className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}
      >
        <IconComponent size={16} />
        <span>{Math.abs(trend.value)}%</span>
      </div>
    );
  };

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2"
      role="region"
      aria-label={`${title}: ${value}${subtitle ? ` ${subtitle}` : ""}`}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
        aria-hidden="true"
      />

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      <CardContent className="relative p-4 xs:p-6 flex flex-col items-center text-center">
        {/* Icon with enhanced styling */}
        <div
          className="mb-3 xs:mb-4 p-2 xs:p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
          aria-hidden="true"
        >
          <div className="text-primary text-xl xs:text-2xl">{icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-xs xs:text-sm font-medium text-gray-600 mb-2 font-montserrat uppercase tracking-wide">
          {title}
        </h3>

        {/* Animated Value */}
        <div className="text-2xl xs:text-3xl font-bold text-gray-900 mb-2 font-montserrat">
          <span
            className={`${
              isAnimating ? "text-primary" : ""
            } transition-colors duration-300`}
            aria-live="polite"
            aria-atomic="true"
          >
            {animateValue && numericValue > 0
              ? formatDisplayValue(displayValue)
              : value}
          </span>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-500 mb-2 font-roboto">{subtitle}</p>
        )}

        {/* Trend Indicator */}
        {trend && (
          <div
            className="flex items-center justify-center"
            role="status"
            aria-label={`Trend: ${
              trend.isPositive ? "Artış" : "Azalış"
            } ${Math.abs(trend.value)}%`}
          >
            {getTrendIcon()}
          </div>
        )}

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </CardContent>
    </Card>
  );
};

export default RatingsSummaryCard;
