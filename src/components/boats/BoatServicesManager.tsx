import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Utensils,
  Package,
  Star,
  Save,
  X,
  Calculator,
} from "lucide-react";
import { ServiceType, SERVICE_TYPE_LABELS } from "@/types/boat.types";

interface BoatService {
  name: string;
  description: string;
  price: number;
  serviceType: ServiceType;
  quantity: number;
}

interface BoatServicesManagerProps {
  services: BoatService[];
  onServicesChange: (services: BoatService[]) => void;
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

const BoatServicesManager: React.FC<BoatServicesManagerProps> = ({
  services,
  onServicesChange,
}) => {
  const { t, i18n } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<BoatService>({
    name: "",
    description: "",
    price: 0,
    serviceType: ServiceType.FOOD,
    quantity: 1,
  });

  // Get service type labels based on current language
  const getServiceTypeLabels = useCallback(() => {
    const currentLang = i18n.language === "tr" ? "tr" : "en";
    return Object.entries(SERVICE_TYPE_LABELS).reduce((acc, [key, value]) => {
      acc[key as ServiceType] = value[currentLang];
      return acc;
    }, {} as Record<ServiceType, string>);
  }, [i18n.language]);

  const serviceTypeLabels = getServiceTypeLabels();

  // Group services by service type
  const groupedServices = useMemo(() => {
    const groups: Record<ServiceType, BoatService[]> = {
      [ServiceType.FOOD]: [],
      [ServiceType.PACKAGE]: [],
      [ServiceType.EXTRA]: [],
    };

    services.forEach((service) => {
      if (groups[service.serviceType]) {
        groups[service.serviceType].push(service);
      } else {
        groups[ServiceType.EXTRA].push(service);
      }
    });

    return groups;
  }, [services]);

  // Calculate total pricing for food services (price × quantity)
  const calculateServiceTotal = useCallback((service: BoatService) => {
    if (service.serviceType === ServiceType.FOOD) {
      return service.price * service.quantity;
    }
    return service.price;
  }, []);

  // Calculate total price for all services
  const totalPrice = useMemo(() => {
    return services.reduce((total, service) => {
      return total + calculateServiceTotal(service);
    }, 0);
  }, [services, calculateServiceTotal]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      serviceType: ServiceType.FOOD,
      quantity: 1,
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsAdding(false);
    setFormData({ ...services[index] });
  };

  const handleSave = () => {
    if (!formData.name.trim() || formData.price <= 0) {
      return;
    }

    let updatedServices = [...services];

    if (isAdding) {
      updatedServices.push({ ...formData });
    } else if (editingIndex !== null) {
      updatedServices[editingIndex] = { ...formData };
    }

    onServicesChange(updatedServices);
    setIsAdding(false);
    setEditingIndex(null);
    resetForm();
  };

  const handleDelete = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    onServicesChange(updatedServices);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    resetForm();
  };

  const isEditing = isAdding || editingIndex !== null;

  return (
    <div className="space-y-6">
      {/* Add New Service Button */}
      {!isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Hizmet Ekle
          </Button>
        </div>
      )}

      {/* Service Form */}
      {isEditing && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isAdding ? "Yeni Hizmet Ekle" : "Hizmet Düzenle"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hizmet Adı *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Örn: Balık Menüsü, DJ Hizmeti"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Hizmet Tipi *
                </label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, serviceType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(serviceTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(key as ServiceType)}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fiyat (₺) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("services.quantity", "Quantity")}
                  {formData.serviceType === ServiceType.FOOD && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({t("services.foodQuantityNote", "affects total price")})
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 1,
                    }))
                  }
                />
                {formData.serviceType === ServiceType.FOOD &&
                  formData.price > 0 &&
                  formData.quantity > 1 && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Calculator className="h-3 w-3" />
                      {t("services.totalPrice", "Total")}: ₺
                      {(formData.price * formData.quantity).toLocaleString()}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Hizmet hakkında detaylı bilgi..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List - Grouped by Service Type */}
      {services.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t("services.addedServices", "Added Services")} ({services.length}
              )
            </h3>
            {totalPrice > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {t("services.totalValue", "Total Value")}
                </p>
                <p className="text-xl font-bold text-primary">
                  ₺{totalPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {Object.entries(groupedServices).map(([serviceType, serviceList]) => {
            if (serviceList.length === 0) return null;

            const typeKey = serviceType as ServiceType;
            const typeLabel = serviceTypeLabels[typeKey];
            const typeTotal = serviceList.reduce(
              (sum, service) => sum + calculateServiceTotal(service),
              0
            );

            return (
              <div key={serviceType} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(typeKey)}
                    <h4 className="font-medium text-gray-900">{typeLabel}</h4>
                    <Badge
                      variant="outline"
                      className={getServiceTypeColor(typeKey)}
                    >
                      {serviceList.length}
                    </Badge>
                  </div>
                  {typeTotal > 0 && (
                    <span className="text-sm font-medium text-gray-700">
                      ₺{typeTotal.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 ml-6">
                  {serviceList.map((service, serviceIndex) => {
                    const originalIndex = services.findIndex(
                      (s) => s === service
                    );
                    const serviceTotal = calculateServiceTotal(service);

                    return (
                      <Card
                        key={originalIndex}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900">
                                  {service.name}
                                </h5>
                              </div>

                              {service.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {service.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium text-primary">
                                  ₺{service.price.toLocaleString()}
                                  {service.serviceType === ServiceType.FOOD &&
                                    service.quantity > 1 && (
                                      <span className="text-gray-500 ml-1">
                                        × {service.quantity}
                                      </span>
                                    )}
                                </span>
                                {service.serviceType === ServiceType.FOOD &&
                                  service.quantity > 1 && (
                                    <span className="font-medium text-green-600">
                                      = ₺{serviceTotal.toLocaleString()}
                                    </span>
                                  )}
                                {service.serviceType !== ServiceType.FOOD &&
                                  service.quantity > 1 && (
                                    <span className="text-gray-500">
                                      {t("services.quantity", "Quantity")}:{" "}
                                      {service.quantity}
                                    </span>
                                  )}
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(originalIndex)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(originalIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {services.length === 0 && !isEditing && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Utensils className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Henüz hizmet eklenmemiş
            </h3>
            <p className="text-gray-500 mb-4">
              Tekneniz için ek hizmetler ekleyerek müşterilerinize daha fazla
              seçenek sunabilirsiniz.
            </p>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              İlk Hizmetinizi Ekleyin
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BoatServicesManager;
