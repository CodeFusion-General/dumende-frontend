import React, { useState, useRef, useEffect } from "react";
import { Conversation, Message } from "./types";
import { Send, PaperclipIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { messageService } from "@/services/messageService";
import { useAuth } from "@/contexts/AuthContext";
import { ReadStatus } from "@/types/message.types";

interface ChatAreaProps {
  conversation: Conversation;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  sidebarOpen,
  toggleSidebar,
}) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Use messages from conversation if available, otherwise fetch them
  useEffect(() => {
    if (conversation.messages && conversation.messages.length > 0) {
      setMessages(conversation.messages);
    } else {
      fetchMessages();
    }
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messageResponses = await messageService.getMessagesByConversationId(
        conversation.id
      );

      // Convert MessageDTO to Message format
      const formattedMessages: Message[] = messageResponses.map((msg) => ({
        id: msg.id.toString(),
        content: msg.message,
        text: msg.message, // Backward compatibility
        timestamp: new Date(msg.createdAt).toLocaleDateString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: msg.readStatus === ReadStatus.READ,
        senderId: msg.sender.id.toString(),
        senderName: msg.sender.fullName,
        sender: msg.sender.id.toString() === "1" ? "captain" : "user", // TODO: Get current user ID from auth
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description:
          "Mesajlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);

      // Get current user ID from auth context
      const { user } = useAuth();
      const currentUserId = user?.id || 1; // Fallback to 1 if user is not available
      const recipientId = parseInt(conversation.user.id);

      const response = await messageService.sendMessage(
        conversation.id,
        currentUserId,
        recipientId,
        newMessage
      );

      // Convert response to Message format
      const newMessageFormatted: Message = {
        id: response.id.toString(),
        content: response.message,
        text: response.message, // Backward compatibility
        timestamp: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: response.readStatus === ReadStatus.READ,
        senderId: response.sender.id.toString(),
        senderName: response.sender.fullName,
        sender: "captain", // Current user is captain
      };

      setMessages((prev) => [...prev, newMessageFormatted]);
      setNewMessage("");

    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading state for messages
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <ChevronLeft size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.user.avatar} />
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {conversation.user.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-medium text-base text-gray-900">
                {conversation.user.name}
              </h3>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15847c] mx-auto mb-4"></div>
            <p className="text-gray-600">Mesajlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.user.avatar} />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {conversation.user.name
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium text-base text-gray-900">
              {conversation.user.name}
            </h3>
            {conversation.user.isOnline && (
              <span className="text-xs text-green-500">Çevrimiçi</span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Henüz mesaj yok. İlk mesajı gönderin!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "captain" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "captain"
                      ? "bg-[#1A5F7A] text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">
                    {message.content || message.text}
                  </p>
                  <div
                    className={`text-xs mt-1 flex justify-end items-center ${
                      message.sender === "captain"
                        ? "text-gray-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                    {message.sender === "captain" && (
                      <span className="ml-1">
                        {message.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 bg-white rounded-full border border-gray-200 px-4 py-1">
            <Input
              placeholder="Mesajınızı yazın..."
              className="flex-1 border-none shadow-none focus-visible:ring-0"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
            />

            <Button
              size="icon"
              variant="ghost"
              className="text-gray-400"
              type="button"
              disabled={sending}
            >
              <PaperclipIcon size={18} />
            </Button>

            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-[#1A5F7A] hover:bg-[#15847c] rounded-full"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
