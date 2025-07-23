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

      const response = await boatService.getBoats();

      const allBoats = Array.isArray(response)
        ? response
        : (response as any)?.content || [];
      const featuredBoats = allBoats.slice(0, 6);

      setBoats(featuredBoats);
      setError(null);
    } catch (err) {
      setError(t.errors.somethingWentWrong);
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
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full blur-2xl" />

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {boats.length > 0 ? (
            boats.map((boat, index) => (
              <div
                key={boat.id}
                className="animate-fade-in-up opacity-0"
                style={getStaggeredStyle(index)}
              >
                <BoatCard
                  boat={boat}
                  viewMode="grid"
                  isHourlyMode={false} // Ana sayfada daily price göster
                  isCompared={false}
                  onCompareToggle={() => {}} // Ana sayfada karşılaştırma yok
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
