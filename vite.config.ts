import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Development server configuration
  server: {
    host: "::",
    port: 8081,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration optimized for production with mobile-first approach
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    minify: "esbuild",
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Mobile-optimized chunk splitting strategy
          
          // Let React ecosystem go to vendor chunk naturally - don't separate it

          // VesselsPage - very large component (2400+ lines), separate chunk
          if (id.includes("VesselsPage")) {
            return "admin-vessels";
          }

          // Messages - separate chunk for real-time features
          if (id.includes("MessagesPage") || id.includes("src/components/admin/messages")) {
            return "admin-messages";
          }

          // Ratings/Finance - contains charts
          if (
            id.includes("RatingsPage") ||
            id.includes("FinancePage") ||
            id.includes("src/components/admin/ratings")
          ) {
            return "admin-analytics";
          }

          // Admin Dashboard and other admin pages
          if (
            id.includes("src/pages/admin/") ||
            id.includes("src/components/admin/") ||
            id.includes("Dashboard")
          ) {
            return "admin-core";
          }

          // Authentication pages - separate chunk
          if (
            id.includes("src/pages/auth/") ||
            id.includes("Register") ||
            id.includes("Login")
          ) {
            return "auth";
          }

          // Home page components - prioritized for mobile
          if (
            id.includes("src/pages/Home") ||
            id.includes("src/components/home/") ||
            id.includes("Hero") ||
            id.includes("FeaturedBoats")
          ) {
            return "home-critical";
          }

          // Testimonials - separate due to performance issues
          if (id.includes("Testimonials")) {
            return "testimonials";
          }

          // Icon libraries - can be separate since they don't depend on React internals
          if (id.includes("lucide-react")) {
            return "ui-icons";
          }

          // Animation libraries - non-critical
          if (id.includes("framer-motion")) {
            return "animations";
          }

          // Data fetching - loaded when needed
          if (id.includes("@tanstack/react-query") || id.includes("axios")) {
            return "data-fetching";
          }

          // Charts and heavy visualizations
          if (id.includes("recharts") || id.includes("chart")) {
            return "charts-heavy";
          }

          // Utilities - shared across components
          if (
            id.includes("date-fns") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge") ||
            id.includes("zod")
          ) {
            return "utils";
          }

          // Node modules vendor chunk (fallback) - include React
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Default chunk for app code
          return undefined;
        },
        // Mobile-optimized file naming
        chunkFileNames: (chunkInfo) => {
          // Add priority indicators for mobile loading
          const name = chunkInfo.name;
          if (name?.includes("react-ecosystem")) {
            return "assets/js/critical/[name]-[hash].js";
          }
          if (name?.includes("critical")) {
            return "assets/js/critical/[name]-[hash].js";
          }
          if (name?.includes("heavy") || name?.includes("admin-")) {
            return "assets/js/heavy/[name]-[hash].js";
          }
          return "assets/js/[name]-[hash].js";
        },
        entryFileNames: "assets/js/main-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.css$/.test(name ?? "")) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    // Mobile-optimized asset settings
    assetsInlineLimit: 2048, // Reduced to 2kb for mobile
    chunkSizeWarningLimit: 500, // Reduced to 500kb for mobile awareness
  },

  // Performance optimizations - ensure React ecosystem is pre-bundled
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-hook-form",
      "@tanstack/react-query",
      "axios",
      "framer-motion",
    ],
    force: true,
  },

  plugins: [
    react({
      // Enable React Fast Refresh in development
      fastRefresh: mode === "development",
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));
