import React, { useState, useEffect, useMemo } from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { DataTable, ColumnDef } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import StatCard from "@/components/admin/ui/StatCard";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import BulkOperationsPanel from "@/components/admin/captainApplications/BulkOperationsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Download,
  Eye,
  BarChart3,
} from "lucide-react";
import { captainApplicationService } from "@/services/captainApplicationService";
import type {
  CaptainApplication,
  CaptainApplicationStatus,
} from "@/types/captain.types";
import { useNavigate } from "react-router-dom";

interface CaptainApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisMonth: number;
  avgProcessingTime: number;
  approvalRate: number;
}

interface FilterValues {
  status: CaptainApplicationStatus | "ALL";
  dateRange: {
    start: string;
    end: string;
  };
  experienceRange: {
    min: number;
    max: number;
  };
  hasDocuments: boolean | null;
  priority: "high" | "medium" | "low" | "all";
}

const CaptainApplicationManagement: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [applications, setApplications] = useState<CaptainApplication[]>([]);
  const [stats, setStats] = useState<CaptainApplicationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<number[]>(
    []
  );

  // Pagination and sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [totalElements, setTotalElements] = useState(0);

  // Filtering and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>({
    status: "ALL",
    dateRange: { start: "", end: "" },
    experienceRange: { min: 0, max: 50 },
    hasDocuments: null,
    priority: "all",
  });

  // Bulk operations
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Load applications with filters and pagination
  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size,
        sortBy,
        sortDirection,
        status: filters.status === "ALL" ? undefined : filters.status,
        search: searchQuery || undefined,
        startDate: filters.dateRange.start || undefined,
        endDate: filters.dateRange.end || undefined,
        minExperience: filters.experienceRange.min,
        maxExperience: filters.experienceRange.max,
        hasDocuments: filters.hasDocuments,
      };

      const response = await captainApplicationService.list(params);
      setApplications(response.content);
      setTotalElements(response.totalElements);
    } catch (e: any) {
      setError(e?.message || "Başvurular yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      // This would be a new endpoint for statistics
      // For now, we'll calculate from the current data
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

      const thisMonth = allApps.content.filter((app) => {
        const appDate = new Date(app.createdAt);
        const now = new Date();
        return (
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear()
        );
      }).length;

      const approvalRate =
        total > 0 ? (approved / (approved + rejected)) * 100 : 0;

      setStats({
        total,
        pending,
        approved,
        rejected,
        thisMonth,
        avgProcessingTime: 3.5, // Mock data - would come from backend
        approvalRate,
      });
    } catch (e: any) {
      console.error("Stats loading failed:", e);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [page, size, sortBy, sortDirection, filters, searchQuery]);

  useEffect(() => {
    loadStats();
  }, []);

  // Calculate priority based on application data
  const calculatePriority = (
    app: CaptainApplication
  ): "high" | "medium" | "low" => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreated > 7) return "high";
    if (daysSinceCreated > 3) return "medium";
    return "low";
  };

  // Filter applications based on priority
  const filteredApplications = useMemo(() => {
    if (filters.priority === "all") return applications;
    return applications.filter(
      (app) => calculatePriority(app) === filters.priority
    );
  }, [applications, filters.priority]);

  // Bulk approve selected applications
  const handleBulkApprove = async () => {
    if (selectedApplications.length === 0) return;

    try {
      setBulkActionLoading(true);

      await Promise.all(
        selectedApplications.map((id) =>
          captainApplicationService.review(id, { status: "APPROVED" })
        )
      );

      setSelectedApplications([]);
      await loadApplications();
      await loadStats();
    } catch (e: any) {
      setError(e?.message || "Toplu onay işlemi başarısız");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk reject selected applications
  const handleBulkReject = async () => {
    if (selectedApplications.length === 0 || !bulkRejectReason.trim()) return;

    try {
      setBulkActionLoading(true);

      await Promise.all(
        selectedApplications.map((id) =>
          captainApplicationService.review(id, {
            status: "REJECTED",
            rejectionReason: bulkRejectReason.trim(),
          })
        )
      );

      setSelectedApplications([]);
      setBulkRejectReason("");
      setShowBulkRejectModal(false);
      await loadApplications();
      await loadStats();
    } catch (e: any) {
      setError(e?.message || "Toplu red işlemi başarısız");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Individual approve/reject actions
  const handleApprove = async (id: number) => {
    try {
      await captainApplicationService.review(id, { status: "APPROVED" });
      await loadApplications();
      await loadStats();
    } catch (e: any) {
      setError(e?.message || "Onay işlemi başarısız");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      await captainApplicationService.review(id, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      await loadApplications();
      await loadStats();
    } catch (e: any) {
      setError(e?.message || "Red işlemi başarısız");
    }
  };

  // Table columns configuration
  const columns: ColumnDef<CaptainApplication>[] = [
    {
      key: "select",
      header: "",
      render: (app: CaptainApplication) => (
        <Checkbox
          checked={selectedApplications.includes(app.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedApplications([...selectedApplications, app.id]);
            } else {
              setSelectedApplications(
                selectedApplications.filter((id) => id !== app.id)
              );
            }
          }}
        />
      ),
    },
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (app: CaptainApplication) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-primary"
          onClick={() => navigate(`/adminPanel/captain-applications/${app.id}`)}
        >
          #{app.id}
        </Button>
      ),
    },
    {
      key: "priority",
      header: "Öncelik",
      render: (app: CaptainApplication) => {
        const priority = calculatePriority(app);
        const colors = {
          high: "bg-red-100 text-red-800",
          medium: "bg-yellow-100 text-yellow-800",
          low: "bg-green-100 text-green-800",
        };
        const labels = {
          high: "Yüksek",
          medium: "Orta",
          low: "Düşük",
        };
        return <Badge className={colors[priority]}>{labels[priority]}</Badge>;
      },
    },
    {
      key: "fullName",
      header: "Başvuran",
      sortable: true,
      render: (app: CaptainApplication) => (
        <div className="flex flex-col">
          <span className="font-medium">{app.fullName || "-"}</span>
          <span className="text-sm text-muted-foreground">
            UID: {app.userId}
          </span>
        </div>
      ),
    },
    {
      key: "licenseNumber",
      header: "Lisans",
      render: (app: CaptainApplication) => (
        <div className="flex flex-col">
          <span>{app.professionalInfo?.licenseNumber || "-"}</span>
          <span className="text-xs text-muted-foreground">
            {app.professionalInfo?.licenseExpiry &&
              `Bitiş: ${new Date(
                app.professionalInfo.licenseExpiry
              ).toLocaleDateString("tr-TR")}`}
          </span>
        </div>
      ),
    },
    {
      key: "yearsOfExperience",
      header: "Deneyim",
      sortable: true,
      render: (app: CaptainApplication) => (
        <span>{app.professionalInfo?.yearsOfExperience ?? "-"} yıl</span>
      ),
    },
    {
      key: "createdAt",
      header: "Başvuru Tarihi",
      sortable: true,
      render: (app: CaptainApplication) => (
        <span>{new Date(app.createdAt).toLocaleDateString("tr-TR")}</span>
      ),
    },
    {
      key: "status",
      header: "Durum",
      render: (app: CaptainApplication) => {
        const statusConfig = {
          PENDING: { label: "Beklemede", variant: "secondary" as const },
          APPROVED: {
            label: "Onaylandı",
            variant: "default" as const,
          },
          REJECTED: { label: "Reddedildi", variant: "destructive" as const },
        };
        const config = statusConfig[app.status];
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "documents",
      header: "Belgeler",
      render: (app: CaptainApplication) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>{app.documentFilePaths?.length || 0}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (app: CaptainApplication) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(`/adminPanel/captain-applications/${app.id}`)
            }
          >
            <Eye className="w-4 h-4" />
          </Button>
          {app.status === "PENDING" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(app.id)}
                disabled={bulkActionLoading}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  const reason = prompt("Red nedeni:");
                  if (reason && reason.trim().length >= 5) {
                    handleReject(app.id, reason.trim());
                  }
                }}
                disabled={bulkActionLoading}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Filter definitions
  const filterDefinitions = [
    {
      key: "status",
      label: "Durum",
      type: "select" as const,
      options: [
        { value: "ALL", label: "Tümü" },
        { value: "PENDING", label: "Beklemede" },
        { value: "APPROVED", label: "Onaylandı" },
        { value: "REJECTED", label: "Reddedildi" },
      ],
    },
    {
      key: "priority",
      label: "Öncelik",
      type: "select" as const,
      options: [
        { value: "all", label: "Tümü" },
        { value: "high", label: "Yüksek" },
        { value: "medium", label: "Orta" },
        { value: "low", label: "Düşük" },
      ],
    },
    {
      key: "dateRange",
      label: "Tarih Aralığı",
      type: "daterange" as const,
    },
    {
      key: "experienceRange",
      label: "Deneyim (Yıl)",
      type: "numberRange" as const,
      min: 0,
      max: 50,
    },
    {
      key: "hasDocuments",
      label: "Belge Durumu",
      type: "select" as const,
      options: [
        { value: null, label: "Tümü" },
        { value: true, label: "Belgeli" },
        { value: false, label: "Belgesiz" },
      ],
    },
  ];

  return (
    <AdminPanelLayout
      title="Kaptan Başvuru Yönetimi"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        {
          label: "Kaptan Başvuruları",
          href: "/adminPanel/captain-applications",
        },
      ]}
    >
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Toplam Başvuru"
            value={stats.total}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Bekleyen"
            value={stats.pending}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
            change={{
              value: stats.thisMonth,
              type: "increase",
              period: "Bu ay",
            }}
          />
          <StatCard
            title="Onay Oranı"
            value={`${stats.approvalRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Ort. İşlem Süresi"
            value={`${stats.avgProcessingTime} gün`}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            placeholder="Başvuran adı, lisans numarası veya ID ile ara..."
            onSearch={setSearchQuery}
            value={searchQuery}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadApplications}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/adminPanel/captain-applications/reports")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Raporlar
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Panel */}
        <div className="lg:w-80">
          <FilterPanel
            filters={filterDefinitions}
            values={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                status: "ALL",
                dateRange: { start: "", end: "" },
                experienceRange: { min: 0, max: 50 },
                hasDocuments: null,
                priority: "all",
              })
            }
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Bulk Operations */}
          <BulkOperationsPanel
            selectedApplications={selectedApplications}
            applications={filteredApplications}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onSelectionChange={setSelectedApplications}
            loading={bulkActionLoading}
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Data Table */}
          <DataTable
            data={filteredApplications}
            columns={columns}
            loading={loading}
            pagination={{
              page,
              pageSize: size,
              total: totalElements,
            }}

          />
        </div>
      </div>

      {/* Bulk Reject Modal */}
      <AdminModal
        title="Toplu Red İşlemi"
        size="md"
        open={showBulkRejectModal}
        onOpenChange={setShowBulkRejectModal}
      >
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {selectedApplications.length} başvuru reddedilecek. Bu işlem geri
              alınamaz.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="bulkRejectReason">Red Nedeni *</Label>
            <Textarea
              id="bulkRejectReason"
              rows={4}
              placeholder="Lütfen red nedenini detaylı olarak açıklayın..."
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkRejectModal(false)}
              disabled={bulkActionLoading}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkReject}
              disabled={bulkActionLoading || bulkRejectReason.trim().length < 5}
            >
              {bulkActionLoading ? "İşleniyor..." : "Reddet"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </AdminPanelLayout>
  );
};

export default CaptainApplicationManagement;
