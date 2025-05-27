import React from 'react';
import { Tv, Wifi, Anchor, Users, Speaker, AirVent, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Feature {
  id: number;
  boatId: number;
  featureName: string;
  createdAt: string;
  updatedAt: string;
}

interface BoatFeaturesProps {
  features: Feature[];
}

const FEATURE_ICONS: Record<string, JSX.Element> = {
  "NAVIGATION_SYSTEM": <Anchor className="w-6 h-6" />,
  "WIFI": <Wifi className="w-6 h-6" />,
  "SMART_TV": <Tv className="w-6 h-6" />,
  "CREW_INCLUDED": <Users className="w-6 h-6" />,
  "SOUND_SYSTEM": <Speaker className="w-6 h-6" />,
  "COOLER": <AirVent className="w-6 h-6" />
};

const FEATURE_NAMES: Record<string, string> = {
  "NAVIGATION_SYSTEM": "Navigation System",
  "WIFI": "Free Wifi",
  "SMART_TV": "Smart TV",
  "CREW_INCLUDED": "Crew Included",
  "SOUND_SYSTEM": "Sound System",
  "COOLER": "Cooler"
};

const BoatFeatures: React.FC<BoatFeaturesProps> = ({ features }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card key={feature.id} className="p-4 flex items-center space-x-3">
            <div className="text-primary">
              {FEATURE_ICONS[feature.featureName] || <Check className="w-6 h-6" />}
            </div>
            <span className="font-medium">
              {FEATURE_NAMES[feature.featureName] || feature.featureName}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BoatFeatures;
