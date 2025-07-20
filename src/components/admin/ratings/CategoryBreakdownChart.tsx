import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, MapPin } from "lucide-react";
import { ChartError } from "@/components/admin/ratings/errors/ErrorStates";
import { LoadingOverlay } from "@/components/admin/ratings/loading/LoadingStates";
import { ChartEmpty } from "@/components/admin/ratings/empty/EmptyStates";
import { ComponentErrorWrapper } from "@/components/admin/ratings/errors/ErrorStates";

interface CategoryBreakdownData {
  boats: number;
  tours: number;
}

interface CategoryBreakdownChartProps {
  categoryBreakdown: CategoryBreakdownData;
  className?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  label: string;
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  categoryBreakdown,
  className = "",
}) => {
  const [animatedData, setAnimatedData] = useState<ChartDataItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Calculate total and percentages
  const total = categoryBreakdown.boats + categoryBreakdown.tours;

  // Chart data with colors and icons
  const chartData: ChartDataItem[] = React.useMemo(() => {
    const boatPercentage =
      total > 0 ? Math.round((categoryBreakdown.boats / total) * 100) : 0;
    const tourPercentage =
      total > 0 ? Math.round((categoryBreakdown.tours / total) * 100) : 0;

    return [
      {
        name: "boats",
        value: categoryBreakdown.boats,
        percentage: boatPercentage,
        color: "#1A5F7A", // Primary blue for boats
        icon: <Ship className="w-4 h-4" />,
        label: "Tekne",
      },
      {
        name: "tours",
        value: categoryBreakdown.tours,
        percentage: tourPercentage,
        color: "#F8CB2E", // Accent yellow for tours
        icon: <MapPin className="w-4 h-4" />,
        label: "Tur",
      },
    ].filter((item) => item.value > 0); // Only show categories with data
  }, [categoryBreakdown, total]);

  // Animate chart data on mount and data change
  useEffect(() => {
    try {
      setHasError(false);
      setIsAnimating(true);
      setAnimatedData([]);

      const animationDuration = 1000; // 1 second
      const steps = 50;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        // Easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        const newData = chartData.map((item) => ({
          ...item,
          value: Math.round(item.value * easedProgress),
        }));

        setAnimatedData(newData);

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedData(chartData);
          setIsAnimating(false);
        }
      }, animationDuration / steps);

      return () => clearInterval(timer);
    } catch (error) {
      console.error("Error animating category breakdown chart:", error);
      setHasError(true);
      setIsAnimating(false);
    }
  }, [chartData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-gray-900">{data.label}</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-primary">
              {data.value.toLocaleString("tr-TR")}
            </span>{" "}
            değerlendirme
          </p>
          <p className="text-sm text-gray-500">
            Toplam içinde{" "}
            <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label component for percentages
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }: any) => {
    if (percentage < 5) return null; // Don't show labels for very small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-semibold text-sm drop-shadow-sm"
      >
        {`${percentage}%`}
      </text>
    );
  };

  // Handle pie slice hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Handle error state
  if (hasError) {
    return (
      <ChartError
        onRetry={() => {
          setHasError(false);
        }}
        className={className}
      />
    );
  }

  return (
    <ComponentErrorWrapper
      componentName="Kategori Dağılımı Grafiği"
      onError={() => setHasError(true)}
    >
      <Card
        className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 ${className}`}
        role="region"
        aria-labelledby="category-breakdown-title"
      >
        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"
          aria-hidden="true"
        />

        <CardHeader className="relative pb-4">
          <CardTitle
            id="category-breakdown-title"
            className="text-base xs:text-lg font-montserrat text-gray-900 flex items-center gap-2"
          >
            <div
              className="p-1.5 xs:p-2 rounded-lg bg-primary/10"
              aria-hidden="true"
            >
              <div className="flex items-center gap-1">
                <Ship className="w-3 h-3 xs:w-4 xs:h-4 text-primary" />
                <MapPin className="w-3 h-3 xs:w-4 xs:h-4 text-primary" />
              </div>
            </div>
            Kategori Dağılımı
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          {total > 0 ? (
            <>
              {/* Chart Container */}
              <div
                className="h-48 xs:h-64 w-full mb-4 xs:mb-6"
                role="img"
                aria-label={`Kategori dağılımı grafiği: ${chartData
                  .map((item) => `${item.label} ${item.percentage}%`)
                  .join(", ")}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={animatedData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={80}
                      innerRadius={40} // Creates donut effect
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      animationBegin={0}
                      animationDuration={isAnimating ? 50 : 800}
                      animationEasing="ease-out"
                    >
                      {animatedData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={activeIndex === index ? "#ffffff" : "none"}
                          strokeWidth={activeIndex === index ? 3 : 0}
                          style={{
                            filter:
                              activeIndex === index
                                ? "brightness(1.1)"
                                : "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease-out",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with Statistics */}
              <div
                className="space-y-2 xs:space-y-3"
                role="list"
                aria-label="Kategori dağılımı detayları"
              >
                {chartData.map((item, index) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-2 xs:p-3 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
                      activeIndex === index
                        ? "bg-white shadow-sm scale-105"
                        : "bg-gray-50 hover:bg-white hover:shadow-sm"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`${item.label}: ${item.value.toLocaleString(
                      "tr-TR"
                    )} değerlendirme, ${item.percentage}%`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex items-center gap-2">
                        <span style={{ color: item.color }}>{item.icon}</span>
                        <span className="font-medium text-gray-900 font-montserrat">
                          {item.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 font-montserrat">
                          {item.value.toLocaleString("tr-TR")}
                        </div>
                        <div className="text-sm text-gray-500 font-roboto">
                          değerlendirme
                        </div>
                      </div>
                      <div className="text-right min-w-[3rem]">
                        <div
                          className="font-bold text-lg"
                          style={{ color: item.color }}
                        >
                          {item.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-roboto">
                    Toplam Değerlendirme
                  </span>
                  <span className="font-semibold text-gray-900 font-montserrat">
                    {total.toLocaleString("tr-TR")} değerlendirme
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center gap-2 mb-4 opacity-30">
                <Ship className="w-8 h-8 text-gray-400" />
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center font-roboto">
                Henüz kategori verisi bulunmuyor
              </p>
              <p className="text-gray-400 text-sm text-center mt-1 font-roboto">
                Değerlendirmeler geldiğinde burada görüntülenecek
              </p>
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

export default CategoryBreakdownChart;
