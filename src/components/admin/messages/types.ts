export type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  lastMessage: {
    id: string;
    content: string;
    text: string; // Backward compatibility
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  messages?: Message[];
};

export type Message = {
  id: string;
  content: string;
  text?: string; // Backward compatibility
  timestamp: string;
  isRead: boolean;
  senderId: string;
  senderName?: string;
  sender?: "user" | "captain"; // Backward compatibility
};
