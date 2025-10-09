import { BaseService } from "../base/BaseService";
import { captainApplicationService } from "../captainApplicationService";
import type {
  CaptainApplication,
  CaptainApplicationStatus,
} from "@/types/captain.types";

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

interface CaptainApplicationReport {
  id: number;
  fullName: string;
  userId: number;
  licenseNumber: string;
  yearsOfExperience: number;
  status: CaptainApplicationStatus;
  createdAt: string;
  updatedAt: string;
  processingTime?: number; // in days
  rejectionReason?: string;
  documentCount: number;
  priority: "high" | "medium" | "low";
}

interface BulkActionResult {
  successCount: number;
  failureCount: number;
  errors: string[];
}

interface ApplicationFilters {
  status?: CaptainApplicationStatus;
  startDate?: string;
  endDate?: string;
  minExperience?: number;
  maxExperience?: number;
  hasDocuments?: boolean;
  priority?: "high" | "medium" | "low";
  search?: string;
}

class AdminCaptainApplicationService extends BaseService {
  constructor() {
    // ✅ DÜZELT: Backend base path - /api prefix eksikti
    // Backend: POST /api/admin/captain-applications/bulk
    super("/api/admin/captain-applications");
  }

  // Get comprehensive statistics
  async getStatistics(): Promise<CaptainApplicationStats> {
    try {
      // In a real application, this would be a dedicated endpoint
      // For now, we'll calculate from the existing data
      const allApps = await captainApplicationService.list({ size: 10000 });
      const applications = allApps.content;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const total = applications.length;
      const pending = applications.filter(
        (app) => app.status === "PENDING"
      ).length;
      const approved = applications.filter(
        (app) => app.status === "APPROVED"
      ).length;
      const rejected = applications.filter(
        (app) => app.status === "REJECTED"
      ).length;

      const thisMonthApps = applications.filter(
        (app) => new Date(app.createdAt) >= thisMonth
      ).length;

      const lastMonthApps = applications.filter((app) => {
        const createdDate = new Date(app.createdAt);
        return createdDate >= lastMonth && createdDate < thisMonth;
      }).length;

      // Calculate approval and rejection rates
      const processedApps = approved + rejected;
      const approvalRate =
        processedApps > 0 ? (approved / processedApps) * 100 : 0;
      const rejectionRate =
        processedApps > 0 ? (rejected / processedApps) * 100 : 0;

      // Calculate average processing time
      const processedApplications = applications.filter(
        (app) => app.status !== "PENDING"
      );
      const avgProcessingTime =
        processedApplications.length > 0
          ? processedApplications.reduce((sum, app) => {
              const created = new Date(app.createdAt).getTime();
              const updated = new Date(app.updatedAt).getTime();
              return (
                sum + Math.floor((updated - created) / (1000 * 60 * 60 * 24))
              );
            }, 0) / processedApplications.length
          : 0;

      // Generate monthly trends (last 6 months)
      const monthlyTrend = [];
      const processingTimeByMonth = [];

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthApps = applications.filter((app) => {
          const createdDate = new Date(app.createdAt);
          return createdDate >= monthStart && createdDate <= monthEnd;
        });

        const monthApproved = monthApps.filter(
          (app) => app.status === "APPROVED"
        ).length;
        const monthRejected = monthApps.filter(
          (app) => app.status === "REJECTED"
        ).length;

        const monthProcessed = monthApps.filter(
          (app) => app.status !== "PENDING"
        );
        const monthAvgProcessing =
          monthProcessed.length > 0
            ? monthProcessed.reduce((sum, app) => {
                const created = new Date(app.createdAt).getTime();
                const updated = new Date(app.updatedAt).getTime();
                return (
                  sum + Math.floor((updated - created) / (1000 * 60 * 60 * 24))
                );
              }, 0) / monthProcessed.length
            : 0;

        monthlyTrend.push({
          month: monthStart.toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "short",
          }),
          applications: monthApps.length,
          approved: monthApproved,
          rejected: monthRejected,
        });

        processingTimeByMonth.push({
          month: monthStart.toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "short",
          }),
          avgDays: Math.round(monthAvgProcessing * 10) / 10,
        });
      }

      return {
        total,
        pending,
        approved,
        rejected,
        thisMonth: thisMonthApps,
        lastMonth: lastMonthApps,
        avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
        approvalRate: Math.round(approvalRate * 10) / 10,
        rejectionRate: Math.round(rejectionRate * 10) / 10,
        monthlyTrend,
        processingTimeByMonth,
      };
    } catch (error) {
      console.error("Error getting captain application statistics:", error);
      throw error;
    }
  }

  // Get applications for reporting with enhanced data
  async getApplicationsReport(
    filters?: ApplicationFilters
  ): Promise<CaptainApplicationReport[]> {
    try {
      const params = {
        ...filters,
        size: 10000, // Get all for reporting
      };

      const response = await captainApplicationService.list(params);

      return response.content.map((app) => {
        const createdDate = new Date(app.createdAt);
        const updatedDate = new Date(app.updatedAt);
        const processingTime =
          app.status !== "PENDING"
            ? Math.floor(
                (updatedDate.getTime() - createdDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : undefined;

        const daysSinceCreated = Math.floor(
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let priority: "high" | "medium" | "low";
        if (daysSinceCreated > 7) priority = "high";
        else if (daysSinceCreated > 3) priority = "medium";
        else priority = "low";

        return {
          id: app.id,
          fullName: app.fullName || "-",
          userId: app.userId,
          licenseNumber: app.professionalInfo?.licenseNumber || "-",
          yearsOfExperience: app.professionalInfo?.yearsOfExperience || 0,
          status: app.status,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          processingTime,
          rejectionReason: app.rejectionReason,
          documentCount: app.documentFilePaths?.length || 0,
          priority,
        };
      });
    } catch (error) {
      console.error("Error getting applications report:", error);
      throw error;
    }
  }

  // Bulk approve applications
  async bulkApprove(applicationIds: number[]): Promise<BulkActionResult> {
    const errors: string[] = [];
    let successCount = 0;

    try {
      const results = await Promise.allSettled(
        applicationIds.map(async (id) => {
          try {
            await captainApplicationService.review(id, { status: "APPROVED" });
            return { success: true, id };
          } catch (error: any) {
            return { success: false, id, error: error.message };
          }
        })
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
        } else {
          const id = applicationIds[index];
          const errorMessage =
            result.status === "rejected"
              ? result.reason
              : (result.value as any).error;
          errors.push(`Başvuru #${id}: ${errorMessage}`);
        }
      });

      return {
        successCount,
        failureCount: applicationIds.length - successCount,
        errors,
      };
    } catch (error: any) {
      throw new Error(`Toplu onay işlemi başarısız: ${error.message}`);
    }
  }

  // Bulk reject applications
  async bulkReject(
    applicationIds: number[],
    rejectionReason: string
  ): Promise<BulkActionResult> {
    const errors: string[] = [];
    let successCount = 0;

    try {
      const results = await Promise.allSettled(
        applicationIds.map(async (id) => {
          try {
            await captainApplicationService.review(id, {
              status: "REJECTED",
              rejectionReason,
            });
            return { success: true, id };
          } catch (error: any) {
            return { success: false, id, error: error.message };
          }
        })
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
        } else {
          const id = applicationIds[index];
          const errorMessage =
            result.status === "rejected"
              ? result.reason
              : (result.value as any).error;
          errors.push(`Başvuru #${id}: ${errorMessage}`);
        }
      });

      return {
        successCount,
        failureCount: applicationIds.length - successCount,
        errors,
      };
    } catch (error: any) {
      throw new Error(`Toplu red işlemi başarısız: ${error.message}`);
    }
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    try {
      const stats = await this.getStatistics();
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get applications from last week for trend analysis
      const recentApps = await captainApplicationService.list({
        startDate: lastWeek.toISOString().split("T")[0],
        size: 1000,
      });

      const weeklyApplications = recentApps.content.length;
      const weeklyApproved = recentApps.content.filter(
        (app) => app.status === "APPROVED"
      ).length;
      const weeklyRejected = recentApps.content.filter(
        (app) => app.status === "REJECTED"
      ).length;

      return {
        totalApplications: stats.total,
        pendingApplications: stats.pending,
        approvalRate: stats.approvalRate,
        avgProcessingTime: stats.avgProcessingTime,
        weeklyApplications,
        weeklyApproved,
        weeklyRejected,
        monthlyTrend: stats.monthlyTrend,
        processingTimeByMonth: stats.processingTimeByMonth,
      };
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      throw error;
    }
  }

  // Export applications to CSV format
  async exportToCSV(filters?: ApplicationFilters): Promise<string> {
    try {
      const applications = await this.getApplicationsReport(filters);

      const headers = [
        "ID",
        "Başvuran",
        "Kullanıcı ID",
        "Lisans Numarası",
        "Deneyim (Yıl)",
        "Durum",
        "Öncelik",
        "Başvuru Tarihi",
        "Güncelleme Tarihi",
        "İşlem Süresi (Gün)",
        "Belge Sayısı",
        "Red Nedeni",
      ];

      const csvRows = [
        headers.join(","),
        ...applications.map((app) =>
          [
            app.id,
            `"${app.fullName}"`,
            app.userId,
            `"${app.licenseNumber}"`,
            app.yearsOfExperience,
            app.status,
            app.priority,
            new Date(app.createdAt).toLocaleDateString("tr-TR"),
            new Date(app.updatedAt).toLocaleDateString("tr-TR"),
            app.processingTime || "-",
            app.documentCount,
            `"${app.rejectionReason || "-"}"`,
          ].join(",")
        ),
      ];

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw error;
    }
  }
}

export const adminCaptainApplicationService =
  new AdminCaptainApplicationService();
