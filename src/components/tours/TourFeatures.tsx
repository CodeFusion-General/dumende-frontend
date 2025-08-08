import React from "react";
import {
  Mountain,
  Camera,
  Utensils,
  MapPin,
  Users,
  Clock,
  Shield,
  Heart,
  Compass,
  Binoculars,
  Backpack,
  Sun,
  TreePine,
  Waves,
  Building,
  Music,
  Coffee,
  Car,
  Wifi,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import { TourDTO } from "@/types/tour.types";

interface TourFeature {
  id: number;
  tourId: number;
  featureName: string;
  createdAt: string;
  updatedAt: string;
}

interface TourFeaturesProps {
  tour: TourDTO;
  features?: Array<TourFeature | string>;
}

type FeatureCategory = "adventure" | "cultural" | "comfort" | "safety";

interface FeatureConfig {
  name: string;
  icon: JSX.Element;
  category: FeatureCategory;
  description?: string;
}

const FEATURE_CONFIG: Record<string, FeatureConfig> = {
  // Adventure Features
  HIKING: {
    name: "Yürüyüş",
    icon: <Mountain className="w-5 h-5" />,
    category: "adventure",
    description: "Doğa yürüyüşü ve trekking",
  },
  PHOTOGRAPHY: {
    name: "Fotoğrafçılık",
    icon: <Camera className="w-5 h-5" />,
    category: "adventure",
    description: "Profesyonel fotoğraf çekimi",
  },
  WILDLIFE_WATCHING: {
    name: "Vahşi Yaşam Gözlemi",
    icon: <Binoculars className="w-5 h-5" />,
    category: "adventure",
    description: "Doğal yaşam gözlemi",
  },
  CLIMBING: {
    name: "Tırmanış",
    icon: <Mountain className="w-5 h-5" />,
    category: "adventure",
    description: "Kaya tırmanışı ve dağcılık",
  },
  WATER_SPORTS: {
    name: "Su Sporları",
    icon: <Waves className="w-5 h-5" />,
    category: "adventure",
    description: "Çeşitli su sporları aktiviteleri",
  },
  CAMPING: {
    name: "Kamp",
    icon: <TreePine className="w-5 h-5" />,
    category: "adventure",
    description: "Doğada kamp deneyimi",
  },

  // Cultural Features
  HISTORICAL_SITES: {
    name: "Tarihi Yerler",
    icon: <Building className="w-5 h-5" />,
    category: "cultural",
    description: "Tarihi mekanlar ve anıtlar",
  },
  LOCAL_CUISINE: {
    name: "Yerel Mutfak",
    icon: <Utensils className="w-5 h-5" />,
    category: "cultural",
    description: "Geleneksel yemek deneyimi",
  },
  CULTURAL_SHOWS: {
    name: "Kültürel Gösteriler",
    icon: <Music className="w-5 h-5" />,
    category: "cultural",
    description: "Geleneksel dans ve müzik",
  },
  LOCAL_GUIDE: {
    name: "Yerel Rehber",
    icon: <Users className="w-5 h-5" />,
    category: "cultural",
    description: "Deneyimli yerel rehber eşliği",
  },
  MUSEUM_VISITS: {
    name: "Müze Ziyaretleri",
    icon: <Building className="w-5 h-5" />,
    category: "cultural",
    description: "Müze ve sanat galerisi turları",
  },

  // Comfort Features
  TRANSPORTATION: {
    name: "Ulaşım",
    icon: <Car className="w-5 h-5" />,
    category: "comfort",
    description: "Konforlu araç ile ulaşım",
  },
  MEALS_INCLUDED: {
    name: "Yemek Dahil",
    icon: <Utensils className="w-5 h-5" />,
    category: "comfort",
    description: "Öğün ve ikramlar dahil",
  },
  WIFI: {
    name: "WiFi",
    icon: <Wifi className="w-5 h-5" />,
    category: "comfort",
    description: "Ücretsiz internet erişimi",
  },
  REFRESHMENTS: {
    name: "İkramlar",
    icon: <Coffee className="w-5 h-5" />,
    category: "comfort",
    description: "Çay, kahve ve atıştırmalıklar",
  },
  EQUIPMENT_PROVIDED: {
    name: "Ekipman Sağlanır",
    icon: <Backpack className="w-5 h-5" />,
    category: "comfort",
    description: "Gerekli ekipmanlar dahil",
  },
  WEATHER_PROTECTION: {
    name: "Hava Koruması",
    icon: <Sun className="w-5 h-5" />,
    category: "comfort",
    description: "Hava şartlarına karşı koruma",
  },

  // Safety Features
  INSURANCE: {
    name: "Sigorta",
    icon: <Shield className="w-5 h-5" />,
    category: "safety",
    description: "Kapsamlı seyahat sigortası",
  },
  FIRST_AID: {
    name: "İlk Yardım",
    icon: <Heart className="w-5 h-5" />,
    category: "safety",
    description: "İlk yardım kiti ve eğitimli personel",
  },
  SAFETY_EQUIPMENT: {
    name: "Güvenlik Ekipmanı",
    icon: <Shield className="w-5 h-5" />,
    category: "safety",
    description: "Güvenlik ekipmanları sağlanır",
  },
  EMERGENCY_CONTACT: {
    name: "Acil Durum İletişimi",
    icon: <Compass className="w-5 h-5" />,
    category: "safety",
    description: "7/24 acil durum desteği",
  },
  CERTIFIED_GUIDE: {
    name: "Sertifikalı Rehber",
    icon: <Users className="w-5 h-5" />,
    category: "safety",
    description: "Sertifikalı ve deneyimli rehber",
  },
};

const CATEGORY_COLORS: Record<FeatureCategory, string> = {
  adventure: "text-[#e74c3c]",
  cultural: "text-[#9b59b6]",
  comfort: "text-[#f39c12]",
  safety: "text-[#27ae60]",
};

const CATEGORY_BACKGROUNDS: Record<FeatureCategory, string> = {
  adventure: "bg-[#e74c3c]/10",
  cultural: "bg-[#9b59b6]/10",
  comfort: "bg-[#f39c12]/10",
  safety: "bg-[#27ae60]/10",
};

const CATEGORY_NAMES: Record<FeatureCategory, string> = {
  adventure: "Macera",
  cultural: "Kültürel",
  comfort: "Konfor",
  safety: "Güvenlik",
};

const TourFeatures: React.FC<TourFeaturesProps> = ({ tour, features }) => {
  const { prefersReducedMotion } = useMicroInteractions();

  // Sadece backend'den gelen veriyi kullan; string[] veya TourFeature[] destekle
  const tourFeatures: TourFeature[] = (features || []).map((f, idx) =>
    typeof f === "string"
      ? {
          id: idx,
          tourId: tour.id,
          featureName: f,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : f
  );

  // Group features by category
  const groupedFeatures = tourFeatures.reduce((acc, feature) => {
    const config = FEATURE_CONFIG[feature.featureName];
    const category = config?.category || "comfort";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, TourFeature[]>);

  // Get all features with fallback for unknown features
  const getAllFeatures = () => {
    return tourFeatures.map((feature) => ({
      ...feature,
      config: FEATURE_CONFIG[feature.featureName] || {
        name: feature.featureName
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        icon: <Check className="w-5 h-5" />,
        category: "comfort" as FeatureCategory,
      },
    }));
  };

  const allFeatures = getAllFeatures();

  if (tourFeatures.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 font-montserrat">
        Bu tur size neler sunuyor
      </h2>

      {/* Show features grouped by category if we have multiple categories */}
      {Object.keys(groupedFeatures).length > 1 ? (
        <div className="space-y-8">
          {(Object.keys(groupedFeatures) as FeatureCategory[]).map(
            (category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2 font-montserrat">
                  <div
                    className={`w-3 h-3 rounded-full ${CATEGORY_BACKGROUNDS[category]} border-2 border-current ${CATEGORY_COLORS[category]}`}
                  />
                  {CATEGORY_NAMES[category]}
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {groupedFeatures[category].map((feature, index) => {
                    const config = FEATURE_CONFIG[feature.featureName] || {
                      name: feature.featureName
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                      icon: <Check className="w-5 h-5" />,
                      category: category,
                    };

                    return (
                      <VisualFeedback
                        key={feature.id}
                        variant="lift"
                        intensity="sm"
                        className="opacity-0 animate-fade-in"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <Card className="group p-4 flex items-center space-x-3 bg-white/40 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer">
                          <div
                            className={`flex-shrink-0 p-2 rounded-lg ${CATEGORY_BACKGROUNDS[category]} ${CATEGORY_COLORS[category]} group-hover:scale-110 transition-transform duration-300`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 text-sm leading-tight font-roboto">
                              {config.name}
                            </span>
                            {config.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate font-roboto">
                                {config.description}
                              </p>
                            )}
                          </div>
                        </Card>
                      </VisualFeedback>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        /* Show all features in a single grid if only one category or mixed */
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {allFeatures.map((feature, index) => (
            <VisualFeedback
              key={feature.id}
              variant="lift"
              intensity="sm"
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="group p-4 flex items-center space-x-3 bg-white/40 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer">
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${
                    CATEGORY_BACKGROUNDS[feature.config.category]
                  } ${
                    CATEGORY_COLORS[feature.config.category]
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 text-sm leading-tight font-roboto">
                    {feature.config.name}
                  </span>
                  {feature.config.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate font-roboto">
                      {feature.config.description}
                    </p>
                  )}
                </div>
              </Card>
            </VisualFeedback>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourFeatures;
