import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import {
  AlertCircle,
  Info,
  Sun,
  Shirt,
  Droplets,
  Camera,
  Pill,
  Backpack,
  Watch,
  FileCheck
} from "lucide-react";

interface TourRequirementsProps {
  requirements?: string;
  className?: string;
}

// Icon mapping for common requirement items
const getIconForItem = (item: string): JSX.Element => {
  const lowerItem = item.toLowerCase();

  if (lowerItem.includes("güneş") || lowerItem.includes("krem") || lowerItem.includes("şapka")) {
    return <Sun className="w-4 h-4" />;
  }
  if (lowerItem.includes("kıyafet") || lowerItem.includes("mayo") || lowerItem.includes("giyin")) {
    return <Shirt className="w-4 h-4" />;
  }
  if (lowerItem.includes("su") || lowerItem.includes("yüzme") || lowerItem.includes("deniz")) {
    return <Droplets className="w-4 h-4" />;
  }
  if (lowerItem.includes("fotoğraf") || lowerItem.includes("kamera") || lowerItem.includes("gopro")) {
    return <Camera className="w-4 h-4" />;
  }
  if (lowerItem.includes("ilaç") || lowerItem.includes("tutma") || lowerItem.includes("sağlık")) {
    return <Pill className="w-4 h-4" />;
  }
  if (lowerItem.includes("çanta") || lowerItem.includes("getir") || lowerItem.includes("eşya")) {
    return <Backpack className="w-4 h-4" />;
  }
  if (lowerItem.includes("saat") || lowerItem.includes("zaman") || lowerItem.includes("dakika")) {
    return <Watch className="w-4 h-4" />;
  }
  if (lowerItem.includes("belge") || lowerItem.includes("kimlik") || lowerItem.includes("pasaport")) {
    return <FileCheck className="w-4 h-4" />;
  }

  return <Info className="w-4 h-4" />;
};

// Parse requirements text into items
const parseRequirementItems = (requirements: string): string[] => {
  const items = requirements
    .split(/[\n\r]+|[•✓✔◦-]|\s*;\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && item !== "•" && item !== "-");

  return items;
};

const TourRequirements: React.FC<TourRequirementsProps> = ({
  requirements,
  className = "",
}) => {
  // Don't render if no requirements
  if (!requirements || requirements.trim().length === 0) {
    return null;
  }

  const items = parseRequirementItems(requirements);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <GlassCard className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 backdrop-blur-sm border border-amber-200/40 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] font-montserrat">
              Bilmeniz Gerekenler
            </h2>
            <p className="text-sm text-amber-700 font-roboto">
              Tura katılmadan önce hazırlıklı olun
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <VisualFeedback
              key={index}
              variant="lift"
              intensity="sm"
            >
              <div className="group flex items-start gap-3 p-3 bg-white/60 hover:bg-white/80 rounded-xl border border-amber-200/50 hover:border-amber-300 transition-all duration-300 hover:shadow-md">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors duration-300 mt-0.5">
                  {getIconForItem(item)}
                </div>

                {/* Text */}
                <p className="text-gray-700 font-roboto text-sm leading-relaxed flex-1">
                  {item}
                </p>
              </div>
            </VisualFeedback>
          ))}
        </div>

        {/* Tip Box */}
        <div className="mt-5 p-4 bg-amber-100/60 rounded-xl border border-amber-200/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-roboto">
              <span className="font-semibold">İpucu:</span> Tura katılmadan önce bu listeyi kontrol etmenizi öneririz.
              Hazırlıklı olmak daha keyifli bir deneyim yaşamanızı sağlar.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TourRequirements;
