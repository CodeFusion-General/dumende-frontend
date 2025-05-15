
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Destinations = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const destinations = [
    {
      id: "1",
      name: "İstanbul",
      imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop",
      boatsCount: 45,
    },
    {
      id: "2",
      name: "Bodrum",
      imageUrl: "https://images.unsplash.com/photo-1568111561564-08726794e669?q=80&w=800&auto=format&fit=crop",
      boatsCount: 38,
    },
    {
      id: "3",
      name: "Fethiye",
      imageUrl: "https://images.unsplash.com/photo-1529596889852-5ae860540554?q=80&w=800&auto=format&fit=crop",
      boatsCount: 27,
    },
    {
      id: "4",
      name: "Marmaris",
      imageUrl: "https://images.unsplash.com/photo-1628629505481-f3577ba5bbd7?q=80&w=800&auto=format&fit=crop",
      boatsCount: 31,
    },
    {
      id: "5",
      name: "Antalya",
      imageUrl: "https://images.unsplash.com/photo-1526048598645-62b31f82b8f5?q=80&w=800&auto=format&fit=crop",
      boatsCount: 29,
    },
    {
      id: "6",
      name: "Çeşme",
      imageUrl: "https://images.unsplash.com/photo-1558642084-fd07fae5282e?q=80&w=800&auto=format&fit=crop",
      boatsCount: 22,
    },
    {
      id: "7",
      name: "Göcek",
      imageUrl: "https://images.unsplash.com/photo-1528493639441-dca7272d60e3?q=80&w=800&auto=format&fit=crop",
      boatsCount: 18,
    },
  ];
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Popüler Destinasyonlar
            </h2>
            <p className="text-gray-600">
              Türkiye'nin en güzel koylarında tekne kiralama hizmeti
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-6 pb-6 hide-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          {destinations.map((destination) => (
            <div 
              key={destination.id}
              className="flex-shrink-0 w-64 md:w-80"
            >
              <div className="relative rounded-xl overflow-hidden h-80 group">
                <img 
                  src={destination.imageUrl} 
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {destination.boatsCount} tekne mevcut
                  </p>
                  <Link 
                    to={`/boats?location=${destination.name}`}
                    className="bg-white/90 hover:bg-white text-primary font-medium py-2 px-5 rounded-lg transition-colors inline-block"
                  >
                    Tekneleri Görüntüle
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Destinations;
