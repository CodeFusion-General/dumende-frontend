import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

interface NoResultsProps {
  onReset: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ onReset }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center">
        <Search className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t.pages.boats.noResults}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {t.pages.boats.noResultsDescription}
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t.pages.boats.filters.clearFilters}
        </button>
      </div>
    </div>
  );
};

export default NoResults;
