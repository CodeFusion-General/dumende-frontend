import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import {
  Check,
  Package,
  Utensils,
  Coffee,
  Waves,
  Shield,
  Camera,
  Music,
  Anchor,
  Sun
} from "lucide-react";

interface TourIncludedProps {
  included?: string;
  className?: string;
}

// Icon mapping for common included items
const getIconForItem = (item: string): JSX.Element => {
  const lowerItem = item.toLowerCase();

  if (lowerItem.includes("yemek") || lowerItem.includes("öğle") || lowerItem.includes("akşam")) {
    return <Utensils className="w-4 h-4" />;
  }
  if (lowerItem.includes("içecek") || lowerItem.includes("kahve") || lowerItem.includes("çay")) {
    return <Coffee className="w-4 h-4" />;
  }
  if (lowerItem.includes("şnorkel") || lowerItem.includes("yüzme") || lowerItem.includes("deniz")) {
    return <Waves className="w-4 h-4" />;
  }
  if (lowerItem.includes("sigorta") || lowerItem.includes("güvenlik") || lowerItem.includes("can yeleği")) {
    return <Shield className="w-4 h-4" />;
  }
  if (lowerItem.includes("fotoğraf") || lowerItem.includes("kamera")) {
    return <Camera className="w-4 h-4" />;
  }
  if (lowerItem.includes("müzik")) {
    return <Music className="w-4 h-4" />;
  }
  if (lowerItem.includes("kaptan") || lowerItem.includes("tekne") || lowerItem.includes("bot")) {
    return <Anchor className="w-4 h-4" />;
  }
  if (lowerItem.includes("havlu") || lowerItem.includes("güneş")) {
    return <Sun className="w-4 h-4" />;
  }

  return <Check className="w-4 h-4" />;
};

// Parse included services text into items
const parseIncludedItems = (included: string): string[] => {
  // Split by common delimiters: newlines, bullets, checkmarks, semicolons
  const items = included
    .split(/[\n\r]+|[•✓✔◦-]|\s*;\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && item !== "✓" && item !== "•");

  return items;
};

const TourIncluded: React.FC<TourIncludedProps> = ({
  included,
  className = "",
}) => {
  // Don't render if no included services
  if (!included || included.trim().length === 0) {
    return null;
  }

  const items = parseIncludedItems(included);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-[#27ae60] to-[#1e8449] rounded-xl shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] font-montserrat">
              Neler Dahil?
            </h2>
            <p className="text-sm text-gray-600 font-roboto">
              Tur fiyatına dahil olan hizmetler
            </p>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item, index) => (
            <VisualFeedback
              key={index}
              variant="lift"
              intensity="sm"
            >
              <div className="group flex items-center gap-3 p-3 bg-gradient-to-r from-[#27ae60]/5 to-[#27ae60]/10 hover:from-[#27ae60]/10 hover:to-[#27ae60]/15 rounded-xl border border-[#27ae60]/20 hover:border-[#27ae60]/40 transition-all duration-300">
                {/* Check Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-[#27ae60]/20 rounded-full flex items-center justify-center text-[#27ae60] group-hover:bg-[#27ae60]/30 transition-colors duration-300">
                  {getIconForItem(item)}
                </div>

                {/* Text */}
                <span className="text-gray-700 font-roboto font-medium text-sm leading-snug flex-1">
                  {item}
                </span>

                {/* Checkmark */}
                <Check className="w-4 h-4 text-[#27ae60] flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </VisualFeedback>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-4 pt-4 border-t border-[#27ae60]/10">
          <p className="text-xs text-gray-500 font-roboto flex items-center gap-2">
            <Check className="w-3 h-3 text-[#27ae60]" />
            Tüm belirtilen hizmetler tur fiyatına dahildir
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default TourIncluded;
