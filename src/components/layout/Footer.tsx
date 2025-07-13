
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-secondary text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center">
              <div className="text-white font-bold text-2xl font-montserrat">
                dümende<span className="text-accent">.com</span>
              </div>
            </Link>
            <p className="mt-4 text-gray-300">
              {t.home.footer.description}
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold mb-4">{t.home.footer.quickLinks}</h3>
            <Link to="/boats" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.boats}
            </Link>
            <Link to="/services" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.services}
            </Link>
            <Link to="/destinations" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.destinations}
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.about}
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.contact}
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold mb-4">{t.home.footer.legal}</h3>
            <Link to="/terms" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.termsOfService}
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.privacyPolicy}
            </Link>
            <Link to="/gdpr" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.gdpr}
            </Link>
            <Link to="/cookies" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.cookies}
            </Link>
            <Link to="/cancellation" className="text-gray-300 hover:text-accent transition-colors">
              {t.home.footer.cancellation}
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold mb-4">{t.home.footer.contact}</h3>
            <div className="flex items-start space-x-3">
              <MapPin size={18} className="text-accent mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-300 text-sm">
                  Fenerbahçe Marina, Kadıköy, İstanbul, Türkiye
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone size={18} className="text-accent mt-1 flex-shrink-0" />
              <div>
                <a href="tel:+902161234567" className="text-gray-300 text-sm hover:text-accent transition-colors">
                  +90 216 123 45 67
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail size={18} className="text-accent mt-1 flex-shrink-0" />
              <div>
                <a href="mailto:info@dumenden.com" className="text-gray-300 text-sm hover:text-accent transition-colors">
                  info@dumenden.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 dümende.com. {t.home.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
