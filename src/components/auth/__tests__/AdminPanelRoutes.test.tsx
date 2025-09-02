import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/auth.types";
import App from "@/App";

// Mock dependencies
vi.mock("@/contexts/AuthContext");
const mockUseAuth = vi.mocked(useAuth);

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

vi.mock("@/lib/accessibility-utils", () => ({
  accessibilityManager: {
    announcePageChange: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("@/lib/reduced-motion", () => ({
  accessibleAnimationController: {
    destroy: vi.fn(),
  },
}));

vi.mock("@/lib/browser-compatibility", () => ({
  browserCompatibilityManager: {
    logCompatibilityInfo: vi.fn(),
  },
  polyfillManager: {
    loadAllPolyfills: vi.fn(),
  },
}));

vi.mock("@/contexts/LanguageContext", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useLanguage: () => ({ language: "tr" }),
}));

vi.mock("@/components/auth/AuthNotificationsProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderWithRouter = (initialEntries: string[] = ["/"]) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Admin Panel Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login when accessing admin panel without authentication", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as any);

    renderWithRouter(["/adminPanel"]);

    // Should redirect to login (handled by AdminPanelRouteGuard)
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });

  it("should redirect to unauthorized when non-admin user tries to access admin panel", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.CUSTOMER },
      isAuthenticated: true,
    } as any);

    renderWithRouter(["/adminPanel"]);

    // Should redirect to unauthorized
    await waitFor(() => {
      expect(screen.getByText(/yetkisiz erişim/i)).toBeInTheDocument();
    });
  });

  it("should show admin dashboard when admin user accesses admin panel", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        role: UserType.ADMIN,
        email: "admin@test.com",
        username: "admin",
      },
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);

    renderWithRouter(["/adminPanel"]);

    // Should show admin dashboard
    await waitFor(() => {
      expect(
        screen.getByText(/Admin Paneline Hoş Geldiniz/i)
      ).toBeInTheDocument();
    });
  });

  it("should show unauthorized page when accessing /unauthorized", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.CUSTOMER },
      isAuthenticated: true,
    } as any);

    renderWithRouter(["/unauthorized"]);

    expect(screen.getByText(/yetkisiz erişim/i)).toBeInTheDocument();
  });
});
