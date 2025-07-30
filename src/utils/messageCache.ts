import { MessageDTO } from "@/types/message.types";

export interface CacheOptions {
  maxAge: number; // in milliseconds
  maxSize: number; // maximum number of messages to cache
  compressionEnabled: boolean;
  persistToDisk: boolean;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

export class MessageCache {
  private cache: Map<string, CachedData<MessageDTO[]>> = new Map();
  private options: CacheOptions;
  private hits: number = 0;
  private misses: number = 0;
  private readonly CACHE_VERSION = "1.0.0";
  private readonly STORAGE_PREFIX = "msg_cache_";

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      maxAge: options.maxAge || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 1000,
      compressionEnabled: options.compressionEnabled || false,
      persistToDisk: options.persistToDisk || true,
    };

    // Load persisted cache on initialization
    if (this.options.persistToDisk) {
      this.loadFromStorage();
    }

    // Set up cleanup interval
    this.setupCleanupInterval();
  }

  /**
   * Get messages from cache
   */
  get(conversationId: string): MessageDTO[] | null {
    const cached = this.cache.get(conversationId);

    if (!cached) {
      this.misses++;
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.options.maxAge) {
      this.cache.delete(conversationId);
      this.misses++;
      return null;
    }

    this.hits++;
    return cached.data;
  }

  /**
   * Set messages in cache
   */
  set(conversationId: string, messages: MessageDTO[]): void {
    const size = this.calculateSize(messages);

    const cachedData: CachedData<MessageDTO[]> = {
      data: messages,
      timestamp: Date.now(),
      version: this.CACHE_VERSION,
      size,
    };

    this.cache.set(conversationId, cachedData);

    // Clean up if we exceed size limits
    this.cleanup();

    // Persist to storage if enabled
    if (this.options.persistToDisk) {
      this.persistToStorage(conversationId, cachedData);
    }
  }

  /**
   * Update specific message in cache
   */
  updateMessage(
    conversationId: string,
    messageId: number,
    updatedMessage: Partial<MessageDTO>
  ): boolean {
    const cached = this.cache.get(conversationId);
    if (!cached) return false;

    const messageIndex = cached.data.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return false;

    cached.data[messageIndex] = {
      ...cached.data[messageIndex],
      ...updatedMessage,
    };

    // Update timestamp and size
    cached.timestamp = Date.now();
    cached.size = this.calculateSize(cached.data);

    // Persist changes
    if (this.options.persistToDisk) {
      this.persistToStorage(conversationId, cached);
    }

    return true;
  }

  /**
   * Add new message to cache
   */
  addMessage(conversationId: string, message: MessageDTO): void {
    const cached = this.cache.get(conversationId);

    if (cached) {
      // Check if message already exists (avoid duplicates)
      const existingIndex = cached.data.findIndex(
        (msg) => msg.id === message.id
      );
      if (existingIndex !== -1) {
        // Update existing message
        cached.data[existingIndex] = message;
      } else {
        // Add new message
        cached.data.push(message);
        // Sort messages by creation time
        cached.data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      cached.timestamp = Date.now();
      cached.size = this.calculateSize(cached.data);

      if (this.options.persistToDisk) {
        this.persistToStorage(conversationId, cached);
      }
    } else {
      // Create new cache entry
      this.set(conversationId, [message]);
    }
  }

  /**
   * Remove message from cache
   */
  removeMessage(conversationId: string, messageId: number): boolean {
    const cached = this.cache.get(conversationId);
    if (!cached) return false;

    const initialLength = cached.data.length;
    cached.data = cached.data.filter((msg) => msg.id !== messageId);

    if (cached.data.length === initialLength) return false;

    cached.timestamp = Date.now();
    cached.size = this.calculateSize(cached.data);

    if (this.options.persistToDisk) {
      this.persistToStorage(conversationId, cached);
    }

    return true;
  }

  /**
   * Clear cache for specific conversation
   */
  clear(conversationId?: string): void {
    if (conversationId) {
      this.cache.delete(conversationId);
      if (this.options.persistToDisk) {
        this.removeFromStorage(conversationId);
      }
    } else {
      this.cache.clear();
      if (this.options.persistToDisk) {
        this.clearStorage();
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.hits + this.misses;

    return {
      totalEntries: this.cache.size,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      oldestEntry:
        entries.length > 0 ? Math.min(...entries.map((e) => e.timestamp)) : 0,
      newestEntry:
        entries.length > 0 ? Math.max(...entries.map((e) => e.timestamp)) : 0,
    };
  }

  /**
   * Check if conversation is cached and not expired
   */
  has(conversationId: string): boolean {
    const cached = this.cache.get(conversationId);
    if (!cached) return false;

    return Date.now() - cached.timestamp <= this.options.maxAge;
  }

  /**
   * Get all cached conversation IDs
   */
  getCachedConversations(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Preload messages into cache
   */
  preload(conversationId: string, messages: MessageDTO[]): void {
    this.set(conversationId, messages);
  }

  /**
   * Calculate approximate size of messages in bytes
   */
  private calculateSize(messages: MessageDTO[]): number {
    return JSON.stringify(messages).length * 2; // Rough estimate (UTF-16)
  }

  /**
   * Clean up expired and oversized cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired entries
    for (const [key, value] of entries) {
      if (now - value.timestamp > this.options.maxAge) {
        this.cache.delete(key);
        if (this.options.persistToDisk) {
          this.removeFromStorage(key);
        }
      }
    }

    // Check total size and remove oldest entries if needed
    const totalMessages = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.data.length,
      0
    );

    if (totalMessages > this.options.maxSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      );

      let currentSize = totalMessages;
      for (const [key, value] of sortedEntries) {
        if (currentSize <= this.options.maxSize) break;

        this.cache.delete(key);
        currentSize -= value.data.length;

        if (this.options.persistToDisk) {
          this.removeFromStorage(key);
        }
      }
    }
  }

  /**
   * Set up automatic cleanup interval
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  /**
   * Persist cache entry to localStorage
   */
  private persistToStorage(
    conversationId: string,
    data: CachedData<MessageDTO[]>
  ): void {
    try {
      const key = `${this.STORAGE_PREFIX}${conversationId}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to persist cache to storage:", error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.STORAGE_PREFIX)
      );

      for (const key of keys) {
        const conversationId = key.replace(this.STORAGE_PREFIX, "");
        const stored = localStorage.getItem(key);

        if (stored) {
          const data: CachedData<MessageDTO[]> = JSON.parse(stored);

          // Check version compatibility and expiration
          if (
            data.version === this.CACHE_VERSION &&
            Date.now() - data.timestamp <= this.options.maxAge
          ) {
            this.cache.set(conversationId, data);
          } else {
            // Remove outdated cache
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  }

  /**
   * Remove specific entry from localStorage
   */
  private removeFromStorage(conversationId: string): void {
    try {
      const key = `${this.STORAGE_PREFIX}${conversationId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove cache from storage:", error);
    }
  }

  /**
   * Clear all cache from localStorage
   */
  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.STORAGE_PREFIX)
      );

      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn("Failed to clear cache from storage:", error);
    }
  }
}

// Global cache instance
export const messageCache = new MessageCache();

// Utility functions
export function getCacheKey(conversationId: string): string {
  return `messages_${conversationId}`;
}

export function isCacheValid(timestamp: number, maxAge: number): boolean {
  return Date.now() - timestamp <= maxAge;
}
