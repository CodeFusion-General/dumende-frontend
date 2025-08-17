import React, { useState, useEffect } from "react";
import { BoatCard } from "../boats/BoatCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { boatService } from "@/services/boatService";
import { BoatDTO } from "@/types/boat.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
// import { useStaggeredClasses } from "@/hooks/useStaggeredAnimation";

const FeaturedBoats = () => {
  const [boats, setBoats] = useState<BoatDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  // const { getStaggeredStyle } = useStaggeredClasses(6, 150);

  useEffect(() => {
    let isMounted = true;
    
    const loadBoats = async () => {
      if (!isMounted) return;
      await fetchFeaturedBoats();
    };
    
    loadBoats();

    return () => {
      isMounted = false;
    };
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

      // API'den veri gelmezse mock data kullan - BoatDTO ile uyumlu
      const now = new Date().toISOString();
      const mockBoats: BoatDTO[] = [
        {
          id: 1,
          ownerId: 1,
          name: "Luxury Yacht Princess",
          description: "Lüks ve konforlu yacht deneyimi için mükemmel seçim",
          model: "Princess 72",
          year: 2020,
          length: 25.5,
          capacity: 12,
          dailyPrice: 2500,
          hourlyPrice: 350,
          location: "Bodrum Marina",
          rating: 4.8,
          type: "YACHT",
          status: "ACTIVE",
          brandModel: "Princess",
          buildYear: 2020,
          captainIncluded: true,
          latitude: 37.0344,
          longitude: 27.4305,
          images: [
            {
              id: 1,
              boatId: 1,
              imageUrl:
                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: now,
              updatedAt: now,
            },
          ],
          features: [
            {
              id: 1,
              boatId: 1,
              featureName: "Klima",
              createdAt: now,
              updatedAt: now,
            },
          ],
          availabilities: [],
          services: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          ownerId: 1,
          name: "Speedboat Thunder",
          description: "Hızlı ve eğlenceli deniz macerası",
          model: "Thunder 30",
          year: 2019,
          length: 18.0,
          capacity: 8,
          dailyPrice: 1800,
          hourlyPrice: 250,
          location: "Çeşme Marina",
          rating: 4.6,
          type: "SPEEDBOAT",
          status: "ACTIVE",
          brandModel: "Thunder",
          buildYear: 2019,
          captainIncluded: false,
          latitude: 38.322,
          longitude: 26.302,
          images: [
            {
              id: 2,
              boatId: 2,
              imageUrl:
                "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: now,
              updatedAt: now,
            },
          ],
          features: [
            { id: 5, boatId: 2, featureName: "GPS", createdAt: now, updatedAt: now },
          ],
          availabilities: [],
          services: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 3,
          ownerId: 1,
          name: "Sailing Boat Harmony",
          description: "Rüzgarın gücüyle sakin bir yolculuk",
          model: "Harmony 40",
          year: 2021,
          length: 22.0,
          capacity: 10,
          dailyPrice: 2000,
          hourlyPrice: 280,
          location: "Kaş Marina",
          rating: 4.9,
          type: "SAILBOAT",
          status: "ACTIVE",
          brandModel: "Harmony",
          buildYear: 2021,
          captainIncluded: true,
          images: [
            {
              id: 3,
              boatId: 3,
              imageUrl:
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: now,
              updatedAt: now,
            },
          ],
          features: [
            { id: 8, boatId: 3, featureName: "Yelken Sistemi", createdAt: now, updatedAt: now },
          ],
          availabilities: [],
          services: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 4,
          ownerId: 2,
          name: "Catamaran Explorer",
          description: "Geniş ve stabil catamaran deneyimi",
          model: "Explorer 50",
          year: 2022,
          length: 28.0,
          capacity: 16,
          dailyPrice: 3200,
          hourlyPrice: 450,
          location: "Marmaris Marina",
          rating: 4.7,
          type: "CATAMARAN",
          status: "ACTIVE",
          brandModel: "Explorer",
          buildYear: 2022,
          captainIncluded: true,
          images: [
            {
              id: 4,
              boatId: 4,
              imageUrl:
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: now,
              updatedAt: now,
            },
          ],
          features: [
            { id: 11, boatId: 4, featureName: "Geniş Güverte", createdAt: now, updatedAt: now },
          ],
          availabilities: [],
          services: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 5,
          ownerId: 2,
          name: "Motor Yacht Elegance",
          description: "Lüks motor yacht ile unutulmaz anlar",
          model: "Elegance 70",
          year: 2020,
          length: 24.5,
          capacity: 14,
          dailyPrice: 2800,
          hourlyPrice: 380,
          location: "Antalya Marina",
          rating: 4.8,
          type: "MOTORBOAT",
          status: "ACTIVE",
          brandModel: "Elegance",
          buildYear: 2020,
          captainIncluded: true,
          images: [
            {
              id: 5,
              boatId: 5,
              imageUrl:
                "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: now,
              updatedAt: now,
            },
          ],
          features: [
            { id: 14, boatId: 5, featureName: "Jakuzi", createdAt: now, updatedAt: now },
          ],
          availabilities: [],
          services: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 6,
          ownerId: 3,
          name: "Fishing Boat Captain",
          description: "Balık tutma macerası için ideal",
          model: "Captain 20",
          year: 2018,
          length: 15.0,
          capacity: 6,
          dailyPrice: 1200,
          hourlyPrice: 180,
          location: "Sinop Marina",
          rating: 4.5,
          type: "MOTORBOAT",
          status: "ACTIVE",
          brandModel: "Captain",
          buildYear: 2018,
          captainIncluded: false,
          images: [
            {
              id: 6,
              boatId: 6,
              imageUrl:
                "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              isPrimary: true,
              displayOrder: 1,
              createdAt: now,
              updatedAt: now,
            },
          ],
          features: [
            { id: 17, boatId: 6, featureName: "Balık Tutma Ekipmanları", createdAt: now, updatedAt: now },
          ],
          availabilities: [],
          services: [],
          createdAt: now,
          updatedAt: now,
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
      <div className="section-padding relative overflow-hidden">
        {/* Modern Multi-Layer Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3498db]/5 via-transparent to-[#2c3e50]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-blue-100/40" />

        {/* Floating Glass Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-white/20 to-blue-100/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-gradient-to-tr from-indigo-100/40 to-white/20 rounded-full blur-2xl animate-float-delayed" />

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-2 font-montserrat">
                {t.home.featuredBoats.title}
              </h2>
              <p className="text-gray-600 font-roboto">
                {t.home.featuredBoats.subtitle}
              </p>
            </div>
            <div className="glass-button flex items-center space-x-2 text-[#2c3e50] font-medium mt-4 md:mt-0 px-6 py-3 bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl">
              <span>{t.home.featuredBoats.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Glass loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="glass-card animate-pulse bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
              >
                <div className="bg-gray-200/60 h-48 rounded-lg mb-4 animate-shimmer"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200/60 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200/60 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200/60 rounded w-2/3"></div>
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
      <div className="section-padding relative overflow-hidden">
        {/* Modern Multi-Layer Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3498db]/5 via-transparent to-[#2c3e50]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-blue-100/40" />

        {/* Floating Glass Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-white/20 to-blue-100/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-gradient-to-tr from-indigo-100/40 to-white/20 rounded-full blur-2xl animate-float-delayed" />

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-2 font-montserrat">
                Popüler Teknelerimiz
              </h2>
              <p className="text-gray-600 font-roboto">
                En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl">
              <p className="text-red-600 mb-4 font-roboto">{error}</p>
              <button
                onClick={fetchFeaturedBoats}
                className="glass-button bg-gradient-to-r from-[#3498db] to-[#2c3e50] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 animate-ripple font-montserrat font-medium"
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
    <div className="section-padding relative overflow-hidden">
      {/* Modern Multi-Layer Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />

      {/* Dynamic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3498db]/5 via-transparent to-[#2c3e50]/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-blue-100/40" />

      {/* Floating Glass Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-white/20 to-blue-100/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 left-16 w-96 h-96 bg-gradient-to-tr from-indigo-100/40 to-white/20 rounded-full blur-2xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-bl from-[#3498db]/10 to-transparent rounded-full blur-xl animate-pulse-slow" />

      {/* Geometric Patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-2xl rotate-12 animate-spin-slow" />
        <div className="absolute bottom-20 right-32 w-24 h-24 border border-[#3498db]/20 rounded-xl -rotate-12 animate-spin-reverse" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-bounce-slow" />
      </div>

      {/* Subtle Wave Pattern */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/60 to-transparent">
        <svg
          className="absolute bottom-0 w-full h-16 text-white/40"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-2 font-montserrat">
              Popüler Teknelerimiz
            </h2>
            <p className="text-gray-600 font-roboto">
              En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
            </p>
          </div>
          <Link
            to="/boats"
            className="glass-button flex items-center space-x-2 text-[#2c3e50] hover:text-[#3498db] font-medium mt-4 md:mt-0 group px-6 py-3 animate-fade-in-up animate-delay-200 bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/40 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <span>Tüm Tekneleri Görüntüle</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {boats.length > 0 ? (
            boats.map((boat, index) => (
              <div key={boat.id} className="opacity-100 visible h-full">
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
              <p className="text-gray-500">Henüz tekne bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBoats;
