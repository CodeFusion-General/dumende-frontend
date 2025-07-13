import React from "react";
import { Link } from "react-router-dom";
import { Star, Users, Bed, Calendar, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

interface BoatCardProps {
  boat: any;
  viewMode: "grid" | "list";
}

export const BoatCard: React.FC<BoatCardProps> = ({ boat, viewMode }) => {
  if (viewMode === "grid") {
    return <BoatCardGrid boat={boat} />;
  }
  return <BoatCardList boat={boat} />;
};

const BoatCardGrid: React.FC<{ boat: any }> = ({ boat }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
      <div className="relative overflow-hidden h-60">
        <img
          src={boat.image}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-brand-accent text-brand-secondary font-medium text-sm py-1 px-3 rounded-full">
          {boat.type}
        </div>
        <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
          <Heart className="h-5 w-5 text-red-500" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-brand-secondary">
            {boat.name}
          </h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-brand-accent fill-brand-accent" />
            <span className="text-sm font-medium ml-1">{boat.rating}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({boat.reviewCount})
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-3">{boat.location}</div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{boat.capacity} {t.boats.card.person}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Bed className="h-4 w-4 mr-1" />
            <span>{boat.cabins} {t.boats.card.cabin}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {boat.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-brand-grey px-2 py-1 rounded text-gray-700"
            >
              {feature}
            </span>
          ))}
          {boat.features.length > 3 && (
            <span className="text-xs bg-brand-grey px-2 py-1 rounded text-gray-700">
              +{boat.features.length - 3}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg text-brand-primary">
              {boat.price.toLocaleString("tr-TR")} ₺
            </span>
            <span className="text-sm text-gray-500">/{boat.priceUnit}</span>
          </div>
          <Link to={`/tekne-detay/${boat.id}`}>
            <Button className="bg-brand-primary hover:bg-brand-secondary text-white">
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const BoatCardList: React.FC<{ boat: any }> = ({ boat }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl flex flex-col md:flex-row h-full">
      <div className="relative overflow-hidden md:w-1/3">
        <img
          src={boat.image}
          alt={boat.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-brand-accent text-brand-secondary font-medium text-sm py-1 px-3 rounded-full">
          {boat.type}
        </div>
        <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
          <Heart className="h-5 w-5 text-red-500" />
        </button>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-xl text-brand-secondary">
              {boat.name}
            </h3>
            <div className="text-sm text-gray-500 mb-2">{boat.location}</div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-brand-accent fill-brand-accent" />
            <span className="text-sm font-medium ml-1">{boat.rating}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({boat.reviewCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-brand-primary" />
            <span>{boat.capacity} Kişi</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Bed className="h-4 w-4 mr-2 text-brand-primary" />
            <span>{boat.cabins} Kabin</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-brand-primary" />
            <span>{boat.year}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {boat.features.map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-brand-grey px-2 py-1 rounded text-gray-700"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold text-xl text-brand-primary">
              {boat.price.toLocaleString("tr-TR")} ₺
            </span>
            <span className="text-sm text-gray-500">/{boat.priceUnit}</span>
          </div>
          <div className="flex space-x-2">
            <Link to={`/tekne-detay/${boat.id}`}>
              <Button
                variant="outline"
                className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
              >
                Detaylar
              </Button>
            </Link>
            <Link to={`/rezervasyon/${boat.id}`}>
              <Button className="bg-brand-primary hover:bg-brand-secondary text-white">
                Rezervasyon <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
