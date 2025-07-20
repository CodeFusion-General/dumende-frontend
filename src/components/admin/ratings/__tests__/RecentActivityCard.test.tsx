import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecentActivityCard from "../RecentActivityCard";
import { MockReviewData } from "@/types/ratings.types";

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  AvatarFallback: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Star: ({ size, className }: any) => (
    <span className={className} data-testid="star-icon">
      {size}
    </span>
  ),
  Clock: ({ size, className }: any) => (
    <span className={className} data-testid="clock-icon">
      {size}
    </span>
  ),
  TrendingUp: ({ size, className }: any) => (
    <span className={className} data-testid="trending-up-icon">
      {size}
    </span>
  ),
  Activity: ({ size, className }: any) => (
    <span className={className} data-testid="activity-icon">
      {size}
    </span>
  ),
}));

describe("RecentActivityCard", () => {
  const mockRecentReviews: MockReviewData[] = [
    {
      id: "1",
      userName: "Ahmet Yılmaz",
      userInitials: "AY",
      rating: 5,
      comment: "Harika bir deneyimdi, kesinlikle tavsiye ederim!",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      category: "boat",
      entityName: "Deniz Yıldızı",
      entityId: "boat-1",
      isVerified: true,
      helpfulCount: 3,
      location: "İstanbul",
    },
    {
      id: "2",
      userName: "Ayşe Kaya",
      userInitials: "AK",
      rating: 4,
      comment: "Güzel bir tur, rehber çok bilgiliydi.",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      category: "tour",
      entityName: "Boğaz Turu",
      entityId: "tour-1",
      isVerified: false,
      helpfulCount: 1,
      location: "İstanbul",
    },
    {
      id: "3",
      userName: "Mehmet Demir",
      userInitials: "MD",
      rating: 3,
      comment: "Ortalama bir deneyim.",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      category: "boat",
      entityName: "Mavi Dalga",
      entityId: "boat-2",
      isVerified: true,
      helpfulCount: 0,
      location: "Antalya",
    },
  ];

  const defaultProps = {
    recentReviews: mockRecentReviews,
    totalRecentCount: 3,
    averageRecentRating: 4.0,
    trend: {
      value: 12.5,
      isPositive: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with correct title", () => {
    render(<RecentActivityCard {...defaultProps} />);
    expect(screen.getByText("Son Aktivite")).toBeInTheDocument();
  });

  it("displays activity summary correctly", () => {
    render(<RecentActivityCard {...defaultProps} />);

    expect(screen.getByText("Son 7 gün")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Yeni değerlendirme")).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();
    expect(screen.getByText("Ortalama puan")).toBeInTheDocument();
  });

  it("displays positive trend indicator", () => {
    render(<RecentActivityCard {...defaultProps} />);
    expect(screen.getByText("12.5%")).toBeInTheDocument();
    expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
  });

  it("displays negative trend indicator", () => {
    const propsWithNegativeTrend = {
      ...defaultProps,
      trend: {
        value: 8.3,
        isPositive: false,
      },
    };

    render(<RecentActivityCard {...propsWithNegativeTrend} />);
    expect(screen.getByText("8.3%")).toBeInTheDocument();
  });

  it("renders recent reviews list", () => {
    render(<RecentActivityCard {...defaultProps} />);

    expect(screen.getByText("Son Değerlendirmeler")).toBeInTheDocument();
    expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    expect(screen.getByText("Ayşe Kaya")).toBeInTheDocument();
    expect(screen.getByText("Mehmet Demir")).toBeInTheDocument();
  });

  it("displays correct category badges", () => {
    render(<RecentActivityCard {...defaultProps} />);

    expect(screen.getAllByText("Tekne")).toHaveLength(2);
    expect(screen.getByText("Tur")).toBeInTheDocument();
  });

  it("displays entity names", () => {
    render(<RecentActivityCard {...defaultProps} />);

    expect(screen.getByText("Deniz Yıldızı")).toBeInTheDocument();
    expect(screen.getByText("Boğaz Turu")).toBeInTheDocument();
    expect(screen.getByText("Mavi Dalga")).toBeInTheDocument();
  });

  it("displays review comments", () => {
    render(<RecentActivityCard {...defaultProps} />);

    expect(
      screen.getByText("Harika bir deneyimdi, kesinlikle tavsiye ederim!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Güzel bir tur, rehber çok bilgiliydi.")
    ).toBeInTheDocument();
    expect(screen.getByText("Ortalama bir deneyim.")).toBeInTheDocument();
  });

  it("displays user initials in avatars", () => {
    render(<RecentActivityCard {...defaultProps} />);

    expect(screen.getByText("AY")).toBeInTheDocument();
    expect(screen.getByText("AK")).toBeInTheDocument();
    expect(screen.getByText("MD")).toBeInTheDocument();
  });

  it("renders empty state when no recent reviews", () => {
    const emptyProps = {
      ...defaultProps,
      recentReviews: [],
      totalRecentCount: 0,
      averageRecentRating: 0,
    };

    render(<RecentActivityCard {...emptyProps} />);

    expect(
      screen.getByText("Son 7 günde yeni değerlendirme bulunmuyor")
    ).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("shows additional reviews count when more than 5 reviews", () => {
    const manyReviews = Array.from({ length: 8 }, (_, i) => ({
      ...mockRecentReviews[0],
      id: `review-${i}`,
      userName: `User ${i}`,
      userInitials: `U${i}`,
    }));

    const propsWithManyReviews = {
      ...defaultProps,
      recentReviews: manyReviews,
      totalRecentCount: 8,
    };

    render(<RecentActivityCard {...propsWithManyReviews} />);

    expect(screen.getByText("+3 daha fazla değerlendirme")).toBeInTheDocument();
  });

  it("renders without trend when trend prop is not provided", () => {
    const propsWithoutTrend = {
      ...defaultProps,
      trend: undefined,
    };

    render(<RecentActivityCard {...propsWithoutTrend} />);

    expect(screen.queryByText("12.5%")).not.toBeInTheDocument();
    expect(screen.queryByTestId("trending-up-icon")).not.toBeInTheDocument();
  });

  it("formats timestamps correctly", () => {
    render(<RecentActivityCard {...defaultProps} />);

    // Check for relative time formatting
    expect(screen.getByText("2 saat önce")).toBeInTheDocument();
    expect(screen.getByText("Dün")).toBeInTheDocument();
    expect(screen.getByText("3 gün önce")).toBeInTheDocument();
  });

  it("renders star ratings for each review", () => {
    render(<RecentActivityCard {...defaultProps} />);

    // Should have star icons for each review (5 stars per review * 3 reviews = 15 stars)
    const starIcons = screen.getAllByTestId("star-icon");
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it("applies correct styling classes", () => {
    const { container } = render(<RecentActivityCard {...defaultProps} />);

    // Check for key styling classes
    expect(container.querySelector(".group")).toBeInTheDocument();
    expect(container.querySelector(".font-montserrat")).toBeInTheDocument();
    expect(container.querySelector(".font-roboto")).toBeInTheDocument();
  });
});
