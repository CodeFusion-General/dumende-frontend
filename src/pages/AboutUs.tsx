
import React from 'react';
import Layout from '../components/layout/Layout';
import { Users, Anchor, Award, Shell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const AboutUs = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Layout>
      <div className="container-custom py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">{t.pages.about.title}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.pages.about.subtitle}
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.pages.about.values.experiencedTeam.title}</h3>
            <p className="text-gray-600">{t.pages.about.values.experiencedTeam.description}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Anchor className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.pages.about.values.wideFleet.title}</h3>
            <p className="text-gray-600">{t.pages.about.values.wideFleet.description}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Award className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.pages.about.values.qualityAssurance.title}</h3>
            <p className="text-gray-600">{t.pages.about.values.qualityAssurance.description}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Shell className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.pages.about.values.specialExperience.title}</h3>
            <p className="text-gray-600">{t.pages.about.values.specialExperience.description}</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-secondary/5 rounded-2xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-primary">{t.pages.about.story.title}</h2>
            <div className="space-y-4 text-gray-600">
              {t.pages.about.story.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
