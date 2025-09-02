import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AdminPanelRouteGuard } from "../AdminPanelRouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/auth.types";

// Mock the useAuth hook
vi.mock("@/contexts/AuthContext");
const mockUseAuth = vi.mocked(useAuth);

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return <div data-testid="navigate-to">{to}</div>;
    },
    useLocation: () => ({ pathname: "/adminPanel" }),
  };
});

const TestComponent = () => (
  <div data-testid="protected-content">Admin Panel Content</div>
);

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AdminPanelRouteGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as any);

    renderWithRouter(
      <AdminPanelRouteGuard>
        <TestComponent />
      </AdminPanelRouteGuard>
    );

    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should redirect to unauthorized when user is CUSTOMER", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.CUSTOMER },
      isAuthenticated: true,
    } as any);

    renderWithRouter(
      <AdminPanelRouteGuard>
        <TestComponent />
      </AdminPanelRouteGuard>
    );

    expect(screen.getByTestId("navigate-to")).toHaveTextContent(
      "/unauthorized"
    );
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should redirect to unauthorized when user is BOAT_OWNER", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.BOAT_OWNER },
      isAuthenticated: true,
    } as any);

    renderWithRouter(
      <AdminPanelRouteGuard>
        <TestComponent />
      </AdminPanelRouteGuard>
    );

    expect(screen.getByTestId("navigate-to")).toHaveTextContent(
      "/unauthorized"
    );
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should allow access when user is ADMIN", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.ADMIN },
      isAuthenticated: true,
    } as any);

    renderWithRouter(
      <AdminPanelRouteGuard>
        <TestComponent />
      </AdminPanelRouteGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate-to")).not.toBeInTheDocument();
  });

  it("should redirect to login when user exists but not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.ADMIN },
      isAuthenticated: false,
    } as any);

    renderWithRouter(
      <AdminPanelRouteGuard>
        <TestComponent />
      </AdminPanelRouteGuard>
    );

    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });
});
