import React, { useMemo, forwardRef, ComponentProps } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showFirstLast?: boolean;
  siblingCount?: number;
  className?: string;
}

const DOTS = "...";

function generatePagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | string)[] {
  // Her zaman ilk ve son sayfa + current + siblings gösterilir
  const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 dots

  // Tüm sayfalar sığıyorsa hepsini göster
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 2);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 3;

  // Case 1: Sadece sağda dots
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
    return [...leftRange, DOTS, totalPages - 1];
  }

  // Case 2: Sadece solda dots
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i
    );
    return [0, DOTS, ...rightRange];
  }

  // Case 3: Her iki tarafta dots
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [0, DOTS, ...middleRange, DOTS, totalPages - 1];
  }

  return [];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showFirstLast = true,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const pages = useMemo(
    () => generatePagination(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  const buttonBaseClass = cn(
    "inline-flex items-center justify-center rounded-lg transition-all duration-200",
    "text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
  );

  const navButtonClass = cn(
    buttonBaseClass,
    "w-10 h-10 bg-white border border-gray-200 text-gray-700",
    "hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
    "active:bg-gray-100"
  );

  const pageButtonClass = (isActive: boolean) =>
    cn(
      buttonBaseClass,
      "min-w-[40px] h-10 px-3",
      isActive
        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-600 shadow-md shadow-blue-200"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
    );

  const dotsClass = cn(
    "inline-flex items-center justify-center w-10 h-10 text-gray-400 select-none"
  );

  return (
    <nav
      className={cn(
        "flex items-center justify-center gap-1 sm:gap-2",
        className
      )}
      aria-label="Sayfalama"
    >
      {/* İlk Sayfa */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(0)}
          disabled={disabled || isFirstPage}
          className={cn(navButtonClass, "hidden sm:inline-flex")}
          aria-label="İlk sayfa"
          title="İlk sayfa"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}

      {/* Önceki */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || isFirstPage}
        className={navButtonClass}
        aria-label="Önceki sayfa"
        title="Önceki sayfa"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Sayfa Numaraları */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === DOTS) {
            return (
              <span key={`dots-${index}`} className={dotsClass}>
                ⋯
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={disabled}
              className={pageButtonClass(isActive)}
              aria-label={`Sayfa ${pageNum + 1}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum + 1}
            </button>
          );
        })}
      </div>

      {/* Sonraki */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || isLastPage}
        className={navButtonClass}
        aria-label="Sonraki sayfa"
        title="Sonraki sayfa"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Son Sayfa */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={disabled || isLastPage}
          className={cn(navButtonClass, "hidden sm:inline-flex")}
          aria-label="Son sayfa"
          title="Son sayfa"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
}

// Basit sayfa bilgisi göstergesi
export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemName = "öğe",
  className,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemName?: string;
  className?: string;
}) {
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <div className={cn("text-sm text-gray-600", className)}>
      <span className="font-medium text-gray-900">{startItem}</span>
      {" - "}
      <span className="font-medium text-gray-900">{endItem}</span>
      {" / "}
      <span className="font-medium text-gray-900">{totalItems}</span>
      {" "}{itemName}
    </div>
  );
}

export default Pagination;

// ========================================
// Shadcn UI Pagination Components (for admin components compatibility)
// ========================================

const PaginationNav = ({
  className,
  ...props
}: ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
PaginationNav.displayName = "PaginationNav";

const PaginationContent = forwardRef<
  HTMLUListElement,
  ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = forwardRef<
  HTMLLIElement,
  ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Önceki</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Sonraki</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
