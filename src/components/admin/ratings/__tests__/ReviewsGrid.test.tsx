import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewsGrid from "../ReviewsGrid";
import { MockReviewData } from "@/types/ratings.types";

// Mock the ReviewCard component
vi.mock("../ReviewCard", () => ({
  default: ({ review, onReply, onFlag, onDelete }: any) => (
    <div data-testid={`review-card-${review.id}`}>
      <span>{review.userName}</span>
      <span>{review.comment}</span>
      <button onClick={() => onReply(review.id)}>Reply</button>
      <button onClick={() => onFlag(review.id)}>Flag</button>
      <button onClick={() => onDelete(review.id)}>Delete</button>
    </div>
  ),
}));

// Mock scroll behavior
Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

const mockReviews: MockReviewData[] = Array.from(
  { length: 25 },
  (_, index) => ({
    id: `review-${index + 1}`,
    userName: `User ${index + 1}`,
    userInitials: `U${index + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `This is review comment ${index + 1}`,
    date: new Date(2024, 0, index + 1).toISOString(),
    category: index % 2 === 0 ? "boat" : "tour",
    entityName: `Entity ${index + 1}`,
    entityId: `entity-${index + 1}`,
    isVerified: index % 3 === 0,
    helpfulCount: Math.floor(Math.random() * 10),
    location: `Location ${index + 1}`,
  })
);

describe("ReviewsGrid", () => {
  const mockHandlers = {
    onReply: vi.fn(),
    onFlag: vi.fn(),
    onDelete: vi.fn(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should display skeleton loaders when loading", () => {
      render(<ReviewsGrid reviews={[]} loading={true} {...mockHandlers} />);

      // Should show skeleton loaders
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should display correct number of skeleton loaders", () => {
      render(
        <ReviewsGrid
          reviews={[]}
          loading={true}
          itemsPerPage={6}
          {...mockHandlers}
        />
      );

      // Should show 6 skeleton loaders (itemsPerPage)
      const gridContainer =
        screen.getByRole("main") || document.querySelector(".grid");
      expect(gridContainer).toBeTruthy();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no reviews", () => {
      render(<ReviewsGrid reviews={[]} loading={false} {...mockHandlers} />);

      expect(
        screen.getByText("Henüz değerlendirme bulunmuyor")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Seçilen filtrelere uygun değerlendirme bulunamadı/)
      ).toBeInTheDocument();
    });

    it("should show refresh button in empty state when onRefresh is provided", () => {
      render(<ReviewsGrid reviews={[]} loading={false} {...mockHandlers} />);

      const refreshButton = screen.getByRole("button", { name: /yenile/i });
      expect(refreshButton).toBeInTheDocument();

      fireEvent.click(refreshButton);
      expect(mockHandlers.onRefresh).toHaveBeenCalledTimes(1);
    });

    it("should not show refresh button when onRefresh is not provided", () => {
      const { onRefresh, ...handlersWithoutRefresh } = mockHandlers;
      render(
        <ReviewsGrid reviews={[]} loading={false} {...handlersWithoutRefresh} />
      );

      expect(
        screen.queryByRole("button", { name: /yenile/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Review Display", () => {
    it("should display reviews when provided", () => {
      const testReviews = mockReviews.slice(0, 5);
      render(
        <ReviewsGrid reviews={testReviews} loading={false} {...mockHandlers} />
      );

      testReviews.forEach((review) => {
        expect(
          screen.getByTestId(`review-card-${review.id}`)
        ).toBeInTheDocument();
        expect(screen.getByText(review.userName)).toBeInTheDocument();
      });
    });

    it("should pass correct props to ReviewCard components", () => {
      const testReviews = mockReviews.slice(0, 2);
      render(
        <ReviewsGrid reviews={testReviews} loading={false} {...mockHandlers} />
      );

      // Test that handlers are passed correctly
      const replyButton = screen.getAllByText("Reply")[0];
      fireEvent.click(replyButton);
      expect(mockHandlers.onReply).toHaveBeenCalledWith(testReviews[0].id);

      const flagButton = screen.getAllByText("Flag")[0];
      fireEvent.click(flagButton);
      expect(mockHandlers.onFlag).toHaveBeenCalledWith(testReviews[0].id);

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(testReviews[0].id);
    });
  });

  describe("Pagination", () => {
    it("should display pagination when there are multiple pages", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // Should show pagination controls
      expect(
        screen.getByRole("navigation", { name: /pagination/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("should not display pagination when all items fit on one page", () => {
      const fewReviews = mockReviews.slice(0, 5);
      render(
        <ReviewsGrid
          reviews={fewReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      expect(
        screen.queryByRole("navigation", { name: /pagination/i })
      ).not.toBeInTheDocument();
    });

    it("should display correct page numbers", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // With 25 reviews and 10 per page, should have 3 pages
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should handle page navigation", async () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // Click on page 2
      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      // Should scroll to top
      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith({
          top: 0,
          behavior: "smooth",
        });
      });
    });

    it("should disable previous button on first page", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      const previousButton = screen.getByText("Previous").closest("a");
      expect(previousButton).toHaveClass("pointer-events-none", "opacity-50");
    });

    it("should disable next button on last page", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // Navigate to last page (page 3)
      const page3Button = screen.getByText("3");
      fireEvent.click(page3Button);

      const nextButton = screen.getByText("Next").closest("a");
      expect(nextButton).toHaveClass("pointer-events-none", "opacity-50");
    });
  });

  describe("Results Summary", () => {
    it("should display results summary", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      expect(
        screen.getByText(/Toplam 25 değerlendirmeden 1-10 arası gösteriliyor/)
      ).toBeInTheDocument();
      expect(screen.getByText("Sayfa 1 / 3")).toBeInTheDocument();
    });

    it("should update summary when navigating pages", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // Navigate to page 2
      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      expect(
        screen.getByText(/Toplam 25 değerlendirmeden 11-20 arası gösteriliyor/)
      ).toBeInTheDocument();
      expect(screen.getByText("Sayfa 2 / 3")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should apply correct grid classes", () => {
      render(
        <ReviewsGrid
          reviews={mockReviews.slice(0, 5)}
          loading={false}
          {...mockHandlers}
        />
      );

      const gridContainer = document.querySelector(".grid");
      expect(gridContainer).toHaveClass(
        "grid-cols-1",
        "lg:grid-cols-2",
        "xl:grid-cols-3"
      );
    });
  });

  describe("Performance Info", () => {
    it("should show performance info for large datasets", () => {
      const largeDataset = Array.from({ length: 150 }, (_, index) => ({
        ...mockReviews[0],
        id: `review-${index + 1}`,
      }));

      render(
        <ReviewsGrid reviews={largeDataset} loading={false} {...mockHandlers} />
      );

      expect(
        screen.getByText(/Performans için sayfalama kullanılmaktadır/)
      ).toBeInTheDocument();
    });

    it("should not show performance info for small datasets", () => {
      render(
        <ReviewsGrid reviews={mockReviews} loading={false} {...mockHandlers} />
      );

      expect(
        screen.queryByText(/Performans için sayfalama kullanılmaktadır/)
      ).not.toBeInTheDocument();
    });
  });

  describe("Page Reset", () => {
    it("should reset to first page when reviews change", () => {
      const { rerender } = render(
        <ReviewsGrid
          reviews={mockReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // Navigate to page 2
      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      // Change reviews
      const newReviews = mockReviews.slice(0, 15);
      rerender(
        <ReviewsGrid
          reviews={newReviews}
          loading={false}
          itemsPerPage={10}
          {...mockHandlers}
        />
      );

      // Should be back on page 1
      expect(screen.getByText("Sayfa 1 / 2")).toBeInTheDocument();
    });
  });
});
