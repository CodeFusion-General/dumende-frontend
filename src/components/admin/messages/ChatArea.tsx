
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from './types';
import { Send, PaperclipIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatAreaProps {
  conversation: Conversation;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ conversation, sidebarOpen, toggleSidebar }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Tekne kiralama hakkında bir sorum var.',
      sender: 'user',
      timestamp: '10:30'
    },
    {
      id: '2',
      text: 'Merhaba! Teknemizi ne zaman kiralamak istersiniz?',
      sender: 'captain',
      timestamp: '10:40'
    },
    {
      id: '3',
      text: 'Tekne kiralama hakkında bir sorum var.',
      sender: 'user',
      timestamp: 'Dün'
    },
    {
      id: '4',
      text: 'Merhaba, elbette. Sorunuzu iletebilirsiniz.',
      sender: 'captain',
      timestamp: '12:30'
    },
    {
      id: '5',
      text: 'Hafta sonu için müsait tekneleriniz var mı?',
      sender: 'user',
      timestamp: '11:15'
    },
    {
      id: '6',
      text: 'Evet, bu hafta sonu için bir teknemiz var.',
      sender: 'captain',
      timestamp: '11:55'
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    setMessages([...messages, {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'captain',
      timestamp: `${hours}:${minutes}`
    }]);
    
    setNewMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

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
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.user.avatar} />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {conversation.user.name.split(' ').map(name => name[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-base text-gray-900">{conversation.user.name}</h3>
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
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'captain' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'captain' 
                    ? 'bg-[#1A5F7A] text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="break-words">{message.text}</p>
                <div 
                  className={`text-xs mt-1 flex justify-end items-center ${
                    message.sender === 'captain' ? 'text-gray-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp}
                  {message.sender === 'captain' && (
                    <span className="ml-1">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
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
            />
            
            <Button 
              size="icon" 
              variant="ghost"
              className="text-gray-400"
              type="button"
            >
              <PaperclipIcon size={18} />
            </Button>
            
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!newMessage.trim()}
              className="bg-[#1A5F7A] hover:bg-[#15847c] rounded-full"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
