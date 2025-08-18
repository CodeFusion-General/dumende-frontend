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

          // Critical React - keep React core together with dependents
          if (id.includes("react/") || id.includes("react-dom/")) {
            return "critical-react";
          }
          
          // React-dependent UI libraries should stay with React ecosystem
          if (id.includes("@radix-ui/")) {
            return "critical-react"; // Keep with React to avoid forwardRef issues
          }
          if (id.includes("react-router-dom")) {
            return "critical-router";
          }

          // Admin/Dashboard - lazy loaded (heavy components)
          if (
            id.includes("src/pages/admin/") ||
            id.includes("src/components/admin/") ||
            id.includes("VesselsPage") ||
            id.includes("Dashboard")
          ) {
            return "admin-heavy";
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

          // Node modules vendor chunk (fallback)
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
          if (name?.includes("critical")) {
            return "assets/js/critical/[name]-[hash].js";
          }
          if (name?.includes("heavy")) {
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

  // Performance optimizations
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "axios",
      "framer-motion",
    ],
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
