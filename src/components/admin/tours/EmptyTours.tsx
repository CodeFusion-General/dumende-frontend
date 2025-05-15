
import React from 'react';
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

interface EmptyToursProps {
  onAddClick: () => void;
}

const EmptyTours: React.FC<EmptyToursProps> = ({ onAddClick }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-dashed border-gray-300 text-center">
      <Map size={64} className="text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">Henüz tekne turu eklemediniz</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Tekne turlarınızı ekleyerek müşterilerinizin hemen rezervasyon yapmasına olanak sağlayabilirsiniz.
      </p>
      <Button 
        onClick={onAddClick}
        className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
      >
        <Plus size={16} className="mr-1" /> Tekne Turu Ekle
      </Button>
    </div>
  );
};

export default EmptyTours;
