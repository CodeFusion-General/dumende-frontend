import React from 'react';
import Layout from '@/components/layout/Layout';
import ServiceHeader from '@/components/services/ServiceHeader';
import CategoryGrid from '@/components/services/CategoryGrid';
import OrganizationsSection from '@/components/services/OrganizationsSection';
import RequestForm from '@/components/services/RequestForm';
import { Anchor, Music, PartyPopper, Camera, Utensils, Plane, MapPin } from 'lucide-react';
import { ServiceCategory, BoatOrganization } from '@/components/services/types';

// Service data for boat organizations
const boatOrganizations: BoatOrganization[] = [
  {
    id: 1,
    title: "Doğum Günü Partisi",
    description: "Özel gününüzü teknede unutulmaz bir kutlamaya dönüştürün.",
    image: "/lovable-uploads/afb3acde-82b9-40ef-b5b7-9da1ff7fd543.png",
    icon: <PartyPopper className="h-5 w-5" />,
    category: "parti"
  },
  {
    id: 2,
    title: "Evlilik Teklifi",
    description: "Hayatınızın en önemli sorusunu sormak için romantik bir ortam.",
    image: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937",
    icon: <Anchor className="h-5 w-5" />,
    category: "romantik"
  },
  {
    id: 3,
    title: "Tekne Partisi",
    description: "Arkadaşlarınızla birlikte eğlenceli bir deniz partisi yapın.",
    image: "https://images.unsplash.com/photo-1519877593221-1f28583780b4",
    icon: <Music className="h-5 w-5" />,
    category: "parti"
  },
  {
    id: 4,
    title: "Sunset Cruise",
    description: "Muhteşem gün batımı manzarası eşliğinde deniz keyfi.",
    image: "https://images.unsplash.com/photo-1439886183900-e79ec0057170",
    icon: <MapPin className="h-5 w-5" />,
    category: "tur"
  },
  {
    id: 5,
    title: "Fotoğraf Çekimi",
    description: "Profesyonel fotoğraf çekimi ile anılarınızı ölümsüzleştirin.",
    image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac",
    icon: <Camera className="h-5 w-5" />,
    category: "özel"
  },
  {
    id: 6,
    title: "Kurumsal Etkinlik",
    description: "Şirket toplantıları ve etkinlikler için özel tekne organizasyonu.",
    image: "https://images.unsplash.com/photo-1441057206919-63d19fac2369",
    icon: <Anchor className="h-5 w-5" />,
    category: "kurumsal"
  },
  {
    id: 7,
    title: "Özel Catering",
    description: "Denizde lezzetli yemekler ve içecekler eşliğinde keyifli zaman.",
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
    icon: <Utensils className="h-5 w-5" />,
    category: "yemek"
  },
  {
    id: 8,
    title: "VIP Transfer",
    description: "Lüks tekneler ile özel transfer hizmeti.",
    image: "https://images.unsplash.com/photo-1438565434616-3ef039228b15",
    icon: <Plane className="h-5 w-5" />,
    category: "transfer"
  },
  {
    id: 9,
    title: "Bekarlığa Veda",
    description: "Unutulmaz bir bekarlığa veda partisi için ideal seçim.",
    image: "https://images.unsplash.com/photo-1501286353178-1ec871bba4d8",
    icon: <PartyPopper className="h-5 w-5" />,
    category: "parti"
  },
  {
    id: 10,
    title: "Tekne Düğünü",
    description: "Hayalinizdeki deniz düğünü için özel tasarlanmış paketler.",
    image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3",
    icon: <PartyPopper className="h-5 w-5" />,
    category: "düğün"
  },
  {
    id: 11,
    title: "Özel Tur",
    description: "Koylar ve adalar arasında özel tur programları.",
    image: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2",
    icon: <MapPin className="h-5 w-5" />,
    category: "tur"
  },
  {
    id: 12,
    title: "Yüzme & Dalış Turu",
    description: "Berrak sularda yüzme ve dalış deneyimi yaşayın.",
    image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
    icon: <Anchor className="h-5 w-5" />,
    category: "aktivite"
  }
];

// Main services categories
const serviceCategories: ServiceCategory[] = [
  {
    id: "tekne-kiralama",
    title: "Tekne Kiralama",
    description: "Günlük, haftalık veya saatlik tekne kiralama hizmetleri",
    icon: <Anchor className="h-6 w-6" />
  },
  {
    id: "organizasyonlar",
    title: "Tekne Organizasyonları",
    description: "Doğum günü, evlilik teklifi, parti ve özel etkinlikler",
    icon: <PartyPopper className="h-6 w-6" />
  },
  {
    id: "turlar",
    title: "Özel Turlar",
    description: "Keşfedilmemiş koylar ve adalara özel turlar",
    icon: <MapPin className="h-6 w-6" />
  },
  {
    id: "catering",
    title: "Catering Hizmetleri",
    description: "Teknede lezzetli yemek ve ikram hizmetleri",
    icon: <Utensils className="h-6 w-6" />
  }
];

const Services = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  return (
    <Layout>
      <div className="container-custom my-12">
        <ServiceHeader />
        <CategoryGrid categories={serviceCategories} />
        <OrganizationsSection 
          organizations={boatOrganizations}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        <RequestForm />
      </div>
    </Layout>
  );
};

export default Services;
