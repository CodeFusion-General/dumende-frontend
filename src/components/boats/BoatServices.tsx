import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Package, Star, ChefHat } from "lucide-react";
import { BoatServiceDTO, ServiceType, SERVICE_TYPE_LABELS } from "@/types/boat.types";

interface BoatServicesProps {
  services: BoatServiceDTO[];
}

const getServiceIcon = (serviceType: ServiceType) => {
  switch (serviceType) {
    case ServiceType.FOOD:
      return <Utensils className="h-5 w-5" />;
    case ServiceType.PACKAGE:
      return <Package className="h-5 w-5" />;
    case ServiceType.EXTRA:
      return <Star className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const getServiceTypeLabel = (serviceType: ServiceType) => {
  // Use the standardized labels from SERVICE_TYPE_LABELS
  return SERVICE_TYPE_LABELS[serviceType]?.tr || "Hizmet";
};

const getServiceTypeColor = (serviceType: ServiceType) => {
  switch (serviceType) {
    case ServiceType.FOOD:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case ServiceType.PACKAGE:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case ServiceType.EXTRA:
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function BoatServices({ services }: BoatServicesProps) {
  if (!services || services.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Ek Hizmetler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Bu tekne için ek hizmet bilgisi bulunmuyor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group services by type
  const groupedServices = services.reduce((groups, service) => {
    const type = service.serviceType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(service);
    return groups;
  }, {} as Record<ServiceType, BoatServiceDTO[]>);

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
          Ek Hizmetler
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Bu teknede mevcut olan ek hizmetler
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedServices).map(([serviceType, serviceList]) => (
          <div key={serviceType}>
            {/* Service Type Header */}
            <div className="flex items-center gap-2 mb-4">
              {getServiceIcon(serviceType as ServiceType)}
              <Badge 
                variant="outline" 
                className={`${getServiceTypeColor(serviceType as ServiceType)} font-medium`}
              >
                {getServiceTypeLabel(serviceType as ServiceType)}
              </Badge>
            </div>
            
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceList.map((service, index) => (
                <div 
                  key={`${serviceType}-${service.id}-${index}`} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50/50 to-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">
                      {service.name}
                    </h4>
                    <div className="text-right ml-4">
                      <span className="text-lg font-bold text-primary">
                        ₺{service.price.toLocaleString()}
                      </span>
                      {service.serviceType === ServiceType.FOOD && (
                        <span className="text-sm text-gray-500 block">
                          /adet
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  
                  {/* Service Features */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {service.serviceType === ServiceType.FOOD 
                        ? "Miktar seçilebilir" 
                        : "Tek seçim"}
                    </div>
                    
                    {service.serviceType === ServiceType.FOOD && service.quantity > 1 && (
                      <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        Varsayılan: {service.quantity} adet
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">ℹ</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Ek hizmetler hakkında:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Bu hizmetler rezervasyon sırasında seçilebilir</li>
                <li>Fiyatlar rezervasyon tarihine göre değişebilir</li>
                <li>Yemek hizmetleri için miktar belirleyebilirsiniz</li>
                <li>Paket ve ekstra hizmetler sabit fiyatlıdır</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
