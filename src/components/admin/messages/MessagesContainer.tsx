
import React, { useState } from 'react';
import ConversationSidebar from './ConversationSidebar';
import ChatArea from './ChatArea';
import EmptyConversationState from './EmptyConversationState';
import { Conversation } from './types';
import { MOCK_CONVERSATIONS } from './mockData';
import { useSidebar } from '@/components/ui/sidebar';

const MessagesContainer = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Get the sidebar state to adjust layout
  const { state } = useSidebar();
  const isPrimarySidebarExpanded = state === 'expanded';
  
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark as read when selected
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, lastMessage: {...conv.lastMessage, isRead: true} } 
          : conv
      )
    );
  };
  
  const handleSearchConversations = (query: string) => {
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
