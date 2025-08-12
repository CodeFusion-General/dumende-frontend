import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";

import ProfileCompletionPage from "../ProfileCompletionPage";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserType } from "@/types/auth.types";

// Mock the ProfileCompletionForm component
vi.mock("@/components/profile/ProfileCompletionForm", () => ({
  ProfileCompletionForm: ({
    onSuccess,
  }: {
    onSuccess: (user: any) => void;
  }) => (
    <div data-testid="profile-completion-form">
      <button onClick={() => onSuccess({ id: 1, name: "Test User" })}>
        Complete Profile
      </button>
    </div>
  ),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
    useSearchParams: () => mockUseSearchParams(),
  };
});

// Mock toast
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock AuthContext
let mockAuthContextValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  hasRole: vi.fn(),
  isAdmin: vi.fn(),
  isBoatOwner: vi.fn(),
  isCustomer: vi.fn(),
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContextValue,
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

describe("ProfileCompletionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ accountId: "1" });
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);

    // Reset auth context to default state
    mockAuthContextValue = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      hasRole: vi.fn(),
      isAdmin: vi.fn(),
      isBoatOwner: vi.fn(),
      isCustomer: vi.fn(),
    };
  });

  it("shows loading state initially", () => {
    // Set loading state
    mockAuthContextValue.isLoading = true;

    const Wrapper = createWrapper();
    render(<ProfileCompletionPage />, { wrapper: Wrapper });

    expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
  });

  it("shows error when user is not authenticated", async () => {
    // Set not authenticated state
    mockAuthContextValue.isAuthenticated = false;
    mockAuthContextValue.user = null;
    mockAuthContextValue.isLoading = false;

    const Wrapper = createWrapper();
    render(<ProfileCompletionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText("Bu sayfaya erişmek için giriş yapmalısınız.")
      ).toBeInTheDocument();
    });
  });

  it("shows error when accountId is invalid", async () => {
    mockUseParams.mockReturnValue({ accountId: "invalid" });

    // Set authenticated state
    mockAuthContextValue.isAuthenticated = true;
    mockAuthContextValue.user = {
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: UserType.CUSTOMER,
      fullName: "Test User",
    };
    mockAuthContextValue.isLoading = false;

    const Wrapper = createWrapper();
    render(<ProfileCompletionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Geçersiz hesap kimliği.")).toBeInTheDocument();
    });
  });

  it("shows error when user tries to access different account", async () => {
    mockUseParams.mockReturnValue({ accountId: "2" }); // Different from user ID

    // Set authenticated state
    mockAuthContextValue.isAuthenticated = true;
    mockAuthContextValue.user = {
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: UserType.CUSTOMER,
      fullName: "Test User",
    };
    mockAuthContextValue.isLoading = false;

    const Wrapper = createWrapper();
    render(<ProfileCompletionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText("Bu hesaba erişim yetkiniz bulunmamaktadır.")
      ).toBeInTheDocument();
    });
  });

  it("renders profile completion form when all validations pass", async () => {
    // Set authenticated state with matching account ID
    mockAuthContextValue.isAuthenticated = true;
    mockAuthContextValue.user = {
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: UserType.CUSTOMER,
      fullName: "Test User",
    };
    mockAuthContextValue.isLoading = false;

    const Wrapper = createWrapper();
    render(<ProfileCompletionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Profil Tamamlama")).toBeInTheDocument();
      expect(screen.getByTestId("profile-completion-form")).toBeInTheDocument();
    });
  });

  it("displays page title and description correctly", async () => {
    // Set authenticated state with matching account ID
    mockAuthContextValue.isAuthenticated = true;
    mockAuthContextValue.user = {
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: UserType.CUSTOMER,
      fullName: "Test User",
    };
    mockAuthContextValue.isLoading = false;

    const Wrapper = createWrapper();
    render(<ProfileCompletionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Profil Tamamlama")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Hesabınızı tamamlamak için lütfen aşağıdaki bilgileri doldurun"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Bu bilgiler profilinizin tam olarak oluşturulması için gereklidir/
        )
      ).toBeInTheDocument();
    });
  });
});
