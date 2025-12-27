import React, { useState } from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { DataTable, ColumnDef, SortingConfig } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { toast } from "react-hot-toast";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import StatCard from "@/components/admin/ui/StatCard";
import { BoatDetailModal } from "@/components/admin/boats/BoatDetailModal";
import { useAdminBoatManagement } from "@/hooks/useAdminBoatManagement";
import {
  AdminBoatView,
  BoatManagementTab,
  BOAT_APPROVAL_STATUS_OPTIONS,
  BOAT_TYPE_OPTIONS,
} from "@/types/adminBoat";
import {
  Ship,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

const BoatManagement: React.FC = () => {
  const {
    boats,
    statistics,
    totalCount,
    totalPages,
    currentPage,
    activeTab,
    searchQuery,
    selectedBoats,
    sortBy,
    filters,
    isLoading,
    isProcessing,
    error,
    handleTabChange,
    handlePageChange,
    handleSearchChange,
    handleFiltersChange,
    handleSortChange,
    handleBoatSelection,
    handleSelectAll,
    handleApproveBoat,
    handleRejectBoat,
    handleBulkApprove,
    handleBulkReject,
    resetFilters,
    refreshData,
  } = useAdminBoatManagement();

  const [selectedBoat, setSelectedBoat] = useState<AdminBoatView | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Table columns definition
  const columns: ColumnDef<AdminBoatView>[] = [
    {
      key: "select",
      header: "Select",
      width: "50px",
      render: (value, boat: AdminBoatView) => (
        <Checkbox
          checked={selectedBoats.includes(boat.id)}
          onCheckedChange={(value) => handleBoatSelection(boat.id, !!value)}
          aria-label="Satırı seç"
        />
      ),
    },
    {
      key: "name",
      header: "Tekne Adı",
      sortable: true,
      render: (value, boat: AdminBoatView) => (
        <div className="flex items-center space-x-2">
          <Ship className="h-4 w-4 text-blue-500" />
          <div>
            <div className="font-medium">{boat.name ?? "İsimsiz"}</div>
            <div className="text-sm text-gray-500">{boat.type ?? "-"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "ownerName",
      header: "Sahip",
      sortable: true,
      render: (value, boat: AdminBoatView) => (
        <div>
          <div className="font-medium">{boat.ownerInfo?.name ?? "Bilinmiyor"}</div>
          <div className="text-sm text-gray-500">
            {boat.ownerInfo?.email ?? "-"}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Lokasyon",
      sortable: true,
      render: (value, boat: AdminBoatView) => <div className="text-sm">{boat.location ?? "-"}</div>,
    },
    {
      key: "capacity",
      header: "Kapasite",
      sortable: true,
      render: (value, boat: AdminBoatView) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{boat.capacity ?? 0}</span>
        </div>
      ),
    },
    {
      key: "dailyPrice",
      header: "Günlük Fiyat",
      sortable: true,
      render: (value, boat: AdminBoatView) => (
        <div className="font-medium">
          ₺{(boat.dailyPrice ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "approvalStatus",
      header: "Durum",
      render: (value, boat: AdminBoatView) => {
        const status = boat.approvalStatus;
        const statusConfig = BOAT_APPROVAL_STATUS_OPTIONS.find(
          (s) => s.value === status
        );

        return (
          <Badge
            variant={
              status === "approved"
                ? "default"
                : status === "rejected"
                ? "destructive"
                : "secondary"
            }
            className={`${
              statusConfig?.color === "green"
                ? "bg-green-100 text-green-800"
                : statusConfig?.color === "red"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {statusConfig?.label || status}
          </Badge>
        );
      },
    },
    {
      key: "documentStatus",
      header: "Belgeler",
      render: (value, boat: AdminBoatView) => {
        const docStatus = boat.documentStatus ?? { verified: 0, pending: 0, expired: 0, total: 0 };
        const { verified, pending, expired, total } = docStatus;

        if (total === 0) {
          return <Badge variant="secondary">Belge Yok</Badge>;
        }

        if (expired > 0) {
          return <Badge variant="destructive">Süresi Dolmuş</Badge>;
        }

        if (pending > 0) {
          return <Badge variant="secondary">Beklemede</Badge>;
        }

        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Onaylı
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Oluşturulma",
      sortable: true,
      render: (value, boat: AdminBoatView) => (
        <div className="text-sm text-gray-500">
          {new Date(boat.createdAt).toLocaleDateString("tr-TR")}
        </div>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      width: "100px",
      render: (value, boat: AdminBoatView) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedBoat(boat)}>
              <Eye className="mr-2 h-4 w-4" />
              Detayları Görüntüle
            </DropdownMenuItem>
            {boat.approvalStatus === "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleApproveBoat(boat.id)}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Onayla
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const reason = prompt("Red sebebini giriniz:");
                    if (reason) {
                      handleRejectBoat(boat.id, reason);
                    }
                  }}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Filter configuration
  const filterConfig = [
    {
      key: "types",
      label: "Tekne Tipi",
      type: "multiselect" as const,
      options: BOAT_TYPE_OPTIONS.map((type) => ({ value: type, label: type })),
    },
    {
      key: "approvalStatus",
      label: "Onay Durumu",
      type: "select" as const,
      options: BOAT_APPROVAL_STATUS_OPTIONS.map((status) => ({
        value: status.value,
        label: status.label,
      })),
    },
    {
      key: "documentStatus",
      label: "Belge Durumu",
      type: "select" as const,
      options: [
        { value: "verified", label: "Onaylı" },
        { value: "pending", label: "Beklemede" },
        { value: "expired", label: "Süresi Dolmuş" },
      ],
    },
    {
      key: "capacity",
      label: "Minimum Kapasite",
      type: "number" as const,
    },
    {
      key: "minPrice",
      label: "Minimum Fiyat",
      type: "number" as const,
    },
    {
      key: "maxPrice",
      label: "Maksimum Fiyat",
      type: "number" as const,
    },
  ];

  // Bulk actions
  const handleBulkAction = (action: "approve" | "reject") => {
    if (selectedBoats.length === 0) {
      toast.error("Lütfen en az bir tekne seçin");
      return;
    }

    if (action === "approve") {
      handleBulkApprove();
    } else {
      const reason = prompt("Red sebebini giriniz:");
      if (reason) {
        handleBulkReject(reason);
      }
    }
  };

  if (error) {
    return (
      <AdminPanelLayout title="Tekne Yönetimi">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Veri Yüklenemedi
            </h3>
            <p className="text-gray-500 mb-4">
              Tekne verileri yüklenirken bir hata oluştu.
            </p>
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
      title="Tekne Yönetimi"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        { label: "Tekne Yönetimi", href: "/adminPanel/boats" },
      ]}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Toplam Tekne"
              value={statistics.totalBoats}
              icon={<Ship className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              title="Onay Bekleyen"
              value={statistics.pendingBoats}
              icon={<Clock className="h-4 w-4" />}
              color="yellow"
            />
            <StatCard
              title="Aktif Tekneler"
              value={statistics.activeBoats}
              icon={<CheckCircle className="h-4 w-4" />}
              color="green"
            />
            <StatCard
              title="Reddedilen"
              value={statistics.rejectedBoats}
              icon={<XCircle className="h-4 w-4" />}
              color="red"
            />
          </div>
        )}

        {/* Search and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tekne Listesi</CardTitle>
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
                placeholder="Tekne adı veya sahip adı ile ara..."
                onSearch={handleSearchChange}
                value={searchQuery}
              />

              {/* Filter Panel */}
              {showFilters && (
                <FilterPanel
                  filters={filterConfig}
                  values={filters}
                  onChange={handleFiltersChange}
                  onReset={resetFilters}
                />
              )}

              {/* Bulk Actions */}
              {selectedBoats.length > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {selectedBoats.length} tekne seçildi
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("approve")}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Toplu Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("reject")}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Toplu Reddet
                  </Button>
                </div>
              )}

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  handleTabChange(value as BoatManagementTab)
                }
              >
                <TabsList>
                  <TabsTrigger value="all">
                    Tümü ({statistics?.totalBoats || 0})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Bekleyen ({statistics?.pendingBoats || 0})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Aktif ({statistics?.activeBoats || 0})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Reddedilen ({statistics?.rejectedBoats || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                  <DataTable
                    data={boats}
                    columns={columns}
                    loading={isLoading}
                    pagination={{
                      page: currentPage,
                      pageSize: 20,
                      total: totalCount,
                    }}
                    onPageChange={handlePageChange}
                    sorting={sortBy ? { field: sortBy.split(',')[0], direction: sortBy.split(',')[1] as 'asc' | 'desc' } : undefined}
                    onSortingChange={(sort: SortingConfig) => handleSortChange(`${sort.field},${sort.direction}`)}
                    emptyMessage="Tekne bulunamadı"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boat Detail Modal */}
      {selectedBoat && (
        <BoatDetailModal
          boat={selectedBoat}
          isOpen={!!selectedBoat}
          onClose={() => setSelectedBoat(null)}
          onApprove={(boatId, reason) => {
            handleApproveBoat(boatId, reason);
            setSelectedBoat(null);
          }}
          onReject={(boatId, reason) => {
            handleRejectBoat(boatId, reason);
            setSelectedBoat(null);
          }}
        />
      )}
    </AdminPanelLayout>
  );
};

export default BoatManagement;
