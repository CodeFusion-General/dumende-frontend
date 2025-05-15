
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface VesselCardProps {
  id: string;
  name: string;
  type: string;
  brandModel: string;
  capacity: number;
  buildYear: number;
  status: 'active' | 'draft' | 'inactive';
  thumbnailUrl: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
}

const VesselCard: React.FC<VesselCardProps> = ({
  id,
  name,
  type,
  brandModel,
  capacity,
  buildYear,
  status,
  thumbnailUrl,
  onEdit,
  onDelete,
  onPreview
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 hover:bg-green-600';
      case 'draft': return 'bg-amber-500 hover:bg-amber-600';
      case 'inactive': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Yayında';
      case 'draft': return 'Eksik Bilgi';
      case 'inactive': return 'Yayında Değil';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      <div className="relative">
        <div className="h-48 overflow-hidden">
          <img 
            src={thumbnailUrl || '/placeholder.svg'} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
          />
        </div>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="absolute top-0 right-0 m-2">
              <Badge className={`${getStatusColor(status)} text-white`}>
                {getStatusText(status)}
              </Badge>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Tekne Durumu</h4>
                <p className="text-sm">
                  {status === 'active' && 'Bu tekne şu anda aktif olarak listeleniyor.'}
                  {status === 'draft' && 'Bu teknede eksik bilgiler var. Tamamlayınız.'}
                  {status === 'inactive' && 'Bu tekne şu anda yayında değil.'}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="font-bold text-lg truncate">{name}</h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Taşıt Tipi:</span>
            <span className="font-medium">{type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Marka/Model:</span>
            <span className="font-medium">{brandModel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Kapasite:</span>
            <span className="font-medium">{capacity} kişi</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Yapım Yılı:</span>
            <span className="font-medium">{buildYear}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(id)}
            className="flex-1"
          >
            <Edit size={16} className="mr-1" /> Düzenle
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onPreview(id)} 
            className="flex-1"
          >
            <Eye size={16} className="mr-1" /> Önizle
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:bg-red-50" 
            onClick={() => onDelete(id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VesselCard;
