import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBoatService } from "@/services/adminPanel/adminBoatService";
import {
  AdminBoatView,
  AdminBoatFilters,
  BoatApprovalCommand,
  BulkBoatAction,
  BoatStatistics,
  BoatDocumentManagement,
  BoatOwnerInfo,
  AdminBoatUpdateCommand,
  BoatManagementTab,
} from "@/types/adminBoat";
import { toast } from "react-hot-toast";

export interface UseAdminBoatManagementOptions {
  initialTab?: BoatManagementTab;
  pageSize?: number;
}

export const useAdminBoatManagement = (
  options: UseAdminBoatManagementOptions = {}
) => {
  const { initialTab = "all", pageSize = 20 } = options;
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState<BoatManagementTab>(initialTab);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<AdminBoatFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoats, setSelectedBoats] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("createdAt,desc");

  // Compute filters based on active tab
  const computedFilters = useMemo((): AdminBoatFilters => {
    const baseFilters = { ...filters };

    // Apply tab-specific filters
    switch (activeTab) {
      case "pending":
        baseFilters.approvalStatus = "pending";
        break;
      case "active":
        baseFilters.approvalStatus = "approved";
        break;
      case "rejected":
        baseFilters.approvalStatus = "rejected";
        break;
      case "all":
      default:
        // No additional filters for "all" tab
        break;
    }

    // Apply search query
    if (searchQuery.trim()) {
      // Search in boat name or owner name
      baseFilters.ownerName = searchQuery.trim();
    }

    return baseFilters;
  }, [activeTab, filters, searchQuery]);

  // Queries
  const {
    data: boatsData,
    isLoading: isLoadingBoats,
    error: boatsError,
    refetch: refetchBoats,
  } = useQuery({
    queryKey: ["admin-boats", computedFilters, currentPage, pageSize, sortBy],
    queryFn: () =>
      adminBoatService.getAdminBoats(
        computedFilters,
        currentPage,
        pageSize,
        sortBy
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["admin-boat-statistics"],
    queryFn: () => adminBoatService.getBoatStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutations
  const approveRejectMutation = useMutation({
    mutationFn: (command: BoatApprovalCommand) =>
      adminBoatService.approveRejectBoat(command),
    onSuccess: (updatedBoat, variables) => {
      const action = variables.approved ? "onaylandı" : "reddedildi";
      toast.success(`Tekne başarıyla ${action}`);

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["admin-boats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-boat-statistics"] });

      // Clear selection if the boat was selected
      setSelectedBoats((prev) => prev.filter((id) => id !== variables.boatId));
    },
    onError: (error: any) => {
      toast.error(error.message || "İşlem sırasında bir hata oluştu");
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (action: BulkBoatAction) =>
      adminBoatService.bulkApproveRejectBoats(action),
    onSuccess: (_, variables) => {
      const actionText =
        variables.action === "approve" ? "onaylandı" : "reddedildi";
      toast.success(
        `${variables.boatIds.length} tekne başarıyla ${actionText}`
      );

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["admin-boats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-boat-statistics"] });

      // Clear selection
      setSelectedBoats([]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Toplu işlem sırasında bir hata oluştu");
    },
  });

  const updateBoatMutation = useMutation({
    mutationFn: (command: AdminBoatUpdateCommand) =>
      adminBoatService.updateBoat(command),
    onSuccess: () => {
      toast.success("Tekne bilgileri güncellendi");
      queryClient.invalidateQueries({ queryKey: ["admin-boats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Güncelleme sırasında bir hata oluştu");
    },
  });

  // Action handlers
  const handleTabChange = useCallback((tab: BoatManagementTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSelectedBoats([]);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFiltersChange = useCallback((newFilters: AdminBoatFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setCurrentPage(0);
  }, []);

  const handleBoatSelection = useCallback(
    (boatId: number, selected: boolean) => {
      setSelectedBoats((prev) => {
        if (selected) {
          return [...prev, boatId];
        } else {
          return prev.filter((id) => id !== boatId);
        }
      });
    },
    []
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected && boatsData?.boats) {
        setSelectedBoats(boatsData.boats.map((boat) => boat.id));
      } else {
        setSelectedBoats([]);
      }
    },
    [boatsData?.boats]
  );

  const handleApproveBoat = useCallback(
    (boatId: number, reason?: string) => {
      approveRejectMutation.mutate({
        boatId,
        approved: true,
        reason,
      });
    },
    [approveRejectMutation]
  );

  const handleRejectBoat = useCallback(
    (boatId: number, reason: string) => {
      approveRejectMutation.mutate({
        boatId,
        approved: false,
        reason,
      });
    },
    [approveRejectMutation]
  );

  const handleBulkApprove = useCallback(
    (reason?: string) => {
      if (selectedBoats.length === 0) {
        toast.error("Lütfen en az bir tekne seçin");
        return;
      }

      bulkActionMutation.mutate({
        boatIds: selectedBoats,
        action: "approve",
        reason,
      });
    },
    [selectedBoats, bulkActionMutation]
  );

  const handleBulkReject = useCallback(
    (reason: string) => {
      if (selectedBoats.length === 0) {
        toast.error("Lütfen en az bir tekne seçin");
        return;
      }

      bulkActionMutation.mutate({
        boatIds: selectedBoats,
        action: "reject",
        reason,
      });
    },
    [selectedBoats, bulkActionMutation]
  );

  const handleUpdateBoat = useCallback(
    (command: AdminBoatUpdateCommand) => {
      updateBoatMutation.mutate(command);
    },
    [updateBoatMutation]
  );

  // Get boat document management
  const getBoatDocuments = useCallback(
    async (boatId: number): Promise<BoatDocumentManagement> => {
      return adminBoatService.getBoatDocumentManagement(boatId);
    },
    []
  );

  // Get boat owner info
  const getBoatOwnerInfo = useCallback(
    async (ownerId: number): Promise<BoatOwnerInfo> => {
      return adminBoatService.getBoatOwnerInfo(ownerId);
    },
    []
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setCurrentPage(0);
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    refetchBoats();
    queryClient.invalidateQueries({ queryKey: ["admin-boat-statistics"] });
  }, [refetchBoats, queryClient]);

  // Computed values
  const boats = boatsData?.boats || [];
  const totalCount = boatsData?.totalCount || 0;
  const totalPages = boatsData?.totalPages || 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;
  const isAllSelected =
    selectedBoats.length > 0 && selectedBoats.length === boats.length;
  const isPartiallySelected =
    selectedBoats.length > 0 && selectedBoats.length < boats.length;

  // Loading states
  const isLoading = isLoadingBoats || isLoadingStats;
  const isProcessing =
    approveRejectMutation.isPending ||
    bulkActionMutation.isPending ||
    updateBoatMutation.isPending;

  // Error handling
  const error = boatsError || statsError;

  return {
    // Data
    boats,
    statistics,
    totalCount,
    totalPages,
    currentPage,

    // State
    activeTab,
    filters: computedFilters,
    searchQuery,
    selectedBoats,
    sortBy,

    // Computed
    hasNextPage,
    hasPreviousPage,
    isAllSelected,
    isPartiallySelected,

    // Loading states
    isLoading,
    isProcessing,
    error,

    // Actions
    handleTabChange,
    handlePageChange,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
    handleBoatSelection,
    handleSelectAll,
    handleApproveBoat,
    handleRejectBoat,
    handleBulkApprove,
    handleBulkReject,
    handleUpdateBoat,
    resetFilters,
    refreshData,

    // Async actions
    getBoatDocuments,
    getBoatOwnerInfo,
  };
};
