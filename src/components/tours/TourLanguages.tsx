import React from "react";
import { Languages } from "lucide-react";

interface TourLanguagesProps {
  languages?: string[];
  className?: string;
  variant?: "inline" | "card";
}

// Language code to display name mapping
const LANGUAGE_NAMES: Record<string, { name: string; flag: string }> = {
  // ISO codes
  tr: { name: "Türkçe", flag: "🇹🇷" },
  en: { name: "İngilizce", flag: "🇬🇧" },
  de: { name: "Almanca", flag: "🇩🇪" },
  fr: { name: "Fransızca", flag: "🇫🇷" },
  es: { name: "İspanyolca", flag: "🇪🇸" },
  it: { name: "İtalyanca", flag: "🇮🇹" },
  ru: { name: "Rusça", flag: "🇷🇺" },
  ar: { name: "Arapça", flag: "🇸🇦" },
  zh: { name: "Çince", flag: "🇨🇳" },
  ja: { name: "Japonca", flag: "🇯🇵" },
  // Full names (in case they're stored as names)
  turkish: { name: "Türkçe", flag: "🇹🇷" },
  english: { name: "İngilizce", flag: "🇬🇧" },
  german: { name: "Almanca", flag: "🇩🇪" },
  french: { name: "Fransızca", flag: "🇫🇷" },
  spanish: { name: "İspanyolca", flag: "🇪🇸" },
  italian: { name: "İtalyanca", flag: "🇮🇹" },
  russian: { name: "Rusça", flag: "🇷🇺" },
  arabic: { name: "Arapça", flag: "🇸🇦" },
  chinese: { name: "Çince", flag: "🇨🇳" },
  japanese: { name: "Japonca", flag: "🇯🇵" },
  // Turkish names
  türkçe: { name: "Türkçe", flag: "🇹🇷" },
  ingilizce: { name: "İngilizce", flag: "🇬🇧" },
  almanca: { name: "Almanca", flag: "🇩🇪" },
  fransızca: { name: "Fransızca", flag: "🇫🇷" },
  ispanyolca: { name: "İspanyolca", flag: "🇪🇸" },
  italyanca: { name: "İtalyanca", flag: "🇮🇹" },
  rusça: { name: "Rusça", flag: "🇷🇺" },
  arapça: { name: "Arapça", flag: "🇸🇦" },
  çince: { name: "Çince", flag: "🇨🇳" },
  japonca: { name: "Japonca", flag: "🇯🇵" },
};

const getLanguageInfo = (
  lang: string
): { name: string; flag: string } => {
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_NAMES[normalized] || { name: lang, flag: "🌐" };
};

const TourLanguages: React.FC<TourLanguagesProps> = ({
  languages,
  className = "",
  variant = "inline",
}) => {
  // Don't render if no languages
  if (!languages || languages.length === 0) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <Languages className="w-4 h-4 text-[#3498db]" />
        {languages.map((lang, index) => {
          const info = getLanguageInfo(lang);
          return (
            <span
              key={index}
              className="inline-flex items-center bg-white/80 text-[#2c3e50] border border-[#3498db]/30 hover:bg-[#3498db]/10 transition-all duration-300 px-3 py-1.5 rounded-full text-sm font-medium font-roboto shadow-sm"
            >
              <span className="mr-1.5">{info.flag}</span>
              {info.name}
            </span>
          );
        })}
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={`bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-[#3498db]/20 rounded-lg">
          <Languages className="w-4 h-4 text-[#3498db]" />
        </div>
        <span className="text-sm font-semibold text-[#2c3e50] font-montserrat">
          Tur Dilleri
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((lang, index) => {
          const info = getLanguageInfo(lang);
          return (
            <span
              key={index}
              className="inline-flex items-center bg-white/80 text-[#2c3e50] border border-[#3498db]/30 hover:bg-[#3498db]/10 transition-all duration-300 px-3 py-1.5 rounded-full text-sm font-medium font-roboto shadow-sm"
            >
              <span className="mr-1.5 text-base">{info.flag}</span>
              {info.name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TourLanguages;
