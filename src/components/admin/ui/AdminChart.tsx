import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData, ChartConfig, ChartType } from "@/types/adminDashboard";

interface AdminChartProps {
  type: ChartType;
  data: ChartData;
  config?: ChartConfig;
  loading?: boolean;
  className?: string;
}

const defaultColors = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
];

/**
 * AdminChart - Admin paneli için grafik bileşeni
 *
 * Recharts kütüphanesi kullanarak çeşitli grafik türlerini destekler.
 */
const AdminChart: React.FC<AdminChartProps> = ({
  type,
  data,
  config = {},
  loading = false,
  className = "",
}) => {
  const {
    width,
    height = 300,
    colors = defaultColors,
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    responsive = true,
  } = config;

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === "number") {
      // Para birimi formatı
      if (
        name.toLowerCase().includes("gelir") ||
        name.toLowerCase().includes("revenue")
      ) {
        return `₺${value.toLocaleString("tr-TR")}`;
      }
      // Yüzde formatı
      if (
        name.toLowerCase().includes("oran") ||
        name.toLowerCase().includes("rate")
      ) {
        return `%${value}`;
      }
      // Normal sayı formatı
      return value.toLocaleString("tr-TR");
    }
    return value;
  };

  const renderChart = () => {
    const commonProps = {
      data: data.data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {showTooltip && (
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {showTooltip && (
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {showTooltip && (
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case "pie":
      case "donut":
        return (
          <PieChart {...commonProps}>
            {showTooltip && (
              <Tooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Pie
              data={data.data}
              cx="50%"
              cy="50%"
              innerRadius={type === "donut" ? 60 : 0}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return <div>Desteklenmeyen grafik türü</div>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          {data.description && (
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Grafik yükleniyor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {data.title}
        </CardTitle>
        {data.description && (
          <p className="text-sm text-gray-600">{data.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {responsive ? (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        ) : (
          <div style={{ width: width || "100%", height }}>{renderChart()}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminChart;
export { AdminChart };
