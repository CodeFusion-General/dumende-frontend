import { useState, useEffect, useCallback } from "react";
import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminDocumentService } from "@/services/adminPanel/adminDocumentService";
import {
  AdminDocumentView,
  AdminDocumentFilter,
  AdminDocumentSort,
  AdminDocumentListResponse,
  AdminDocumentStats,
  DocumentVerificationUpdate,
  BulkDocumentOperation,
} from "@/types/adminDocument";
import { toast, useToast } from "@/hooks/use-toast";

export const useAdminDocumentManagement = () => {
  const queryClient = useQueryClient();
  const { toast: showToast } = useToast();

  // State for filters and pagination
  const [filter, setFilter] = useState<AdminDocumentFilter>({});
  const [sort, setSort] = useState<AdminDocumentSort>({
    field: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  // Query for documents list
  const {
    data: documentsResponse,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["admin-documents", filter, sort, currentPage, pageSize],
    queryFn: () =>
      adminDocumentService.getAllDocuments(filter, sort, currentPage, pageSize),
    keepPreviousData: true,
  });

  // Query for document statistics
  const {
    data: documentStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-document-stats"],
    queryFn: () => adminDocumentService.getDocumentStats(),
  });

  // Query for expired documents
  const { data: expiredDocuments, isLoading: isLoadingExpired } = useQuery({
    queryKey: ["admin-documents-expired"],
    queryFn: () => adminDocumentService.getExpiredDocuments(),
  });

  // Query for expiring soon documents
  const { data: expiringSoonDocuments, isLoading: isLoadingExpiringSoon } =
    useQuery({
      queryKey: ["admin-documents-expiring-soon"],
      queryFn: () => adminDocumentService.getExpiringSoonDocuments(),
    });

  // Query for pending documents
  const { data: pendingDocuments, isLoading: isLoadingPending } = useQuery({
    queryKey: ["admin-documents-pending"],
    queryFn: () => adminDocumentService.getPendingDocuments(),
  });

  // Mutation for updating document verification
  const updateVerificationMutation = useMutation({
    mutationFn: (update: DocumentVerificationUpdate) =>
      adminDocumentService.updateDocumentVerification(update),
    onSuccess: (updatedDocument) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-document-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-documents-pending"] });

      showToast({
        title: "Success",
        description: updatedDocument.isVerified
          ? "Belge başarıyla onaylandı"
          : "Belge reddedildi",
      });
    },
    onError: (error: any) => {
      showToast({
        title: "Error",
        description: error.response?.data?.message ||
          "Belge durumu güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Mutation for bulk operations
  const bulkOperationMutation = useMutation({
    mutationFn: (operation: BulkDocumentOperation) =>
      adminDocumentService.bulkDocumentOperation(operation),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-document-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-documents-pending"] });

      setSelectedDocuments([]);

      if (result.failed > 0) {
        showToast({
          title: "Partial Success",
          description: `${result.success} belge işlendi, ${result.failed} belge işlenemedi`,
        });
      } else {
        showToast({
          title: "Success",
          description: `${result.success} belge başarıyla işlendi`,
        });
      }
    },
    onError: (error: any) => {
      showToast({
        title: "Error",
        description: error.response?.data?.message || "Toplu işlem sırasında hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting document
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: number) =>
      adminDocumentService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-document-stats"] });
      showToast({
        title: "Success",
        description: "Belge başarıyla silindi",
      });
    },
    onError: (error: any) => {
      showToast({
        title: "Error",
        description: error.response?.data?.message || "Belge silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Mutation for requesting document reupload
  const requestReuploadMutation = useMutation({
    mutationFn: (request: {
      documentId: number;
      reason: string;
      deadline?: string;
    }) =>
      adminDocumentService.requestDocumentReupload({
        ...request,
        notifyOwner: true,
      }),
    onSuccess: () => {
      showToast({
        title: "Success",
        description: "Yeniden yükleme talebi gönderildi",
      });
    },
    onError: (error: any) => {
      showToast({
        title: "Error",
        description: error.response?.data?.message ||
          "Yeniden yükleme talebi gönderilirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Filter and search functions
  const updateFilter = useCallback(
    (newFilter: Partial<AdminDocumentFilter>) => {
      setFilter((prev) => ({ ...prev, ...newFilter }));
      setCurrentPage(1); // Reset to first page when filter changes
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  const updateSort = useCallback((newSort: AdminDocumentSort) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  const searchDocuments = useCallback(
    (searchTerm: string) => {
      updateFilter({ search: searchTerm });
    },
    [updateFilter]
  );

  // Selection functions
  const selectDocument = useCallback((documentId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  }, []);

  const selectAllDocuments = useCallback(() => {
    if (!documentsResponse?.documents) return;

    const allIds = documentsResponse.documents.map((doc) => doc.id);
    setSelectedDocuments(
      selectedDocuments.length === allIds.length ? [] : allIds
    );
  }, [documentsResponse?.documents, selectedDocuments.length]);

  const clearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  // Action functions
  const approveDocument = useCallback(
    (documentId: number, notes?: string) => {
      updateVerificationMutation.mutate({
        documentId,
        isVerified: true,
        verificationNotes: notes,
      });
    },
    [updateVerificationMutation]
  );

  const rejectDocument = useCallback(
    (documentId: number, notes: string) => {
      updateVerificationMutation.mutate({
        documentId,
        isVerified: false,
        verificationNotes: notes,
      });
    },
    [updateVerificationMutation]
  );

  const bulkApprove = useCallback(
    (notes?: string) => {
      if (selectedDocuments.length === 0) return;

      bulkOperationMutation.mutate({
        documentIds: selectedDocuments,
        operation: "approve",
        verificationNotes: notes,
      });
    },
    [selectedDocuments, bulkOperationMutation]
  );

  const bulkReject = useCallback(
    (notes: string) => {
      if (selectedDocuments.length === 0) return;

      bulkOperationMutation.mutate({
        documentIds: selectedDocuments,
        operation: "reject",
        verificationNotes: notes,
      });
    },
    [selectedDocuments, bulkOperationMutation]
  );

  const bulkDelete = useCallback(() => {
    if (selectedDocuments.length === 0) return;

    bulkOperationMutation.mutate({
      documentIds: selectedDocuments,
      operation: "delete",
    });
  }, [selectedDocuments, bulkOperationMutation]);

  const deleteDocument = useCallback(
    (documentId: number) => {
      deleteDocumentMutation.mutate(documentId);
    },
    [deleteDocumentMutation]
  );

  const requestReupload = useCallback(
    (documentId: number, reason: string, deadline?: string) => {
      requestReuploadMutation.mutate({ documentId, reason, deadline });
    },
    [requestReuploadMutation]
  );

  // Export function
  const exportDocuments = useCallback(
    async (format: "csv" | "excel" = "csv") => {
      try {
        const blob = await adminDocumentService.exportDocuments(filter, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `documents-export.${format === "csv" ? "csv" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Belgeler başarıyla dışa aktarıldı");
      } catch (error) {
        toast.error("Dışa aktarma sırasında hata oluştu");
      }
    },
    [filter]
  );

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    // Data
    documents: documentsResponse?.documents || [],
    pagination: documentsResponse?.pagination,
    documentStats,
    expiredDocuments: expiredDocuments || [],
    expiringSoonDocuments: expiringSoonDocuments || [],
    pendingDocuments: pendingDocuments || [],

    // Loading states
    isLoadingDocuments,
    isLoadingStats,
    isLoadingExpired,
    isLoadingExpiringSoon,
    isLoadingPending,

    // Mutation states
    isUpdatingVerification: updateVerificationMutation.isPending,
    isBulkOperating: bulkOperationMutation.isPending,
    isDeletingDocument: deleteDocumentMutation.isPending,
    isRequestingReupload: requestReuploadMutation.isPending,

    // Filter and sort state
    filter,
    sort,
    currentPage,
    pageSize,
    selectedDocuments,

    // Actions
    updateFilter,
    clearFilters,
    updateSort,
    searchDocuments,
    selectDocument,
    selectAllDocuments,
    clearSelection,
    approveDocument,
    rejectDocument,
    bulkApprove,
    bulkReject,
    bulkDelete,
    deleteDocument,
    requestReupload,
    exportDocuments,
    goToPage,
    changePageSize,
    refetchDocuments,
    refetchStats,

    // Errors
    documentsError,
  };
};
