import React, { useState } from "react";
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
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Utensils, 
  Package, 
  Star,
  Save,
  X
} from "lucide-react";
import { ServiceType } from "@/types/boat.types";

interface BoatService {
  name: string;
  description: string;
  price: number;
  serviceType: string;
  quantity: number;
}

interface BoatServicesManagerProps {
  services: BoatService[];
  onServicesChange: (services: BoatService[]) => void;
}

const getServiceIcon = (serviceType: string) => {
  switch (serviceType) {
    case "FOOD":
      return <Utensils className="h-4 w-4" />;
    case "PACKAGE":
      return <Package className="h-4 w-4" />;
    case "EXTRA":
      return <Star className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getServiceTypeLabel = (serviceType: string) => {
  switch (serviceType) {
    case "FOOD":
      return "Yemek";
    case "PACKAGE":
      return "Paket";
    case "EXTRA":
      return "Ekstra";
    default:
      return "Hizmet";
  }
};

const getServiceTypeColor = (serviceType: string) => {
  switch (serviceType) {
    case "FOOD":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "PACKAGE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "EXTRA":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const BoatServicesManager: React.FC<BoatServicesManagerProps> = ({
  services,
  onServicesChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<BoatService>({
    name: "",
    description: "",
    price: 0,
    serviceType: "FOOD",
    quantity: 1,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      serviceType: "FOOD",
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
                    <SelectItem value="FOOD">Yemek</SelectItem>
                    <SelectItem value="PACKAGE">Paket</SelectItem>
                    <SelectItem value="EXTRA">Ekstra</SelectItem>
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
                  Varsayılan Miktar
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Açıklama
              </label>
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

      {/* Services List */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Eklenen Hizmetler</h3>
          <div className="grid grid-cols-1 gap-4">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getServiceIcon(service.serviceType)}
                        <h4 className="font-semibold text-gray-900">
                          {service.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getServiceTypeColor(service.serviceType)}
                        >
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-primary">
                          ₺{service.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500">
                          Miktar: {service.quantity}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              Tekneniz için ek hizmetler ekleyerek müşterilerinize daha fazla seçenek sunabilirsiniz.
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
