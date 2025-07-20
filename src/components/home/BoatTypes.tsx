import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Anchor, TrendingUp, DollarSign, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { boatService, TypeStatistic } from "@/services/boatService";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const BoatTypes = () => {
  const [boatTypes, setBoatTypes] = useState<TypeStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetchBoatTypes();
  }, []);

  const fetchBoatTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const typeStats = await boatService.getTypeStatistics();

      // Tip istatistiklerini tekne sayısına göre sırala
      const sortedTypes = typeStats.sort((a, b) => b.boatCount - a.boatCount);

      setBoatTypes(sortedTypes);
    } catch (error) {
      console.error("BoatTypes istatistik hatası:", error);
      setError("Veriler yüklenirken bir hata oluştu");

      // Error occurred - no fallback data used
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString("tr-TR")}`;
  };

  const getTypeDisplayName = (type: string): string => {
    return t.home.boatTypes.types[type as keyof typeof t.home.boatTypes.types] || type;
  };

  const getTypeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      SAILBOAT: "⛵",
      MOTORBOAT: "🚤",
      YACHT: "🛥️",
      SPEEDBOAT: "💨",
      CATAMARAN: "⛵",
    };
    return icons[type] || "🚢";
  };

  const getTypeColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  // Tip filtreli tekne listesine yönlendirme
  const handleViewBoatsByType = (type: string) => {

    // URL parametreleri ile tip filtrelemesi
    const params = new URLSearchParams({
      type: type,
      filter: "type",
    });

    navigate(`/boats?${params.toString()}`);
  };

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t.home.boatTypes.title}
            </h2>
            <p className="text-gray-600">
              {t.home.boatTypes.subtitle}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchBoatTypes}
                className="btn-primary"
              >
                {t.common.tryAgain}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boat Types Grid */}
        {!loading && boatTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {boatTypes.map((type, index) => (
              <div
                key={type.type}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                onClick={() => handleViewBoatsByType(type.type)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="text-4xl p-2 rounded-full"
                    style={{ backgroundColor: getTypeColor(index) }}
                  >
                    {getTypeIcon(type.type)}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    #{index + 1} {t.home.boatTypes.popular}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {getTypeDisplayName(type.type)}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>{t.home.boatTypes.availableBoats}</span>
                                         <span className="font-medium">
                       {type.boatCount} {t.home.boatTypes.boats}
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t.home.boatTypes.averagePrice}</span>
                    <span className="font-medium">{formatPrice(type.averagePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t.home.boatTypes.priceRange}</span>
                    <span className="font-medium">
                      {formatPrice(type.minPrice)} - {formatPrice(type.maxPrice)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewBoatsByType(type.type);
                  }}
                  className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{t.home.boatTypes.viewThisType}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && boatTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">🚤</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t.common.noDataAvailable}
              </h3>
              <p className="text-gray-600 text-sm">
                {t.errors.somethingWentWrong}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoatTypes;
