import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import "@testing-library/jest-dom";
import RatingsPage from "@/pages/admin/RatingsPage";
import RatingsHeader from "@/components/admin/ratings/RatingsHeader";
import RatingsSummaryCard from "@/components/admin/ratings/RatingsSummaryCard";
import ReviewsFilterBar from "@/components/admin/ratings/ReviewsFilterBar";
import ReviewsGrid from "@/components/admin/ratings/ReviewsGrid";
import ReviewCard from "@/components/admin/ratings/ReviewCard";
import RatingDistributionCard from "@/components/admin/ratings/RatingDistributionCard";
import { Star, Users } from "lucide-react";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
const mockReview = {
  id: "1",
  userName: "Test User",
  userInitials: "TU",
  date: "2024-01-15",
  rating: 5,
  comment: "Great experience with the boat tour!",
  category: "boat" as const,
  entityName: "Test Boat",
  isVerified: true,
  helpfulCount: 3,
};

const mockDistribution = [
  { stars: 5, count: 50, percentage: 50 },
  { stars: 4, count: 30, percentage: 30 },
  { stars: 3, count: 15, percentage: 15 },
  { stars: 2, count: 3, percentage: 3 },
  { stars: 1, count: 2, percentage: 2 },
];

const mockFilters = {
  category: "all" as const,
};

describe("Responsive Design and Accessibility Tests", () => {
  // Mock window.matchMedia for responsive tests
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe("RatingsHeader Component", () => {
    const mockProps = {
      totalReviews: 100,
      averageRating: 4.5,
      onRefresh: jest.fn(),
      onExport: jest.fn(),
    };

    it("should have proper semantic structure", () => {
      render(<RatingsHeader {...mockProps} />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(
        screen.getByRole("navigation", { name: /sayfa navigasyonu/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should have accessible buttons with proper labels", () => {
      render(<RatingsHeader {...mockProps} />);

      const refreshButton = screen.getByRole("button", {
        name: /değerlendirmeleri yenile/i,
      });
      const exportButton = screen.getByRole("button", {
        name: /değerlendirmeleri dışa aktar/i,
      });

      expect(refreshButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
    });

    it("should have proper ARIA labels for statistics", () => {
      render(<RatingsHeader {...mockProps} />);

      expect(
        screen.getByRole("status", { name: /toplam 100 değerlendirme/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: /ortalama puan 4.5/i })
      ).toBeInTheDocument();
    });

    it("should pass accessibility audit", async () => {
      const { container } = render(<RatingsHeader {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("RatingsSummaryCard Component", () => {
    const mockProps = {
      icon: <Star className="w-6 h-6" />,
      title: "Test Metric",
      value: "4.5",
      subtitle: "out of 5",
      trend: { value: 5, isPositive: true },
    };

    it("should have proper ARIA labels and roles", () => {
      render(<RatingsSummaryCard {...mockProps} />);

      expect(
        screen.getByRole("region", { name: /test metric: 4.5 out of 5/i })
      ).toBeInTheDocument();
    });

    it("should have live region for animated values", () => {
      render(<RatingsSummaryCard {...mockProps} />);

      const valueElement = screen.getByText("4.5");
      expect(valueElement).toHaveAttribute("aria-live", "polite");
      expect(valueElement).toHaveAttribute("aria-atomic", "true");
    });

    it("should have accessible trend indicator", () => {
      render(<RatingsSummaryCard {...mockProps} />);

      expect(
        screen.getByRole("status", { name: /trend: artış 5%/i })
      ).toBeInTheDocument();
    });

    it("should pass accessibility audit", async () => {
      const { container } = render(<RatingsSummaryCard {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ReviewsFilterBar Component", () => {
    const mockProps = {
      filters: mockFilters,
      sortBy: "date-desc" as const,
      onFiltersChange: jest.fn(),
      onSortChange: jest.fn(),
      onResetFilters: jest.fn(),
      totalResults: 50,
    };

    it("should have proper search region role", () => {
      render(<ReviewsFilterBar {...mockProps} />);

      expect(
        screen.getByRole("search", {
          name: /değerlendirme filtreleme araçları/i,
        })
      ).toBeInTheDocument();
    });

    it("should have accessible mobile filter toggle", () => {
      render(<ReviewsFilterBar {...mockProps} />);

      const toggleButton = screen.getByRole("button", {
        name: /filtreleri göster/i,
      });
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      expect(toggleButton).toHaveAttribute("aria-controls", "mobile-filters");
    });

    it("should have proper form labels", () => {
      render(<ReviewsFilterBar {...mockProps} />);

      // Mobile search input should have proper label
      fireEvent.click(
        screen.getByRole("button", { name: /filtreleri göster/i })
      );

      const searchInput = screen.getByLabelText(/ara/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("aria-describedby", "search-help");
    });

    it("should have live region for results count", () => {
      render(<ReviewsFilterBar {...mockProps} />);

      expect(
        screen.getByRole("status", { name: /50 sonuç bulundu/i })
      ).toBeInTheDocument();
    });

    it("should pass accessibility audit", async () => {
      const { container } = render(<ReviewsFilterBar {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ReviewCard Component", () => {
    const mockProps = {
      review: mockReview,
      onReply: jest.fn(),
      onFlag: jest.fn(),
      onDelete: jest.fn(),
    };

    it("should have proper listitem role and label", () => {
      render(<ReviewCard {...mockProps} />);

      expect(screen.getByRole("listitem")).toHaveAttribute(
        "aria-label",
        expect.stringContaining(
          "Test User tarafından Test Boat için yapılan 5 yıldızlı değerlendirme"
        )
      );
    });

    it("should have accessible star rating", () => {
      render(<ReviewCard {...mockProps} />);

      expect(
        screen.getByRole("img", { name: /5 yıldız üzerinden 5 yıldız/i })
      ).toBeInTheDocument();
    });

    it("should have accessible time element", () => {
      render(<ReviewCard {...mockProps} />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toHaveAttribute("dateTime", "2024-01-15");
    });

    it("should have accessible action buttons", () => {
      render(<ReviewCard {...mockProps} />);

      const actionGroup = screen.getByRole("group", {
        name: /değerlendirme yönetim işlemleri/i,
      });
      expect(actionGroup).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: /test user kullanıcısının değerlendirmesini yanıtla/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /test user kullanıcısının değerlendirmesini bayrakla/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /test user kullanıcısının değerlendirmesini sil/i,
        })
      ).toBeInTheDocument();
    });

    it("should pass accessibility audit", async () => {
      const { container } = render(<ReviewCard {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ReviewsGrid Component", () => {
    const mockProps = {
      reviews: [mockReview],
      loading: false,
      onReply: jest.fn(),
      onFlag: jest.fn(),
      onDelete: jest.fn(),
      onRefresh: jest.fn(),
    };

    it("should have proper region role and label", () => {
      render(<ReviewsGrid {...mockProps} />);

      expect(
        screen.getByRole("region", { name: /değerlendirmeler listesi/i })
      ).toBeInTheDocument();
    });

    it("should have accessible list container", () => {
      render(<ReviewsGrid {...mockProps} />);

      expect(
        screen.getByRole("list", { name: /değerlendirme kartları/i })
      ).toBeInTheDocument();
    });

    it("should have live region for results summary", () => {
      render(<ReviewsGrid {...mockProps} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should pass accessibility audit", async () => {
      const { container } = render(<ReviewsGrid {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("RatingDistributionCard Component", () => {
    const mockProps = {
      distribution: mockDistribution,
      totalReviews: 100,
    };

    it("should have proper region role and heading", () => {
      render(<RatingDistributionCard {...mockProps} />);

      expect(screen.getByRole("region")).toHaveAttribute(
        "aria-labelledby",
        "rating-distribution-title"
      );
      expect(
        screen.getByRole("heading", { name: /puan dağılımı/i })
      ).toBeInTheDocument();
    });

    it("should have accessible progress bars", () => {
      render(<RatingDistributionCard {...mockProps} />);

      const progressBars = screen.getAllByRole("progressbar");
      expect(progressBars).toHaveLength(5);

      progressBars.forEach((bar, index) => {
        const stars = 5 - index;
        expect(bar).toHaveAttribute(
          "aria-label",
          expect.stringContaining(`${stars} yıldız`)
        );
        expect(bar).toHaveAttribute("aria-valuenow");
        expect(bar).toHaveAttribute("aria-valuemin", "0");
        expect(bar).toHaveAttribute("aria-valuemax", "100");
      });
    });

    it("should be keyboard navigable", () => {
      render(<RatingDistributionCard {...mockProps} />);

      const progressBars = screen.getAllByRole("progressbar");
      progressBars.forEach((bar) => {
        expect(bar).toHaveAttribute("tabIndex", "0");
      });
    });

    it("should pass accessibility audit", async () => {
      const { container } = render(<RatingDistributionCard {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Responsive Design Tests", () => {
    it("should adapt to mobile viewport", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <RatingsHeader
          totalReviews={100}
          averageRating={4.5}
          onRefresh={jest.fn()}
          onExport={jest.fn()}
        />
      );

      // Check that mobile-specific classes are applied
      const headerTitle = screen.getByRole("heading", { level: 1 });
      expect(headerTitle).toHaveClass("text-xl", "xs:text-2xl");
    });

    it("should handle keyboard navigation", async () => {
      render(
        <ReviewCard
          review={mockReview}
          onReply={jest.fn()}
          onFlag={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      const replyButton = screen.getByRole("button", { name: /yanıtla/i });

      // Test keyboard focus
      replyButton.focus();
      expect(replyButton).toHaveFocus();

      // Test keyboard activation
      fireEvent.keyDown(replyButton, { key: "Enter" });
      fireEvent.keyDown(replyButton, { key: " " });
    });

    it("should have proper focus management", () => {
      render(
        <RatingDistributionCard
          distribution={mockDistribution}
          totalReviews={100}
        />
      );

      const progressBars = screen.getAllByRole("progressbar");

      // Test that all interactive elements are focusable
      progressBars.forEach((bar) => {
        bar.focus();
        expect(bar).toHaveFocus();
      });
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should have sufficient color contrast for text elements", () => {
      render(
        <RatingsSummaryCard
          icon={<Users className="w-6 h-6" />}
          title="Test Title"
          value="100"
          subtitle="test subtitle"
        />
      );

      // Check that text elements have proper contrast classes
      const title = screen.getByText("Test Title");
      expect(title).toHaveClass("text-gray-600");

      const value = screen.getByText("100");
      expect(value).toHaveClass("text-gray-900");
    });

    it("should provide visual focus indicators", () => {
      render(
        <ReviewsFilterBar
          filters={mockFilters}
          sortBy="date-desc"
          onFiltersChange={jest.fn()}
          onSortChange={jest.fn()}
          onResetFilters={jest.fn()}
          totalResults={50}
        />
      );

      const filterButton = screen.getByRole("button", {
        name: /filtreleri göster/i,
      });
      expect(filterButton).toHaveClass(
        "focus:ring-2",
        "focus:ring-primary/20",
        "focus:ring-offset-2"
      );
    });
  });
});
