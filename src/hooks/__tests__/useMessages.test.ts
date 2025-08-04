import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMessages } from "../useMessages";
import { messageService } from "@/services/messageService";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageDTO,
  CreateMessageCommand,
  ReadStatus,
} from "@/types/message.types";
import { ErrorType } from "@/utils/errorHandling";

// Mock dependencies
vi.mock("@/services/messageService");
vi.mock("@/contexts/AuthContext");

const mockMessageService = vi.mocked(messageService);
const mockUseAuth = vi.mocked(useAuth);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock window online/offline events
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
});
Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
});

// Sample data
const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
};

const mockMessages: MessageDTO[] = [
  {
    id: 1,
    conversationId: "test-conversation",
    sender: { id: 1, fullName: "User", email: "user@test.com" },
    recipient: { id: 2, fullName: "Captain", email: "captain@test.com" },
    message: "Hello",
    readStatus: "UNREAD",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    conversationId: "test-conversation",
    sender: { id: 2, fullName: "Captain", email: "captain@test.com" },
    recipient: { id: 1, fullName: "User", email: "user@test.com" },
    message: "Hi there",
    readStatus: "READ",
    createdAt: "2024-01-01T10:01:00Z",
    updatedAt: "2024-01-01T10:01:00Z",
  },
];

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock console.warn to prevent spam
    vi.spyOn(console, "warn").mockImplementation(() => {});

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockMessageService.getMessagesByConversationId.mockResolvedValue(
      mockMessages
    );
    mockMessageService.createMessage.mockResolvedValue(mockMessages[0]);
    mockMessageService.markAsRead.mockResolvedValue(undefined);

    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("Real-time messaging functionality", () => {
    it("should start polling when enabled", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", {
          enableRealTime: true,
          pollingInterval: 1000,
        })
      );

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("connected");
      });

      // Fast-forward time to trigger polling
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(
          mockMessageService.getMessagesByConversationId
        ).toHaveBeenCalledWith("test-conversation");
      });

      unmount();
    });

    it("should handle connection status changes", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      // Initially connected
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("connected");
      });

      // Simulate polling failures
      mockMessageService.getMessagesByConversationId
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"));

      // Trigger polling failures
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("disconnected");
      });

      unmount();
    });

    it("should handle online/offline events", async () => {
      const { unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      // Verify event listeners are added
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "online",
        expect.any(Function)
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "offline",
        expect.any(Function)
      );

      unmount();

      // Verify event listeners are removed
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "online",
        expect.any(Function)
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "offline",
        expect.any(Function)
      );
    });

    it("should implement optimistic updates for sent messages", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      const newMessage: MessageDTO = {
        id: 3,
        conversationId: "test-conversation",
        sender: mockUser,
        recipient: { id: 2, fullName: "Captain", email: "captain@test.com" },
        message: "New message",
        readStatus: "UNREAD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockMessageService.createMessage.mockResolvedValue(newMessage);

      // Send message
      act(() => {
        result.current.sendMessage("New message", 2);
      });

      // Should immediately show optimistic message
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
        expect(result.current.messages[2].message).toBe("New message");
      });

      // Wait for API call to complete
      await waitFor(() => {
        expect(mockMessageService.createMessage).toHaveBeenCalledWith({
          conversationId: "test-conversation",
          senderId: 1,
          recipientId: 2,
          message: "New message",
        });
      });

      unmount();
    });

    it("should handle message send failures and remove optimistic updates", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      mockMessageService.createMessage.mockRejectedValue(
        new Error("Send failed")
      );

      // Send message
      await act(async () => {
        try {
          await result.current.sendMessage("Failed message", 2);
        } catch (error) {
          // Expected to fail
        }
      });

      // Should remove optimistic message on failure
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.error).toBe("Failed to send message");
      });

      unmount();
    });

    it("should detect new messages during polling", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", {
          enableRealTime: true,
          pollingInterval: 1000,
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Add a new message to the mock response
      const newMessage: MessageDTO = {
        id: 3,
        conversationId: "test-conversation",
        sender: { id: 2, fullName: "Captain", email: "captain@test.com" },
        recipient: { id: 1, fullName: "User", email: "user@test.com" },
        message: "New incoming message",
        readStatus: "UNREAD",
        createdAt: "2024-01-01T10:02:00Z",
        updatedAt: "2024-01-01T10:02:00Z",
      };

      mockMessageService.getMessagesByConversationId.mockResolvedValue([
        ...mockMessages,
        newMessage,
      ]);

      // Trigger polling
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
        expect(result.current.messages[2].message).toBe("New incoming message");
      });

      unmount();
    });

    it("should stop polling when disabled", async () => {
      const { result, rerender, unmount } = renderHook(
        ({ enableRealTime }) =>
          useMessages("test-conversation", { enableRealTime }),
        { initialProps: { enableRealTime: true } }
      );

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("connected");
      });

      // Disable real-time
      rerender({ enableRealTime: false });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("disconnected");
      });

      // Clear previous calls
      mockMessageService.getMessagesByConversationId.mockClear();

      // Advance time - should not trigger polling
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(
        mockMessageService.getMessagesByConversationId
      ).not.toHaveBeenCalled();

      unmount();
    });

    it("should clean up polling intervals on unmount", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("connected");
      });

      unmount();

      // Clear previous calls
      mockMessageService.getMessagesByConversationId.mockClear();

      // Advance time - should not trigger polling after unmount
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(
        mockMessageService.getMessagesByConversationId
      ).not.toHaveBeenCalled();
    });

    it("should cache messages in localStorage", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Verify messages are cached
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "messages_cache_test-conversation",
        expect.stringContaining('"data"')
      );

      unmount();
    });

    it("should load from cache when available", async () => {
      const cachedData = {
        data: mockMessages,
        timestamp: Date.now(),
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", { enableRealTime: true })
      );

      // Should load from cache immediately
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.isLoading).toBe(false);
      });

      // Should still fetch fresh data in background
      await waitFor(() => {
        expect(
          mockMessageService.getMessagesByConversationId
        ).toHaveBeenCalled();
      });

      unmount();
    });

    it("should attempt reconnection after connection loss", async () => {
      const { result, unmount } = renderHook(() =>
        useMessages("test-conversation", {
          enableRealTime: true,
          pollingInterval: 1000,
        })
      );

      // Initially connected
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("connected");
      });

      // Simulate multiple failures to trigger reconnection
      mockMessageService.getMessagesByConversationId
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockMessages);

      // Trigger failures
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("disconnected");
      });

      // Wait for reconnection attempt
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe("reconnecting");
      });

      unmount();
    });
  });
});
describe("error handling", () => {
  it("should handle network errors correctly", async () => {
    const networkError = new Error("Network request failed");
    mockMessageService.getMessagesByConversationId.mockRejectedValue(
      networkError
    );

    const { result } = renderHook(() => useMessages("test-conversation"));

    await waitFor(() => {
      expect(result.current.error).toContain("İnternet bağlantısı sorunu");
      expect(result.current.errorType).toBe(ErrorType.NETWORK);
    });
  });

  it("should handle authentication errors correctly", async () => {
    const authError = new Error("Unauthorized access");
    mockMessageService.getMessagesByConversationId.mockRejectedValue(authError);

    const { result } = renderHook(() => useMessages("test-conversation"));

    await waitFor(() => {
      expect(result.current.error).toContain("Oturum süreniz dolmuş");
      expect(result.current.errorType).toBe(ErrorType.AUTHENTICATION);
    });
  });

  it("should handle validation errors in sendMessage", async () => {
    const { result } = renderHook(() => useMessages("test-conversation"));

    await act(async () => {
      await result.current.sendMessage("a".repeat(1001), 1); // Exceed character limit
    });

    expect(result.current.error).toContain("1000 karakteri geçemez");
    expect(result.current.errorType).toBe(ErrorType.VALIDATION);
  });

  it("should handle offline state", async () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useMessages("test-conversation"));

    await act(async () => {
      await result.current.sendMessage("test message", 1);
    });

    expect(result.current.error).toContain("İnternet bağlantısı yok");
    expect(result.current.errorType).toBe(ErrorType.NETWORK);
    expect(result.current.isOnline).toBe(false);
  });

  it("should handle rate limiting", async () => {
    const { result } = renderHook(() => useMessages("test-conversation"));

    // Send multiple messages quickly to trigger rate limiting
    for (let i = 0; i < 11; i++) {
      await act(async () => {
        await result.current.sendMessage(`message ${i}`, 1);
      });
    }

    expect(result.current.error).toContain("Çok fazla mesaj gönderdiniz");
    expect(result.current.errorType).toBe(ErrorType.VALIDATION);
  });

  it("should clear errors correctly", async () => {
    const networkError = new Error("Network request failed");
    mockMessageService.getMessagesByConversationId.mockRejectedValue(
      networkError
    );

    const { result } = renderHook(() => useMessages("test-conversation"));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.errorType).toBeTruthy();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.errorType).toBeNull();
  });

  it("should retry failed messages", async () => {
    const sendError = new Error("Send failed");
    mockMessageService.createMessage
      .mockRejectedValueOnce(sendError)
      .mockResolvedValueOnce(mockMessages[0]);

    const { result } = renderHook(() => useMessages("test-conversation"));

    // First attempt should fail
    await act(async () => {
      await result.current.sendMessage("test message", 1);
    });

    expect(result.current.error).toBeTruthy();

    // Retry should succeed
    await act(async () => {
      await result.current.retryFailedMessage(Date.now());
    });

    expect(mockMessageService.createMessage).toHaveBeenCalledTimes(2);
  });
});

describe("connection status", () => {
  it("should update connection status based on polling success/failure", async () => {
    const { result } = renderHook(() =>
      useMessages("test-conversation", {
        pollingInterval: 100,
      })
    );

    // Initially connected
    expect(result.current.connectionStatus).toBe("connected");

    // Simulate polling failure
    mockMessageService.getMessagesByConversationId.mockRejectedValue(
      new Error("Network error")
    );

    await waitFor(
      () => {
        expect(result.current.connectionStatus).toBe("disconnected");
      },
      { timeout: 1000 }
    );
  });

  it("should handle online/offline events", async () => {
    const { result } = renderHook(() => useMessages("test-conversation"));

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
      expect(result.current.connectionStatus).toBe("disconnected");
    });

    // Simulate coming back online
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.connectionStatus).toBe("reconnecting");
    });
  });
});
