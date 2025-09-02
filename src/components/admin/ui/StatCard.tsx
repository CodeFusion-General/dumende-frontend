import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period: string;
  };
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "emerald";
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  red: "text-red-600",
  yellow: "text-yellow-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  emerald: "text-emerald-600",
};

const changeColorClasses = {
  increase: "text-green-600",
  decrease: "text-red-600",
  neutral: "text-gray-600",
};

/**
 * StatCard - İstatistik kartları için yeniden kullanılabilir bileşen
 *
 * Dashboard ve diğer admin sayfalarında istatistikleri göstermek için kullanılır.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = "blue",
  loading = false,
  onClick,
}) => {
  const renderChangeIcon = () => {
    if (!change) return null;

    switch (change.type) {
      case "increase":
        return <TrendingUp className="w-3 h-3" />;
      case "decrease":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && <div className={colorClasses[color]}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
        </div>
        {change && (
          <CardDescription
            className={`text-sm flex items-center gap-1 ${
              changeColorClasses[change.type]
            }`}
          >
            {renderChangeIcon()}
            <span>
              {change.type === "increase"
                ? "+"
                : change.type === "decrease"
                ? "-"
                : ""}
              {Math.abs(change.value)}% {change.period}
            </span>
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
export { StatCard };
