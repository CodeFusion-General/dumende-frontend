import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProfilePage from "@/pages/admin/ProfilePage";

// Mock the useIsMobile hook
const mockUseIsMobile = vi.fn();
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Mock the sidebar components
vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Toggle</button>,
  useSidebar: () => ({ state: "expanded" }),
}));

// Mock the layout components
vi.mock("@/components/admin/layout/CaptainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="captain-layout">{children}</div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Profile Page Responsive Design", () => {
  beforeEach(() => {
    // Reset mocks
    mockUseIsMobile.mockReset();
  });

  it("renders profile page with responsive layout on desktop", () => {
    mockUseIsMobile.mockReturnValue(false);

    renderWithRouter(<ProfilePage />);

    // Check that main components are rendered
    expect(screen.getByText("Mesleki Bilgiler")).toBeInTheDocument();
    expect(screen.getByText("Kişisel Bilgiler")).toBeInTheDocument();
    expect(screen.getByText("İstatistikler")).toBeInTheDocument();
  });

  it("renders profile page with responsive layout on mobile", () => {
    mockUseIsMobile.mockReturnValue(true);

    renderWithRouter(<ProfilePage />);

    // Check that main components are rendered
    expect(screen.getByText("Mesleki Bilgiler")).toBeInTheDocument();
    expect(screen.getByText("Kişisel Bilgiler")).toBeInTheDocument();
    expect(screen.getByText("İstatistikler")).toBeInTheDocument();
  });

  it("applies correct responsive classes to profile page container", () => {
    renderWithRouter(<ProfilePage />);

    // Check for responsive spacing classes
    const container = screen.getByTestId("captain-layout").firstChild;
    expect(container).toHaveClass(
      "space-y-4",
      "sm:space-y-6",
      "px-2",
      "sm:px-0"
    );
  });
});
