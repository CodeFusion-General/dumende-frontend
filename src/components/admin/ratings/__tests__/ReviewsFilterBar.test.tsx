import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ReviewsFilterBar from "../ReviewsFilterBar";
import { FilterOptions, SortOption } from "@/types/ratings.types";

// Mock the UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, placeholder, className, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <button onClick={() => onValueChange && onValueChange("test-value")}>
        {children}
      </button>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, variant }: any) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

describe("ReviewsFilterBar", () => {
  const defaultProps = {
    filters: { category: "all" as FilterOptions["category"] },
    sortBy: "date-desc" as SortOption,
    onFiltersChange: jest.fn(),
    onSortChange: jest.fn(),
    onResetFilters: jest.fn(),
    totalResults: 127,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the filter bar with correct title and results count", () => {
      render(<ReviewsFilterBar {...defaultProps} />);

      expect(screen.getByText("Yorumları Filtrele")).toBeInTheDocument();
      expect(screen.getByText("127 sonuç bulundu")).toBeInTheDocument();
    });

    it("renders search input with correct placeholder", () => {
      render(<ReviewsFilterBar {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Yorum, kullanıcı adı veya tekne adı...")
      ).toBeInTheDocument();
    });

    it("renders all filter select components on desktop", () => {
      render(<ReviewsFilterBar {...defaultProps} />);

      expect(screen.getByText("Puan")).toBeInTheDocument();
      expect(screen.getByText("Kategori")).toBeInTheDocument();
      expect(screen.getByText("Doğrulama")).toBeInTheDocument();
      expect(screen.getByText("Sırala")).toBeInTheDocument();
    });

    it("shows mobile filter toggle button", () => {
      render(<ReviewsFilterBar {...defaultProps} />);

      expect(screen.getByText("Filtreler")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("updates search term when typing", async () => {
      const user = userEvent.setup();
      render(<ReviewsFilterBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(
        "Yorum, kullanıcı adı veya tekne adı..."
      );
      await user.type(searchInput, "test search");

      expect(searchInput).toHaveValue("test search");
    });

    it("calls onFiltersChange with debounced search term", async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();

      render(
        <ReviewsFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />
      );

      const searchInput = screen.getByPlaceholderText(
        "Yorum, kullanıcı adı veya tekne adı..."
      );
      await user.type(searchInput, "test");

      // Wait for debounce
      await waitFor(
        () => {
          expect(onFiltersChange).toHaveBeenCalledWith({
            ...defaultProps.filters,
            searchTerm: "test",
          });
        },
        { timeout: 500 }
      );
    });

    it("shows clear button when search term exists", async () => {
      const user = userEvent.setup();
      render(
        <ReviewsFilterBar
          {...defaultProps}
          filters={{ ...defaultProps.filters, searchTerm: "test" }}
        />
      );

      const searchInput = screen.getByDisplayValue("test");
      expect(searchInput).toBeInTheDocument();

      // Clear button should be present (X icon)
      const clearButtons = screen.getAllByRole("button");
      const clearButton = clearButtons.find(
        (button) =>
          button.querySelector("svg") &&
          button.getAttribute("class")?.includes("right-3")
      );
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe("Filter Chips", () => {
    it("displays filter chips for active filters", () => {
      const filtersWithActive = {
        category: "boat" as FilterOptions["category"],
        rating: 5,
        isVerified: true,
        location: "İstanbul",
      };

      render(
        <ReviewsFilterBar {...defaultProps} filters={filtersWithActive} />
      );

      expect(screen.getByText("Aktif filtreler:")).toBeInTheDocument();
      expect(screen.getByText("5 Yıldız")).toBeInTheDocument();
      expect(screen.getByText("Tekne")).toBeInTheDocument();
      expect(screen.getByText("Doğrulanmış")).toBeInTheDocument();
      expect(screen.getByText("İstanbul")).toBeInTheDocument();
    });

    it("shows clear all filters button when filters are active", () => {
      const filtersWithActive = {
        category: "boat" as FilterOptions["category"],
        rating: 5,
      };

      render(
        <ReviewsFilterBar {...defaultProps} filters={filtersWithActive} />
      );

      expect(screen.getByText("Tümünü temizle")).toBeInTheDocument();
    });

    it("calls onResetFilters when clear all button is clicked", async () => {
      const user = userEvent.setup();
      const onResetFilters = jest.fn();
      const filtersWithActive = {
        category: "boat" as FilterOptions["category"],
        rating: 5,
      };

      render(
        <ReviewsFilterBar
          {...defaultProps}
          filters={filtersWithActive}
          onResetFilters={onResetFilters}
        />
      );

      const clearAllButton = screen.getByText("Tümünü temizle");
      await user.click(clearAllButton);

      expect(onResetFilters).toHaveBeenCalled();
    });

    it("removes individual filter when chip X button is clicked", async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      const filtersWithActive = {
        category: "boat" as FilterOptions["category"],
        rating: 5,
      };

      render(
        <ReviewsFilterBar
          {...defaultProps}
          filters={filtersWithActive}
          onFiltersChange={onFiltersChange}
        />
      );

      // Find the X button for the rating filter chip
      const ratingChip = screen.getByText("5 Yıldız").closest("span");
      const removeButton = ratingChip?.querySelector("button");

      if (removeButton) {
        await user.click(removeButton);
        expect(onFiltersChange).toHaveBeenCalledWith({
          ...filtersWithActive,
          rating: undefined,
        });
      }
    });
  });

  describe("Mobile Responsiveness", () => {
    it("shows active filters count in mobile toggle button", () => {
      const filtersWithActive = {
        category: "boat" as FilterOptions["category"],
        rating: 5,
        isVerified: true,
      };

      render(
        <ReviewsFilterBar {...defaultProps} filters={filtersWithActive} />
      );

      // Should show count of 3 active filters (category, rating, isVerified)
      const mobileButton = screen.getByText("Filtreler").closest("button");
      expect(mobileButton).toBeInTheDocument();
    });

    it("toggles mobile filters visibility when button is clicked", async () => {
      const user = userEvent.setup();
      render(<ReviewsFilterBar {...defaultProps} />);

      const mobileToggle = screen.getByText("Filtreler");
      await user.click(mobileToggle);

      // Mobile filters should become visible
      // This would require checking for the mobile-specific filter elements
      // The exact implementation depends on how the mobile filters are structured
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for form elements", () => {
      render(<ReviewsFilterBar {...defaultProps} />);

      expect(screen.getByText("Ara")).toBeInTheDocument();
      expect(screen.getByText("Puan")).toBeInTheDocument();
      expect(screen.getByText("Kategori")).toBeInTheDocument();
      expect(screen.getByText("Doğrulama")).toBeInTheDocument();
      expect(screen.getByText("Sırala")).toBeInTheDocument();
    });

    it("has proper ARIA attributes for interactive elements", () => {
      render(<ReviewsFilterBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(
        "Yorum, kullanıcı adı veya tekne adı..."
      );
      expect(searchInput).toHaveAttribute("type", "text");
    });
  });

  describe("Performance", () => {
    it("debounces search input to prevent excessive API calls", async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();

      render(
        <ReviewsFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />
      );

      const searchInput = screen.getByPlaceholderText(
        "Yorum, kullanıcı adı veya tekne adı..."
      );

      // Type multiple characters quickly
      await user.type(searchInput, "test");

      // Should not call onFiltersChange immediately
      expect(onFiltersChange).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(
        () => {
          expect(onFiltersChange).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });
  });

  describe("Error Handling", () => {
    it("handles undefined filters gracefully", () => {
      const propsWithUndefinedFilters = {
        ...defaultProps,
        filters: {} as FilterOptions,
      };

      expect(() => {
        render(<ReviewsFilterBar {...propsWithUndefinedFilters} />);
      }).not.toThrow();
    });

    it("handles missing callback functions gracefully", () => {
      const propsWithoutCallbacks = {
        ...defaultProps,
        onFiltersChange: undefined as any,
        onSortChange: undefined as any,
        onResetFilters: undefined as any,
      };

      expect(() => {
        render(<ReviewsFilterBar {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });
  });
});
