import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoResultsProps {
  onReset: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ onReset }) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
      <p className="text-gray-600 mb-4">
        Arama kriterlerinize uygun tekne bulunamadı. Lütfen filtrelerinizi değiştirip tekrar deneyin.
      </p>
      <button
        onClick={onReset}
        className="text-primary hover:text-primary-dark underline"
      >
        Filtreleri Temizle
      </button>
    </div>
  );
};

export default NoResults;
