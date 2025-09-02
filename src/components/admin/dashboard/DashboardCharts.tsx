import React from "react";
import AdminChart from "@/components/admin/ui/AdminChart";
import { ChartData } from "@/types/adminDashboard";

interface DashboardChartsProps {
  loading?: boolean;
}

/**
 * DashboardCharts - Dashboard grafikleri bileşeni
 *
 * Ana dashboard sayfasında kullanıcı büyümesi, gelir trendleri ve diğer
 * önemli metrikleri gösteren grafikleri içerir.
 */
const DashboardCharts: React.FC<DashboardChartsProps> = ({
  loading = false,
}) => {
  // Mock data - gerçek implementasyonda API'den gelecek
  const userGrowthData: ChartData = {
    title: "Kullanıcı Büyümesi",
    description: "Son 6 aydaki kullanıcı kayıt trendleri",
    data: [
      { name: "Ocak", value: 120 },
      { name: "Şubat", value: 150 },
      { name: "Mart", value: 180 },
      { name: "Nisan", value: 220 },
      { name: "Mayıs", value: 280 },
      { name: "Haziran", value: 350 },
    ],
  };

  const revenueData: ChartData = {
    title: "Gelir Trendleri",
    description: "Aylık gelir performansı (₺)",
    data: [
      { name: "Ocak", value: 45000 },
      { name: "Şubat", value: 52000 },
      { name: "Mart", value: 48000 },
      { name: "Nisan", value: 61000 },
      { name: "Mayıs", value: 75000 },
      { name: "Haziran", value: 89000 },
    ],
  };

  const bookingStatusData: ChartData = {
    title: "Rezervasyon Durumları",
    description: "Bu ayki rezervasyon dağılımı",
    data: [
      { name: "Tamamlandı", value: 45 },
      { name: "Onaylandı", value: 30 },
      { name: "Beklemede", value: 15 },
      { name: "İptal", value: 10 },
    ],
  };

  const boatApprovalData: ChartData = {
    title: "Tekne Onay Durumları",
    description: "Son 3 aydaki tekne başvuru sonuçları",
    data: [
      { name: "Nisan", value: 25 },
      { name: "Mayıs", value: 32 },
      { name: "Haziran", value: 28 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* İlk satır - Büyük grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          type="area"
          data={userGrowthData}
          loading={loading}
          config={{
            height: 350,
            colors: ["#3B82F6"],
            showGrid: true,
            showLegend: false,
          }}
        />
        <AdminChart
          type="line"
          data={revenueData}
          loading={loading}
          config={{
            height: 350,
            colors: ["#10B981"],
            showGrid: true,
            showLegend: false,
          }}
        />
      </div>

      {/* İkinci satır - Küçük grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChart
          type="donut"
          data={bookingStatusData}
          loading={loading}
          config={{
            height: 300,
            colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
            showGrid: false,
            showLegend: true,
          }}
        />
        <AdminChart
          type="bar"
          data={boatApprovalData}
          loading={loading}
          config={{
            height: 300,
            colors: ["#8B5CF6"],
            showGrid: true,
            showLegend: false,
          }}
        />
      </div>
    </div>
  );
};

export default DashboardCharts;
