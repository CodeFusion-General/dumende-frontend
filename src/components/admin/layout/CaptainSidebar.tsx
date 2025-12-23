import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ship,
  Map,
  Calendar,
  Clock,
  ClockAlert,
  MessageSquare,
  DollarSign,
  ClipboardList,
  Building,
  User,
  Star,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";
import { bookingService } from "@/services/bookingService";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

const CaptainSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { logout } = useAuth();
  const isCollapsed = state === "collapsed";
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending approval count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const bookings = await bookingService.getPendingApprovalBookings();
        setPendingCount(bookings.length);
      } catch (error) {
        console.error("Failed to fetch pending approval count:", error);
        setPendingCount(0);
      }
    };

    fetchPendingCount();
    // Refresh every 2 minutes
    const interval = setInterval(fetchPendingCount, 120000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      label: "Anasayfa",
      icon: <LayoutDashboard size={20} />,
      path: "/captain",
    },
    { label: "Taşıtlarım", icon: <Ship size={20} />, path: "/captain/vessels" },
    {
      label: "Turlarım",
      icon: <Map size={20} />,
      path: "/captain/tours",
    },
    {
      label: "Müsaitlik",
      icon: <Clock size={20} />,
      path: "/captain/availability",
    },
    {
      label: "Tur Müsaitlik",
      icon: <Clock size={20} />,
      path: "/captain/tour-availability",
    },
    {
      label: "Bekleyen Rezervasyonlar",
      icon: <ClockAlert size={20} />,
      path: "/captain/pending-approvals",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      label: "Mesajlar",
      icon: <MessageSquare size={20} />,
      path: "/captain/messages",
    },
    // Takvim ve Tur Takvimi kaldırıldı
    // Fiyatlar kaldırıldı; Finans bölümü kullanılacak
    {
      label: "Finans",
      icon: <DollarSign size={20} />,
      path: "/captain/finance",
    },
    {
      label: "Rezervasyonlar",
      icon: <ClipboardList size={20} />,
      path: "/captain/bookings",
    },
    { label: "Şirket", icon: <Building size={20} />, path: "/captain/company" },
    { label: "Profil", icon: <User size={20} />, path: "/captain/profile" },
    { label: "Puanlarım", icon: <Star size={20} />, path: "/captain/ratings" },
    {
      label: "Güvenlik",
      icon: <Shield size={20} />,
      path: "/captain/security",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar
      className={`${
        isCollapsed ? "w-[60px]" : "w-[260px]"
      } transition-all duration-300 ease-in-out`}
    >
      <SidebarHeader
        className={`p-4 border-b border-gray-700 bg-[#2c3e50] flex items-center justify-between ${
          isCollapsed ? "px-2 py-4" : ""
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="text-xl font-bold text-white">
              dümende<span className="text-[#15847c]">.kaptan</span>
            </div>
            <SidebarTrigger
              className="text-white ml-2"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            />
          </div>
        ) : (
          <SidebarTrigger
            className="text-white ml-2"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          />
        )}
      </SidebarHeader>

      <SidebarContent className="bg-[#2c3e50] text-white h-full overflow-y-auto flex flex-col">
        <nav className={`flex-1 ${isCollapsed ? "pt-2" : "pt-4"}`}>
          <ul className={`space-y-1 ${isCollapsed ? "px-1" : "px-2"}`}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              if (isCollapsed) {
                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={`relative flex justify-center items-center p-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-[#15847c] text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                          aria-label={item.label}
                        >
                          <span>{item.icon}</span>
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                        {item.badge && ` (${item.badge})`}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
                      isActive
                        ? "bg-[#15847c] text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    aria-label={item.label}
                  >
                    <div className="flex items-center">
                      <span className="mr-3 flex-shrink-0">{item.icon}</span>
                      <span className="text-left">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className={`mt-auto ${isCollapsed ? "px-1 pb-2" : "px-2 pb-4"}`}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex justify-center items-center p-2 rounded-md transition-colors text-gray-300 hover:bg-red-600 hover:text-white w-full"
                  aria-label="Çıkış Yap"
                >
                  <LogOut size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Çıkış Yap</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-red-600 hover:text-white w-full text-left"
              aria-label="Çıkış Yap"
            >
              <span className="mr-3 flex-shrink-0">
                <LogOut size={20} />
              </span>
              <span className="text-left">Çıkış Yap</span>
            </button>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter
        className={`p-4 border-t border-gray-700 bg-[#2c3e50] text-xs text-gray-400 ${
          isCollapsed ? "px-1 py-2" : ""
        }`}
      >
        {!isCollapsed && <p>© 2025 dümende</p>}
      </SidebarFooter>
    </Sidebar>
  );
};

export default CaptainSidebar;
