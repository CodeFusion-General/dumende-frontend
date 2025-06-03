import React, { useState, useEffect } from "react";
import ConversationSidebar from "./ConversationSidebar";
import ChatArea from "./ChatArea";
import EmptyConversationState from "./EmptyConversationState";
import { Conversation } from "./types";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/use-toast";
import { messageService } from "@/services/messageService";
import {
  MessageDTO,
  ConversationInfo,
  ReadStatus,
} from "@/types/message.types";

const MessagesContainer = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the sidebar state to adjust layout
  const { state } = useSidebar();
  const isPrimarySidebarExpanded = state === "expanded";

  console.log("🚀 MessagesContainer component rendered!");

  // Fetch conversations on component mount
  useEffect(() => {
    console.log("🔄 useEffect triggered - about to fetch conversations");
    fetchConversations();
  }, []);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      console.log("📖 Marking conversation as read:", selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    console.log("🎯 fetchConversations function called!");

    try {
      setLoading(true);
      setError(null);

      // TODO: Get currentUserId from auth context
      const currentUserId = 1; // Temporary hardcoded value

      console.log("🔍 Getting conversations for userId:", currentUserId);

      const conversationInfos = await messageService.getUserConversations(
        currentUserId
      );

      console.log("✅ Raw conversation data:", conversationInfos);

      // Convert ConversationInfo to Conversation format
      const formattedConversations: Conversation[] = conversationInfos.map(
        (info) => ({
          id: info.conversationId,
          user: {
            id: info.otherUser.id.toString(),
            name: info.otherUser.fullName,
            avatar: "/default-avatar.png", // TODO: Use info.otherUser.profileImage when available
            isOnline: false, // TODO: Implement online status
          },
          lastMessage: info.lastMessage
            ? {
                id: info.lastMessage.id.toString(),
                content: info.lastMessage.message,
                text: info.lastMessage.message, // Backward compatibility
                timestamp: info.lastMessage.createdAt,
                isRead: info.lastMessage.readStatus === ReadStatus.READ,
                senderId: info.lastMessage.sender.id.toString(),
              }
            : {
                id: "0",
                content: "Henüz mesaj yok",
                text: "Henüz mesaj yok", // Backward compatibility
                timestamp: new Date().toISOString(),
                isRead: true,
                senderId: "0",
              },
          unreadCount: info.unreadCount,
          messages: [], // Will be loaded when conversation is selected
        })
      );

      console.log("✅ Formatted conversations:", formattedConversations);
      setConversations(formattedConversations);
      console.log(
        "✅ Konuşmalar başarıyla yüklendi:",
        formattedConversations.length,
        "konuşma"
      );
    } catch (error) {
      console.error("❌ Konuşmalar yüklenirken hata:", error);
      console.error("❌ Error details:", error.message, error.stack);
      setError("Mesajlar yüklenirken bir hata oluştu.");
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

  const markConversationAsRead = async (conversationId: string) => {
    try {
      // TODO: Get currentUserId from auth context
      const currentUserId = 1;

      await messageService.markConversationAsRead(
        conversationId,
        currentUserId
      );

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                unreadCount: 0,
                lastMessage: { ...conv.lastMessage, isRead: true },
              }
            : conv
        )
      );
    } catch (error) {
      console.error("❌ Konuşma okundu olarak işaretlenirken hata:", error);
    }
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);

    try {
      // Fetch messages for the selected conversation
      const messages = await messageService.getMessagesByConversationId(
        conversation.id
      );

      // Convert MessageDTO to Message format
      const formattedMessages = messages.map((msg) => ({
        id: msg.id.toString(),
        content: msg.message,
        text: msg.message, // Backward compatibility
        timestamp: msg.createdAt,
        isRead: msg.readStatus === ReadStatus.READ,
        senderId: msg.sender.id.toString(),
        senderName: msg.sender.fullName,
      }));

      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: formattedMessages,
            }
          : null
      );
    } catch (error) {
      console.error("❌ Mesajlar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Mesajlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSearchConversations = async (query: string) => {
    try {
      if (!query) {
        await fetchConversations();
        return;
      }

      // TODO: Implement proper search on backend
      // For now, filter locally
      const allConversations = await messageService.getUserConversations(1);
      const filtered = allConversations.filter((info) =>
        info.otherUser.fullName.toLowerCase().includes(query.toLowerCase())
      );

      const formattedConversations: Conversation[] = filtered.map((info) => ({
        id: info.conversationId,
        user: {
          id: info.otherUser.id.toString(),
          name: info.otherUser.fullName,
          avatar: "/default-avatar.png", // TODO: Use profileImage when available from backend
          isOnline: false,
        },
        lastMessage: info.lastMessage
          ? {
              id: info.lastMessage.id.toString(),
              content: info.lastMessage.message,
              text: info.lastMessage.message, // Backward compatibility
              timestamp: info.lastMessage.createdAt,
              isRead: info.lastMessage.readStatus === ReadStatus.READ,
              senderId: info.lastMessage.sender.id.toString(),
            }
          : {
              id: "0",
              content: "Henüz mesaj yok",
              text: "Henüz mesaj yok", // Backward compatibility
              timestamp: new Date().toISOString(),
              isRead: true,
              senderId: "0",
            },
        unreadCount: info.unreadCount,
        messages: [],
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error("❌ Arama yapılırken hata:", error);
      toast({
        title: "Hata",
        description: "Arama yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleArchiveConversation = async (id: string) => {
    try {
      await messageService.deleteConversation(id);
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
      toast({
        title: "Başarılı",
        description: "Konuşma silindi.",
      });
    } catch (error) {
      console.error("❌ Konuşma silinirken hata:", error);
      toast({
        title: "Hata",
        description: "Konuşma silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15847c] mx-auto mb-4"></div>
          <p className="text-gray-600">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchConversations}
            className="bg-[#15847c] hover:bg-[#0e5c56] text-white px-4 py-2 rounded"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white transition-all duration-300 ease-in-out">
      <div
        className={`conversation-sidebar ${
          sidebarOpen ? "w-[320px] lg:w-[380px]" : "w-0"
        } 
        transition-all duration-300 overflow-hidden border-r border-gray-200`}
      >
        {sidebarOpen && (
          <ConversationSidebar
            conversations={conversations}
            onSelectConversation={handleConversationSelect}
            onSearchConversations={handleSearchConversations}
            onArchiveConversation={handleArchiveConversation}
            selectedId={selectedConversation?.id}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-hidden h-full">
          {selectedConversation ? (
            <ChatArea
              conversation={selectedConversation}
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : (
            <EmptyConversationState
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
