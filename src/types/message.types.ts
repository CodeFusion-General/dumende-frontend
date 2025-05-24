// Message ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// ReadStatus Enum (backend'den)
export enum ReadStatus {
  UNREAD = "UNREAD",
  READ = "READ",
  DELIVERED = "DELIVERED",
}

// Message Types
export interface MessageDTO {
  id: number;
  conversationId: string;
  sender: UserDTO; // UserDTO referansı
  recipient: UserDTO; // UserDTO referansı
  message: string;
  readStatus: ReadStatus;
  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
}

export interface CreateMessageCommand {
  conversationId: string;
  senderId: number;
  recipientId: number;
  message: string; // 1-1000 karakter arası
}

export interface UpdateMessageReadStatusCommand {
  messageId: number;
  readStatus: ReadStatus;
}

export interface MessageQuery {
  id?: number;
  conversationId?: string;
  senderId?: number;
  recipientId?: number;
  readStatus?: ReadStatus;
  includeDeleted?: boolean;
}

// UserDTO tanımı (message içinde kullanılan basit versiyon)
export interface UserDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string; // byte[] -> string (base64 veya URL)
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Message extends Omit<MessageDTO, "sender" | "recipient"> {
  senderId: number;
  recipientId: number;
  senderName?: string;
  recipientName?: string;
}

export interface MessageCreateRequest extends CreateMessageCommand {}
export interface MessageUpdateRequest extends UpdateMessageReadStatusCommand {}

// Filtreleme için kullanılan interface
export interface MessageFilters {
  conversationId?: string;
  senderId?: number;
  recipientId?: number;
  readStatus?: ReadStatus;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}
