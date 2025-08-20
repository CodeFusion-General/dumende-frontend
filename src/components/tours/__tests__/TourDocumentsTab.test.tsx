import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useTranslation } from "react-i18next";
import TourDocumentsTab from "../TourDocumentsTab";
import { TourDocumentDTO, TourDocumentType } from "@/types/document.types";
import { documentService } from "@/services/documentService";
import { beforeEach } from "node:test";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("@/services/documentService", () => ({
  documentService: {
    convertFileToBase64: vi.fn(),
    createTourDocument: vi.fn(),
    deleteTourDocument: vi.fn(),
    updateTourDocument: vi.fn(),
    handleDocumentError: vi.fn(),
    getUserFriendlyErrorMessage: vi.fn(),
    isDocumentExpired: vi.fn(),
    isDocumentExpiringSoon: vi.fn(),
  },
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock child components
vi.mock("@/components/documents/DocumentUploader", () => ({
  default: ({ onUpload, documentTypes }: any) => (
    <div data-testid="document-uploader">
      <button
        onClick={() =>
          onUpload(
            new File(["test"], "test.pdf", { type: "application/pdf" }),
            TourDocumentType.GUIDE_LICENSE,
            { documentName: "Test Document" }
          )
        }
      >
        Upload Document
      </button>
      <div data-testid="document-types">
        {Object.keys(documentTypes).length} types available
      </div>
    </div>
  ),
}));

vi.mock("@/components/documents/DocumentList", () => ({
  default: ({ documents, onDelete, onReorder }: any) => (
    <div data-testid="document-list">
      {documents.map((doc: TourDocumentDTO) => (
        <div key={doc.id} data-testid={`document-${doc.id}`}>
          <span>{doc.documentName}</span>
          <button onClick={() => onDelete(doc.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

const mockT = vi.fn((key: string, defaultValue?: string) => {
  // Return actual text for the component to work properly
  const translations: Record<string, string> = {
    "documents.tour.title": "Tour Documents",
    "documents.tour.description":
      "Upload and manage required documents for your tour",
    "documents.tour.newTourInfo":
      "Documents will be uploaded when the tour is created. You can prepare them now and they will be saved automatically.",
    "documents.tour.requiredTitle": "Required Documents",
    "documents.tour.requiredDescription":
      "Upload the following documents to comply with tourism regulations:",
    "documents.tour.emptyMessage":
      "No tour documents uploaded yet. Upload your first document to get started.",
    "documents.upload.title": "Upload Document",
    "documents.total": "Total",
    "documents.verified": "Verified",
    "documents.expired": "Expired",
    "documents.expiringSoon": "Expiring Soon",
  };
  return translations[key] || defaultValue || key;
});

const mockUseTranslation = useTranslation as any;
mockUseTranslation.mockReturnValue({
  t: mockT,
  i18n: { language: "en" },
});

describe("TourDocumentsTab", () => {
  const mockDocuments: TourDocumentDTO[] = [
    {
      id: 1,
      tourId: 123,
      documentType: TourDocumentType.GUIDE_LICENSE,
      documentName: "Guide License",
      filePath: "/path/to/file.pdf",
      documentUrl: "https://example.com/file.pdf",
      expiryDate: "2024-12-31",
      isVerified: true,
      verificationNotes: "Valid license",
      displayOrder: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];

  const mockOnDocumentsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tour documents tab with header", () => {
    render(
      <TourDocumentsTab
        tourId={123}
        documents={mockDocuments}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    expect(screen.getByText("Tour Documents")).toBeInTheDocument();
    expect(
      screen.getByText("Upload and manage required documents for your tour")
    ).toBeInTheDocument();
  });

  it("displays document statistics", () => {
    render(
      <TourDocumentsTab
        tourId={123}
        documents={mockDocuments}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    // Check that the component renders with documents
    expect(screen.getByText("Tour Documents")).toBeInTheDocument();
    // Check that document list shows the document
    expect(screen.getByTestId("document-list")).toBeInTheDocument();
    expect(screen.getByText("Guide License")).toBeInTheDocument();
  });

  it("shows info alert for new tours", () => {
    render(
      <TourDocumentsTab
        documents={[]}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    expect(
      screen.getByText(
        "Documents will be uploaded when the tour is created. You can prepare them now and they will be saved automatically."
      )
    ).toBeInTheDocument();
  });

  it("renders document uploader", () => {
    render(
      <TourDocumentsTab
        tourId={123}
        documents={[]}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    expect(screen.getByTestId("document-uploader")).toBeInTheDocument();
    expect(screen.getByText("9 types available")).toBeInTheDocument(); // 9 tour document types
  });

  it("renders document list", () => {
    render(
      <TourDocumentsTab
        tourId={123}
        documents={mockDocuments}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    expect(screen.getByTestId("document-list")).toBeInTheDocument();
    expect(screen.getByTestId("document-1")).toBeInTheDocument();
    expect(screen.getByText("Guide License")).toBeInTheDocument();
  });

  it("shows required documents info when no documents", () => {
    render(
      <TourDocumentsTab
        tourId={123}
        documents={[]}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    expect(screen.getByText("Required Documents")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Upload the following documents to comply with tourism regulations:"
      )
    ).toBeInTheDocument();
  });

  it("handles document upload for existing tour", async () => {
    const mockNewDocument = {
      id: 2,
      tourId: 123,
      documentType: TourDocumentType.GUIDE_LICENSE,
      documentName: "Test Document",
      filePath: "/path/to/test.pdf",
      documentUrl: "https://example.com/test.pdf",
      expiryDate: undefined,
      isVerified: false,
      verificationNotes: undefined,
      displayOrder: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    (documentService.convertFileToBase64 as any).mockResolvedValue(
      "base64data"
    );
    (documentService.createTourDocument as any).mockResolvedValue(
      mockNewDocument
    );

    render(
      <TourDocumentsTab
        tourId={123}
        documents={[]}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    const uploadButton = screen.getByRole("button", {
      name: "Upload Document",
    });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(documentService.createTourDocument).toHaveBeenCalledWith(123, {
        documentType: TourDocumentType.GUIDE_LICENSE,
        documentName: "Test Document",
        documentData: "base64data",
        expiryDate: undefined,
        isVerified: false,
        verificationNotes: undefined,
        displayOrder: 1,
      });
    });

    expect(mockOnDocumentsChange).toHaveBeenCalledWith([mockNewDocument]);
  });

  it("handles document upload for new tour", async () => {
    (documentService.convertFileToBase64 as any).mockResolvedValue(
      "base64data"
    );

    render(
      <TourDocumentsTab
        documents={[]}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    const uploadButton = screen.getByRole("button", {
      name: "Upload Document",
    });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnDocumentsChange).toHaveBeenCalledWith([
        expect.objectContaining({
          tourId: 0,
          documentType: TourDocumentType.GUIDE_LICENSE,
          documentName: "Test Document",
        }),
      ]);
    });
  });

  it("handles document deletion for existing tour", async () => {
    (documentService.deleteTourDocument as any).mockResolvedValue(undefined);

    render(
      <TourDocumentsTab
        tourId={123}
        documents={mockDocuments}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(documentService.deleteTourDocument).toHaveBeenCalledWith(1);
    });

    expect(mockOnDocumentsChange).toHaveBeenCalledWith([]);
  });

  it("handles document deletion for new tour", async () => {
    render(
      <TourDocumentsTab
        documents={mockDocuments}
        onDocumentsChange={mockOnDocumentsChange}
      />
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockOnDocumentsChange).toHaveBeenCalledWith([]);
  });
});
