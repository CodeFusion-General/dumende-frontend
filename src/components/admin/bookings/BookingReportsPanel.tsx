import React, { useState, useEffect } from "react";
import { AdminChart } from "@/components/admin/ui/AdminChart";
import { StatCard } from "@/components/admin/ui/StatCard";
import { adminBookingService } from "@/services/adminPanel/adminBookingService";
import { BookingReportData, AdminBookingFilters } from "@/types/adminBooking";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";

interface BookingReportsPanelProps {
  filters?: AdminBookingFilters;
  onExport?: (format: "excel" | "csv" | "pdf") => void;
}

export const BookingReportsPanel: React.FC<BookingReportsPanelProps> = ({
  filters,
  onExport,
}) => {
  const [reportData, setReportData] = useState<BookingReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  });
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  // Load report data
  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await adminBookingService.generateBookingReport(
        filters,
        dateRange
      );
      setReportData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load report data";
      setError(errorMessage);
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadReportData();
  }, [filters, dateRange]);

  // Handle date range change
  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle export
  const handleExport = (format: "excel" | "csv" | "pdf") => {
    if (onExport) {
      onExport(format);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Rapor yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={loadReportData}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Rapor verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange("startDate", e.target.value)
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange("endDate", e.target.value)
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rapor Tipi
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={loadReportData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Yenile
            </button>
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleExport(e.target.value as any);
                    e.target.value = ""; // Reset selection
                  }
                }}
                className="appearance-none bg-blue-600 text-white px-4 py-2 pr-8 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Dışa Aktar</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
              <Download className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Rezervasyon"
          value={reportData.summary.totalBookings.toLocaleString("tr-TR")}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Toplam Gelir"
          value={`₺${reportData.summary.totalRevenue.toLocaleString("tr-TR")}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Ortalama Değer"
          value={`₺${reportData.summary.averageBookingValue.toLocaleString(
            "tr-TR"
          )}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Dönem"
          value={reportData.summary.period}
          icon={<Calendar className="w-6 h-6" />}
          color="gray"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Günlük Rezervasyon Trendi
            </h3>
          </div>
          <AdminChart
            type="line"
            data={{
              labels: reportData.charts.dailyBookings.map((item) =>
                new Date(item.date).toLocaleDateString("tr-TR")
              ),
              datasets: [
                {
                  label: "Rezervasyon Sayısı",
                  data: reportData.charts.dailyBookings.map(
                    (item) => item.count
                  ),
                  borderColor: "rgb(59, 130, 246)",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  yAxisID: "y",
                },
                {
                  label: "Gelir (₺)",
                  data: reportData.charts.dailyBookings.map(
                    (item) => item.revenue
                  ),
                  borderColor: "rgb(16, 185, 129)",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  yAxisID: "y1",
                },
              ],
            }}
            config={{
              responsive: true,
              scales: {
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                },
                y1: {
                  type: "linear",
                  display: true,
                  position: "right",
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
            }}
          />
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Durum Dağılımı
            </h3>
          </div>
          <AdminChart
            type="pie"
            data={{
              labels: reportData.charts.statusDistribution.map(
                (item) => item.status
              ),
              datasets: [
                {
                  data: reportData.charts.statusDistribution.map(
                    (item) => item.count
                  ),
                  backgroundColor: [
                    "rgba(59, 130, 246, 0.8)", // Blue for confirmed
                    "rgba(245, 158, 11, 0.8)", // Yellow for pending
                    "rgba(16, 185, 129, 0.8)", // Green for completed
                    "rgba(239, 68, 68, 0.8)", // Red for cancelled
                    "rgba(156, 163, 175, 0.8)", // Gray for others
                  ],
                  borderColor: [
                    "rgb(59, 130, 246)",
                    "rgb(245, 158, 11)",
                    "rgb(16, 185, 129)",
                    "rgb(239, 68, 68)",
                    "rgb(156, 163, 175)",
                  ],
                  borderWidth: 2,
                },
              ],
            }}
            config={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const item =
                        reportData.charts.statusDistribution[context.dataIndex];
                      return `${item.status}: ${
                        item.count
                      } (${item.percentage.toFixed(1)}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            En İyi Performans Gösterenler
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Boats */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">
              En Çok Rezervasyon Alan Tekneler
            </h4>
            <div className="space-y-3">
              {reportData.charts.topPerformers
                .filter((item) => item.type === "boat")
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.bookings} rezervasyon
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        ₺{item.revenue.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-sm text-gray-500">gelir</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Tours */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">
              En Çok Rezervasyon Alan Turlar
            </h4>
            <div className="space-y-3">
              {reportData.charts.topPerformers
                .filter((item) => item.type === "tour")
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.bookings} rezervasyon
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        ₺{item.revenue.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-sm text-gray-500">gelir</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Detaylı Rezervasyon Listesi
          </h3>
          <span className="text-sm text-gray-500">
            {reportData.bookings.length} rezervasyon gösteriliyor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hizmet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.bookings.slice(0, 10).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customerInfo.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.customerInfo.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.boatInfo?.name || booking.tourInfo?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.startDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₺{booking.totalPrice.toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.bookings.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleExport("excel")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Tüm Verileri İndir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
