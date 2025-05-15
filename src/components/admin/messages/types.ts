
export type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'captain';
  timestamp: string;
};
