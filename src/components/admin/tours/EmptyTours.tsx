
import React from 'react';
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

interface EmptyToursProps {
  onAddClick: () => void;
}

const EmptyTours: React.FC<EmptyToursProps> = ({ onAddClick }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-dashed border-gray-300 text-center">
      <Map size={64} className="text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">{t.admin.emptyTours.title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {t.admin.emptyTours.description}
      </p>
      <Button
        onClick={onAddClick}
        className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
      >
        <Plus size={16} className="mr-1" /> {t.admin.emptyTours.addButton}
      </Button>
    </div>
  );
};

export default EmptyTours;
