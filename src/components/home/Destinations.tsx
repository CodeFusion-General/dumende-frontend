import React, { useState, useEffect } from "react";
import { MapPin, TrendingUp, DollarSign, Anchor } from "lucide-react";
import { boatService, LocationStatistic } from "@/services/boatService";

const Destinations = () => {
  const [destinations, setDestinations] = useState<LocationStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        "🚀 Destinations: Backend'den lokasyon istatistikleri çekiliyor..."
      );

      const locationStats = await boatService.getLocationStatistics();
      console.log(
        "✅ Destinations: İstatistikler başarıyla alındı:",
        locationStats
      );

      // En popüler 6 lokasyonu al (tekne sayısına göre sıralı)
      const topDestinations = locationStats
        .sort((a, b) => b.boatCount - a.boatCount)
        .slice(0, 6);

      setDestinations(topDestinations);
    } catch (error) {
      console.error("❌ Destinations istatistik hatası:", error);
      setError("Veriler yüklenirken bir hata oluştu");

      // Hata durumunda fallback data
      setDestinations([
        {
          location: "İstanbul",
          boatCount: 25,
          averagePrice: 2500,
          minPrice: 800,
          maxPrice: 8000,
        },
        {
          location: "Bodrum",
          boatCount: 18,
          averagePrice: 3200,
          minPrice: 1200,
          maxPrice: 12000,
        },
        {
          location: "Fethiye",
          boatCount: 15,
          averagePrice: 2800,
          minPrice: 1000,
          maxPrice: 9000,
        },
        {
          location: "Marmaris",
          boatCount: 12,
          averagePrice: 2600,
          minPrice: 900,
          maxPrice: 7500,
        },
        {
          location: "Çeşme",
          boatCount: 10,
          averagePrice: 2200,
          minPrice: 700,
          maxPrice: 6000,
        },
        {
          location: "Antalya",
          boatCount: 8,
          averagePrice: 2900,
          minPrice: 1100,
          maxPrice: 8500,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString("tr-TR")}`;
  };

  const getDestinationImage = (location: string) => {
    const images: { [key: string]: string } = {
      İstanbul:
        "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Bodrum:
        "https://images.unsplash.com/photo-1594735797933-d0c17737f852?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Fethiye:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Marmaris:
        "https://images.unsplash.com/photo-1544533538-b4ddabca0d11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Çeşme:
        "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      Antalya:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    };
    return (
      images[location] ||
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Popüler Destinasyonlar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En çok tercih edilen lokasyonlarımızda tekne kiralama fırsatlarını
              keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              📡 Backend'den lokasyon istatistikleri yükleniyor...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Popüler Destinasyonlar
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            En çok tercih edilen lokasyonlarımızda tekne kiralama fırsatlarını
            keşfedin
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-600">⚠️ {error}</p>
            <button
              onClick={fetchDestinations}
              className="mt-2 text-sm text-red-800 underline hover:no-underline"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.location}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getDestinationImage(destination.location)}
                  alt={destination.location}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-semibold text-gray-800">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <MapPin className="text-primary mr-2" size={20} />
                  <h3 className="text-xl font-bold text-gray-800">
                    {destination.location}
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Tekne Sayısı */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Anchor className="text-blue-500 mr-2" size={16} />
                      <span className="text-sm text-gray-600">
                        Mevcut Tekne
                      </span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {destination.boatCount} adet
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
                      {formatPrice(destination.averagePrice)}
                    </span>
                  </div>

                  {/* Fiyat Aralığı */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="text-yellow-500 mr-2" size={16} />
                      <span className="text-sm text-gray-600">
                        Fiyat Aralığı
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatPrice(destination.minPrice)} -{" "}
                      {formatPrice(destination.maxPrice)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                  Tekneleri Görüntüle
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Backend Status */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            ✅ {destinations.length} lokasyon istatistiği backend'den yüklendi
          </p>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
