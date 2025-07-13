
import React from 'react';
import { Anchor, Users, Phone, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const FeatureBox = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const features = [
    {
      icon: <Anchor className="w-10 h-10 text-accent" />,
      title: t.home.features.fleet.title,
      description: t.home.features.fleet.description,
    },
    {
      icon: <Users className="w-10 h-10 text-accent" />,
      title: t.home.features.crew.title,
      description: t.home.features.crew.description,
    },
    {
      icon: <Phone className="w-10 h-10 text-accent" />,
      title: t.home.features.support.title,
      description: t.home.features.support.description,
    },
    {
      icon: <CreditCard className="w-10 h-10 text-accent" />,
      title: t.home.features.payment.title,
      description: t.home.features.payment.description,
    },
  ];

  return (
    <div className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.home.features.title}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t.home.features.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-6 rounded-xl border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/about" className="btn-outline">
            {t.home.features.cta}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeatureBox;
