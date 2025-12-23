import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// Admin Panel pages (new comprehensive admin panel)
import { AdminPanelRouteGuard } from "./components/auth/AdminPanelRouteGuard";
import { lazy, Suspense } from "react";

// Captain Panel pages - lazy loaded for better initial load performance
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const VesselsPage = lazy(() => import("./pages/admin/VesselsPage"));
const AvailabilityPage = lazy(() => import("./pages/admin/AvailabilityPage"));
const ToursPage = lazy(() => import("./pages/admin/ToursPage"));
const NewTourPage = lazy(() => import("./pages/admin/NewTourPage"));
const CompanyPage = lazy(() => import("./pages/admin/CompanyPage"));
const VesselCalendarPage = lazy(() => import("./pages/admin/VesselCalendarPage"));

// Lazy load captain/owner pages for better performance (contains heavy charts)
const TourCalendarPage = lazy(() => import("./pages/admin/TourCalendarPage"));
const TourAvailabilityPage = lazy(() => import("./pages/admin/TourAvailabilityPage"));
const RatingsPage = lazy(() => import("./pages/admin/RatingsPage"));
const MessagesPage = lazy(() => import("./pages/admin/MessagesPage"));
const BookingsPage = lazy(() => import("./pages/admin/BookingsPage"));
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage"));
const SecurityPage = lazy(() => import("./pages/admin/SecurityPage"));
const FinancePage = lazy(() => import("./pages/admin/FinancePage"));
const CaptainApplicationsPage = lazy(() => import("./pages/admin/CaptainApplicationsPage"));
const CaptainApplicationDetailPage = lazy(() => import("./pages/admin/CaptainApplicationDetailPage"));
const PendingApprovalsPage = lazy(() => import("./pages/admin/PendingApprovalsPage"));

// Lazy load public pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ToursPagePublic = lazy(() => import("./pages/ToursPage"));
const BoatListing = lazy(() => import("./pages/BoatListing"));
const BoatsPage = lazy(() => import("./pages/BoatsPage"));
const CompareBoats = lazy(() => import("./pages/CompareBoats"));
const Services = lazy(() => import("./pages/Services"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const Register = lazy(() => import("./pages/Register"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const BoatOwnerApplication = lazy(() => import("./pages/BoatOwnerApplication"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PaymentReturn = lazy(() => import("./pages/PaymentReturn"));
const PaymentSuccess = lazy(() => import("./pages/payment/Success"));
const PaymentFailure = lazy(() => import("./pages/payment/Failure"));
const ProfileCompletionPage = lazy(
  () => import("./pages/ProfileCompletionPage")
);
const MyProfile = lazy(() => import("./pages/MyProfile"));
const TourDetailPage = lazy(() => import("./pages/TourDetailPage"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

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

const GlassmorphismTest = lazy(
  () => import("./components/test/GlassmorphismTest")
);
const MicroAnimationsTest = lazy(
  () => import("./components/test/MicroAnimationsTest")
);
const PageTransitionsTest = lazy(
  () => import("./components/test/PageTransitionsTest")
);
const AccessibilityTest = lazy(
  () => import("./components/test/AccessibilityTest")
);
// Removed demo component imports - these components were removed as they contained mock data
// Use RatingsContainer with real API data instead

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
                    <Route path="/payment/return" element={<PaymentReturn />} />
                    <Route
                      path="/payment/success"
                      element={<PaymentSuccess />}
                    />
                    <Route
                      path="/payment/failure"
                      element={<PaymentFailure />}
                    />
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
                      path="/captain/finance"
                      element={
                        <RoleGuard
                          requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                        >
                          <FinancePage />
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
                      path="/captain/tour-availability"
                      element={
                        <RoleGuard
                          requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                        >
                          <TourAvailabilityPage />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="/captain/pending-approvals"
                      element={
                        <RoleGuard
                          requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
                        >
                          <PendingApprovalsPage />
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
                    <Route
                      path="/captain/security"
                      element={
                        <RoleGuard
                          requiredRoles={[UserType.BOAT_OWNER, UserType.ADMIN]}
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
  );
};

export default App;
