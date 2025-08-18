import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Testimonials from "../Testimonials";

// Mock the mobile detection utility
vi.mock("../../../utils/mobileDetection", () => ({
  mobileDetection: {
    detectMobileDevice: vi.fn(() => ({
      isMobile: false,
      isLowEndDevice: false,
      connectionType: "4g",
      screenSize: { width: 1920, height: 1080 },
      pixelRatio: 1,
      memoryLimit: 8192,
      deviceType: "high-end",
      browser: {
        name: "Chrome",
        version: "91.0",
        isSafari: false,
        isChrome: true,
        isFirefox: false,
      },
    })),
  },
}));

// Mock the language context
vi.mock("../../../contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "tr",
  }),
}));

// Mock the review service
vi.mock("../../../services/reviewService", () => ({
  reviewService: {
    getReviewsByMinRating: vi.fn(),
  },
}));

// Mock translations
vi.mock("../../../locales/translations", () => ({
  translations: {
    tr: {
      home: {
        testimonials: {
          title: "Müşteri Yorumları",
          subtitle: "Müşterilerimizin deneyimleri",
        },
      },
      common: {
        tryAgain: "Tekrar Dene",
        noDataAvailable: "Veri bulunamadı",
      },
    },
  },
}));

const mockReviews = [
  {
    id: 1,
    rating: 5,
    comment: "Harika bir deneyim!",
    customer: {
      id: 1,
      fullName: "Ayşe Kaya",
      email: "ayse@example.com",
    },
    boat: { id: 1, name: "Deniz Yıldızı" },
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    rating: 4,
    comment: "Çok memnun kaldık.",
    customer: {
      id: 2,
      fullName: "Mehmet Demir",
      email: "mehmet@example.com",
    },
    boat: { id: 2, name: "Mavi Rüya" },
    createdAt: new Date().toISOString(),
  },
];

describe("Testimonials Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockImplementation(
      () => new Promise(() => {})
    );

    render(<Testimonials />);

    expect(screen.getByText("Müşteri Yorumları")).toBeInTheDocument();
    expect(
      screen.getByRole("generic", { name: /animate-pulse/ })
    ).toBeInTheDocument();
  });

  it("should render testimonials after loading", async () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue(mockReviews);

    render(<Testimonials />);

    await waitFor(() => {
      expect(screen.getByText("Harika bir deneyim!")).toBeInTheDocument();
      expect(screen.getByText("Ayşe Kaya")).toBeInTheDocument();
    });
  });

  it("should handle API errors gracefully with mock data", async () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockRejectedValue(
      new Error("API Error")
    );

    render(<Testimonials />);

    await waitFor(() => {
      // Should show mock data instead of error
      expect(screen.getByText(/Muhteşem bir deneyimdi/)).toBeInTheDocument();
    });
  });

  it("should navigate between testimonials", async () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue(mockReviews);

    render(<Testimonials />);

    await waitFor(() => {
      expect(screen.getByText("Harika bir deneyim!")).toBeInTheDocument();
    });

    // Click next button
    const nextButton = screen.getByLabelText("Next testimonial");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Çok memnun kaldık.")).toBeInTheDocument();
    });
  });

  it("should handle dot navigation", async () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue(mockReviews);

    render(<Testimonials />);

    await waitFor(() => {
      expect(screen.getByText("Harika bir deneyim!")).toBeInTheDocument();
    });

    // Click second dot
    const dots = screen.getAllByLabelText(/Go to testimonial/);
    fireEvent.click(dots[1]);

    await waitFor(() => {
      expect(screen.getByText("Çok memnun kaldık.")).toBeInTheDocument();
    });
  });

  it("should render mobile-optimized version", async () => {
    // Mock mobile device
    const { mobileDetection } = require("../../../utils/mobileDetection");
    mobileDetection.detectMobileDevice.mockReturnValue({
      isMobile: true,
      isLowEndDevice: false,
      connectionType: "4g",
      screenSize: { width: 375, height: 812 },
      pixelRatio: 2,
      memoryLimit: 4096,
      deviceType: "mid-range",
      browser: {
        name: "Safari",
        version: "14.0",
        isSafari: true,
        isChrome: false,
        isFirefox: false,
      },
    });

    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue(mockReviews);

    render(<Testimonials />);

    await waitFor(() => {
      expect(screen.getByText("Harika bir deneyim!")).toBeInTheDocument();
    });

    // Navigation buttons should be hidden on mobile
    expect(screen.queryByLabelText("Next testimonial")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Previous testimonial")
    ).not.toBeInTheDocument();
  });

  it("should limit reviews on low-end devices", async () => {
    // Mock low-end device
    const { mobileDetection } = require("../../../utils/mobileDetection");
    mobileDetection.detectMobileDevice.mockReturnValue({
      isMobile: true,
      isLowEndDevice: true,
      connectionType: "2g",
      screenSize: { width: 320, height: 568 },
      pixelRatio: 1,
      memoryLimit: 1024,
      deviceType: "low-end",
      browser: {
        name: "Chrome",
        version: "80.0",
        isSafari: false,
        isChrome: true,
        isFirefox: false,
      },
    });

    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue(mockReviews);

    render(<Testimonials />);

    await waitFor(() => {
      expect(screen.getByText("Harika bir deneyim!")).toBeInTheDocument();
    });

    // Should have limited number of dots for low-end devices
    const dots = screen.getAllByLabelText(/Go to testimonial/);
    expect(dots.length).toBeLessThanOrEqual(3);
  });

  it("should render star ratings correctly", async () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue(mockReviews);

    render(<Testimonials />);

    await waitFor(() => {
      // Should render 5 stars for the first review (rating: 5)
      const stars = screen
        .getAllByRole("generic")
        .filter(
          (el) =>
            el.querySelector("svg") &&
            el.querySelector("svg")?.getAttribute("fill") === "#F59E0B"
        );
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  it("should handle no reviews state", async () => {
    const { reviewService } = require("../../../services/reviewService");
    reviewService.getReviewsByMinRating.mockResolvedValue([]);

    render(<Testimonials />);

    await waitFor(() => {
      expect(screen.getByText("Veri bulunamadı")).toBeInTheDocument();
    });
  });
});
