export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    subject: string;
    content: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MessageCreateRequest {
    receiverId: number;
    subject: string;
    content: string;
}

export interface MessageUpdateRequest {
    read?: boolean;
}

export interface MessageThread {
    id: number;
    participants: number[];
    lastMessage: Message;
    unreadCount: number;
    updatedAt: string;
} 