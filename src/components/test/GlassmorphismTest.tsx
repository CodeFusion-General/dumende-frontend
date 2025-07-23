import React from "react";

const GlassmorphismTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-hero-primary p-8">
      <div className="container mx-auto space-y-8">
        <h1 className="text-4xl font-montserrat font-bold text-gradient-hero text-center mb-12">
          Modern Design System Test
        </h1>

        {/* Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-glass">
            <h3 className="text-xl font-montserrat font-semibold text-white mb-4">
              Basic Glass Card
            </h3>
            <p className="text-white/80">
              This card demonstrates the basic glassmorphism effect with
              backdrop blur and transparency.
            </p>
          </div>

          <div className="card-glass-hover">
            <h3 className="text-xl font-montserrat font-semibold text-white mb-4">
              Hover Glass Card
            </h3>
            <p className="text-white/80">
              This card has enhanced hover effects with shadow and transform
              animations.
            </p>
          </div>

          <div className="glass-card animate-fade-in-up">
            <h3 className="text-xl font-montserrat font-semibold text-white mb-4">
              Animated Glass Card
            </h3>
            <p className="text-white/80">
              This card demonstrates the fade-in-up animation effect.
            </p>
          </div>
        </div>

        {/* Glass Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="btn-glass-primary animate-ripple">
            Primary Glass Button
          </button>
          <button className="btn-glass-secondary animate-ripple">
            Secondary Glass Button
          </button>
          <button className="btn-glass-accent animate-ripple">
            Accent Glass Button
          </button>
        </div>

        {/* Glass Navigation Example */}
        <div className="nav-glass rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="text-white font-montserrat font-semibold">
              Glass Navigation
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="relative">
          <div className="glass-light rounded-full p-4 w-16 h-16 animate-float mx-auto">
            <div className="w-full h-full bg-white/20 rounded-full animate-glow-pulse"></div>
          </div>
        </div>

        {/* Gradient Backgrounds Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-gradient-ocean rounded-xl flex items-center justify-center">
            <span className="text-white font-medium">Ocean</span>
          </div>
          <div className="h-24 bg-gradient-sunset rounded-xl flex items-center justify-center">
            <span className="text-gray-900 font-medium">Sunset</span>
          </div>
          <div className="h-24 bg-gradient-deep-sea rounded-xl flex items-center justify-center">
            <span className="text-white font-medium">Deep Sea</span>
          </div>
          <div className="h-24 bg-gradient-glass-overlay rounded-xl flex items-center justify-center backdrop-glass">
            <span className="text-white font-medium">Glass Overlay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismTest;
