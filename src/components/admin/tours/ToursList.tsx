
import React from 'react';
import TourCard from './TourCard';

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

interface ToursListProps {
  tours: Tour[];
  onDelete: (id: string) => void;
}

const ToursList: React.FC<ToursListProps> = ({ tours, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map(tour => (
        <TourCard key={tour.id} tour={tour} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ToursList;
