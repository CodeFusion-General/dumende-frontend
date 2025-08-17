import React, { useState } from "react";
import { motion } from "framer-motion";

const MicroAnimationsTest: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Micro Animations Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hover Animation */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <h3 className="text-xl font-semibold mb-4">Hover Effect</h3>
            <p className="text-gray-600">
              {isHovered ? "Hovering!" : "Hover over me"}
            </p>
          </motion.div>

          {/* Click Animation */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
            whileTap={{ scale: 0.9, rotate: 5 }}
            onClick={() => setIsClicked(!isClicked)}
          >
            <h3 className="text-xl font-semibold mb-4">Click Effect</h3>
            <p className="text-gray-600">
              {isClicked ? "Clicked!" : "Click me"}
            </p>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <h3 className="text-xl font-semibold mb-4">Loading Effect</h3>
            <p className="text-gray-600">Continuous rotation</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MicroAnimationsTest;
