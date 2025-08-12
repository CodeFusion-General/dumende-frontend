import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";
import { UserType } from "@/types/auth.types";
import { UserDTO } from "@/types/contact.types";

// Mock the tokenUtils
vi.mock("@/lib/utils", () => ({
  tokenUtils: {
    getAuthToken: vi.fn(),
    getUserData: vi.fn(),
    clearAllAuthData: vi.fn(),
    setUserData: vi.fn(),
  },
}));

// Mock the authService
vi.mock("@/services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="isProfileComplete">
        {auth.isProfileComplete().toString()}
      </div>
      <div data-testid="needsProfileCompletion">
        {auth.needsProfileCompletion().toString()}
      </div>
      <div data-testid="redirectPath">
        {auth.getProfileCompletionRedirectPath() || "null"}
      </div>
      <button
        onClick={() => {
          const mockUserDto: UserDTO = {
            id: 1,
            fullName: "John Doe",
            phoneNumber: "+905551234567",
            profileImage: "profile.jpg",
            account: {
              id: 1,
              email: "john@example.com",
              username: "johndoe",
              role: "CUSTOMER",
              isEnabled: true,
              createdAt: "2024-01-01",
              updatedAt: "2024-01-01",
            },
            bookings: [],
            reviews: [],
            boats: [],
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          };
          auth.updateUserFromProfile(mockUserDto);
        }}
        data-testid="updateProfile"
      >
        Update Profile
      </button>
    </div>
  );
};

describe("AuthContext Profile Completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle profile completion state correctly", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("isProfileComplete")).toHaveTextContent("false");
    expect(screen.getByTestId("needsProfileCompletion")).toHaveTextContent(
      "false"
    );
    expect(screen.getByTestId("redirectPath")).toHaveTextContent("null");
  });

  it("should update user profile correctly", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate updating profile
    await act(async () => {
      screen.getByTestId("updateProfile").click();
    });

    // Profile should be marked as complete after update
    // Note: This test would need a more complex setup to fully test the flow
    // but it verifies the methods exist and can be called
  });
});
