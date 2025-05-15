
import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TourLocationData {
  region: string;
  port: string;
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
  
  // Mock data for regions
  const regions = [
    { id: 'istanbul', name: 'İstanbul' },
    { id: 'bodrum', name: 'Bodrum' },
    { id: 'fethiye', name: 'Fethiye' },
    { id: 'marmaris', name: 'Marmaris' },
    { id: 'antalya', name: 'Antalya' },
  ];
  
  // Mock data for ports - would be filtered based on region in real app
  const ports = {
    istanbul: [
      { id: 'bebek', name: 'Bebek Marina' },
      { id: 'karakoy', name: 'Karaköy Limanı' },
      { id: 'kadikoy', name: 'Kadıköy İskelesi' },
    ],
    bodrum: [
      { id: 'yalikavak', name: 'Yalıkavak Marina' },
      { id: 'gumbet', name: 'Gümbet Limanı' },
    ],
    fethiye: [
      { id: 'fethiye-port', name: 'Fethiye Limanı' },
    ],
    marmaris: [
      { id: 'marmaris-port', name: 'Marmaris Limanı' },
      { id: 'icmeler', name: 'İçmeler İskelesi' },
    ],
    antalya: [
      { id: 'kaleici', name: 'Kaleiçi Marina' },
      { id: 'alanya', name: 'Alanya Limanı' },
    ],
  };

  // Get ports for the selected region
  const getPortsForRegion = () => {
    if (!data.region) return [];
    return ports[data.region as keyof typeof ports] || [];
  };
  
  // In a real app, we would render an interactive map here
  // For now, we'll just use text inputs for coordinates as a placeholder
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Rota ve Konum</h2>
      <p className="text-sm text-gray-500">
        Turunuzun başlangıç noktasını ve rotasını belirtin.
      </p>
      
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şehir / Bölge</FormLabel>
                <Select
                  value={data.region}
                  onValueChange={(value) => {
                    onChange({ 
                      region: value,
                      port: '' // Reset port when region changes
                    });
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bölge seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liman / İskele</FormLabel>
                <Select
                  value={data.port}
                  onValueChange={(value) => onChange({ port: value })}
                  disabled={!data.region}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        data.region 
                          ? "Liman seçin" 
                          : "Önce bölge seçmelisiniz"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getPortsForRegion().map((port) => (
                      <SelectItem key={port.id} value={port.id}>
                        {port.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="routeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rotadan Bahsedin</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tekne turunuzun rotasını detaylı olarak anlatın" 
                    value={data.routeDescription}
                    onChange={(e) => onChange({ routeDescription: e.target.value })}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="locationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konum Açıklaması</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Buluşma noktası ve kalkış yeri hakkında bilgi verin" 
                    value={data.locationDescription}
                    onChange={(e) => onChange({ locationDescription: e.target.value })}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Harita Konumu</FormLabel>
            <p className="text-sm text-gray-500 mb-3">
              Buluşma noktasını haritada işaretleyin. Gerçek bir harita entegrasyonu için Mapbox veya Google Maps API kullanılabilir.
            </p>
            
            <Card className="p-4">
              <div className="bg-gray-100 h-[300px] rounded-md flex items-center justify-center mb-4">
                <p className="text-gray-500 text-sm">
                  Harita entegrasyonu yapılacak
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Enlem</FormLabel>
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
                  />
                </FormItem>
                
                <FormItem>
                  <FormLabel>Boylam</FormLabel>
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
                  />
                </FormItem>
              </div>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TourLocationTab;
