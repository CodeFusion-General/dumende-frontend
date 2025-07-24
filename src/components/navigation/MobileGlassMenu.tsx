import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, User, Ship, Anchor, Shield, LogOut, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/translations";

interface MobileGlassMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthOpen: () => void;
}

const MobileGlassMenu: React.FC<MobileGlassMenuProps> = ({
  isOpen,
  onClose,
  onAuthOpen,
}) => {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const t = translations[language];

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    onClose();
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

  const navigationItems = [
    { path: "/", label: t.nav.home },
    { path: "/boats", label: t.nav.boats },
    { path: "/services", label: t.nav.services },
    { path: "/about", label: t.nav.about },
    { path: "/contact", label: t.nav.contact },
    { path: "/blog", label: t.nav.blog },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Glass Backdrop */}
      <div
        className="absolute inset-0 glass-dark animate-fade-in-up"
        onClick={onClose}
      />

      {/* Full-screen Glass Menu */}
      <div className="relative h-full flex flex-col glass-modal mobile-menu-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white font-montserrat">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="glass-button p-3 rounded-xl text-white hover:text-accent transition-all duration-300 hover:scale-105 animate-ripple"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <nav className="space-y-2">
            {navigationItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  block px-6 py-4 rounded-2xl font-montserrat font-medium text-lg
                  mobile-nav-item haptic-feedback
                  transition-all duration-300 ease-glass animate-ripple
                  hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-lg hover:scale-105
                  ${
                    isActive(item.path)
                      ? "text-accent bg-white/15 backdrop-blur-sm shadow-md"
                      : "text-white hover:text-accent"
                  }
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Language Selector */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-white/70 text-sm font-medium mb-3 px-2">
              {language === "tr" ? "Dil" : "Language"}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setLanguage("tr")}
                className={`
                  flex-1 px-4 py-3 rounded-xl font-medium haptic-feedback
                  transition-all duration-300
                  ${
                    language === "tr"
                      ? "bg-white/15 text-accent backdrop-blur-sm shadow-md"
                      : "text-white hover:bg-white/10 hover:text-accent"
                  }
                `}
              >
                🇹🇷 Türkçe
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`
                  flex-1 px-4 py-3 rounded-xl font-medium haptic-feedback
                  transition-all duration-300
                  ${
                    language === "en"
                      ? "bg-white/15 text-accent backdrop-blur-sm shadow-md"
                      : "text-white hover:bg-white/10 hover:text-accent"
                  }
                `}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-6 border-t border-white/20">
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="glass-button px-4 py-3 rounded-xl">
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-white/70 text-sm">{getUserRoleText()}</p>
              </div>

              {/* User Menu Items */}
              <div className="space-y-2">
                <Link
                  to="/my-bookings"
                  className="flex items-center px-4 py-3 rounded-xl text-white hover:text-accent hover:bg-white/10 transition-all duration-300 haptic-feedback"
                  onClick={onClose}
                >
                  <User className="mr-3 h-5 w-5" />
                  {t.nav.myBookings}
                </Link>

                {user?.role === "CUSTOMER" && (
                  <Link
                    to="/boat-owner-application"
                    className="flex items-center px-4 py-3 rounded-xl text-white hover:text-accent hover:bg-white/10 transition-all duration-300 haptic-feedback"
                    onClick={onClose}
                  >
                    <Ship className="mr-3 h-5 w-5" />
                    {t.nav.boatOwnerApplication}
                  </Link>
                )}

                {user?.role === "BOAT_OWNER" && (
                  <Link
                    to="/captain"
                    className="flex items-center px-4 py-3 rounded-xl text-white hover:text-accent hover:bg-white/10 transition-all duration-300 haptic-feedback"
                    onClick={onClose}
                  >
                    <Anchor className="mr-3 h-5 w-5" />
                    {t.nav.captainPanel}
                  </Link>
                )}

                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 rounded-xl text-white hover:text-accent hover:bg-white/10 transition-all duration-300 haptic-feedback"
                    onClick={onClose}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    {t.nav.adminPanel}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-300 haptic-feedback"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  {t.nav.logout}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                onAuthOpen();
                onClose();
              }}
              className="w-full glass-button px-6 py-4 rounded-xl text-white hover:text-accent transition-all duration-300 hover:scale-105 font-medium"
            >
              {language === "tr"
                ? "Giriş Yap / Hesap Oluştur"
                : "Login / Sign Up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileGlassMenu;
