import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ProfilePhotoUpload from "../ProfilePhotoUpload";

// Mock the toast hook
const mockToast = vi.fn();
vi.mock("@/components/ui/use-toast", () => ({
  toast: mockToast,
}));

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: "data:image/jpeg;base64,mockImageData",
  onload: null as any,
  onerror: null as any,
};

Object.defineProperty(global, "FileReader", {
  writable: true,
  value: vi.fn(() => mockFileReader),
});

describe("ProfilePhotoUpload", () => {
  const defaultProps = {
    userName: "Ahmet Yılmaz",
    onPhotoChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader.onload = null;
    mockFileReader.onerror = null;
  });

  it("renders with default avatar when no photo provided", () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    // Should show initials in avatar fallback
    expect(screen.getByText("AY")).toBeInTheDocument();

    // Should show upload instructions
    expect(
      screen.getByText("Fotoğrafa tıklayarak değiştirin")
    ).toBeInTheDocument();
    expect(screen.getByText("JPEG, PNG, WebP • Max 5MB")).toBeInTheDocument();
  });

  it("renders with current photo when provided", () => {
    render(
      <ProfilePhotoUpload
        {...defaultProps}
        currentPhoto="/images/test-avatar.jpg"
      />
    );

    const avatarImage = screen.getByAltText("Ahmet Yılmaz profil fotoğrafı");
    expect(avatarImage).toHaveAttribute("src", "/images/test-avatar.jpg");
  });

  it("opens file dialog when avatar is clicked", () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    const fileInput = screen.getByRole("button", { hidden: true });
    const clickSpy = vi.spyOn(fileInput, "click");

    const avatar = screen.getByRole("button");
    fireEvent.click(avatar);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("validates file type correctly", async () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    const fileInput = screen.getByRole("button", {
      hidden: true,
    }) as HTMLInputElement;

    // Create invalid file (PDF)
    const invalidFile = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Geçersiz Dosya",
        description: "Sadece JPEG, PNG ve WebP formatları desteklenmektedir.",
        variant: "destructive",
      });
    });
  });

  it("validates file size correctly", async () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    const fileInput = screen.getByRole("button", {
      hidden: true,
    }) as HTMLInputElement;

    // Create oversized file (6MB)
    const oversizedFile = new File(["x".repeat(6 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Geçersiz Dosya",
        description: "Dosya boyutu 5MB'dan küçük olmalıdır.",
        variant: "destructive",
      });
    });
  });

  it("processes valid file upload successfully", async () => {
    const onPhotoChange = vi.fn();
    render(
      <ProfilePhotoUpload {...defaultProps} onPhotoChange={onPhotoChange} />
    );

    const fileInput = screen.getByRole("button", {
      hidden: true,
    }) as HTMLInputElement;

    // Create valid file
    const validFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader success
    await waitFor(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({
          target: { result: "data:image/jpeg;base64,mockImageData" },
        });
      }
    });

    await waitFor(() => {
      expect(onPhotoChange).toHaveBeenCalledWith(
        validFile,
        "data:image/jpeg;base64,mockImageData"
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: "Fotoğraf Yüklendi",
        description: "Profil fotoğrafınız başarıyla güncellendi.",
      });
    });
  });

  it("handles FileReader error", async () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    const fileInput = screen.getByRole("button", {
      hidden: true,
    }) as HTMLInputElement;
    const validFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader error
    await waitFor(() => {
      if (mockFileReader.onerror) {
        mockFileReader.onerror(new Error("FileReader error"));
      }
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    });
  });

  it("removes photo when remove button is clicked", async () => {
    const onPhotoChange = vi.fn();
    render(
      <ProfilePhotoUpload
        {...defaultProps}
        currentPhoto="/images/test-avatar.jpg"
        onPhotoChange={onPhotoChange}
      />
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    expect(onPhotoChange).toHaveBeenCalledWith(null, null);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Fotoğraf Kaldırıldı",
      description: "Profil fotoğrafınız kaldırıldı.",
    });
  });

  it("respects disabled state", () => {
    render(<ProfilePhotoUpload {...defaultProps} disabled={true} />);

    // Should not show upload instructions when disabled
    expect(
      screen.queryByText("Fotoğrafa tıklayarak değiştirin")
    ).not.toBeInTheDocument();

    // Should not show upload button when disabled
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders different sizes correctly", () => {
    const { rerender } = render(
      <ProfilePhotoUpload {...defaultProps} size="sm" />
    );

    let avatar = screen.getByRole("img", { hidden: true });
    expect(avatar.parentElement).toHaveClass("h-16", "w-16");

    rerender(<ProfilePhotoUpload {...defaultProps} size="lg" />);
    avatar = screen.getByRole("img", { hidden: true });
    expect(avatar.parentElement).toHaveClass(
      "h-32",
      "w-32",
      "md:h-40",
      "md:w-40"
    );
  });

  it("shows loading state during upload", async () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    const fileInput = screen.getByRole("button", {
      hidden: true,
    }) as HTMLInputElement;
    const validFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Should show loading spinner
    await waitFor(() => {
      expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    });
  });

  it("accepts only allowed file types", () => {
    render(<ProfilePhotoUpload {...defaultProps} />);

    const fileInput = screen.getByRole("button", {
      hidden: true,
    }) as HTMLInputElement;
    expect(fileInput).toHaveAttribute(
      "accept",
      "image/jpeg,image/jpg,image/png,image/webp"
    );
  });
});
