
import React, { useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for vessels
const mockVessels = [
  { id: '1', name: 'Mavi Rüzgar' },
  { id: '2', name: 'Deniz Yıldızı' },
  { id: '3', name: 'Rüzgar Gülü' },
];

const VesselCalendarPage: React.FC = () => {
  const [selectedVessel, setSelectedVessel] = useState<string | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleSelectVessel = (vesselId: string) => {
    setSelectedVessel(vesselId);
  };

  const handleViewCalendar = () => {
    if (!selectedVessel) {
      toast({
        title: "Lütfen bir taşıt seçin",
        description: "Takvimi görüntülemek için önce bir taşıt seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    setShowCalendar(true);
  };

  // Find the vessel name for display
  const selectedVesselName = mockVessels.find(v => v.id === selectedVessel)?.name;

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Takvim</h1>
          <p className="text-muted-foreground">
            Taşıtınızın rezervasyonlarını, müsaitliklerini ve bakım günlerini bu takvimden yönetebilirsiniz.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {!showCalendar ? (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium mb-2">Taşıt Seçin</label>
                  <Select value={selectedVessel} onValueChange={handleSelectVessel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Taşıt seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex mt-4 md:mt-0">
                  <Button 
                    className="w-full md:w-auto bg-[#00bfa5] hover:bg-[#00a895] text-white"
                    onClick={handleViewCalendar}
                  >
                    Takvime Git <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">{selectedVesselName} - Takvim</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCalendar(false)}
                >
                  Taşıt Seç
                </Button>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border w-full lg:w-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="bg-white p-4 rounded-lg shadow-sm border h-full">
                    <h3 className="font-medium mb-4">
                      {selectedDate ? `${selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} Tarihli Rezervasyonlar` : 'Seçili Tarih Yok'}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>Müsait</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span>Rezerve</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span>İptal</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-gray-500 text-sm">
                        Bu takvim görünümünde boş olması normal. Gerçek uygulamada, bu alanda seçili tarihe ait rezervasyonların detayları gösterilecektir.
                      </p>
                      
                      <div className="mt-4">
                        <Button 
                          className="bg-[#00bfa5] hover:bg-[#00a895] text-white"
                          onClick={() => {
                            toast({
                              title: "Yeni Rezervasyon",
                              description: "Bu özellik demo için henüz hazır değil."
                            });
                          }}
                        >
                          Yeni Rezervasyon Ekle
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CaptainLayout>
  );
};

export default VesselCalendarPage;
