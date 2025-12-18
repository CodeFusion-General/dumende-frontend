import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BoatCard } from "../boats/BoatCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { boatService } from "@/services/boatService";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
// import { useStaggeredClasses } from "@/hooks/useStaggeredAnimation";

const FeaturedBoats = () => {
  const { language } = useLanguage();
  const t = translations[language];
  // const { getStaggeredStyle } = useStaggeredClasses(6, 150);

  // ✅ OPTIMIZED: React Query with aggressive caching for homepage
  const {
    data: boats = [],
    isLoading: loading,
    isError,
    error
  } = useQuery({
    queryKey: ['featured-boats'],
    queryFn: async () => {
      const response = await boatService.advancedSearchPaginated(
        {}, // No filters, get all boats
        {
          page: 0,
          size: 6,
          sort: "popularity,desc"
        }
      );
      return response.content || [];
    },
    staleTime: 15 * 60 * 1000, // Increased to 15 minutes (homepage data rarely changes)
    gcTime: 45 * 60 * 1000, // Increased to 45 minutes
    retry: 1, // Reduced retry for faster failure
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
  });

  const errorMessage = isError 
    ? (error?.message || "Popüler tekneler yüklenirken bir sorun oluştu")
    : null;

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
  if (isError) {
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
              <p className="text-red-600 mb-4 font-roboto">{errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
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
