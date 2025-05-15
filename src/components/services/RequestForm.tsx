
import React from 'react';
import { Button } from '@/components/ui/button';
import { Anchor, PartyPopper, Utensils, Camera } from 'lucide-react';

const RequestForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
  };

  return (
    <div className="mt-16 bg-muted rounded-lg p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Özel Teklif İsteyin</h2>
        <p className="text-muted-foreground mt-2">
          İhtiyaçlarınıza uygun özel bir teklif için bizimle iletişime geçin
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-xl font-semibold mb-4">Neden Özel Teklif İstemelisiniz?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="mt-1 text-primary">
                <PartyPopper className="h-5 w-5" />
              </div>
              <span>İhtiyaçlarınıza tamamen uyarlanmış hizmet</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 text-primary">
                <Anchor className="h-5 w-5" />
              </div>
              <span>Profesyonel ekibimizin deneyim ve önerileri</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 text-primary">
                <Utensils className="h-5 w-5" />
              </div>
              <span>Ekstra hizmetler için özel fiyatlandırma</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <span>Özel anlarınızı ölümsüzleştiren fotoğraf çekimleri</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Ad Soyad</label>
                <input 
                  id="name"
                  type="text" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">E-posta</label>
                <input 
                  id="email"
                  type="email" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="E-posta adresiniz"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="service" className="text-sm font-medium">Hizmet Türü</label>
              <select id="service" className="w-full p-2 border rounded-md">
                <option value="">Seçiniz</option>
                <option value="dogum-gunu">Doğum Günü Partisi</option>
                <option value="evlilik-teklifi">Evlilik Teklifi</option>
                <option value="tekne-partisi">Tekne Partisi</option>
                <option value="sunset-cruise">Sunset Cruise</option>
                <option value="fotograf-cekimi">Fotoğraf Çekimi</option>
                <option value="kurumsal">Kurumsal Etkinlik</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Mesajınız</label>
              <textarea 
                id="message"
                className="w-full p-2 border rounded-md min-h-[120px]" 
                placeholder="Talebiniz hakkında detaylı bilgi veriniz"
              />
            </div>
            <Button type="submit" className="w-full">Teklif İste</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
