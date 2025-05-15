
import React from 'react';
import BoatCard from '@/components/ui/BoatCard';
import { Card } from '@/components/ui/card';

const SimilarBoats = () => {
  const similarBoats = [
    {
      id: "2",
      name: "Beneteau Oceanis 45",
      type: "Sailboat",
      imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop&q=60",
      location: "İstanbul, Türkiye",
      capacity: 10,
      price: 3000,
      priceUnit: "hour" as const,
      rating: 4.9
    },
    {
      id: "3",
      name: "Sea Ray 400",
      type: "Motor Yacht",
      imageUrl: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&auto=format&fit=crop&q=60",
      location: "İstanbul, Türkiye",
      capacity: 15,
      price: 4000,
      priceUnit: "hour" as const,
      rating: 4.7
    },
    {
      id: "4",
      name: "Princess 62",
      type: "Motor Yacht",
      imageUrl: "https://images.unsplash.com/photo-1588960952097-4fd7fc02fe8e?w=800&auto=format&fit=crop&q=60",
      location: "İstanbul, Türkiye",
      capacity: 12,
      price: 5000,
      priceUnit: "hour" as const,
      rating: 4.8
    }
  ];

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">Similar Boats You Might Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarBoats.map((boat) => (
          <BoatCard key={boat.id} {...boat} />
        ))}
      </div>
    </div>
  );
};

export default SimilarBoats;
