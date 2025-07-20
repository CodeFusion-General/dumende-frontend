import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReviewCard from "../ReviewCard";
import { MockReviewData } from "@/types/ratings.types";

const mockReview: MockReviewData = {
  id: "test-review-1",
  userName: "Ahmet Yılmaz",
  userInitials: "AY",
  rating: 5,
  comment:
    "Harika bir deneyimdi! Tekne çok temizdi ve mürettebat son derece profesyoneldi.",
  date: "2024-01-15",
  category: "boat",
  entityName: "Sunset Princess",
  entityId: "boat-1",
  isVerified: true,
  helpfulCount: 12,
  location: "Bodrum",
};

const mockHandlers = {
  onReply: vi.fn(),
  onFlag: vi.fn(),
  onDelete: vi.fn(),
};

describe("ReviewCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders review information correctly", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    expect(screen.getByText("15 Ocak 2024")).toBeInTheDocument();
    expect(screen.getByText("Sunset Princess")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("displays user avatar with initials", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    expect(screen.getByText("AY")).toBeInTheDocument();
  });

  it("shows correct number of filled stars based on rating", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    const stars = screen.getAllByRole("img", { hidden: true });
    // Should have 5 star icons
    expect(stars).toHaveLength(5);
  });

  it("displays category badge with correct styling", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    expect(screen.getByText("Tekne")).toBeInTheDocument();
  });

  it("shows verification badge for verified users", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    expect(screen.getByText("Doğrulanmış")).toBeInTheDocument();
  });

  it("displays helpful count when greater than 0", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    expect(screen.getByText("12 kişi faydalı buldu")).toBeInTheDocument();
  });

  it("does not display helpful count when 0", () => {
    const reviewWithNoHelpful = { ...mockReview, helpfulCount: 0 };
    render(<ReviewCard review={reviewWithNoHelpful} {...mockHandlers} />);

    expect(screen.queryByText("0 kişi faydalı buldu")).not.toBeInTheDocument();
  });

  it("calls onReply when reply button is clicked", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    const replyButton = screen.getByText("Yanıtla");
    fireEvent.click(replyButton);

    expect(mockHandlers.onReply).toHaveBeenCalledWith("test-review-1");
  });

  it("calls onFlag when flag button is clicked", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    const flagButton = screen.getByText("Bayrakla");
    fireEvent.click(flagButton);

    expect(mockHandlers.onFlag).toHaveBeenCalledWith("test-review-1");
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    const deleteButton = screen.getByText("Sil");
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith("test-review-1");
  });

  it("displays tour category correctly", () => {
    const tourReview = { ...mockReview, category: "tour" as const };
    render(<ReviewCard review={tourReview} {...mockHandlers} />);

    expect(screen.getByText("Tur")).toBeInTheDocument();
  });

  it("does not show verification badge for unverified users", () => {
    const unverifiedReview = { ...mockReview, isVerified: false };
    render(<ReviewCard review={unverifiedReview} {...mockHandlers} />);

    expect(screen.queryByText("Doğrulanmış")).not.toBeInTheDocument();
  });

  it("formats date correctly in Turkish locale", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    expect(screen.getByText("15 Ocak 2024")).toBeInTheDocument();
  });

  it("applies hover effects on card", () => {
    render(<ReviewCard review={mockReview} {...mockHandlers} />);

    const card =
      screen.getByRole("article") ||
      screen.getByText("Ahmet Yılmaz").closest(".shadow-sm");
    expect(card).toHaveClass("hover:shadow-lg");
  });

  it("renders expandable text for long comments", () => {
    const longComment = "Bu çok uzun bir yorum metni ".repeat(20);
    const reviewWithLongComment = { ...mockReview, comment: longComment };

    render(<ReviewCard review={reviewWithLongComment} {...mockHandlers} />);

    // ExpandableText component should be rendered
    expect(screen.getByText(longComment, { exact: false })).toBeInTheDocument();
  });
});
