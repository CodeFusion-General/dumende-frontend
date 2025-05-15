
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Globe, Anchor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  
  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${navbarStyle}`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Anchor className="w-8 h-8 text-accent" />
          <div className="font-bold text-xl md:text-2xl font-montserrat tracking-wide text-white">
            dümende<span className="text-accent">.com</span>
          </div>
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
              className={`relative font-montserrat font-semibold tracking-wide text-white/90 hover:text-accent transition-colors py-1
                ${isActive(item.path) ? 'active-nav-item' : ''}`}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent transform origin-bottom-right"></span>
              )}
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

          <button 
            className="text-white hover:text-accent p-2 rounded-full transition-colors"
            onClick={() => setIsAuthOpen(true)}
          >
            <User size={24} />
          </button>
          
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
