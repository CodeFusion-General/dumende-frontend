import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import { Sparkles, Star, Trophy, Gem, Zap, Heart } from "lucide-react";

interface TourHighlightsProps {
  highlights?: string[];
  className?: string;
}

const HIGHLIGHT_ICONS = [
  <Trophy className="w-5 h-5" />,
  <Star className="w-5 h-5" />,
  <Gem className="w-5 h-5" />,
  <Zap className="w-5 h-5" />,
  <Heart className="w-5 h-5" />,
];

const TourHighlights: React.FC<TourHighlightsProps> = ({
  highlights,
  className = "",
}) => {
  // Filter out empty strings and check if any valid highlights exist
  const validHighlights = highlights?.filter(h => h && h.trim().length > 0) || [];

  // Don't render if no valid highlights
  if (validHighlights.length === 0) {
    return null;
  }

  return (
    <div className={`mb-8 ${className}`}>
      <GlassCard className="bg-gradient-to-r from-[#3498db]/10 via-white/60 to-[#2c3e50]/10 backdrop-blur-sm border border-white/30 p-6 md:p-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-[#3498db] to-[#2c3e50] rounded-xl shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] font-montserrat">
              Bu Turu Özel Kılan
            </h2>
            <p className="text-sm text-gray-600 font-roboto">
              Eşsiz deneyimler sizi bekliyor
            </p>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {validHighlights.map((highlight, index) => (
            <VisualFeedback
              key={index}
              variant="lift"
              intensity="sm"
            >
              <div className="group flex items-start gap-3 p-4 bg-white/50 hover:bg-white/80 rounded-xl border border-white/40 hover:border-[#3498db]/30 transition-all duration-300 hover:shadow-lg">
                {/* Icon */}
                <div className="flex-shrink-0 p-2 bg-gradient-to-br from-[#3498db]/20 to-[#2c3e50]/10 rounded-lg text-[#3498db] group-hover:from-[#3498db]/30 group-hover:to-[#2c3e50]/20 transition-all duration-300 group-hover:scale-110">
                  {HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium font-roboto leading-snug">
                    {highlight}
                  </p>
                </div>
              </div>
            </VisualFeedback>
          ))}
        </div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#3498db]/10 to-transparent rounded-bl-full pointer-events-none" />
      </GlassCard>
    </div>
  );
};

export default TourHighlights;
