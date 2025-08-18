/**
 * Progressive Loading Example
 *
 * Demonstrates the progressive loading system with priority levels and skeleton states.
 *
 * Requirements: 3.2, 3.3 - Progressive loading and code splitting
 */

import React, { useState, useCallback } from "react";
import {
  createProgressiveComponent,
  useProgressiveLoading,
} from "@/utils/progressiveLoading";
import {
  CardSkeleton,
  TestimonialSkeleton,
  FormSkeleton,
  ContentBlockSkeleton,
} from "@/components/ui/SkeletonLoaders";
import {
  ProgressiveSection,
  ProgressiveWrapper,
} from "@/components/lazy/ProgressiveComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";

// Mock heavy components for demonstration
const HeavyComponent1: React.FC = () => {
  React.useEffect(() => {
    // Simulate heavy computation
    const start = Date.now();
    while (Date.now() - start < 1000) {
      // Busy wait to simulate heavy work
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Critical Component Loaded
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          This component was loaded with critical priority and should appear
          first.
        </p>
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 text-sm">
            ✅ Loaded immediately on page load
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const HeavyComponent2: React.FC = () => {
  React.useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 800) {
      // Simulate work
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          High Priority Component
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          This component was loaded with high priority after critical
          components.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            ⚡ Loaded after critical components
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const HeavyComponent3: React.FC = () => {
  React.useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 600) {
      // Simulate work
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-yellow-500" />
          Medium Priority Component
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          This component was loaded when it became visible (intersection
          loading).
        </p>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 text-sm">
            👁️ Loaded when scrolled into view
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const HeavyComponent4: React.FC = () => {
  React.useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 400) {
      // Simulate work
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-purple-500" />
          Low Priority Component
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          This component was loaded with low priority after other components.
        </p>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-800 text-sm">
            ⏳ Loaded when resources are available
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Create progressive versions
const ProgressiveCritical = createProgressiveComponent(
  () => Promise.resolve({ default: HeavyComponent1 }),
  {
    priority: "critical",
    fallback: () => <CardSkeleton />,
    preload: true,
  }
);

const ProgressiveHigh = createProgressiveComponent(
  () => Promise.resolve({ default: HeavyComponent2 }),
  {
    priority: "high",
    fallback: () => <CardSkeleton />,
    delay: 500,
  }
);

const ProgressiveMedium = createProgressiveComponent(
  () => Promise.resolve({ default: HeavyComponent3 }),
  {
    priority: "medium",
    fallback: () => <CardSkeleton />,
    intersectionLoading: true,
    intersectionOptions: { rootMargin: "100px" },
  }
);

const ProgressiveLow = createProgressiveComponent(
  () => Promise.resolve({ default: HeavyComponent4 }),
  {
    priority: "low",
    fallback: () => <CardSkeleton />,
    delay: 1000,
  }
);

// Component that demonstrates useProgressiveLoading hook
const DynamicLoadingDemo: React.FC = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  const {
    component: DynamicComponent,
    loading,
    error,
    retry,
  } = useProgressiveLoading(
    () =>
      Promise.resolve({
        default: () => (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Dynamically Loaded Component
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                This component was loaded on-demand using the
                useProgressiveLoading hook.
              </p>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  🎯 Loaded only when requested
                </p>
              </div>
            </CardContent>
          </Card>
        ),
      }),
    {
      priority: "high",
      delay: 300,
    }
  );

  React.useEffect(() => {
    if (shouldLoad && !DynamicComponent && !loading) {
      // Component will be loaded automatically when shouldLoad becomes true
    }
  }, [shouldLoad, DynamicComponent, loading]);

  if (!shouldLoad) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Dynamic component not loaded yet</p>
          <Button onClick={() => setShouldLoad(true)}>
            Load Dynamic Component
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <CardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            Failed to load component: {error.message}
          </p>
          <Button onClick={retry} variant="outline">
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return DynamicComponent ? <DynamicComponent /> : null;
};

// Loading status indicator
const LoadingStatusIndicator: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState({
    critical: "loading",
    high: "pending",
    medium: "pending",
    low: "pending",
  });

  React.useEffect(() => {
    // Simulate loading progression
    const timers = [
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, critical: "loaded" })),
        1000
      ),
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, high: "loading" })),
        1500
      ),
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, high: "loaded" })),
        2000
      ),
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, medium: "loading" })),
        2500
      ),
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, medium: "loaded" })),
        3000
      ),
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, low: "loading" })),
        3500
      ),
      setTimeout(
        () => setLoadingStates((prev) => ({ ...prev, low: "loaded" })),
        4000
      ),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "loaded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "loading":
        return "bg-blue-100 text-blue-800";
      case "loaded":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(loadingStates).map(([priority, status]) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className="capitalize font-medium">
                  {priority} Priority
                </span>
              </div>
              <Badge className={getStatusColor(status)}>{status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main example component
const ProgressiveLoadingExample: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Progressive Loading Example</h1>
        <p className="text-gray-600">
          Demonstrates priority-based component loading with skeleton states
        </p>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Progressive Loading Demo
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(false)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                • <strong>Critical components</strong> load immediately
              </p>
              <p>
                • <strong>High priority components</strong> load after critical
                ones
              </p>
              <p>
                • <strong>Medium priority components</strong> load when scrolled
                into view
              </p>
              <p>
                • <strong>Low priority components</strong> load when resources
                are available
              </p>
              <p>• Skeleton loaders provide immediate visual feedback</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Status */}
      <LoadingStatusIndicator />

      {/* Progressive Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Priority */}
        <ProgressiveCritical />

        {/* High Priority */}
        <ProgressiveHigh />

        {/* Medium Priority - with intersection loading */}
        <div style={{ marginTop: "100vh" }}>
          <h3 className="text-lg font-semibold mb-4">
            Scroll down to see intersection loading in action
          </h3>
          <ProgressiveMedium />
        </div>

        {/* Low Priority */}
        <ProgressiveLow />
      </div>

      {/* Dynamic Loading Demo */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">
          Dynamic Loading with Hook
        </h3>
        <DynamicLoadingDemo />
      </div>

      {/* Progressive Sections Demo */}
      <div className="mt-12 space-y-6">
        <h3 className="text-lg font-semibold">Progressive Sections</h3>

        <ProgressiveSection
          priority="medium"
          className="p-6 bg-gray-50 rounded-lg"
        >
          <h4 className="text-lg font-medium mb-2">Progressive Section 1</h4>
          <p>
            This entire section is loaded progressively with medium priority.
          </p>
        </ProgressiveSection>

        <ProgressiveSection
          priority="low"
          className="p-6 bg-gray-50 rounded-lg"
        >
          <h4 className="text-lg font-medium mb-2">Progressive Section 2</h4>
          <p>
            This section has low priority and loads when resources are
            available.
          </p>
        </ProgressiveSection>
      </div>

      {/* Skeleton Examples */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">Skeleton Loading States</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Card Skeleton</h4>
            <CardSkeleton />
          </div>
          <div>
            <h4 className="font-medium mb-2">Testimonial Skeleton</h4>
            <TestimonialSkeleton />
          </div>
          <div>
            <h4 className="font-medium mb-2">Form Skeleton</h4>
            <FormSkeleton />
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              • Use <code>critical</code> priority for above-the-fold content
            </li>
            <li>
              • Use <code>intersectionLoading</code> for below-the-fold
              components
            </li>
            <li>• Provide meaningful skeleton states for better UX</li>
            <li>
              • Use <code>preload</code> for components likely to be needed soon
            </li>
            <li>• Add delays to prevent loading too many components at once</li>
            <li>
              • Use error boundaries to handle loading failures gracefully
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveLoadingExample;
