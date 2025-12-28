import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ship,
  Map,
  ClipboardList,
  CreditCard,
  FileText,
  MessageSquare,
  UserCheck,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Globe,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/auth.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

/**
 * AdminPanelSidebar - Kapsamlı admin paneli için navigasyon sidebar'ı
 *
 * Sadece ADMIN rolüne sahip kullanıcılar için tasarlanmıştır.
 * Tüm admin panel modüllerine erişim sağlar.
 */
const AdminPanelSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const isCollapsed = state === "collapsed";

  // Güvenlik kontrolü - sadece admin kullanıcılar bu sidebar'ı görebilir
  if (!user || user.role !== UserType.ADMIN) {
    return null;
  }

  const menuItems = [
    {
      label: t.admin.sidebar.dashboard,
      icon: <LayoutDashboard size={20} />,
      path: "/adminPanel",
    },
    {
      label: t.admin.sidebar.userManagement,
      icon: <Users size={20} />,
      path: "/adminPanel/users",
    },
    {
      label: t.admin.sidebar.boatManagement,
      icon: <Ship size={20} />,
      path: "/adminPanel/boats",
    },
    {
      label: t.admin.sidebar.tourManagement,
      icon: <Map size={20} />,
      path: "/adminPanel/tours",
    },
    {
      label: t.admin.sidebar.bookingManagement,
      icon: <ClipboardList size={20} />,
      path: "/adminPanel/bookings",
    },
    {
      label: t.admin.sidebar.paymentManagement,
      icon: <CreditCard size={20} />,
      path: "/adminPanel/payments",
    },
    {
      label: t.admin.sidebar.documentManagement,
      icon: <FileText size={20} />,
      path: "/adminPanel/documents",
    },
    {
      label: t.admin.sidebar.messageManagement,
      icon: <MessageSquare size={20} />,
      path: "/adminPanel/messages",
    },
    {
      label: t.admin.sidebar.captainApplications,
      icon: <UserCheck size={20} />,
      path: "/adminPanel/captain-applications",
    },
    {
      label: t.admin.sidebar.reports,
      icon: <BarChart3 size={20} />,
      path: "/adminPanel/reports",
    },
    {
      label: t.admin.sidebar.systemManagement,
      icon: <Settings size={20} />,
      path: "/adminPanel/system",
    },
    {
      label: t.admin.sidebar.security,
      icon: <Shield size={20} />,
      path: "/adminPanel/security",
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
        className={`p-4 border-b border-gray-700 bg-[#1e293b] flex items-center justify-between ${
          isCollapsed ? "px-2 py-4" : ""
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="text-xl font-bold text-white">
              dümende<span className="text-[#15847c]">.admin</span>
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

      <SidebarContent className="bg-[#1e293b] text-white h-full overflow-y-auto flex flex-col">
        <nav className={`flex-1 ${isCollapsed ? "pt-2" : "pt-4"}`}>
          <ul className={`space-y-1 ${isCollapsed ? "px-1" : "px-2"}`}>
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/adminPanel" &&
                  location.pathname.startsWith(item.path));

              if (isCollapsed) {
                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={`flex justify-center items-center p-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-[#15847c] text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                          aria-label={item.label}
                        >
                          <span>{item.icon}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-start px-3 py-2.5 rounded-md transition-colors text-left ${
                      isActive
                        ? "bg-[#15847c] text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    aria-label={item.label}
                  >
                    <span className="mr-3 flex-shrink-0">{item.icon}</span>
                    <span className="text-left">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Language Switcher & Logout */}
        <div className={`mt-auto ${isCollapsed ? "px-1 pb-2" : "px-2 pb-4"} space-y-1`}>
          {/* Language Switcher */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex justify-center items-center p-2 rounded-md transition-colors text-gray-300 hover:bg-gray-700 hover:text-white w-full">
                      <Globe size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="bg-[#1e293b] border-gray-700">
                      <DropdownMenuItem
                        onClick={() => setLanguage("tr")}
                        className={`cursor-pointer ${language === "tr" ? "bg-[#15847c] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                      >
                        🇹🇷 Türkçe
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLanguage("en")}
                        className={`cursor-pointer ${language === "en" ? "bg-[#15847c] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                      >
                        🇬🇧 English
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">{t.admin.sidebar.language}</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center px-3 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left">
                <span className="mr-3 flex-shrink-0">
                  <Globe size={20} />
                </span>
                <span className="text-left">{language === "tr" ? "Türkçe" : "English"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="bg-[#1e293b] border-gray-700">
                <DropdownMenuItem
                  onClick={() => setLanguage("tr")}
                  className={`cursor-pointer ${language === "tr" ? "bg-[#15847c] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={`cursor-pointer ${language === "en" ? "bg-[#15847c] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                >
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Logout Button */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex justify-center items-center p-2 rounded-md transition-colors text-gray-300 hover:bg-red-600 hover:text-white w-full"
                  aria-label={t.admin.sidebar.logout}
                >
                  <LogOut size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.admin.sidebar.logout}</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-red-600 hover:text-white w-full text-left"
              aria-label={t.admin.sidebar.logout}
            >
              <span className="mr-3 flex-shrink-0">
                <LogOut size={20} />
              </span>
              <span className="text-left">{t.admin.sidebar.logout}</span>
            </button>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter
        className={`p-4 border-t border-gray-700 bg-[#1e293b] text-xs text-gray-400 ${
          isCollapsed ? "px-1 py-2" : ""
        }`}
      >
        {!isCollapsed && (
          <div>
            <p>© 2025 dümende</p>
            <p className="text-[10px] mt-1 text-gray-500">Admin Panel v1.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminPanelSidebar;
