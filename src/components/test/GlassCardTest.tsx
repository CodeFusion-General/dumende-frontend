import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Star, Users, Calendar, Heart } from "lucide-react";

const GlassCardTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-ocean p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Glass Card Component Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default Glass Card */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Default Card</h3>
              <Heart className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-white/80 mb-4">
              This is a default glass card with standard glassmorphism effects.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-white/70">
                <Users className="h-4 w-4 mr-2" />
                <span>8 people</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1 fill-current" />
                <span>4.8</span>
              </div>
            </div>
          </GlassCard>

          {/* Light Glass Card */}
          <GlassCard variant="light" className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Light Variant</h3>
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-white/80 mb-4">
              Light variant with increased opacity and lighter blur effect.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">€250</span>
              <span className="text-white/60">/day</span>
            </div>
          </GlassCard>

          {/* Dark Glass Card */}
          <GlassCard variant="dark" className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Dark Variant</h3>
              <div className="bg-yellow-500 text-gray-800 text-xs px-2 py-1 rounded-full">
                Premium
              </div>
            </div>
            <p className="text-white/80 mb-4">
              Dark variant with reduced opacity and heavy blur effect.
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors">
              Book Now
            </button>
          </GlassCard>

          {/* Glow Effect Card */}
          <GlassCard glow className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Glow Effect</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white/80 mb-4">
              Glass card with animated glow effect for special emphasis.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Length:</span>
                <span>12m</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Engine:</span>
                <span>300HP</span>
              </div>
            </div>
          </GlassCard>

          {/* No Hover Card */}
          <GlassCard hover={false} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">No Hover</h3>
              <span className="text-white/60 text-sm">Static</span>
            </div>
            <p className="text-white/80 mb-4">
              Glass card with hover effects disabled for static content.
            </p>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.9</div>
              <div className="text-white/60 text-sm">Average Rating</div>
            </div>
          </GlassCard>

          {/* Non-animated Card */}
          <GlassCard animated={false} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">No Animation</h3>
              <span className="text-white/60 text-sm">Simple</span>
            </div>
            <p className="text-white/80 mb-4">
              Glass card with animations disabled for performance or
              accessibility.
            </p>
            <div className="flex space-x-2">
              <div className="flex-1 bg-white/20 text-white text-center py-2 rounded">
                WiFi
              </div>
              <div className="flex-1 bg-white/20 text-white text-center py-2 rounded">
                GPS
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Large Feature Card */}
        <div className="mt-8">
          <GlassCard className="p-8 md:p-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Premium Glass Card
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Large format glass card perfect for hero sections and featured
                content with full glassmorphism treatment and interactive
                effects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg transition-colors">
                  Learn More
                </button>
                <button className="bg-gradient-sunset text-gray-800 px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  Get Started
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default GlassCardTest;
