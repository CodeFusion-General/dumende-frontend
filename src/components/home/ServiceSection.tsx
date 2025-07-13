
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const services: ServiceItem[] = [
  {
    id: "evlilik-teklifi",
    title: "Yatta Evlilik Teklifi",
    description: "Boğazın ortasında ilanı aşk edin",
    image: "/lovable-uploads/6c94df1f-4cca-44d5-b9ca-42db12d219fe.png"
  },
  {
    id: "dogum-gunu",
    title: "Teknede Doğum Günü",
    description: "Yeni yaşınızı arkadaşlarınızla denizde kutlayın",
    image: "https://images.unsplash.com/photo-1519877593221-1f28583780b4"
  },
  {
    id: "dugun",
    title: "Teknede Düğün",
    description: "Dünya evine harika bir teknede girin",
    image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3"
  },
  {
    id: "iftar",
    title: "Teknede İftar",
    description: "Ramazan ayı bereketini denizin üzerinde yaşayın",
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f"
  }
];

const ServiceSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  
  const handleServiceClick = (serviceId: string) => {
    navigate(`/boats?service=${serviceId}`);
  };
  
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t.home.services.title}</h2>
            <p className="text-muted-foreground">
              {t.home.services.subtitle}
            </p>
          </div>
          <Link 
            to="/services" 
            className="text-primary hover:text-primary/80 font-medium"
          >
            {t.home.services.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              onClick={() => handleServiceClick(service.id)}
              className="cursor-pointer"
            >
              <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
