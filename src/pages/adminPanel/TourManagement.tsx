import React, { useState, useMemo } from "react";
import { useAdminTourManagement } from "@/hooks/useAdminTourManagement";
import {
  AdminTourView,
  AdminTourFilters,
  TourBulkOperation,
} from "@/types/adminTour";
import { TourStatus, TourType } from "@/types/tour.types";
import { DataTable, ColumnDef } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import TourDetailModal from "@/components/admin/tours/TourDetailModal";
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
} from "lucide-react";

const TourManagement: React.FC = () => {
  const {
    tours,
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

  // Modal states
  const [selectedTour, setSelectedTour] = useState<AdminTourView | null>(null);
  const [showTourDetail, setShowTourDetail] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Filter definitions
  const filterDefinitions = useMemo(
    () => [
      {
        key: "status",
        label: "Durum",
        type: "multiselect" as const,
        options: [
          { value: TourStatus.ACTIVE, label: "Aktif" },
          { value: TourStatus.INACTIVE, label: "Pasif" },
          { value: TourStatus.DRAFT, label: "Taslak" },
          { value: TourStatus.CANCELLED, label: "İptal" },
        ],
      },
      {
        key: "approvalStatus",
        label: "Onay Durumu",
        type: "multiselect" as const,
        options: [
          { value: "pending", label: "Beklemede" },
          { value: "approved", label: "Onaylandı" },
          { value: "rejected", label: "Reddedildi" },
          { value: "suspended", label: "Askıya Alındı" },
        ],
      },
      {
        key: "tourType",
        label: "Tur Türü",
        type: "multiselect" as const,
        options: [
          { value: TourType.HIKING, label: "Yürüyüş" },
          { value: TourType.CULTURAL, label: "Kültürel" },
          { value: TourType.FOOD, label: "Yemek" },
          { value: TourType.CITY, label: "Şehir" },
          { value: TourType.NATURE, label: "Doğa" },
          { value: TourType.BOAT, label: "Tekne" },
          { value: TourType.PHOTOGRAPHY, label: "Fotoğraf" },
          { value: TourType.DIVING, label: "Dalış" },
        ],
      },
      {
        key: "location",
        label: "Konum",
        type: "text" as const,
        placeholder: "Konum ara...",
      },
      {
        key: "priceRange",
        label: "Fiyat Aralığı",
        type: "daterange" as const,
      },
      {
        key: "hasDocumentIssues",
        label: "Belge Sorunları",
        type: "boolean" as const,
      },
      {
        key: "isReported",
        label: "Şikayet Edilmiş",
        type: "boolean" as const,
      },
      {
        key: "isFeatured",
        label: "Öne Çıkan",
        type: "boolean" as const,
      },
    ],
    []
  );

  // Table columns
  const columns: ColumnDef<AdminTourView>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Tur Adı",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{tour.name}</span>
            <span className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {tour.location}
            </span>
          </div>
        ),
      },
      {
        key: "guideInfo",
        header: "Rehber",
        render: (value, tour: AdminTourView) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">
                {tour.guideInfo.name}
              </span>
              <div className="flex items-center mt-1">
                {tour.guideInfo.isVerified && (
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                )}
                {tour.guideInfo.isCertified && (
                  <Star className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Durum",
        sortable: true,
        render: (value, tour: AdminTourView) => {
          const statusConfig = {
            ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-800" },
            INACTIVE: { label: "Pasif", color: "bg-red-100 text-red-800" },
            DRAFT: { label: "Taslak", color: "bg-yellow-100 text-yellow-800" },
            CANCELLED: { label: "İptal", color: "bg-gray-100 text-gray-800" },
          };

          const config =
            statusConfig[tour.status as keyof typeof statusConfig] ||
            statusConfig.DRAFT;

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        key: "approvalStatus",
        header: "Onay Durumu",
        render: (value, tour: AdminTourView) => {
          const approvalConfig = {
            pending: {
              label: "Beklemede",
              color: "bg-yellow-100 text-yellow-800",
              icon: AlertTriangle,
            },
            approved: {
              label: "Onaylandı",
              color: "bg-green-100 text-green-800",
              icon: CheckCircle,
            },
            rejected: {
              label: "Reddedildi",
              color: "bg-red-100 text-red-800",
              icon: XCircle,
            },
            suspended: {
              label: "Askıya Alındı",
              color: "bg-orange-100 text-orange-800",
              icon: Pause,
            },
          };

          const config = approvalConfig[tour.approvalStatus];
          const Icon = config.icon;

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </span>
          );
        },
      },
      {
        key: "price",
        header: "Fiyat",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
            <span className="font-medium">₺{tour.price.toLocaleString()}</span>
          </div>
        ),
      },
      {
        key: "capacity",
        header: "Kapasite",
        render: (value, tour: AdminTourView) => (
          <div className="flex items-center">
            <Users className="w-4 h-4 text-gray-400 mr-1" />
            <span>{tour.capacity} kişi</span>
          </div>
        ),
      },
      {
        key: "bookingStats",
        header: "Rezervasyonlar",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="text-sm">
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 text-gray-400 mr-1" />
              <span className="font-medium">
                {tour.bookingStats.totalBookings}
              </span>
            </div>
            <div className="text-gray-500 mt-1">
              Bu ay: {tour.bookingStats.thisMonthBookings}
            </div>
          </div>
        ),
      },
      {
        key: "documentStatus",
        header: "Belgeler",
        render: (value, tour: AdminTourView) => (
          <div className="text-sm">
            <div className="flex items-center">
              <FileText className="w-3 h-3 text-gray-400 mr-1" />
              <span>
                {tour.documentStatus.verified}/{tour.documentStatus.total}
              </span>
            </div>
            {tour.documentStatus.expired > 0 && (
              <div className="text-red-500 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {tour.documentStatus.expired} süresi dolmuş
              </div>
            )}
          </div>
        ),
      },
      {
        key: "lastActivity",
        header: "Son Aktivite",
        sortable: true,
        render: (value, tour: AdminTourView) => (
          <div className="text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(tour.lastActivity).toLocaleDateString("tr-TR")}
            </div>
          </div>
        ),
      },
    ],
    []
  );

  // Action buttons for each row
  const getRowActions = (tour: AdminTourView) => [
    {
      label: "Detayları Görüntüle",
      icon: Eye,
      onClick: () => handleViewTour(tour),
      variant: "ghost" as const,
    },
    ...(tour.approvalStatus === "pending"
      ? [
          {
            label: "Onayla",
            icon: CheckCircle,
            onClick: () => handleApproveTour(tour),
            variant: "ghost" as const,
            className: "text-green-600 hover:text-green-700",
          },
          {
            label: "Reddet",
            icon: XCircle,
            onClick: () => handleRejectTour(tour),
            variant: "ghost" as const,
            className: "text-red-600 hover:text-red-700",
          },
        ]
      : []),
    ...(tour.isActive
      ? [
          {
            label: "Askıya Al",
            icon: Pause,
            onClick: () => handleSuspendTour(tour),
            variant: "ghost" as const,
            className: "text-orange-600 hover:text-orange-700",
          },
        ]
      : [
          {
            label: "Aktifleştir",
            icon: Play,
            onClick: () => handleActivateTour(tour),
            variant: "ghost" as const,
            className: "text-green-600 hover:text-green-700",
          },
        ]),
  ];

  // Bulk action options
  const bulkActionOptions = [
    { value: "approve", label: "Onayla", icon: CheckCircle },
    { value: "reject", label: "Reddet", icon: XCircle },
    { value: "suspend", label: "Askıya Al", icon: Pause },
    { value: "activate", label: "Aktifleştir", icon: Play },
    { value: "delete", label: "Sil", icon: Trash2, className: "text-red-600" },
  ];

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

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTourIds.length === 0) return;

    let reason = "";
    if (["reject", "suspend"].includes(bulkAction)) {
      reason = prompt("Sebep giriniz:") || "";
      if (!reason) return;
    }

    try {
      const operation: TourBulkOperation = {
        tourIds: selectedTourIds,
        operation: bulkAction as any,
        reason,
        note: `Toplu işlem: ${bulkAction}`,
      };

      await performBulkOperation(operation);
      setShowBulkActionModal(false);
      setBulkAction("");
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    const adminFilters: AdminTourFilters = {
      status: newFilters.status,
      approvalStatus: newFilters.approvalStatus,
      tourType: newFilters.tourType,
      location: newFilters.location,
      priceRange: newFilters.priceRange
        ? {
            min: newFilters.priceRange[0],
            max: newFilters.priceRange[1],
          }
        : undefined,
      hasDocumentIssues: newFilters.hasDocumentIssues,
      isReported: newFilters.isReported,
      isFeatured: newFilters.isFeatured,
    };

    setFilters(adminFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tur Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            Platformdaki tüm turları yönetin ve denetleyin
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3">
                <button
                  onClick={clearError}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filterDefinitions}
            values={filters}
            onChange={handleFilterChange}
            onReset={() => setFilters({})}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <SearchBar
            placeholder="Tur adı, konum veya rehber adı ile ara..."
            onSearch={setSearchQuery}
            value={searchQuery}
          />

          {/* Bulk Actions */}
          {selectedTourIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTourIds.length} tur seçildi
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowBulkActionModal(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                  >
                    Toplu İşlem
                  </button>
                  <button
                    onClick={clearSelection}
                    className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
                  >
                    Seçimi Temizle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            data={tours}
            columns={columns}
            loading={loading}
            pagination={{
              page: currentPage,
              pageSize: 20,
              total: totalCount,
            }}
            onRowClick={handleViewTour}
          />
        </div>
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
            // This would be implemented with proper backend support
            console.log("Adding note to tour:", tourId, note);
          }}
          onVerifyDocument={verifyTourDocument}
          onBulkVerifyDocuments={bulkVerifyTourDocuments}
        />
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <AdminModal
          open={showBulkActionModal}
          onOpenChange={setShowBulkActionModal}
          title="Toplu İşlem"
          size="md"
          actions={[
            {
              label: "İptal",
              variant: "outline",
              onClick: () => {
                setShowBulkActionModal(false);
                setBulkAction("");
              },
            },
            {
              label: "Uygula",
              variant: "default",
              onClick: handleBulkAction,
              disabled: !bulkAction,
            },
          ]}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {selectedTourIds.length} tur için uygulanacak işlemi seçin:
            </p>

            <div className="space-y-2">
              {bulkActionOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="bulkAction"
                    value={option.value}
                    checked={bulkAction === option.value}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="mr-3"
                  />
                  <option.icon
                    className={`w-4 h-4 mr-2 ${option.className || ""}`}
                  />
                  <span className={option.className || ""}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default TourManagement;
