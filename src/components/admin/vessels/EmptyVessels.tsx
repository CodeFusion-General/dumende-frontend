
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sailboat, Plus } from "lucide-react";

interface EmptyVesselsProps {
  onAddClick: () => void;
}

const EmptyVessels: React.FC<EmptyVesselsProps> = ({ onAddClick }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-dashed border-gray-300 text-center">
      <Sailboat size={64} className="text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">Henüz taşıt eklemediniz</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Teknelerinizi ekleyerek müşterilerinizin hemen rezervasyon yapmasına olanak sağlayabilirsiniz.
      </p>
      <Button 
        onClick={onAddClick}
        className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
      >
        <Plus size={16} className="mr-1" /> Taşıt Ekle
      </Button>
    </div>
  );
};

export default EmptyVessels;
