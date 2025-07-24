import React, { useState } from "react";
import ServiceCard from "./ServiceCard";
import ServiceModal from "./ServiceModal";
import { useStaggeredClasses } from "@/hooks/useStaggeredAnimation";
import {
  Anchor,
  Compass,
  Cake,
  Briefcase,
  Fish,
  Users,
  Utensils,
  Droplet,
} from "lucide-react";

const services = [
  {
    id: 1,
    title: "Yat ve Tekne Kiralama",
    description:
      "Günlük ve saatlik tekne kiralama hizmetimiz ile İstanbul Boğazı'nın eşsiz manzarasını keşfedin. Lüks teknelerimiz ile unutulmaz anlar yaşayın.",
    icon: Anchor,
    color: "bg-primary/10 text-primary",
    link: "/services/boat-rental",
  },
  {
    id: 2,
    title: "Özel Tur Organizasyonları",
    description:
      "Size özel planlanan boğaz turları ve yat gezileri ile İstanbul'un tadını çıkarın. Profesyonel ekibimiz ile keyifli bir gün geçirin.",
    icon: Compass,
    color: "bg-secondary/10 text-secondary",
    link: "/services/private-tours",
  },
  {
    id: 3,
    title: "Özel Gün Kutlamaları",
    description:
      "Doğum günü, yıldönümü, evlilik teklifi gibi özel günlerinizi teknede kutlayın. Size özel hazırlanan organizasyonlar ile misafirlerinizi ağırlayın.",
    icon: Cake,
    color: "bg-accent/10 text-accent-foreground",
    link: "/services/celebrations",
  },
  {
    id: 4,
    title: "Kurumsal Etkinlikler",
    description:
      "Şirket toplantıları, iş yemekleri ve kurumsal etkinlikleriniz için özel tekne kiralama hizmeti. Profesyonel ekibimiz ile organizasyonunuzu planlayın.",
    icon: Briefcase,
    color: "bg-primary/10 text-primary",
    link: "/services/corporate",
  },
  {
    id: 5,
    title: "Balık Avı Turları",
    description:
      "Deneyimli kaptanlarımız eşliğinde Marmara ve Boğaz'da balık avı turları. Tüm ekipmanlar teknemizde mevcuttur.",
    icon: Fish,
    color: "bg-secondary/10 text-secondary",
    link: "/services/fishing",
  },
  {
    id: 6,
    title: "Kaptan ve Personel",
    description:
      "Deneyimli kaptan ve personel hizmeti. Güvenli ve konforlu bir deniz deneyimi için uzman ekibimiz yanınızda.",
    icon: Users,
    color: "bg-accent/10 text-accent-foreground",
    link: "/services/crew",
  },
  {
    id: 7,
    title: "Catering Hizmetleri",
    description:
      "Teknede özel menü ve ikram servisi. Uzman şeflerimizin hazırladığı lezzetli menüler ile deniz keyfinizi taçlandırın.",
    icon: Utensils,
    color: "bg-primary/10 text-primary",
    link: "/services/catering",
  },
  {
    id: 8,
    title: "Su Sporları",
    description:
      "Jet ski, wakeboard, su kayağı gibi su sporları ekipmanları kiralama ve aktivite organizasyonu hizmetleri.",
    icon: Droplet,
    color: "bg-secondary/10 text-secondary",
    link: "/services/water-sports",
  },
];

const ServiceList = () => {
  const [selectedService, setSelectedService] = useState<null | {
    title: string;
    description: string;
    icon: any;
    color: string;
  }>(null);

  const { getStaggeredStyle } = useStaggeredClasses(services.length, 120);

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
    <section className="py-16 px-4 bg-gradient-deep-sea relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/20" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-blue-400/5 to-transparent rounded-full blur-xl" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Denizde size özel, profesyonel ve kaliteli hizmetler sunuyoruz.
            İhtiyacınıza uygun çözümler için bizimle iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="animate-fade-in-up opacity-0"
              style={getStaggeredStyle(index)}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                Icon={service.icon}
                color={service.color}
                link={service.link}
                onClick={() => openServiceModal(service)}
              />
            </div>
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
