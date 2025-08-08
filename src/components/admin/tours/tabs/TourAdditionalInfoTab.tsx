import React, { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Users,
  Package,
  Heart,
  Shield,
  Sparkles,
  Plus,
  X,
  Tag,
  Coffee,
  Utensils,
  Camera,
  Waves,
  Mountain,
  Sunset
} from 'lucide-react';

interface TourAdditionalInfoData {
  included: string;
  requirements: string;
  notAllowed: string;
  notSuitableFor: string;
  features?: string[];
}

interface TourAdditionalInfoTabProps {
  data: TourAdditionalInfoData;
  onChange: (data: Partial<TourAdditionalInfoData>) => void;
}

const TourAdditionalInfoTab: React.FC<TourAdditionalInfoTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });

  const [featureInput, setFeatureInput] = useState('');

  // Predefined feature suggestions
  const featureSuggestions = [
    { id: 'SWIMMING', label: 'Yüzme', icon: <Waves className="h-4 w-4" /> },
    { id: 'SNORKELING', label: 'Şnorkeling', icon: <Waves className="h-4 w-4" /> },
    { id: 'FISHING', label: 'Balık Tutma', icon: <Package className="h-4 w-4" /> },
    { id: 'PHOTOGRAPHY', label: 'Fotoğrafçılık', icon: <Camera className="h-4 w-4" /> },
    { id: 'LOCAL_CUISINE', label: 'Yerel Mutfak', icon: <Utensils className="h-4 w-4" /> },
    { id: 'SUNSET_TOUR', label: 'Günbatımı Turu', icon: <Sunset className="h-4 w-4" /> },
    { id: 'FAMILY_FRIENDLY', label: 'Aile Dostu', icon: <Users className="h-4 w-4" /> },
    { id: 'ROMANTIC', label: 'Romantik', icon: <Heart className="h-4 w-4" /> },
    { id: 'ADVENTURE', label: 'Macera', icon: <Mountain className="h-4 w-4" /> },
    { id: 'RELAXATION', label: 'Dinlenme', icon: <Coffee className="h-4 w-4" /> },
  ];

  const addFeature = (feature: string) => {
    if (feature && !(data.features || []).includes(feature)) {
      onChange({ features: [...(data.features || []), feature] });
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    onChange({ 
      features: (data.features || []).filter(f => f !== feature) 
    });
  };

  const handleFeatureInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim().toUpperCase().replace(/\s+/g, '_');
      if (value) {
        addFeature(value);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#15847c] to-[#0e5c56] rounded-2xl opacity-10"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#15847c] rounded-lg">
              <Info className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Ek Bilgiler</h2>
          </div>
          <p className="text-gray-600 ml-11">
            Turunuz hakkında detaylı bilgiler verin. Bu bilgiler müşterilerinizin doğru beklentiler oluşturmasına yardımcı olur.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <div className="space-y-6">
          {/* Features Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#15847c]" />
                Tur Özellikleri
              </FormLabel>
              <p className="text-sm text-gray-600 mb-6">
                Turunuzun öne çıkan özelliklerini etiketler halinde ekleyin. Bu, müşterilerin turunuzu daha kolay bulmasını sağlar.
              </p>
              
              {/* Selected Features */}
              {(data.features || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {(data.features || []).map((feature, idx) => {
                    const suggestion = featureSuggestions.find(s => s.id === feature);
                    return (
                      <Badge 
                        key={idx} 
                        className="bg-[#15847c]/10 text-[#15847c] border-[#15847c] px-3 py-1.5 flex items-center gap-2 hover:bg-[#15847c]/20 transition-colors"
                      >
                        {suggestion?.icon || <Tag className="h-3 w-3" />}
                        <span>{suggestion?.label || feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              
              {/* Feature Input */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Özel özellik ekleyin (örn: PRIVATE_TOUR)"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureInputKeyDown}
                    className="flex-1 h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const value = featureInput.trim().toUpperCase().replace(/\s+/g, '_');
                      if (value) addFeature(value);
                    }}
                    className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </Button>
                </div>
                
                {/* Suggested Features */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Hızlı seçim:</p>
                  <div className="flex flex-wrap gap-2">
                    {featureSuggestions
                      .filter(s => !(data.features || []).includes(s.id))
                      .map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addFeature(suggestion.id)}
                          className="hover:bg-[#15847c] hover:text-white hover:border-[#15847c] transition-all"
                        >
                          {suggestion.icon}
                          <span className="ml-1">{suggestion.label}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Included Services Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="included"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Neler Dahil?
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-4">
                    Tur fiyatına dahil olan hizmetleri ve ekipmanları belirtin. Detaylı bilgi müşteri güvenini artırır.
                  </p>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Örn:&#10;✓ Öğle yemeği (ızgara balık, salata, meyve)&#10;✓ Alkolsüz içecekler (su, kola, meyve suyu)&#10;✓ Şnorkel ekipmanı&#10;✓ Can yeleği&#10;✓ Havlu servisi&#10;✓ Müzik sistemi&#10;✓ Deneyimli kaptan ve mürettebat" 
                        value={data.included}
                        onChange={(e) => onChange({ included: e.target.value })}
                        rows={6}
                        className="border-2 hover:border-green-500 focus:border-green-500 transition-colors resize-none"
                      />
                      <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-green-500 opacity-20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Requirements Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Müşterinin Bilmesi Gerekenler
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-4">
                    Tura katılacak kişilerin önceden bilmesi gereken önemli hususları ve yanlarında getirmeleri gerekenleri yazın.
                  </p>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Örn:&#10;• Yüzme bilmek zorunlu değildir (can yeleği sağlanır)&#10;• Güneş kremi ve şapka getirmenizi öneririz&#10;• Deniz tutması olanlar için ilaç almanızı tavsiye ederiz&#10;• Mayonuzu giyerek gelmeniz zaman kazandırır&#10;• Değerli eşyalarınız için su geçirmez kılıf getirin&#10;• Fotoğraf makinesi veya GoPro getirebilirsiniz" 
                        value={data.requirements}
                        onChange={(e) => onChange({ requirements: e.target.value })}
                        rows={6}
                        className="border-2 hover:border-amber-500 focus:border-amber-500 transition-colors resize-none"
                      />
                      <AlertCircle className="absolute top-3 right-3 h-5 w-5 text-amber-500 opacity-20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Not Allowed Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="notAllowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    İzin Verilmeyen Şeyler
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-4">
                    Tur sırasında izin verilmeyen davranışları ve getirilmemesi gereken eşyaları belirtin.
                  </p>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Örn:&#10;✗ Teknede sigara içmek yasaktır&#10;✗ Cam şişe ve cam eşya getirmeyiniz&#10;✗ Evcil hayvan kabul edilmemektedir&#10;✗ Yüksek sesli müzik çalınamaz&#10;✗ Denize çöp atmak kesinlikle yasaktır&#10;✗ Alkollü içecek getirilmesine izin verilmez" 
                        value={data.notAllowed}
                        onChange={(e) => onChange({ notAllowed: e.target.value })}
                        rows={6}
                        className="border-2 hover:border-red-500 focus:border-red-500 transition-colors resize-none"
                      />
                      <XCircle className="absolute top-3 right-3 h-5 w-5 text-red-500 opacity-20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Not Suitable For Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="notSuitableFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Kimler için uygun değil?
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-4">
                    Tura katılım için yaş sınırı, fiziksel gereksinimler veya sağlık kısıtlamaları varsa belirtin.
                  </p>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Örn:&#10;• 3 yaşından küçük çocuklar için uygun değildir&#10;• Hamile kadınlar için önerilmez&#10;• Ciddi kalp rahatsızlığı olanlar için uygun değildir&#10;• Hareket kısıtlılığı olan kişiler için uygun olmayabilir&#10;• Ciddi deniz tutması problemi olanlar için önerilmez" 
                        value={data.notSuitableFor}
                        onChange={(e) => onChange({ notSuitableFor: e.target.value })}
                        rows={5}
                        className="border-2 hover:border-purple-500 focus:border-purple-500 transition-colors resize-none"
                      />
                      <Users className="absolute top-3 right-3 h-5 w-5 text-purple-500 opacity-20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Güvenlik ve Şeffaflık</p>
                <p>Detaylı ve dürüst bilgi vermek, müşteri memnuniyetini artırır ve olumsuz yorumları önler. Tüm kısıtlamaları ve gereksinimleri açıkça belirtmek hem sizin hem de müşterilerinizin güvenliği için önemlidir.</p>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TourAdditionalInfoTab;