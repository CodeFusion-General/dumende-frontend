
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Globe, Anchor, LogOut, Ship, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/locales/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from '@/components/auth/AuthDialog';

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
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarStyle = isHomePage
    ? isScrolled 
      ? 'bg-primary/90 backdrop-blur-sm shadow-md py-2' 
      : 'bg-transparent py-4'
    : isScrolled
      ? 'bg-primary/90 backdrop-blur-sm shadow-md py-2'
      : 'bg-primary/90 backdrop-blur-sm shadow-md py-4';
  
  const t = translations[language];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const getUserRoleText = () => {
    if (!user) return '';
    switch (user.role) {
      case 'CUSTOMER':
        return 'Müşteri';
      case 'BOAT_OWNER':
        return 'Tekne Sahibi';
      case 'ADMIN':
        return 'Yönetici';
      default:
        return '';
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${navbarStyle}`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Anchor className="w-10 h-10 text-white" />
            <span className="font-bold text-xl text-white font-montserrat tracking-wide">
              Dumende
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { path: '/', label: t.nav.home },
              { path: '/boats', label: t.nav.boats },
              { path: '/services', label: t.nav.services },
              { path: '/about', label: t.nav.about },
              { path: '/contact', label: t.nav.contact },
              { path: '/blog', label: t.nav.blog }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-montserrat font-medium tracking-wide text-white hover:text-accent transition-colors
                  ${isActive(item.path) ? 'text-accent' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="text-white hover:text-accent p-2 rounded-full transition-colors"
              >
                <Globe size={24} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow-lg rounded-md border-none">
                <DropdownMenuItem 
                  onClick={() => setLanguage('tr')}
                  className="hover:bg-primary/10 cursor-pointer"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className="hover:bg-primary/10 cursor-pointer"
                >
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="text-white hover:text-accent p-2 rounded-full transition-colors"
                >
                  <User size={24} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white shadow-lg rounded-md border-none">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getUserRoleText()}
                    </p>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/my-bookings'}
                    className="hover:bg-primary/10 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Rezervasyonlarım
                  </DropdownMenuItem>
                  {user?.role === 'CUSTOMER' && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/boat-owner-application'}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Ship className="mr-2 h-4 w-4" />
                      Tekne Sahibi Başvurusu
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'BOAT_OWNER' && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/captain'}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Anchor className="mr-2 h-4 w-4" />
                      Kaptan Paneli
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/admin'}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Paneli
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="hover:bg-primary/10 cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                className="text-white hover:text-accent p-2 rounded-full transition-colors"
                onClick={() => setIsAuthOpen(true)}
              >
                <User size={24} />
              </button>
            )}
            
            <AuthDialog
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
            />
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-white hover:text-accent p-2 rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-primary/95 backdrop-blur-sm shadow-lg animate-slide-in-right">
            <div className="flex flex-col py-4 space-y-2 px-6">
              {[
                { path: '/', label: t.nav.home },
                { path: '/boats', label: t.nav.boats },
                { path: '/services', label: t.nav.services },
                { path: '/about', label: t.nav.about },
                { path: '/contact', label: t.nav.contact },
                { path: '/blog', label: t.nav.blog }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`py-3 border-b border-white/20 font-montserrat font-medium tracking-wide text-white hover:text-accent transition-colors
                    ${isActive(item.path) ? 'text-accent' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="border-t border-white/20 pt-4">
                  <div className="text-white text-sm mb-2">
                    {user?.username} ({getUserRoleText()})
                  </div>
                  <Link 
                    to="/my-bookings"
                    className="py-2 block text-white hover:text-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Rezervasyonlarım
                  </Link>
                  {user?.role === 'CUSTOMER' && (
                    <Link 
                      to="/boat-owner-application"
                      className="py-2 block text-white hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Tekne Sahibi Başvurusu
                    </Link>
                  )}
                  {user?.role === 'BOAT_OWNER' && (
                    <Link 
                      to="/captain"
                      className="py-2 block text-white hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Kaptan Paneli
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link 
                      to="/admin"
                      className="py-2 block text-white hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Paneli
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="py-2 block text-red-300 hover:text-red-200 transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsAuthOpen(true);
                    setIsOpen(false);
                  }}
                  className="py-3 border-t border-white/20 text-white hover:text-accent transition-colors text-left"
                >
                  Giriş Yap / Hesap Oluştur
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
