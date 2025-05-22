import React, { useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Info } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { toast } from '@/components/ui/use-toast';

/* Backend hazır olduğunda kullanılacak interface:
interface PricingData {
  vesselId: string;
  seasonalPricing: boolean;
  weekendPricing: boolean;
  standardWeekdayPrice: number;
  standardWeekendPrice?: number;
  peakWeekdayPrice?: number;
  peakWeekendPrice?: number;
  minimumHours: number;
  services: {
    foodService?: number;
    musicService?: number;
    decorationService?: number;
    watersportService?: number;
  };
}
*/

const PricingPage = () => {
  const [activeTab, setActiveTab] = useState('hourly');
  
  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vessels, setVessels] = useState<any[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [pricingData, setPricingData] = useState<PricingData>({
    vesselId: '',
    seasonalPricing: false,
    weekendPricing: false,
    standardWeekdayPrice: 0,
    minimumHours: 2,
    services: {}
  });

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await vesselService.getVessels();
        setVessels(response);
      } catch (error) {
        console.error('Failed to fetch vessels:', error);
        toast({
          title: "Hata",
          description: "Tekneler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    };

    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      const fetchPricing = async () => {
        try {
          setLoading(true);
          const response = await pricingService.getVesselPricing(selectedVessel);
          setPricingData(response);
        } catch (error) {
          console.error('Failed to fetch pricing:', error);
          toast({
            title: "Hata",
            description: "Fiyat bilgileri yüklenirken bir hata oluştu.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchPricing();
    }
  }, [selectedVessel]);
  */

  // Mock implementation - Backend hazır olduğunda kaldırılacak
  const [seasonalPricing, setSeasonalPricing] = useState(false);
  const [weekendPricing, setWeekendPricing] = useState(false);

  /* Backend hazır olduğunda kullanılacak fonksiyonlar:
  const handleVesselChange = (vesselId: string) => {
    setSelectedVessel(vesselId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await pricingService.updateVesselPricing(selectedVessel, pricingData);
      toast({
        title: "Başarılı",
        description: "Fiyat bilgileri güncellendi.",
      });
    } catch (error) {
      console.error('Failed to update pricing:', error);
      toast({
        title: "Hata",
        description: "Fiyat bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServicePriceUpdate = async (serviceType: string, price: number) => {
    try {
      await pricingService.updateServicePrice(selectedVessel, serviceType, price);
      toast({
        title: "Başarılı",
        description: "Hizmet fiyatı güncellendi.",
      });
    } catch (error) {
      console.error('Failed to update service price:', error);
      toast({
        title: "Hata",
        description: "Hizmet fiyatı güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  */
  
  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <DollarSign className="mr-2" />
            Fiyatlar
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Tabs defaultValue="hourly" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none">
              <TabsTrigger value="hourly">Saatlik Fiyatlar</TabsTrigger>
              <TabsTrigger value="daily">Günlük Fiyatlar</TabsTrigger>
              <TabsTrigger value="weekly">Haftalık Fiyatlar</TabsTrigger>
              <TabsTrigger value="services">Ek Hizmetler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hourly" className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="vessel">Tekne</Label>
                    <Select>
                      <SelectTrigger id="vessel">
                        <SelectValue placeholder="Tekne seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boat1">Mavi Rüya</SelectItem>
                        <SelectItem value="boat2">Deniz Yıldızı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="seasonalPricing">Yoğun Sezon Fiyatı</Label>
                      <div className="text-gray-500 cursor-help" title="Haziran-Eylül arası için farklı fiyat uygula">
                        <Info size={16} />
                      </div>
                    </div>
                    <Switch 
                      id="seasonalPricing" 
                      checked={seasonalPricing}
                      onCheckedChange={setSeasonalPricing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="weekendPricing">Hafta Sonu Fiyatı</Label>
                      <div className="text-gray-500 cursor-help" title="Cuma-Pazar günleri için farklı fiyat uygula">
                        <Info size={16} />
                      </div>
                    </div>
                    <Switch 
                      id="weekendPricing" 
                      checked={weekendPricing}
                      onCheckedChange={setWeekendPricing}
                    />
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Standart Dönem</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="standardWeekdayPrice">Hafta İçi Fiyat (TL)</Label>
                        <div className="flex items-center">
                          <Input id="standardWeekdayPrice" type="number" placeholder="Örn: 5000" />
                          <span className="ml-2">TL/saat</span>
                        </div>
                      </div>
                      
                      {weekendPricing && (
                        <div>
                          <Label htmlFor="standardWeekendPrice">Hafta Sonu Fiyat (TL)</Label>
                          <div className="flex items-center">
                            <Input id="standardWeekendPrice" type="number" placeholder="Örn: 6000" />
                            <span className="ml-2">TL/saat</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {seasonalPricing && (
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Yoğun Dönem (Haziran-Eylül)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="peakWeekdayPrice">Hafta İçi Fiyat (TL)</Label>
                          <div className="flex items-center">
                            <Input id="peakWeekdayPrice" type="number" placeholder="Örn: 7000" />
                            <span className="ml-2">TL/saat</span>
                          </div>
                        </div>
                        
                        {weekendPricing && (
                          <div>
                            <Label htmlFor="peakWeekendPrice">Hafta Sonu Fiyat (TL)</Label>
                            <div className="flex items-center">
                              <Input id="peakWeekendPrice" type="number" placeholder="Örn: 8000" />
                              <span className="ml-2">TL/saat</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="minimumHours">Minimum Rezervasyon (Saat)</Label>
                    <div className="flex items-center space-x-4">
                      <div className="w-full max-w-xs">
                        <Slider
                          defaultValue={[2]}
                          max={12}
                          min={1}
                          step={1}
                          id="minimumHours"
                        />
                      </div>
                      <span className="w-16 text-center">2 saat</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white">
                    İptal
                  </Button>
                  <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                    Kaydet
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="daily" className="p-6">
              <p className="text-gray-500">Günlük fiyatlandırma bölümü saatlik fiyatlandırmaya benzer şekilde yapılandırılacaktır.</p>
            </TabsContent>
            
            <TabsContent value="weekly" className="p-6">
              <p className="text-gray-500">Haftalık fiyatlandırma bölümü saatlik fiyatlandırmaya benzer şekilde yapılandırılacaktır.</p>
            </TabsContent>
            
            <TabsContent value="services" className="p-6">
              <h2 className="text-xl font-medium mb-4">Ek Hizmet Fiyatları</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foodService">Yemek Hizmeti (Kişi Başı)</Label>
                    <div className="flex items-center">
                      <Input id="foodService" type="number" placeholder="Örn: 500" />
                      <span className="ml-2">TL</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="musicService">Müzik Sistemi</Label>
                    <div className="flex items-center">
                      <Input id="musicService" type="number" placeholder="Örn: 1000" />
                      <span className="ml-2">TL</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="decorationService">Dekorasyon</Label>
                    <div className="flex items-center">
                      <Input id="decorationService" type="number" placeholder="Örn: 2000" />
                      <span className="ml-2">TL</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="watersportService">Su Sporları</Label>
                    <div className="flex items-center">
                      <Input id="watersportService" type="number" placeholder="Örn: 1500" />
                      <span className="ml-2">TL</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white">
                    İptal
                  </Button>
                  <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                    Kaydet
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CaptainLayout>
  );
};

export default PricingPage;
