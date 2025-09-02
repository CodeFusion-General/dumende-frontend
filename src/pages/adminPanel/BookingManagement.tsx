import React, { useState } from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { DataTable, ColumnDef } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import StatCard from "@/components/admin/ui/StatCard";
import { BookingDetailModal } from "@/components/admin/bookings/BookingDetailModal";
import { BookingReportsPanel } from "@/components/admin/bookings/BookingReportsPanel";
import { useAdminBookingManagement } from "@/hooks/useAdminBookingManagement";
import { AdminBookingView, AdminBookingFilters } from "@/types/adminBooking";
import { BookingStatus, PaymentStatus } from "@/types/booking.types";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
} from "lucide-react";

const BookingManagement: React.FC = () => {
  const {
    bookings,
    statistics,
    loading,
    statisticsLoading,
    actionLoading,
    error,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    filters,
    selectedBookingIds,
    loadBookings,
    setFilters,
    setPage,
    setPageSize,
    toggleBookingSelection,
    selectAllBookings,
    clearAllSelections,
    performAction,
    performBulkOperation,
    exportBookings,
    refreshData,
  } = useAdminBookingManagement();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingView | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "reports">(
    "bookings"
  );

  // Handle search
  const handleSearch = (query: string) => {
    setFilters({
      ...filters,
      customerName: query,
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AdminBookingFilters>) => {
    setFilters({
      ...filters,
      ...newFilters,
    });
  };

  // Handle booking selection
  const handleBookingClick = (booking: AdminBookingView) => {
    setSelectedBooking(booking);
    setShowBookingDetail(true);
  };

  // Handle status change
  const handleStatusChange = async (
    bookingId: number,
    status: BookingStatus,
    reason?: string
  ) => {
    await performAction({
      type:
        status === BookingStatus.CONFIRMED
          ? "approve"
          : status === BookingStatus.REJECTED
          ? "reject"
          : status === BookingStatus.CANCELLED
          ? "cancel"
          : "complete",
      bookingId,
      reason,
    });
  };

  // Handle bulk operations
  const handleBulkApprove = async () => {
    if (selectedBookingIds.length === 0) return;

    await performBulkOperation({
      bookingIds: selectedBookingIds,
      operation: "approve",
      reason: "Bulk approval by admin",
    });
  };

  const handleBulkReject = async () => {
    if (selectedBookingIds.length === 0) return;

    await performBulkOperation({
      bookingIds: selectedBookingIds,
      operation: "reject",
      reason: "Bulk rejection by admin",
    });
  };

  // Table columns
  const columns: ColumnDef<AdminBookingView>[] = [
    {
      key: "select",
      header: "Select",
      width: "50px",
      render: (value, booking: AdminBookingView) => (
        <input
          type="checkbox"
          checked={selectedBookingIds.includes(booking.id)}
          onChange={() => toggleBookingSelection(booking.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true,
      render: (value, booking: AdminBookingView) => (
        <span className="font-mono text-sm">{booking.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Müşteri",
      sortable: true,
      render: (value, booking: AdminBookingView) => (
        <div>
          <div className="font-medium text-gray-900">
            {booking.customerInfo.name}
          </div>
          <div className="text-sm text-gray-500">
            {booking.customerInfo.email}
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Hizmet",
      render: (value, booking: AdminBookingView) => (
        <div>
          <div className="font-medium text-gray-900">
            {booking.boatInfo?.name || booking.tourInfo?.name || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {booking.boatInfo
              ? "Tekne"
              : booking.tourInfo
              ? "Tur"
              : "Bilinmiyor"}
          </div>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Tarihler",
      sortable: true,
      render: (value, booking: AdminBookingView) => (
        <div className="text-sm">
          <div>{new Date(booking.startDate).toLocaleDateString("tr-TR")}</div>
          <div className="text-gray-500">
            {new Date(booking.startDate).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(booking.endDate).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Durum",
      sortable: true,
      render: (value, booking: AdminBookingView) => {
        const statusConfig = {
          [BookingStatus.PENDING]: {
            color: "bg-yellow-100 text-yellow-800",
            icon: Clock,
          },
          [BookingStatus.CONFIRMED]: {
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
          },
          [BookingStatus.COMPLETED]: {
            color: "bg-blue-100 text-blue-800",
            icon: CheckCircle,
          },
          [BookingStatus.CANCELLED]: {
            color: "bg-red-100 text-red-800",
            icon: XCircle,
          },
          [BookingStatus.REJECTED]: {
            color: "bg-red-100 text-red-800",
            icon: XCircle,
          },
          [BookingStatus.NO_SHOW]: {
            color: "bg-gray-100 text-gray-800",
            icon: AlertCircle,
          },
        };

        const config = statusConfig[booking.status as BookingStatus];
        const Icon = config?.icon || AlertCircle;

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              config?.color || "bg-gray-100 text-gray-800"
            }`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {booking.status}
          </span>
        );
      },
    },
    {
      key: "payment",
      header: "Ödeme",
      render: (value, booking: AdminBookingView) => (
        <div className="text-sm">
          <div className="font-medium">
            ₺{booking.paymentInfo.totalAmount.toLocaleString("tr-TR")}
          </div>
          <div
            className={`text-xs ${
              booking.paymentInfo.paymentStatus === PaymentStatus.COMPLETED
                ? "text-green-600"
                : booking.paymentInfo.paymentStatus === PaymentStatus.FAILED
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {booking.paymentInfo.paymentStatus}
          </div>
        </div>
      ),
    },
    {
      key: "passengers",
      header: "Kişi",
      width: "80px",
      render: (value, booking: AdminBookingView) => (
        <div className="flex items-center text-sm">
          <Users className="w-4 h-4 mr-1 text-gray-400" />
          {booking.passengerCount}
        </div>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      width: "120px",
      render: (value, booking: AdminBookingView) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleBookingClick(booking)}
            className="text-blue-600 hover:text-blue-800"
            title="Detayları Görüntüle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {booking.status === BookingStatus.PENDING && (
            <>
              <button
                onClick={() =>
                  handleStatusChange(booking.id, BookingStatus.CONFIRMED)
                }
                className="text-green-600 hover:text-green-800"
                title="Onayla"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  handleStatusChange(booking.id, BookingStatus.REJECTED)
                }
                className="text-red-600 hover:text-red-800"
                title="Reddet"
              >
                <XCircle className="w-4 h-4" />
              </button>
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
      type: "multiselect" as const,
      options: Object.values(BookingStatus).map((status) => ({
        value: status,
        label: status,
      })),
    },
    {
      key: "paymentStatus",
      label: "Ödeme Durumu",
      type: "multiselect" as const,
      options: Object.values(PaymentStatus).map((status) => ({
        value: status,
        label: status,
      })),
    },
    {
      key: "dateRange",
      label: "Tarih Aralığı",
      type: "daterange" as const,
    },
    {
      key: "minAmount",
      label: "Min. Tutar",
      type: "number" as const,
    },
    {
      key: "maxAmount",
      label: "Max. Tutar",
      type: "number" as const,
    },
  ];

  return (
    <AdminPanelLayout
      title="Rezervasyon Yönetimi"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        { label: "Rezervasyon Yönetimi" },
      ]}
    >
      {/* Statistics Cards */}
      {statistics && !statisticsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Toplam Rezervasyon"
            value={statistics.total.toLocaleString("tr-TR")}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Bekleyen"
            value={statistics.pending.toLocaleString("tr-TR")}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            change={{
              value: statistics.todayBookings,
              type: "increase",
              period: "bugün",
            }}
          />
          <StatCard
            title="Bu Ay Gelir"
            value={`₺${statistics.thisMonthRevenue.toLocaleString("tr-TR")}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            change={{
              value: statistics.thisMonthBookings,
              type: "increase",
              period: "rezervasyon",
            }}
          />
          <StatCard
            title="Ortalama Değer"
            value={`₺${statistics.averageBookingValue.toLocaleString("tr-TR")}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "bookings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Rezervasyonlar
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Raporlar
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "bookings" && (
        <>
          {/* Controls */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search and Filters */}
                <div className="flex-1 flex items-center space-x-4">
                  <div className="flex-1 max-w-md">
                    <SearchBar
                      placeholder="Müşteri adı veya email ile ara..."
                      onSearch={handleSearch}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtreler
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {selectedBookingIds.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkApprove}
                        disabled={actionLoading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Toplu Onayla ({selectedBookingIds.length})
                      </button>
                      <button
                        onClick={handleBulkReject}
                        disabled={actionLoading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Toplu Reddet ({selectedBookingIds.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => exportBookings("csv")}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Dışa Aktar
                  </button>
                  <button
                    onClick={refreshData}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Yenile
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <FilterPanel
                    filters={filterDefinitions}
                    values={filters}
                    onChange={handleFilterChange}
                    onReset={() => setFilters({})}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white shadow rounded-lg">
            <DataTable
              data={bookings}
              columns={columns}
              loading={loading}
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: totalElements,
              }}
              onRowClick={handleBookingClick}
            />
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <BookingReportsPanel filters={filters} onExport={exportBookings} />
      )}

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={showBookingDetail}
          onClose={() => {
            setShowBookingDetail(false);
            setSelectedBooking(null);
          }}
          onAction={performAction}
          loading={actionLoading}
        />
      )}
    </AdminPanelLayout>
  );
};

export default BookingManagement;
