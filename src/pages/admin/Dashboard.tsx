import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { CheckCircle, CircleDashed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { bookingHelperService } from "@/services/bookingService";
import { BookingStatistics } from "@/types/booking.types";
import { boatService } from "@/services/boatService";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  // TODO: Replace with actual logged-in user ID
  const ownerId = 2; // Ahmet Yılmaz (test data)

  const [stats, setStats] = useState<BookingStatistics | null>(null);
  const [boatCount, setBoatCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // These would be fetched from an API in a real application
  const onboardingTasks = [
    {
      id: 1,
      title: t.adminDashboard.tasks.enterCompanyInfo,
      completed: false,
      path: "/admin/company",
    },
    {
      id: 2,
      title: t.adminDashboard.tasks.completeProfile,
      completed: false,
      path: "/admin/profile",
    },
    { id: 3, title: t.adminDashboard.tasks.addBoat, completed: false, path: "/admin/vessels" },
    {
      id: 4,
      title: t.adminDashboard.tasks.enterPricing,
      completed: false,
      path: "/admin/pricing",
    },
    {
      id: 5,
      title: t.adminDashboard.tasks.createAvailability,
      completed: false,
      path: "/admin/availability",
    },
  ];

  // Load dashboard statistics
  /*useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load booking statistics
        const bookingStats =
          await bookingHelperService.calculateBookingStatistics(ownerId);
        setStats(bookingStats);

        // Load boat count
        const boats = await boatService.getBoatsByOwner(ownerId);
        setBoatCount(boats.length);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [ownerId]);*/

  return (
    <SidebarProvider>
      <CaptainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t.adminDashboard.welcome}</h1>
            <p className="text-gray-500">
              {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-[#2c3e50]">
              {t.adminDashboard.gettingStarted}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.adminDashboard.welcomeDescription}
            </p>

            <div className="space-y-4">
              {onboardingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start p-4 border rounded-md bg-gray-50 hover:shadow-sm transition-shadow"
                >
                  <div className="mr-3 mt-0.5 text-[#15847c]">
                    {task.completed ? (
                      <CheckCircle size={20} />
                    ) : (
                      <CircleDashed size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.completed
                        ? t.adminDashboard.completed
                        : t.adminDashboard.taskDescription}
                    </p>
                    {!task.completed && (
                      <Button
                        className="mt-2 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
                        onClick={() => navigate(task.path)}
                      >
                        {t.adminDashboard.continue}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-[#2c3e50]">
                {t.adminDashboard.announcements}
              </h2>
              <p className="text-gray-600">
                {t.adminDashboard.noAnnouncements}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-[#2c3e50]">
                {t.admin.dashboard.stats.totalBoats}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#15847c]" />
                  <span className="ml-2 text-gray-500">{t.common.loading}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600">{t.adminDashboard.stats.totalBoats}</span>
                    <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-[#15847c]">
                      {boatCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600">
                      {t.adminDashboard.stats.pendingBookings}
                    </span>
                    <span className="font-medium bg-yellow-100 px-3 py-1 rounded-full text-yellow-700">
                      {stats?.pendingBookings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600">{t.adminDashboard.stats.monthlyBookings}</span>
                    <span className="font-medium bg-blue-100 px-3 py-1 rounded-full text-blue-700">
                      {stats?.thisMonthBookings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600">{t.adminDashboard.stats.totalBookings}</span>
                    <span className="font-medium bg-green-100 px-3 py-1 rounded-full text-green-700">
                      {stats?.totalBookings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600">{t.adminDashboard.stats.monthlyRevenue}</span>
                    <span className="font-medium bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">
                      {stats?.thisMonthRevenue?.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US') || 0} {t.common.currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CaptainLayout>
    </SidebarProvider>
  );
};

export default Dashboard;
