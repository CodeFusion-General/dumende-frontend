/**
 * Admin Dashboard Types
 *
 * Dashboard istatistikleri ve veri modelleri için type tanımları
 */

export interface AdminDashboardStats {
  users: {
    total: number;
    customers: number;
    boatOwners: number;
    admins: number;
    newThisMonth: number;
    activeToday: number;
    growthRate: number; // Yüzde olarak büyüme oranı
  };
  boats: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    newThisMonth: number;
    approvalRate: number; // Onay oranı yüzdesi
  };
  tours: {
    total: number;
    active: number;
    draft: number;
    newThisMonth: number;
    averageRating: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    todayBookings: number;
    thisMonthBookings: number;
    thisMonthRevenue: number;
    conversionRate: number; // Dönüşüm oranı yüzdesi
  };
  payments: {
    totalRevenue: number;
    thisMonthRevenue: number;
    pendingPayments: number;
    failedPayments: number;
    refundRequests: number;
    successRate: number; // Başarı oranı yüzdesi
  };
  documents: {
    total: number;
    verified: number;
    pending: number;
    expired: number;
    expiringSoon: number; // 30 gün içinde süresi dolacak
    verificationRate: number; // Doğrulama oranı yüzdesi
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
  category?: string;
}

export interface ChartData {
  data: ChartDataPoint[];
  title: string;
  description?: string;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
}

export interface DashboardActivity {
  id: string;
  type:
    | "user"
    | "boat"
    | "tour"
    | "booking"
    | "payment"
    | "document"
    | "system";
  title: string;
  description: string;
  timestamp: Date;
  status: "success" | "warning" | "error" | "info";
  entityId?: string;
  entityName?: string;
  adminId?: number;
  adminName?: string;
}

export interface DashboardMetrics {
  stats: AdminDashboardStats;
  activities: DashboardActivity[];
  charts: {
    userGrowth: ChartData;
    revenueGrowth: ChartData;
    bookingTrends: ChartData;
    boatApprovals: ChartData;
  };
  lastUpdated: Date;
}

// Grafik türleri
export type ChartType = "line" | "bar" | "pie" | "area" | "donut";

// Zaman aralığı filtreleri
export type TimeRange = "today" | "week" | "month" | "quarter" | "year";

// Dashboard widget konfigürasyonu
export interface DashboardWidget {
  id: string;
  title: string;
  type: "stat" | "chart" | "list" | "table";
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
  config: Record<string, any>;
  visible: boolean;
}
