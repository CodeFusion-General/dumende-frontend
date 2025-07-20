import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({
  text,
  maxLength = 250,
  className,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const needsExpansion = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength);

  return (
    <div className={className}>
      <p className="text-gray-600 leading-relaxed">
        {displayText}
        {!isExpanded && needsExpansion && "..."}
      </p>

      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary hover:text-primary/90 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm transition-all duration-200"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Metni kısalt" : "Metnin tamamını göster"}
        >
          {isExpanded ? "Daha az göster" : "Devamını göster"}
        </button>
      )}
    </div>
  );
}
