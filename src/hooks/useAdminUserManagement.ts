import { useState, useEffect, useCallback } from "react";
import { adminUserService } from "@/services/adminPanel/adminUserService";
import {
  AdminUserView,
  AdminUserFilters,
  AdminUserSearchResult,
  UserStatistics,
  AdminUserAction,
  BulkUserAction,
} from "@/types/adminUser";
import { UserType } from "@/types/auth.types";
import { SortingConfig } from "@/components/admin/ui/DataTable";

interface UseAdminUserManagementOptions {
  initialFilters?: AdminUserFilters;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAdminUserManagement = (
  options: UseAdminUserManagementOptions = {}
) => {
  const {
    initialFilters = {},
    pageSize = 20,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  // State
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminUserFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 0,
    size: pageSize,
    totalCount: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [sorting, setSorting] = useState<SortingConfig | null>(null);

  // Load users
  const loadUsers = useCallback(
    async (resetPage = false) => {
      setLoading(true);
      setError(null);

      try {
        const currentPage = resetPage ? 0 : pagination.page;
        const searchFilters = {
          ...filters,
          page: currentPage,
          size: pagination.size,
          sort: sorting ? `${sorting.field},${sorting.direction}` : undefined,
        };

        let result: AdminUserSearchResult;

        if (searchQuery.trim()) {
          // Use search if query exists
          const searchResults = await adminUserService.searchUsers({
            ...filters,
            query: searchQuery,
          });
          result = {
            users: searchResults,
            totalCount: searchResults.length,
            page: currentPage,
            size: pagination.size,
            totalPages: Math.ceil(searchResults.length / pagination.size),
          };
        } else {
          // Use real admin users endpoint
          result = await adminUserService.getAdminUsers(searchFilters);
        }

        setUsers(result.users);
        setPagination({
          page: result.page,
          size: result.size,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, searchQuery, pagination.page, pagination.size, sorting]
  );

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await adminUserService.getUserStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error("Error loading user statistics:", err);
      setStatistics({
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        bannedUsers: 0,
        newUsersThisMonth: 0,
        usersByRole: { customers: 0, boatOwners: 0, admins: 0 },
        verificationStats: { verified: 0, pending: 0, rejected: 0 },
      });
    }
  }, []);

  // Filter functions
  const updateFilters = useCallback((newFilters: Partial<AdminUserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setSorting(null);
  }, []);

  const filterByRole = useCallback(
    (role: UserType | "all") => {
      if (role === "all") {
        updateFilters({ role: undefined });
      } else {
        updateFilters({ role });
      }
    },
    [updateFilters]
  );

  const filterByStatus = useCallback(
    (status: "active" | "suspended" | "banned" | "all") => {
      if (status === "all") {
        updateFilters({ status: undefined });
      } else {
        updateFilters({ status });
      }
    },
    [updateFilters]
  );

  // Search function
  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, size, page: 0 }));
  }, []);

  // Sorting function
  const updateSorting = useCallback((newSorting: SortingConfig) => {
    setSorting(newSorting);
  }, []);

  // Selection functions
  const selectUser = useCallback((userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(users.map((user) => user.id));
  }, [users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  // User actions
  const performUserAction = useCallback(
    async (action: AdminUserAction) => {
      try {
        setLoading(true);
        await adminUserService.performUserAction(action);
        await loadUsers(); // Refresh the list
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to perform action"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadUsers]
  );

  const performBulkAction = useCallback(
    async (action: Omit<BulkUserAction, "userIds">) => {
      if (selectedUsers.length === 0) {
        setError("No users selected");
        return false;
      }

      try {
        setLoading(true);
        await adminUserService.performBulkAction({
          ...action,
          userIds: selectedUsers,
        });
        await loadUsers(); // Refresh the list
        clearSelection(); // Clear selection after action
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to perform bulk action"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedUsers, loadUsers, clearSelection]
  );

  // Refresh function
  const refresh = useCallback(() => {
    loadUsers();
    loadStatistics();
  }, [loadUsers, loadStatistics]);

  // Export function
  const exportUsers = useCallback(
    async (format: "csv" | "excel" = "csv") => {
      try {
        const blob = await adminUserService.exportUsers(filters, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to export users");
      }
    },
    [filters]
  );

  // Effects
  useEffect(() => {
    loadUsers(true); // Reset page when filters/sorting change
  }, [filters, searchQuery, sorting]);

  useEffect(() => {
    loadUsers(); // Don't reset page when pagination changes
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    // Data
    users,
    statistics,
    selectedUsers,

    // State
    loading,
    error,
    filters,
    searchQuery,
    pagination,
    sorting,

    // Actions
    loadUsers,
    updateFilters,
    clearFilters,
    filterByRole,
    filterByStatus,
    search,
    goToPage,
    changePageSize,
    updateSorting,
    selectUser,
    selectAllUsers,
    clearSelection,
    performUserAction,
    performBulkAction,
    refresh,
    exportUsers,

    // Computed
    hasSelection: selectedUsers.length > 0,
    selectedCount: selectedUsers.length,
    isAllSelected: selectedUsers.length === users.length && users.length > 0,
  };
};
