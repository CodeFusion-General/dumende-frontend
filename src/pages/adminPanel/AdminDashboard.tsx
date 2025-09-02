import React from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import StatCard from "@/components/admin/ui/StatCard";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import RecentActivities from "@/components/admin/dashboard/RecentActivities";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Ship,
  Map,
  ClipboardList,
  CreditCard,
  FileText,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/**
 * AdminDashboard - Kapsamlı admin paneli ana dashboard sayfası
 *
 * Bu sayfa admin panelinin giriş noktasıdır ve genel sistem istatistiklerini gösterir.
 * İstatistik kartları, hızlı eylem butonları, grafikler ve son aktiviteleri içerir.
 */
const AdminDashboard: React.FC = () => {
  const { stats, activities, loading, error, refreshData, lastUpdated } =
    useAdminDashboard();

  // İstatistik kartları için veri dönüşümü
  const getStatCards = () => {
    if (!stats) return [];

    return [
      {
        title: "Toplam Kullanıcı",
        value: stats.users.total,
        change: {
          value: stats.users.growthRate,
          type:
            stats.users.growthRate > 0
              ? ("increase" as const)
              : ("decrease" as const),
          period: "bu ay",
        },
        icon: <Users className="w-6 h-6" />,
        color: "blue" as const,
      },
      {
        title: "Aktif Tekneler",
        value: stats.boats.active,
        change: {
          value: Math.round(
            (stats.boats.newThisMonth / stats.boats.total) * 100
          ),
          type: "increase" as const,
          period: "bu ay",
        },
        icon: <Ship className="w-6 h-6" />,
        color: "green" as const,
      },
      {
        title: "Aktif Turlar",
        value: stats.tours.active,
        change: {
          value: Math.round(
            (stats.tours.newThisMonth / stats.tours.total) * 100
          ),
          type: "increase" as const,
          period: "bu ay",
        },
        icon: <Map className="w-6 h-6" />,
        color: "purple" as const,
      },
      {
        title: "Bu Ay Rezervasyon",
        value: stats.bookings.thisMonthBookings,
        change: {
          value: stats.bookings.conversionRate,
          type: "increase" as const,
          period: "dönüşüm oranı",
        },
        icon: <ClipboardList className="w-6 h-6" />,
        color: "orange" as const,
      },
      {
        title: "Bu Ay Gelir",
        value: `₺${stats.payments.thisMonthRevenue.toLocaleString("tr-TR")}`,
        change: {
          value: Math.round(
            (stats.payments.thisMonthRevenue / stats.payments.totalRevenue) *
              100 *
              12
          ),
          type: "increase" as const,
          period: "yıllık hedef",
        },
        icon: <CreditCard className="w-6 h-6" />,
        color: "emerald" as const,
      },
      {
        title: "Bekleyen Belgeler",
        value: stats.documents.pending,
        change: {
          value: stats.documents.verificationRate,
          type: "neutral" as const,
          period: "doğrulama oranı",
        },
        icon: <FileText className="w-6 h-6" />,
        color: "red" as const,
      },
    ];
  };

  return (
    <AdminPanelLayout title="Dashboard">
      <div className="space-y-6">
        {/* Hoş geldin mesajı ve yenileme butonu */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Paneline Hoş Geldiniz
              </h2>
              <p className="text-gray-600">
                Dümende platformunun tüm yönetim işlemlerini bu panelden
                gerçekleştirebilirsiniz.
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-2">
                  Son güncelleme: {lastUpdated.toLocaleString("tr-TR")}
                </p>
              )}
            </div>
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Yenile
            </Button>
          </div>
        </div>

        {/* Hata mesajı */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* İstatistik kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getStatCards().map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              loading={loading}
            />
          ))}
        </div>

        {/* Hızlı eylemler */}
        <QuickActions />

        {/* Grafikler */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Performans Grafikleri
          </h3>
          <DashboardCharts loading={loading} />
        </div>

        {/* Son aktiviteler */}
        <RecentActivities activities={activities as any} loading={loading} />
      </div>
    </AdminPanelLayout>
  );
};

export default AdminDashboard;
