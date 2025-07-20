import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RatingDistributionCard from "../RatingDistributionCard";

// Mock the lucide-react icons
vi.mock("lucide-react", () => ({
  Star: ({ size, className }: { size?: number; className?: string }) => (
    <div data-testid="star-icon" data-size={size} className={className}>
      ★
    </div>
  ),
}));

describe("RatingDistributionCard", () => {
  const mockDistribution = [
    { stars: 1, count: 5, percentage: 10 },
    { stars: 2, count: 8, percentage: 16 },
    { stars: 3, count: 12, percentage: 24 },
    { stars: 4, count: 15, percentage: 30 },
    { stars: 5, count: 10, percentage: 20 },
  ];

  const totalReviews = 50;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the component with correct title", () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    expect(screen.getByText("Puan Dağılımı")).toBeInTheDocument();
  });

  it("displays all rating levels from 5 to 1 stars", () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    // Should have 5 rows for each star rating (5 stars × 5 rows = 25 star icons)
    const starIcons = screen.getAllByTestId("star-icon");
    expect(starIcons).toHaveLength(15); // 5+4+3+2+1 = 15 stars total
  });

  it("shows correct count for each rating", () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    // Check if counts are displayed
    expect(screen.getByText("10")).toBeInTheDocument(); // 5 stars count
    expect(screen.getByText("15")).toBeInTheDocument(); // 4 stars count
    expect(screen.getByText("12")).toBeInTheDocument(); // 3 stars count
    expect(screen.getByText("8")).toBeInTheDocument(); // 2 stars count
    expect(screen.getByText("5")).toBeInTheDocument(); // 1 star count
  });

  it("displays total reviews count", () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    expect(screen.getByText("50 değerlendirme")).toBeInTheDocument();
  });

  it("shows percentage values", async () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    // Fast-forward through animation
    vi.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(screen.getByText("20%")).toBeInTheDocument(); // 5 stars percentage
      expect(screen.getByText("30%")).toBeInTheDocument(); // 4 stars percentage
    });
  });

  it("handles empty distribution gracefully", () => {
    const emptyDistribution = [
      { stars: 1, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 5, count: 0, percentage: 0 },
    ];

    render(
      <RatingDistributionCard
        distribution={emptyDistribution}
        totalReviews={0}
      />
    );

    expect(screen.getByText("0 değerlendirme")).toBeInTheDocument();
  });

  it("animates percentages on mount", async () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    // Initially, percentages should be 0 or very low
    vi.advanceTimersByTime(100);

    // After animation completes, percentages should be visible
    vi.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(screen.getByText("20%")).toBeInTheDocument();
    });
  });

  it("applies correct CSS classes for styling", () => {
    const { container } = render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    // Check for card styling classes
    const card = container.querySelector(".group");
    expect(card).toHaveClass("shadow-lg", "hover:shadow-xl");
  });

  it("renders mobile-friendly tooltip", () => {
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={totalReviews}
      />
    );

    expect(
      screen.getByText("Detayları görmek için satırlara dokunun")
    ).toBeInTheDocument();
  });

  it("formats large numbers correctly", () => {
    const largeTotal = 1234;
    render(
      <RatingDistributionCard
        distribution={mockDistribution}
        totalReviews={largeTotal}
      />
    );

    expect(screen.getByText("1.234 değerlendirme")).toBeInTheDocument();
  });
});
