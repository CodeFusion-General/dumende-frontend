import { BaseService } from './base/BaseService';
import { Message, MessageCreateRequest, MessageUpdateRequest, MessageThread } from '@/types/message.types';

class MessageService extends BaseService {
    constructor() {
        super('/messages');
    }

    public async getMessages(filters?: { threadId?: number }): Promise<Message[]> {
        const params = new URLSearchParams();
        if (filters?.threadId) params.append('threadId', filters.threadId.toString());
        
        return this.get<Message[]>(`/messages?${params.toString()}`);
    }

    public async getMessageById(id: number): Promise<Message> {
        return this.get<Message>(`/${id}`);
    }

    public async sendMessage(data: MessageCreateRequest): Promise<Message> {
        return this.post<Message>('/messages', data);
    }

    public async updateMessage(id: number, data: Partial<Message>): Promise<Message> {
        return this.put<Message>(`/messages/${id}`, data);
    }

    public async deleteMessage(id: number): Promise<void> {
        return this.delete<void>(`/messages/${id}`);
    }

    public async markAsRead(id: number): Promise<Message> {
        return this.patch<Message>(`/messages/${id}/read`);
    }

    public async getUnreadCount(userId: number): Promise<number> {
        return this.get<number>(`/unread/count/${userId}`);
    }

    public async getThreads(userId: number): Promise<MessageThread[]> {
        return this.get<MessageThread[]>(`/threads/${userId}`);
    }

    public async getThreadMessages(threadId: number): Promise<Message[]> {
        return this.get<Message[]>(`/thread/${threadId}`);
    }

    public async markThreadAsRead(threadId: number): Promise<void> {
        return this.put<void>(`/thread/${threadId}/read`, {});
    }
}

export const messageService = new MessageService();