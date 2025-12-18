import { useState, useCallback } from "react";
import { captainApplicationService } from "@/services/captainApplicationService";
import type {
  CaptainApplication,
  CaptainApplicationStatus,
} from "@/types/captain.types";

interface CaptainApplicationFilters {
  status: CaptainApplicationStatus | "ALL";
  search: string;
  startDate?: string;
  endDate?: string;
  minExperience?: number;
  maxExperience?: number;
  hasDocuments?: boolean;
  priority?: "high" | "medium" | "low" | "all";
}

interface CaptainApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisMonth: number;
  avgProcessingTime: number;
  approvalRate: number;
}

interface PaginationParams {
  page: number;
  size: number;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export const useAdminCaptainApplications = () => {
  const [applications, setApplications] = useState<CaptainApplication[]>([]);
  const [stats, setStats] = useState<CaptainApplicationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load applications with filters and pagination
  const loadApplications = useCallback(
    async (
      filters: CaptainApplicationFilters,
      pagination: PaginationParams
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: pagination.page,
          size: pagination.size,
          sortBy: pagination.sortBy,
          sortDirection: pagination.sortDirection,
          status: filters.status === "ALL" ? undefined : filters.status,
          search: filters.search || undefined,
          startDate: filters.startDate,
          endDate: filters.endDate,
          minExperience: filters.minExperience,
          maxExperience: filters.maxExperience,
          hasDocuments: filters.hasDocuments,
        };

        const response = await captainApplicationService.list(params);

        let filteredApplications = response.content;

        // Apply client-side priority filter if needed
        if (filters.priority && filters.priority !== "all") {
          filteredApplications = filteredApplications.filter((app) => {
            const daysSinceCreated = Math.floor(
              (Date.now() - new Date(app.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );

            let priority: "high" | "medium" | "low";
            if (daysSinceCreated > 7) priority = "high";
            else if (daysSinceCreated > 3) priority = "medium";
            else priority = "low";

            return priority === filters.priority;
          });
        }

        setApplications(filteredApplications);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (e: any) {
        setError(e?.message || "Başvurular yüklenemedi");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      // In a real application, this would be a dedicated stats endpoint
      const allApps = await captainApplicationService.list({ size: 1000 });
      const total = allApps.totalElements;
      const pending = allApps.content.filter(
        (app) => app.status === "PENDING"
      ).length;
      const approved = allApps.content.filter(
        (app) => app.status === "APPROVED"
      ).length;
      const rejected = allApps.content.filter(
        (app) => app.status === "REJECTED"
      ).length;

      const now = new Date();
      const thisMonth = allApps.content.filter((app) => {
        const appDate = new Date(app.createdAt);
        return (
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear()
        );
      }).length;

      const approvalRate =
        approved + rejected > 0 ? (approved / (approved + rejected)) * 100 : 0;

      // Calculate average processing time (mock calculation)
      const processedApps = allApps.content.filter(
        (app) => app.status !== "PENDING"
      );
      const avgProcessingTime =
        processedApps.length > 0
          ? processedApps.reduce((sum, app) => {
              const created = new Date(app.createdAt).getTime();
              const updated = new Date(app.updatedAt).getTime();
              return (
                sum + Math.floor((updated - created) / (1000 * 60 * 60 * 24))
              );
            }, 0) / processedApps.length
          : 0;

      setStats({
        total,
        pending,
        approved,
        rejected,
        thisMonth,
        avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
        approvalRate: Math.round(approvalRate * 10) / 10,
      });
    } catch (e: any) {
      console.error("Stats loading failed:", e);
    }
  }, []);

  // Approve single application
  const approveApplication = useCallback(async (id: number) => {
    try {
      await captainApplicationService.review(id, { status: "APPROVED" });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: "APPROVED" as CaptainApplicationStatus,
                updatedAt: new Date().toISOString(),
              }
            : app
        )
      );

      return true;
    } catch (e: any) {
      setError(e?.message || "Onay işlemi başarısız");
      return false;
    }
  }, []);

  // Reject single application
  const rejectApplication = useCallback(async (id: number, reason: string) => {
    try {
      await captainApplicationService.review(id, {
        status: "REJECTED",
        rejectionReason: reason,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: "REJECTED" as CaptainApplicationStatus,
                rejectionReason: reason,
                updatedAt: new Date().toISOString(),
              }
            : app
        )
      );

      return true;
    } catch (e: any) {
      setError(e?.message || "Red işlemi başarısız");
      return false;
    }
  }, []);

  // Bulk approve applications
  const bulkApproveApplications = useCallback(async (ids: number[]) => {
    try {
      setLoading(true);

      const results = await Promise.allSettled(
        ids.map((id) =>
          captainApplicationService.review(id, { status: "APPROVED" })
        )
      );

      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failureCount = results.length - successCount;

      if (failureCount > 0) {
        setError(
          `${successCount} başvuru onaylandı, ${failureCount} başvuru başarısız`
        );
      }

      // Update local state for successful approvals
      setApplications((prev) =>
        prev.map((app) =>
          ids.includes(app.id)
            ? {
                ...app,
                status: "APPROVED" as CaptainApplicationStatus,
                updatedAt: new Date().toISOString(),
              }
            : app
        )
      );

      return successCount;
    } catch (e: any) {
      setError(e?.message || "Toplu onay işlemi başarısız");
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk reject applications
  const bulkRejectApplications = useCallback(
    async (ids: number[], reason: string) => {
      try {
        setLoading(true);

        const results = await Promise.allSettled(
          ids.map((id) =>
            captainApplicationService.review(id, {
              status: "REJECTED",
              rejectionReason: reason,
            })
          )
        );

        const successCount = results.filter(
          (result) => result.status === "fulfilled"
        ).length;
        const failureCount = results.length - successCount;

        if (failureCount > 0) {
          setError(
            `${successCount} başvuru reddedildi, ${failureCount} başvuru başarısız`
          );
        }

        // Update local state for successful rejections
        setApplications((prev) =>
          prev.map((app) =>
            ids.includes(app.id)
              ? {
                  ...app,
                  status: "REJECTED" as CaptainApplicationStatus,
                  rejectionReason: reason,
                  updatedAt: new Date().toISOString(),
                }
              : app
          )
        );

        return successCount;
      } catch (e: any) {
        setError(e?.message || "Toplu red işlemi başarısız");
        return 0;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get application by ID
  const getApplicationById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const application = await captainApplicationService.getById(id);
      return application;
    } catch (e: any) {
      setError(e?.message || "Başvuru detayları yüklenemedi");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate priority for an application
  const calculatePriority = useCallback(
    (application: CaptainApplication): "high" | "medium" | "low" => {
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(application.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreated > 7) return "high";
      if (daysSinceCreated > 3) return "medium";
      return "low";
    },
    []
  );

  // Export applications data
  const exportApplications = useCallback(
    async (filters: CaptainApplicationFilters) => {
      try {
        // In a real application, this would call a dedicated export endpoint
        const allApps = await captainApplicationService.list({
          ...filters,
          size: 10000, // Get all matching records
        });

        const csvData = allApps.content.map((app) => ({
          ID: app.id,
          Başvuran: app.fullName || "-",
          "Kullanıcı ID": app.userId,
          "Lisans No": app.professionalInfo?.licenseNumber || "-",
          Deneyim: app.professionalInfo?.yearsOfExperience || 0,
          Durum: app.status,
          "Başvuru Tarihi": new Date(app.createdAt).toLocaleDateString("tr-TR"),
          "Güncelleme Tarihi": new Date(app.updatedAt).toLocaleDateString(
            "tr-TR"
          ),
          "Red Nedeni": app.rejectionReason || "-",
        }));

        return csvData;
      } catch (e: any) {
        setError(e?.message || "Dışa aktarma başarısız");
        return [];
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    applications,
    stats,
    loading,
    error,
    totalElements,
    totalPages,

    // Actions
    loadApplications,
    loadStats,
    approveApplication,
    rejectApplication,
    bulkApproveApplications,
    bulkRejectApplications,
    getApplicationById,
    exportApplications,
    clearError,

    // Utilities
    calculatePriority,
  };
};
