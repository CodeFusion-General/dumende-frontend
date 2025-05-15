
import React from 'react';
import BoatCard from '../ui/BoatCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedBoats = () => {
  // Mock data for boats
  const boats = [
    {
      id: "1",
      name: "Artemis",
      type: "Motor Yacht",
      imageUrl: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=800&auto=format&fit=crop",
      location: "İstanbul, Türkiye",
      capacity: 12,
      price: 7500,
      priceUnit: "day" as const,
      rating: 4.9
    },
    {
      id: "2",
      name: "Poseidon",
      type: "Sailing Yacht",
      imageUrl: "https://images.unsplash.com/photo-1586456074778-f3825fde4a70?q=80&w=800&auto=format&fit=crop",
      location: "Bodrum, Türkiye",
      capacity: 8,
      price: 5000,
      priceUnit: "day" as const,
      rating: 4.7
    },
    {
      id: "3",
      name: "Blue Heaven",
      type: "Catamaran",
      imageUrl: "https://images.unsplash.com/photo-1509216242873-7786f446f465?q=80&w=800&auto=format&fit=crop",
      location: "Fethiye, Türkiye",
      capacity: 15,
      price: 1200,
      priceUnit: "hour" as const,
      rating: 4.8
    },
    {
      id: "4",
      name: "Sea Spirit",
      type: "Motor Yacht",
      imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?q=80&w=800&auto=format&fit=crop",
      location: "Antalya, Türkiye",
      capacity: 20,
      price: 9500,
      priceUnit: "day" as const,
      rating: 5.0
    },
    {
      id: "5",
      name: "Mavi Rüya",
      type: "Gulet",
      imageUrl: "https://images.unsplash.com/photo-1599491190444-31de4e011865?q=80&w=800&auto=format&fit=crop",
      location: "Marmaris, Türkiye",
      capacity: 16,
      price: 8000,
      priceUnit: "day" as const,
      rating: 4.6
    },
    {
      id: "6",
      name: "Nautilus",
      type: "Speedboat",
      imageUrl: "https://images.unsplash.com/photo-1543159821-9162d141933b?q=80&w=800&auto=format&fit=crop",
      location: "Çeşme, Türkiye",
      capacity: 6,
      price: 800,
      priceUnit: "hour" as const,
      rating: 4.5
    },
  ];

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Popüler Teknelerimiz
            </h2>
            <p className="text-gray-600">
              En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
            </p>
          </div>
          <Link to="/boats" className="flex items-center space-x-2 text-primary font-medium mt-4 md:mt-0 group">
            <span>Tüm Tekneleri Görüntüle</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.map((boat) => (
            <BoatCard key={boat.id} {...boat} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBoats;
