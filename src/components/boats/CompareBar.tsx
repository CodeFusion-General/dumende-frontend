
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompareBarProps {
  comparedBoats: any[];
  removeFromComparison: (id: number) => void;
  clearComparison: () => void;
}

const CompareBar: React.FC<CompareBarProps> = ({ comparedBoats, removeFromComparison, clearComparison }) => {
  if (comparedBoats.length === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 animate-slide-in-bottom">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-4">
              {comparedBoats.length} {comparedBoats.length === 1 ? 'Tekne' : 'Tekne'} Karşılaştırması
            </span>
            <div className="flex space-x-2 overflow-x-auto">
              {comparedBoats.map((boat) => (
                <div 
                  key={boat.id} 
                  className="flex items-center bg-gray-100 rounded-md py-1 px-2"
                >
                  <span className="text-sm whitespace-nowrap">{boat.name}</span>
                  <button 
                    onClick={() => removeFromComparison(boat.id)}
                    className="ml-1 p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={clearComparison}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Temizle
            </button>
            
            <Button 
              asChild
              disabled={comparedBoats.length < 2}
              className="whitespace-nowrap"
              size="sm"
            >
              <Link to={`/compare-boats?ids=${comparedBoats.map(boat => boat.id).join(',')}`}>
                Karşılaştır ({comparedBoats.length})
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
