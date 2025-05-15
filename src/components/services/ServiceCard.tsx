
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  link: string;
  onClick?: () => void;
}

const ServiceCard = ({ title, description, Icon, color, link, onClick }: ServiceCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(link);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full flex flex-col group cursor-pointer"
      onClick={handleClick}
    >
      <div className={cn("p-3 rounded-lg w-fit mb-4 transition-colors group-hover:bg-primary group-hover:text-white", color)}>
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      <Button 
        variant="outline" 
        className="mt-2 w-full group-hover:bg-primary group-hover:text-white transition-colors"
      >
        Detaylı Bilgi
      </Button>
    </div>
  );
};

export default ServiceCard;
