import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TourDetailsTab from "@/components/admin/tours/tabs/TourDetailsTab";
import TourTermsTab from "@/components/admin/tours/tabs/TourTermsTab";
import TourLocationTab from "@/components/admin/tours/tabs/TourLocationTab";
import TourAdditionalInfoTab from "@/components/admin/tours/tabs/TourAdditionalInfoTab";
import TourDatesTab from "@/components/admin/tours/tabs/TourDatesTab";
import TourPhotosTab from "@/components/admin/tours/tabs/TourPhotosTab";
import { toast } from "@/components/ui/use-toast";
import { tourService } from "@/services/tourService";
import {
  CreateTourDTO,
  CreateTourDateDTO,
  CreateTourImageDTO,
} from "@/types/tour.types";

const TABS = [
  { id: "details", label: "Ana Bilgiler" },
  { id: "terms", label: "Şartlar" },
  { id: "location", label: "Rota ve Konum" },
  { id: "additional", label: "Ek Bilgiler" },
  { id: "dates", label: "Tarih ve Fiyatlandırma" },
  { id: "photos", label: "Fotoğraflar" },
];

const NewTourPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    details: {
      category: "",
      boat: "",
      title: "",
      description: "",
      fullDescription: "",
      highlights: ["", ""],
    },
    terms: {
      languages: [],
      cancellationPolicy: "",
    },
    location: {
      region: "",
      port: "",
      routeDescription: "",
      locationDescription: "",
      coordinates: { lat: 41.0082, lng: 28.9784 }, // Default to Istanbul
    },
    additional: {
      included: "",
      requirements: "",
      notAllowed: "",
      notSuitableFor: "",
    },
    dates: {
      duration: { hours: 2, minutes: 0 },
      capacity: 10,
      price: 0,
      seasonStartDate: "",
      seasonEndDate: "",
      tourDates: [] as Array<{
        startDate: string;
        endDate: string;
        availabilityStatus: string;
        maxGuests: number;
      }>,
    },
    photos: [] as File[],
  });

  const handleNext = () => {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Değişiklikleriniz kaydedilmeyecek. Çıkmak istediğinize emin misiniz?"
      )
    ) {
      navigate("/captain/tours");
    }
  };

  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...data,
      },
    }));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const validateForm = (): boolean => {
    if (!formData.details.title.trim()) {
      toast({
        title: "Hata",
        description: "Tur başlığı gereklidir.",
        variant: "destructive",
      });
      setActiveTab("details");
      return false;
    }

    if (!formData.details.boat) {
      toast({
        title: "Hata",
        description: "Tekne seçimi gereklidir.",
        variant: "destructive",
      });
      setActiveTab("details");
      return false;
    }

    if (!formData.location.region || !formData.location.port) {
      toast({
        title: "Hata",
        description: "Lokasyon bilgileri gereklidir.",
        variant: "destructive",
      });
      setActiveTab("location");
      return false;
    }

    if (formData.dates.price <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir fiyat giriniz.",
        variant: "destructive",
      });
      setActiveTab("dates");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create tour images DTOs
      const tourImages: CreateTourImageDTO[] = [];
      for (let i = 0; i < formData.photos.length; i++) {
        const file = formData.photos[i];
        const base64Data = await fileToBase64(file);
        tourImages.push({
          tourId: 0, // Will be set by backend
          imageData: base64Data,
          displayOrder: i + 1,
        });
      }

      // Create tour dates DTOs
      const tourDates: CreateTourDateDTO[] = formData.dates.tourDates.map(
        (date) => ({
          tourId: 0, // Will be set by backend
          startDate: date.startDate,
          endDate: date.endDate,
          availabilityStatus: date.availabilityStatus || "AVAILABLE",
          maxGuests: date.maxGuests || formData.dates.capacity,
        })
      );

      // Create main tour DTO
      const createTourDTO: CreateTourDTO = {
        name: formData.details.title,
        description:
          formData.details.description || formData.details.fullDescription,
        boatId: Number(formData.details.boat),
        guideId: 1, // TODO: Get from auth context
        seasonStartDate:
          formData.dates.seasonStartDate || new Date().toISOString(),
        seasonEndDate:
          formData.dates.seasonEndDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        price: formData.dates.price,
        capacity: formData.dates.capacity,
        location: `${formData.location.region}, ${formData.location.port}`,
        status: "DRAFT", // Start as draft
        tourDates,
        tourImages,
      };

      console.log("🚀 Tur oluşturuluyor:", createTourDTO);

      const newTour = await tourService.createTour(createTourDTO);

      toast({
        title: "Başarılı",
        description: "Tur başarıyla oluşturuldu.",
      });

      console.log("✅ Tur oluşturuldu:", newTour);
      navigate("/captain/tours");
    } catch (error) {
      console.error("❌ Tur oluşturma hatası:", error);
      toast({
        title: "Hata",
        description:
          "Tur oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isLastTab = activeTab === TABS[TABS.length - 1].id;

  return (
    <CaptainLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <h1 className="text-2xl font-bold mb-6">Yeni Tekne Turu Oluştur</h1>

        <Card className="overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
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
                  onChange={(data) => updateFormData("details", data)}
                />
              </TabsContent>

              <TabsContent value="terms" className="m-0">
                <TourTermsTab
                  data={formData.terms}
                  onChange={(data) => updateFormData("terms", data)}
                />
              </TabsContent>

              <TabsContent value="location" className="m-0">
                <TourLocationTab
                  data={formData.location}
                  onChange={(data) => updateFormData("location", data)}
                />
              </TabsContent>

              <TabsContent value="additional" className="m-0">
                <TourAdditionalInfoTab
                  data={formData.additional}
                  onChange={(data) => updateFormData("additional", data)}
                />
              </TabsContent>

              <TabsContent value="dates" className="m-0">
                <TourDatesTab
                  data={formData.dates}
                  onChange={(data) => updateFormData("dates", data)}
                />
              </TabsContent>

              <TabsContent value="photos" className="m-0">
                <TourPhotosTab
                  photos={formData.photos}
                  onChange={(photos) =>
                    setFormData((prev) => ({ ...prev, photos }))
                  }
                />
              </TabsContent>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="bg-white text-[#e74c3c] border-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                disabled={loading}
              >
                Vazgeç
              </Button>

              <div className="flex space-x-2">
                {activeTab !== TABS[0].id && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="bg-white"
                    disabled={loading}
                  >
                    Geri
                  </Button>
                )}

                {isLastTab ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-[#2ecc71] hover:bg-[#27ae60]"
                    disabled={loading}
                  >
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-[#2ecc71] hover:bg-[#27ae60]"
                    disabled={loading}
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
