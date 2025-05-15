
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TourDetailsTab from '@/components/admin/tours/tabs/TourDetailsTab';
import TourTermsTab from '@/components/admin/tours/tabs/TourTermsTab';
import TourLocationTab from '@/components/admin/tours/tabs/TourLocationTab';
import TourAdditionalInfoTab from '@/components/admin/tours/tabs/TourAdditionalInfoTab';
import TourDatesTab from '@/components/admin/tours/tabs/TourDatesTab';
import TourPhotosTab from '@/components/admin/tours/tabs/TourPhotosTab';

const TABS = [
  { id: 'details', label: 'Ana Bilgiler' },
  { id: 'terms', label: 'Şartlar' },
  { id: 'location', label: 'Rota ve Konum' },
  { id: 'additional', label: 'Ek Bilgiler' },
  { id: 'dates', label: 'Tarih ve Fiyatlandırma' },
  { id: 'photos', label: 'Fotoğraflar' },
];

const NewTourPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    details: {
      category: '',
      boat: '',
      title: '',
      description: '',
      fullDescription: '',
      highlights: ['', '']
    },
    terms: {
      languages: [],
      cancellationPolicy: ''
    },
    location: {
      region: '',
      port: '',
      routeDescription: '',
      locationDescription: '',
      coordinates: { lat: 41.0082, lng: 28.9784 } // Default to Istanbul
    },
    additional: {
      included: '',
      requirements: '',
      notAllowed: '',
      notSuitableFor: ''
    },
    dates: {
      duration: { hours: 2, minutes: 0 },
      capacity: 10,
      price: 0
    },
    photos: []
  });

  const handleNext = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Değişiklikleriniz kaydedilmeyecek. Çıkmak istediğinize emin misiniz?')) {
      navigate('/captain/tours');
    }
  };

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...data
      }
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted with data:', formData);
    // Here you would send the data to your backend
    navigate('/captain/tours');
  };

  const isLastTab = activeTab === TABS[TABS.length - 1].id;

  return (
    <CaptainLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <h1 className="text-2xl font-bold mb-6">Yeni Tekne Turu Oluştur</h1>
        
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-gray-50 px-6 py-4 overflow-x-auto">
              <TabsList className="bg-white w-full justify-start overflow-x-auto">
                {TABS.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id}
                    className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-[#15847c] rounded-none px-4 py-2 data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="details" className="m-0">
                <TourDetailsTab 
                  data={formData.details} 
                  onChange={(data) => updateFormData('details', data)} 
                />
              </TabsContent>
              
              <TabsContent value="terms" className="m-0">
                <TourTermsTab 
                  data={formData.terms} 
                  onChange={(data) => updateFormData('terms', data)} 
                />
              </TabsContent>
              
              <TabsContent value="location" className="m-0">
                <TourLocationTab 
                  data={formData.location} 
                  onChange={(data) => updateFormData('location', data)} 
                />
              </TabsContent>
              
              <TabsContent value="additional" className="m-0">
                <TourAdditionalInfoTab 
                  data={formData.additional} 
                  onChange={(data) => updateFormData('additional', data)} 
                />
              </TabsContent>
              
              <TabsContent value="dates" className="m-0">
                <TourDatesTab 
                  data={formData.dates} 
                  onChange={(data) => updateFormData('dates', data)} 
                />
              </TabsContent>
              
              <TabsContent value="photos" className="m-0">
                <TourPhotosTab 
                  photos={formData.photos} 
                  onChange={(photos) => updateFormData('photos', { photos })} 
                />
              </TabsContent>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
              <Button 
                onClick={handleCancel} 
                variant="outline"
                className="bg-white text-[#e74c3c] border-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
              >
                Vazgeç
              </Button>
              
              <div className="flex space-x-2">
                {activeTab !== TABS[0].id && (
                  <Button 
                    onClick={handlePrevious} 
                    variant="outline"
                    className="bg-white"
                  >
                    Geri
                  </Button>
                )}
                
                {isLastTab ? (
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-[#2ecc71] hover:bg-[#27ae60]"
                  >
                    Kaydet
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext} 
                    className="bg-[#2ecc71] hover:bg-[#27ae60]"
                  >
                    Devam Et
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </Card>
      </div>
    </CaptainLayout>
  );
};

export default NewTourPage;
