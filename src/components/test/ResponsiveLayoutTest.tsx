import React, { useState } from "react";
import {
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveContainer,
  SidebarLayout,
  DashboardLayout,
  OrientationAware,
  PerformanceGrid,
} from "@/components/layout/ResponsiveGrid";
import { useResponsiveAnimations } from "@/hooks/useResponsiveAnimations";
import { useOrientationChange } from "@/hooks/useOrientationChange";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Grid3X3,
  Layout,
  Sidebar,
  Dashboard,
  Layers,
} from "lucide-react";

const ResponsiveLayoutTest: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>("grid");
  const { viewport, isAnimationEnabled, getResponsiveClass } =
    useResponsiveAnimations();
  const { orientation, isChanging, getOrientationClasses } =
    useOrientationChange();

  // Sample data for demonstrations
  const sampleCards = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    content: `This is sample content for card ${
      i + 1
    }. It demonstrates responsive behavior.`,
    size: i % 4 === 0 ? "large" : i % 3 === 0 ? "small" : "normal",
  }));

  const DeviceIndicator = () => (
    <div className="glass-card-responsive p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Current Viewport</h3>
        <div className="flex items-center space-x-2">
          {viewport.isMobile && (
            <Smartphone className="w-5 h-5 text-blue-400" />
          )}
          {viewport.isTablet && <Tablet className="w-5 h-5 text-green-400" />}
          {viewport.isDesktop && (
            <Monitor className="w-5 h-5 text-purple-400" />
          )}
          {isChanging && (
            <RotateCcw className="w-5 h-5 text-yellow-400 animate-spin" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-white/70">Width</div>
          <div className="text-white font-medium">{viewport.width}px</div>
        </div>
        <div className="text-center">
          <div className="text-white/70">Height</div>
          <div className="text-white font-medium">{viewport.height}px</div>
        </div>
        <div className="text-center">
          <div className="text-white/70">Breakpoint</div>
          <div className="text-white font-medium">{viewport.breakpoint}</div>
        </div>
        <div className="text-center">
          <div className="text-white/70">Orientation</div>
          <div className="text-white font-medium">{orientation}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {viewport.isMobile && (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            Mobile
          </span>
        )}
        {viewport.isTablet && (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
            Tablet
          </span>
        )}
        {viewport.isDesktop && (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
            Desktop
          </span>
        )}
        {viewport.isTouch && (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
            Touch
          </span>
        )}
        {!isAnimationEnabled && (
          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
            Reduced Motion
          </span>
        )}
      </div>
    </div>
  );

  const DemoSelector = () => (
    <div className="glass-card-responsive p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Layout Demonstrations
      </h3>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "grid", label: "Responsive Grid", icon: Grid3X3 },
          { id: "cards", label: "Adaptive Cards", icon: Layout },
          { id: "sidebar", label: "Sidebar Layout", icon: Sidebar },
          { id: "dashboard", label: "Dashboard Layout", icon: Dashboard },
          { id: "orientation", label: "Orientation Aware", icon: RotateCcw },
          { id: "performance", label: "Performance Grid", icon: Layers },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => setActiveDemo(id)}
            className={`glass-button-responsive ${
              activeDemo === id
                ? "bg-blue-500/30 text-blue-200"
                : "text-white/80"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );

  const GridDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Responsive Grid Layouts
      </h3>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg text-white/80 mb-3">Auto-fit Grid</h4>
          <ResponsiveGrid variant="auto" spacing="normal">
            {sampleCards.slice(0, 8).map((card) => (
              <ResponsiveCard key={card.id} size={card.size as any}>
                <h5 className="font-semibold text-white mb-2">{card.title}</h5>
                <p className="text-white/70 text-sm">{card.content}</p>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>

        <div>
          <h4 className="text-lg text-white/80 mb-3">Fixed Column Grid</h4>
          <ResponsiveGrid variant="fixed" spacing="spacious">
            {sampleCards.slice(0, 6).map((card) => (
              <ResponsiveCard key={card.id}>
                <h5 className="font-semibold text-white mb-2">{card.title}</h5>
                <p className="text-white/70 text-sm">{card.content}</p>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>
      </div>
    </div>
  );

  const CardsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Adaptive Card Sizing
      </h3>

      <ResponsiveGrid variant="auto" spacing="normal">
        <ResponsiveCard size="small">
          <h5 className="font-semibold text-white mb-2">Small Card</h5>
          <p className="text-white/70 text-sm">
            Compact content with minimal padding.
          </p>
        </ResponsiveCard>

        <ResponsiveCard size="normal">
          <h5 className="font-semibold text-white mb-2">Normal Card</h5>
          <p className="text-white/70 text-sm">
            Standard card with balanced spacing and content area.
          </p>
        </ResponsiveCard>

        <ResponsiveCard size="large">
          <h5 className="font-semibold text-white mb-2">Large Card</h5>
          <p className="text-white/70 text-sm">
            Spacious card with generous padding for important content.
          </p>
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white/60 text-xs">Additional content area</p>
          </div>
        </ResponsiveCard>

        <ResponsiveCard size="hero">
          <h5 className="font-semibold text-white mb-3 text-xl">Hero Card</h5>
          <p className="text-white/70 mb-4">
            Premium card with maximum impact and generous spacing for hero
            content.
          </p>
          <div className="space-y-2">
            <div className="h-2 bg-gradient-ocean rounded-full"></div>
            <div className="h-2 bg-gradient-sunset rounded-full w-3/4"></div>
            <div className="h-2 bg-gradient-deep-sea rounded-full w-1/2"></div>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>
    </div>
  );

  const SidebarDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Sidebar Layout</h3>

      <SidebarLayout
        sidebar={
          <ResponsiveCard>
            <h5 className="font-semibold text-white mb-3">Sidebar Content</h5>
            <div className="space-y-3">
              {["Navigation", "Filters", "Recent Items", "Settings"].map(
                (item) => (
                  <div
                    key={item}
                    className="p-2 bg-white/10 rounded text-white/80 text-sm"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </ResponsiveCard>
        }
        main={
          <ResponsiveGrid variant="auto" spacing="normal">
            {sampleCards.slice(0, 6).map((card) => (
              <ResponsiveCard key={card.id}>
                <h5 className="font-semibold text-white mb-2">{card.title}</h5>
                <p className="text-white/70 text-sm">{card.content}</p>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        }
      />
    </div>
  );

  const DashboardDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Dashboard Layout
      </h3>

      <DashboardLayout
        sidebar={
          <ResponsiveCard>
            <h5 className="font-semibold text-white mb-3">Navigation</h5>
            <div className="space-y-2">
              {["Dashboard", "Analytics", "Reports", "Settings"].map((item) => (
                <div
                  key={item}
                  className="p-2 bg-white/10 rounded text-white/80 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </ResponsiveCard>
        }
        main={
          <div className="space-y-4">
            <ResponsiveCard size="hero">
              <h5 className="font-semibold text-white mb-2 text-xl">
                Main Dashboard
              </h5>
              <p className="text-white/70">
                Primary content area with key metrics and data.
              </p>
            </ResponsiveCard>
            <ResponsiveGrid variant="fixed" spacing="normal">
              {sampleCards.slice(0, 4).map((card) => (
                <ResponsiveCard key={card.id}>
                  <h5 className="font-semibold text-white mb-2">
                    {card.title}
                  </h5>
                  <p className="text-white/70 text-sm">{card.content}</p>
                </ResponsiveCard>
              ))}
            </ResponsiveGrid>
          </div>
        }
        rightPanel={
          <ResponsiveCard>
            <h5 className="font-semibold text-white mb-3">Activity</h5>
            <div className="space-y-2">
              {["Recent Activity", "Notifications", "Quick Actions"].map(
                (item) => (
                  <div
                    key={item}
                    className="p-2 bg-white/10 rounded text-white/80 text-sm"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </ResponsiveCard>
        }
      />
    </div>
  );

  const OrientationDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Orientation-Aware Layout
      </h3>

      <OrientationAware
        portrait={
          <ResponsiveCard size="large">
            <h5 className="font-semibold text-white mb-3">Portrait Mode</h5>
            <p className="text-white/70 mb-4">
              This content is optimized for portrait orientation with vertical
              stacking.
            </p>
            <div className="space-y-3">
              {sampleCards.slice(0, 3).map((card) => (
                <div key={card.id} className="p-3 bg-white/10 rounded">
                  <h6 className="text-white font-medium">{card.title}</h6>
                  <p className="text-white/60 text-sm">{card.content}</p>
                </div>
              ))}
            </div>
          </ResponsiveCard>
        }
        landscape={
          <ResponsiveGrid variant="fixed" spacing="normal">
            <ResponsiveCard size="large">
              <h5 className="font-semibold text-white mb-3">Landscape Mode</h5>
              <p className="text-white/70">
                This layout utilizes horizontal space effectively with
                side-by-side content.
              </p>
            </ResponsiveCard>
            {sampleCards.slice(0, 3).map((card) => (
              <ResponsiveCard key={card.id}>
                <h6 className="text-white font-medium mb-2">{card.title}</h6>
                <p className="text-white/60 text-sm">{card.content}</p>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        }
      />
    </div>
  );

  const PerformanceDemo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Performance-Optimized Grid
      </h3>
      <p className="text-white/70 mb-4">
        This grid automatically optimizes for performance based on device
        capabilities and item count.
      </p>

      <PerformanceGrid itemCount={sampleCards.length}>
        {sampleCards.map((card) => (
          <ResponsiveCard key={card.id}>
            <h5 className="font-semibold text-white mb-2">{card.title}</h5>
            <p className="text-white/70 text-sm">{card.content}</p>
            <div className="mt-3 text-xs text-white/50">
              Performance optimized for{" "}
              {viewport.isMobile
                ? "mobile"
                : viewport.isTablet
                ? "tablet"
                : "desktop"}
            </div>
          </ResponsiveCard>
        ))}
      </PerformanceGrid>
    </div>
  );

  const renderDemo = () => {
    switch (activeDemo) {
      case "grid":
        return <GridDemo />;
      case "cards":
        return <CardsDemo />;
      case "sidebar":
        return <SidebarDemo />;
      case "dashboard":
        return <DashboardDemo />;
      case "orientation":
        return <OrientationDemo />;
      case "performance":
        return <PerformanceDemo />;
      default:
        return <GridDemo />;
    }
  };

  return (
    <ResponsiveContainer
      variant="optimized"
      className={getOrientationClasses()}
    >
      <div className="py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-4">
            Responsive Layout System Test
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Interactive demonstration of modern responsive layouts with fluid
            animations, adaptive sizing, and orientation-aware components.
          </p>
        </div>

        <DeviceIndicator />
        <DemoSelector />

        <div className="min-h-screen">{renderDemo()}</div>

        <div className="glass-card-responsive p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Features Demonstrated
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">Fluid Animations</h4>
              <p className="text-white/60 text-sm">
                Smooth transitions between breakpoints and layout changes.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">Adaptive Sizing</h4>
              <p className="text-white/60 text-sm">
                Cards and containers that scale appropriately for each viewport.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">
                Touch Optimization
              </h4>
              <p className="text-white/60 text-sm">
                Enhanced interactions for touch devices with proper sizing.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">
                Orientation Handling
              </h4>
              <p className="text-white/60 text-sm">
                Smooth transitions and layout adjustments for orientation
                changes.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">
                Performance Optimization
              </h4>
              <p className="text-white/60 text-sm">
                Automatic performance adjustments based on device capabilities.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">
                Glassmorphism Effects
              </h4>
              <p className="text-white/60 text-sm">
                Responsive glass effects that adapt to screen size and
                capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default ResponsiveLayoutTest;
