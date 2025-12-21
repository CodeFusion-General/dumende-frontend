import { BaseService } from "../base/BaseService";
import {
  AdminDashboardStats,
  DashboardActivity,
  DashboardMetrics,
} from "@/types/adminDashboard";
import { userService } from "@/services/userService";
import { boatService } from "@/services/boatService";
import { tourService } from "@/services/tourService";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { messageService } from "@/services/messageService";

/**
 * AdminDashboardService - Admin dashboard veri yönetimi servisi
 *
 * Dashboard istatistikleri, aktiviteler ve grafik verilerini yönetir.
 * Backend API /api/admin/statistics endpoint'lerini kullanır.
 */
class AdminDashboardService extends BaseService {
  constructor() {
    super("/admin/statistics"); // axios baseURL zaten /api
  }
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

  /**
   * Cache'den veri al veya yeni veri yükle
   */
  private async getCachedData<T>(
    key: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Cache'de eski veri varsa onu döndür
      if (cached) {
        console.warn(`Failed to fetch ${key}, using cached data:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Cache'i temizle
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Kullanıcı istatistiklerini hesapla
   */
  private async calculateUserStats(): Promise<AdminDashboardStats["users"]> {
    return this.getCachedData("userStats", async () => {
      try {
        // Gerçek API çağrıları burada yapılacak
        // Şimdilik mock data döndürüyoruz

        const totalUsers = 1234;
        const customers = 890;
        const boatOwners = 320;
        const admins = 24;
        const newThisMonth = 145;
        const activeToday = 89;
        const growthRate = 12.5;

        return {
          total: totalUsers,
          customers,
          boatOwners,
          admins,
          newThisMonth,
          activeToday,
          growthRate,
        };
      } catch (error) {
        console.error("Error calculating user stats:", error);
        throw new Error("Kullanıcı istatistikleri hesaplanamadı");
      }
    });
  }

  /**
   * Tekne istatistiklerini hesapla
   */
  private async calculateBoatStats(): Promise<AdminDashboardStats["boats"]> {
    return this.getCachedData("boatStats", async () => {
      try {
        // Mevcut boatService kullanılarak gerçek veriler alınacak
        // Şimdilik mock data

        const total = 456;
        const active = 398;
        const pending = 23;
        const rejected = 35;
        const newThisMonth = 28;
        const approvalRate = 87.2;

        return {
          total,
          active,
          pending,
          rejected,
          newThisMonth,
          approvalRate,
        };
      } catch (error) {
        console.error("Error calculating boat stats:", error);
        throw new Error("Tekne istatistikleri hesaplanamadı");
      }
    });
  }

  /**
   * Tur istatistiklerini hesapla
   */
  private async calculateTourStats(): Promise<AdminDashboardStats["tours"]> {
    return this.getCachedData("tourStats", async () => {
      try {
        // Mevcut tourService kullanılarak gerçek veriler alınacak

        const total = 789;
        const active = 654;
        const draft = 135;
        const newThisMonth = 42;
        const averageRating = 4.6;

        return {
          total,
          active,
          draft,
          newThisMonth,
          averageRating,
        };
      } catch (error) {
        console.error("Error calculating tour stats:", error);
        throw new Error("Tur istatistikleri hesaplanamadı");
      }
    });
  }

  /**
   * Rezervasyon istatistiklerini hesapla
   */
  private async calculateBookingStats(): Promise<
    AdminDashboardStats["bookings"]
  > {
    return this.getCachedData("bookingStats", async () => {
      try {
        // Mevcut bookingService kullanılarak gerçek veriler alınacak

        const total = 2345;
        const pending = 45;
        const confirmed = 234;
        const completed = 1890;
        const cancelled = 176;
        const todayBookings = 12;
        const thisMonthBookings = 345;
        const thisMonthRevenue = 125430;
        const conversionRate = 68.5;

        return {
          total,
          pending,
          confirmed,
          completed,
          cancelled,
          todayBookings,
          thisMonthBookings,
          thisMonthRevenue,
          conversionRate,
        };
      } catch (error) {
        console.error("Error calculating booking stats:", error);
        throw new Error("Rezervasyon istatistikleri hesaplanamadı");
      }
    });
  }

  /**
   * Ödeme istatistiklerini hesapla
   */
  private async calculatePaymentStats(): Promise<
    AdminDashboardStats["payments"]
  > {
    return this.getCachedData("paymentStats", async () => {
      try {
        // Mevcut paymentService kullanılarak gerçek veriler alınacak

        const totalRevenue = 2450000;
        const thisMonthRevenue = 125430;
        const pendingPayments = 15;
        const failedPayments = 8;
        const refundRequests = 3;
        const successRate = 94.2;

        return {
          totalRevenue,
          thisMonthRevenue,
          pendingPayments,
          failedPayments,
          refundRequests,
          successRate,
        };
      } catch (error) {
        console.error("Error calculating payment stats:", error);
        throw new Error("Ödeme istatistikleri hesaplanamadı");
      }
    });
  }

  /**
   * Belge istatistiklerini hesapla
   */
  private async calculateDocumentStats(): Promise<
    AdminDashboardStats["documents"]
  > {
    return this.getCachedData("documentStats", async () => {
      try {
        // Belge servisi kullanılarak gerçek veriler alınacak

        const total = 1567;
        const verified = 1234;
        const pending = 67;
        const expired = 45;
        const expiringSoon = 23;
        const verificationRate = 78.7;

        return {
          total,
          verified,
          pending,
          expired,
          expiringSoon,
          verificationRate,
        };
      } catch (error) {
        console.error("Error calculating document stats:", error);
        throw new Error("Belge istatistikleri hesaplanamadı");
      }
    });
  }

  /**
   * Son aktiviteleri getir
   */
  private async getRecentActivities(): Promise<DashboardActivity[]> {
    return this.getCachedData("recentActivities", async () => {
      try {
        // Gerçek implementasyonda çeşitli servislerden aktiviteler toplanacak

        const activities: DashboardActivity[] = [
          {
            id: "1",
            type: "boat",
            title: "Tekne Onaylandı",
            description: "Deniz Yıldızı teknesi onaylandı",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: "success",
            entityId: "boat-123",
            entityName: "Deniz Yıldızı",
            adminId: 1,
            adminName: "Admin User",
          },
          {
            id: "2",
            type: "user",
            title: "Yeni Kullanıcı Kaydı",
            description: "Ahmet Yılmaz platformda kayıt oldu",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: "info",
            entityId: "user-456",
            entityName: "Ahmet Yılmaz",
          },
          {
            id: "3",
            type: "document",
            title: "Belge Doğrulama Talebi",
            description: "Kaptan belgesi doğrulama bekliyor",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: "warning",
            entityId: "doc-789",
            entityName: "Kaptan Belgesi",
          },
          {
            id: "4",
            type: "payment",
            title: "Ödeme Başarısız",
            description: "Rezervasyon ödemesi başarısız oldu",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            status: "error",
            entityId: "payment-101",
            entityName: "Rezervasyon #1234",
          },
          {
            id: "5",
            type: "booking",
            title: "Yeni Rezervasyon",
            description: "Tekne rezervasyonu oluşturuldu",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            status: "success",
            entityId: "booking-202",
            entityName: "Rezervasyon #1235",
          },
        ];

        return activities.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        throw new Error("Son aktiviteler getirilemedi");
      }
    });
  }

  /**
   * Backend'den dashboard verilerini getir
   */
  public async getDashboardDataFromBackend(): Promise<DashboardMetrics> {
    try {
      // Backend API çağrıları
      const [dashboardStats, userStats, boatStats, tourStats, bookingStats, paymentStats] = 
        await Promise.all([
          this.get<AdminDashboardStats>("/dashboard"),
          this.get<any>("/users"), 
          this.get<any>("/boats"),
          this.get<any>("/tours"),
          this.get<any>("/bookings"),
          this.get<any>("/payments")
        ]);

      return {
        stats: dashboardStats,
        activities: [], // Backend'de activity endpoint'i varsa eklenecek
        charts: {
          userGrowth: { title: "User Growth", description: "", data: [] },
          revenueGrowth: { title: "Revenue Growth", description: "", data: [] },
          bookingTrends: { title: "Booking Trends", description: "", data: [] },
          boatApprovals: { title: "Boat Approvals", description: "", data: [] }
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error("Backend dashboard API hatası, fallback'e geçiliyor:", error);
      return this.getDashboardData(); // Fallback to mock data
    }
  }

  /**
   * Mock dashboard verilerini getir (fallback)
   */
  public async getDashboardData(): Promise<DashboardMetrics> {
    try {
      const [
        userStats,
        boatStats,
        tourStats,
        bookingStats,
        paymentStats,
        documentStats,
        activities,
      ] = await Promise.all([
        this.calculateUserStats(),
        this.calculateBoatStats(),
        this.calculateTourStats(),
        this.calculateBookingStats(),
        this.calculatePaymentStats(),
        this.calculateDocumentStats(),
        this.getRecentActivities(),
      ]);

      const stats: AdminDashboardStats = {
        users: userStats,
        boats: boatStats,
        tours: tourStats,
        bookings: bookingStats,
        payments: paymentStats,
        documents: documentStats,
      };

      // Grafik verileri - gerçek implementasyonda hesaplanacak
      const charts = {
        userGrowth: {
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
        },
        revenueGrowth: {
          title: "Gelir Trendleri",
          description: "Aylık gelir performansı",
          data: [
            { name: "Ocak", value: 45000 },
            { name: "Şubat", value: 52000 },
            { name: "Mart", value: 48000 },
            { name: "Nisan", value: 61000 },
            { name: "Mayıs", value: 75000 },
            { name: "Haziran", value: 89000 },
          ],
        },
        bookingTrends: {
          title: "Rezervasyon Trendleri",
          description: "Haftalık rezervasyon dağılımı",
          data: [
            { name: "Pazartesi", value: 12 },
            { name: "Salı", value: 19 },
            { name: "Çarşamba", value: 15 },
            { name: "Perşembe", value: 22 },
            { name: "Cuma", value: 28 },
            { name: "Cumartesi", value: 35 },
            { name: "Pazar", value: 30 },
          ],
        },
        boatApprovals: {
          title: "Tekne Onay Durumları",
          description: "Bu ayki tekne başvuru sonuçları",
          data: [
            { name: "Onaylanan", value: 85 },
            { name: "Bekleyen", value: 12 },
            { name: "Reddedilen", value: 8 },
          ],
        },
      };

      return {
        stats,
        activities,
        charts,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Dashboard verileri yüklenemedi");
    }
  }

  /**
   * Belirli bir zaman aralığı için istatistikleri getir
   */
  public async getStatsForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<Partial<AdminDashboardStats>> {
    try {
      // Gerçek implementasyonda tarih filtreleme yapılacak
      console.log("Fetching stats for period:", startDate, endDate);

      // Şimdilik mevcut istatistikleri döndür
      return this.getDashboardData().then((data) => data.stats);
    } catch (error) {
      console.error("Error fetching period stats:", error);
      throw new Error("Dönem istatistikleri getirilemedi");
    }
  }

  /**
   * Gerçek zamanlı güncellemeler için WebSocket bağlantısı
   * (Gelecekte implementasyon için placeholder)
   */
  public subscribeToRealTimeUpdates(
    callback: (data: Partial<DashboardMetrics>) => void
  ): () => void {
    // WebSocket bağlantısı kurulacak
    console.log("Real-time updates subscription started");

    // Cleanup function
    return () => {
      console.log("Real-time updates subscription ended");
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
