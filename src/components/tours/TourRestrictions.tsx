import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import {
  ShieldAlert,
  Ban,
  Users,
  Cigarette,
  Wine,
  Dog,
  Volume2,
  Trash2,
  Baby,
  Heart,
  PersonStanding,
  AlertTriangle
} from "lucide-react";

interface TourRestrictionsProps {
  notAllowed?: string;
  notSuitableFor?: string;
  className?: string;
}

// Icon mapping for prohibited items
const getProhibitedIcon = (item: string): JSX.Element => {
  const lowerItem = item.toLowerCase();

  if (lowerItem.includes("sigara") || lowerItem.includes("tütün")) {
    return <Cigarette className="w-4 h-4" />;
  }
  if (lowerItem.includes("alkol") || lowerItem.includes("içki") || lowerItem.includes("şişe")) {
    return <Wine className="w-4 h-4" />;
  }
  if (lowerItem.includes("hayvan") || lowerItem.includes("evcil") || lowerItem.includes("köpek") || lowerItem.includes("kedi")) {
    return <Dog className="w-4 h-4" />;
  }
  if (lowerItem.includes("müzik") || lowerItem.includes("ses") || lowerItem.includes("gürültü")) {
    return <Volume2 className="w-4 h-4" />;
  }
  if (lowerItem.includes("çöp") || lowerItem.includes("atık") || lowerItem.includes("deniz")) {
    return <Trash2 className="w-4 h-4" />;
  }

  return <Ban className="w-4 h-4" />;
};

// Icon mapping for not suitable items
const getSuitabilityIcon = (item: string): JSX.Element => {
  const lowerItem = item.toLowerCase();

  if (lowerItem.includes("çocuk") || lowerItem.includes("bebek") || lowerItem.includes("yaş")) {
    return <Baby className="w-4 h-4" />;
  }
  if (lowerItem.includes("hamile") || lowerItem.includes("gebe")) {
    return <Heart className="w-4 h-4" />;
  }
  if (lowerItem.includes("kalp") || lowerItem.includes("sağlık") || lowerItem.includes("rahatsızlık")) {
    return <Heart className="w-4 h-4" />;
  }
  if (lowerItem.includes("hareket") || lowerItem.includes("engelli") || lowerItem.includes("fiziksel")) {
    return <PersonStanding className="w-4 h-4" />;
  }

  return <AlertTriangle className="w-4 h-4" />;
};

// Parse text into items
const parseItems = (text: string): string[] => {
  const items = text
    .split(/[\n\r]+|[•✓✔✗✘◦-]|\s*;\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && !["•", "-", "✗", "✘"].includes(item));

  return items;
};

const TourRestrictions: React.FC<TourRestrictionsProps> = ({
  notAllowed,
  notSuitableFor,
  className = "",
}) => {
  // Don't render if both are empty
  const hasNotAllowed = notAllowed && notAllowed.trim().length > 0;
  const hasNotSuitable = notSuitableFor && notSuitableFor.trim().length > 0;

  if (!hasNotAllowed && !hasNotSuitable) {
    return null;
  }

  const prohibitedItems = hasNotAllowed ? parseItems(notAllowed) : [];
  const unsuitableItems = hasNotSuitable ? parseItems(notSuitableFor) : [];

  if (prohibitedItems.length === 0 && unsuitableItems.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] font-montserrat">
              Kurallar ve Kısıtlamalar
            </h2>
            <p className="text-sm text-gray-600 font-roboto">
              Lütfen bu bilgileri dikkate alın
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Not Allowed Section */}
          {prohibitedItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Ban className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 font-montserrat">
                  İzin Verilmeyen
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prohibitedItems.map((item, index) => (
                  <VisualFeedback
                    key={`prohibited-${index}`}
                    variant="lift"
                    intensity="sm"
                  >
                    <div className="group flex items-center gap-3 p-3 bg-red-50/80 hover:bg-red-100/80 rounded-xl border border-red-200/50 hover:border-red-300 transition-all duration-300">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-200 transition-colors duration-300">
                        {getProhibitedIcon(item)}
                      </div>

                      {/* Text */}
                      <span className="text-red-700 font-roboto text-sm font-medium flex-1">
                        {item}
                      </span>

                      {/* X icon */}
                      <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
                    </div>
                  </VisualFeedback>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {prohibitedItems.length > 0 && unsuitableItems.length > 0 && (
            <div className="border-t border-gray-200" />
          )}

          {/* Not Suitable For Section */}
          {unsuitableItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-orange-700 font-montserrat">
                  Kimler İçin Uygun Değil
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unsuitableItems.map((item, index) => (
                  <VisualFeedback
                    key={`unsuitable-${index}`}
                    variant="lift"
                    intensity="sm"
                  >
                    <div className="group flex items-center gap-3 p-3 bg-orange-50/80 hover:bg-orange-100/80 rounded-xl border border-orange-200/50 hover:border-orange-300 transition-all duration-300">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 group-hover:bg-orange-200 transition-colors duration-300">
                        {getSuitabilityIcon(item)}
                      </div>

                      {/* Text */}
                      <span className="text-orange-700 font-roboto text-sm font-medium flex-1">
                        {item}
                      </span>

                      {/* Warning icon */}
                      <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    </div>
                  </VisualFeedback>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Safety Note */}
        <div className="mt-6 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 font-roboto">
              <span className="font-semibold">Güvenlik Notu:</span> Bu kurallar, tüm katılımcıların güvenliği ve keyifli bir deneyim için belirlenmiştir.
              Lütfen kurallara uyunuz.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TourRestrictions;
