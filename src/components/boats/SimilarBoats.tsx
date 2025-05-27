import React, { useState } from 'react';
import BoatCard from '@/components/ui/BoatCard';
import { BoatDTO } from '@/types/boat.types';

interface SimilarBoatsProps {
  boats: BoatDTO[];
}

const SimilarBoats: React.FC<SimilarBoatsProps> = ({ boats }) => {
  const [comparedBoats, setComparedBoats] = useState<string[]>([]);

  const handleCompareToggle = (id: string) => {
    setComparedBoats(prev => 
      prev.includes(id) 
        ? prev.filter(boatId => boatId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">Benzer Tekneler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boats.map((boat) => (
          <BoatCard
            key={boat.id}
            boat={boat}
            viewMode="grid"
            isCompared={comparedBoats.includes(boat.id.toString())}
            onCompareToggle={handleCompareToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarBoats;
