import React, { useEffect, useRef } from "react";
import {
  Tv,
  Wifi,
  Anchor,
  Users,
  Speaker,
  AirVent,
  Check,
  Compass,
  MapPin,
  Radio,
  Sofa,
  Coffee,
  Utensils,
  Music,
  Camera,
  Gamepad2,
  LifeBuoy,
  Shield,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useMicroInteractions,
  useScrollAnimation,
} from "@/hooks/useMicroInteractions";
import { VisualFeedback } from "@/components/ui/VisualFeedback";

interface Feature {
  id: number;
  boatId: number;
  featureName: string;
  createdAt: string;
  updatedAt: string;
}

interface BoatFeaturesProps {
  features: Feature[];
}

type FeatureCategory = "navigation" | "comfort" | "entertainment" | "safety";

interface FeatureConfig {
  name: string;
  icon: JSX.Element;
  category: FeatureCategory;
  description?: string;
}

const FEATURE_CONFIG: Record<string, FeatureConfig> = {
  // Navigation Features
  NAVIGATION_SYSTEM: {
    name: "Navigation System",
    icon: <Compass className="w-5 h-5" />,
    category: "navigation",
    description: "Advanced GPS navigation system",
  },
  GPS: {
    name: "GPS",
    icon: <MapPin className="w-5 h-5" />,
    category: "navigation",
  },
  RADIO: {
    name: "Marine Radio",
    icon: <Radio className="w-5 h-5" />,
    category: "navigation",
  },
  ANCHOR: {
    name: "Anchor System",
    icon: <Anchor className="w-5 h-5" />,
    category: "navigation",
  },

  // Comfort Features
  WIFI: {
    name: "Free WiFi",
    icon: <Wifi className="w-5 h-5" />,
    category: "comfort",
  },
  CREW_INCLUDED: {
    name: "Crew Included",
    icon: <Users className="w-5 h-5" />,
    category: "comfort",
  },
  COOLER: {
    name: "Cooler",
    icon: <AirVent className="w-5 h-5" />,
    category: "comfort",
  },
  SEATING: {
    name: "Comfortable Seating",
    icon: <Sofa className="w-5 h-5" />,
    category: "comfort",
  },
  COFFEE_MAKER: {
    name: "Coffee Maker",
    icon: <Coffee className="w-5 h-5" />,
    category: "comfort",
  },
  KITCHEN: {
    name: "Kitchen",
    icon: <Utensils className="w-5 h-5" />,
    category: "comfort",
  },

  // Entertainment Features
  SMART_TV: {
    name: "Smart TV",
    icon: <Tv className="w-5 h-5" />,
    category: "entertainment",
  },
  SOUND_SYSTEM: {
    name: "Sound System",
    icon: <Speaker className="w-5 h-5" />,
    category: "entertainment",
  },
  MUSIC: {
    name: "Music System",
    icon: <Music className="w-5 h-5" />,
    category: "entertainment",
  },
  CAMERA: {
    name: "Action Camera",
    icon: <Camera className="w-5 h-5" />,
    category: "entertainment",
  },
  GAMES: {
    name: "Games",
    icon: <Gamepad2 className="w-5 h-5" />,
    category: "entertainment",
  },

  // Safety Features
  LIFE_JACKETS: {
    name: "Life Jackets",
    icon: <LifeBuoy className="w-5 h-5" />,
    category: "safety",
  },
  SAFETY_KIT: {
    name: "Safety Kit",
    icon: <Shield className="w-5 h-5" />,
    category: "safety",
  },
  EMERGENCY: {
    name: "Emergency Equipment",
    icon: <AlertTriangle className="w-5 h-5" />,
    category: "safety",
  },
  FIRST_AID: {
    name: "First Aid Kit",
    icon: <Heart className="w-5 h-5" />,
    category: "safety",
  },
};

const CATEGORY_COLORS: Record<FeatureCategory, string> = {
  navigation: "text-[#1A5F7A]",
  comfort: "text-[#F8CB2E]",
  entertainment: "text-[#002B5B]",
  safety: "text-red-600",
};

const CATEGORY_BACKGROUNDS: Record<FeatureCategory, string> = {
  navigation: "bg-[#1A5F7A]/10",
  comfort: "bg-[#F8CB2E]/10",
  entertainment: "bg-[#002B5B]/10",
  safety: "bg-red-50",
};

const CATEGORY_NAMES: Record<FeatureCategory, string> = {
  navigation: "Navigation",
  comfort: "Comfort",
  entertainment: "Entertainment",
  safety: "Safety",
};

const BoatFeatures: React.FC<BoatFeaturesProps> = ({ features }) => {
  const { staggerAnimation, fadeIn, prefersReducedMotion } =
    useMicroInteractions();
  const { elementRef: featuresRef, isVisible } = useScrollAnimation(0.3);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const config = FEATURE_CONFIG[feature.featureName];
    const category = config?.category || "comfort";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, Feature[]>);

  // Get all features with fallback for unknown features
  const getAllFeatures = () => {
    return features.map((feature) => ({
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

  // Animate features when they come into view
  useEffect(() => {
    if (isVisible && !prefersReducedMotion) {
      const validRefs = featureRefs.current.filter(
        (ref) => ref !== null
      ) as HTMLElement[];
      if (validRefs.length > 0) {
        staggerAnimation(validRefs, "fadeIn", 100);
      }
    }
  }, [isVisible, staggerAnimation, prefersReducedMotion]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        What this boat offers
      </h2>

      {/* Show features grouped by category if we have multiple categories */}
      {Object.keys(groupedFeatures).length > 1 ? (
        <div className="space-y-8">
          {(Object.keys(groupedFeatures) as FeatureCategory[]).map(
            (category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${CATEGORY_BACKGROUNDS[category]} border-2 border-current ${CATEGORY_COLORS[category]}`}
                  />
                  {CATEGORY_NAMES[category]}
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {groupedFeatures[category].map((feature) => {
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
                          animationDelay: `${
                            groupedFeatures[category].indexOf(feature) * 50
                          }ms`,
                        }}
                      >
                        <Card className="group p-4 flex items-center space-x-3 bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer">
                          <div
                            className={`flex-shrink-0 p-2 rounded-lg ${CATEGORY_BACKGROUNDS[category]} ${CATEGORY_COLORS[category]} group-hover:scale-110 transition-transform duration-300`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 text-sm leading-tight">
                              {config.name}
                            </span>
                            {config.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
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
              <Card className="group p-4 flex items-center space-x-3 bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer">
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
                  <span className="font-medium text-gray-900 text-sm leading-tight">
                    {feature.config.name}
                  </span>
                  {feature.config.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
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

export default BoatFeatures;
