import { Suspense } from "react";
import { createLazyComponent } from "../../utils/lazyLoading";
import { Loader2 } from "lucide-react";

// Lazy load heavy admin components
export const LazyDashboard = createLazyComponent(
  () => import("../../pages/admin/Dashboard"),
  {
    priority: "low",
    mobileOptimized: true,
  }
);

export const LazyVesselsPage = createLazyComponent(
  () => import("../../pages/admin/VesselsPage"),
  {
    priority: "low",
    mobileOptimized: true,
  }
);

// Loading fallback component for admin pages
const AdminLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">Loading admin panel...</p>
    </div>
  </div>
);

// Wrapped components with Suspense
export const Dashboard = () => (
  <Suspense fallback={<AdminLoadingFallback />}>
    <LazyDashboard />
  </Suspense>
);

export const VesselsPage = () => (
  <Suspense fallback={<AdminLoadingFallback />}>
    <LazyVesselsPage />
  </Suspense>
);
