import React from 'react';
import { Star, Users, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BoatDTO } from '@/types/boat.types';

interface BoatCardProps {
  boat: BoatDTO;
  viewMode: 'grid' | 'list';
  isCompared: boolean;
  onCompareToggle: (id: string) => void;
}

const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  viewMode,
  isCompared,
  onCompareToggle,
}) => {
  // Get primary image URL or fallback
  const imageUrl = boat.images && boat.images.length > 0 
    ? boat.images.find(img => img.isPrimary)?.imageData || boat.images[0].imageData 
    : '/placeholder-boat.jpg';

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden h-48">
        <img
          src={imageUrl}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-bold">
          {boat.type}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800">{boat.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-accent" fill="#F8CB2E" />
            <span className="text-gray-700 font-medium">{(boat.rating || 0).toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mb-3">{boat.location}</p>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-1" />
            <span className="text-sm">{boat.capacity} kişi</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Anchor size={16} className="mr-1" />
            <span className="text-sm">{boat.type}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="font-bold text-primary">
            {boat.dailyPrice} ₺
            <span className="text-gray-400 text-sm font-normal">
              /gün
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onCompareToggle(boat.id.toString())}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isCompared 
                  ? "bg-accent text-accent-foreground" 
                  : "border border-gray-300 hover:border-accent hover:text-accent"
              }`}
            >
              {isCompared ? 'Karşılaştırılıyor' : 'Karşılaştır'}
            </button>
            
            <Link 
              to={`/boats/${boat.id}`}
              className="text-primary border border-primary hover:bg-primary hover:text-white rounded-lg px-4 py-1.5 transition-all duration-300 text-sm font-medium"
            >
              İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatCard;
