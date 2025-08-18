import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Globe,
  Anchor,
  LogOut,
  Ship,
  Shield,
} from "lucide-react";
import { NavbarNotification } from "@/components/notification/NavbarNotification";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from "@/components/auth/AuthDialog";
import MobileGlassMenu from "@/components/navigation/MobileGlassMenu";

interface NavbarProps {
  isHomePage?: boolean;
}

const Navbar = ({ isHomePage = false }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced glass navigation styling with smooth morphing
  const getNavbarClasses = () => {
    const baseClasses =
      "fixed w-full z-50 transition-all duration-500 ease-smooth";

    if (isHomePage) {
      return isScrolled
        ? `${baseClasses} bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg py-2`
        : `${baseClasses} bg-transparent py-4`;
    } else {
      return isScrolled
        ? `${baseClasses} bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg py-2`
        : `${baseClasses} bg-gradient-to-r from-[#1a5f7a] to-[#2d7795] shadow-lg py-4`;
    }
  };

  const t = translations[language];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const getUserRoleText = () => {
    if (!user) return "";
    switch (user.role) {
      case "CUSTOMER":
        return language === "tr" ? "Müşteri" : "Customer";
      case "BOAT_OWNER":
        return language === "tr" ? "Tekne Sahibi" : "Boat Owner";
      case "ADMIN":
        return language === "tr" ? "Yönetici" : "Admin";
      default:
        return "";
    }
  };

  return (
    <header className={getNavbarClasses()}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 w-full max-w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 w-full">
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-shrink-0">
            <Anchor
              strokeWidth={2.5}
              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                isScrolled ? "text-[#2c3e50]" : "text-white"
              }`}
            />
            <span
              className={`font-bold text-lg sm:text-xl font-montserrat tracking-wide transition-colors duration-300 truncate ${
                isScrolled ? "text-[#2c3e50]" : "text-white"
              }`}
            >
              Dumende
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1 justify-center max-w-2xl mx-4">
            {[
              { path: "/", label: t.nav.home },
              { path: "/boats", label: t.nav.boats },
              { path: "/tours", label: (t as any)?.nav?.tours || "Turlar" },
              { path: "/services", label: t.nav.services },
              { path: "/about", label: t.nav.about },
              { path: "/contact", label: t.nav.contact },
              { path: "/blog", label: t.nav.blog },
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-2 xl:px-4 py-2 rounded-xl font-montserrat font-medium tracking-wide text-sm xl:text-base
                  transition-all duration-300 ease-glass animate-ripple
                  hover:backdrop-blur-sm hover:shadow-lg hover:scale-105
                  ${
                    isScrolled
                      ? `text-[#2c3e50] hover:bg-[#3498db]/10 hover:text-[#3498db] ${
                          isActive(item.path)
                            ? "text-[#3498db] bg-[#3498db]/15 backdrop-blur-sm shadow-md"
                            : ""
                        }`
                      : `text-white hover:bg-white/10 hover:text-accent ${
                          isActive(item.path)
                            ? "text-accent bg-white/15 backdrop-blur-sm shadow-md"
                            : ""
                        }`
                  }
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isScrolled
                    ? "text-[#2c3e50] hover:text-[#3498db] hover:bg-[#3498db]/10"
                    : "text-white hover:text-accent hover:bg-white/10"
                }`}
              >
                <Globe size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-none mt-2 min-w-[140px] p-3 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl" />
                <DropdownMenuItem
                  onClick={() => setLanguage("tr")}
                  className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                >
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated && (
              <div className="hidden sm:block">
                <NavbarNotification userId={user!.id} isScrolled={isScrolled} />
              </div>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isScrolled
                      ? "text-[#2c3e50] hover:text-[#3498db] hover:bg-[#3498db]/10"
                      : "text-white hover:text-accent hover:bg-white/10"
                  }`}
                >
                  <User size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-none mt-2 min-w-[200px] p-3 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl" />
                  <div className="relative px-3 py-3 border-b border-white/20 mb-2 bg-gradient-to-r from-[#3498db]/10 via-[#2c3e50]/5 to-[#3498db]/10 rounded-lg">
                    <p className="text-sm font-medium text-[#2c3e50] font-montserrat">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-600 font-roboto">
                      {getUserRoleText()}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/my-profile")}
                    className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                  >
                    <User className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    Profilim
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/my-bookings")}
                    className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                  >
                    <User className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    {t.nav.myBookings}
                  </DropdownMenuItem>
                  {user?.role === "CUSTOMER" && (
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = "/boat-owner-application")
                      }
                      className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                    >
                      <Ship className="mr-2 h-4 w-4" strokeWidth={2.5} />
                      {t.nav.boatOwnerApplication}
                    </DropdownMenuItem>
                  )}
                  {user?.role === "BOAT_OWNER" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/captain")}
                      className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                    >
                      <Anchor className="mr-2 h-4 w-4" strokeWidth={2.5} />
                      {t.nav.captainPanel}
                    </DropdownMenuItem>
                  )}
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/admin")}
                      className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                    >
                      <Shield className="mr-2 h-4 w-4" strokeWidth={2.5} />
                      {t.nav.adminPanel}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/20 my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="relative hover:bg-red-500/20 cursor-pointer text-red-600 hover:text-red-700 transition-all duration-200 rounded-lg px-3 py-2 focus:bg-red-500/20 focus:text-red-700 font-roboto"
                  >
                    <LogOut className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isScrolled
                    ? "text-[#2c3e50] hover:text-[#3498db] hover:bg-[#3498db]/10"
                    : "text-white hover:text-accent hover:bg-white/10"
                }`}
                onClick={() => setIsAuthOpen(true)}
              >
                <User size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
              </button>
            )}

            <AuthDialog
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
            />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "text-[#2c3e50] hover:text-[#3498db] hover:bg-[#3498db]/10"
                  : "text-white hover:text-accent hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
              ) : (
                <Menu size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Full-screen Glass Mobile Menu */}
        <MobileGlassMenu
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onAuthOpen={() => setIsAuthOpen(true)}
        />
      </div>
    </header>
  );
};

export default Navbar;
