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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mock Blog Post 1 */}
          <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
              <div className="text-white text-4xl">🛥️</div>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">15 Ağustos 2024</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tekne Kiralama Rehberi: İlk Kez Tekne Kiralayacaklar İçin
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Tekne kiralamak istiyorsunuz ama nereden başlayacağınızı bilmiyor musunuz? Bu rehber ile tekne kiralama sürecini öğrenin.
              </p>
              <Link to="/blog/tekne-kiralama-rehberi" className="text-primary font-medium text-sm hover:underline">
                Devamını Oku →
              </Link>
            </div>
          </article>

          {/* Mock Blog Post 2 */}
          <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center">
              <div className="text-white text-4xl">🌊</div>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">12 Ağustos 2024</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                İstanbul'un En Güzel Koyları: Tekne Turu Rotaları
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                İstanbul çevresindeki saklı cennetleri keşfedin. Tekne ile gidebileceğiniz en güzel koy ve plajları sizin için derledik.
              </p>
              <Link to="/blog/istanbul-koylari" className="text-primary font-medium text-sm hover:underline">
                Devamını Oku →
              </Link>
            </div>
          </article>

          {/* Mock Blog Post 3 */}
          <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="text-white text-4xl">⚓</div>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">8 Ağustos 2024</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tekne Güvenliği: Denizde Güvenli Seyir İpuçları
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Denizde güvenli bir yolculuk için bilmeniz gereken temel güvenlik kuralları ve ekipmanları hakkında bilgi alın.
              </p>
              <Link to="/blog/tekne-guvenligi" className="text-primary font-medium text-sm hover:underline">
                Devamını Oku →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;
