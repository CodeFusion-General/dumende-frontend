import { BaseService } from "./base/BaseService";
import {
  MessageDTO,
  CreateMessageCommand,
  UpdateMessageReadStatusCommand,
  MessageQuery,
  ReadStatus,
} from "@/types/message.types";

class MessageService extends BaseService {
  constructor() {
    super("");
  }

  // ======= Message Query Operations =======
  public async getMessageById(id: number): Promise<MessageDTO> {
    return this.get<MessageDTO>(`/messages/${id}`);
  }

  public async getAllMessages(): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>("/messages");
  }

  public async queryMessages(query: MessageQuery): Promise<MessageDTO[]> {
    return this.post<MessageDTO[]>("/messages/query", query);
  }

  public async getMessagesByConversationId(
    conversationId: string
  ): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/messages/conversation/${conversationId}`);
  }

  public async getMessagesBySenderId(senderId: number): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/messages/sender/${senderId}`);
  }

  public async getMessagesByRecipientId(
    recipientId: number
  ): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/messages/recipient/${recipientId}`);
  }

  public async getMessagesByUserId(userId: number): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/messages/user/${userId}`);
  }

  public async getUnreadMessagesByRecipientId(
    recipientId: number
  ): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/messages/unread/recipient/${recipientId}`);
  }

  public async getConversationIdsByUserId(userId: number): Promise<string[]> {
    try {
      const result = await this.get<string[]>(
        `/messages/conversations/user/${userId}`
      );
      return result;
    } catch (error) {
      console.error("API: Error getting conversation IDs:", error);
      console.error("API: Error details:", error.response?.data);
      throw error;
    }
  }

  // ======= Message Command Operations =======
  public async createMessage(
    command: CreateMessageCommand
  ): Promise<MessageDTO> {
    return this.post<MessageDTO>("/messages", command);
  }

  public async updateMessageReadStatus(
    command: UpdateMessageReadStatusCommand
  ): Promise<MessageDTO> {
    return this.put<MessageDTO>("/messages/read-status", command);
  }

  public async deleteMessage(id: number): Promise<void> {
    return this.delete<void>(`/messages/${id}`);
  }

  public async deleteConversation(conversationId: string): Promise<void> {
    return this.delete<void>(`/messages/conversation/${conversationId}`);
  }

  // ======= Helper Methods =======
  public async sendMessage(
    conversationId: string,
    senderId: number,
    recipientId: number,
    message: string
  ): Promise<MessageDTO> {
    const command: CreateMessageCommand = {
      conversationId,
      senderId,
      recipientId,
      message,
    };
    return this.createMessage(command);
  }

  public async markAsRead(messageId: number): Promise<MessageDTO> {
    const command: UpdateMessageReadStatusCommand = {
      messageId,
      readStatus: ReadStatus.READ,
    };
    return this.updateMessageReadStatus(command);
  }

  public async markAsUnread(messageId: number): Promise<MessageDTO> {
    const command: UpdateMessageReadStatusCommand = {
      messageId,
      readStatus: ReadStatus.UNREAD,
    };
    return this.updateMessageReadStatus(command);
  }

  // Generate conversation ID between two users
  public generateConversationId(userId1: number, userId2: number): string {
    const sortedIds = [userId1, userId2].sort();
    return `conversation_${sortedIds[0]}_${sortedIds[1]}`;
  }

  // Get conversation messages between specific users
  public async getConversationBetweenUsers(
    userId1: number,
    userId2: number
  ): Promise<MessageDTO[]> {
    const conversationId = this.generateConversationId(userId1, userId2);
    return this.getMessagesByConversationId(conversationId);
  }

  // Get unread count for a user
  public async getUnreadCount(userId: number): Promise<number> {
    const unreadMessages = await this.getUnreadMessagesByRecipientId(userId);
    return unreadMessages.length;
  }

  // Get user conversations with last message and unread count
  public async getUserConversations(userId: number): Promise<
    {
      conversationId: string;
      otherUser: {
        id: number;
        fullName: string;
      };
      lastMessage?: MessageDTO;
      unreadCount: number;
    }[]
  > {
    try {

      // Get all conversation IDs for the user
      const conversationIds = await this.getConversationIdsByUserId(userId);

      const conversations = [];

      for (const conversationId of conversationIds) {
       
        // Get messages for each conversation
        const messages = await this.getMessagesByConversationId(conversationId);


        if (messages.length === 0) continue;

        // Find the other user in the conversation
        const lastMessage = messages[messages.length - 1];
        const otherUser =
          lastMessage.sender.id === userId
            ? lastMessage.recipient
            : lastMessage.sender;

        // Count unread messages for this user in this conversation
        const unreadCount = messages.filter(
          (msg) =>
            msg.recipient.id === userId && msg.readStatus === ReadStatus.UNREAD
        ).length;

        conversations.push({
          conversationId,
          otherUser: {
            id: otherUser.id,
            fullName: otherUser.fullName,
          },
          lastMessage,
          unreadCount,
        });
      }


      // Sort by last message date
      return conversations.sort((a, b) => {
        if (!a.lastMessage || !b.lastMessage) return 0;
        return (
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
        );
      });
    } catch (error) {
      console.error(
        "MessageService: Error fetching user conversations:",
        error
      );
      return [];
    }
  }

  // Mark all messages in a conversation as read
  public async markConversationAsRead(
    conversationId: string,
    userId: number
  ): Promise<void> {
    try {
      const messages = await this.getMessagesByConversationId(conversationId);
      const unreadMessages = messages.filter(
        (msg) =>
          msg.recipient.id === userId && msg.readStatus === ReadStatus.UNREAD
      );

      // Mark each unread message as read
      for (const message of unreadMessages) {
        await this.markAsRead(message.id);
      }
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  }

  // Search messages by content
  public async searchMessages(
    userId: number,
    searchTerm: string
  ): Promise<MessageDTO[]> {
    const query: MessageQuery = {
      senderId: userId,
      includeDeleted: false,
    };

    const allMessages = await this.queryMessages(query);

    // Filter by search term (in a real app, this would be done on backend)
    return allMessages.filter((msg) =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export const messageService = new MessageService();
