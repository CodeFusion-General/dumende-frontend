import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthNotificationsProvider from "./components/auth/AuthNotificationsProvider";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserType } from "@/types/auth.types";
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
import MyBookings from "./pages/MyBookings";
import BoatOwnerApplication from "./pages/BoatOwnerApplication";
import NotificationsPage from "./pages/NotificationsPage";

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
import BookingsPage from "./pages/admin/BookingsPage";
import ProfilePage from "./pages/admin/ProfilePage";
import {
  RatingTrendsChartDemo,
  RatingTrendsChartExample,
} from "./components/admin/ratings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <AuthNotificationsProvider>
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
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route
                  path="/boat-owner-application"
                  element={<BoatOwnerApplication />}
                />
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* Tour Detail Route */}
                <Route path="/tours/:id" element={<TourDetailPage />} />

                {/* Captain Panel Routes - Only BOAT_OWNER and ADMIN can access */}
                <Route
                  path="/captain"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <Dashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/vessels"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <VesselsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/tours"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <ToursPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/tours/new"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <NewTourPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/tours/:id"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <NewTourPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/availability"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <AvailabilityPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/messages"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <MessagesPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/pricing"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <PricingPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/company"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <CompanyPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/calendar"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <VesselCalendarPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/tour-calendar"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <TourCalendarPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/ratings"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <RatingsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/bookings"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <BookingsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/captain/profile"
                  element={
                    <RoleGuard
                      requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                    >
                      <ProfilePage />
                    </RoleGuard>
                  }
                />

                {/* Admin Panel Routes - Only ADMIN can access */}
                <Route
                  path="/admin"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <Dashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/vessels"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <VesselsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/tours"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <ToursPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/tours/new"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <NewTourPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/tours/:id"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <NewTourPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/availability"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <AvailabilityPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <MessagesPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/pricing"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <PricingPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/company"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <CompanyPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/calendar"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <VesselCalendarPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/tour-calendar"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <TourCalendarPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/ratings"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <RatingsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <RoleGuard requiredRoles={[UserType.ADMIN]}>
                      <BookingsPage />
                    </RoleGuard>
                  }
                />

                {/* Demo Routes for Development */}
                <Route
                  path="/demo/rating-trends"
                  element={<RatingTrendsChartDemo />}
                />
                <Route
                  path="/demo/rating-trends-example"
                  element={<RatingTrendsChartExample />}
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </BrowserRouter>
        </AuthNotificationsProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
