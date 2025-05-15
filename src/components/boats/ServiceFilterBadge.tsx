
import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ServiceFilterBadgeProps {
  service: string;
}

const ServiceFilterBadge: React.FC<ServiceFilterBadgeProps> = ({ service }) => {
  const navigate = useNavigate();
  
  // Format service name for display (convert slug to readable text)
  const formatServiceName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Remove the service filter
  const removeFilter = () => {
    navigate('/boats');
  };
  
  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
      <span>Hizmet: {formatServiceName(service)}</span>
      <X 
        className="h-3 w-3 cursor-pointer hover:text-destructive" 
        onClick={removeFilter} 
      />
    </Badge>
  );
};

export default ServiceFilterBadge;
