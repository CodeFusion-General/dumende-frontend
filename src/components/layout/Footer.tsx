
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-secondary text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="flex flex-col space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center">
              <div className="text-white font-bold text-xl sm:text-2xl font-montserrat">
                dümende<span className="text-accent">.com</span>
              </div>
            </Link>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {t.home.footer.description}
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="hover:text-accent transition-colors p-1">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors p-1">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors p-1">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors p-1">
                <Youtube size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-2 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">{t.home.footer.quickLinks}</h3>
            <Link to="/boats" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.boats}
            </Link>
            <Link to="/services" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.services}
            </Link>
            <Link to="/destinations" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.destinations}
            </Link>
            <Link to="/about" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.about}
            </Link>
            <Link to="/contact" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.contact}
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col space-y-2 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">{t.home.footer.legal}</h3>
            <Link to="/terms" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.termsOfService}
            </Link>
            <Link to="/privacy" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.privacyPolicy}
            </Link>
            <Link to="/gdpr" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.gdpr}
            </Link>
            <Link to="/cookies" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.cookies}
            </Link>
            <Link to="/cancellation" className="text-sm sm:text-base text-gray-300 hover:text-accent transition-colors py-1">
              {t.home.footer.cancellation}
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">{t.home.footer.contact}</h3>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <MapPin size={16} className="text-accent mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
              <div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Fenerbahçe Marina, Kadıköy, İstanbul, Türkiye
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Phone size={16} className="text-accent mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
              <div>
                <a href="tel:+902161234567" className="text-gray-300 text-xs sm:text-sm hover:text-accent transition-colors">
                  +90 216 123 45 67
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Mail size={16} className="text-accent mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
              <div>
                <a href="mailto:info@dumenden.com" className="text-gray-300 text-xs sm:text-sm hover:text-accent transition-colors break-all">
                  info@dumenden.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed px-4">
            © 2025 dümende.com. {t.home.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
