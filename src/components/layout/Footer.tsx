
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
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
              Denizde özgürlüğün adresi. Lüks, konfor ve güvenliği bir arada sunan tekne kiralama hizmetleri.
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
            <h3 className="text-lg font-bold mb-4">Hızlı Bağlantılar</h3>
            <Link to="/boats" className="text-gray-300 hover:text-accent transition-colors">
              Tekneler
            </Link>
            <Link to="/services" className="text-gray-300 hover:text-accent transition-colors">
              Hizmetler
            </Link>
            <Link to="/destinations" className="text-gray-300 hover:text-accent transition-colors">
              Destinasyonlar
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-accent transition-colors">
              Hakkımızda
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-accent transition-colors">
              İletişim
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold mb-4">Yasal</h3>
            <Link to="/terms" className="text-gray-300 hover:text-accent transition-colors">
              Kullanım Şartları
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-accent transition-colors">
              Gizlilik Politikası
            </Link>
            <Link to="/gdpr" className="text-gray-300 hover:text-accent transition-colors">
              GDPR Bildirimi
            </Link>
            <Link to="/cookies" className="text-gray-300 hover:text-accent transition-colors">
              Çerez Politikası
            </Link>
            <Link to="/cancellation" className="text-gray-300 hover:text-accent transition-colors">
              İptal ve İade Politikası
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold mb-4">İletişim</h3>
            <div className="flex items-start space-x-3">
              <MapPin size={20} className="mt-1 flex-shrink-0" />
              <p className="text-gray-300">
                Fenerbahçe Marina, Kadıköy, İstanbul, Türkiye
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={20} />
              <a href="tel:+902161234567" className="text-gray-300 hover:text-accent transition-colors">
                +90 216 123 45 67
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} />
              <a href="mailto:info@dumenden.com" className="text-gray-300 hover:text-accent transition-colors">
                info@dumenden.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} dümende.com. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
