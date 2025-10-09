import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { swUtils } from "./services/serviceWorkerManager";

// ✅ PERFORMANCE: Create QueryClient for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize service worker for mobile performance optimization
if (import.meta.env.PROD) {
  swUtils
    .initialize()
    .then((success) => {
      if (success) {
        console.log("Service worker initialized successfully");
      } else {
        console.warn("Service worker initialization failed");
      }
    })
    .catch((error) => {
      console.error("Service worker initialization error:", error);
    });
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
