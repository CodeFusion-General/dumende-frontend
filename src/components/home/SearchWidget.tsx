import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { boatService, AdvancedSearchRequest } from "@/services/boatService";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
// import { createRippleEffect } from "@/lib/animations";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "location" | "boat" | "recent";
  icon?: React.ReactNode;
}

// Debounce utility function (browser-safe type)
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate search suggestions based on query (uses cached locations state)
const generateSearchSuggestions = async (
  query: string,
  allLocations: string[]
): Promise<SearchSuggestion[]> => {
  const suggestions: SearchSuggestion[] = [];

  try {
    // Backend suggestions
    const backendSuggestions = await boatService.getSuggestions(query, 6);
    const mapped = backendSuggestions.map((s) => ({
      id: s.id,
      text: s.text,
      type: s.type.toLowerCase() as "location" | "boat" | "recent",
      icon:
        s.type === "LOCATION" ? (
          <MapPin size={16} className="text-white/60" />
        ) : (
          <Search size={16} className="text-white/60" />
        ),
    }));
    suggestions.push(...mapped);

    // Recent searches (local)
    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    )
      .filter((search: string) =>
        search.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 2)
      .map((search: string) => ({
        id: `recent-${search}`,
        text: search,
        type: "recent" as const,
        icon: <Search size={16} className="text-white/40" />,
      }));
    suggestions.push(...recentSearches);
  } catch (error) {
    console.error("Error generating suggestions:", error);
  }

  return suggestions.slice(0, 6);
};

interface SearchWidgetProps {
  onDatePickerToggle?: (open: boolean) => void;
}

const SearchWidget = ({ onDatePickerToggle }: SearchWidgetProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<"start" | "end">(
    "start"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const {
    data: remoteLocations,
    isLoading: isLocationsQueryLoading,
    isError: isLocationsError,
  } = useQuery({
    queryKey: ["boat-locations"],
    queryFn: () => boatService.getAllLocations(),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    // React Query lokasyon verisini local state'e yansıtalım
    if (remoteLocations && remoteLocations.length > 0) {
      setLocations(remoteLocations);
      setLocationsLoading(false);
    } else if (!isLocationsQueryLoading && isLocationsError) {
      // Hata durumunda fallback lokasyonlar
      setLocations([
        "İstanbul",
        "Bodrum",
        "Fethiye",
        "Marmaris",
        "Çeşme",
        "Antalya",
      ]);
      setLocationsLoading(false);
    }
  }, [remoteLocations, isLocationsQueryLoading, isLocationsError]);

  // Debounced search suggestions
  const debouncedSearchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const suggestions = await generateSearchSuggestions(query, locations);
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search suggestions error:", error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300),
    [locations]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedSearchSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: open/close date picker with callback
  const setDatePickerOpen = (open: boolean) => {
    setShowDatePicker(open);
    try {
      onDatePickerToggle && onDatePickerToggle(open);
    } catch (err) {
      // ignore callback errors to avoid UI breakage
      console.error("onDatePickerToggle error", err);
    }
  };

  // Close date picker on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDatePicker) {
        setDatePickerOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showDatePicker]);

  // Lokasyonlar React Query üzerinden yönetiliyor; eski fetchLocations kaldırıldı

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !location || !guests) {
      alert(t.search.errors.fillAllFields);
      return;
    }

    setLoading(true);

    try {
      // Misafir sayısını parse et
      const guestRange = guests.split("-");
      const minCapacity = parseInt(guestRange[0]);

      // Gelişmiş arama parametrelerini hazırla (tarih aralığına uyumlu)
      const searchRequest: AdvancedSearchRequest = {
        locations: [location],
        startDate: startDate,
        endDate: endDate || startDate, // Eğer bitiş tarihi yoksa başlangıç tarihini kullan
        minCapacity,
      };

      // Sonuçlar sayfasına yönlendir (server tarafında paginated kullanılacak)
      const params = new URLSearchParams({
        location,
        start: searchRequest.startDate || "",
        end: searchRequest.endDate || "",
        guests,
        filter: "location",
      });

      navigate(`/boats?${params.toString()}`);
    } catch (error) {
      console.error("SearchWidget arama hatası:", error);
      alert(t.search.errors.searchError);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (fieldName?: string) => {
    setIsFocused(true);
    setIsExpanded(true);
    if (fieldName) {
      setFocusedField(fieldName);
    }
  };

  const handleBlur = (fieldName?: string) => {
    setIsFocused(false);
    if (fieldName === focusedField) {
      setFocusedField(null);
    }
    // Keep expanded if any field has value
    if (!startDate && !endDate && !location && !guests && !searchQuery) {
      setIsExpanded(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setActiveSuggestionIndex(-1);
  };

  // Handle keyboard navigation in suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);

    // Save to recent searches
    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );
    const updatedSearches = [
      suggestion.text,
      ...recentSearches.filter((s: string) => s !== suggestion.text),
    ].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    // If it's a location suggestion, also set the location field
    if (suggestion.type === "location") {
      setLocation(suggestion.text);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // Date picker handlers
  const openDatePicker = (type: "start" | "end") => {
    setDatePickerType(type);
    setDatePickerOpen(true);
  };

  const handleDateSelect = (selectedDate: string) => {
    if (datePickerType === "start") {
      setStartDate(selectedDate);
      // Eğer bitiş tarihi başlangıç tarihinden önceyse, bitiş tarihini sıfırla
      if (endDate && selectedDate > endDate) {
        setEndDate("");
      }
    } else {
      setEndDate(selectedDate);
    }
    setDatePickerOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Ripple effect is globally handled by AnimationUtils (disabled here for type safety)

  return (
    <div
      ref={widgetRef}
      data-search-widget
      className={`glass-card bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 ease-glass animate-slide-in-glass ${
        isExpanded ? "p-6" : "p-4"
      } ${isFocused ? "bg-white/15 shadow-glass-hover" : ""}`}
      style={{
        transform: isExpanded ? "scale(1.02)" : "scale(1)",
        backdropFilter: isFocused ? "blur(20px)" : "blur(15px)",
      }}
    >
      {/* Compact Header (when collapsed) */}
      {!isExpanded && (
        <div
          className="flex items-center justify-between cursor-pointer animate-fade-in"
          onClick={toggleExpanded}
        >
          <div className="flex items-center space-x-3">
            <Search className="text-white/80" size={20} />
            <span className="text-white font-medium">
              {t.search.searchButton}
            </span>
          </div>
          <ChevronDown
            className="text-white/60 transition-transform duration-300"
            size={20}
          />
        </div>
      )}

      {/* Expanded Form */}
      <div
        className={`transition-all duration-500 ease-glass overflow-hidden ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Collapse Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-lg">
            {t.search.searchButton}
          </h3>
          <button
            type="button"
            onClick={toggleExpanded}
            className="glass-button p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            <ChevronUp className="text-white/60" size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch}>
          {/* Enhanced Search Input with Suggestions */}
          <div className="relative mb-6 animate-fade-in-up">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              {language === "tr" ? "Arama" : "Search"}
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                id="search"
                placeholder={
                  language === "tr"
                    ? "Nereden Binmek İstiyorsun"
                    : "Where do you want to board?"
                }
                className={`w-full pl-10 pr-10 py-3 glass-light rounded-xl border transition-all duration-300 backdrop-blur-sm text-white placeholder-white/60 ${
                  focusedField === "search"
                    ? "border-white/40 ring-2 ring-white/30 bg-white/15 shadow-glass-hover"
                    : "border-white/20 bg-white/10"
                } ${
                  showSuggestions && suggestions.length > 0
                    ? "rounded-b-none"
                    : ""
                }`}
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => handleFocus("search")}
                onBlur={() => handleBlur("search")}
                style={{
                  background:
                    focusedField === "search"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.1)",
                }}
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls="search-suggestions"
                aria-autocomplete="list"
              />
              <Search
                className="absolute left-3 top-3.5 text-white/60"
                size={18}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3.5 text-white/60 hover:text-white/80 transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              )}
              {suggestionsLoading && (
                <div className="absolute right-3 top-3.5">
                  <Loader2 className="animate-spin text-white/60" size={16} />
                </div>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                role="listbox"
                id="search-suggestions"
                aria-label={
                  language === "tr" ? "Arama önerileri" : "Search suggestions"
                }
                className="absolute top-full left-0 right-0 z-[100] glass-card bg-white/10 backdrop-blur-lg border border-white/20 border-t-0 rounded-b-xl shadow-2xl animate-fade-in-up"
                style={{
                  backdropFilter: "blur(20px)",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {suggestions.length > 0 ? (
                  <div className="py-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        role="option"
                        aria-selected={index === activeSuggestionIndex}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-all duration-200 ${
                          index === activeSuggestionIndex
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                      >
                        {suggestion.icon}
                        <div className="flex-1">
                          <span className="text-sm">{suggestion.text}</span>
                          <div className="text-xs text-white/50 capitalize">
                            {suggestion.type === "location" &&
                              (language === "tr" ? "Lokasyon" : "Location")}
                            {suggestion.type === "boat" &&
                              (language === "tr" ? "Tekne" : "Boat")}
                            {suggestion.type === "recent" &&
                              (language === "tr"
                                ? "Son arama"
                                : "Recent search")}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-white/60 text-sm">
                    {language === "tr"
                      ? "Öneri bulunamadı"
                      : "No suggestions found"}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Start Date */}
            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                {language === "tr" ? "Başlangıç Tarihi" : "Start Date"}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => openDatePicker("start")}
                  className="w-full pl-10 pr-4 py-3 glass-light rounded-xl border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm text-left"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {startDate
                    ? formatDateDisplay(startDate)
                    : language === "tr"
                    ? "Tarih seçin"
                    : "Select date"}
                </button>
                <Calendar
                  className="absolute left-3 top-3.5 text-white/60"
                  size={18}
                />
              </div>
            </div>

            {/* End Date */}
            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                {language === "tr" ? "Bitiş Tarihi" : "End Date"}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => openDatePicker("end")}
                  className="w-full pl-10 pr-4 py-3 glass-light rounded-xl border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm text-left"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  disabled={!startDate}
                >
                  {endDate
                    ? formatDateDisplay(endDate)
                    : language === "tr"
                    ? "Bitiş tarihi (opsiyonel)"
                    : "End date (optional)"}
                </button>
                <Calendar
                  className="absolute left-3 top-3.5 text-white/60"
                  size={18}
                />
              </div>
            </div>

            {/* Location */}
            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <label
                htmlFor="location"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                {t.search.location}
              </label>
              <div className="relative">
                <select
                  id="location"
                  className="w-full pl-10 pr-4 py-3 glass-light rounded-xl border border-white/20 text-white focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm appearance-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => handleFocus("location")}
                  onBlur={() => handleBlur("location")}
                  disabled={locationsLoading}
                  required
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <option value="" className="bg-gray-800 text-white">
                    {locationsLoading
                      ? language === "tr"
                        ? "Lokasyonlar yükleniyor..."
                        : "Loading locations..."
                      : language === "tr"
                      ? "Nereden Binmek istiyorsun"
                      : "Choose location"}
                  </option>
                  {locations.map((loc) => (
                    <option
                      key={loc}
                      value={loc}
                      className="bg-gray-800 text-white"
                    >
                      {loc}
                    </option>
                  ))}
                </select>
                <MapPin
                  className="absolute left-3 top-3.5 text-white/60"
                  size={18}
                />
                <ChevronDown
                  className="absolute right-3 top-3.5 text-white/60 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Guests */}
            <div
              className="relative animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
            >
              <label
                htmlFor="guests"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                {t.search.guests}
              </label>
              <div className="relative">
                <select
                  id="guests"
                  className="w-full pl-10 pr-4 py-3 glass-light rounded-xl border border-white/20 text-white focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm appearance-none"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  onFocus={() => handleFocus("guests")}
                  onBlur={() => handleBlur("guests")}
                  required
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <option value="" className="bg-gray-800 text-white">
                    {t.search.guestsPlaceholder}
                  </option>
                  <option value="1-5" className="bg-gray-800 text-white">
                    1-5 {t.common.person}
                  </option>
                  <option value="6-10" className="bg-gray-800 text-white">
                    6-10 {t.common.person}
                  </option>
                  <option value="11-15" className="bg-gray-800 text-white">
                    11-15 {t.common.person}
                  </option>
                  <option value="16-20" className="bg-gray-800 text-white">
                    16-20 {t.common.person}
                  </option>
                  <option value="21-50" className="bg-gray-800 text-white">
                    21+ {t.common.person}
                  </option>
                </select>
                <Users
                  className="absolute left-3 top-3.5 text-white/60"
                  size={18}
                />
                <ChevronDown
                  className="absolute right-3 top-3.5 text-white/60 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Search Button */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                type="submit"
                disabled={loading || locationsLoading}
                className="w-full btn-glass-accent font-medium py-3 px-6 rounded-xl transition-all duration-300 ease-glass flex items-center justify-center space-x-2 md:mt-8 disabled:opacity-50 animate-hover-lift animate-ripple"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(248, 203, 46, 0.9) 0%, rgba(255, 213, 79, 0.9) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(248, 203, 46, 0.3)",
                  color: "#1a1a1a",
                  fontWeight: "600",
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                    <span>
                      {language === "tr" ? "Arıyor..." : "Searching..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>{t.search.searchButton}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fade-in"
          onClick={() => setDatePickerOpen(false)}
          style={{ backdropFilter: "blur(20px)" }}
        >
          <div
            className="glass-card bg-white/25 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 max-w-md w-full mx-4 relative z-[10000] animate-fade-in-up"
            style={{
              backdropFilter: "blur(30px)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg">
                {datePickerType === "start"
                  ? language === "tr"
                    ? "Başlangıç Tarihi"
                    : "Start Date"
                  : language === "tr"
                  ? "Bitiş Tarihi"
                  : "End Date"}
              </h3>
              <button
                type="button"
                onClick={() => setDatePickerOpen(false)}
                className="glass-button p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <X className="text-white/60" size={20} />
              </button>
            </div>

            {/* Calendar */}
            <div className="space-y-4">
              {/* Month/Year Header */}
              <div className="flex justify-between items-center">
                <h4 className="text-white font-medium">
                  {new Date().toLocaleDateString(
                    language === "tr" ? "tr-TR" : "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </h4>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {(language === "tr"
                  ? ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
                  : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                ).map((day) => (
                  <div
                    key={day}
                    className="text-white/60 text-sm font-medium py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => {
                  const dayStr = day.toISOString().split("T")[0];
                  const today = new Date().toISOString().split("T")[0];
                  const isToday = dayStr === today;
                  const isPast = dayStr < today;
                  const isCurrentMonth =
                    day.getMonth() === new Date().getMonth();
                  const isSelected =
                    dayStr ===
                    (datePickerType === "start" ? startDate : endDate);
                  const isInRange =
                    startDate &&
                    endDate &&
                    dayStr >= startDate &&
                    dayStr <= endDate;

                  // Eğer bitiş tarihi seçiyorsak ve başlangıç tarihinden önceki tarihleri devre dışı bırak
                  const isDisabled =
                    isPast ||
                    (datePickerType === "end" &&
                      startDate &&
                      dayStr < startDate);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(dayStr)}
                      disabled={isDisabled}
                      className={`
                        h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          isDisabled
                            ? "text-white/30 cursor-not-allowed"
                            : "text-white hover:bg-white/20 cursor-pointer"
                        }
                        ${!isCurrentMonth ? "text-white/40" : ""}
                        ${isToday ? "ring-2 ring-yellow-400" : ""}
                        ${
                          isSelected
                            ? "bg-yellow-400 text-gray-900 font-bold"
                            : ""
                        }
                        ${isInRange && !isSelected ? "bg-yellow-400/30" : ""}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDatePickerOpen(false)}
                  className="px-4 py-2 glass-button rounded-lg text-white/80 hover:text-white transition-all duration-300"
                >
                  {language === "tr" ? "İptal" : "Cancel"}
                </button>
                {datePickerType === "end" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEndDate("");
                      setDatePickerOpen(false);
                    }}
                    className="px-4 py-2 glass-button rounded-lg text-white/80 hover:text-white transition-all duration-300"
                  >
                    {language === "tr" ? "Temizle" : "Clear"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchWidget;
