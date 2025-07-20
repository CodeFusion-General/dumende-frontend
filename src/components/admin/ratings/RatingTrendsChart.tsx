import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import { ChartError } from "@/components/admin/ratings/errors/ErrorStates";
import {
  ChartLoading,
  LoadingOverlay,
} from "@/components/admin/ratings/loading/LoadingStates";
import { ChartEmpty } from "@/components/admin/ratings/empty/EmptyStates";
import { ComponentErrorWrapper } from "@/components/admin/ratings/errors/ErrorStates";
import { RatingTrend } from "@/types/ratings.types";

interface RatingTrendsChartProps {
  trends: RatingTrend[];
  className?: string;
}

type TimePeriod = 7 | 30 | 90;

interface ProcessedTrendData {
  date: string;
  rating: number;
  count: number;
  formattedDate: string;
  dayName: string;
}

const RatingTrendsChart: React.FC<RatingTrendsChartProps> = ({
  trends,
  className = "",
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(30);
  const [animatedData, setAnimatedData] = useState<ProcessedTrendData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Turkish month names and day names
  const turkishMonths = [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ];

  const turkishDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  // Process and filter trends data based on selected period
  const processedTrends = React.useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - selectedPeriod);

    return trends
      .filter((trend) => new Date(trend.date) >= cutoffDate)
      .map((trend) => {
        const date = new Date(trend.date);
        const dayName = turkishDays[date.getDay()];
        const formattedDate =
          selectedPeriod <= 7
            ? dayName
            : `${date.getDate()} ${turkishMonths[date.getMonth()]}`;

        return {
          ...trend,
          formattedDate,
          dayName,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trends, selectedPeriod]);

  // Animate chart data on period change
  useEffect(() => {
    try {
      setHasError(false);
      setIsAnimating(true);
      setAnimatedData([]);

      const animationDuration = 800;
      const steps = 30;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        const newData = processedTrends.map((item, index) => ({
          ...item,
          rating: item.rating * easedProgress,
          count: Math.round(item.count * easedProgress),
        }));

        setAnimatedData(newData);

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedData(processedTrends);
          setIsAnimating(false);
        }
      }, animationDuration / steps);

      return () => clearInterval(timer);
    } catch (error) {
      console.error("Error animating chart data:", error);
      setHasError(true);
      setIsAnimating(false);
    }
  }, [processedTrends]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      const fullDate = `${date.getDate()} ${
        turkishMonths[date.getMonth()]
      } ${date.getFullYear()}`;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{fullDate}</p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-primary">
              {data.rating > 0 ? data.rating.toFixed(1) : "0.0"}
            </span>{" "}
            ortalama puan
          </p>
          <p className="text-xs text-gray-500">{data.count} değerlendirme</p>
        </div>
      );
    }
    return null;
  };

  // Calculate average rating for the period
  const averageRating = React.useMemo(() => {
    const validRatings = processedTrends.filter((trend) => trend.rating > 0);
    if (validRatings.length === 0) return 0;

    const sum = validRatings.reduce((acc, trend) => acc + trend.rating, 0);
    return sum / validRatings.length;
  }, [processedTrends]);

  // Calculate trend direction
  const trendDirection = React.useMemo(() => {
    if (processedTrends.length < 2) return null;

    const firstHalf = processedTrends.slice(
      0,
      Math.floor(processedTrends.length / 2)
    );
    const secondHalf = processedTrends.slice(
      Math.floor(processedTrends.length / 2)
    );

    const firstAvg =
      firstHalf.reduce((sum, trend) => sum + trend.rating, 0) /
      firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, trend) => sum + trend.rating, 0) /
      secondHalf.length;

    const difference = secondAvg - firstAvg;
    return {
      isPositive: difference > 0,
      value: Math.abs(difference),
    };
  }, [processedTrends]);

  // Handle error state
  if (hasError) {
    return (
      <ChartError
        onRetry={() => {
          setHasError(false);
          setSelectedPeriod(30); // Reset to default
        }}
        className={className}
      />
    );
  }

  return (
    <ComponentErrorWrapper
      componentName="Puan Trendleri Grafiği"
      onError={() => setHasError(true)}
    >
      <Card
        className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 ${className}`}
        role="region"
        aria-labelledby="trends-chart-title"
      >
        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"
          aria-hidden="true"
        />

        <CardHeader className="relative pb-4">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0">
            <CardTitle
              id="trends-chart-title"
              className="text-base xs:text-lg font-montserrat text-gray-900 flex items-center gap-2"
            >
              <div
                className="p-1.5 xs:p-2 rounded-lg bg-primary/10"
                aria-hidden="true"
              >
                <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 text-primary" />
              </div>
              Puan Trendleri
            </CardTitle>

            {/* Period Selector */}
            <div
              className="flex items-center gap-1 bg-gray-100 rounded-lg p-1"
              role="tablist"
              aria-label="Zaman aralığı seçimi"
            >
              {([7, 30, 90] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2 xs:px-3 py-1.5 text-xs xs:text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
                    selectedPeriod === period
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                  role="tab"
                  aria-selected={selectedPeriod === period}
                  aria-label={`Son ${period} günün trendlerini göster`}
                >
                  {period} gün
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-roboto">
                Son {selectedPeriod} gün
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-roboto">
                Ortalama:
              </span>
              <span className="text-sm font-semibold text-primary font-montserrat">
                {averageRating.toFixed(1)}
              </span>
            </div>

            {trendDirection && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  trendDirection.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${
                    trendDirection.isPositive ? "" : "rotate-180"
                  }`}
                />
                <span>{trendDirection.value.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={animatedData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="ratingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#1A5F7A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1A5F7A" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  interval={selectedPeriod <= 7 ? 0 : "preserveStartEnd"}
                />

                <YAxis
                  domain={[0, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => value.toFixed(1)}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Area fill */}
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="none"
                  fill="url(#ratingGradient)"
                  fillOpacity={1}
                />

                {/* Main line */}
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#1A5F7A"
                  strokeWidth={3}
                  dot={{
                    fill: "#1A5F7A",
                    strokeWidth: 2,
                    stroke: "#ffffff",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#1A5F7A",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  animationDuration={isAnimating ? 50 : 800}
                  animationEasing="ease-out"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Empty state */}
          {processedTrends.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-roboto">
                  Bu dönem için veri bulunmuyor
                </p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isAnimating && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Yükleniyor...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ComponentErrorWrapper>
  );
};

export default RatingTrendsChart;
