import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const BlogPreview = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t.home.blog.title}
            </h2>
            <p className="text-gray-600">
              {t.home.blog.subtitle}
            </p>
          </div>
          <Link
            to="/blog"
            className="flex items-center space-x-2 text-primary font-medium mt-4 md:mt-0 group"
          >
            <span>{t.home.blog.viewAll}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="text-center py-16">
          <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t.home.blog.comingSoon}
            </h3>
            <p className="text-gray-600 text-sm">
              {t.home.blog.comingSoonDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;
