import { useState, useEffect, useCallback } from "react";
import { adminTourService } from "@/services/adminPanel/adminTourService";
import {
  AdminTourView,
  AdminTourFilters,
  AdminTourStats,
  TourBulkOperation,
  TourApprovalRequest,
  AdminTourSearchOptions,
} from "@/types/adminTour";
import { TourStatus } from "@/types/tour.types";

interface UseAdminTourManagementReturn {
  // Data
  tours: AdminTourView[];
  selectedTour: AdminTourView | null;
  stats: AdminTourStats | null;

  // Loading states
  loading: boolean;
  loadingStats: boolean;
  loadingTour: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;

  // Filters and search
  filters: AdminTourFilters;
  searchQuery: string;
  sortBy: string;
  sortOrder: "asc" | "desc";

  // Actions
  loadTours: (options?: AdminTourSearchOptions) => Promise<void>;
  loadTourById: (id: number) => Promise<void>;
  loadStats: () => Promise<void>;
  setFilters: (filters: AdminTourFilters) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
  setPage: (page: number) => void;

  // Tour operations
  approveTour: (request: TourApprovalRequest) => Promise<void>;
  rejectTour: (request: TourApprovalRequest) => Promise<void>;
  suspendTour: (tourId: number, reason?: string) => Promise<void>;
  activateTour: (tourId: number, note?: string) => Promise<void>;
  performBulkOperation: (operation: TourBulkOperation) => Promise<void>;

  // Document verification
  verifyTourDocument: (
    documentId: number,
    status: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;
  bulkVerifyTourDocuments: (
    documentIds: number[],
    status: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;

  // Selection
  selectedTourIds: number[];
  setSelectedTourIds: (ids: number[]) => void;
  selectAllTours: () => void;
  clearSelection: () => void;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useAdminTourManagement = (): UseAdminTourManagementReturn => {
  // State
  const [tours, setTours] = useState<AdminTourView[]>([]);
  const [selectedTour, setSelectedTour] = useState<AdminTourView | null>(null);
  const [stats, setStats] = useState<AdminTourStats | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTour, setLoadingTour] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  // Filters and search
  const [filters, setFilters] = useState<AdminTourFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection
  const [selectedTourIds, setSelectedTourIds] = useState<number[]>([]);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Load tours with current filters and pagination
  const loadTours = useCallback(
    async (options?: AdminTourSearchOptions) => {
      try {
        setLoading(true);
        setError(null);

        const searchOptions: AdminTourSearchOptions = {
          query: searchQuery,
          filters,
          sortBy,
          sortOrder,
          page: currentPage,
          limit: pageSize,
          ...options,
        };

        const result = await adminTourService.getAdminTours(searchOptions);

        setTours(result.tours);
        setTotalCount(result.total);
        setTotalPages(Math.ceil(result.total / result.limit));
      } catch (err) {
        console.error("Error loading tours:", err);
        setError(err instanceof Error ? err.message : "Failed to load tours");
      } finally {
        setLoading(false);
      }
    },
    [filters, searchQuery, sortBy, sortOrder, currentPage, pageSize]
  );

  // Load single tour by ID
  const loadTourById = useCallback(async (id: number) => {
    try {
      setLoadingTour(true);
      setError(null);

      const tour = await adminTourService.getAdminTour(id);
      setSelectedTour(tour);
    } catch (err) {
      console.error("Error loading tour:", err);
      setError(err instanceof Error ? err.message : "Failed to load tour");
    } finally {
      setLoadingTour(false);
    }
  }, []);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setError(null);

      const tourStats = await adminTourService.getTourStats();
      setStats(tourStats);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Tour operations
  const approveTour = useCallback(
    async (request: TourApprovalRequest) => {
      try {
        setError(null);
        await adminTourService.approveTour(request);

        // Refresh tours and selected tour
        await loadTours();
        if (selectedTour?.id === request.tourId) {
          await loadTourById(request.tourId);
        }
      } catch (err) {
        console.error("Error approving tour:", err);
        setError(err instanceof Error ? err.message : "Failed to approve tour");
        throw err;
      }
    },
    [loadTours, selectedTour, loadTourById]
  );

  const rejectTour = useCallback(
    async (request: TourApprovalRequest) => {
      try {
        setError(null);
        await adminTourService.rejectTour(request);

        // Refresh tours and selected tour
        await loadTours();
        if (selectedTour?.id === request.tourId) {
          await loadTourById(request.tourId);
        }
      } catch (err) {
        console.error("Error rejecting tour:", err);
        setError(err instanceof Error ? err.message : "Failed to reject tour");
        throw err;
      }
    },
    [loadTours, selectedTour, loadTourById]
  );

  const suspendTour = useCallback(
    async (tourId: number, reason?: string) => {
      try {
        setError(null);
        await adminTourService.suspendTour(tourId, reason);

        // Refresh tours and selected tour
        await loadTours();
        if (selectedTour?.id === tourId) {
          await loadTourById(tourId);
        }
      } catch (err) {
        console.error("Error suspending tour:", err);
        setError(err instanceof Error ? err.message : "Failed to suspend tour");
        throw err;
      }
    },
    [loadTours, selectedTour, loadTourById]
  );

  const activateTour = useCallback(
    async (tourId: number, note?: string) => {
      try {
        setError(null);
        await adminTourService.activateTour(tourId, note);

        // Refresh tours and selected tour
        await loadTours();
        if (selectedTour?.id === tourId) {
          await loadTourById(tourId);
        }
      } catch (err) {
        console.error("Error activating tour:", err);
        setError(
          err instanceof Error ? err.message : "Failed to activate tour"
        );
        throw err;
      }
    },
    [loadTours, selectedTour, loadTourById]
  );

  const performBulkOperation = useCallback(
    async (operation: TourBulkOperation) => {
      try {
        setError(null);
        await adminTourService.performBulkOperation(operation);

        // Clear selection and refresh tours
        setSelectedTourIds([]);
        await loadTours();
      } catch (err) {
        console.error("Error performing bulk operation:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to perform bulk operation"
        );
        throw err;
      }
    },
    [loadTours]
  );

  // Document verification operations
  const verifyTourDocument = useCallback(
    async (
      documentId: number,
      status: "verified" | "rejected",
      reason?: string
    ) => {
      try {
        setError(null);
        await adminTourService.verifyTourDocument(documentId, status, reason);

        // Refresh selected tour if it's loaded
        if (selectedTour) {
          await loadTourById(selectedTour.id);
        }
      } catch (err) {
        console.error("Error verifying document:", err);
        setError(
          err instanceof Error ? err.message : "Failed to verify document"
        );
        throw err;
      }
    },
    [selectedTour, loadTourById]
  );

  const bulkVerifyTourDocuments = useCallback(
    async (
      documentIds: number[],
      status: "verified" | "rejected",
      reason?: string
    ) => {
      try {
        setError(null);
        await adminTourService.bulkVerifyTourDocuments(
          documentIds,
          status,
          reason
        );

        // Refresh selected tour if it's loaded
        if (selectedTour) {
          await loadTourById(selectedTour.id);
        }
      } catch (err) {
        console.error("Error bulk verifying documents:", err);
        setError(
          err instanceof Error ? err.message : "Failed to bulk verify documents"
        );
        throw err;
      }
    },
    [selectedTour, loadTourById]
  );

  // Filter and search handlers
  const handleSetFilters = useCallback((newFilters: AdminTourFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  const handleSetSorting = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc") => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setCurrentPage(1); // Reset to first page when sorting changes
    },
    []
  );

  const handleSetPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Selection handlers
  const selectAllTours = useCallback(() => {
    setSelectedTourIds(tours.map((tour) => tour.id));
  }, [tours]);

  const clearSelection = useCallback(() => {
    setSelectedTourIds([]);
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load tours when dependencies change
  useEffect(() => {
    loadTours();
  }, [loadTours]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    // Data
    tours,
    selectedTour,
    stats,

    // Loading states
    loading,
    loadingStats,
    loadingTour,

    // Pagination
    currentPage,
    totalPages,
    totalCount,

    // Filters and search
    filters,
    searchQuery,
    sortBy,
    sortOrder,

    // Actions
    loadTours,
    loadTourById,
    loadStats,
    setFilters: handleSetFilters,
    setSearchQuery: handleSetSearchQuery,
    setSorting: handleSetSorting,
    setPage: handleSetPage,

    // Tour operations
    approveTour,
    rejectTour,
    suspendTour,
    activateTour,
    performBulkOperation,

    // Document verification
    verifyTourDocument,
    bulkVerifyTourDocuments,

    // Selection
    selectedTourIds,
    setSelectedTourIds,
    selectAllTours,
    clearSelection,

    // Error handling
    error,
    clearError,
  };
};
