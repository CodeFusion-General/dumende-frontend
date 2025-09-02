import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminChart } from "@/components/admin/ui/AdminChart";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { adminCaptainApplicationService } from "@/services/adminPanel/adminCaptainApplicationService";

interface CaptainApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisMonth: number;
  lastMonth: number;
  avgProcessingTime: number;
  approvalRate: number;
  rejectionRate: number;
  monthlyTrend: {
    month: string;
    applications: number;
    approved: number;
    rejected: number;
  }[];
  processingTimeByMonth: {
    month: string;
    avgDays: number;
  }[];
}

interface PerformanceMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvalRate: number;
  avgProcessingTime: number;
  weeklyApplications: number;
  weeklyApproved: number;
  weeklyRejected: number;
  monthlyTrend: any[];
  processingTimeByMonth: any[];
}

const CaptainApplicationReports: React.FC = () => {
  const [stats, setStats] = useState<CaptainApplicationStats | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, metricsData] = await Promise.all([
        adminCaptainApplicationService.getStatistics(),
        adminCaptainApplicationService.getPerformanceMetrics(),
      ]);

      setStats(statsData);
      setMetrics(metricsData);
    } catch (e: any) {
      setError(e?.message || "Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const csvData = await adminCaptainApplicationService.exportToCSV();

      // Create and download CSV file
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `kaptan-basvurulari-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      setError(e?.message || "Dışa aktarma başarısız");
    } finally {
      setExportLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, type: "neutral" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      type:
        change > 0
          ? ("increase" as const)
          : change < 0
          ? ("decrease" as const)
          : ("neutral" as const),
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Raporlar yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats || !metrics) {
    return (
      <Alert>
        <AlertDescription>Rapor verileri bulunamadı</AlertDescription>
      </Alert>
    );
  }

  const monthlyTrend = calculateTrend(stats.thisMonth, stats.lastMonth);

  // Prepare chart data
  const applicationTrendData = stats.monthlyTrend.map((item) => ({
    name: item.month,
    "Toplam Başvuru": item.applications,
    Onaylanan: item.approved,
    Reddedilen: item.rejected,
  }));

  const processingTimeData = stats.processingTimeByMonth.map((item) => ({
    name: item.month,
    "Ortalama Gün": item.avgDays,
  }));

  const statusDistributionData = [
    { name: "Beklemede", value: stats.pending, color: "#f59e0b" },
    { name: "Onaylandı", value: stats.approved, color: "#10b981" },
    { name: "Reddedildi", value: stats.rejected, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Kaptan Başvuru Raporları</h2>
          <p className="text-muted-foreground">
            Başvuru istatistikleri ve performans analizi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <Activity className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button onClick={handleExportCSV} disabled={exportLoading}>
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? "Dışa Aktarılıyor..." : "CSV İndir"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Başvuru"
          value={stats.total}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Bu Ay"
          value={stats.thisMonth}
          icon={<Calendar className="w-5 h-5" />}
          color="green"
          change={{
            value: monthlyTrend.value,
            type: monthlyTrend.type,
            period: "Geçen aya göre",
          }}
        />
        <StatCard
          title="Onay Oranı"
          value={`${stats.approvalRate}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Ort. İşlem Süresi"
          value={`${stats.avgProcessingTime} gün`}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Haftalık Performans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Yeni Başvuru
              </span>
              <span className="font-semibold">
                {metrics.weeklyApplications}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Onaylanan</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{metrics.weeklyApproved}</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reddedilen</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{metrics.weeklyRejected}</span>
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistributionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((item.value / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend Analizi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Onay Oranı Trendi
              </span>
              <div className="flex items-center gap-1">
                {stats.approvalRate > 70 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-semibold">
                  {stats.approvalRate}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">İşlem Hızı</span>
              <div className="flex items-center gap-1">
                {stats.avgProcessingTime < 5 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-semibold">
                  {stats.avgProcessingTime} gün
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Bekleyen Başvuru
              </span>
              <Badge variant={stats.pending > 50 ? "destructive" : "secondary"}>
                {stats.pending}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Aylık Başvuru Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart
              type="bar"
              data={applicationTrendData}
              config={{
                xAxisKey: "name",
                bars: [
                  { key: "Toplam Başvuru", color: "#3b82f6" },
                  { key: "Onaylanan", color: "#10b981" },
                  { key: "Reddedilen", color: "#ef4444" },
                ],
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              İşlem Süresi Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart
              type="line"
              data={processingTimeData}
              config={{
                xAxisKey: "name",
                lines: [{ key: "Ortalama Gün", color: "#8b5cf6" }],
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">
                Toplam Başvuru
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground">Bekleyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
              <div className="text-sm text-muted-foreground">Onaylanan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <div className="text-sm text-muted-foreground">Reddedilen</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {stats.approvalRate}%
                </div>
                <div className="text-sm text-muted-foreground">Onay Oranı</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {stats.rejectionRate}%
                </div>
                <div className="text-sm text-muted-foreground">Red Oranı</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {stats.avgProcessingTime} gün
                </div>
                <div className="text-sm text-muted-foreground">
                  Ortalama İşlem Süresi
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptainApplicationReports;
