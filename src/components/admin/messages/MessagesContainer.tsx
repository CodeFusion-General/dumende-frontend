import React, { useState } from 'react';
import ConversationSidebar from './ConversationSidebar';
import ChatArea from './ChatArea';
import EmptyConversationState from './EmptyConversationState';
import { Conversation } from './types';
import { MOCK_CONVERSATIONS } from './mockData';
import { useSidebar } from '@/components/ui/sidebar';
import { toast } from '@/components/ui/use-toast';

const MessagesContainer = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messageService.getConversations();
        setConversations(response);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        setError('Mesajlar yüklenirken bir hata oluştu.');
        toast({
          title: "Hata",
          description: "Mesajlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const markAsRead = async () => {
        try {
          await messageService.markConversationAsRead(selectedConversation.id);
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation.id 
                ? { ...conv, unreadCount: 0, lastMessage: {...conv.lastMessage, isRead: true} } 
                : conv
            )
          );
        } catch (error) {
          console.error('Failed to mark conversation as read:', error);
        }
      };

      markAsRead();
    }
  }, [selectedConversation]);
  */
  
  // Get the sidebar state to adjust layout
  const { state } = useSidebar();
  const isPrimarySidebarExpanded = state === 'expanded';
  
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    /* Backend hazır olduğunda kullanılacak kod:
    // Conversation seçildiğinde mesajları yükle
    const fetchMessages = async () => {
      try {
        const messages = await messageService.getConversationMessages(conversation.id);
        setSelectedConversation(prev => prev ? { ...prev, messages } : null);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast({
          title: "Hata",
          description: "Mesajlar yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    };

    fetchMessages();
    */
    
    // Mock implementation - Backend hazır olduğunda kaldırılacak
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, lastMessage: {...conv.lastMessage, isRead: true} } 
          : conv
      )
    );
  };
  
  const handleSearchConversations = (query: string) => {
    /* Backend hazır olduğunda kullanılacak kod:
    const searchConversations = async () => {
      try {
        if (!query) {
          const allConversations = await messageService.getConversations();
          setConversations(allConversations);
          return;
        }
        
        const results = await messageService.searchConversations(query);
        setConversations(results);
      } catch (error) {
        console.error('Failed to search conversations:', error);
        toast({
          title: "Hata",
          description: "Arama yapılırken bir hata oluştu.",
          variant: "destructive",
        });
      }
    };

    searchConversations();
    */

    // Mock implementation - Backend hazır olduğunda kaldırılacak
    if (!query) {
      setConversations(MOCK_CONVERSATIONS);
      return;
    }
    
    const filtered = MOCK_CONVERSATIONS.filter(
      conversation => conversation.user.name.toLowerCase().includes(query.toLowerCase())
    );
    setConversations(filtered);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const handleArchiveConversation = (id: string) => {
    /* Backend hazır olduğunda kullanılacak kod:
    const archiveConversation = async () => {
      try {
        await messageService.archiveConversation(id);
        setConversations(prev => prev.filter(conv => conv.id !== id));
        if (selectedConversation?.id === id) {
          setSelectedConversation(null);
        }
        toast({
          title: "Başarılı",
          description: "Konuşma arşivlendi.",
        });
      } catch (error) {
        console.error('Failed to archive conversation:', error);
        toast({
          title: "Hata",
          description: "Konuşma arşivlenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    };

    archiveConversation();
    */

    // Mock implementation - Backend hazır olduğunda kaldırılacak
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white transition-all duration-300 ease-in-out">
      <div 
        className={`conversation-sidebar ${sidebarOpen ? 'w-[320px] lg:w-[380px]' : 'w-0'} 
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
