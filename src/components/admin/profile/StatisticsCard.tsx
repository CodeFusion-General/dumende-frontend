import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Star,
  Calendar,
  DollarSign,
  UserCheck,
  Activity,
  Award,
} from "lucide-react";
import { CaptainStatistics } from "@/types/profile.types";
import { StatisticsCardSkeleton } from "./ProfileLoadingSkeletons";
import { ProfileCardErrorBoundary } from "./ProfileErrorBoundary";

interface StatisticsCardProps {
  statistics?: CaptainStatistics;
  isLoading?: boolean;
  onRetry?: () => void;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  statistics,
  isLoading = false,
  onRetry,
}) => {
  // Format numbers with proper locale
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "N/A";
    return num.toLocaleString("tr-TR");
  };

  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  // Format rating with stars
  const formatRating = (rating: number | undefined): string => {
    if (rating === undefined || rating === null) return "N/A";
    return rating.toFixed(1);
  };

  // Get rating color based on value
  const getRatingColor = (rating: number | undefined): string => {
    if (!rating) return "text-gray-400";
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-yellow-600";
    if (rating >= 3.5) return "text-orange-600";
    return "text-red-600";
  };

  // Get completion rate color
  const getCompletionRateColor = (rate: number | undefined): string => {
    if (!rate) return "bg-gray-400";
    if (rate >= 95) return "bg-green-500";
    if (rate >= 90) return "bg-yellow-500";
    if (rate >= 80) return "bg-orange-500";
    return "bg-red-500";
  };

  // Prepare chart data for tours over time (mock data for visualization)
  const chartData = [
    { month: "Oca", tours: Math.floor((statistics.totalTours || 0) * 0.08) },
    { month: "Şub", tours: Math.floor((statistics.totalTours || 0) * 0.06) },
    { month: "Mar", tours: Math.floor((statistics.totalTours || 0) * 0.09) },
    { month: "Nis", tours: Math.floor((statistics.totalTours || 0) * 0.12) },
    { month: "May", tours: Math.floor((statistics.totalTours || 0) * 0.15) },
    { month: "Haz", tours: Math.floor((statistics.totalTours || 0) * 0.18) },
    { month: "Tem", tours: Math.floor((statistics.totalTours || 0) * 0.2) },
    { month: "Ağu", tours: Math.floor((statistics.totalTours || 0) * 0.12) },
  ];

  // Prepare pie chart data for customer distribution
  const customerData = [
    {
      name: "Tekrar Eden",
      value: statistics.repeatCustomers || 0,
      color: "#3498db",
    },
    {
      name: "Yeni Müşteri",
      value: (statistics.totalTours || 0) - (statistics.repeatCustomers || 0),
      color: "#95a5a6",
    },
  ];

  const chartConfig = {
    tours: {
      label: "Turlar",
      color: "#3498db",
    },
  };

  if (isLoading || !statistics) {
    return <StatisticsCardSkeleton />;
  }

  // Check if we have any statistics data
  const hasData =
    statistics &&
    Object.values(statistics).some(
      (value) => value !== undefined && value !== null
    );

  if (!hasData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#2c3e50]">
            İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Henüz İstatistik Yok
            </h3>
            <p className="text-gray-500">
              İlk turunuzu tamamladıktan sonra istatistikleriniz burada
              görünecek.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ProfileCardErrorBoundary cardName="İstatistikler" onRetry={onRetry}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#2c3e50] flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            İstatistikler
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Tours */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-blue-700 leading-tight">
                  Toplam Tur
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900">
                {formatNumber(statistics.totalTours)}
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-yellow-700 leading-tight">
                  Ortalama Puan
                </span>
              </div>
              <div
                className={`text-lg sm:text-2xl font-bold ${getRatingColor(
                  statistics.averageRating
                )}`}
              >
                {formatRating(statistics.averageRating)}
                {statistics.averageRating && (
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">
                    / 5.0
                  </span>
                )}
              </div>
            </div>

            {/* Years Active */}
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-700 leading-tight">
                  Aktif Yıl
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-900">
                {formatNumber(statistics.yearsActive)}
              </div>
            </div>

            {/* Total Reviews */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-purple-700 leading-tight">
                  Toplam Yorum
                </span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900">
                {formatNumber(statistics.totalReviews)}
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Tamamlama Oranı
                </span>
              </div>
              <Badge
                variant={
                  statistics.completionRate && statistics.completionRate >= 95
                    ? "default"
                    : "secondary"
                }
                className="text-xs"
              >
                {formatPercentage(statistics.completionRate)}
              </Badge>
            </div>
            <Progress
              value={statistics.completionRate || 0}
              className="h-2"
              style={{
                backgroundColor: "#e5e7eb",
              }}
            />
          </div>

          {/* Revenue and Repeat Customers (if available) */}
          {(statistics.totalRevenue || statistics.repeatCustomers) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {statistics.totalRevenue && (
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-1 sm:gap-2 mb-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-emerald-700 leading-tight">
                      Toplam Gelir
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-900">
                    {formatCurrency(statistics.totalRevenue)}
                  </div>
                </div>
              )}

              {statistics.repeatCustomers && (
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-1 sm:gap-2 mb-2">
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-indigo-700 leading-tight">
                      Tekrar Eden Müşteri
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-indigo-900">
                    {formatNumber(statistics.repeatCustomers)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts Section */}
          {statistics.totalTours && statistics.totalTours > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Monthly Tours Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Aylık Tur Dağılımı (Tahmini)
                </h4>
                <ChartContainer config={chartConfig} className="h-40 sm:h-48">
                  <BarChart data={chartData}>
                    <Bar
                      dataKey="tours"
                      fill="var(--color-tours)"
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: "rgba(52, 152, 219, 0.1)" }}
                    />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Customer Distribution Chart */}
              {statistics.repeatCustomers && statistics.repeatCustomers > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Müşteri Dağılımı
                  </h4>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={customerData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {customerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              return (
                                <div className="bg-white p-2 border rounded shadow-lg">
                                  <p className="text-sm font-medium">
                                    {data.payload.name}: {data.value}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
                    {customerData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ProfileCardErrorBoundary>
  );
};

export default StatisticsCard;
