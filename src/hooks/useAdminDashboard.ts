import { useState, useEffect } from "react";
import {
  AdminDashboardStats,
  DashboardActivity,
  DashboardMetrics,
} from "@/types/adminDashboard";
import { adminDashboardService } from "@/services/adminPanel/adminDashboardService";

interface UseAdminDashboardReturn {
  stats: AdminDashboardStats | null;
  activities: DashboardActivity[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  lastUpdated: Date | null;
}

/**
 * useAdminDashboard - Dashboard verilerini yöneten hook
 *
 * Dashboard istatistikleri, aktiviteler ve grafik verilerini yönetir.
 * Gerçek zamanlı güncellemeler için polling mekanizması içerir.
 */
export const useAdminDashboard = (
  autoRefresh: boolean = true,
  refreshInterval: number = 30000 // 30 saniye
): UseAdminDashboardReturn => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Dashboard servisini kullanarak veri getir
  const fetchDashboardData = async (): Promise<DashboardMetrics> => {
    return adminDashboardService.getDashboardData();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchDashboardData();

      setStats(data.stats);
      setActivities(data.activities);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Veri yüklenirken hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  // İlk yükleme
  useEffect(() => {
    loadData();
  }, []);

  // Otomatik yenileme
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return {
    stats,
    activities,
    loading,
    error,
    refreshData,
    lastUpdated,
  };
};
