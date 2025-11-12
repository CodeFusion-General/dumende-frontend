import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthNotificationsProvider from "./components/auth/AuthNotificationsProvider";
import { Analytics } from "@vercel/analytics/react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserType } from "@/types/auth.types";
import { accessibilityManager } from "@/lib/accessibility-utils";
import { accessibleAnimationController } from "@/lib/reduced-motion";
import {
  browserCompatibilityManager,
  polyfillManager,
} from "@/lib/browser-compatibility";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ToursPagePublic from "./pages/ToursPage";
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
import PaymentReturn from "./pages/PaymentReturn";
import PaymentSuccess from "./pages/payment/Success";
import PaymentFailure from "./pages/payment/Failure";
import ProfileCompletionPage from "./pages/ProfileCompletionPage";
import MyProfile from "./pages/MyProfile";

// Captain Panel pages
import Dashboard from "./pages/admin/Dashboard";
import VesselsPage from "./pages/admin/VesselsPage";
import AvailabilityPage from "./pages/admin/AvailabilityPage";
// PricingPage kaldırıldı
import ToursPage from "./pages/admin/ToursPage";
import NewTourPage from "./pages/admin/NewTourPage";
import TourDetailPage from "./pages/TourDetailPage";
import CompanyPage from "./pages/admin/CompanyPage";
import VesselCalendarPage from "./pages/admin/VesselCalendarPage";
import TourCalendarPage from "./pages/admin/TourCalendarPage";
import TourAvailabilityPage from "./pages/admin/TourAvailabilityPage";
import RatingsPage from "./pages/admin/RatingsPage";
import MessagesPage from "./pages/admin/MessagesPage";
import BookingsPage from "./pages/admin/BookingsPage";
import ProfilePage from "./pages/admin/ProfilePage";
import SecurityPage from "./pages/admin/SecurityPage";
import FinancePage from "./pages/admin/FinancePage";
import CaptainApplicationsPage from "./pages/admin/CaptainApplicationsPage";
import CaptainApplicationDetailPage from "./pages/admin/CaptainApplicationDetailPage";

// Admin Panel pages (new comprehensive admin panel)
import { AdminPanelRouteGuard } from "./components/auth/AdminPanelRouteGuard";
import Unauthorized from "./pages/Unauthorized";
import { lazy, Suspense } from "react";

// Lazy load admin panel pages for better performance
const AdminDashboard = lazy(() => import("./pages/adminPanel/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/adminPanel/UserManagement"));
const BoatManagement = lazy(() => import("./pages/adminPanel/BoatManagement"));
const BookingManagement = lazy(
  () => import("./pages/adminPanel/BookingManagement")
);
const DocumentManagement = lazy(
  () => import("./pages/adminPanel/DocumentManagement")
);
const CaptainApplicationManagement = lazy(
  () => import("./pages/adminPanel/CaptainApplicationManagement")
);
const CaptainApplicationDetail = lazy(
  () => import("./pages/adminPanel/CaptainApplicationDetail")
);
const CaptainApplicationReportsPage = lazy(
  () => import("./pages/adminPanel/CaptainApplicationReports")
);

import LoadingSpinner from "./components/ui/LoadingSpinner";

import GlassmorphismTest from "./components/test/GlassmorphismTest";
import MicroAnimationsTest from "./components/test/MicroAnimationsTest";
import PageTransitionsTest from "./components/test/PageTransitionsTest";
import AccessibilityTest from "./components/test/AccessibilityTest";
// Removed demo component imports - these components were removed as they contained mock data
// Use RatingsContainer with real API data instead

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize accessibility features
    accessibilityManager.announcePageChange("Application");

    // Load polyfills for unsupported features
    polyfillManager.loadAllPolyfills();

    // Log browser compatibility information in development
    if (process.env.NODE_ENV === "development") {
      browserCompatibilityManager.logCompatibilityInfo();
    }

    // Cleanup on unmount
    return () => {
      accessibilityManager.destroy();
      accessibleAnimationController.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AuthNotificationsProvider>
            <BrowserRouter>
              <TooltipProvider>
                <main id="main-content" role="main">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <LoadingSpinner size="lg" text="Sayfa yükleniyor..." />
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/boats" element={<BoatsPage />} />
                      <Route path="/boats/:id" element={<BoatListing />} />
                      <Route path="/compare-boats" element={<CompareBoats />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/profile-completion/:accountId"
                        element={
                          <ProtectedRoute
                            requiredRoles={[
                              UserType.CUSTOMER,
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <ProfileCompletionPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-profile"
                        element={
                          <ProtectedRoute
                            requiredRoles={[
                              UserType.CUSTOMER,
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <MyProfile />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<BlogPost />} />
                      <Route path="/my-bookings" element={<MyBookings />} />
                      <Route
                        path="/payment/return"
                        element={<PaymentReturn />}
                      />
                      <Route path="/payment/success" element={<PaymentSuccess />} />
                      <Route path="/payment/failure" element={<PaymentFailure />} />
                      <Route
                        path="/boat-owner-application"
                        element={<BoatOwnerApplication />}
                      />
                      <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                      />

                      {/* Tour Routes */}
                      <Route path="/tours" element={<ToursPagePublic />} />
                      <Route path="/tours/:id" element={<TourDetailPage />} />

                      {/* Captain Panel Routes - Only BOAT_OWNER and ADMIN can access */}
                      <Route
                        path="/captain"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <Dashboard />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/vessels"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <VesselsPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/tours"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <ToursPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/tours/new"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <NewTourPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/tours/:id"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <NewTourPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/availability"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <AvailabilityPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/messages"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <MessagesPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/finance"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <FinancePage />
                          </RoleGuard>
                        }
                      />

                      <Route
                        path="/captain/company"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <CompanyPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/calendar"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <VesselCalendarPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/tour-availability"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <TourAvailabilityPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/ratings"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <RatingsPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/bookings"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <BookingsPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/profile"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <ProfilePage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/captain/security"
                        element={
                          <RoleGuard
                            requiredRoles={[
                              UserType.BOAT_OWNER,
                              UserType.ADMIN,
                            ]}
                          >
                            <SecurityPage />
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
                        path="/admin/captain-applications"
                        element={
                          <RoleGuard requiredRoles={[UserType.ADMIN]}>
                            <CaptainApplicationsPage />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin/captain-applications/:id"
                        element={
                          <RoleGuard requiredRoles={[UserType.ADMIN]}>
                            <CaptainApplicationDetailPage />
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

                      {/* Comprehensive Admin Panel Routes - Only ADMIN can access */}
                      <Route
                        path="/adminPanel"
                        element={
                          <AdminPanelRouteGuard>
                            <AdminDashboard />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/users"
                        element={
                          <AdminPanelRouteGuard>
                            <UserManagement />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/boats"
                        element={
                          <AdminPanelRouteGuard>
                            <BoatManagement />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/bookings"
                        element={
                          <AdminPanelRouteGuard>
                            <BookingManagement />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/documents"
                        element={
                          <AdminPanelRouteGuard>
                            <DocumentManagement />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/captain-applications"
                        element={
                          <AdminPanelRouteGuard>
                            <CaptainApplicationManagement />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/captain-applications/:id"
                        element={
                          <AdminPanelRouteGuard>
                            <CaptainApplicationDetail />
                          </AdminPanelRouteGuard>
                        }
                      />
                      <Route
                        path="/adminPanel/captain-applications/reports"
                        element={
                          <AdminPanelRouteGuard>
                            <CaptainApplicationReportsPage />
                          </AdminPanelRouteGuard>
                        }
                      />
                      {/* Additional admin panel routes will be added in future tasks */}

                      {/* Unauthorized access page */}
                      <Route path="/unauthorized" element={<Unauthorized />} />

                      {/* Test Routes */}
                      <Route
                        path="/test/glassmorphism"
                        element={<GlassmorphismTest />}
                      />
                      <Route
                        path="/test/micro-animations"
                        element={<MicroAnimationsTest />}
                      />
                      <Route
                        path="/test/page-transitions"
                        element={<PageTransitionsTest />}
                      />
                      <Route
                        path="/test/accessibility"
                        element={<AccessibilityTest />}
                      />

                      {/* Demo Routes Removed - Components contained mock data and have been replaced with RatingsContainer */}

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Toaster />
                <Sonner />
                <Analytics />
              </TooltipProvider>
            </BrowserRouter>
          </AuthNotificationsProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
