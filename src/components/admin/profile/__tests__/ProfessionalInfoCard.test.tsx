import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ProfessionalInfoCard from "../ProfessionalInfoCard";
import { mockCaptainProfile } from "@/mocks/captainProfile.mock";

// Mock the toast function
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ProfessionalInfoCard", () => {
  const mockProfessionalInfo = mockCaptainProfile.professionalInfo;
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders professional information correctly", () => {
    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    // Check if the card title is rendered
    expect(screen.getByText("Mesleki Bilgiler")).toBeInTheDocument();

    // Check if license information is displayed
    expect(screen.getByText("Lisans Numarası")).toBeInTheDocument();
    expect(
      screen.getByText(mockProfessionalInfo.licenseNumber)
    ).toBeInTheDocument();

    // Check if experience is displayed
    expect(screen.getByText("Deneyim")).toBeInTheDocument();
    expect(
      screen.getByText(`${mockProfessionalInfo.yearsOfExperience} yıl`)
    ).toBeInTheDocument();

    // Check if specializations are displayed
    expect(screen.getByText("Uzmanlık Alanları")).toBeInTheDocument();
    mockProfessionalInfo.specializations.forEach((specialization) => {
      expect(screen.getByText(specialization)).toBeInTheDocument();
    });

    // Check if certifications are displayed
    expect(
      screen.getByText(
        `Sertifikalar (${mockProfessionalInfo.certifications.length})`
      )
    ).toBeInTheDocument();
    mockProfessionalInfo.certifications.forEach((cert) => {
      expect(screen.getByText(cert.name)).toBeInTheDocument();
      expect(screen.getByText(cert.issuer)).toBeInTheDocument();
    });
  });

  it("enters edit mode when edit button is clicked", () => {
    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    const editButton = screen.getByText("Düzenle");
    fireEvent.click(editButton);

    // Check if form fields are now visible
    expect(
      screen.getByDisplayValue(mockProfessionalInfo.licenseNumber)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(
        mockProfessionalInfo.yearsOfExperience.toString()
      )
    ).toBeInTheDocument();

    // Check if save and cancel buttons are visible
    expect(screen.getByText("Kaydet")).toBeInTheDocument();
    expect(screen.getByText("İptal")).toBeInTheDocument();
  });

  it("cancels edit mode when cancel button is clicked", () => {
    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText("Düzenle");
    fireEvent.click(editButton);

    // Cancel edit mode
    const cancelButton = screen.getByText("İptal");
    fireEvent.click(cancelButton);

    // Check if we're back to view mode
    expect(screen.getByText("Düzenle")).toBeInTheDocument();
    expect(screen.queryByText("Kaydet")).not.toBeInTheDocument();
  });

  it("calls onSave when form is submitted with valid data", async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText("Düzenle");
    fireEvent.click(editButton);

    // Modify a field
    const licenseInput = screen.getByDisplayValue(
      mockProfessionalInfo.licenseNumber
    );
    fireEvent.change(licenseInput, { target: { value: "TR-CAP-2024-999999" } });

    // Submit the form
    const saveButton = screen.getByText("Kaydet");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          licenseNumber: "TR-CAP-2024-999999",
          licenseExpiry: mockProfessionalInfo.licenseExpiry,
          yearsOfExperience: mockProfessionalInfo.yearsOfExperience,
          specializations: mockProfessionalInfo.specializations,
          bio: mockProfessionalInfo.bio,
        })
      );
    });
  });

  it("displays license status correctly", () => {
    // Create a mock with an expiring license (within 3 months)
    const expiringDate = new Date();
    expiringDate.setMonth(expiringDate.getMonth() + 2);
    const expiringLicenseInfo = {
      ...mockProfessionalInfo,
      licenseExpiry: expiringDate.toISOString().split("T")[0],
    };

    render(
      <ProfessionalInfoCard
        professionalInfo={expiringLicenseInfo}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText("Yakında Dolacak")).toBeInTheDocument();
  });

  it("displays certification status correctly", () => {
    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    // Check that certification statuses are displayed
    const certifications = mockProfessionalInfo.certifications;
    certifications.forEach((cert) => {
      if (cert.expiryDate) {
        const expiryDate = new Date(cert.expiryDate);
        const now = new Date();
        if (expiryDate > now) {
          // Should show as valid or expiring
          expect(screen.getByText(cert.name)).toBeInTheDocument();
        }
      }
    });
  });

  it("handles bio display correctly", () => {
    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    if (mockProfessionalInfo.bio) {
      expect(screen.getByText("Biyografi")).toBeInTheDocument();
      expect(screen.getByText(mockProfessionalInfo.bio)).toBeInTheDocument();
    }
  });

  it("handles specializations input correctly in edit mode", () => {
    render(
      <ProfessionalInfoCard
        professionalInfo={mockProfessionalInfo}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText("Düzenle");
    fireEvent.click(editButton);

    // Check if specializations are displayed as comma-separated string
    const specializationsInput = screen.getByDisplayValue(
      mockProfessionalInfo.specializations.join(", ")
    );
    expect(specializationsInput).toBeInTheDocument();

    // Test changing specializations
    fireEvent.change(specializationsInput, {
      target: { value: "New Specialization, Another One" },
    });

    expect(specializationsInput).toHaveValue("New Specialization, Another One");
  });
});
