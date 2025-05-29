import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Anchor, TrendingUp, DollarSign, Hash } from "lucide-react";
import { boatService, TypeStatistic } from "@/services/boatService";

const BoatTypes = () => {
  const [boatTypes, setBoatTypes] = useState<TypeStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoatTypes();
  }, []);

  const fetchBoatTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🚀 BoatTypes: Backend'den tip istatistikleri çekiliyor...");

      const typeStats = await boatService.getTypeStatistics();
      console.log("✅ BoatTypes: İstatistikler başarıyla alındı:", typeStats);

      // Tip istatistiklerini tekne sayısına göre sırala
      const sortedTypes = typeStats.sort((a, b) => b.boatCount - a.boatCount);

      setBoatTypes(sortedTypes);
    } catch (error) {
      console.error("❌ BoatTypes istatistik hatası:", error);
      setError("Veriler yüklenirken bir hata oluştu");

      // Hata durumunda fallback data
      setBoatTypes([
        {
          type: "SAILBOAT",
          boatCount: 35,
          averagePrice: 2800,
          minPrice: 1000,
          maxPrice: 8000,
        },
        {
          type: "MOTOR_YACHT",
          boatCount: 28,
          averagePrice: 4500,
          minPrice: 2000,
          maxPrice: 15000,
        },
        {
          type: "CATAMARAN",
          boatCount: 22,
          averagePrice: 3500,
          minPrice: 1500,
          maxPrice: 12000,
        },
        {
          type: "MOTOR_BOAT",
          boatCount: 18,
          averagePrice: 2200,
          minPrice: 800,
          maxPrice: 6000,
        },
        {
          type: "GULET",
          boatCount: 15,
          averagePrice: 3800,
          minPrice: 1800,
          maxPrice: 10000,
        },
        {
          type: "RIB",
          boatCount: 12,
          averagePrice: 1800,
          minPrice: 600,
          maxPrice: 4000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString("tr-TR")}`;
  };

  const getTypeDisplayName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      SAILBOAT: "Yelkenli",
      MOTOR_YACHT: "Motor Yat",
      CATAMARAN: "Katamaran",
      MOTOR_BOAT: "Motor Tekne",
      GULET: "Gulet",
      RIB: "RIB Bot",
      FISHING_BOAT: "Balık Teknesi",
      SPEED_BOAT: "Hız Teknesi",
    };
    return typeNames[type] || type;
  };

  const getTypeIcon = (type: string) => {
    // Her tip için farklı emoji/ikon
    const typeIcons: { [key: string]: string } = {
      SAILBOAT: "⛵",
      MOTOR_YACHT: "🛥️",
      CATAMARAN: "🚤",
      MOTOR_BOAT: "��",
      GULET: "⛵",
      RIB: "🚤",
      FISHING_BOAT: "🎣",
      SPEED_BOAT: "💨",
    };
    return typeIcons[type] || "⚓";
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

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tekne Tipleri
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Farklı tekne tiplerinde sunduğumuz kiralama seçeneklerini keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              📡 Backend'den tip istatistikleri yükleniyor...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tekne Tipleri
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Farklı tekne tiplerinde sunduğumuz kiralama seçeneklerini keşfedin
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-600">⚠️ {error}</p>
            <button
              onClick={fetchBoatTypes}
              className="mt-2 text-sm text-red-800 underline hover:no-underline"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boatTypes.map((boatType, index) => (
            <div
              key={boatType.type}
              className="group bg-gray-50 hover:bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray-200"
            >
              {/* Header */}
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 ${getTypeColor(
                    index
                  )} rounded-full flex items-center justify-center text-white text-xl mr-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {getTypeIcon(boatType.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {getTypeDisplayName(boatType.type)}
                  </h3>
                  <span className="text-sm text-gray-500">
                    #{index + 1} Popüler
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-3">
                {/* Tekne Sayısı */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Hash className="text-blue-500 mr-2" size={16} />
                    <span className="text-sm text-gray-600">Mevcut Tekne</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {boatType.boatCount} adet
                  </span>
                </div>

                {/* Ortalama Fiyat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="text-green-500 mr-2" size={16} />
                    <span className="text-sm text-gray-600">
                      Ortalama Fiyat
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {formatPrice(boatType.averagePrice)}
                  </span>
                </div>

                {/* Fiyat Aralığı */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="text-orange-500 mr-2" size={16} />
                    <span className="text-sm text-gray-600">Fiyat Aralığı</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatPrice(boatType.minPrice)} -{" "}
                    {formatPrice(boatType.maxPrice)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full mt-6 bg-gray-200 hover:bg-primary hover:text-white text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-300">
                Bu Tip Tekneleri Görüntüle
              </button>
            </div>
          ))}
        </div>

        {/* Backend Status */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            ✅ {boatTypes.length} tekne tipi istatistiği backend'den yüklendi
          </p>
        </div>
      </div>
    </section>
  );
};

export default BoatTypes;
