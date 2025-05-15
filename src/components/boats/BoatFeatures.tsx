
import React from 'react';
import { Tv, Wifi, Anchor, Users, Speaker, AirVent } from 'lucide-react';
import { Card } from '@/components/ui/card';

const BoatFeatures = () => {
  const features = [
    { icon: <Anchor className="w-6 h-6" />, name: "Navigation System" },
    { icon: <Wifi className="w-6 h-6" />, name: "Free Wifi" },
    { icon: <Tv className="w-6 h-6" />, name: "Smart TV" },
    { icon: <Users className="w-6 h-6" />, name: "Crew Included" },
    { icon: <Speaker className="w-6 h-6" />, name: "Sound System" },
    { icon: <AirVent className="w-6 h-6" />, name: "Cooler" },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="p-4 flex items-center space-x-3">
            <div className="text-primary">{feature.icon}</div>
            <span className="font-medium">{feature.name}</span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BoatFeatures;
