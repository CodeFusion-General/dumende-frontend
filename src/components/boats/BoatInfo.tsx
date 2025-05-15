
import React from 'react';
import { Star, MapPin, Users, Ruler, Anchor } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ExpandableText } from '@/components/ui/ExpandableText';

interface BoatInfoProps {
  boat: {
    name: string;
    type: string;
    location: string;
    rating: number;
    reviewCount: number;
    length: string;
    capacity: number;
    captainOption: string;
    description: string;
  };
}

const BoatInfo: React.FC<BoatInfoProps> = ({ boat }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{boat.name}</h1>
        <div className="flex items-center mt-2 space-x-4 flex-wrap">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-gray-700">{boat.rating}</span>
            <span className="ml-1 text-gray-500">({boat.reviewCount} reviews)</span>
          </div>
          <span className="text-gray-500">{boat.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center p-2">
          <Ruler className="w-6 h-6 text-primary mb-2" />
          <span className="text-sm font-medium">{boat.length} ft</span>
          <span className="text-xs text-gray-500">Length</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Users className="w-6 h-6 text-primary mb-2" />
          <span className="text-sm font-medium">{boat.capacity} guests</span>
          <span className="text-xs text-gray-500">Capacity</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Anchor className="w-6 h-6 text-primary mb-2" />
          <span className="text-sm font-medium">{boat.type}</span>
          <span className="text-xs text-gray-500">Boat Type</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Users className="w-6 h-6 text-primary mb-2" />
          <span className="text-sm font-medium">{boat.captainOption}</span>
          <span className="text-xs text-gray-500">Captain</span>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <ExpandableText text={boat.description} maxLength={300} />
      </div>
    </div>
  );
};

export default BoatInfo;
