import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PaginationNav as Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Download,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

export interface SortingConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface SelectionConfig {
  enabled: boolean;
  selectedRows: string[];
  onSelectionChange: (selectedRows: string[]) => void;
  getRowId: (row: any) => string;
}

export interface ActionConfig<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface BulkActionConfig {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: string[]) => void;
  variant?: "default" | "destructive" | "outline";
  disabled?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sorting?: SortingConfig;
  onSortingChange?: (sorting: SortingConfig) => void;
  selection?: SelectionConfig;
  actions?: ActionConfig<T>[];
  bulkActions?: BulkActionConfig[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  showExport?: boolean;
  onExport?: () => void;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSortingChange,
  selection,
  actions,
  bulkActions,
  onRowClick,
  emptyMessage = "Veri bulunamadı",
  className,
  showExport = false,
  onExport,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Handle sorting
  const handleSort = useCallback(
    (field: string) => {
      if (!onSortingChange) return;

      const newDirection =
        sorting?.field === field && sorting.direction === "asc"
          ? "desc"
          : "asc";
      onSortingChange({ field, direction: newDirection });
    },
    [sorting, onSortingChange]
  );

  // Handle row selection
  const handleRowSelection = useCallback(
    (rowId: string, checked: boolean) => {
      if (!selection) return;

      const newSelection = checked
        ? [...selection.selectedRows, rowId]
        : selection.selectedRows.filter((id) => id !== rowId);

      selection.onSelectionChange(newSelection);
    },
    [selection]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!selection) return;

      const newSelection = checked
        ? data.map((row) => selection.getRowId(row))
        : [];

      selection.onSelectionChange(newSelection);
    },
    [selection, data]
  );

  // Check if all rows are selected
  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return data.every((row) =>
      selection.selectedRows.includes(selection.getRowId(row))
    );
  }, [selection, data]);

  // Check if some rows are selected
  const isSomeSelected = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return (
      selection.selectedRows.length > 0 &&
      selection.selectedRows.length < data.length
    );
  }, [selection, data]);

  // Render cell content
  const renderCell = useCallback(
    (column: ColumnDef<T>, row: T, index: number) => {
      const value =
        typeof column.key === "string" ? (row as any)[column.key] : column.key;

      if (column.render) {
        return column.render(value, row, index);
      }

      return value?.toString() || "";
    },
    []
  );

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pageSize, total } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    // page is 0-indexed from backend, display as 1-indexed
    const currentPage = page + 1;
    const startItem = page * pageSize + 1;
    const endItem = Math.min((page + 1) * pageSize, total);

    // Calculate which page numbers to show
    const getPageNumbers = () => {
      const pages: (number | 'ellipsis')[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
          pages.push('ellipsis');
        }

        // Show pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (currentPage < totalPages - 2) {
          pages.push('ellipsis');
        }

        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? (
            <>
              {startItem}-{endItem} / {total} kayıt gösteriliyor
            </>
          ) : (
            "Kayıt bulunamadı"
          )}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1 && onPageChange) {
                      onPageChange(page - 1); // 0-indexed
                    }
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === 'ellipsis') {
                  return (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <span className="px-3 py-2">...</span>
                    </PaginationItem>
                  );
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onPageChange) {
                          onPageChange(pageNum - 1); // Convert to 0-indexed
                        }
                      }}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages && onPageChange) {
                      onPageChange(page + 1); // 0-indexed
                    }
                  }}
                  className={
                    currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bulk Actions Bar */}
      {selection && selection.selectedRows.length > 0 && bulkActions && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selection.selectedRows.length} kayıt seçildi
          </span>
          <div className="flex gap-2 ml-auto">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(selection.selectedRows)}
                disabled={action.disabled}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      {showExport && onExport && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Selection Column */}
              {selection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Tümünü seç"
                  />
                </TableHead>
              )}

              {/* Data Columns */}
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.className,
                    column.sortable && "cursor-pointer hover:bg-muted/50",
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() =>
                    column.sortable && handleSort(column.key as string)
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            "h-3 w-3",
                            sorting?.field === column.key &&
                              sorting.direction === "asc"
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 -mt-1",
                            sorting?.field === column.key &&
                              sorting.direction === "desc"
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}

              {/* Actions Column */}
              {actions && actions.length > 0 && (
                <TableHead className="w-20">Eylemler</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selection ? 1 : 0) +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selection ? 1 : 0) +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = selection?.getRowId(row) || rowIndex.toString();
                const isSelected =
                  selection?.selectedRows.includes(rowId) || false;

                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      "cursor-pointer",
                      isSelected && "bg-muted/50",
                      hoveredRow === rowIndex && "bg-muted/30"
                    )}
                    onClick={() => onRowClick?.(row)}
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Selection Cell */}
                    {selection && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleRowSelection(rowId, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Satır ${rowIndex + 1}'i seç`}
                        />
                      </TableCell>
                    )}

                    {/* Data Cells */}
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {renderCell(column, row, rowIndex)}
                      </TableCell>
                    ))}

                    {/* Actions Cell */}
                    {actions && actions.length > 0 && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {actions
                            .filter((action) => !action.hidden?.(row))
                            .map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                disabled={action.disabled?.(row)}
                                className="h-8 w-8 p-0"
                              >
                                {action.icon || (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}

// Export default actions for common use cases
export const defaultActions = {
  edit: (onEdit: (row: any) => void): ActionConfig<any> => ({
    label: "Düzenle",
    icon: <Edit className="h-4 w-4" />,
    onClick: onEdit,
    variant: "ghost",
  }),
  delete: (onDelete: (row: any) => void): ActionConfig<any> => ({
    label: "Sil",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: "ghost",
  }),
};

export const defaultBulkActions = {
  delete: (onBulkDelete: (ids: string[]) => void): BulkActionConfig => ({
    label: "Seçilenleri Sil",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onBulkDelete,
    variant: "destructive",
  }),
};
