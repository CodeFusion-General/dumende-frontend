import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Utensils, Package, Star } from "lucide-react";
import { BoatServiceDTO, ServiceType } from "@/types/boat.types";
import { SelectedServiceDTO } from "@/types/booking.types";
import { boatService } from "@/services/boatService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

interface ServiceSelectorProps {
  boatId: number;
  selectedServices: SelectedServiceDTO[];
  onServicesChange: (services: SelectedServiceDTO[]) => void;
  onPriceChange: (totalServicesPrice: number) => void;
}

const getServiceIcon = (serviceType: ServiceType) => {
  switch (serviceType) {
    case ServiceType.FOOD:
      return <Utensils className="h-4 w-4" />;
    case ServiceType.PACKAGE:
      return <Package className="h-4 w-4" />;
    case ServiceType.EXTRA:
      return <Star className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getServiceTypeLabel = (serviceType: ServiceType) => {
  switch (serviceType) {
    case ServiceType.FOOD:
      return "Yemek";
    case ServiceType.PACKAGE:
      return "Paket";
    case ServiceType.EXTRA:
      return "Ekstra";
    default:
      return "Hizmet";
  }
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

export default function ServiceSelector({ 
  boatId, 
  selectedServices, 
  onServicesChange, 
  onPriceChange 
}: ServiceSelectorProps) {
  const [availableServices, setAvailableServices] = useState<BoatServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available services
  useEffect(() => {
    const loadServices = async () => {
      if (!boatId) return;

      setLoading(true);
      setError(null);
      
      try {
        const services = await boatService.getBoatServicesWithPricing(boatId);
        setAvailableServices(services);
      } catch (err) {
        console.error("Failed to load boat services:", err);
        setError("Hizmetler yüklenirken hata oluştu");
        toast({
          title: "Hata",
          description: "Hizmetler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [boatId]);

  // Calculate total services price whenever selected services change
  useEffect(() => {
    const totalPrice = selectedServices.reduce((total, selected) => {
      const service = availableServices.find(s => s.id === selected.boatServiceId);
      if (!service) return total;
      
      const serviceTotal = service.serviceType === ServiceType.FOOD 
        ? service.price * selected.quantity
        : service.price;
      
      return total + serviceTotal;
    }, 0);

    onPriceChange(totalPrice);
  }, [selectedServices, availableServices, onPriceChange]);

  // Get quantity for a specific service
  const getServiceQuantity = (serviceId: number): number => {
    const selected = selectedServices.find(s => s.boatServiceId === serviceId);
    return selected?.quantity || 0;
  };

  // Update service quantity
  const updateServiceQuantity = (serviceId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove service if quantity is 0 or less
      const updatedServices = selectedServices.filter(s => s.boatServiceId !== serviceId);
      onServicesChange(updatedServices);
    } else {
      // Update or add service
      const existingIndex = selectedServices.findIndex(s => s.boatServiceId === serviceId);
      
      if (existingIndex >= 0) {
        // Update existing service
        const updatedServices = [...selectedServices];
        updatedServices[existingIndex] = { boatServiceId: serviceId, quantity: newQuantity };
        onServicesChange(updatedServices);
      } else {
        // Add new service
        const updatedServices = [...selectedServices, { boatServiceId: serviceId, quantity: newQuantity }];
        onServicesChange(updatedServices);
      }
    }
  };

  // Increase service quantity
  const increaseQuantity = (service: BoatServiceDTO) => {
    const currentQuantity = getServiceQuantity(service.id);
    const maxQuantity = service.serviceType === ServiceType.FOOD ? 10 : 1;
    
    if (currentQuantity < maxQuantity) {
      updateServiceQuantity(service.id, currentQuantity + 1);
    }
  };

  // Decrease service quantity
  const decreaseQuantity = (service: BoatServiceDTO) => {
    const currentQuantity = getServiceQuantity(service.id);
    if (currentQuantity > 0) {
      updateServiceQuantity(service.id, currentQuantity - 1);
    }
  };

  // Group services by type
  const groupedServices = availableServices.reduce((groups, service) => {
    const type = service.serviceType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(service);
    return groups;
  }, {} as Record<ServiceType, BoatServiceDTO[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ek Hizmetler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ek Hizmetler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ek Hizmetler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Bu tekne için ek hizmet bulunmuyor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ek Hizmetler
        </CardTitle>
        <p className="text-sm text-gray-600">
          İsteğe bağlı hizmetleri seçin
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedServices).map(([serviceType, services]) => (
          <div key={serviceType}>
            <div className="flex items-center gap-2 mb-3">
              {getServiceIcon(serviceType as ServiceType)}
              <Badge variant="outline" className={getServiceTypeColor(serviceType as ServiceType)}>
                {getServiceTypeLabel(serviceType as ServiceType)}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {services.map((service) => {
                const quantity = getServiceQuantity(service.id);
                const isSelected = quantity > 0;
                const canIncrease = service.serviceType === ServiceType.FOOD ? quantity < 10 : quantity < 1;
                const serviceTotal = service.serviceType === ServiceType.FOOD 
                  ? service.price * Math.max(1, quantity)
                  : service.price;

                return (
                  <div 
                    key={service.id} 
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-primary">
                              ₺{service.price.toLocaleString()}
                            </span>
                            {service.serviceType === ServiceType.FOOD && (
                              <span className="text-sm text-gray-500 ml-1">/adet</span>
                            )}
                          </div>
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        )}
                        
                        {isSelected && (
                          <div className="text-sm font-medium text-primary">
                            Toplam: ₺{serviceTotal.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500">
                        {service.serviceType === ServiceType.FOOD 
                          ? "Miktar seçebilirsiniz" 
                          : "Tek seçim"}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decreaseQuantity(service)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {isSelected && (
                          <span className="mx-2 font-medium min-w-[20px] text-center">
                            {quantity}
                          </span>
                        )}
                        
                        <Button
                          variant={isSelected ? "outline" : "default"}
                          size="sm"
                          onClick={() => increaseQuantity(service)}
                          disabled={!canIncrease}
                          className={isSelected ? "h-8 w-8 p-0" : ""}
                        >
                          {isSelected ? (
                            <Plus className="h-4 w-4" />
                          ) : (
                            "Seç"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {selectedServices.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Yukarıdaki hizmetlerden istediğinizi seçebilirsiniz
          </div>
        )}
      </CardContent>
    </Card>
  );
}
