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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPicker } from '@/components/common/MapPicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Map, 
  Info, 
  ChevronDown,
  Globe,
  Anchor,
  Search,
  CheckCircle
} from 'lucide-react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TourLocationData {
  region: string;
  routeDescription: string;
  locationDescription: string;
  coordinates: Coordinates;
}

interface TourLocationTabProps {
  data: TourLocationData;
  onChange: (data: Partial<TourLocationData>) => void;
}

const TourLocationTab: React.FC<TourLocationTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Türkiye tatil merkezleri (öneri listesi)
  const regions: Array<{ id: string; name: string; type: string }> = [
    { id: 'İstanbul', name: 'İstanbul', type: 'Şehir' },
    { id: 'Antalya', name: 'Antalya', type: 'Şehir' },
    { id: 'Alanya', name: 'Alanya', type: 'İlçe' },
    { id: 'Side', name: 'Side', type: 'Belde' },
    { id: 'Belek', name: 'Belek', type: 'Belde' },
    { id: 'Kemer', name: 'Kemer', type: 'İlçe' },
    { id: 'Çıralı', name: 'Çıralı', type: 'Belde' },
    { id: 'Kaş', name: 'Kaş', type: 'İlçe' },
    { id: 'Kalkan', name: 'Kalkan', type: 'Belde' },
    { id: 'Fethiye', name: 'Fethiye', type: 'İlçe' },
    { id: 'Göcek', name: 'Göcek', type: 'Belde' },
    { id: 'Marmaris', name: 'Marmaris', type: 'İlçe' },
    { id: 'Datça', name: 'Datça', type: 'İlçe' },
    { id: 'Bodrum', name: 'Bodrum', type: 'İlçe' },
    { id: 'Çeşme', name: 'Çeşme', type: 'İlçe' },
    { id: 'Alaçatı', name: 'Alaçatı', type: 'Mahalle' },
    { id: 'Kuşadası', name: 'Kuşadası', type: 'İlçe' },
    { id: 'Didim', name: 'Didim', type: 'İlçe' },
    { id: 'Ayvalık', name: 'Ayvalık', type: 'İlçe' },
    { id: 'Bozcaada', name: 'Bozcaada', type: 'Ada' },
  ];

  const filteredRegions = regions.filter(region => 
    region.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getRegionTypeColor = (type: string) => {
    switch(type) {
      case 'Şehir': return 'bg-blue-100 text-blue-700';
      case 'İlçe': return 'bg-green-100 text-green-700';
      case 'Belde': return 'bg-purple-100 text-purple-700';
      case 'Ada': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
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
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Rota ve Konum</h2>
          </div>
          <p className="text-gray-600 ml-11">
            Turunuzun başlangıç noktasını ve rotasını belirtin. Müşterilerinizin sizi kolayca bulabilmesi için detaylı bilgi verin.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <div className="space-y-6">
          {/* Region Selection Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-[#15847c]" />
                    Şehir / Bölge
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Search and Suggestions Box */}
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Şehir veya bölge arayın..."
                            value={searchValue || data.region}
                            onChange={(e) => {
                              setSearchValue(e.target.value);
                              onChange({ region: e.target.value });
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="pl-10 h-12 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                          />
                          <ChevronDown 
                            className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${
                              showSuggestions ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                            {filteredRegions.length > 0 ? (
                              <div className="p-1">
                                {filteredRegions.map((region) => (
                                  <button
                                    key={region.id}
                                    type="button"
                                    onClick={() => {
                                      onChange({ region: region.name });
                                      setSearchValue(region.name);
                                      setShowSuggestions(false);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-[#15847c]/10 rounded-md transition-colors group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 group-hover:text-[#15847c]" />
                                        <span className="font-medium">{region.name}</span>
                                      </div>
                                      <Badge className={`text-xs ${getRegionTypeColor(region.type)}`}>
                                        {region.type}
                                      </Badge>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <p className="mb-2">Sonuç bulunamadı</p>
                                <p className="text-xs">Enter tuşuna basarak "{searchValue}" ekleyin</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Popular Destinations */}
                      <div>
                        <p className="text-sm text-gray-600 mb-3">Popüler Destinasyonlar:</p>
                        <div className="flex flex-wrap gap-2">
                          {['Bodrum', 'Marmaris', 'Fethiye', 'Antalya', 'Çeşme'].map((dest) => (
                            <Button
                              key={dest}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onChange({ region: dest });
                                setSearchValue(dest);
                              }}
                              className="hover:bg-[#15847c] hover:text-white hover:border-[#15847c] transition-all"
                            >
                              {dest}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Route Description Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="routeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                    <Navigation className="h-4 w-4 text-[#15847c]" />
                    Tur Rotası
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-4">
                    Turunuzun rotasını detaylı olarak açıklayın. Hangi noktalara uğrayacağınızı belirtin.
                  </p>
                  <FormControl>
                    <Textarea 
                      placeholder="Örn: Marina'dan hareket edip, önce Kızılada'ya uğruyoruz. Burada 45 dakikalık yüzme molası veriyoruz. Sonrasında Akvaryum Koyu'na geçip öğle yemeği molası..." 
                      value={data.routeDescription}
                      onChange={(e) => onChange({ routeDescription: e.target.value })}
                      rows={5}
                      className="border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Meeting Point Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                    <Anchor className="h-4 w-4 text-[#15847c]" />
                    Buluşma Noktası
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-4">
                    Müşterilerinizle nerede buluşacağınızı ve kalkış yerinizi detaylı açıklayın.
                  </p>
                  <FormControl>
                    <Textarea 
                      placeholder="Örn: Bodrum Marina ana giriş kapısı önünde buluşuyoruz. Teknemiz D iskelesinde 3 numaralı yerde bağlıdır. Marina'ya girişte güvenliğe isminizi söylemeniz yeterli..." 
                      value={data.locationDescription}
                      onChange={(e) => onChange({ locationDescription: e.target.value })}
                      rows={4}
                      className="border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Map Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                <Map className="h-4 w-4 text-[#15847c]" />
                Harita Konumu
              </FormLabel>
              <p className="text-sm text-gray-600 mb-6">
                Buluşma noktasını haritada işaretleyin. İşaretleyiciyi sürükleyebilir veya haritaya tıklayabilirsiniz.
              </p>
              
              <div className="space-y-4">
                {/* Map Component */}
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#15847c] transition-colors">
                  <MapPicker
                    value={data.coordinates}
                    onChange={(coords) => onChange({ coordinates: coords })}
                    height={400}
                    zoom={13}
                  />
                </div>
                
                {/* Coordinate Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Enlem (Latitude)
                    </FormLabel>
                    <Input
                      type="number"
                      step="0.000001"
                      value={data.coordinates.lat}
                      onChange={(e) => onChange({
                        coordinates: {
                          ...data.coordinates,
                          lat: parseFloat(e.target.value)
                        }
                      })}
                      className="h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Boylam (Longitude)
                    </FormLabel>
                    <Input
                      type="number"
                      step="0.000001"
                      value={data.coordinates.lng}
                      onChange={(e) => onChange({
                        coordinates: {
                          ...data.coordinates,
                          lng: parseFloat(e.target.value)
                        }
                      })}
                      className="h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                    />
                  </div>
                </div>
                
                {/* Helper Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">İpucu:</p>
                      <p>Haritada konumu işaretledikten sonra, koordinatlar otomatik olarak güncellenecektir. Manuel olarak da koordinat girebilirsiniz.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Form>
    </div>
  );
};

export default TourLocationTab;