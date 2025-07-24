import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ScrollToTop,
  GlassSkeleton,
  GlassSkeletonGroup,
} from "@/components/ui/ScrollToTop";
import { PageLoadingOverlay } from "@/components/transitions/PageTransition";
import { ArrowRight, Home, Ship, Phone, Info, Loader2 } from "lucide-react";

const PageTransitionsTest: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const navigate = useNavigate();

  const simulatePageLoad = () => {
    setShowLoading(true);
    setTimeout(() => {
      setShowLoading(false);
    }, 2000);
  };

  const toggleSkeletons = () => {
    setShowSkeletons(!showSkeletons);
  };

  const navigateWithDelay = (path: string) => {
    setShowLoading(true);
    setTimeout(() => {
      navigate(path);
      setShowLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <PageLoadingOverlay isLoading={showLoading} />
      <ScrollToTop variant="glass" showProgress={true} />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">
            Page Transitions & Loading Test
          </h1>
          <p className="text-white/70 animate-fade-in-up animate-delay-200">
            Testing page transitions, loading animations, and glass skeleton
            components
          </p>
        </div>

        {/* Navigation Test */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-300">
          <CardHeader>
            <CardTitle className="text-white">Page Navigation</CardTitle>
            <CardDescription className="text-white/70">
              Test page transitions between different routes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="glass"
                className="h-20 flex-col gap-2"
                onClick={() => navigateWithDelay("/")}
              >
                <Home className="w-6 h-6" />
                <span>Home</span>
              </Button>

              <Button
                variant="glass"
                className="h-20 flex-col gap-2"
                onClick={() => navigateWithDelay("/boats")}
              >
                <Ship className="w-6 h-6" />
                <span>Boats</span>
              </Button>

              <Button
                variant="glass"
                className="h-20 flex-col gap-2"
                onClick={() => navigateWithDelay("/about")}
              >
                <Info className="w-6 h-6" />
                <span>About</span>
              </Button>

              <Button
                variant="glass"
                className="h-20 flex-col gap-2"
                onClick={() => navigateWithDelay("/contact")}
              >
                <Phone className="w-6 h-6" />
                <span>Contact</span>
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={simulatePageLoad}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Simulate Loading
              </Button>

              <Link to="/test/glassmorphism">
                <Button variant="glass">
                  Glassmorphism Test
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Loading States Test */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-400">
          <CardHeader>
            <CardTitle className="text-white">Loading States</CardTitle>
            <CardDescription className="text-white/70">
              Test various loading animations and glass skeleton components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Button onClick={toggleSkeletons} variant="glass">
                {showSkeletons ? "Hide" : "Show"} Skeletons
              </Button>
              <Button
                onClick={simulatePageLoad}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Show Loading Overlay
              </Button>
            </div>

            {showSkeletons ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-white font-semibold mb-4">
                    Card Skeletons
                  </h3>
                  <GlassSkeletonGroup variant="card" count={2} />
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">
                    List Skeletons
                  </h3>
                  <GlassSkeletonGroup variant="list" count={3} />
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">
                    Grid Skeletons
                  </h3>
                  <GlassSkeletonGroup variant="grid" count={6} />
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">
                    Individual Skeletons
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <GlassSkeleton variant="avatar" />
                      <div className="flex-1 space-y-2">
                        <GlassSkeleton className="h-4 w-3/4" />
                        <GlassSkeleton className="h-3 w-1/2" />
                      </div>
                    </div>

                    <GlassSkeleton variant="card" />

                    <div className="flex gap-2">
                      <GlassSkeleton variant="button" />
                      <GlassSkeleton variant="button" />
                      <GlassSkeleton variant="button" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-white font-semibold mb-4">
                    Sample Content
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card
                        key={index}
                        className="bg-white/5 border-white/10 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader>
                          <CardTitle className="text-white">
                            Sample Card {index + 1}
                          </CardTitle>
                          <CardDescription className="text-white/70">
                            This is a sample card with content
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/80 mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore.
                          </p>
                          <Button variant="glass" size="sm">
                            Learn More
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scroll Animation Test */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-500">
          <CardHeader>
            <CardTitle className="text-white">Scroll Animations</CardTitle>
            <CardDescription className="text-white/70">
              Test scroll-to-top button and scroll-based animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-white/80">
              Scroll down to see the scroll-to-top button appear. The button
              includes a progress ring that shows scroll progress and smooth
              animations.
            </p>

            <div className="space-y-8">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 rounded-lg border border-white/10 animate-scroll-reveal"
                  data-scroll-reveal
                >
                  <h4 className="text-white font-semibold mb-2">
                    Scroll Item {index + 1}
                  </h4>
                  <p className="text-white/70">
                    This content animates in as you scroll. Each item has a
                    staggered animation delay to create a smooth cascade effect.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Test */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-600">
          <CardHeader>
            <CardTitle className="text-white">Performance Test</CardTitle>
            <CardDescription className="text-white/70">
              Test animation performance with multiple elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Array.from({ length: 32 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10 animate-hover-scale animate-pulse-glow"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer spacer for scroll testing */}
        <div className="h-96"></div>
      </div>
    </div>
  );
};

export default PageTransitionsTest;
