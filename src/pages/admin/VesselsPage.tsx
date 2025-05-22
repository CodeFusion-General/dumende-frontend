import React, { useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import VesselsList from '@/components/admin/vessels/VesselsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ship, Plus, FileText, Shield, Utensils, MapPin, Image, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const VesselsPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingVesselId, setEditingVesselId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState('details');

  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>({
    type: '',
    brandModel: '',
    name: '',
    buildYear: '',
    lastMaintenanceYear: '',
    toiletCount: '',
    fullCapacity: '',
    diningCapacity: '',
    length: '',
    flag: '',
    material: '',
    // ... diğer form alanları
  });

  useEffect(() => {
    if (editingVesselId) {
      const fetchVessel = async () => {
        try {
          setLoading(true);
          const response = await vesselService.getVesselById(editingVesselId);
          setVessel(response);
          setFormData({
            type: response.type,
            brandModel: response.brandModel,
            name: response.name,
            buildYear: response.buildYear,
            lastMaintenanceYear: response.lastMaintenanceYear,
            toiletCount: response.toiletCount,
            fullCapacity: response.fullCapacity,
            diningCapacity: response.diningCapacity,
            length: response.length,
            flag: response.flag,
            material: response.material,
            // ... diğer form alanları
          });
        } catch (error) {
          console.error('Failed to fetch vessel:', error);
          setError('Tekne bilgileri yüklenirken bir hata oluştu.');
          toast({
            title: "Hata",
            description: "Tekne bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchVessel();
    }
  }, [editingVesselId]);
  */

  const handleAddVessel = () => {
    setEditingVesselId(null);
    setActiveTab('form');
    setFormTab('details');
  };

  const handleEditVessel = (id: string) => {
    setEditingVesselId(id);
    setActiveTab('form');
    setFormTab('details');
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setEditingVesselId(null);
  };

  /* Backend hazır olduğunda kullanılacak form submit fonksiyonu:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingVesselId) {
        await vesselService.updateVessel(editingVesselId, formData);
        toast({
          title: "Başarılı",
          description: "Tekne bilgileri güncellendi.",
        });
      } else {
        await vesselService.createVessel(formData);
        toast({
          title: "Başarılı",
          description: "Yeni tekne eklendi.",
        });
      }
      
      handleBackToList();
    } catch (error) {
      console.error('Failed to save vessel:', error);
      toast({
        title: "Hata",
        description: "Tekne kaydedilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVessel = async (id: string) => {
    try {
      await vesselService.deleteVessel(id);
      toast({
        title: "Başarılı",
        description: "Tekne silindi.",
      });
      handleBackToList();
    } catch (error) {
      console.error('Failed to delete vessel:', error);
      toast({
        title: "Hata",
        description: "Tekne silinemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (files: FileList) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      
      if (editingVesselId) {
        formData.append('vesselId', editingVesselId);
      }
      
      const response = await vesselService.uploadImages(formData);
      toast({
        title: "Başarılı",
        description: "Fotoğraflar yüklendi.",
      });
      
      // Form datasını güncelle
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...response.images]
      }));
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast({
        title: "Hata",
        description: "Fotoğraflar yüklenemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  };
  */

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="list" className="mt-0">
            <VesselsList 
              onAddVessel={handleAddVessel}
              onEditVessel={handleEditVessel}
              isEmpty={false} // Set to true to show empty state
            />
          </TabsContent>
          
          <TabsContent value="form" className="mt-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center">
                  <Ship className="mr-2" />
                  {editingVesselId ? 'Taşıt Düzenle' : 'Yeni Taşıt Ekle'}
                </h1>
              </div>

              <div className="bg-white rounded-lg shadow">
                <Tabs defaultValue={formTab} className="w-full" onValueChange={setFormTab}>
                  <TabsList className="w-full justify-start border-b rounded-none">
                    <TabsTrigger value="details" className="flex items-center gap-1">
                      <FileText size={16} />
                      Taşıt Detayları
                    </TabsTrigger>
                    <TabsTrigger value="terms" className="flex items-center gap-1">
                      <Shield size={16} />
                      Şartlar
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center gap-1">
                      <Utensils size={16} />
                      Servisler
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex items-center gap-1">
                      <MapPin size={16} />
                      Lokasyon
                    </TabsTrigger>
                    <TabsTrigger value="photos" className="flex items-center gap-1">
                      <Image size={16} />
                      Fotoğraflar
                    </TabsTrigger>
                    <TabsTrigger value="descriptions" className="flex items-center gap-1">
                      <FileText size={16} />
                      Açıklamalar
                    </TabsTrigger>
                    <TabsTrigger value="organizations" className="flex items-center gap-1">
                      <Calendar size={16} />
                      Organizasyonlar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="p-6">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="vesselType">
                            Taşıt Tipi
                          </label>
                          <Select>
                            <SelectTrigger id="vesselType">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yacht">Yat</SelectItem>
                              <SelectItem value="gulet">Gulet</SelectItem>
                              <SelectItem value="speedboat">Sürat Teknesi</SelectItem>
                              <SelectItem value="catamaran">Katamaran</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="brandModel">
                            Marka / Model
                          </label>
                          <Select>
                            <SelectTrigger id="brandModel">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="azimut">Azimut</SelectItem>
                              <SelectItem value="princess">Princess</SelectItem>
                              <SelectItem value="sunseeker">Sunseeker</SelectItem>
                              <SelectItem value="beneteau">Beneteau</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="vesselName">
                            Tekne İsmi
                          </label>
                          <Input id="vesselName" placeholder="Tekne ismi giriniz" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="buildYear">
                            Yapım Yılı
                          </label>
                          <Input id="buildYear" type="number" placeholder="Örn: 2015" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="lastMaintenanceYear">
                            Son Bakım Yılı
                          </label>
                          <Input id="lastMaintenanceYear" type="number" placeholder="Örn: 2023" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="toiletCount">
                            Tuvalet Sayısı
                          </label>
                          <Input id="toiletCount" type="number" placeholder="Örn: 2" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="fullCapacity">
                            Tam Kapasite
                          </label>
                          <Input id="fullCapacity" type="number" placeholder="Örn: 12" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="diningCapacity">
                            Yemekli Kapasite
                          </label>
                          <Input id="diningCapacity" type="number" placeholder="Örn: 8" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="length">
                            Uzunluk (metre)
                          </label>
                          <Input id="length" type="number" placeholder="Örn: 15.5" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="flag">
                            Bayrak
                          </label>
                          <Select>
                            <SelectTrigger id="flag">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tr">Türkiye</SelectItem>
                              <SelectItem value="uk">Birleşik Krallık</SelectItem>
                              <SelectItem value="us">Amerika Birleşik Devletleri</SelectItem>
                              <SelectItem value="gr">Yunanistan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="material">
                            Yapım Malzemesi
                          </label>
                          <Select>
                            <SelectTrigger id="material">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wood">Ahşap</SelectItem>
                              <SelectItem value="fiber">Fiber</SelectItem>
                              <SelectItem value="steel">Çelik</SelectItem>
                              <SelectItem value="aluminum">Alüminyum</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
                        </Button>
                        <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                          Kaydet
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="terms" className="p-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-medium mb-4">Şartlar ve Koşullar</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">Sigara İçme Kuralı</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">İzin Verilir</SelectItem>
                              <SelectItem value="restricted">Belirli Alanlarda</SelectItem>
                              <SelectItem value="prohibited">Yasaktır</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Evcil Hayvan</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">İzin Verilir</SelectItem>
                              <SelectItem value="prohibited">İzin Verilmez</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Alkol</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">İzin Verilir</SelectItem>
                              <SelectItem value="prohibited">İzin Verilmez</SelectItem>
                              <SelectItem value="byo">Kendi Getir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Müzik</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="allowed">İzin Verilir</SelectItem>
                              <SelectItem value="restricted">Belirli Saatlerde</SelectItem>
                              <SelectItem value="prohibited">İzin Verilmez</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Ek Kurallar</label>
                        <Textarea placeholder="Müşterilerinizin bilmesi gereken diğer kuralları veya şartları buraya yazabilirsiniz..." />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
                        </Button>
                        <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="p-6">
                    <h2 className="text-xl font-medium mb-4">Servisler</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">Yemek Servisi</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="included">Dahil</SelectItem>
                              <SelectItem value="optional">Opsiyonel</SelectItem>
                              <SelectItem value="not-available">Mevcut Değil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">DJ / Müzik</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="included">Dahil</SelectItem>
                              <SelectItem value="optional">Opsiyonel</SelectItem>
                              <SelectItem value="not-available">Mevcut Değil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Su Sporları</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="included">Dahil</SelectItem>
                              <SelectItem value="optional">Opsiyonel</SelectItem>
                              <SelectItem value="not-available">Mevcut Değil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Diğer Servisler</label>
                        <Textarea placeholder="Sunduğunuz diğer servisleri buraya ekleyebilirsiniz..." />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
                        </Button>
                        <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="p-6">
                    <h2 className="text-xl font-medium mb-4">Lokasyon</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">Kalkış Noktası</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bodrum">Bodrum Marina</SelectItem>
                              <SelectItem value="fethiye">Fethiye Limanı</SelectItem>
                              <SelectItem value="marmaris">Marmaris Marina</SelectItem>
                              <SelectItem value="gocek">Göcek Marina</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Dönüş Noktası</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="same">Kalkış ile Aynı</SelectItem>
                              <SelectItem value="bodrum">Bodrum Marina</SelectItem>
                              <SelectItem value="fethiye">Fethiye Limanı</SelectItem>
                              <SelectItem value="marmaris">Marmaris Marina</SelectItem>
                              <SelectItem value="gocek">Göcek Marina</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gray-50 h-[300px] flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MapPin className="mx-auto h-12 w-12 mb-2 opacity-50" />
                          <p>Harita bileşeni burada gösterilecek.</p>
                          <p className="text-sm">Konumu harita üzerinde işaretleyebileceksiniz.</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
                        </Button>
                        <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="photos" className="p-6">
                    <h2 className="text-xl font-medium mb-4">Fotoğraflar</h2>
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Image className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Fotoğrafları Sürükle & Bırak</h3>
                        <p className="text-sm text-gray-500 mb-4">veya fotoğraf seçmek için tıklayın</p>
                        <Button variant="outline">Dosyaları Seç</Button>
                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP formatları desteklenmektedir (maks. 5MB)</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Placeholder for uploaded images */}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
                        </Button>
                        <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="descriptions" className="p-6">
                    <h2 className="text-xl font-medium mb-4">Açıklamalar</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Kısa Açıklama</label>
                        <Textarea 
                          placeholder="Teknenizin kısa bir özetini yazın (maksimum 200 karakter)" 
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">Bu açıklama tekne listelerinde ve arama sonuçlarında gösterilecektir.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Detaylı Açıklama</label>
                        <Textarea 
                          placeholder="Teknenizin detaylı tanıtımını yapın..." 
                          className="min-h-[200px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Teknenizin özellikleri, avantajları ve diğer özelliklerini detaylandırın.</p>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
                        </Button>
                        <Button className="bg-[#2ecc71] hover:bg-[#25a25a]">
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="organizations" className="p-6">
                    <h2 className="text-xl font-medium mb-4">Organizasyonlar</h2>
                    <div className="space-y-6">
                      <p className="text-gray-600">Teknenizin hangi organizasyon tiplerine uygun olduğunu seçin:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Doğum Günü Partisi</h3>
                          <p className="text-sm text-gray-500">Özel günlerde unutulmaz kutlamalar için</p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Evlilik Teklifi</h3>
                          <p className="text-sm text-gray-500">Romantik anlara özel düzenlemeler</p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">İş Toplantısı</h3>
                          <p className="text-sm text-gray-500">Profesyonel görüşmeler için ideal ortam</p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Düğün</h3>
                          <p className="text-sm text-gray-500">Unutulmaz bir düğün günü için</p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Bekarlığa Veda</h3>
                          <p className="text-sm text-gray-500">Eğlenceli bir kutlama için</p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium mb-1">Özel Tur</h3>
                          <p className="text-sm text-gray-500">Kişiselleştirilmiş rotalar ve deneyimler</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Ek Organizasyon Detayları</label>
                        <Textarea placeholder="Organizasyonlar ile ilgili ek bilgiler..." />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleBackToList}
                          className="border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                        >
                          Geri Dön
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
          </TabsContent>
        </Tabs>
      </div>
    </CaptainLayout>
  );
};

export default VesselsPage;
