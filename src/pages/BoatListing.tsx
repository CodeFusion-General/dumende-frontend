import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ImageGallery from '@/components/boats/ImageGallery';
import BoatInfo from '@/components/boats/BoatInfo';
import BookingForm from '@/components/boats/BookingForm';
import BoatFeatures from '@/components/boats/BoatFeatures';
import SimilarBoats from '@/components/boats/SimilarBoats';
import Reviews from '@/components/boats/Reviews';
import { Card } from '@/components/ui/card';
import { Star, User } from 'lucide-react';

const BoatListing = () => {
  const boatData = {
    id: 'hnvtghv',
    name: 'Cruisers Yachts 328',
    type: 'Motor Yacht',
    location: 'İstanbul, Türkiye',
    price: 2500,
    priceUnit: 'hour',
    rating: 4.8,
    reviewCount: 24,
    length: '32',
    capacity: 12,
    captainOption: 'Included',
    description: 'Experience luxury on the water with our pristine Cruisers Yachts 328. Perfect for day cruises, special occasions, or sunset tours around Istanbul. Features a spacious deck, comfortable cabin, and state-of-the-art navigation equipment.',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1588960952097-4fd7fc02fe8e?w=800&auto=format&fit=crop&q=60',
    ],
    ownerName: 'Captain Ahmet',
    ownerImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
    responseTime: '1 hour',
    responseRate: '95%',
    reviews: [
      {
        id: '1',
        userName: 'Mehmet K.',
        date: '2024-03-15',
        rating: 5,
        comment: 'Amazing experience! The boat was in perfect condition and Captain Ahmet was very professional.'
      },
      // ... more reviews
    ],
    isHourly: true,
    specs: {
      capacity: 12,
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ImageGallery images={boatData.images} />
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BoatInfo boat={boatData} />
              
              <BoatFeatures />

              {/* Meet Your Host Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Meet Your Host</h2>
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={boatData.ownerImage}
                      alt={boatData.ownerName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{boatData.ownerName}</h3>
                      <div className="mt-2 space-y-2 text-gray-600">
                        <p>Response rate: {boatData.responseRate}</p>
                        <p>Response time: {boatData.responseTime}</p>
                      </div>
                      <p className="mt-4 text-gray-700">
                        Professional captain with over 15 years of experience. 
                        Certified by the Turkish Maritime Authority. Fluent in English and Turkish.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Reviews 
                reviews={boatData.reviews} 
                averageRating={boatData.rating}
                reviewCount={boatData.reviewCount}
              />

              <SimilarBoats />
            </div>
            <div className="lg:col-span-1">
              <BookingForm 
                price={boatData.price}
                isHourly={boatData.priceUnit === 'hour'}
                maxGuests={boatData.specs.capacity}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BoatListing;
