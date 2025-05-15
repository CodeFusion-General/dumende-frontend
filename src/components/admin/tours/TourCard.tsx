
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  duration: string;
  price: number;
  location: string;
  status: string;
  image: string;
  boat: string;
}

interface TourCardProps {
  tour: Tour;
  onDelete: (id: string) => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, onDelete }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="text-xs">Aktif</Badge>;
      case 'draft':
        return <Badge variant="warning" className="text-xs">Taslak</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="text-xs">Yayında Değil</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bu turu silmek istediğinize emin misiniz?')) {
      onDelete(tour.id);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 overflow-hidden group">
        <img 
          src={tour.image} 
          alt={tour.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <h3 className="text-white font-semibold text-lg p-4 w-full">{tour.title}</h3>
        </div>
        <div className="absolute top-3 right-3">
          {getStatusBadge(tour.status)}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link to={`/captain/tours/${tour.id}`}>
            <Button variant="secondary" size="sm" className="mr-2">
              <Edit size={16} />
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm" 
            className="mr-2"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
          <Link to={`/tours/${tour.id}`} target="_blank">
            <Button variant="outline" size="sm" className="bg-white">
              <Eye size={16} />
            </Button>
          </Link>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Tekne:</span>
            <span className="text-sm">{tour.boat}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Süre:</span>
            <span className="text-sm">{tour.duration}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Fiyat:</span>
            <span className="text-sm font-semibold">{tour.price} ₺</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Lokasyon:</span>
            <span className="text-sm">{tour.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-3 flex justify-between">
        <Link to={`/captain/tours/${tour.id}`} className="text-[#15847c] text-sm hover:underline">
          Düzenle
        </Link>
        <Link to={`/tours/${tour.id}`} target="_blank" className="text-gray-500 text-sm hover:underline">
          Önizle
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TourCard;
