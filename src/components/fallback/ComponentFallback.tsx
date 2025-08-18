// Component Fallback for missing regular components
// Provides graceful degradation when regular components are not available

import React from "react";

interface ComponentFallbackProps {
  componentName: string;
  message?: string;
  children?: React.ReactNode;
}

export const ComponentFallback: React.FC<ComponentFallbackProps> = ({
  componentName,
  message,
  children,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
      <p className="text-gray-600 text-sm">
        {message || `${componentName} component is using simplified version`}
      </p>
      {children}
    </div>
  );
};

export default ComponentFallback;
