import React from "react";
import TourCard from "./TourCard";
import { TourDTO } from "@/types/tour.types";

interface ToursListProps {
  tours: TourDTO[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const ToursList: React.FC<ToursListProps> = ({
  tours,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default ToursList;
