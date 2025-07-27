
import React, { useState } from 'react';
import { Conversation } from './types';
import { Search, MoreVertical, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onSearchConversations: (query: string) => void;
  onArchiveConversation: (id: string) => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  onSearchConversations,
  onArchiveConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchConversations(query);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Ara"
            className="pl-10 bg-white border-gray-200 focus-visible:ring-1 rounded-md"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sonuç bulunamadı
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <li 
                key={conversation.id}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedId === conversation.id ? 'bg-gray-100' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.user.avatar} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                      {conversation.user.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-500">{conversation.lastMessage.timestamp}</span>
                    </div>
                    <p className={`text-sm truncate ${!conversation.lastMessage.isRead ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                      {conversation.lastMessage.text}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none">
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onArchiveConversation(conversation.id)}>
                        <Archive size={16} className="mr-2" />
                        <span>Arşivle</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
