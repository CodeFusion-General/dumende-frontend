
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Anchor, Users, Calendar } from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500 text-white';
      case 'draft': return 'bg-amber-500 text-white';
      case 'inactive': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
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

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'active': return 'from-emerald-100 to-emerald-50';
      case 'draft': return 'from-amber-100 to-amber-50';
      case 'inactive': return 'from-slate-100 to-slate-50';
      default: return 'from-slate-100 to-slate-50';
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`${name} - ${type} teknesi`}
    >
      {/* Gradient Background Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(status)} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
        aria-hidden="true"
      />

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />

      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div className="h-56 overflow-hidden">
          <img 
            src={thumbnailUrl || '/placeholder.svg'} 
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110" 
          />
          
          {/* Image Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Status Badge */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="absolute top-4 right-4">
              <Badge className={`${getStatusColor(status)} shadow-lg backdrop-blur-sm border-0 px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300 group-hover:scale-105`}>
                {getStatusText(status)}
              </Badge>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 border-0 shadow-xl">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Tekne Durumu</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {status === 'active' && 'Bu tekne şu anda aktif olarak listeleniyor ve rezervasyon alabilir.'}
                {status === 'draft' && 'Bu teknede eksik bilgiler var. Lütfen tüm bilgileri tamamlayınız.'}
                {status === 'inactive' && 'Bu tekne şu anda yayında değil ve rezervasyon alamaz.'}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Vessel Type Icon */}
        <div className="absolute top-4 left-4">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
            <Anchor className="w-5 h-5 text-white drop-shadow-sm" />
          </div>
        </div>
      </div>
      
      <CardContent className="relative p-6">
        {/* Vessel Name */}
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{type}</p>
        </div>
        
        {/* Vessel Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-50 group-hover:bg-white/80 transition-all duration-300">
            <div className="p-1.5 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <Anchor className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium">Marka/Model</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{brandModel}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-50 group-hover:bg-white/80 transition-all duration-300">
            <div className="p-1.5 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium">Kapasite</p>
              <p className="text-sm font-semibold text-gray-900">{capacity} kişi</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-50 group-hover:bg-white/80 transition-all duration-300 col-span-2">
            <div className="p-1.5 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium">Yapım Yılı</p>
              <p className="text-sm font-semibold text-gray-900">{buildYear}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(id)}
            className="flex-1 border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 group-hover:shadow-md"
          >
            <Edit size={16} className="mr-2" /> Düzenle
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onPreview(id)} 
            className="flex-1 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group-hover:shadow-md"
          >
            <Eye size={16} className="mr-2" /> Önizle
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group-hover:shadow-md px-3" 
            onClick={() => onDelete(id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </CardContent>
    </Card>
  );
};

export default VesselCard;
