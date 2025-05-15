
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
  className
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const needsExpansion = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength);
  
  return (
    <div className={className}>
      <p className="text-gray-600 leading-relaxed">
        {displayText}
        {!isExpanded && needsExpansion && '...'}
      </p>
      
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary hover:text-primary/90 font-medium focus:outline-none"
        >
          {isExpanded ? 'Daha az göster' : 'Devamını göster'}
        </button>
      )}
    </div>
  );
}
