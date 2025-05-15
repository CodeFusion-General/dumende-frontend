
import React, { useState } from 'react';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import { Anchor, Compass, Cake, Briefcase, Fish, Users, Utensils, Droplet } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'Yat ve Tekne Kiralama',
    description: 'Günlük ve saatlik tekne kiralama hizmetimiz ile İstanbul Boğazı\'nın eşsiz manzarasını keşfedin. Lüks teknelerimiz ile unutulmaz anlar yaşayın.',
    icon: Anchor,
    color: 'bg-primary/10 text-primary',
    link: '/services/boat-rental'
  },
  {
    id: 2,
    title: 'Özel Tur Organizasyonları',
    description: 'Size özel planlanan boğaz turları ve yat gezileri ile İstanbul\'un tadını çıkarın. Profesyonel ekibimiz ile keyifli bir gün geçirin.',
    icon: Compass,
    color: 'bg-secondary/10 text-secondary',
    link: '/services/private-tours'
  },
  {
    id: 3,
    title: 'Özel Gün Kutlamaları',
    description: 'Doğum günü, yıldönümü, evlilik teklifi gibi özel günlerinizi teknede kutlayın. Size özel hazırlanan organizasyonlar ile misafirlerinizi ağırlayın.',
    icon: Cake,
    color: 'bg-accent/10 text-accent-foreground',
    link: '/services/celebrations'
  },
  {
    id: 4,
    title: 'Kurumsal Etkinlikler',
    description: 'Şirket toplantıları, iş yemekleri ve kurumsal etkinlikleriniz için özel tekne kiralama hizmeti. Profesyonel ekibimiz ile organizasyonunuzu planlayın.',
    icon: Briefcase,
    color: 'bg-primary/10 text-primary',
    link: '/services/corporate'
  },
  {
    id: 5,
    title: 'Balık Avı Turları',
    description: 'Deneyimli kaptanlarımız eşliğinde Marmara ve Boğaz\'da balık avı turları. Tüm ekipmanlar teknemizde mevcuttur.',
    icon: Fish,
    color: 'bg-secondary/10 text-secondary',
    link: '/services/fishing'
  },
  {
    id: 6,
    title: 'Kaptan ve Personel',
    description: 'Deneyimli kaptan ve personel hizmeti. Güvenli ve konforlu bir deniz deneyimi için uzman ekibimiz yanınızda.',
    icon: Users,
    color: 'bg-accent/10 text-accent-foreground',
    link: '/services/crew'
  },
  {
    id: 7,
    title: 'Catering Hizmetleri',
    description: 'Teknede özel menü ve ikram servisi. Uzman şeflerimizin hazırladığı lezzetli menüler ile deniz keyfinizi taçlandırın.',
    icon: Utensils,
    color: 'bg-primary/10 text-primary',
    link: '/services/catering'
  },
  {
    id: 8,
    title: 'Su Sporları',
    description: 'Jet ski, wakeboard, su kayağı gibi su sporları ekipmanları kiralama ve aktivite organizasyonu hizmetleri.',
    icon: Droplet,
    color: 'bg-secondary/10 text-secondary',
    link: '/services/water-sports'
  }
];

const ServiceList = () => {
  const [selectedService, setSelectedService] = useState<null | {
    title: string;
    description: string;
    icon: any;
    color: string;
  }>(null);

  const openServiceModal = (service: {
    title: string;
    description: string;
    icon: any;
    color: string;
  }) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };
  
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-center mb-4">Hizmetlerimiz</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Denizde size özel, profesyonel ve kaliteli hizmetler sunuyoruz. İhtiyacınıza uygun çözümler için bizimle iletişime geçin.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard 
              key={service.id} 
              title={service.title} 
              description={service.description} 
              Icon={service.icon}
              color={service.color}
              link={service.link}
              onClick={() => openServiceModal(service)}
            />
          ))}
        </div>
      </div>

      {selectedService && (
        <ServiceModal
          isOpen={!!selectedService}
          onClose={closeServiceModal}
          title={selectedService.title}
          description={selectedService.description}
          Icon={selectedService.icon}
          color={selectedService.color}
        />
      )}
    </section>
  );
};

export default ServiceList;
