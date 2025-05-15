
import React, { useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';

const AvailabilityPage = () => {
  const [activeTab, setActiveTab] = useState('available');

  // Mock data for availability entries
  const availabilityEntries = [
    { 
      id: 1, 
      tourName: 'Bodrum Günlük Tur', 
      vesselName: 'Mavi Rüya', 
      startDate: '2025-06-01', 
      endDate: '2025-06-07', 
      status: 'available' 
    },
    { 
      id: 2, 
      tourName: 'Gökova Körfezi Turu', 
      vesselName: 'Mavi Rüya', 
      startDate: '2025-06-10', 
      endDate: '2025-06-15', 
      status: 'reserved' 
    },
    { 
      id: 3, 
      tourName: 'Fethiye Mavi Yolculuk', 
      vesselName: 'Mavi Rüya', 
      startDate: '2025-05-01', 
      endDate: '2025-05-10', 
      status: 'completed' 
    },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <SidebarProvider>
      <CaptainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <Clock className="mr-2" />
              Müsaitlik
            </h1>
            <Button className="bg-[#15847c] hover:bg-[#0e5c56] shadow-sm">
              <Plus size={16} className="mr-1" /> Yeni Müsaitlik Ekle
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <Tabs defaultValue="available" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b rounded-none">
                <TabsTrigger value="available">Müsaitlik Verebileceklerim</TabsTrigger>
                <TabsTrigger value="given">Verdiğim Müsaitlikler</TabsTrigger>
                <TabsTrigger value="past">Geçmiş Müsaitlikler</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available" className="p-6">
                <div className="space-y-4">
                  {availabilityEntries
                    .filter(entry => entry.status === 'available')
                    .map(entry => (
                      <AvailabilityCard key={entry.id} entry={entry} />
                    ))}
                    
                  {availabilityEntries.filter(entry => entry.status === 'available').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Henüz müsaitlik bilgisi eklenmemiş.</p>
                      <Button className="mt-4 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm">
                        <Plus size={16} className="mr-1" /> Müsaitlik Ekle
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="given" className="p-6">
                <div className="space-y-4">
                  {availabilityEntries
                    .filter(entry => entry.status === 'reserved')
                    .map(entry => (
                      <AvailabilityCard key={entry.id} entry={entry} />
                    ))}
                    
                  {availabilityEntries.filter(entry => entry.status === 'reserved').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Henüz rezerve edilmiş müsaitlik bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="past" className="p-6">
                <div className="space-y-4">
                  {availabilityEntries
                    .filter(entry => entry.status === 'completed')
                    .map(entry => (
                      <AvailabilityCard key={entry.id} entry={entry} />
                    ))}
                    
                  {availabilityEntries.filter(entry => entry.status === 'completed').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Henüz tamamlanmış müsaitlik bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CaptainLayout>
    </SidebarProvider>
  );
};

const AvailabilityCard = ({ entry }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-600">Müsait</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Rezerve</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Tamamlandı</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 hover:shadow transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="space-y-2 mb-4 md:mb-0">
          <h3 className="font-medium">{entry.tourName}</h3>
          <p className="text-sm text-gray-500">{entry.vesselName}</p>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon size={14} className="mr-1" />
            {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {getStatusBadge(entry.status)}
          
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8" title="Düzenle">
              <Edit size={16} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-white hover:bg-red-500" title="Sil">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
