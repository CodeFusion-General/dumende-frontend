import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { boatService, AdvancedSearchRequest } from "@/services/boatService";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const SearchWidget = () => {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

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
      alert(t.search.errors.fillAllFields);
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
      alert(t.search.errors.searchError);
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
              {t.search.date}
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
              {t.search.location}
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
                    ? (language === 'tr' ? "Lokasyonlar yükleniyor..." : "Loading locations...")
                    : t.search.locationPlaceholder}
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
              {t.search.guests}
            </label>
            <div className="relative">
              <select
                id="guests"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              >
                <option value="">{t.search.guestsPlaceholder}</option>
                <option value="1-5">1-5 {t.common.person}</option>
                <option value="6-10">6-10 {t.common.person}</option>
                <option value="11-15">11-15 {t.common.person}</option>
                <option value="16-20">16-20 {t.common.person}</option>
                <option value="21-50">21+ {t.common.person}</option>
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
                <span>{language === 'tr' ? 'Arıyor...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>{t.search.searchButton}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchWidget;
