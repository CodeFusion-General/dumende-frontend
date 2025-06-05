import React, { useState, useEffect } from "react";
import BoatCard from "../ui/BoatCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { boatService } from "@/services/boatService";
import { BoatDTO } from "@/types/boat.types";

const FeaturedBoats = () => {
  const [boats, setBoats] = useState<BoatDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.error("FeaturedBoats API Hatası:", err);
      setError("Tekneleri yüklerken bir hata oluştu.");
      setBoats([]);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Popüler Teknelerimiz
              </h2>
              <p className="text-gray-600">
                En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
              </p>
            </div>
            <Link
              to="/boats"
              className="flex items-center space-x-2 text-primary font-medium mt-4 md:mt-0 group"
            >
              <span>Tüm Tekneleri Görüntüle</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
      <div className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Popüler Teknelerimiz
              </h2>
              <p className="text-gray-600">
                En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchFeaturedBoats}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              🔄 Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Popüler Teknelerimiz
            </h2>
            <p className="text-gray-600">
              En çok tercih edilen lüks ve konforlu teknelerimizi keşfedin
            </p>
          </div>
          <Link
            to="/boats"
            className="flex items-center space-x-2 text-primary font-medium mt-4 md:mt-0 group"
          >
            <span>Tüm Tekneleri Görüntüle</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.length > 0 ? (
            boats.map((boat) => (
              <BoatCard
                key={boat.id}
                boat={boat}
                viewMode="grid"
                isCompared={false}
                onCompareToggle={() => {}} // Ana sayfada karşılaştırma yok
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Henüz tekne bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBoats;
