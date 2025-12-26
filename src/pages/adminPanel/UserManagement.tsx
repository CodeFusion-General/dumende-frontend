import React, { useState } from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { DataTable, ColumnDef } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import { UserDetailModal } from "@/components/admin/users/UserDetailModal";
import { UserEditForm } from "@/components/admin/users/UserEditForm";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { AdminUserView } from "@/types/adminUser";
import { UserType } from "@/types/auth.types";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const UserManagement: React.FC = () => {
  const {
    users,
    statistics,
    selectedUsers,
    loading,
    error,
    filters,
    searchQuery,
    pagination,
    updateFilters,
    clearFilters,
    filterByRole,
    filterByStatus,
    search,
    goToPage,
    changePageSize,
    updateSorting,
    sorting,
    selectUser,
    selectAllUsers,
    clearSelection,
    performBulkAction,
    refresh,
    exportUsers,
    hasSelection,
    selectedCount,
    isAllSelected,
  } = useAdminUserManagement({
    pageSize: 20,
    autoRefresh: true,
    refreshInterval: 60000,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);

  // Column definitions for DataTable
  const columns: ColumnDef<AdminUserView>[] = [
    {
      key: "select",
      header: "Select",
      width: "50px",
      render: (value, user: AdminUserView) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() => selectUser(user.id)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      key: "user",
      header: "Kullanıcı",
      sortable: true,
      render: (value, user: AdminUserView) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-sm text-gray-500">{user.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      sortable: true,
      render: (value, user: AdminUserView) => {
        const roleConfig = {
          [UserType.CUSTOMER]: {
            label: "Müşteri",
            color: "bg-blue-100 text-blue-800",
          },
          [UserType.BOAT_OWNER]: {
            label: "Tekne Sahibi",
            color: "bg-green-100 text-green-800",
          },
          [UserType.ADMIN]: {
            label: "Admin",
            color: "bg-purple-100 text-purple-800",
          },
        };
        const config = roleConfig[user.role] || {
          label: user.role,
          color: "bg-gray-100 text-gray-800",
        };

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
      key: "status",
      header: "Durum",
      sortable: true,
      render: (value, user: AdminUserView) => {
        const statusConfig = {
          active: {
            label: "Aktif",
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
          },
          suspended: {
            label: "Askıya Alınmış",
            color: "bg-yellow-100 text-yellow-800",
            icon: AlertTriangle,
          },
          banned: {
            label: "Yasaklı",
            color: "bg-red-100 text-red-800",
            icon: XCircle,
          },
        };
        const config = statusConfig[user.status];
        const Icon = config.icon;

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "verification",
      header: "Doğrulama",
      sortable: true,
      render: (value, user: AdminUserView) => {
        const verificationConfig = {
          verified: {
            label: "Doğrulanmış",
            color: "bg-green-100 text-green-800",
          },
          pending: {
            label: "Beklemede",
            color: "bg-yellow-100 text-yellow-800",
          },
          rejected: { label: "Reddedilmiş", color: "bg-red-100 text-red-800" },
        };
        const config = verificationConfig[user.verificationStatus];

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
      key: "bookings",
      header: "Rezervasyonlar",
      render: (value, user: AdminUserView) => (
        <div className="text-sm">
          <div className="font-medium">{user.totalBookings}</div>
          <div className="text-gray-500">
            ₺{user.totalSpent.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "risk",
      header: "Risk Skoru",
      render: (value, user: AdminUserView) => {
        const riskColor =
          user.riskScore >= 7
            ? "text-red-600"
            : user.riskScore >= 4
            ? "text-yellow-600"
            : "text-green-600";
        return (
          <div className={`font-medium ${riskColor}`}>{user.riskScore}/10</div>
        );
      },
    },
    {
      key: "lastLogin",
      header: "Son Giriş",
      render: (value, user: AdminUserView) => (
        <div className="text-sm text-gray-500">
          {user.lastLoginDate
            ? new Date(user.lastLoginDate).toLocaleDateString("tr-TR")
            : "Hiç giriş yapmamış"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      width: "120px",
      render: (value, user: AdminUserView) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowUserDetail(true);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Detayları Görüntüle"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowUserEdit(true);
            }}
            className="text-green-600 hover:text-green-800"
            title="Düzenle"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              handleQuickAction(
                user,
                user.status === "active" ? "suspend" : "activate"
              )
            }
            className={
              user.status === "active"
                ? "text-yellow-600 hover:text-yellow-800"
                : "text-green-600 hover:text-green-800"
            }
            title={user.status === "active" ? "Askıya Al" : "Aktifleştir"}
          >
            {user.status === "active" ? (
              <Ban className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  // Filter definitions
  const filterDefinitions = [
    {
      key: "role",
      label: "Rol",
      type: "select" as const,
      options: [
        { value: "", label: "Tümü" },
        { value: UserType.CUSTOMER, label: "Müşteri" },
        { value: UserType.BOAT_OWNER, label: "Tekne Sahibi" },
        { value: UserType.ADMIN, label: "Admin" },
      ],
    },
    {
      key: "status",
      label: "Durum",
      type: "select" as const,
      options: [
        { value: "", label: "Tümü" },
        { value: "active", label: "Aktif" },
        { value: "suspended", label: "Askıya Alınmış" },
        { value: "banned", label: "Yasaklı" },
      ],
    },
    {
      key: "verificationStatus",
      label: "Doğrulama Durumu",
      type: "select" as const,
      options: [
        { value: "", label: "Tümü" },
        { value: "verified", label: "Doğrulanmış" },
        { value: "pending", label: "Beklemede" },
        { value: "rejected", label: "Reddedilmiş" },
      ],
    },
    {
      key: "riskScoreMin",
      label: "Min Risk Skoru",
      type: "number" as const,
      min: 0,
      max: 10,
    },
    {
      key: "riskScoreMax",
      label: "Max Risk Skoru",
      type: "number" as const,
      min: 0,
      max: 10,
    },
  ];

  // Quick action handler
  const handleQuickAction = async (
    user: AdminUserView,
    action: "suspend" | "activate" | "ban"
  ) => {
    const confirmed = window.confirm(
      `${user.fullName} kullanıcısını ${
        action === "suspend"
          ? "askıya almak"
          : action === "activate"
          ? "aktifleştirmek"
          : "yasaklamak"
      } istediğinizden emin misiniz?`
    );

    if (confirmed) {
      await performBulkAction({
        action,
        reason: `Admin tarafından ${action} işlemi`,
      });
    }
  };

  // Handle user update from modals
  const handleUserUpdate = (updatedUser: AdminUserView) => {
    // Refresh the user list to show updated data
    refresh();
  };

  // Bulk action handler
  const handleBulkAction = async (action: "suspend" | "activate" | "ban") => {
    const actionText =
      action === "suspend"
        ? "askıya almak"
        : action === "activate"
        ? "aktifleştirmek"
        : "yasaklamak";
    const confirmed = window.confirm(
      `Seçili ${selectedCount} kullanıcıyı ${actionText} istediğinizden emin misiniz?`
    );

    if (confirmed) {
      await performBulkAction({
        action,
        reason: `Toplu ${action} işlemi`,
      });
    }
  };

  // Quick filter buttons
  const quickFilters = [
    { label: "Tümü", onClick: () => clearFilters() },
    { label: "Müşteriler", onClick: () => filterByRole(UserType.CUSTOMER) },
    {
      label: "Tekne Sahipleri",
      onClick: () => filterByRole(UserType.BOAT_OWNER),
    },
    { label: "Adminler", onClick: () => filterByRole(UserType.ADMIN) },
    { label: "Askıya Alınmış", onClick: () => filterByStatus("suspended") },
    { label: "Yasaklı", onClick: () => filterByStatus("banned") },
  ];

  return (
    <AdminPanelLayout
      title="Kullanıcı Yönetimi"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        { label: "Kullanıcı Yönetimi" },
      ]}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Toplam Kullanıcı
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.totalUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Aktif Kullanıcı
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.activeUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserX className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Askıya Alınmış
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.suspendedUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Bu Ay Yeni
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.newUsersThisMonth}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <SearchBar
                  placeholder="Kullanıcı ara (isim, email, telefon)..."
                  onSearch={search}
                  value={searchQuery}
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                    showFilters
                      ? "bg-gray-100 text-gray-900"
                      : "bg-white text-gray-700"
                  } hover:bg-gray-50`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreler
                </button>

                <button
                  onClick={() => exportUsers("csv")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
                </button>

                <button
                  onClick={refresh}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Yenile
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={filter.onClick}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <FilterPanel
                filters={filterDefinitions}
                values={filters}
                onChange={updateFilters}
                onReset={clearFilters}
              />
            </div>
          )}

          {/* Bulk Actions */}
          {hasSelection && (
            <div className="p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCount} kullanıcı seçildi
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    Aktifleştir
                  </button>
                  <button
                    onClick={() => handleBulkAction("suspend")}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                  >
                    Askıya Al
                  </button>
                  <button
                    onClick={() => handleBulkAction("ban")}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Yasakla
                  </button>
                  <button
                    onClick={clearSelection}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Seçimi Temizle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            pagination={{
              page: pagination.page,
              pageSize: pagination.size,
              total: pagination.totalCount,
            }}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
            sorting={sorting || undefined}
            onSortingChange={updateSorting}
            emptyMessage="Kullanıcı bulunamadı"
          />
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser!}
        isOpen={showUserDetail && !!selectedUser}
        onClose={() => {
          setShowUserDetail(false);
          setSelectedUser(null);
        }}
        onUserUpdate={handleUserUpdate}
      />

      {/* User Edit Modal */}
      <UserEditForm
        user={selectedUser!}
        isOpen={showUserEdit && !!selectedUser}
        onClose={() => {
          setShowUserEdit(false);
          setSelectedUser(null);
        }}
        onUserUpdate={handleUserUpdate}
      />
    </AdminPanelLayout>
  );
};

export default UserManagement;
