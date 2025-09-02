import React, { useState, useEffect } from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import CaptainApplicationReports from "@/components/admin/captainApplications/CaptainApplicationReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import { adminCaptainApplicationService } from "@/services/adminPanel/adminCaptainApplicationService";

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

const CaptainApplicationReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const metricsData =
        await adminCaptainApplicationService.getPerformanceMetrics();
      setMetrics(metricsData);
    } catch (e: any) {
      setError(e?.message || "Metrikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleExportReport = async (format: "csv" | "pdf") => {
    try {
      setExportLoading(true);

      if (format === "csv") {
        const csvData = await adminCaptainApplicationService.exportToCSV();

        // Create and download CSV file
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `kaptan-basvuru-raporu-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF export would be implemented here
        console.log("PDF export not implemented yet");
      }
    } catch (e: any) {
      setError(e?.message || "Rapor dışa aktarma başarısız");
    } finally {
      setExportLoading(false);
    }
  };

  const getPerformanceStatus = (
    value: number,
    threshold: { good: number; warning: number }
  ) => {
    if (value >= threshold.good)
      return { status: "good", color: "text-green-600" };
    if (value >= threshold.warning)
      return { status: "warning", color: "text-yellow-600" };
    return { status: "poor", color: "text-red-600" };
  };

  return (
    <AdminPanelLayout
      title="Kaptan Başvuru Raporları"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        {
          label: "Kaptan Başvuruları",
          href: "/adminPanel/captain-applications",
        },
        { label: "Raporlar", href: "/adminPanel/captain-applications/reports" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMetrics} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>
          <Button
            onClick={() => handleExportReport("csv")}
            disabled={exportLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? "Dışa Aktarılıyor..." : "CSV İndir"}
          </Button>
        </div>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performans
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Trendler
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Detaylı Analiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Toplam Başvuru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.totalApplications}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">
                      Tüm zamanlar
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bekleyen Başvuru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.pendingApplications}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <Badge
                      variant={
                        metrics.pendingApplications > 50
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {metrics.pendingApplications > 50 ? "Yüksek" : "Normal"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Onay Oranı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.approvalRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span
                      className={`text-sm ${
                        getPerformanceStatus(metrics.approvalRate, {
                          good: 80,
                          warning: 60,
                        }).color
                      }`}
                    >
                      {metrics.approvalRate >= 80
                        ? "Mükemmel"
                        : metrics.approvalRate >= 60
                        ? "İyi"
                        : "Geliştirilmeli"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ort. İşlem Süresi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.avgProcessingTime} gün
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span
                      className={`text-sm ${
                        getPerformanceStatus(10 - metrics.avgProcessingTime, {
                          good: 7,
                          warning: 5,
                        }).color
                      }`}
                    >
                      {metrics.avgProcessingTime <= 3
                        ? "Hızlı"
                        : metrics.avgProcessingTime <= 5
                        ? "Normal"
                        : "Yavaş"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Weekly Performance */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Haftalık Performans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {metrics.weeklyApplications}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Yeni Başvuru
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {metrics.weeklyApproved}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Onaylanan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {metrics.weeklyRejected}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reddedilen
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Reports Component */}
          <CaptainApplicationReports />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performans Metrikleri</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Performans verileri yükleniyor...
                </div>
              ) : metrics ? (
                <div className="space-y-6">
                  {/* Processing Time Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      İşlem Süresi Analizi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {metrics.avgProcessingTime}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ortalama Süre (gün)
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {Math.max(0, 5 - metrics.avgProcessingTime).toFixed(
                            1
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Hedef Fark (gün)
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {(
                            ((5 - metrics.avgProcessingTime) / 5) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Hedef Başarı
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approval Rate Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Onay Oranı Analizi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {metrics.approvalRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mevcut Oran
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">80%</div>
                        <div className="text-sm text-muted-foreground">
                          Hedef Oran
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {(metrics.approvalRate - 80).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Hedef Fark
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Performans verileri yüklenemedi
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Trend analizi grafikleri burada gösterilecek
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detaylı Analiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Detaylı analiz raporları burada gösterilecek
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPanelLayout>
  );
};

export default CaptainApplicationReportsPage;
