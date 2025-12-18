import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminPanelLayout from "../AdminPanelLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/auth.types";

// Mock dependencies
vi.mock("@/contexts/AuthContext");
const mockUseAuth = vi.mocked(useAuth);

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("../AdminPanelSidebar", () => ({
  default: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

vi.mock("../AdminPanelHeader", () => ({
  default: ({
    title,
    actions,
  }: {
    title?: string;
    actions?: React.ReactNode;
  }) => (
    <div data-testid="admin-header">
      <span>Header: {title}</span>
      {actions && <div data-testid="header-actions">{actions}</div>}
    </div>
  ),
}));

vi.mock("../AdminPanelBreadcrumb", () => ({
  default: ({ items }: { items?: any[] }) => (
    <div data-testid="admin-breadcrumb">
      Breadcrumb: {items ? items.length : "auto"}
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AdminPanelLayout", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: UserType.ADMIN, email: "admin@test.com" },
      isAuthenticated: true,
    } as any);
  });

  it("should render all layout components", () => {
    renderWithRouter(
      <AdminPanelLayout>
        <div data-testid="test-content">Test Content</div>
      </AdminPanelLayout>
    );

    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByTestId("admin-breadcrumb")).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("should pass title to header", () => {
    renderWithRouter(
      <AdminPanelLayout title="Test Page">
        <div>Content</div>
      </AdminPanelLayout>
    );

    expect(screen.getByText("Header: Test Page")).toBeInTheDocument();
  });

  it("should pass actions to header", () => {
    const actions = <button data-testid="test-action">Test Action</button>;

    renderWithRouter(
      <AdminPanelLayout actions={actions}>
        <div>Content</div>
      </AdminPanelLayout>
    );

    expect(screen.getByTestId("header-actions")).toBeInTheDocument();
    expect(screen.getByTestId("test-action")).toBeInTheDocument();
  });

  it("should apply noPadding class when specified", () => {
    renderWithRouter(
      <AdminPanelLayout noPadding>
        <div data-testid="test-content">Content</div>
      </AdminPanelLayout>
    );

    const mainElement = screen.getByRole("main");
    expect(mainElement).not.toHaveClass("p-6");
  });

  it("should apply padding by default", () => {
    renderWithRouter(
      <AdminPanelLayout>
        <div data-testid="test-content">Content</div>
      </AdminPanelLayout>
    );

    const mainElement = screen.getByRole("main");
    expect(mainElement).toHaveClass("p-6");
  });
});
