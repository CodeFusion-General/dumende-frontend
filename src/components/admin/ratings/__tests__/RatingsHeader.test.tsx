import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RatingsHeader from "../RatingsHeader";

describe("RatingsHeader", () => {
  const defaultProps = {
    totalReviews: 1250,
    averageRating: 4.3,
    onRefresh: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with correct title and breadcrumb", () => {
    render(<RatingsHeader {...defaultProps} />);

    expect(screen.getByText("Müşteri Değerlendirmeleri")).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Değerlendirmeler")).toBeInTheDocument();
  });

  it("displays correct statistics", () => {
    render(<RatingsHeader {...defaultProps} />);

    expect(screen.getByText("1.250 toplam değerlendirme")).toBeInTheDocument();
    expect(screen.getByText("4.3 ortalama puan")).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button is clicked", () => {
    render(<RatingsHeader {...defaultProps} />);

    const refreshButton = screen.getByRole("button", { name: /yenile/i });
    fireEvent.click(refreshButton);

    expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it("calls onExport when export button is clicked", () => {
    render(<RatingsHeader {...defaultProps} />);

    const exportButton = screen.getByRole("button", { name: /dışa aktar/i });
    fireEvent.click(exportButton);

    expect(defaultProps.onExport).toHaveBeenCalledTimes(1);
  });

  it("has proper responsive design classes", () => {
    render(<RatingsHeader {...defaultProps} />);

    const headerContainer = screen
      .getByText("Müşteri Değerlendirmeleri")
      .closest("div");
    expect(headerContainer?.parentElement).toHaveClass(
      "flex",
      "flex-col",
      "lg:flex-row"
    );
  });

  it("displays action buttons with correct icons", () => {
    render(<RatingsHeader {...defaultProps} />);

    const refreshButton = screen.getByRole("button", { name: /yenile/i });
    const exportButton = screen.getByRole("button", { name: /dışa aktar/i });

    expect(refreshButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
  });

  it("formats numbers correctly for Turkish locale", () => {
    const props = {
      ...defaultProps,
      totalReviews: 12345,
      averageRating: 4.567,
    };

    render(<RatingsHeader {...props} />);

    expect(screen.getByText("12.345 toplam değerlendirme")).toBeInTheDocument();
    expect(screen.getByText("4.6 ortalama puan")).toBeInTheDocument();
  });
});
