
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sailboat, Plus, Anchor, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

interface EmptyVesselsProps {
  onAddClick: () => void;
}

const EmptyVessels: React.FC<EmptyVesselsProps> = ({ onAddClick }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative">
      {/* Main Empty State Container */}
      <div className="flex flex-col items-center justify-center p-12 lg:p-16 bg-gradient-to-br from-primary/5 via-white to-primary/3 rounded-3xl border border-primary/10 text-center shadow-lg hover:shadow-xl transition-all duration-500">
        
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 group">
            <Sailboat size={48} className="text-primary group-hover:text-primary/80 transition-colors duration-300" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Anchor size={16} className="text-blue-600" />
          </div>
          <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-sm animate-pulse">
            <Plus size={12} className="text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8 max-w-lg">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            {t.admin.emptyVessels.title}
          </h3>
          <p className="text-gray-600 leading-relaxed text-lg">
            {t.admin.emptyVessels.description}
          </p>
          
          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{t.admin.emptyVessels.features.easyBooking}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{t.admin.emptyVessels.features.autoPricing}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{t.admin.emptyVessels.features.customerManagement}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{t.admin.emptyVessels.features.incomeTracking}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onAddClick}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-3 text-lg font-semibold group"
        >
          <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
          {t.admin.emptyVessels.addButton}
          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-lg" />
      <div className="absolute top-1/2 -left-2 w-12 h-12 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-md" />
      <div className="absolute top-1/4 -right-2 w-8 h-8 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full blur-sm" />
    </div>
  );
};

export default EmptyVessels;
