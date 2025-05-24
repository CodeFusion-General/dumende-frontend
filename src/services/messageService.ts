import { BaseService } from "./base/BaseService";
import {
  MessageDTO,
  CreateMessageCommand,
  UpdateMessageReadStatusCommand,
  MessageQuery,
  MessageFilters,
  ReadStatus,
} from "@/types/message.types";

class MessageService extends BaseService {
  constructor() {
    super("/messages");
  }

  public async getMessages(filters?: MessageFilters): Promise<MessageDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<MessageDTO[]>(`?${queryString}`);
  }

  public async getMessageById(id: number): Promise<MessageDTO> {
    return this.get<MessageDTO>(`/${id}`);
  }

  public async getMessagesByQuery(query: MessageQuery): Promise<MessageDTO[]> {
    const queryString = this.buildQueryString(query);
    return this.get<MessageDTO[]>(`/search?${queryString}`);
  }

  public async sendMessage(data: CreateMessageCommand): Promise<MessageDTO> {
    return this.post<MessageDTO>("", data);
  }

  public async updateMessageReadStatus(
    data: UpdateMessageReadStatusCommand
  ): Promise<MessageDTO> {
    return this.patch<MessageDTO>(`/${data.messageId}/read-status`, {
      readStatus: data.readStatus,
    });
  }

  public async deleteMessage(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  public async markAsRead(messageId: number): Promise<MessageDTO> {
    return this.updateMessageReadStatus({
      messageId,
      readStatus: ReadStatus.READ,
    });
  }

  public async markAsDelivered(messageId: number): Promise<MessageDTO> {
    return this.updateMessageReadStatus({
      messageId,
      readStatus: ReadStatus.DELIVERED,
    });
  }

  // Conversation based methods
  public async getConversationMessages(
    conversationId: string
  ): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/conversation/${conversationId}`);
  }

  public async getConversationBetweenUsers(
    userId1: number,
    userId2: number
  ): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(
      `/conversation/between/${userId1}/${userId2}`
    );
  }

  public async markConversationAsRead(
    conversationId: string,
    userId: number
  ): Promise<void> {
    return this.patch<void>(`/conversation/${conversationId}/read`, { userId });
  }

  // User based methods
  public async getUserMessages(userId: number): Promise<MessageDTO[]> {
    return this.get<MessageDTO[]>(`/user/${userId}`);
  }

  public async getUnreadCount(userId: number): Promise<number> {
    return this.get<number>(`/user/${userId}/unread-count`);
  }

  public async getUserConversations(userId: number): Promise<
    {
      conversationId: string;
      otherUser: {
        id: number;
        fullName: string;
        profileImage?: string;
      };
      lastMessage: MessageDTO;
      unreadCount: number;
    }[]
  > {
    return this.get(`/user/${userId}/conversations`);
  }

  // Pagination support
  public async getMessagesPaginated(
    filters?: MessageFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) {
    return this.getPaginated<MessageDTO>("/paginated", filters);
  }

  // Real-time messaging support helpers
  public generateConversationId(userId1: number, userId2: number): string {
    const sortedIds = [userId1, userId2].sort();
    return `conversation_${sortedIds[0]}_${sortedIds[1]}`;
  }
}

export const messageService = new MessageService();
