import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatisticsCard from "../StatisticsCard";
import {
  mockCaptainProfile,
  mockCaptainProfileMinimal,
  mockCaptainProfileNewbie,
} from "@/mocks/captainProfile.mock";
import { CaptainStatistics } from "@/types/profile.types";

describe("StatisticsCard", () => {
  it("renders statistics correctly with full data", () => {
    render(<StatisticsCard statistics={mockCaptainProfile.statistics} />);

    // Check if main title is rendered
    expect(screen.getByText("İstatistikler")).toBeInTheDocument();

    // Check key metrics
    expect(screen.getByText("Toplam Tur")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument(); // Total tours
    expect(screen.getByText("Ortalama Puan")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument(); // Average rating
    expect(screen.getByText("Aktif Yıl")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Years active
    expect(screen.getByText("Toplam Yorum")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument(); // Total reviews
  });

  it("renders completion rate correctly", () => {
    render(<StatisticsCard statistics={mockCaptainProfile.statistics} />);

    expect(screen.getByText("Tamamlama Oranı")).toBeInTheDocument();
    expect(screen.getByText("98.5%")).toBeInTheDocument();
  });

  it("renders revenue and repeat customers when available", () => {
    render(<StatisticsCard statistics={mockCaptainProfile.statistics} />);

    expect(screen.getByText("Toplam Gelir")).toBeInTheDocument();
    expect(screen.getByText("₺125.000")).toBeInTheDocument();
    expect(screen.getByText("Tekrar Eden Müşteri")).toBeInTheDocument();
    expect(screen.getByText("67")).toBeInTheDocument();
  });

  it("handles minimal data correctly", () => {
    render(
      <StatisticsCard statistics={mockCaptainProfileMinimal.statistics} />
    );

    expect(screen.getByText("45")).toBeInTheDocument(); // Total tours
    expect(screen.getByText("4.2")).toBeInTheDocument(); // Average rating
    expect(screen.getByText("2")).toBeInTheDocument(); // Years active
    expect(screen.getByText("38")).toBeInTheDocument(); // Total reviews

    // Should not show revenue/repeat customers sections
    expect(screen.queryByText("Toplam Gelir")).not.toBeInTheDocument();
    expect(screen.queryByText("Tekrar Eden Müşteri")).not.toBeInTheDocument();
  });

  it("shows loading state correctly", () => {
    render(
      <StatisticsCard
        statistics={mockCaptainProfile.statistics}
        isLoading={true}
      />
    );

    expect(screen.getByText("İstatistikler")).toBeInTheDocument();
    // Loading state should show skeleton elements
    const skeletonElements = document.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("handles empty/no data state", () => {
    const emptyStats = {} as CaptainStatistics;
    render(<StatisticsCard statistics={emptyStats} />);

    expect(screen.getByText("Henüz İstatistik Yok")).toBeInTheDocument();
    expect(
      screen.getByText(
        "İlk turunuzu tamamladıktan sonra istatistikleriniz burada görünecek."
      )
    ).toBeInTheDocument();
  });

  it("handles zero values correctly", () => {
    const zeroStats: CaptainStatistics = {
      totalTours: 0,
      averageRating: 0,
      totalReviews: 0,
      completionRate: 0,
      yearsActive: 0,
    };
    render(<StatisticsCard statistics={zeroStats} />);

    expect(screen.getByText("Henüz İstatistik Yok")).toBeInTheDocument();
  });

  it("formats numbers correctly", () => {
    const highStats: CaptainStatistics = {
      totalTours: 1234,
      averageRating: 4.567,
      totalReviews: 5678,
      completionRate: 99.123,
      yearsActive: 10,
      totalRevenue: 1234567,
      repeatCustomers: 890,
    };
    render(<StatisticsCard statistics={highStats} />);

    // Check Turkish locale formatting
    expect(screen.getByText("1.234")).toBeInTheDocument(); // Total tours
    expect(screen.getByText("4.6")).toBeInTheDocument(); // Average rating (rounded)
    expect(screen.getByText("5.678")).toBeInTheDocument(); // Total reviews
    expect(screen.getByText("99.1%")).toBeInTheDocument(); // Completion rate
    expect(screen.getByText("₺1.234.567")).toBeInTheDocument(); // Revenue
    expect(screen.getByText("890")).toBeInTheDocument(); // Repeat customers
  });

  it("shows correct rating colors based on value", () => {
    const lowRatingStats: CaptainStatistics = {
      totalTours: 10,
      averageRating: 3.2,
      totalReviews: 8,
      completionRate: 85.0,
      yearsActive: 1,
    };
    render(<StatisticsCard statistics={lowRatingStats} />);

    const ratingElement = screen.getByText("3.2");
    expect(ratingElement).toHaveClass("text-orange-600");
  });

  it("handles undefined/null values gracefully", () => {
    const partialStats: CaptainStatistics = {
      totalTours: 50,
      averageRating: 4.5,
      totalReviews: 45,
      completionRate: 95.0,
      yearsActive: 3,
      totalRevenue: undefined,
      repeatCustomers: undefined,
    };
    render(<StatisticsCard statistics={partialStats} />);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    // Should not crash and should not show revenue/repeat customers
    expect(screen.queryByText("Toplam Gelir")).not.toBeInTheDocument();
  });

  it("renders charts when data is available", () => {
    render(<StatisticsCard statistics={mockCaptainProfile.statistics} />);

    expect(
      screen.getByText("Aylık Tur Dağılımı (Tahmini)")
    ).toBeInTheDocument();
    expect(screen.getByText("Müşteri Dağılımı")).toBeInTheDocument();
  });

  it("does not render charts when no tour data", () => {
    const noTourStats: CaptainStatistics = {
      totalTours: 0,
      averageRating: 0,
      totalReviews: 0,
      completionRate: 0,
      yearsActive: 1,
    };
    render(<StatisticsCard statistics={noTourStats} />);

    expect(
      screen.queryByText("Aylık Tur Dağılımı (Tahmini)")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Müşteri Dağılımı")).not.toBeInTheDocument();
  });

  it("shows customer distribution chart only when repeat customers exist", () => {
    const noRepeatCustomerStats: CaptainStatistics = {
      totalTours: 20,
      averageRating: 4.0,
      totalReviews: 18,
      completionRate: 90.0,
      yearsActive: 2,
      repeatCustomers: 0,
    };
    render(<StatisticsCard statistics={noRepeatCustomerStats} />);

    expect(
      screen.getByText("Aylık Tur Dağılımı (Tahmini)")
    ).toBeInTheDocument();
    expect(screen.queryByText("Müşteri Dağılımı")).not.toBeInTheDocument();
  });
});
