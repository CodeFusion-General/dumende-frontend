
import React from 'react';
import { Anchor, Users, Phone, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureBox = () => {
  const features = [
    {
      icon: <Anchor className="w-10 h-10 text-accent" />,
      title: "Geniş Tekne Filosu",
      description: "Her ihtiyaca uygun 100'den fazla tekne seçeneği sunuyoruz. Romantik bir gün batımı turu, aile tatili veya kurumsal etkinlikler için ideal teknelerimiz mevcut. Farklı bütçelere uygun seçeneklerimiz ile deniz keyfini herkes için erişilebilir kılıyoruz.",
    },
    {
      icon: <Users className="w-10 h-10 text-accent" />,
      title: "Profesyonel Kaptan ve Mürettebat",
      description: "Deneyimli ve sertifikalı kaptanlarımız ve mürettebatımız, denizde güvenliğinizi ve konforunuzu en üst düzeyde sağlar. Tüm ekibimiz, misafirperverliği ve profesyonelliği ile seyahatinizi unutulmaz kılmak için özenle seçilmiştir.",
    },
    {
      icon: <Phone className="w-10 h-10 text-accent" />,
      title: "7/24 Müşteri Desteği",
      description: "Rezervasyon sürecinizden seyahatinizin sonuna kadar, 7/24 müşteri destek ekibimiz yanınızda. Her türlü sorunuzda anında destek alabilir, kişiselleştirilmiş hizmet anlayışımızla kendinizi özel hissedebilirsiniz.",
    },
    {
      icon: <CreditCard className="w-10 h-10 text-accent" />,
      title: "Güvenli Ödeme",
      description: "En son teknoloji güvenlik sistemleri ile korunan ödeme altyapımız sayesinde, kredi kartı veya banka havalesi ile güvenle ödeme yapabilirsiniz. Şeffaf fiyatlandırma politikamız ile ekstra ücretlerle karşılaşmazsınız.",
    },
  ];

  return (
    <div className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Neden Bizi Tercih Etmelisiniz?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            dümende.com ile deniz keyfi bambaşka. Sektör liderliğimizin arkasındaki nedenler:
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
            Hakkımızda Daha Fazla Bilgi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeatureBox;
