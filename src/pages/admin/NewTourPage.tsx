import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import TourDetailsTab from "@/components/admin/tours/tabs/TourDetailsTab";
import TourTermsTab from "@/components/admin/tours/tabs/TourTermsTab";
import TourLocationTab from "@/components/admin/tours/tabs/TourLocationTab";
import TourAdditionalInfoTab from "@/components/admin/tours/tabs/TourAdditionalInfoTab";
import TourDatesTab from "@/components/admin/tours/tabs/TourDatesTab";
import TourPhotosTab from "@/components/admin/tours/tabs/TourPhotosTab";
import { toast } from "@/components/ui/use-toast";
import { tourService } from "@/services/tourService";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreateTourDTO,
  UpdateTourDTO,
  CreateTourDateDTO,
  CreateTourImageDTO,
} from "@/types/tour.types";
import { 
  Ship, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Edit,
  FileText,
  Shield,
  MapPin,
  Info,
  CalendarDays,
  Camera,
  Sparkles,
  TrendingUp
} from "lucide-react";

const TABS = [
  { id: "details", label: "Ana Bilgiler", icon: FileText, description: "Temel tur bilgileri" },
  { id: "terms", label: "Şartlar", icon: Shield, description: "Politikalar ve kurallar" },
  { id: "location", label: "Konum", icon: MapPin, description: "Rota ve buluşma noktası" },
  { id: "additional", label: "Ek Bilgiler", icon: Info, description: "Detaylı açıklamalar" },
  { id: "dates", label: "Tarih & Fiyat", icon: CalendarDays, description: "Tarihler ve ücretler" },
  { id: "photos", label: "Fotoğraflar", icon: Camera, description: "Görsel içerikler" },
];

const NewTourPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [loadingTourData, setLoadingTourData] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      loadTourData(Number(id));
    }
  }, [id, isEditMode]);

  const loadTourData = async (tourId: number) => {
    try {
      setLoadingTourData(true);

      // Load tour basic info
      const tour = await tourService.getTourById(tourId);

      // Load tour dates
      const tourDates = await tourService.getTourDatesByTourId(tourId);

      // Load tour images
      const tourImages = await tourService.getTourImagesByTourId(tourId);

      // Parse location (region)
      const locationParts = tour.location?.split(", ") || [];
      const region = locationParts[0] || tour.location || "";

      // Convert base64 images to File objects (for display only)
      const photoFiles: File[] = [];

      // Set form data
      setFormData({
        details: {
          category: String(tour.tourType || ""),
          title: tour.name,
          description: tour.description || "",
          fullDescription: tour.fullDescription || tour.description || "",
          highlights: tour.highlights || ["", ""],
        },
        terms: {
          languages: tour.languages || [],
          cancellationPolicy: tour.cancellationPolicy || "",
        },
        location: {
          region,
          port: "",
          routeDescription: tour.routeDescription || "",
          locationDescription: tour.locationDescription || "",
          coordinates: { lat: tour.latitude || 41.0082, lng: tour.longitude || 28.9784 },
        },
        additional: {
          included: tour.includedServices || "",
          requirements: tour.requirements || "",
          notAllowed: tour.notAllowed || "",
          notSuitableFor: tour.notSuitableFor || "",
          features: tour.features || [],
        },
        dates: {
          duration: { hours: 2, minutes: 0 },
          capacity: tour.capacity,
          price: Number(tour.price),
          tourDates: tourDates.map((date) => {
            const start = new Date(date.startDate);
            const hours = parseInt((date.durationText || "2").replace(/\D/g, "")) || 2;
            const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
            return {
              startDate: date.startDate,
              endDate: end.toISOString(),
              availabilityStatus: date.availabilityStatus,
              maxGuests: date.maxGuests,
            };
          }),
        },
        photos: photoFiles,
      });

      // Mark all tabs as completed in edit mode
      setCompletedTabs(TABS.map(tab => tab.id));
    } catch (error) {
      console.error("Tur verileri yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Tur verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoadingTourData(false);
    }
  };

  const [formData, setFormData] = useState({
    details: {
      category: "",
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
      coordinates: { lat: 41.0082, lng: 28.9784 },
    },
    additional: {
      included: "",
      requirements: "",
      notAllowed: "",
      notSuitableFor: "",
      features: [] as string[],
    },
    dates: {
      duration: { hours: 2, minutes: 0 },
      capacity: 10,
      price: 0,
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
    
    // Mark current tab as completed
    if (!completedTabs.includes(activeTab)) {
      setCompletedTabs([...completedTabs, activeTab]);
    }
    
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
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "Değişiklikleriniz kaydedilmeyecek. Çıkmak istediğinize emin misiniz?"
        )
      ) {
        navigate("/captain/tours");
      }
    } else {
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
    setHasUnsavedChanges(true);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
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

    if (!formData.location.region || !formData.location.region.trim()) {
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

      if (isEditMode && id) {
        // Update existing tour
        const updateTourDTO: UpdateTourDTO = {
          id: Number(id),
          name: formData.details.title,
          description: formData.details.description || "",
          fullDescription: formData.details.fullDescription || formData.details.description || "",
          guideId: Number(user?.id),
          price: Number(formData.dates.price),
          capacity: Number(formData.dates.capacity),
          location: formData.location.region,
          status: "DRAFT",
          latitude: formData.location.coordinates?.lat,
          longitude: formData.location.coordinates?.lng,
          tourType: formData.details.category as any,
          // terms & policies
          cancellationPolicy: formData.terms.cancellationPolicy || undefined,
          // additional info
          includedServices: formData.additional.included || undefined,
          requirements: formData.additional.requirements || undefined,
          notAllowed: formData.additional.notAllowed || undefined,
          notSuitableFor: formData.additional.notSuitableFor || undefined,
          // location details
          routeDescription: formData.location.routeDescription || undefined,
          locationDescription: formData.location.locationDescription || undefined,
          // collections
          features: formData.additional.features,
          languages: formData.terms.languages,
          highlights: formData.details.highlights,
          tourDatesToUpdate: [],
          tourDatesToAdd: [],
          tourDateIdsToRemove: [],
          tourImagesToUpdate: [],
          tourImagesToAdd: [],
          tourImageIdsToRemove: [],
        };

        const updatedTour = await tourService.updateTour(updateTourDTO);

        toast({
          title: "Başarılı! 🎉",
          description: "Tur başarıyla güncellendi.",
        });

      } else {
        // Create new tour
        const tourImages: CreateTourImageDTO[] = [];

        for (let i = 0; i < formData.photos.length; i++) {
          const file = formData.photos[i];

          try {
            const base64Data = await fileToBase64(file);
            tourImages.push({
              // tourId backend'de parametre ile bağlanacak (null/undefined bırak)
              imageData: base64Data,
              fileName: file.name,
              contentType: file.type || 'image/jpeg',
              displayOrder: i + 1,
            });

          } catch (error) {
            console.error(`Fotoğraf ${i + 1} işlenirken hata:`, error);
          }
        }

        const tourDates: CreateTourDateDTO[] = formData.dates.tourDates.map(
          (date) => ({
            tourId: 0,
            startDate: new Date(date.startDate).toISOString(),
            durationText: `${Math.max(
              1,
              Math.round(
                (new Date(date.endDate).getTime() -
                  new Date(date.startDate).getTime()) /
                  (60 * 60 * 1000)
              )
            )} Saat`,
            availabilityStatus: date.availabilityStatus || "AVAILABLE",
            maxGuests:
              Number(date.maxGuests) || Number(formData.dates.capacity),
          })
        );

        const createTourDTO: CreateTourDTO = {
          name: formData.details.title,
          description: formData.details.description || "",
          fullDescription: formData.details.fullDescription || formData.details.description || "",
          guideId: Number(user?.id),
          price: Number(formData.dates.price),
          capacity: Number(formData.dates.capacity),
          location: formData.location.region,
          status: "DRAFT",
          latitude: formData.location.coordinates?.lat,
          longitude: formData.location.coordinates?.lng,
          tourType: formData.details.category as any,
          // terms & policies
          cancellationPolicy: formData.terms.cancellationPolicy || undefined,
          // additional info
          includedServices: formData.additional.included || undefined,
          requirements: formData.additional.requirements || undefined,
          notAllowed: formData.additional.notAllowed || undefined,
          notSuitableFor: formData.additional.notSuitableFor || undefined,
          // location details
          routeDescription: formData.location.routeDescription || undefined,
          locationDescription: formData.location.locationDescription || undefined,
          // collections
          tourDates,
          tourImages,
          features: formData.additional.features,
          languages: formData.terms.languages,
          highlights: formData.details.highlights,
        };

        const newTour = await tourService.createTour(createTourDTO);

        toast({
          title: "Başarılı! 🎉",
          description: "Tur başarıyla oluşturuldu.",
        });

      }

      setHasUnsavedChanges(false);
      navigate("/captain/tours");
    } catch (error) {
      console.error("Tur işlemi hatası:", error);
      toast({
        title: "Hata",
        description: isEditMode
          ? "Tur güncellenirken bir hata oluştu. Lütfen tekrar deneyin."
          : "Tur oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isLastTab = activeTab === TABS[TABS.length - 1].id;
  const currentTabIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const progressPercentage = ((currentTabIndex + 1) / TABS.length) * 100;

  // Show loading screen while fetching tour data
  if (loadingTourData) {
    return (
      <CaptainLayout>
        <div className="max-w-6xl mx-auto pb-12">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#15847c]/20 rounded-full animate-ping"></div>
                <div className="relative bg-white rounded-full p-8 shadow-xl">
                  <Loader2 className="h-12 w-12 animate-spin text-[#15847c]" />
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Tur verileri yükleniyor...</p>
              <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin</p>
            </div>
          </div>
        </div>
      </CaptainLayout>
    );
  }

  return (
    <CaptainLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#15847c] to-[#0e5c56] rounded-xl shadow-lg">
                {isEditMode ? (
                  <Edit className="h-6 w-6 text-white" />
                ) : (
                  <Ship className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isEditMode ? "Tur Düzenle" : "Yeni Tur Oluştur"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditMode 
                    ? "Mevcut turunuzu güncelleyin" 
                    : "Harika bir deneyim yaratın"}
                </p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Kaydedilmemiş değişiklikler
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-[#15847c] to-[#0e5c56] text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                {completedTabs.length}/{TABS.length} Adım
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">İlerleme</span>
              <span className="text-sm font-bold text-[#15847c]">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4">
              {TABS.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                const isCompleted = completedTabs.includes(tab.id);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-[#15847c]/10 shadow-sm' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-full transition-all
                      ${isActive 
                        ? 'bg-[#15847c] text-white shadow-lg scale-110' 
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {isCompleted && !isActive ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`
                      text-xs font-medium hidden md:block
                      ${isActive ? 'text-[#15847c]' : 'text-gray-600'}
                    `}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="overflow-hidden shadow-xl border-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab Headers */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <TabsList className="bg-white shadow-sm rounded-lg p-1 w-full justify-start overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isCompleted = completedTabs.includes(tab.id);
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="
                        relative px-4 py-3 
                        data-[state=active]:bg-gradient-to-r 
                        data-[state=active]:from-[#15847c] 
                        data-[state=active]:to-[#0e5c56] 
                        data-[state=active]:text-white 
                        data-[state=active]:shadow-lg
                        rounded-md transition-all
                      "
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                        {isCompleted && (
                          <CheckCircle className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-[600px]">
              <TabsContent value="details" className="m-0 animate-in fade-in-50 duration-500">
                <TourDetailsTab
                  data={formData.details}
                  onChange={(data) => updateFormData("details", data)}
                />
              </TabsContent>

              <TabsContent value="terms" className="m-0 animate-in fade-in-50 duration-500">
                <TourTermsTab
                  data={formData.terms}
                  onChange={(data) => updateFormData("terms", data)}
                />
              </TabsContent>

              <TabsContent value="location" className="m-0 animate-in fade-in-50 duration-500">
                <TourLocationTab
                  data={formData.location}
                  onChange={(data) => updateFormData("location", data)}
                />
              </TabsContent>

              <TabsContent value="additional" className="m-0 animate-in fade-in-50 duration-500">
                <TourAdditionalInfoTab
                  data={formData.additional}
                  onChange={(data) => updateFormData("additional", data)}
                />
              </TabsContent>

              <TabsContent value="dates" className="m-0 animate-in fade-in-50 duration-500">
                <TourDatesTab
                  data={formData.dates}
                  onChange={(data) => updateFormData("dates", data)}
                />
              </TabsContent>

              <TabsContent value="photos" className="m-0 animate-in fade-in-50 duration-500">
                <TourPhotosTab
                  photos={formData.photos}
                  onChange={(photos) =>
                    setFormData((prev) => ({ ...prev, photos }))
                  }
                />
              </TabsContent>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="
                  bg-white text-red-600 border-red-300 
                  hover:bg-red-50 hover:border-red-400
                  transition-all duration-200
                "
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Vazgeç
              </Button>

              <div className="flex items-center gap-3">
                {activeTab !== TABS[0].id && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="bg-white hover:bg-gray-50 transition-all duration-200"
                    disabled={loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Geri
                  </Button>
                )}

                {isLastTab ? (
                  <Button
                    onClick={handleSubmit}
                    className="
                      bg-gradient-to-r from-green-600 to-emerald-600 
                      hover:from-green-700 hover:to-emerald-700 
                      text-white shadow-lg hover:shadow-xl
                      transition-all duration-200 min-w-[120px]
                    "
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditMode ? "Güncelleniyor..." : "Kaydediliyor..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? "Güncelle" : "Kaydet"}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="
                      bg-gradient-to-r from-[#15847c] to-[#0e5c56] 
                      hover:from-[#0e5c56] hover:to-[#15847c] 
                      text-white shadow-lg hover:shadow-xl
                      transition-all duration-200 min-w-[120px]
                    "
                    disabled={loading}
                  >
                    Devam Et
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}

                {/* Quick Save Option */}
                {!isLastTab && hasUnsavedChanges && (
                  <Button
                    onClick={handleSubmit}
                    variant="ghost"
                    className="text-gray-600 hover:text-[#15847c]"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Kaydet ve Çık
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </Card>

        {/* Help Card */}
        <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">İpucu</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Tüm alanları eksiksiz doldurmanız, turunuzun arama sonuçlarında üst sıralarda çıkmasını sağlar.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              Optimizasyon Önerileri
            </Button>
          </div>
        </Card>
      </div>
    </CaptainLayout>
  );
};

export default NewTourPage;