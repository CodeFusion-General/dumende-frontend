import { BaseService } from './base/BaseService';
import { ContactMessage, ContactCreateRequest, ContactUpdateRequest } from '@/types/contact.types';

class ContactService extends BaseService {
    constructor() {
        super('/contact');
    }

    public async getMessages(params?: {
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<ContactMessage[]> {
        return this.get<ContactMessage[]>('', params);
    }

    public async getMessageById(id: number): Promise<ContactMessage> {
        return this.get<ContactMessage>(`/${id}`);
    }

    public async createMessage(data: ContactCreateRequest): Promise<ContactMessage> {
        return this.post<ContactMessage>('', data);
    }

    public async updateMessageStatus(id: number, data: ContactUpdateRequest): Promise<ContactMessage> {
        return this.put<ContactMessage>(`/${id}`, data);
    }

    public async deleteMessage(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }

    public async replyToMessage(id: number, reply: string): Promise<ContactMessage> {
        return this.post<ContactMessage>(`/${id}/reply`, { reply });
    }
}

export const contactService = new ContactService();