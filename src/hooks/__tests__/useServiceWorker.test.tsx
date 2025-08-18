// Tests for useServiceWorker hook
// Ensures proper React integration and state management for service worker

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useServiceWorker, usePWAInstall } from "../useServiceWorker";
import * as serviceWorkerManager from "../../services/serviceWorkerManager";

// Mock the service worker manager
vi.mock("../../services/serviceWorkerManager", () => ({
  serviceWorkerManager: {
    isSupported: vi.fn(() => true),
    register: vi.fn(),
    unregister: vi.fn(),
    update: vi.fn(),
    clearCache: vi.fn(),
    getCacheStatus: vi.fn(),
    getRegistration: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Mock navigator
Object.defineProperty(global, "navigator", {
  value: {
    onLine: true,
    serviceWorker: {
      register: vi.fn(),
      getRegistration: vi.fn(),
    },
  },
  writable: true,
});

// Mock window
Object.defineProperty(global, "window", {
  value: {
    matchMedia: vi.fn(() => ({ matches: false })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    navigator: global.navigator,
  },
  writable: true,
});

describe("useServiceWorker", () => {
  const mockServiceWorkerManager =
    serviceWorkerManager.serviceWorkerManager as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceWorkerManager.isSupported.mockReturnValue(true);
    mockServiceWorkerManager.register.mockResolvedValue({});
    mockServiceWorkerManager.unregister.mockResolvedValue(true);
    mockServiceWorkerManager.update.mockResolvedValue(undefined);
    mockServiceWorkerManager.clearCache.mockResolvedValue(undefined);
    mockServiceWorkerManager.getCacheStatus.mockResolvedValue({});
    mockServiceWorkerManager.getRegistration.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.state).toEqual({
      isRegistered: false,
      isUpdating: false,
      hasUpdate: false,
      error: null,
    });
    expect(result.current.cacheStatus).toEqual({});
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSupported).toBe(true);
  });

  it("should register service worker successfully", async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.register();
    });

    expect(mockServiceWorkerManager.register).toHaveBeenCalled();
    expect(result.current.state.isRegistered).toBe(true);
    expect(result.current.state.isUpdating).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it("should handle registration failure", async () => {
    const error = new Error("Registration failed");
    mockServiceWorkerManager.register.mockRejectedValue(error);

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.register();
    });

    expect(result.current.state.isRegistered).toBe(false);
    expect(result.current.state.isUpdating).toBe(false);
    expect(result.current.state.error).toBe("Registration failed");
  });

  it("should unregister service worker successfully", async () => {
    const { result } = renderHook(() => useServiceWorker());

    // First register
    await act(async () => {
      await result.current.register();
    });

    // Then unregister
    await act(async () => {
      await result.current.unregister();
    });

    expect(mockServiceWorkerManager.unregister).toHaveBeenCalled();
    expect(result.current.state.isRegistered).toBe(false);
  });

  it("should update service worker successfully", async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.update();
    });

    expect(mockServiceWorkerManager.update).toHaveBeenCalled();
    expect(result.current.state.isUpdating).toBe(false);
    expect(result.current.state.hasUpdate).toBe(false);
  });

  it("should clear cache successfully", async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.clearCache("test-cache");
    });

    expect(mockServiceWorkerManager.clearCache).toHaveBeenCalledWith(
      "test-cache"
    );
    expect(mockServiceWorkerManager.getCacheStatus).toHaveBeenCalled();
  });

  it("should refresh cache status", async () => {
    const mockStatus = { "cache-v1": { size: 5, urls: [] } };
    mockServiceWorkerManager.getCacheStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.refreshCacheStatus();
    });

    expect(result.current.cacheStatus).toEqual(mockStatus);
  });

  it("should handle service worker events", async () => {
    let registeredCallback: Function;
    let errorCallback: Function;

    mockServiceWorkerManager.on.mockImplementation(
      (event: string, callback: Function) => {
        if (event === "registered") {
          registeredCallback = callback;
        } else if (event === "error") {
          errorCallback = callback;
        }
      }
    );

    const { result } = renderHook(() => useServiceWorker());

    // Simulate registered event
    act(() => {
      registeredCallback();
    });

    expect(result.current.state.isRegistered).toBe(true);

    // Simulate error event
    act(() => {
      errorCallback(new Error("Test error"));
    });

    expect(result.current.state.error).toBe("Test error");
  });

  it("should handle online/offline status changes", () => {
    let onlineCallback: Function;
    let offlineCallback: Function;

    global.window.addEventListener = vi.fn(
      (event: string, callback: Function) => {
        if (event === "online") {
          onlineCallback = callback;
        } else if (event === "offline") {
          offlineCallback = callback;
        }
      }
    );

    const { result } = renderHook(() => useServiceWorker());

    // Simulate going offline
    act(() => {
      offlineCallback();
    });

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    act(() => {
      onlineCallback();
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("should not register when service workers not supported", async () => {
    mockServiceWorkerManager.isSupported.mockReturnValue(false);

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.register();
    });

    expect(mockServiceWorkerManager.register).not.toHaveBeenCalled();
    expect(result.current.state.error).toBe("Service workers not supported");
  });

  it("should auto-register on mount when supported", async () => {
    mockServiceWorkerManager.getRegistration.mockResolvedValue(null);

    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockServiceWorkerManager.register).toHaveBeenCalled();
    });
  });
});

describe("usePWAInstall", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
    global.window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it("should handle beforeinstallprompt event", () => {
    let beforeInstallPromptCallback: Function;

    global.window.addEventListener = vi.fn(
      (event: string, callback: Function) => {
        if (event === "beforeinstallprompt") {
          beforeInstallPromptCallback = callback;
        }
      }
    );

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ userChoice: "accepted" }),
    };

    act(() => {
      beforeInstallPromptCallback(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(true);
  });

  it("should handle app installation", () => {
    let appInstalledCallback: Function;

    global.window.addEventListener = vi.fn(
      (event: string, callback: Function) => {
        if (event === "appinstalled") {
          appInstalledCallback = callback;
        }
      }
    );

    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      appInstalledCallback();
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it("should install PWA successfully", async () => {
    let beforeInstallPromptCallback: Function;

    global.window.addEventListener = vi.fn(
      (event: string, callback: Function) => {
        if (event === "beforeinstallprompt") {
          beforeInstallPromptCallback = callback;
        }
      }
    );

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ userChoice: "accepted" }),
    };

    // Trigger beforeinstallprompt
    act(() => {
      beforeInstallPromptCallback(mockEvent);
    });

    // Install the app
    let installResult: boolean;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(mockEvent.prompt).toHaveBeenCalled();
    expect(installResult!).toBe(true);
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it("should handle installation rejection", async () => {
    let beforeInstallPromptCallback: Function;

    global.window.addEventListener = vi.fn(
      (event: string, callback: Function) => {
        if (event === "beforeinstallprompt") {
          beforeInstallPromptCallback = callback;
        }
      }
    );

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ userChoice: "dismissed" }),
    };

    // Trigger beforeinstallprompt
    act(() => {
      beforeInstallPromptCallback(mockEvent);
    });

    // Try to install the app
    let installResult: boolean;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult!).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it("should return false when no install prompt available", async () => {
    const { result } = renderHook(() => usePWAInstall());

    let installResult: boolean;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult!).toBe(false);
  });

  it("should detect standalone mode", () => {
    global.window.matchMedia = vi.fn(() => ({ matches: true }));

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
  });
});
