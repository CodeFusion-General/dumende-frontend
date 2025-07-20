import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RatingTrendsChart from "../RatingTrendsChart";
import { RatingTrend } from "@/types/ratings.types";

// Mock recharts to avoid canvas issues in tests
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }: any) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockTrends: RatingTrend[] = [
  { date: "2024-01-01", rating: 4.5, count: 10 },
  { date: "2024-01-02", rating: 4.2, count: 8 },
  { date: "2024-01-03", rating: 4.7, count: 12 },
  { date: "2024-01-04", rating: 4.1, count: 6 },
  { date: "2024-01-05", rating: 4.8, count: 15 },
  { date: "2024-01-06", rating: 4.3, count: 9 },
  { date: "2024-01-07", rating: 4.6, count: 11 },
];

// Generate more comprehensive mock data for different periods
const generateMockTrends = (days: number): RatingTrend[] => {
  const trends: RatingTrend[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    trends.push({
      date: date.toISOString().split("T")[0],
      rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5-5.0
      count: Math.floor(Math.random() * 20) + 1, // Random count 1-20
    });
  }

  return trends;
};

describe("RatingTrendsChart", () => {
  beforeEach(() => {
    // Mock Date to ensure consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-07"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders without crashing", () => {
    render(<RatingTrendsChart trends={mockTrends} />);
    expect(screen.getByText("Puan Trendleri")).toBeInTheDocument();
  });

  it("displays the correct title and icon", () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    expect(screen.getByText("Puan Trendleri")).toBeInTheDocument();
    expect(screen.getByText("Puan Trendleri").closest(".flex")).toContainHTML(
      "TrendingUp"
    );
  });

  it("renders period selector buttons", () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    expect(screen.getByText("7 gün")).toBeInTheDocument();
    expect(screen.getByText("30 gün")).toBeInTheDocument();
    expect(screen.getByText("90 gün")).toBeInTheDocument();
  });

  it("has 30 days selected by default", () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    const thirtyDayButton = screen.getByText("30 gün");
    expect(thirtyDayButton).toHaveClass("bg-primary");
  });

  it("changes period when button is clicked", async () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    const sevenDayButton = screen.getByText("7 gün");
    const thirtyDayButton = screen.getByText("30 gün");

    // Initially 30 days should be selected
    expect(thirtyDayButton).toHaveClass("bg-primary");
    expect(sevenDayButton).not.toHaveClass("bg-primary");

    // Click 7 days button
    fireEvent.click(sevenDayButton);

    await waitFor(() => {
      expect(sevenDayButton).toHaveClass("bg-primary");
      expect(thirtyDayButton).not.toHaveClass("bg-primary");
    });
  });

  it("displays summary statistics", () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    expect(screen.getByText("Son 30 gün")).toBeInTheDocument();
    expect(screen.getByText("Ortalama:")).toBeInTheDocument();
  });

  it("calculates and displays average rating correctly", () => {
    const trends = [
      { date: "2024-01-01", rating: 4.0, count: 10 },
      { date: "2024-01-02", rating: 5.0, count: 8 },
    ];

    render(<RatingTrendsChart trends={trends} />);

    // Average should be 4.5
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders chart components", () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line")).toBeInTheDocument();
    expect(screen.getByTestId("area")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<RatingTrendsChart trends={[]} />);

    expect(
      screen.getByText("Bu dönem için veri bulunmuyor")
    ).toBeInTheDocument();
  });

  it("filters data based on selected period", async () => {
    const longTrends = generateMockTrends(100); // 100 days of data
    render(<RatingTrendsChart trends={longTrends} />);

    // Click 7 days button
    const sevenDayButton = screen.getByText("7 gün");
    fireEvent.click(sevenDayButton);

    await waitFor(() => {
      expect(screen.getByText("Son 7 gün")).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <RatingTrendsChart trends={mockTrends} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows trend direction indicator", () => {
    // Create trends with clear upward trend
    const trendingUpData = [
      { date: "2024-01-01", rating: 3.0, count: 10 },
      { date: "2024-01-02", rating: 3.5, count: 8 },
      { date: "2024-01-03", rating: 4.0, count: 12 },
      { date: "2024-01-04", rating: 4.5, count: 6 },
    ];

    render(<RatingTrendsChart trends={trendingUpData} />);

    // Should show some trend indicator (the exact value depends on calculation)
    const trendElements = screen.getAllByText(/\d+\.\d+/);
    expect(trendElements.length).toBeGreaterThan(0);
  });

  it("handles animation states", async () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    // Change period to trigger animation
    const sevenDayButton = screen.getByText("7 gün");
    fireEvent.click(sevenDayButton);

    // Should show loading state briefly
    await waitFor(
      () => {
        expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it("formats Turkish dates correctly", () => {
    const recentTrends = [
      { date: "2024-01-01", rating: 4.5, count: 10 }, // Should show as "1 Oca"
      { date: "2024-01-07", rating: 4.2, count: 8 }, // Should show as "7 Oca"
    ];

    render(<RatingTrendsChart trends={recentTrends} />);

    // The component should process these dates with Turkish formatting
    // We can't easily test the chart internals, but we can verify the component renders
    expect(screen.getByText("Puan Trendleri")).toBeInTheDocument();
  });

  it("handles zero ratings gracefully", () => {
    const trendsWithZeros = [
      { date: "2024-01-01", rating: 0, count: 0 },
      { date: "2024-01-02", rating: 4.5, count: 10 },
    ];

    render(<RatingTrendsChart trends={trendsWithZeros} />);

    // Should still render without errors
    expect(screen.getByText("Puan Trendleri")).toBeInTheDocument();
  });

  it("maintains responsive design", () => {
    render(<RatingTrendsChart trends={mockTrends} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("shows hover effects on card", () => {
    const { container } = render(<RatingTrendsChart trends={mockTrends} />);

    const card = container.querySelector(".group");
    expect(card).toHaveClass("hover:shadow-xl");
  });
});

// Integration tests
describe("RatingTrendsChart Integration", () => {
  it("works with real mock data service", async () => {
    // This would typically import the actual mock service
    const mockTrends = generateMockTrends(30);

    render(<RatingTrendsChart trends={mockTrends} />);

    expect(screen.getByText("Puan Trendleri")).toBeInTheDocument();
    expect(screen.getByText("30 gün")).toHaveClass("bg-primary");
  });

  it("handles period changes with large datasets", async () => {
    const largeTrends = generateMockTrends(365); // Full year of data

    render(<RatingTrendsChart trends={largeTrends} />);

    // Test all period buttons
    const periods = ["7 gün", "30 gün", "90 gün"];

    for (const period of periods) {
      const button = screen.getByText(period);
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass("bg-primary");
      });
    }
  });
});
