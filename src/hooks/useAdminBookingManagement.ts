import { useState, useEffect, useCallback } from "react";
import { adminBookingService } from "@/services/adminPanel/adminBookingService";
import {
  AdminBookingView,
  AdminBookingFilters,
  AdminBookingStatistics,
  AdminBookingAction,
  AdminBulkBookingOperation,
} from "@/types/adminBooking";
import { BookingStatus, PaymentStatus } from "@/types/booking.types";

export interface UseAdminBookingManagementReturn {
  // Data
  bookings: AdminBookingView[];
  statistics: AdminBookingStatistics | null;
  selectedBooking: AdminBookingView | null;

  // Loading states
  loading: boolean;
  statisticsLoading: boolean;
  actionLoading: boolean;

  // Error states
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;

  // Filters
  filters: AdminBookingFilters;

  // Selection
  selectedBookingIds: number[];

  // Actions
  loadBookings: () => Promise<void>;
  loadStatistics: (dateRange?: {
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  setFilters: (filters: AdminBookingFilters) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  selectBooking: (booking: AdminBookingView) => void;
  clearSelection: () => void;
  toggleBookingSelection: (bookingId: number) => void;
  selectAllBookings: () => void;
  clearAllSelections: () => void;
  performAction: (action: AdminBookingAction) => Promise<void>;
  performBulkOperation: (operation: AdminBulkBookingOperation) => Promise<void>;
  exportBookings: (format: "csv" | "excel" | "pdf") => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAdminBookingManagement =
  (): UseAdminBookingManagementReturn => {
    // State
    const [bookings, setBookings] = useState<AdminBookingView[]>([]);
    const [statistics, setStatistics] = useState<AdminBookingStatistics | null>(
      null
    );
    const [selectedBooking, setSelectedBooking] =
      useState<AdminBookingView | null>(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // Filters
    const [filters, setFilters] = useState<AdminBookingFilters>({});

    // Selection
    const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);

    // Load bookings
    const loadBookings = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await adminBookingService.getAllBookings(
          filters,
          currentPage,
          pageSize
        );

        setBookings(response.bookings);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load bookings";
        setError(errorMessage);
        console.error("Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    }, [filters, currentPage, pageSize]);

    // Load statistics
    const loadStatistics = useCallback(
      async (dateRange?: { startDate: string; endDate: string }) => {
        try {
          setStatisticsLoading(true);
          const stats = await adminBookingService.getBookingStatistics(
            dateRange
          );
          setStatistics(stats);
        } catch (err) {
          console.error("Error loading statistics:", err);
        } finally {
          setStatisticsLoading(false);
        }
      },
      []
    );

    // Set filters and reset page
    const handleSetFilters = useCallback((newFilters: AdminBookingFilters) => {
      setFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filters change
    }, []);

    // Set page
    const setPage = useCallback((page: number) => {
      setCurrentPage(page);
    }, []);

    // Set page size
    const handleSetPageSize = useCallback((size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }, []);

    // Select booking
    const selectBooking = useCallback((booking: AdminBookingView) => {
      setSelectedBooking(booking);
    }, []);

    // Clear selection
    const clearSelection = useCallback(() => {
      setSelectedBooking(null);
    }, []);

    // Toggle booking selection
    const toggleBookingSelection = useCallback((bookingId: number) => {
      setSelectedBookingIds((prev) => {
        if (prev.includes(bookingId)) {
          return prev.filter((id) => id !== bookingId);
        } else {
          return [...prev, bookingId];
        }
      });
    }, []);

    // Select all bookings
    const selectAllBookings = useCallback(() => {
      const allIds = bookings.map((booking) => booking.id);
      setSelectedBookingIds(allIds);
    }, [bookings]);

    // Clear all selections
    const clearAllSelections = useCallback(() => {
      setSelectedBookingIds([]);
    }, []);

    // Perform action
    const performAction = useCallback(
      async (action: AdminBookingAction) => {
        try {
          setActionLoading(true);
          setError(null);

          await adminBookingService.performBookingAction(action);

          // Refresh data after action
          await loadBookings();

          // Clear selection if action was performed on selected booking
          if (selectedBooking && selectedBooking.id === action.bookingId) {
            setSelectedBooking(null);
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to perform action";
          setError(errorMessage);
          console.error("Error performing action:", err);
        } finally {
          setActionLoading(false);
        }
      },
      [loadBookings, selectedBooking]
    );

    // Perform bulk operation
    const performBulkOperation = useCallback(
      async (operation: AdminBulkBookingOperation) => {
        try {
          setActionLoading(true);
          setError(null);

          await adminBookingService.performBulkOperation(operation);

          // Refresh data after operation
          await loadBookings();

          // Clear selections
          setSelectedBookingIds([]);
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to perform bulk operation";
          setError(errorMessage);
          console.error("Error performing bulk operation:", err);
        } finally {
          setActionLoading(false);
        }
      },
      [loadBookings]
    );

    // Export bookings
    const exportBookings = useCallback(
      async (format: "csv" | "excel" | "pdf") => {
        try {
          setActionLoading(true);
          setError(null);

          const blob = await adminBookingService.exportBookings({
            format,
            filters,
            columns: [
              "id",
              "customerName",
              "customerEmail",
              "boatName",
              "tourName",
              "startDate",
              "endDate",
              "status",
              "totalPrice",
              "paymentStatus",
            ],
            includePaymentDetails: true,
            includeCustomerDetails: true,
            includeNotes: false,
          });

          // Download the file
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `bookings-export-${
            new Date().toISOString().split("T")[0]
          }.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to export bookings";
          setError(errorMessage);
          console.error("Error exporting bookings:", err);
        } finally {
          setActionLoading(false);
        }
      },
      [filters]
    );

    // Refresh data
    const refreshData = useCallback(async () => {
      await Promise.all([loadBookings(), loadStatistics()]);
    }, [loadBookings, loadStatistics]);

    // Load initial data
    useEffect(() => {
      loadBookings();
    }, [loadBookings]);

    // Load statistics on mount
    useEffect(() => {
      loadStatistics();
    }, [loadStatistics]);

    return {
      // Data
      bookings,
      statistics,
      selectedBooking,

      // Loading states
      loading,
      statisticsLoading,
      actionLoading,

      // Error state
      error,

      // Pagination
      currentPage,
      totalPages,
      totalElements,
      pageSize,

      // Filters
      filters,

      // Selection
      selectedBookingIds,

      // Actions
      loadBookings,
      loadStatistics,
      setFilters: handleSetFilters,
      setPage,
      setPageSize: handleSetPageSize,
      selectBooking,
      clearSelection,
      toggleBookingSelection,
      selectAllBookings,
      clearAllSelections,
      performAction,
      performBulkOperation,
      exportBookings,
      refreshData,
    };
  };
