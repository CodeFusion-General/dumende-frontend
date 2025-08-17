import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PageTransitionsTest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "Page 1",
      content: "This is the first page with a fade transition.",
    },
    {
      title: "Page 2",
      content: "This is the second page with a slide transition.",
    },
    {
      title: "Page 3",
      content: "This is the third page with a scale transition.",
    },
  ];

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Page Transitions Test
        </h1>

        <div className="flex justify-center mb-8 space-x-4">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === index
                  ? "bg-white text-purple-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Page {index + 1}
            </button>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                {pages[currentPage].title}
              </h2>
              <p className="text-white/80 text-lg">
                {pages[currentPage].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PageTransitionsTest;
