import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { VisualFeedback } from "@/components/ui/VisualFeedback";
import {
  Route,
  MapPin,
  Anchor,
  Waves,
  Utensils,
  Camera,
  Sunset,
  Navigation,
  Flag,
  Coffee,
  TreePine
} from "lucide-react";

interface TourRouteProps {
  route?: string;
  locationDescription?: string;
  className?: string;
}

// Icon mapping for route stops
const getStopIcon = (item: string): JSX.Element => {
  const lowerItem = item.toLowerCase();

  if (lowerItem.includes("kalkış") || lowerItem.includes("başla") || lowerItem.includes("liman")) {
    return <Anchor className="w-4 h-4" />;
  }
  if (lowerItem.includes("yüzme") || lowerItem.includes("deniz") || lowerItem.includes("koy")) {
    return <Waves className="w-4 h-4" />;
  }
  if (lowerItem.includes("yemek") || lowerItem.includes("öğle") || lowerItem.includes("akşam")) {
    return <Utensils className="w-4 h-4" />;
  }
  if (lowerItem.includes("fotoğraf") || lowerItem.includes("manzara")) {
    return <Camera className="w-4 h-4" />;
  }
  if (lowerItem.includes("günbatımı") || lowerItem.includes("gün batımı") || lowerItem.includes("sunset")) {
    return <Sunset className="w-4 h-4" />;
  }
  if (lowerItem.includes("mola") || lowerItem.includes("ara") || lowerItem.includes("dinlen")) {
    return <Coffee className="w-4 h-4" />;
  }
  if (lowerItem.includes("doğa") || lowerItem.includes("orman") || lowerItem.includes("vadi")) {
    return <TreePine className="w-4 h-4" />;
  }
  if (lowerItem.includes("dönüş") || lowerItem.includes("son") || lowerItem.includes("bitiş")) {
    return <Flag className="w-4 h-4" />;
  }

  return <Navigation className="w-4 h-4" />;
};

// Parse route text into stops
const parseRouteStops = (route: string): string[] => {
  const stops = route
    .split(/[\n\r]+|[•✓✔◦]|\s*;\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && !["•", "-", "–", "—"].includes(item));

  return stops;
};

// Try to extract time from stop text (e.g., "09:00 - Limandan kalkış")
const parseStopWithTime = (stop: string): { time?: string; description: string } => {
  // Match patterns like "09:00 - text", "9:00 text", "09:00: text", "9.00 - text"
  const timePattern = /^(\d{1,2}[:.]\d{2})\s*[-:–—]?\s*(.+)$/;
  const match = stop.match(timePattern);

  if (match) {
    return {
      time: match[1].replace(".", ":"),
      description: match[2].trim(),
    };
  }

  return { description: stop };
};

const TourRoute: React.FC<TourRouteProps> = ({
  route,
  locationDescription,
  className = "",
}) => {
  // Don't render if no route
  if (!route || route.trim().length === 0) {
    return null;
  }

  const stops = parseRouteStops(route);

  if (stops.length === 0) {
    return null;
  }

  const parsedStops = stops.map(parseStopWithTime);

  return (
    <div className={className}>
      <GlassCard className="bg-white/40 backdrop-blur-sm border border-white/20 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-[#3498db] to-[#2c3e50] rounded-xl shadow-lg">
            <Route className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] font-montserrat">
              Tur Güzergahı
            </h2>
            <p className="text-sm text-gray-600 font-roboto">
              Gün boyunca sizi bekleyen duraklar
            </p>
          </div>
        </div>

        {/* Meeting Point if available */}
        {locationDescription && (
          <div className="mb-6 p-4 bg-[#3498db]/10 rounded-xl border border-[#3498db]/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-[#3498db]/20 rounded-full flex items-center justify-center text-[#3498db]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#3498db] font-montserrat block mb-1">
                  Buluşma Noktası
                </span>
                <p className="text-gray-700 font-roboto text-sm">
                  {locationDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3498db] via-[#3498db]/50 to-[#2c3e50]/30" />

          {/* Stops */}
          <div className="space-y-4">
            {parsedStops.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === parsedStops.length - 1;

              return (
                <VisualFeedback
                  key={index}
                  variant="lift"
                  intensity="sm"
                >
                  <div className="relative flex items-start gap-4 pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        isFirst
                          ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                          : isLast
                          ? "bg-gradient-to-br from-[#2c3e50] to-[#3498db] text-white"
                          : "bg-white border-2 border-[#3498db] text-[#3498db] hover:bg-[#3498db]/10"
                      }`}
                    >
                      {getStopIcon(stop.description)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white/60 hover:bg-white/80 rounded-xl border border-white/40 hover:border-[#3498db]/30 p-4 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-gray-800 font-roboto font-medium leading-snug flex-1">
                          {stop.description}
                        </p>
                        {stop.time && (
                          <span className="flex-shrink-0 px-3 py-1 bg-[#3498db]/10 text-[#3498db] text-sm font-semibold rounded-full font-montserrat">
                            {stop.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </VisualFeedback>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200/50">
          <p className="text-xs text-gray-500 font-roboto flex items-center gap-2">
            <Route className="w-3 h-3 text-[#3498db]" />
            Güzergah ve duraklar hava koşullarına göre değişiklik gösterebilir
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default TourRoute;
