import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { boatService, AdvancedSearchRequest } from "@/services/boatService";

const SearchWidget = () => {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      const locationList = await boatService.getAllLocations();

      setLocations(locationList);
    } catch (error) {
      console.error("SearchWidget lokasyon hatası:", error);
      // Hata durumunda fallback lokasyonlar
      setLocations([
        "İstanbul",
        "Bodrum",
        "Fethiye",
        "Marmaris",
        "Çeşme",
        "Antalya",
      ]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !location || !guests) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      // Misafir sayısını parse et
      const guestRange = guests.split("-");
      const minCapacity = parseInt(guestRange[0]);

      // Gelişmiş arama parametrelerini hazırla
      const searchRequest: AdvancedSearchRequest = {
        location: location,
        startDate: date,
        endDate: date, // Tek günlük arama için aynı tarih
        minCapacity: minCapacity,
      };

      // Arama yap ve sonuçlar sayfasına yönlendir
      const results = await boatService.advancedSearch(searchRequest);

      // URL parametreleri ile tekne listesi sayfasına yönlendir
      const params = new URLSearchParams({
        location,
        date,
        guests,
        results: results.length.toString(),
      });

      navigate(`/boats?${params.toString()}`);
    } catch (error) {
      console.error("SearchWidget arama hatası:", error);
      alert("Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 animate-fade-in">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date */}
          <div className="relative">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tarih
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Bugünden sonraki tarihler
                required
              />
              <Calendar
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* Location */}
          <div className="relative">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Konum
            </label>
            <div className="relative">
              <select
                id="location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={locationsLoading}
                required
              >
                <option value="">
                  {locationsLoading
                    ? "Lokasyonlar yükleniyor..."
                    : "Konum Seçin"}
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <MapPin
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* Guests */}
          <div className="relative">
            <label
              htmlFor="guests"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
                <option value="21-50">21+ Kişi</option>
              </select>
              <Users
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading || locationsLoading}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2 md:mt-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Arıyor...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Ara</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchWidget;
