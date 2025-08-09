import React, { useEffect, useState } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Info, 
  Plus, 
  MapPin, 
  Users, 
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Ship,
  AlertCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import AvailabilityCalendar from "@/components/boats/AvailabilityCalendar";
import { CalendarAvailability } from "@/types/availability.types";
import { availabilityService } from "@/services/availabilityService";
import { tourService } from "@/services/tourService";
import { TourDTO } from "@/types/tour.types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import AddTourAvailabilityModal from "@/components/admin/AddTourAvailabilityModal";
import { EditAvailabilityModal } from "@/components/admin/EditAvailabilityModal";

interface AvailabilityEntry {
  id: number;
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
  isInstantConfirmation?: boolean;
  tourId: number;
  displayDate: string;
  status: "available" | "unavailable" | "reserved";
}

const TourAvailabilityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tours, setTours] = useState<TourDTO[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourDTO | null>(null);
  const [loadingTours, setLoadingTours] = useState(true);
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);

  const [calendarData, setCalendarData] = useState<CalendarAvailability[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | undefined>(undefined);
  const [calendarSelected, setCalendarSelected] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AvailabilityEntry | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoadingTours(true);
        const guideId = Number(user?.id);
        const data = await tourService.getToursByGuideId(guideId);
        setTours(data);
        if (data.length > 0) setSelectedTour(data[0]);
      } catch (e) {
        toast({ 
          title: "Hata", 
          description: "Turlar yüklenemedi", 
          variant: "destructive" 
        });
      } finally {
        setLoadingTours(false);
      }
    };
    if (isAuthenticated) loadTours();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!selectedTour) return;
    fetchEntries();
    fetchCalendar();
  }, [selectedTour]);

  useEffect(() => {
    if (!selectedTour) return;
    fetchCalendar();
  }, [calendarMonth?.getFullYear(), calendarMonth?.getMonth()]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  const getMonthRange = () => {
    const base = calendarMonth || new Date();
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const toISO = (d: Date) => d.toISOString().split("T")[0];
    return { start: toISO(start), end: toISO(end) };
  };

  const fetchEntries = async () => {
    if (!selectedTour) return;
    try {
      const list = await availabilityService.getAvailabilitiesByTourId(selectedTour.id);
      const mapped: AvailabilityEntry[] = list.map((a) => ({
        id: a.id,
        date: a.date,
        isAvailable: a.isAvailable,
        priceOverride: a.priceOverride,
        isInstantConfirmation: a.isInstantConfirmation,
        tourId: a.tourId!,
        displayDate: formatDate(a.date),
        status: a.isAvailable ? "available" : "unavailable",
      }));
      setEntries(mapped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const fetchCalendar = async () => {
    if (!selectedTour) return;
    try {
      setCalendarLoading(true);
      setCalendarError(undefined);
      const { start, end } = getMonthRange();
      const data = await availabilityService.getTourCalendarAvailability(
        selectedTour.id,
        start,
        end
      );
      setCalendarData(data);
    } catch (e: any) {
      setCalendarError(e?.message || "Takvim verileri yüklenemedi");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCalendarSelect = (date?: Date) => {
    setCalendarSelected(date);
    if (!date || !selectedTour) return;
    
    const iso = date.toISOString().split("T")[0];
    const existing = entries.find((e) => e.date === iso);
    
    if (existing) {
      setEditingEntry(existing);
      setIsEditOpen(true);
    } else {
      setIsAddOpen(true);
    }
  };

  const handleAdd = async (data: { 
    startDate: string; 
    endDate: string; 
    isAvailable: boolean; 
    priceOverride?: number; 
    isInstantConfirmation?: boolean; 
  }) => {
    if (!selectedTour) return;
    
    try {
      await availabilityService.createTourAvailabilityPeriod({
        tourId: selectedTour.id,
        startDate: data.startDate,
        endDate: data.endDate,
        isAvailable: data.isAvailable,
        priceOverride: data.priceOverride,
        isInstantConfirmation: data.isInstantConfirmation,
      });
      
      await fetchEntries();
      await fetchCalendar();
      
      toast({ 
        title: "Başarılı ✅", 
        description: "Dönem müsaitliği oluşturuldu." 
      });
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: "Müsaitlik eklenirken bir hata oluştu.", 
        variant: "destructive" 
      });
    }
  };

  const handleUpdate = async (data: { 
    id: number; 
    date?: string; 
    isAvailable?: boolean; 
    priceOverride?: number; 
    isInstantConfirmation?: boolean; 
  }) => {
    try {
      await availabilityService.updateAvailability({
        id: data.id,
        date: data.date,
        isAvailable: data.isAvailable,
        priceOverride: data.priceOverride,
        isInstantConfirmation: data.isInstantConfirmation,
      });
      
      await fetchEntries();
      await fetchCalendar();
      
      toast({ 
        title: "Başarılı ✅", 
        description: "Müsaitlik güncellendi." 
      });
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: "Güncelleme sırasında bir hata oluştu.", 
        variant: "destructive" 
      });
    }
  };

  const handleToggle = async (id: number) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    
    try {
      setTogglingId(id);
      await availabilityService.setAvailabilityStatus(id, !entry.isAvailable);
      await fetchEntries();
      await fetchCalendar();
      
      toast({ 
        title: "Başarılı ✅", 
        description: `Durum ${!entry.isAvailable ? 'müsait' : 'müsait değil'} olarak güncellendi.` 
      });
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: "Durum güncellenirken bir hata oluştu.", 
        variant: "destructive" 
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (entry: AvailabilityEntry) => {
    if (!window.confirm(`${entry.displayDate} tarihli müsaitliği silmek istediğinize emin misiniz?`)) {
      return;
    }
    
    try {
      setDeletingId(entry.id);
      await availabilityService.deleteAvailability(entry.id);
      await fetchEntries();
      await fetchCalendar();
      
      toast({ 
        title: "Başarılı ✅", 
        description: "Müsaitlik kaydı silindi." 
      });
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: "Silme işlemi sırasında bir hata oluştu.", 
        variant: "destructive" 
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate statistics
  const stats = {
    totalDays: entries.length,
    availableDays: entries.filter(e => e.isAvailable).length,
    unavailableDays: entries.filter(e => !e.isAvailable).length,
    instantConfirmation: entries.filter(e => e.isInstantConfirmation).length,
  };

  return (
    <SidebarProvider>
      <CaptainLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#15847c] to-[#0e5c56] rounded-2xl opacity-10"></div>
            <div className="relative p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#15847c] to-[#0e5c56] rounded-xl shadow-lg">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Tur Müsaitliği</h1>
                    <p className="text-gray-600 mt-1">Turlarınızın müsaitlik takvimini yönetin</p>
                  </div>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-[#15847c] to-[#0e5c56] hover:from-[#0e5c56] hover:to-[#15847c] text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                  onClick={() => setIsAddOpen(true)} 
                  disabled={!selectedTour}
                >
                  <Plus className="h-4 w-4 mr-2" /> 
                  Yeni Müsaitlik Ekle
                </Button>
              </div>
            </div>
          </div>

          {/* Tour Selector Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Ship className="h-5 w-5 text-[#15847c]" />
              <h2 className="text-lg font-semibold">Tur Seçimi</h2>
            </div>
            
            {loadingTours ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#15847c]" />
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-8">
                <Ship className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Henüz tur kaydınız bulunmuyor</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/captain/tours/new'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Turunuzu Oluşturun
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Tur Seçin</label>
                  <select
                    className="w-full border-2 rounded-lg h-12 px-4 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                    value={selectedTour?.id || ''}
                    onChange={(e) => setSelectedTour(tours.find(t => t.id === Number(e.target.value)) || null)}
                  >
                    {tours.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedTour && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#15847c]" />
                        <span className="text-sm font-medium text-gray-700">{selectedTour.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#15847c]" />
                        <span className="text-sm font-medium text-gray-700">{selectedTour.capacity} kişi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#15847c] font-semibold">₺</span>
                        <span className="text-sm font-medium text-gray-700">₺{Number(selectedTour.price).toLocaleString('tr-TR')}</span>
                      </div>
                      <div>
                        <Badge className="bg-[#15847c]/10 text-[#15847c] border-[#15847c]">
                          {selectedTour.tourType || 'TUR'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Statistics Cards */}
          {selectedTour && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Gün</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalDays}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Müsait</p>
                    <p className="text-2xl font-bold text-green-600">{stats.availableDays}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Dolu</p>
                    <p className="text-2xl font-bold text-red-600">{stats.unavailableDays}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Anında Onay</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.instantConfirmation}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Calendar */}
          {selectedTour && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-[#15847c]" />
                    <h2 className="text-lg font-semibold">Müsaitlik Takvimi</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Müsait</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Dolu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span>Rezerve</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AvailabilityCalendar
                  selected={calendarSelected}
                  onSelect={handleCalendarSelect}
                  availabilityData={calendarData}
                  isLoading={calendarLoading}
                  error={calendarError}
                  onRetry={fetchCalendar}
                  language="tr"
                  month={calendarMonth}
                  onMonthChange={(m) => setCalendarMonth(m)}
                />
              </div>
            </Card>
          )}

          {/* Entries List */}
          {selectedTour && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#15847c]" />
                    <h2 className="text-lg font-semibold">Müsaitlik Kayıtları</h2>
                  </div>
                  <Badge variant="outline" className="bg-[#15847c]/10 text-[#15847c] border-[#15847c]">
                    {entries.length} Kayıt
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">Henüz müsaitlik kaydı yok</p>
                    <p className="text-sm text-gray-400 mb-4">Takvimden tarih seçerek veya dönem ekleyerek başlayın</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddOpen(true)}
                      className="hover:bg-[#15847c] hover:text-white hover:border-[#15847c] transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Müsaitliği Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map(e => (
                      <div 
                        key={e.id} 
                        className="flex items-center justify-between border-2 rounded-xl p-4 hover:border-[#15847c] transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${e.isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
                            {e.isAvailable ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-800">{e.displayDate}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge 
                                variant="outline" 
                                className={e.isAvailable ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}
                              >
                                {e.isAvailable ? 'Müsait' : 'Müsait Değil'}
                              </Badge>
                              {e.priceOverride && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                  <span className="mr-1">₺</span>
                                  {e.priceOverride.toLocaleString('tr-TR')}
                                </Badge>
                              )}
                              {e.isInstantConfirmation && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Anında Onay
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => { setEditingEntry(e); setIsEditOpen(true); }}
                            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggle(e.id)}
                            disabled={togglingId === e.id}
                            className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                          >
                            {togglingId === e.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : e.isAvailable ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(e)}
                            disabled={deletingId === e.id}
                            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          >
                            {deletingId === e.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Info Box */}
          <Card className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Takvim Kullanım İpuçları</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Takvimden bir tarih seçerek o güne özel müsaitlik ekleyebilirsiniz</li>
                  <li>"Yeni Müsaitlik Ekle" ile birden fazla gün için toplu ekleme yapabilirsiniz</li>
                  <li>Özel fiyatlandırma ve anında onay seçeneklerini kullanabilirsiniz</li>
                  <li>Müsait olmayan günler otomatik olarak rezervasyon almayacaktır</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Modals */}
          <AddTourAvailabilityModal 
            isOpen={isAddOpen} 
            onClose={() => setIsAddOpen(false)} 
            onSubmit={handleAdd} 
            selectedTourName={selectedTour?.name}
            selectedDate={calendarSelected}
          />
          
          <EditAvailabilityModal 
            isOpen={isEditOpen} 
            onClose={() => {
              setIsEditOpen(false);
              setEditingEntry(null);
            }} 
            onSubmit={handleUpdate} 
            availabilityEntry={editingEntry as any} 
          />
        </div>
      </CaptainLayout>
    </SidebarProvider>
  );
};

export default TourAvailabilityPage;