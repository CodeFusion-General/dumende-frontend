import React, { useState, useMemo } from "react";
import { useAdminTourManagement } from "@/hooks/useAdminTourManagement";
import {
  AdminTourView,
  AdminTourFilters,
  TourBulkOperation,
} from "@/types/adminTour";
import { TourStatus, TourType } from "@/types/tour.types";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { DataTable, ColumnDef, SortingConfig } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import StatCard from "@/components/admin/ui/StatCard";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import TourDetailModal from "@/components/admin/tours/TourDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  Star,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Map,
} from "lucide-react";

type TourManagementTab = "all" | "pending" | "active" | "rejected";

const TourManagement: React.FC = () => {
  const {
    tours,
    stats,
    loading,
    currentPage,
    totalPages,
    totalCount,
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    selectedTourIds,
    error,
    loadTours,
    loadTourById,
    setFilters,
    setSearchQuery,
    setSorting,
    setPage,
    setSelectedTourIds,
    selectAllTours,
    clearSelection,
    approveTour,
    rejectTour,
    suspendTour,
    activateTour,
    performBulkOperation,
    verifyTourDocument,
    bulkVerifyTourDocuments,
    clearError,
  } = useAdminTourManagement();

  // Local state
  const [activeTab, setActiveTab] = useState<TourManagementTab>("all");
  const [selectedTour, setSelectedTour] = useState<AdminTourView | null>(null);
  const [showTourDetail, setShowTourDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Handle tab change
  const handleTabChange = (tab: TourManagementTab) => {
    setActiveTab(tab);

    // Update filters based on tab
    const newFilters: AdminTourFilters = { ...filters };
    switch (tab) {
      case "pending":
        newFilters.approvalStatus = ["pending"];
        break;
      case "active":
        newFilters.approvalStatus = ["approved"];
        break;
      case "rejected":
        newFilters.approvalStatus = ["rejected"];
        break;
      case "all":
      default:
        delete newFilters.approvalStatus;
        break;
    }
    setFilters(newFilters);
  };

  // Handle sorting
  const handleSortChange = (sort: SortingConfig) => {
    setSorting(sort.field, sort.direction);
  };

  // Filter definitions
  const filterDefinitions = useMemo(
    () => [
      {
        key: "tourType",
        label: "Tur Türü",
        type: "select" as const,
        options: [
          { value: "", label: "Tümü" },
          { value: TourType.HIKING, label: "Yürüyüş" },
          { value: TourType.CULTURAL, label: "Kültürel" },
          { value: TourType.FOOD, label: "Yemek" },
          { value: TourType.CITY, label: "Şehir" },
          { value: TourType.NATURE, label: "Doğa" },
          { value: TourType.BOAT, label: "Tekne" },
        ],
      },
      {
        key: "location",
        label: "Konum",
        type: "text" as const,
        placeholder: "Konum ara...",
      },
      {
        key: "minPrice",
        label: "Min Fiyat",
        type: "number" as const,
      },
      {
        key: "maxPrice",
        label: "Max Fiyat",
        type: "number" as const,
      },
    ],
    []
  );

  // Table columns
  const columns: ColumnDef<AdminTourView>[] = useMemo(
    () => [
      {
        key: "select",
        header: "Seç",
        width: "50px",
        render: (value, tour: AdminTourView) => (
          <Checkbox
            checked={selectedTourIds.includes(tour.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedTourIds([...selectedTourIds, tour.id]);
              } else {
                setSelectedTourIds(selectedTourIds.filter((id) => id !== tour.id));
              }
            }}
            aria-label="Satırı seç"
          />
        ),
      },
      {
        key: "name",
        header: "Tur Adı",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="flex items-center space-x-2">
            <Map className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium">{tour.name ?? "İsimsiz"}</div>
              <div className="text-sm text-gray-500">{tour.location ?? "-"}</div>
            </div>
          </div>
        ),
      },
      {
        key: "guideInfo",
        header: "Rehber",
        render: (value, tour: AdminTourView) => (
          <div>
            <div className="font-medium">{tour.guideInfo?.name ?? "Bilinmiyor"}</div>
            <div className="text-sm text-gray-500 flex items-center">
              {tour.guideInfo?.isVerified && (
                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
              )}
              {tour.guideInfo?.isCertified && (
                <Star className="w-3 h-3 text-yellow-500 mr-1" />
              )}
            </div>
          </div>
        ),
      },
      {
        key: "price",
        header: "Fiyat",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="font-medium">₺{(tour.price ?? 0).toLocaleString()}</div>
        ),
      },
      {
        key: "capacity",
        header: "Kapasite",
        render: (value, tour: AdminTourView) => (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{tour.capacity ?? 0} kişi</span>
          </div>
        ),
      },
      {
        key: "approvalStatus",
        header: "Durum",
        render: (value, tour: AdminTourView) => {
          const statusConfig: Record<string, { label: string; color: string }> = {
            pending: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
            approved: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
            rejected: { label: "Reddedildi", color: "bg-red-100 text-red-800" },
            suspended: { label: "Askıda", color: "bg-orange-100 text-orange-800" },
          };
          const config = statusConfig[tour.approvalStatus] || statusConfig.pending;
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        header: "Oluşturulma",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="text-sm text-gray-500">
            {tour.createdAt ? new Date(tour.createdAt).toLocaleDateString("tr-TR") : "-"}
          </div>
        ),
      },
      {
        key: "actions",
        header: "İşlemler",
        width: "100px",
        render: (value, tour: AdminTourView) => (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewTour(tour)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {tour.approvalStatus === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600"
                  onClick={() => handleApproveTour(tour)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleRejectTour(tour)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [selectedTourIds, setSelectedTourIds]
  );

  // Event handlers
  const handleViewTour = async (tour: AdminTourView) => {
    setSelectedTour(tour);
    setShowTourDetail(true);
  };

  const handleApproveTour = async (tour: AdminTourView) => {
    try {
      await approveTour({
        tourId: tour.id,
        action: "approve",
        note: "Tur admin tarafından onaylandı",
      });
    } catch (error) {
      console.error("Error approving tour:", error);
    }
  };

  const handleRejectTour = async (tour: AdminTourView) => {
    const reason = prompt("Reddetme sebebini giriniz:");
    if (!reason) return;

    try {
      await rejectTour({
        tourId: tour.id,
        action: "reject",
        reason,
        note: `Tur reddedildi: ${reason}`,
      });
    } catch (error) {
      console.error("Error rejecting tour:", error);
    }
  };

  const handleSuspendTour = async (tour: AdminTourView) => {
    const reason = prompt("Askıya alma sebebini giriniz:");
    if (!reason) return;

    try {
      await suspendTour(tour.id, reason);
    } catch (error) {
      console.error("Error suspending tour:", error);
    }
  };

  const handleActivateTour = async (tour: AdminTourView) => {
    try {
      await activateTour(tour.id, "Tur admin tarafından aktifleştirildi");
    } catch (error) {
      console.error("Error activating tour:", error);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedTourIds.length === 0) return;

    let reason = "";
    if (action === "reject") {
      reason = prompt("Red sebebini giriniz:") || "";
      if (!reason) return;
    }

    try {
      const operation: TourBulkOperation = {
        tourIds: selectedTourIds,
        operation: action,
        reason,
        note: `Toplu işlem: ${action}`,
      };

      await performBulkOperation(operation);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const refreshData = () => {
    loadTours();
  };

  // Sort configuration
  const currentSorting: SortingConfig | undefined = sortBy
    ? { field: sortBy, direction: sortOrder }
    : undefined;

  if (error) {
    return (
      <AdminPanelLayout
        title="Tur Yönetimi"
        breadcrumbs={[
          { label: "Admin Panel", href: "/adminPanel" },
          { label: "Tur Yönetimi" },
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Veri Yüklenemedi
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yeniden Dene
            </Button>
          </div>
        </div>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout
      title="Tur Yönetimi"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        { label: "Tur Yönetimi" },
      ]}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Toplam Tur"
              value={stats.total ?? 0}
              icon={<Map className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              title="Onay Bekleyen"
              value={stats.pending ?? 0}
              icon={<Clock className="h-4 w-4" />}
              color="yellow"
            />
            <StatCard
              title="Aktif Turlar"
              value={stats.active ?? 0}
              icon={<CheckCircle className="h-4 w-4" />}
              color="green"
            />
            <StatCard
              title="Reddedilen"
              value={stats.rejected ?? 0}
              icon={<XCircle className="h-4 w-4" />}
              color="red"
            />
          </div>
        )}

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tur Listesi</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtreler
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Dışa Aktar
                </Button>
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yenile
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <SearchBar
                placeholder="Tur adı veya rehber adı ile ara..."
                onSearch={setSearchQuery}
                value={searchQuery}
              />

              {/* Filter Panel */}
              {showFilters && (
                <FilterPanel
                  filters={filterDefinitions}
                  values={filters}
                  onChange={setFilters}
                  onReset={() => setFilters({})}
                />
              )}

              {/* Bulk Actions */}
              {selectedTourIds.length > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {selectedTourIds.length} tur seçildi
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("approve")}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Toplu Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("reject")}
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Toplu Reddet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearSelection}
                  >
                    Seçimi Temizle
                  </Button>
                </div>
              )}

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value) => handleTabChange(value as TourManagementTab)}
              >
                <TabsList>
                  <TabsTrigger value="all">
                    Tümü ({stats?.total ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Bekleyen ({stats?.pending ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Aktif ({stats?.active ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Reddedilen ({stats?.rejected ?? 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                  <DataTable
                    data={tours}
                    columns={columns}
                    loading={loading}
                    pagination={{
                      page: currentPage - 1, // API uses 1-indexed, DataTable uses 0-indexed
                      pageSize: 20,
                      total: totalCount,
                    }}
                    onPageChange={(page) => setPage(page + 1)} // Convert back to 1-indexed
                    sorting={currentSorting}
                    onSortingChange={handleSortChange}
                    emptyMessage="Tur bulunamadı"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tour Detail Modal */}
      {showTourDetail && selectedTour && (
        <TourDetailModal
          tour={selectedTour}
          onClose={() => {
            setShowTourDetail(false);
            setSelectedTour(null);
          }}
          onApprove={handleApproveTour}
          onReject={handleRejectTour}
          onSuspend={handleSuspendTour}
          onActivate={handleActivateTour}
          onAddNote={async (tourId, note) => {
            console.log("Adding note to tour:", tourId, note);
          }}
          onVerifyDocument={verifyTourDocument}
          onBulkVerifyDocuments={bulkVerifyTourDocuments}
        />
      )}
    </AdminPanelLayout>
  );
};

export default TourManagement;
