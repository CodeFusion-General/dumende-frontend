
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface EmptyConversationStateProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const EmptyConversationState: React.FC<EmptyConversationStateProps> = ({ 
  sidebarOpen,
  toggleSidebar 
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50">
      <div className="text-gray-500 mb-3">
        {sidebarOpen ? (
          <>Bir konuşma seçin ya da yeni bir mesaj başlatın</>
        ) : (
          <>
            <Button
              onClick={toggleSidebar}
              variant="outline"
              size="sm"
              className="mb-2"
            >
              <ChevronRight size={16} className="mr-1" /> Konuşmaları Göster
            </Button>
            <div>Bir konuşma seçin ya da yeni bir mesaj başlatın</div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmptyConversationState;
