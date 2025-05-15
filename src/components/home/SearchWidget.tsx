
import React, { useState } from 'react';
import { Calendar, MapPin, Users, Search } from 'lucide-react';

const SearchWidget = () => {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ date, location, guests });
    // Handle search functionality here
  };
  
  return (
    <div className="bg-white rounded-xl shadow-xl p-6 animate-fade-in">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date */}
          <div className="relative">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Tarih
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Location */}
          <div className="relative">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Konum
            </label>
            <div className="relative">
              <select
                id="location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="">Konum Seçin</option>
                <option value="istanbul">İstanbul</option>
                <option value="bodrum">Bodrum</option>
                <option value="fethiye">Fethiye</option>
                <option value="marmaris">Marmaris</option>
                <option value="cesme">Çeşme</option>
                <option value="antalya">Antalya</option>
              </select>
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Guests */}
          <div className="relative">
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
              Misafir Sayısı
            </label>
            <div className="relative">
              <select
                id="guests"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              >
                <option value="">Kişi Sayısı Seçin</option>
                <option value="1-5">1-5 Kişi</option>
                <option value="6-10">6-10 Kişi</option>
                <option value="11-15">11-15 Kişi</option>
                <option value="16-20">16-20 Kişi</option>
                <option value="21+">21+ Kişi</option>
              </select>
              <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Search Button */}
          <button 
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2 md:mt-6"
          >
            <Search size={18} />
            <span>Ara</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchWidget;
