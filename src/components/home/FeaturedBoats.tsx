import React, { useState, useEffect } from "react";
import { BoatCard } from "../boats/BoatCard"; // Düzeltilen import path
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { boatService } from "@/services/boatService";
import { BoatDTO } from "@/types/boat.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { useStaggeredClasses } from "@/hooks/useStaggeredAnimation";

const FeaturedBoats = () => {
  const [boats, setBoats] = useState<BoatDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const { getStaggeredStyle } = useStaggeredClasses(6, 150);

  useEffect(() => {
    fetchFeaturedBoats();
  }, []);

  const fetchFeaturedBoats = async () => {
    try {
      setLoading(true);

      // Önce API'yi dene
      try {
        const response = await boatService.getBoats();
        const allBoats = Array.isArray(response)
          ? response
          : (response as any)?.content || [];

        if (allBoats.length > 0) {
          const featuredBoats = allBoats.slice(0, 6);
          setBoats(featuredBoats);
          setError(null);
          return;
        }
      } catch (apiError) {
        console.warn(
          "API'den veri alınamadı, mock data kullanılıyor:",
          apiError
        );
      }

      // API'den veri gelmezse mock data kullan
      const mockBoats: BoatDTO[] = [
        {
          id: 1,
          name: "Luxury Yacht Princess",
          type: "Yacht",
          location: "Bodrum Marina",
          capacity: 12,
          dailyPrice: 2500,
          hourlyPrice: 350,
          rating: 4.8,
          buildYear: 2020,
          year: 2020,
          length: 25.5,
          width: 6.2,
          description: "Lüks ve konforlu yacht deneyimi için mükemmel seçim",
          images: [
            {
              id: 1,
              boatId: 1,
              imageUrl:
                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          features: [
            {
              id: 1,
              boatId: 1,
              featureName: "Klima",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              boatId: 1,
              featureName: "WiFi",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              boatId: 1,
              featureName: "Ses Sistemi",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 4,
              boatId: 1,
              featureName: "Güneş Güvertesi",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 2,
          name: "Speedboat Thunder",
          type: "Speedboat",
          location: "Çeşme Marina",
          capacity: 8,
          dailyPrice: 1800,
          hourlyPrice: 250,
          rating: 4.6,
          buildYear: 2019,
          year: 2019,
          length: 18.0,
          width: 4.5,
          description: "Hızlı ve eğlenceli deniz macerası",
          images: [
            {
              id: 2,
              boatId: 2,
              imageUrl:
                "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          features: [
            {
              id: 5,
              boatId: 2,
              featureName: "GPS",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 6,
              boatId: 2,
              featureName: "Sonar",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 7,
              boatId: 2,
              featureName: "Güvenlik Ekipmanları",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 3,
          name: "Sailing Boat Harmony",
          type: "Sailboat",
          location: "Kaş Marina",
          capacity: 10,
          dailyPrice: 2000,
          hourlyPrice: 280,
          rating: 4.9,
          buildYear: 2021,
          year: 2021,
          length: 22.0,
          width: 5.8,
          description: "Rüzgarın gücüyle sakin bir yolculuk",
          images: [
            {
              id: 3,
              imageUrl:
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
          features: [
            { id: 8, featureName: "Yelken Sistemi" },
            { id: 9, featureName: "Navigasyon" },
            { id: 10, featureName: "Güvenlik Donanımı" },
          ],
        },
        {
          id: 4,
          name: "Catamaran Explorer",
          type: "Catamaran",
          location: "Marmaris Marina",
          capacity: 16,
          dailyPrice: 3200,
          hourlyPrice: 450,
          rating: 4.7,
          buildYear: 2022,
          year: 2022,
          length: 28.0,
          width: 8.5,
          description: "Geniş ve stabil catamaran deneyimi",
          images: [
            {
              id: 4,
              imageUrl:
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
          features: [
            { id: 11, featureName: "Geniş Güverte" },
            { id: 12, featureName: "Barbekü" },
            { id: 13, featureName: "Su Sporları Ekipmanları" },
          ],
        },
        {
          id: 5,
          name: "Motor Yacht Elegance",
          type: "Motor Yacht",
          location: "Antalya Marina",
          capacity: 14,
          dailyPrice: 2800,
          hourlyPrice: 380,
          rating: 4.8,
          buildYear: 2020,
          year: 2020,
          length: 24.5,
          width: 6.8,
          description: "Lüks motor yacht ile unutulmaz anlar",
          images: [
            {
              id: 5,
              imageUrl:
                "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
          features: [
            { id: 14, featureName: "Jakuzi" },
            { id: 15, featureName: "Bar" },
            { id: 16, featureName: "Kabin" },
          ],
        },
        {
          id: 6,
          name: "Fishing Boat Captain",
          type: "Fishing Boat",
          location: "Sinop Marina",
          capacity: 6,
          dailyPrice: 1200,
          hourlyPrice: 180,
          rating: 4.5,
          buildYear: 2018,
          year: 2018,
          length: 15.0,
          width: 4.0,
          description: "Balık tutma macerası için ideal",
          images: [
            {
              id: 6,
              imageUrl:
                "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
            },
          ],
          features: [
            { id: 17, featureName: "Balık Tutma Ekipmanları" },
            { id: 18, featureName: "Soğutucu" },
            { id: 19, featureName: "Radar" },
          ],
        },
      ];

      setBoats(mockBoats);
      setError(null);
    } catch (err) {
      setError("Tekneler yüklenirken bir hata oluştu");
      setBoats([]);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="section-padding bg-gradient-ocean relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-blue-400/10 to-transparent rounded-full blur-2xl" />

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t.home.featuredBoats.title}
              </h2>
              <p className="text-white/80">{t.home.featuredBoats.subtitle}</p>
            </div>
            <div className="glass-button flex items-center space-x-2 text-white font-medium mt-4 md:mt-0 px-6 py-3">
              <span>{t.home.featuredBoats.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Glass loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card animate-pulse">
                <div className="bg-white/10 h-48 rounded-lg mb-4 animate-shimmer"></div>
                <div className="p-6">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="section-padding bg-gradient-ocean relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full blur-2xl" />

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Popüler Teknelerimiz
              </h2>
              <p className="text-white/80">
                En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchFeaturedBoats}
                className="glass-button bg-gradient-sunset text-gray-800 px-6 py-3 rounded-lg hover:bg-gradient-sunset-reverse transition-all duration-300 animate-ripple"
              >
                🔄 Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-gradient-ocean relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full blur-2xl" />

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Popüler Teknelerimiz
            </h2>
            <p className="text-white/80">
              En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
            </p>
          </div>
          <Link
            to="/boats"
            className="glass-button flex items-center space-x-2 text-white font-medium mt-4 md:mt-0 group px-6 py-3 animate-fade-in-up animate-delay-200"
          >
            <span>Tüm Tekneleri Görüntüle</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.length > 0 ? (
            boats.map((boat, index) => (
              <div key={boat.id} className="opacity-100 visible">
                <BoatCard
                  boat={boat}
                  viewMode="grid"
                  isHourlyMode={false}
                  isCompared={false}
                  onCompareToggle={() => {}}
                  variant="homepage"
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-white/70">Henüz tekne bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBoats;
