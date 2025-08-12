import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { RegisterForm } from "../RegisterForm";
import { useAuth } from "@/contexts/AuthContext";

// Mock the useAuth hook
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockRegister = vi.fn();

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      register: mockRegister,
      isLoading: false,
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("should call onProfileCompletionRedirect when accountId is available", async () => {
    const mockOnProfileCompletionRedirect = vi.fn();
    const mockResponse = {
      accountId: 123,
      token: "test-token",
      userId: 1,
      email: "test@example.com",
      username: "testuser",
      role: "CUSTOMER",
    };

    mockRegister.mockResolvedValue(mockResponse);

    renderWithRouter(
      <RegisterForm
        onProfileCompletionRedirect={mockOnProfileCompletionRedirect}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Ad Soyad/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/E-posta/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Kullanıcı Adı/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Telefon Numarası/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/^Şifre$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Şifre Tekrarı/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Hesap Oluştur/i }));

    await waitFor(() => {
      expect(mockOnProfileCompletionRedirect).toHaveBeenCalledWith(123);
    });
  });

  it("should navigate directly when no callback is provided but accountId is available", async () => {
    const mockResponse = {
      accountId: 456,
      token: "test-token",
      userId: 1,
      email: "test@example.com",
      username: "testuser",
      role: "CUSTOMER",
    };

    mockRegister.mockResolvedValue(mockResponse);

    renderWithRouter(<RegisterForm />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Ad Soyad/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/E-posta/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Kullanıcı Adı/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Telefon Numarası/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/^Şifre$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Şifre Tekrarı/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Hesap Oluştur/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/profile-completion/456");
    });
  });

  it("should call onSuccess when no accountId is available", async () => {
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      token: "test-token",
      userId: 1,
      email: "test@example.com",
      username: "testuser",
      role: "CUSTOMER",
      // No accountId
    };

    mockRegister.mockResolvedValue(mockResponse);

    renderWithRouter(<RegisterForm onSuccess={mockOnSuccess} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Ad Soyad/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/E-posta/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Kullanıcı Adı/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Telefon Numarası/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/^Şifre$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Şifre Tekrarı/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Hesap Oluştur/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
