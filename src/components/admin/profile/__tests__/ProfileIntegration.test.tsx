import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EnhancedProfilePage from "../EnhancedProfilePage";

// Mock the hooks
jest.mock("@/hooks/useProfileState", () => ({
  useProfileState: () => ({
    state: {
      isInitialLoading: false,
      isLoading: false,
      isSaving: false,
      isUploading: false,
      isRetrying: false,
      hasError: false,
    },
    actions: {
      setInitialLoading: jest.fn(),
      reset: jest.fn(),
    },
    operations: {
      loadProfile: jest.fn().mockResolvedValue({}),
      saveProfile: jest.fn().mockResolvedValue({}),
    },
  }),
}));

jest.mock("@/hooks/useRetry", () => ({
  useRetry: () => ({
    executeWithRetry: jest.fn().mockResolvedValue({}),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Profile Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders profile page with all components", async () => {
    render(
      <TestWrapper>
        <EnhancedProfilePage />
      </TestWrapper>
    );

    // Check if main heading is present
    await waitFor(() => {
      expect(screen.getByText("Profil Bilgileri")).toBeInTheDocument();
    });

    // Check if description is present
    expect(
      screen.getByText(
        "Kişisel ve mesleki bilgilerinizi görüntüleyin ve düzenleyin."
      )
    ).toBeInTheDocument();
  });

  test("displays loading state initially", () => {
    // Mock loading state
    jest.doMock("@/hooks/useProfileState", () => ({
      useProfileState: () => ({
        state: {
          isInitialLoading: true,
          isLoading: false,
          isSaving: false,
          isUploading: false,
          isRetrying: false,
          hasError: false,
        },
        actions: {
          setInitialLoading: jest.fn(),
          reset: jest.fn(),
        },
        operations: {
          loadProfile: jest.fn().mockResolvedValue({}),
          saveProfile: jest.fn().mockResolvedValue({}),
        },
      }),
    }));

    render(
      <TestWrapper>
        <EnhancedProfilePage />
      </TestWrapper>
    );

    // Should show loading skeletons
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  test("handles error state properly", () => {
    // Mock error state
    jest.doMock("@/hooks/useProfileState", () => ({
      useProfileState: () => ({
        state: {
          isInitialLoading: true,
          isLoading: false,
          isSaving: false,
          isUploading: false,
          isRetrying: false,
          hasError: true,
        },
        actions: {
          setInitialLoading: jest.fn(),
          reset: jest.fn(),
        },
        operations: {
          loadProfile: jest.fn().mockRejectedValue(new Error("Network error")),
          saveProfile: jest.fn().mockResolvedValue({}),
        },
      }),
    }));

    render(
      <TestWrapper>
        <EnhancedProfilePage />
      </TestWrapper>
    );

    // Should show error message
    expect(screen.getByText("Profil Yüklenemedi")).toBeInTheDocument();
    expect(screen.getByText("Tekrar Dene")).toBeInTheDocument();
  });

  test("accessibility compliance", async () => {
    render(
      <TestWrapper>
        <EnhancedProfilePage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check for proper heading structure
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent("Profil Bilgileri");
    });
  });
});
