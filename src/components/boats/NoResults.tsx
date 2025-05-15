
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoResultsProps {
  onReset: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ onReset }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="text-gray-400 mb-4">
        <Search className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-xl font-bold text-brand-secondary mb-2">
        Aradığınız kriterlere uygun tekne bulunamadı
      </h3>
      <p className="text-gray-600 mb-6">
        Lütfen filtrelerinizi değiştirerek tekrar deneyin.
      </p>
      <Button 
        variant="outline" 
        className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
        onClick={onReset}
      >
        Filtreleri Temizle
      </Button>
    </div>
  );
};

export default NoResults;
