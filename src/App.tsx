import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BoatListing from "./pages/BoatListing";
import BoatsPage from "./pages/BoatsPage";
import CompareBoats from "./pages/CompareBoats";
import Services from "./pages/Services";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Captain Panel pages
import Dashboard from "./pages/admin/Dashboard";
import VesselsPage from "./pages/admin/VesselsPage";
import AvailabilityPage from "./pages/admin/AvailabilityPage";
import PricingPage from "./pages/admin/PricingPage";
import ToursPage from "./pages/admin/ToursPage";
import NewTourPage from "./pages/admin/NewTourPage";
import TourDetailPage from "./pages/TourDetailPage";
import CompanyPage from "./pages/admin/CompanyPage";
import VesselCalendarPage from "./pages/admin/VesselCalendarPage";
import TourCalendarPage from "./pages/admin/TourCalendarPage";
import RatingsPage from "./pages/admin/RatingsPage";
import MessagesPage from "./pages/admin/MessagesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/boats" element={<BoatsPage />} />
            <Route path="/boats/:id" element={<BoatListing />} />
            <Route path="/compare-boats" element={<CompareBoats />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />

            {/* Tour Detail Route */}
            <Route path="/tours/:id" element={<TourDetailPage />} />

            {/* Captain Panel Routes */}
            <Route path="/captain" element={<Dashboard />} />
            <Route path="/captain/vessels" element={<VesselsPage />} />
            <Route path="/captain/tours" element={<ToursPage />} />
            <Route path="/captain/tours/new" element={<NewTourPage />} />
            <Route path="/captain/tours/:id" element={<NewTourPage />} />
            <Route
              path="/captain/availability"
              element={<AvailabilityPage />}
            />
            <Route path="/captain/messages" element={<MessagesPage />} />
            <Route path="/captain/pricing" element={<PricingPage />} />
            <Route path="/captain/company" element={<CompanyPage />} />
            <Route path="/captain/calendar" element={<VesselCalendarPage />} />
            <Route
              path="/captain/tour-calendar"
              element={<TourCalendarPage />}
            />
            <Route path="/captain/ratings" element={<RatingsPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
