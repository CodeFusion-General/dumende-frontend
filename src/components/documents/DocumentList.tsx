import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Filter,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DocumentLoadingSkeleton,
  EmptyState,
  LoadingOverlay,
} from "@/components/ui/loading-states";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BoatDocumentDTO,
  TourDocumentDTO,
  DocumentFilterOptions,
  DocumentSortOptions,
} from "@/types/document.types";
import { documentService } from "@/services/documentService";
import LazyDocumentCard from "./LazyDocumentCard";
import { cn } from "@/lib/utils";

interface DocumentListProps<T extends BoatDocumentDTO | TourDocumentDTO> {
  documents: T[];
  onDelete: (documentId: number) => Promise<void>;
  onReorder: (documents: T[]) => Promise<void>;
  onEdit?: (document: T) => void;
  onVerificationUpdate?: (document: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  entityType: "boat" | "tour";
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  enableReordering?: boolean;
}

const DocumentList = <T extends BoatDocumentDTO | TourDocumentDTO>({
  documents,
  onDelete,
  onReorder,
  onEdit,
  onVerificationUpdate,
  loading = false,
  emptyMessage,
  className,
  entityType,
  showFilters = true,
  showSearch = true,
  showSort = true,
  enableReordering = true,
}: DocumentListProps<T>) => {
  const { t } = useTranslation();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<DocumentFilterOptions>({});
  const [sortOptions, setSortOptions] = useState<DocumentSortOptions>({
    field: "displayOrder",
    direction: "asc",
  });
  const [isReordering, setIsReordering] = useState(false);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.documentName.toLowerCase().includes(searchLower) ||
          doc.documentType.toLowerCase().includes(searchLower) ||
          doc.verificationNotes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.documentType) {
      filtered = filtered.filter(
        (doc) => doc.documentType === filters.documentType
      );
    }

    if (filters.isVerified !== undefined) {
      filtered = filtered.filter(
        (doc) => doc.isVerified === filters.isVerified
      );
    }

    if (filters.isExpired !== undefined) {
      filtered = filtered.filter((doc) => {
        const isExpired = documentService.isDocumentExpired(doc.expiryDate);
        return isExpired === filters.isExpired;
      });
    }

    if (filters.isExpiringSoon !== undefined) {
      filtered = filtered.filter((doc) => {
        const isExpiringSoon = documentService.isDocumentExpiringSoon(
          doc.expiryDate
        );
        return isExpiringSoon === filters.isExpiringSoon;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case "expiryDate":
          aValue = a.expiryDate
            ? new Date(a.expiryDate)
            : new Date("9999-12-31");
          bValue = b.expiryDate
            ? new Date(b.expiryDate)
            : new Date("9999-12-31");
          break;
        case "documentName":
          aValue = a.documentName.toLowerCase();
          bValue = b.documentName.toLowerCase();
          break;
        case "displayOrder":
        default:
          aValue = a.displayOrder;
          bValue = b.displayOrder;
          break;
      }

      if (aValue < bValue) return sortOptions.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, searchTerm, filters, sortOptions]);

  // Handle drag end for reordering
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || !enableReordering) return;

      const items = Array.from(filteredAndSortedDocuments);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update display order
      const updatedItems = items.map((item, index) => ({
        ...item,
        displayOrder: index + 1,
      }));

      setIsReordering(true);
      try {
        await onReorder(updatedItems as T[]);
      } catch (error) {
        console.error("Error reordering documents:", error);
      } finally {
        setIsReordering(false);
      }
    },
    [filteredAndSortedDocuments, onReorder, enableReordering]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof DocumentFilterOptions, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
      }));
    },
    []
  );

  // Handle sort changes
  const handleSortChange = useCallback(
    (field: DocumentSortOptions["field"]) => {
      setSortOptions((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({});
    setSortOptions({ field: "displayOrder", direction: "asc" });
  }, []);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (filters.documentType) count++;
    if (filters.isVerified !== undefined) count++;
    if (filters.isExpired !== undefined) count++;
    if (filters.isExpiringSoon !== undefined) count++;
    return count;
  }, [searchTerm, filters]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <DocumentLoadingSkeleton count={3} />
      </div>
    );
  }

  // Empty state
  if (!loading && documents.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title={t("documents.empty.title", "No documents uploaded")}
          description={
            emptyMessage ||
            t(
              "documents.empty.description",
              "Upload your first document to get started."
            )
          }
          action={
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Upload className="h-4 w-4" />
              <span>
                {t(
                  "documents.empty.hint",
                  "Use the upload form above to add documents"
                )}
              </span>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Search */}
      {(showFilters || showSearch || showSort) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {t("documents.list.title", "Documents")}
                {documents.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredAndSortedDocuments.length} / {documents.length}
                  </Badge>
                )}
              </CardTitle>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t("documents.filters.clear", "Clear filters")} (
                  {activeFilterCount})
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t(
                    "documents.search.placeholder",
                    "Search documents..."
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4">
              {/* Document Type Filter */}
              {showFilters && (
                <Select
                  value={filters.documentType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("documentType", value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue
                      placeholder={t(
                        "documents.filters.documentType",
                        "Document Type"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("documents.filters.allTypes", "All Types")}
                    </SelectItem>
                    {/* Add document type options based on entityType */}
                  </SelectContent>
                </Select>
              )}

              {/* Verification Status Filter */}
              {showFilters && (
                <Select
                  value={
                    filters.isVerified === undefined
                      ? "all"
                      : filters.isVerified
                      ? "verified"
                      : "unverified"
                  }
                  onValueChange={(value) =>
                    handleFilterChange(
                      "isVerified",
                      value === "all" ? undefined : value === "verified"
                    )
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue
                      placeholder={t(
                        "documents.filters.verification",
                        "Verification"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("documents.filters.allStatuses", "All Statuses")}
                    </SelectItem>
                    <SelectItem value="verified">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {t("documents.status.verified", "Verified")}
                      </div>
                    </SelectItem>
                    <SelectItem value="unverified">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        {t("documents.status.pending", "Pending")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Expiry Status Filter */}
              {showFilters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {t("documents.filters.expiry", "Expiry Status")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>
                      {t("documents.filters.expiry", "Expiry Status")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("isExpired", undefined)}
                    >
                      {t("documents.filters.allExpiry", "All Documents")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("isExpired", true)}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        {t("documents.status.expired", "Expired")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange("isExpiringSoon", true)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        {t("documents.status.expiringSoon", "Expiring Soon")}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Sort Options */}
              {showSort && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {sortOptions.direction === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                      {t("documents.sort.label", "Sort")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>
                      {t("documents.sort.label", "Sort by")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleSortChange("displayOrder")}
                    >
                      {t("documents.sort.order", "Display Order")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange("documentName")}
                    >
                      {t("documents.sort.name", "Name")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange("createdAt")}
                    >
                      {t("documents.sort.uploadDate", "Upload Date")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange("expiryDate")}
                    >
                      {t("documents.sort.expiryDate", "Expiry Date")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      {filteredAndSortedDocuments.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title={t("documents.noResults.title", "No documents found")}
          description={t(
            "documents.noResults.description",
            "Try adjusting your search or filters."
          )}
        />
      ) : (
        <LoadingOverlay
          isLoading={isReordering}
          loadingComponent={
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">
                {t("documents.reordering", "Updating document order...")}
              </p>
            </div>
          }
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="documents"
              isDropDisabled={!enableReordering || isReordering}
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "space-y-4",
                    snapshot.isDraggingOver &&
                      enableReordering &&
                      "bg-blue-50 rounded-lg p-2"
                  )}
                >
                  {filteredAndSortedDocuments.map((document, index) => (
                    <Draggable
                      key={document.id}
                      draggableId={document.id.toString()}
                      index={index}
                      isDragDisabled={!enableReordering || isReordering}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            snapshot.isDragging && "rotate-2 shadow-lg",
                            !enableReordering && "cursor-default"
                          )}
                        >
                          <LazyDocumentCard
                            document={document}
                            onDelete={() => onDelete(document.id)}
                            onEdit={onEdit ? () => onEdit(document) : undefined}
                            onVerificationUpdate={onVerificationUpdate}
                            entityType={entityType}
                            showVerificationStatus
                            showExpiryWarning
                            threshold={0.1}
                            rootMargin="50px"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </LoadingOverlay>
      )}
    </div>
  );
};

export default DocumentList;
