import { MessageDTO } from "@/types/message.types";

export interface PaginationOptions {
  pageSize: number;
  maxCacheSize: number;
  prefetchThreshold: number;
}

export interface PaginatedMessages {
  messages: MessageDTO[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}

export interface MessagePage {
  messages: MessageDTO[];
  pageNumber: number;
  timestamp: number;
  hasMore: boolean;
}

export class MessagePagination {
  private pages: Map<number, MessagePage> = new Map();
  private options: PaginationOptions;
  private conversationId: string;

  constructor(
    conversationId: string,
    options: Partial<PaginationOptions> = {}
  ) {
    this.conversationId = conversationId;
    this.options = {
      pageSize: options.pageSize || 50,
      maxCacheSize: options.maxCacheSize || 500,
      prefetchThreshold: options.prefetchThreshold || 10,
    };
  }

  /**
   * Add messages to a specific page
   */
  addPage(pageNumber: number, messages: MessageDTO[], hasMore: boolean): void {
    this.pages.set(pageNumber, {
      messages,
      pageNumber,
      timestamp: Date.now(),
      hasMore,
    });

    // Clean up old pages if we exceed cache size
    this.cleanupOldPages();
  }

  /**
   * Get messages for a specific page
   */
  getPage(pageNumber: number): MessagePage | undefined {
    return this.pages.get(pageNumber);
  }

  /**
   * Get all cached messages in order
   */
  getAllMessages(): MessageDTO[] {
    const allMessages: MessageDTO[] = [];
    const sortedPages = Array.from(this.pages.keys()).sort((a, b) => a - b);

    for (const pageNumber of sortedPages) {
      const page = this.pages.get(pageNumber);
      if (page) {
        allMessages.push(...page.messages);
      }
    }

    return allMessages;
  }

  /**
   * Check if we have a specific page cached
   */
  hasPage(pageNumber: number): boolean {
    return this.pages.has(pageNumber);
  }

  /**
   * Get the highest page number we have cached
   */
  getHighestPageNumber(): number {
    if (this.pages.size === 0) return 0;
    return Math.max(...this.pages.keys());
  }

  /**
   * Check if we should prefetch the next page
   */
  shouldPrefetch(currentMessageIndex: number, totalMessages: number): boolean {
    const remainingMessages = totalMessages - currentMessageIndex;
    return remainingMessages <= this.options.prefetchThreshold;
  }

  /**
   * Clear all cached pages
   */
  clear(): void {
    this.pages.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalPages: number;
    totalMessages: number;
    oldestPageTimestamp: number;
    newestPageTimestamp: number;
  } {
    if (this.pages.size === 0) {
      return {
        totalPages: 0,
        totalMessages: 0,
        oldestPageTimestamp: 0,
        newestPageTimestamp: 0,
      };
    }

    let totalMessages = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    for (const page of this.pages.values()) {
      totalMessages += page.messages.length;
      oldestTimestamp = Math.min(oldestTimestamp, page.timestamp);
      newestTimestamp = Math.max(newestTimestamp, page.timestamp);
    }

    return {
      totalPages: this.pages.size,
      totalMessages,
      oldestPageTimestamp: oldestTimestamp,
      newestPageTimestamp: newestTimestamp,
    };
  }

  /**
   * Clean up old pages to maintain cache size
   */
  private cleanupOldPages(): void {
    const totalMessages = this.getAllMessages().length;

    if (totalMessages <= this.options.maxCacheSize) {
      return;
    }

    // Sort pages by timestamp (oldest first)
    const sortedPages = Array.from(this.pages.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Remove oldest pages until we're under the limit
    let currentMessageCount = totalMessages;
    for (const [pageNumber, page] of sortedPages) {
      if (currentMessageCount <= this.options.maxCacheSize) {
        break;
      }

      this.pages.delete(pageNumber);
      currentMessageCount -= page.messages.length;
    }
  }

  /**
   * Update a specific message in the cache
   */
  updateMessage(
    messageId: number,
    updatedMessage: Partial<MessageDTO>
  ): boolean {
    for (const page of this.pages.values()) {
      const messageIndex = page.messages.findIndex(
        (msg) => msg.id === messageId
      );
      if (messageIndex !== -1) {
        page.messages[messageIndex] = {
          ...page.messages[messageIndex],
          ...updatedMessage,
        };
        return true;
      }
    }
    return false;
  }

  /**
   * Add a new message to the appropriate page (usually the last page)
   */
  addMessage(message: MessageDTO): void {
    const highestPage = this.getHighestPageNumber();
    const page = this.pages.get(highestPage);

    if (page && page.messages.length < this.options.pageSize) {
      // Add to existing page if it has space
      page.messages.push(message);
    } else {
      // Create new page
      this.addPage(highestPage + 1, [message], true);
    }
  }

  /**
   * Remove a message from the cache
   */
  removeMessage(messageId: number): boolean {
    for (const page of this.pages.values()) {
      const messageIndex = page.messages.findIndex(
        (msg) => msg.id === messageId
      );
      if (messageIndex !== -1) {
        page.messages.splice(messageIndex, 1);
        return true;
      }
    }
    return false;
  }
}

/**
 * Utility function to split messages into pages
 */
export function paginateMessages(
  messages: MessageDTO[],
  pageSize: number
): MessageDTO[][] {
  const pages: MessageDTO[][] = [];

  for (let i = 0; i < messages.length; i += pageSize) {
    pages.push(messages.slice(i, i + pageSize));
  }

  return pages;
}

/**
 * Utility function to merge new messages with existing ones
 */
export function mergeMessages(
  existingMessages: MessageDTO[],
  newMessages: MessageDTO[]
): MessageDTO[] {
  const messageMap = new Map<number, MessageDTO>();

  // Add existing messages
  existingMessages.forEach((msg) => messageMap.set(msg.id, msg));

  // Add/update with new messages
  newMessages.forEach((msg) => messageMap.set(msg.id, msg));

  // Convert back to array and sort by creation time
  return Array.from(messageMap.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
