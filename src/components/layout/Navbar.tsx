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
        ? `${baseClasses} glass-nav scrolled py-2`
        : `${baseClasses} bg-transparent py-4`;
    } else {
      return isScrolled
        ? `${baseClasses} glass-nav scrolled py-2`
        : `${baseClasses} glass-nav py-4`;
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
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Anchor className="w-10 h-10 text-white" />
            <span className="font-bold text-xl text-white font-montserrat tracking-wide">
              Dumende
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {[
              { path: "/", label: t.nav.home },
              { path: "/boats", label: t.nav.boats },
              { path: "/services", label: t.nav.services },
              { path: "/about", label: t.nav.about },
              { path: "/contact", label: t.nav.contact },
              { path: "/blog", label: t.nav.blog },
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-4 py-2 rounded-xl font-montserrat font-medium tracking-wide text-white
                  transition-all duration-300 ease-glass animate-ripple
                  hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-lg hover:scale-105
                  ${
                    isActive(item.path)
                      ? "text-accent bg-white/15 backdrop-blur-sm shadow-md"
                      : "hover:text-accent"
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

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="glass-button text-white hover:text-accent p-2 rounded-xl transition-all duration-300 hover:scale-105">
                <Globe size={20} />
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

            {isAuthenticated && <NavbarNotification userId={user!.id} />}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="glass-button text-white hover:text-accent p-2 rounded-xl transition-all duration-300 hover:scale-105">
                  <User size={20} />
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
                    onClick={() => (window.location.href = "/my-bookings")}
                    className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t.nav.myBookings}
                  </DropdownMenuItem>
                  {user?.role === "CUSTOMER" && (
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = "/boat-owner-application")
                      }
                      className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                    >
                      <Ship className="mr-2 h-4 w-4" />
                      {t.nav.boatOwnerApplication}
                    </DropdownMenuItem>
                  )}
                  {user?.role === "BOAT_OWNER" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/captain")}
                      className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                    >
                      <Anchor className="mr-2 h-4 w-4" />
                      {t.nav.captainPanel}
                    </DropdownMenuItem>
                  )}
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/admin")}
                      className="relative hover:bg-[#3498db]/10 cursor-pointer text-[#2c3e50] transition-all duration-200 rounded-lg px-3 py-2 focus:bg-[#3498db]/10 focus:text-[#2c3e50] font-roboto"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {t.nav.adminPanel}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/20 my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="relative hover:bg-red-500/20 cursor-pointer text-red-600 hover:text-red-700 transition-all duration-200 rounded-lg px-3 py-2 focus:bg-red-500/20 focus:text-red-700 font-roboto"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                className="glass-button text-white hover:text-accent p-2 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={() => setIsAuthOpen(true)}
              >
                <User size={20} />
              </button>
            )}

            <AuthDialog
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
            />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden glass-button text-white hover:text-accent p-2 rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
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
