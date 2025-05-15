
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BoatTypes = () => {
  const boatTypes = [
    {
      id: 'motoryat',
      name: 'Motoryat Kiralama',
      image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop&q=60',
      link: '/boats?type=motorlu yat'
    },
    {
      id: 'davet',
      name: 'Davet Teknesi Kiralama',
      image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop&q=60',
      link: '/boats?type=davet teknesi'
    },
    {
      id: 'gulet',
      name: 'Gulet Kiralama',
      image: 'https://images.unsplash.com/photo-1609436132311-e4b0c9220241?w=800&auto=format&fit=crop&q=60',
      link: '/boats?type=gulet'
    },
    {
      id: 'yelkenli',
      name: 'Yelkenli Kiralama',
      image: 'https://images.unsplash.com/photo-1560507074-a0430992918b?w=800&auto=format&fit=crop&q=60',
      link: '/boats?type=yelkenli'
    },
    {
      id: 'surat',
      name: 'Sürat Teknesi Kiralama',
      image: 'https://images.unsplash.com/photo-1575375767154-d7c4a71a0454?w=800&auto=format&fit=crop&q=60',
      link: '/boats?type=sürat teknesi'
    }
  ];

  return (
    <div className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Tekne Çeşitleri
          </h2>
          <Link 
            to="/boats" 
            className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium"
          >
            Tümünü Gör <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {boatTypes.map((type) => (
            <Link
              key={type.id}
              to={type.link}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
                <img
                  src={type.image}
                  alt={type.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {type.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoatTypes;
