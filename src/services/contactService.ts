import { BaseService } from "./base/BaseService";
import {
  UserDTO,
  CreateUserCommand,
  UpdateUserCommand,
  UserQuery,
  UserFilters,
  ContactCreateRequest,
  ContactUpdateRequest,
} from "@/types/contact.types";

class ContactService extends BaseService {
  constructor() {
    super("/contact");
  }

  // Contact Form Management (Eski işlevsellik)
  public async submitContactForm(data: ContactCreateRequest): Promise<{
    id: number;
    message: string;
    submitted: boolean;
  }> {
    return this.post("/form", data);
  }

  public async getContactMessages(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<
    Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      message: string;
      status: string;
      createdAt: string;
      replied: boolean;
    }>
  > {
    const queryString = params ? this.buildQueryString(params) : "";
    return this.get(`/messages?${queryString}`);
  }

  public async getContactMessageById(id: number): Promise<{
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    createdAt: string;
    replied: boolean;
    replies?: Array<{
      id: number;
      message: string;
      createdAt: string;
      sender: string;
    }>;
  }> {
    return this.get(`/messages/${id}`);
  }

  public async updateContactMessageStatus(
    id: number,
    status: string
  ): Promise<void> {
    return this.patch<void>(`/messages/${id}/status`, { status });
  }

  public async replyToContactMessage(id: number, reply: string): Promise<void> {
    return this.post<void>(`/messages/${id}/reply`, { reply });
  }

  public async deleteContactMessage(id: number): Promise<void> {
    return this.delete<void>(`/messages/${id}`);
  }

  // User Management Integration
  public async createUserFromContact(
    contactId: number,
    accountData: {
      username: string;
      password: string;
      role: string;
    }
  ): Promise<UserDTO> {
    return this.post<UserDTO>(
      `/messages/${contactId}/create-user`,
      accountData
    );
  }

  // Newsletter Management
  public async subscribeNewsletter(email: string): Promise<{
    subscribed: boolean;
    message: string;
  }> {
    return this.post("/newsletter/subscribe", { email });
  }

  public async unsubscribeNewsletter(
    email: string,
    token?: string
  ): Promise<{
    unsubscribed: boolean;
    message: string;
  }> {
    return this.post("/newsletter/unsubscribe", { email, token });
  }

  public async getNewsletterSubscribers(): Promise<
    Array<{
      id: number;
      email: string;
      subscribedAt: string;
      active: boolean;
    }>
  > {
    return this.get("/newsletter/subscribers");
  }

  // Contact Information Management (Company Info)
  public async getContactInfo(): Promise<{
    phone: string;
    email: string;
    address: string;
    workingHours: string;
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
  }> {
    return this.get("/info");
  }

  public async updateContactInfo(data: {
    phone?: string;
    email?: string;
    address?: string;
    workingHours?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
  }): Promise<void> {
    return this.put<void>("/info", data);
  }

  // FAQ Management
  public async getFAQs(): Promise<
    Array<{
      id: number;
      question: string;
      answer: string;
      category: string;
      order: number;
      active: boolean;
    }>
  > {
    return this.get("/faq");
  }

  public async createFAQ(data: {
    question: string;
    answer: string;
    category: string;
    order: number;
  }): Promise<void> {
    return this.post<void>("/faq", data);
  }

  public async updateFAQ(
    id: number,
    data: {
      question?: string;
      answer?: string;
      category?: string;
      order?: number;
      active?: boolean;
    }
  ): Promise<void> {
    return this.put<void>(`/faq/${id}`, data);
  }

  public async deleteFAQ(id: number): Promise<void> {
    return this.delete<void>(`/faq/${id}`);
  }

  // Statistics
  public async getContactStatistics(): Promise<{
    totalMessages: number;
    unreadMessages: number;
    messagesThisMonth: number;
    averageResponseTime: number; // hours
    newsletterSubscribers: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    return this.get("/statistics");
  }
}

export const contactService = new ContactService();
