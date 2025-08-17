import React from "react";

const GlassmorphismTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Glassmorphism Test
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Card 1</h3>
            <p className="text-white/80">
              This is a glassmorphism card with backdrop blur and transparency.
            </p>
          </div>
          <div className="backdrop-blur-lg bg-white/20 rounded-xl p-6 border border-white/30">
            <h3 className="text-xl font-semibold text-white mb-4">Card 2</h3>
            <p className="text-white/80">
              This card has stronger blur and higher opacity.
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Card 3</h3>
            <p className="text-white/80">
              This card has subtle blur and low opacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismTest;
