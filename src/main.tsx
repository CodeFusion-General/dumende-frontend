import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { swUtils } from "./services/serviceWorkerManager";

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

createRoot(document.getElementById("root")!).render(<App />);
