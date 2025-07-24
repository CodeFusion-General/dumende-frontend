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
              <DropdownMenuContent className="glass-modal border-none mt-2 min-w-[140px] p-2 bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                <DropdownMenuItem
                  onClick={() => setLanguage("tr")}
                  className="hover:bg-white/10 cursor-pointer text-white transition-all duration-200 rounded-lg px-3 py-2 focus:bg-white/10 focus:text-white"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className="hover:bg-white/10 cursor-pointer text-white transition-all duration-200 rounded-lg px-3 py-2 focus:bg-white/10 focus:text-white"
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
                <DropdownMenuContent className="glass-modal border-none mt-2 min-w-[200px] p-2 bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <div className="px-3 py-2 border-b border-white/20 mb-1">
                    <p className="text-sm font-medium text-white">
                      {user?.username}
                    </p>
                    <p className="text-xs text-white/70">{getUserRoleText()}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/my-bookings")}
                    className="hover:bg-white/10 cursor-pointer text-white transition-all duration-200 rounded-lg px-3 py-2 focus:bg-white/10 focus:text-white"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t.nav.myBookings}
                  </DropdownMenuItem>
                  {user?.role === "CUSTOMER" && (
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = "/boat-owner-application")
                      }
                      className="hover:bg-white/10 cursor-pointer text-white transition-all duration-200 rounded-lg px-3 py-2 focus:bg-white/10 focus:text-white"
                    >
                      <Ship className="mr-2 h-4 w-4" />
                      {t.nav.boatOwnerApplication}
                    </DropdownMenuItem>
                  )}
                  {user?.role === "BOAT_OWNER" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/captain")}
                      className="hover:bg-white/10 cursor-pointer text-white transition-all duration-200 rounded-lg px-3 py-2 focus:bg-white/10 focus:text-white"
                    >
                      <Anchor className="mr-2 h-4 w-4" />
                      {t.nav.captainPanel}
                    </DropdownMenuItem>
                  )}
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/admin")}
                      className="hover:bg-white/10 cursor-pointer text-white transition-all duration-200"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {t.nav.adminPanel}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-red-500/20 cursor-pointer text-red-300 hover:text-red-200 transition-all duration-200"
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
