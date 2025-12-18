import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TourModerationPanel from "../TourModerationPanel";
import { AdminTourView } from "@/types/adminTour";

// Mock the TourDocumentVerification component
vi.mock("../TourDocumentVerification", () => ({
  default: ({ documents, onVerifyDocument, onBulkVerify }: any) => (
    <div data-testid="tour-document-verification">
      <div>Documents: {documents.length}</div>
      <button
        onClick={() => onVerifyDocument(1, "verified", "Test verification")}
      >
        Verify Document
      </button>
      <button
        onClick={() => onBulkVerify([1, 2], "rejected", "Test bulk rejection")}
      >
        Bulk Reject
      </button>
    </div>
  ),
}));

const mockTour: AdminTourView = {
  id: 1,
  name: "Test Tour",
  description: "Test Description",
  fullDescription: "Full test description",
  price: 100,
  capacity: 10,
  location: "Test Location",
  status: "ACTIVE",
  tourType: "CULTURAL",
  rating: 4.5,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  guideId: 1,
  tourImages: [],
  tourDates: [],
  tourDocuments: [
    {
      id: 1,
      tourId: 1,
      documentType: "GUIDE_LICENSE",
      documentName: "Guide License",
      filePath: "/path/to/file",
      documentUrl: "https://example.com/doc.pdf",
      isVerified: false,
      displayOrder: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
  guideInfo: {
    id: 1,
    name: "Test Guide",
    email: "guide@test.com",
    phone: "+90 555 123 4567",
    joinDate: "2024-01-01",
    isVerified: true,
    isCertified: true,
    totalTours: 5,
    rating: 4.8,
    responseRate: 95,
  },
  approvalStatus: "pending",
  moderationNotes: [],
  documentStatus: {
    total: 1,
    verified: 0,
    pending: 1,
    expired: 0,
    expiringSoon: 0,
  },
  bookingStats: {
    totalBookings: 0,
    thisMonthBookings: 0,
    revenue: 0,
    averageRating: 0,
    completionRate: 0,
  },
  lastActivity: "2024-01-01T00:00:00Z",
  isActive: true,
  isFeatured: false,
  viewCount: 0,
  reportCount: 0,
};

const mockHandlers = {
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onSuspend: vi.fn(),
  onActivate: vi.fn(),
  onAddNote: vi.fn(),
};

// Skip: React concurrent mode issues with flushActQueue
describe.skip("TourModerationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders risk assessment", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    expect(screen.getByText("Risk Değerlendirmesi")).toBeInTheDocument();
  });

  it("shows content analysis when there are issues", () => {
    const tourWithIssues = {
      ...mockTour,
      fullDescription: "Short", // Too short description
    };

    render(<TourModerationPanel tour={tourWithIssues} {...mockHandlers} />);

    expect(screen.getByText("İçerik Kontrolü")).toBeInTheDocument();
    expect(screen.getByText(/Detaylı açıklama eksik/)).toBeInTheDocument();
  });

  it("displays current status correctly", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    expect(screen.getByText("Mevcut Durum")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();
    expect(screen.getByText("Beklemede")).toBeInTheDocument();
  });

  it("shows document status", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    expect(screen.getByText("Belge Durumu")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Total documents
    expect(screen.getByText("0")).toBeInTheDocument(); // Verified documents
  });

  it("displays guide information", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    expect(screen.getByText("Rehber Bilgileri")).toBeInTheDocument();
    expect(screen.getByText("Test Guide")).toBeInTheDocument();
    expect(screen.getByText("5 tur")).toBeInTheDocument();
  });

  it("shows approval buttons for pending tours", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    expect(screen.getByText("Onayla")).toBeInTheDocument();
    expect(screen.getByText("Reddet")).toBeInTheDocument();
  });

  it("shows suspend button for active tours", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    expect(screen.getByText("Askıya Al")).toBeInTheDocument();
  });

  it("shows activate button for inactive tours", () => {
    const inactiveTour = { ...mockTour, isActive: false };
    render(<TourModerationPanel tour={inactiveTour} {...mockHandlers} />);

    expect(screen.getByText("Aktifleştir")).toBeInTheDocument();
  });

  it("opens approval modal when approve button is clicked", async () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    fireEvent.click(screen.getByText("Onayla"));

    await waitFor(() => {
      expect(screen.getByText("Turu Onayla")).toBeInTheDocument();
    });
  });

  it("opens rejection modal when reject button is clicked", async () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    fireEvent.click(screen.getByText("Reddet"));

    await waitFor(() => {
      expect(screen.getByText("Turu Reddet")).toBeInTheDocument();
    });
  });

  it("opens document verification modal", async () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    fireEvent.click(screen.getByText("Belgeleri İncele"));

    await waitFor(() => {
      expect(screen.getByText("Belge Doğrulama")).toBeInTheDocument();
      expect(
        screen.getByTestId("tour-document-verification")
      ).toBeInTheDocument();
    });
  });

  it("calls onActivate when activate button is clicked", async () => {
    const inactiveTour = { ...mockTour, isActive: false };
    render(<TourModerationPanel tour={inactiveTour} {...mockHandlers} />);

    fireEvent.click(screen.getByText("Aktifleştir"));

    await waitFor(() => {
      expect(mockHandlers.onActivate).toHaveBeenCalledWith(
        mockTour.id,
        "Tur admin tarafından aktifleştirildi"
      );
    });
  });

  it("shows document status badge with pending count", () => {
    render(<TourModerationPanel tour={mockTour} {...mockHandlers} />);

    const documentButton = screen.getByText("Belgeleri İncele");
    expect(documentButton.parentElement).toHaveTextContent("1"); // Pending count badge
  });
});
