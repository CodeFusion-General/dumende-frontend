import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBookingMessaging } from "../useBookingMessaging";
import { BookingDTO, BookingStatus } from "@/types/booking.types";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "../useMessages";
import * as conversationUtils from "@/utils/conversationUtils";

// Mock dependencies
vi.mock("@/contexts/AuthContext");
vi.mock("../useMessages");
vi.mock("@/utils/conversationUtils");

const mockUseAuth = vi.mocked(useAuth);
const mockUseMessages = vi.mocked(useMessages);
const mockConversationUtils = vi.mocked(conversationUtils);

describe("useBookingMessaging", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
  };

  const mockBooking: BookingDTO = {
    id: 123,
    customerId: 1,
    boatId: 456,
    startDate: "2024-01-15T14:30:00",
    endDate: "2024-01-15T18:30:00",
    status: BookingStatus.CONFIRMED,
    totalPrice: 500,
    passengerCount: 4,
    createdAt: "2024-01-01T10:00:00",
    updatedAt: "2024-01-01T10:00:00",
  };

  const mockMessagesHook = {
    messages: [],
    isLoading: false,
    isLoadingMore: false,
    isSending: false,
    error: null,
    hasMore: false,
    sendMessage: vi.fn(),
    loadMore: vi.fn(),
    refresh: vi.fn(),
    markAsRead: vi.fn(),
    retry: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUseMessages.mockReturnValue(mockMessagesHook);

    // Mock conversation utils
    mockConversationUtils.extractCaptainIdFromBooking.mockResolvedValue(789);
    mockConversationUtils.generateBookingConversationId.mockReturnValue(
      "booking_123_1_789"
    );
    mockConversationUtils.validateBookingMessagingAccess.mockResolvedValue({
      hasAccess: true,
      captainId: 789,
    });
    mockConversationUtils.isMessagingEnabledForBookingStatus.mockReturnValue(
      true
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useBookingMessaging(null));

      expect(result.current.conversationId).toBeNull();
      expect(result.current.captainId).toBeNull();
      expect(result.current.isMessagingEnabled).toBe(false);
      expect(result.current.hasAccess).toBe(false);
      expect(result.current.accessError).toBeNull();
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.isValidating).toBe(false);
    });

    it("should not initialize messaging when booking is null", () => {
      const { result } = renderHook(() => useBookingMessaging(null));

      expect(
        mockConversationUtils.extractCaptainIdFromBooking
      ).not.toHaveBeenCalled();
      expect(result.current.isMessagingEnabled).toBe(false);
    });

    it("should not initialize messaging when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      expect(
        mockConversationUtils.extractCaptainIdFromBooking
      ).not.toHaveBeenCalled();
      expect(result.current.isMessagingEnabled).toBe(false);
    });
  });

  describe("captain ID extraction", () => {
    it("should extract captain ID from booking data", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(
          mockConversationUtils.extractCaptainIdFromBooking
        ).toHaveBeenCalledWith(mockBooking);
      });

      await waitFor(() => {
        expect(result.current.captainId).toBe(789);
      });
    });

    it("should handle captain ID extraction failure", async () => {
      mockConversationUtils.extractCaptainIdFromBooking.mockRejectedValue(
        new Error("Failed to extract captain ID")
      );

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.accessError).toContain(
          "Failed to extract captain ID"
        );
        expect(result.current.isMessagingEnabled).toBe(false);
      });
    });
  });

  describe("conversation ID generation", () => {
    it("should generate conversation ID for booking context", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(
          mockConversationUtils.generateBookingConversationId
        ).toHaveBeenCalledWith(
          123, // bookingId
          1, // customerId (user.id)
          789 // captainId
        );
      });

      await waitFor(() => {
        expect(result.current.conversationId).toBe("booking_123_1_789");
      });
    });
  });

  describe("booking status validation", () => {
    it("should enable messaging for CONFIRMED booking", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(
          mockConversationUtils.isMessagingEnabledForBookingStatus
        ).toHaveBeenCalledWith(BookingStatus.CONFIRMED);
      });

      await waitFor(() => {
        expect(result.current.isMessagingEnabled).toBe(true);
      });
    });

    it("should disable messaging for CANCELLED booking", async () => {
      mockConversationUtils.isMessagingEnabledForBookingStatus.mockReturnValue(
        false
      );

      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      };
      const { result } = renderHook(() =>
        useBookingMessaging(cancelledBooking)
      );

      await waitFor(() => {
        expect(result.current.isMessagingEnabled).toBe(false);
        expect(result.current.accessError).toContain("CANCELLED bookings");
      });
    });

    it("should disable messaging for REJECTED booking", async () => {
      mockConversationUtils.isMessagingEnabledForBookingStatus.mockReturnValue(
        false
      );

      const rejectedBooking = {
        ...mockBooking,
        status: BookingStatus.REJECTED,
      };
      const { result } = renderHook(() => useBookingMessaging(rejectedBooking));

      await waitFor(() => {
        expect(result.current.isMessagingEnabled).toBe(false);
        expect(result.current.accessError).toContain("REJECTED bookings");
      });
    });
  });

  describe("access validation", () => {
    it("should validate user access to booking messaging", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(
          mockConversationUtils.validateBookingMessagingAccess
        ).toHaveBeenCalledWith(
          mockBooking,
          1 // user.id
        );
      });

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
        expect(result.current.accessError).toBeNull();
      });
    });

    it("should handle access validation failure", async () => {
      mockConversationUtils.validateBookingMessagingAccess.mockResolvedValue({
        hasAccess: false,
        reason: "User is not authorized",
      });

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
        expect(result.current.accessError).toBe("User is not authorized");
        expect(result.current.isMessagingEnabled).toBe(false);
      });
    });

    it("should handle access validation error", async () => {
      mockConversationUtils.validateBookingMessagingAccess.mockRejectedValue(
        new Error("Validation failed")
      );

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
        expect(result.current.accessError).toContain("Validation failed");
      });
    });
  });

  describe("message sending", () => {
    it("should send message with captain ID", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.captainId).toBe(789);
        expect(result.current.hasAccess).toBe(true);
        expect(result.current.isMessagingEnabled).toBe(true);
      });

      await act(async () => {
        await result.current.sendMessage("Hello captain!");
      });

      expect(mockMessagesHook.sendMessage).toHaveBeenCalledWith(
        "Hello captain!",
        789
      );
    });

    it("should throw error when captain ID is not available", async () => {
      mockConversationUtils.extractCaptainIdFromBooking.mockResolvedValue(
        null as any
      );

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.captainId).toBeNull();
      });

      await expect(
        act(async () => {
          await result.current.sendMessage("Hello captain!");
        })
      ).rejects.toThrow("Captain ID not available");
    });

    it("should throw error when messaging access is not available", async () => {
      mockConversationUtils.validateBookingMessagingAccess.mockResolvedValue({
        hasAccess: false,
        reason: "Access denied",
      });

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.sendMessage("Hello captain!");
        })
      ).rejects.toThrow("Messaging access not available");
    });
  });

  describe("useMessages integration", () => {
    it("should pass correct conversation ID to useMessages", async () => {
      renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(mockUseMessages).toHaveBeenCalledWith(
          "booking_123_1_789",
          expect.objectContaining({
            pollingInterval: 3000,
            maxRetries: 3,
            enableRealTime: true,
            cacheKey: "booking_123_1_789",
          })
        );
      });
    });

    it("should disable real-time when access is denied", async () => {
      mockConversationUtils.validateBookingMessagingAccess.mockResolvedValue({
        hasAccess: false,
        reason: "Access denied",
      });

      renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(mockUseMessages).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            enableRealTime: false,
          })
        );
      });
    });

    it("should expose useMessages functionality", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      expect(result.current.messages).toBe(mockMessagesHook.messages);
      expect(result.current.isLoading).toBe(mockMessagesHook.isLoading);
      expect(result.current.loadMore).toBe(mockMessagesHook.loadMore);
      expect(result.current.refresh).toBe(mockMessagesHook.refresh);
      expect(result.current.markAsRead).toBe(mockMessagesHook.markAsRead);
      expect(result.current.retry).toBe(mockMessagesHook.retry);
    });
  });

  describe("cleanup logic", () => {
    it("should cleanup state on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useBookingMessaging(mockBooking)
      );

      unmount();

      // Note: We can't directly test the cleanup since the component is unmounted,
      // but we can test the cleanup function directly
      act(() => {
        result.current.cleanup();
      });

      expect(result.current.conversationId).toBeNull();
      expect(result.current.captainId).toBeNull();
      expect(result.current.isMessagingEnabled).toBe(false);
      expect(result.current.hasAccess).toBe(false);
      expect(result.current.accessError).toBeNull();
    });

    it("should provide cleanup function", () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      expect(typeof result.current.cleanup).toBe("function");

      act(() => {
        result.current.cleanup();
      });

      expect(result.current.conversationId).toBeNull();
      expect(result.current.captainId).toBeNull();
      expect(result.current.isMessagingEnabled).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should combine errors from useMessages and access validation", async () => {
      const messagesError = "Messages error";
      const accessError = "Access error";

      mockUseMessages.mockReturnValue({
        ...mockMessagesHook,
        error: messagesError,
      });

      mockConversationUtils.validateBookingMessagingAccess.mockResolvedValue({
        hasAccess: false,
        reason: accessError,
      });

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await waitFor(() => {
        expect(result.current.error).toBe(accessError); // Access error takes precedence
      });
    });

    it("should clear both types of errors", async () => {
      mockUseMessages.mockReturnValue({
        ...mockMessagesHook,
        error: "Messages error",
      });

      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      act(() => {
        result.current.clearError();
      });

      expect(mockMessagesHook.clearError).toHaveBeenCalled();
    });
  });

  describe("options configuration", () => {
    it("should use custom options", () => {
      const customOptions = {
        pollingInterval: 5000,
        maxRetries: 5,
        enableRealTime: false,
        autoLoadMessages: false,
      };

      renderHook(() => useBookingMessaging(mockBooking, customOptions));

      expect(mockUseMessages).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pollingInterval: 5000,
          maxRetries: 5,
          enableRealTime: false,
        })
      );
    });

    it("should not auto-initialize when autoLoadMessages is false", () => {
      renderHook(() =>
        useBookingMessaging(mockBooking, { autoLoadMessages: false })
      );

      // Should not call initialization functions automatically
      expect(
        mockConversationUtils.extractCaptainIdFromBooking
      ).not.toHaveBeenCalled();
    });
  });

  describe("manual initialization", () => {
    it("should allow manual initialization", async () => {
      const { result } = renderHook(() =>
        useBookingMessaging(mockBooking, { autoLoadMessages: false })
      );

      expect(result.current.isMessagingEnabled).toBe(false);

      await act(async () => {
        await result.current.initializeMessaging();
      });

      expect(
        mockConversationUtils.extractCaptainIdFromBooking
      ).toHaveBeenCalled();
      expect(result.current.isMessagingEnabled).toBe(true);
    });

    it("should allow manual access validation", async () => {
      const { result } = renderHook(() => useBookingMessaging(mockBooking));

      await act(async () => {
        await result.current.validateAccess();
      });

      expect(
        mockConversationUtils.validateBookingMessagingAccess
      ).toHaveBeenCalled();
    });
  });
});
describe("error handling", () => {
  it("should handle booking initialization errors", async () => {
    const initError = new Error("Failed to extract captain ID");
    mockExtractCaptainIdFromBooking.mockRejectedValue(initError);

    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: true })
    );

    await waitFor(() => {
      expect(result.current.accessError).toContain("Kaptan ID'si alınamadı");
      expect(result.current.accessErrorType).toBe(ErrorType.UNKNOWN);
      expect(result.current.isMessagingEnabled).toBe(false);
    });
  });

  it("should handle validation access errors", async () => {
    mockValidateBookingMessagingAccess.mockResolvedValue({
      hasAccess: false,
      reason: "Booking is cancelled",
    });

    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: true })
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(false);
      expect(result.current.accessError).toContain("Booking is cancelled");
      expect(result.current.accessErrorType).toBe(ErrorType.AUTHORIZATION);
    });
  });

  it("should handle authentication errors during validation", async () => {
    const authError = new Error("Unauthorized");
    mockValidateBookingMessagingAccess.mockRejectedValue(authError);

    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: true })
    );

    await waitFor(() => {
      expect(result.current.accessError).toContain("Oturum süreniz dolmuş");
      expect(result.current.accessErrorType).toBe(ErrorType.AUTHENTICATION);
    });
  });

  it("should handle sendMessage validation errors", async () => {
    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: false })
    );

    // Set up successful initialization
    await act(async () => {
      await result.current.initializeMessaging();
    });

    // Try to send message without captain ID
    act(() => {
      result.current.cleanup();
    });

    await expect(async () => {
      await act(async () => {
        await result.current.sendMessage("test message");
      });
    }).rejects.toThrow("Kaptan ID'si mevcut değil");
  });

  it("should clear all errors correctly", async () => {
    const initError = new Error("Initialization failed");
    mockExtractCaptainIdFromBooking.mockRejectedValue(initError);

    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: true })
    );

    await waitFor(() => {
      expect(result.current.accessError).toBeTruthy();
      expect(result.current.accessErrorType).toBeTruthy();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.accessError).toBeNull();
    expect(result.current.accessErrorType).toBeNull();
  });

  it("should handle booking status changes", async () => {
    const { result, rerender } = renderHook(
      ({ booking }) =>
        useBookingMessaging(booking, { autoLoadMessages: false }),
      { initialProps: { booking: mockBooking } }
    );

    // Initially should be enabled for CONFIRMED booking
    await act(async () => {
      await result.current.initializeMessaging();
    });

    expect(result.current.isMessagingEnabled).toBe(true);

    // Change booking status to CANCELLED
    const cancelledBooking = {
      ...mockBooking,
      status: BookingStatus.CANCELLED,
    };
    rerender({ booking: cancelledBooking });

    await waitFor(() => {
      expect(result.current.isMessagingEnabled).toBe(false);
      expect(result.current.accessError).toContain(
        "CANCELLED durumundaki rezervasyonlar"
      );
      expect(result.current.accessErrorType).toBe(ErrorType.VALIDATION);
    });
  });
});

describe("integration with useMessages", () => {
  it("should pass through message errors correctly", async () => {
    const messageError = new Error("Message send failed");
    mockUseMessages.mockReturnValue({
      ...mockMessagesHook,
      error: "Message send failed",
      errorType: ErrorType.NETWORK,
      sendMessage: vi.fn().mockRejectedValue(messageError),
    });

    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: false })
    );

    await act(async () => {
      await result.current.initializeMessaging();
    });

    expect(result.current.error).toBe("Message send failed");
    expect(result.current.errorType).toBe(ErrorType.NETWORK);
  });

  it("should prioritize access errors over message errors", async () => {
    mockUseMessages.mockReturnValue({
      ...mockMessagesHook,
      error: "Message error",
      errorType: ErrorType.NETWORK,
    });

    const { result } = renderHook(() =>
      useBookingMessaging(mockBooking, { autoLoadMessages: false })
    );

    // Set access error
    act(() => {
      result.current.cleanup();
    });

    expect(result.current.error).toBeNull(); // No access error initially
    expect(result.current.errorType).toBe(ErrorType.NETWORK); // Should show message error
  });
});
