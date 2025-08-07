import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModernBoatSelector from "@/components/admin/ModernBoatSelector";
import {
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Trash2,
  Plus,
  Ship,
  Info,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/use-toast";
import { availabilityService } from "@/services/availabilityService";
import { boatService } from "@/services/boatService";
import {
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  CreateAvailabilityPeriodCommand,
} from "@/types/boat.types";
import { BoatDTO } from "@/types/boat.types";
import AvailabilityCalendar from "@/components/boats/AvailabilityCalendar";
import { CalendarAvailability } from "@/types/availability.types";
import { useAuth } from "@/contexts/AuthContext";
import { AddAvailabilityModal } from "@/components/admin/AddAvailabilityModal";
import { EditAvailabilityModal } from "@/components/admin/EditAvailabilityModal";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";

interface AvailabilityEntry {
  id: number;
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
  isInstantConfirmation?: boolean;
  boatId: number;
  displayDate: string;
  status: "available" | "unavailable" | "reserved";
}

const AvailabilityPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityEntries, setAvailabilityEntries] = useState<
    AvailabilityEntry[]
  >([]);
  const [boats, setBoats] = useState<BoatDTO[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<BoatDTO | null>(null);
  const [boatsLoading, setBoatsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AvailabilityEntry | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<AvailabilityEntry | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Calendar states
  const [calendarData, setCalendarData] = useState<CalendarAvailability[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | undefined>(undefined);
  const [calendarSelected, setCalendarSelected] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const { user, isAuthenticated } = useAuth();

  // Get current owner ID from authenticated user
  const currentOwnerId = user?.id;

  // Early return for unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <SidebarProvider>
        <CaptainLayout>
          <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Bu sayfaya erişim için giriş yapmanız gerekiyor.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-[#15847c] hover:bg-[#0e5c56] text-white px-4 py-2 rounded"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </CaptainLayout>
      </SidebarProvider>
    );
  }

  useEffect(() => {
    if (isAuthenticated && currentOwnerId) {
      fetchBoats();
    }
  }, [isAuthenticated, currentOwnerId]);

  useEffect(() => {
    if (selectedBoat) {
      fetchAvailabilityData();
      fetchCalendarData();
    }
  }, [selectedBoat]);

  useEffect(() => {
    if (selectedBoat) {
      fetchCalendarData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarMonth?.getFullYear(), calendarMonth?.getMonth()]);

  const fetchBoats = async () => {
    if (!currentOwnerId) {
      setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
      setBoatsLoading(false);
      return;
    }

    try {
      setBoatsLoading(true);
      setError(null);

      // Get boats for the current owner
      const ownerBoats = await boatService.getBoatsByOwner(currentOwnerId);

      setBoats(ownerBoats);

      // Auto-select first boat if available
      if (ownerBoats.length > 0 && !selectedBoat) {
        setSelectedBoat(ownerBoats[0]);
      }
    } catch (error) {
      console.error("Gemiler yüklenirken hata:", error);
      console.error("Error details:", error.message, error.stack);
      setError("Gemi bilgileri yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description:
          "Gemi bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setBoatsLoading(false);
    }
  };

  const fetchAvailabilityData = async () => {
    if (!selectedBoat) return;

    try {
      setLoading(true);
      setError(null);

      // Get availability data for the selected boat
      const availabilities =
        await availabilityService.getAvailabilitiesByBoatId(selectedBoat.id);

      // Convert AvailabilityData to AvailabilityEntry format
      const formattedEntries: AvailabilityEntry[] = availabilities.map(
        (availability) => ({
          id: availability.id,
          date: availability.date,
          isAvailable: availability.isAvailable,
          priceOverride: availability.priceOverride,
          isInstantConfirmation: availability.isInstantConfirmation,
          boatId: availability.boatId,
          displayDate: formatDate(availability.date),
          status: availability.isAvailable ? "available" : "unavailable",
        })
      );

      setAvailabilityEntries(formattedEntries);
    } catch (error) {
      console.error("Müsaitlik verileri yüklenirken hata:", error);
      console.error("Error details:", error.message, error.stack);
      setError("Müsaitlik bilgileri yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description:
          "Müsaitlik bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthRange = () => {
    const base = calendarMonth || new Date();
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const toISO = (d: Date) => d.toISOString().split("T")[0];
    return { start: toISO(start), end: toISO(end) };
  };

  const fetchCalendarData = async () => {
    if (!selectedBoat) return;
    try {
      setCalendarLoading(true);
      setCalendarError(undefined);
      const { start, end } = getCurrentMonthRange();
      const data = await availabilityService.getCalendarAvailability(
        selectedBoat.id,
        start,
        end
      );
      setCalendarData(data);
    } catch (error: any) {
      console.error("Takvim verileri yüklenirken hata:", error);
      setCalendarError(error?.message || "Takvim verileri yüklenemedi");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleUpdateAvailability = async (data: {
    id: number;
    date?: string;
    isAvailable?: boolean;
    priceOverride?: number;
    isInstantConfirmation?: boolean;
  }) => {
    try {
      const updateCommand: UpdateAvailabilityDTO = {
        id: data.id,
        date: data.date,
        isAvailable: data.isAvailable,
        priceOverride: data.priceOverride,
        isInstantConfirmation: data.isInstantConfirmation,
      };

      const response = await availabilityService.updateAvailability(
        updateCommand
      );

      const updatedEntry: AvailabilityEntry = {
        id: response.id,
        date: response.date,
        isAvailable: response.isAvailable,
        priceOverride: response.priceOverride,
        isInstantConfirmation: response.isInstantConfirmation,
        boatId: response.boatId,
        displayDate: formatDate(response.date),
        status: response.isAvailable ? "available" : "unavailable",
      };

      setAvailabilityEntries((prev) =>
        prev.map((entry) => (entry.id === data.id ? updatedEntry : entry))
      );
      // Refresh calendar
      fetchCalendarData();

      toast({
        title: "Başarılı",
        description: "Müsaitlik güncellendi.",
      });
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast({
        title: "Hata",
        description: "Müsaitlik güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {
      await availabilityService.deleteAvailability(id);
      setAvailabilityEntries((prev) => prev.filter((entry) => entry.id !== id));
      // Refresh calendar
      fetchCalendarData();

      toast({
        title: "Başarılı",
        description: "Müsaitlik silindi.",
      });
    } catch (error) {
      console.error("Failed to delete availability:", error);
      toast({
        title: "Hata",
        description: "Müsaitlik silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDeleteDialog = (entry: AvailabilityEntry) => {
    setDeletingEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingEntry(null);
    setDeleteLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return;

    setDeleteLoading(true);
    try {
      await handleDeleteAvailability(deletingEntry.id);
      handleCloseDeleteDialog();
    } catch (error) {
      // Error is already handled in handleDeleteAvailability
      setDeleteLoading(false);
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      const entry = availabilityEntries.find((e) => e.id === id);
      if (!entry) return;

      await availabilityService.setAvailabilityStatus(id, !entry.isAvailable);

      setAvailabilityEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                isAvailable: !e.isAvailable,
                status: !e.isAvailable ? "available" : "unavailable",
              }
            : e
        )
      );
      // Refresh calendar
      fetchCalendarData();

      toast({
        title: "Başarılı",
        description: `Müsaitlik durumu ${
          !entry.isAvailable ? "müsait" : "müsait değil"
        } olarak güncellendi.`,
      });
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      toast({
        title: "Hata",
        description: "Müsaitlik durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAddAvailabilityPeriod = async (data: {
    startDate: string;
    endDate: string;
    isAvailable: boolean;
    priceOverride?: number;
    isInstantConfirmation?: boolean;
  }) => {
    if (!selectedBoat) {
      toast({
        title: "Hata",
        description: "Lütfen önce bir gemi seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const command: CreateAvailabilityPeriodCommand = {
        boatId: selectedBoat.id,
        startDate: data.startDate,
        endDate: data.endDate,
        isAvailable: data.isAvailable,
        priceOverride: data.priceOverride,
        isInstantConfirmation: data.isInstantConfirmation,
      };

      await availabilityService.createAvailabilityPeriod(command);

      // Refresh data after creating period
      await fetchAvailabilityData();
      await fetchCalendarData();

      toast({
        title: "Başarılı",
        description: "Dönem müsaitliği başarıyla oluşturuldu.",
      });
    } catch (error) {
      console.error("Failed to create availability period:", error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleCalendarSelect = async (date?: Date) => {
    setCalendarSelected(date);
    if (!date || !selectedBoat) return;
    const iso = date.toISOString().split("T")[0];
    // Var olan kayıt varsa düzenleme modalını aç
    const existing = availabilityEntries.find((e) => e.date === iso);
    if (existing) {
      handleOpenEditModal(existing);
      return;
    }
    // Yoksa ekleme modalını aç (kullanıcı tarihleri seçer)
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (entry: AvailabilityEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEntry(null);
  };

  // Helper function for formatting dates
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading state for boats
  if (boatsLoading) {
    return (
      <SidebarProvider>
        <CaptainLayout>
          <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15847c] mx-auto mb-4"></div>
              <p className="text-gray-600">Gemi bilgileri yükleniyor...</p>
            </div>
          </div>
        </CaptainLayout>
      </SidebarProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <SidebarProvider>
        <CaptainLayout>
          <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchBoats}
                className="bg-[#15847c] hover:bg-[#0e5c56] text-white px-4 py-2 rounded"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </CaptainLayout>
      </SidebarProvider>
    );
  }

  // No boats available
  if (boats.length === 0) {
    return (
      <SidebarProvider>
        <CaptainLayout>
          <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="text-center">
              <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Henüz kayıtlı geminiz bulunmamaktadır.
              </p>
              <p className="text-sm text-gray-500">
                Müsaitlik yönetimi için önce bir gemi eklemeniz gerekiyor.
              </p>
            </div>
          </div>
        </CaptainLayout>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <CaptainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Clock className="mr-2" />
              Müsaitlik Yönetimi
            </h1>

            <Button
              className="bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
              onClick={() => setIsAddModalOpen(true)}
              disabled={!selectedBoat}
            >
              <Plus size={16} className="mr-1" /> Yeni Müsaitlik Ekle
            </Button>
          </div>

          {/* Modern Boat Selector */}
          <ModernBoatSelector
            boats={boats}
            selectedBoat={selectedBoat}
            onBoatSelect={setSelectedBoat}
            loading={boatsLoading}
          />

          {/* Selected Boat Info */}
          {selectedBoat && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    {selectedBoat.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-blue-700">
                    <div>
                      <span className="font-medium">Tip:</span>{" "}
                      {selectedBoat.type}
                    </div>
                    <div>
                      <span className="font-medium">Lokasyon:</span>{" "}
                      {selectedBoat.location}
                    </div>
                    <div>
                      <span className="font-medium">Kapasite:</span>{" "}
                      {selectedBoat.capacity} kişi
                    </div>
                    <div>
                      <span className="font-medium">Günlük Fiyat:</span> ₺
                      {selectedBoat.dailyPrice}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of the component remains the same */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none">
                <TabsTrigger value="calendar">Takvim</TabsTrigger>
                <TabsTrigger value="available">Müsait Günler</TabsTrigger>
                <TabsTrigger value="unavailable">
                  Müsait Olmayan Günler
                </TabsTrigger>
                <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="p-6">
                <AvailabilityCalendar
                  selected={calendarSelected}
                  onSelect={handleCalendarSelect}
                  availabilityData={calendarData}
                  isLoading={calendarLoading}
                  error={calendarError}
                  onRetry={fetchCalendarData}
                  language="tr"
                  month={calendarMonth}
                  onMonthChange={(m)=> setCalendarMonth(m)}
                />
              </TabsContent>

              <TabsContent value="available" className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#15847c]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availabilityEntries
                      .filter((entry) => entry.isAvailable)
                      .map((entry) => (
                        <AvailabilityCard
                          key={entry.id}
                          entry={entry}
                          onToggle={handleToggleAvailability}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteDialog}
                        />
                      ))}

                    {availabilityEntries.filter((entry) => entry.isAvailable)
                      .length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Henüz müsait gün eklenmemiş.</p>
                        <Button
                          className="mt-4 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
                          onClick={() => setIsAddModalOpen(true)}
                          disabled={!selectedBoat}
                        >
                          <Plus size={16} className="mr-1" /> Müsaitlik Ekle
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unavailable" className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#15847c]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availabilityEntries
                      .filter((entry) => !entry.isAvailable)
                      .map((entry) => (
                        <AvailabilityCard
                          key={entry.id}
                          entry={entry}
                          onToggle={handleToggleAvailability}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteDialog}
                        />
                      ))}

                    {availabilityEntries.filter((entry) => !entry.isAvailable)
                      .length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Müsait olmayan gün bulunmamaktadır.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#15847c]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availabilityEntries
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((entry) => (
                        <AvailabilityCard
                          key={entry.id}
                          entry={entry}
                          onToggle={handleToggleAvailability}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteDialog}
                        />
                      ))}

                    {availabilityEntries.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Henüz müsaitlik kaydı bulunmamaktadır.</p>
                        <Button
                          className="mt-4 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
                          onClick={() => setIsAddModalOpen(true)}
                          disabled={!selectedBoat}
                        >
                          <Plus size={16} className="mr-1" /> Müsaitlik Ekle
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add Availability Modal */}
        <AddAvailabilityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAvailabilityPeriod}
          selectedBoat={selectedBoat}
        />

        {/* Edit Availability Modal */}
        <EditAvailabilityModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateAvailability}
          availabilityEntry={editingEntry}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Müsaitlik Kaydını Sil"
          message={
            deletingEntry
              ? `"${deletingEntry.displayDate}" tarihli müsaitlik kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
              : "Bu müsaitlik kaydını silmek istediğinizden emin misiniz?"
          }
          confirmText="Sil"
          cancelText="İptal"
          variant="destructive"
          loading={deleteLoading}
        />
      </CaptainLayout>
    </SidebarProvider>
  );
};

interface AvailabilityCardProps {
  entry: AvailabilityEntry;
  onToggle: (id: number) => void;
  onEdit: (entry: AvailabilityEntry) => void;
  onDelete: (entry: AvailabilityEntry) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  entry,
  onToggle,
  onEdit,
  onDelete,
  isLoading = false,
  error = null,
}) => {
  const [actionLoading, setActionLoading] = useState<{
    toggle: boolean;
    edit: boolean;
    delete: boolean;
  }>({
    toggle: false,
    edit: false,
    delete: false,
  });

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "font-medium text-xs px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm";

    switch (status) {
      case "available":
        return (
          <Badge
            className={`${baseClasses} bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 hover:shadow-md`}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="font-semibold">Müsait</span>
            </div>
          </Badge>
        );
      case "unavailable":
        return (
          <Badge
            className={`${baseClasses} bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 hover:from-slate-100 hover:to-slate-200 hover:shadow-md`}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-slate-500 rounded-full shadow-sm"></div>
              <span className="font-semibold">Müsait Olmayan</span>
            </div>
          </Badge>
        );
      case "reserved":
        return (
          <Badge
            className={`${baseClasses} bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-md`}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="font-semibold">Rezerve</span>
            </div>
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleToggle = async () => {
    if (actionLoading.toggle) return;

    setActionLoading((prev) => ({ ...prev, toggle: true }));
    try {
      await onToggle(entry.id);
    } catch (error) {
      console.error("Toggle failed:", error);
      toast({
        title: "Hata",
        description:
          "Durum değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, toggle: false }));
    }
  };

  const handleEdit = async () => {
    if (actionLoading.edit) return;

    setActionLoading((prev) => ({ ...prev, edit: true }));
    try {
      await onEdit(entry);
    } catch (error) {
      console.error("Edit failed:", error);
      toast({
        title: "Hata",
        description:
          "Düzenleme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, edit: false }));
    }
  };

  const handleDelete = async () => {
    if (actionLoading.delete) return;

    setActionLoading((prev) => ({ ...prev, delete: true }));
    try {
      await onDelete(entry);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Hata",
        description:
          "Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div
      className={`
      relative border rounded-xl p-5 bg-white shadow-sm hover:shadow-lg 
      transition-all duration-300 hover:border-blue-200 hover:-translate-y-0.5 group
      backdrop-blur-sm border-gray-200/50 animate-in fade-in-0 slide-in-from-bottom-2
      ${isLoading ? "opacity-60 pointer-events-none" : ""}
      ${
        error
          ? "border-red-200 bg-gradient-to-br from-red-50 to-red-25"
          : "hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-white"
      }
    `}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 shadow-sm"></div>
            <span className="text-xs text-gray-600 font-medium">
              Yükleniyor...
            </span>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-75 shadow-sm"></div>
        </div>
      )}

      <div className="flex flex-col space-y-4 min-h-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-900 transition-colors duration-200 leading-tight">
              {entry.displayDate}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg px-2 py-1 w-fit">
              <CalendarIcon
                size={14}
                className="mr-1.5 flex-shrink-0 text-gray-400"
              />
              <span className="truncate font-medium">{entry.date}</span>
            </div>
          </div>

          {/* Status and Price Section */}
          <div className="flex flex-col sm:items-end gap-2">
            {getStatusBadge(entry.status)}
            <div className="flex flex-wrap gap-2">
              {entry.priceOverride && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200 hover:from-amber-100 hover:to-amber-200 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-amber-600">₺</span>
                    <span className="font-bold">
                      {entry.priceOverride.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </Badge>
              )}
              {entry.isInstantConfirmation && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200 hover:from-green-100 hover:to-green-200 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">⚡</span>
                    <span className="font-bold">Anında Onay</span>
                  </div>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-700 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 rounded-lg border border-red-200 shadow-sm">
            <div className="flex items-start gap-2">
              <Info size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-800 mb-1">Hata Oluştu</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100/80">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={actionLoading.toggle || isLoading}
            className={`
              flex-1 sm:flex-none transition-all duration-200 font-medium shadow-sm hover:shadow-md
              ${
                entry.isAvailable
                  ? "text-orange-700 border-orange-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:border-orange-300"
                  : "text-emerald-700 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:border-emerald-300"
              }
              ${actionLoading.toggle ? "opacity-50" : ""}
            `}
            title={entry.isAvailable ? "Müsait Olmayan Yap" : "Müsait Yap"}
          >
            {actionLoading.toggle ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                <span className="hidden sm:inline font-medium">
                  İşleniyor...
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    entry.isAvailable ? "bg-orange-500" : "bg-emerald-500"
                  }`}
                ></div>
                <span className="truncate font-medium">
                  {entry.isAvailable ? "Müsait Olmayan Yap" : "Müsait Yap"}
                </span>
              </div>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-9 w-full sm:w-10 text-blue-600 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md group/edit"
              title="Düzenle"
              onClick={handleEdit}
              disabled={actionLoading.edit || isLoading}
            >
              {actionLoading.edit ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Edit
                    size={16}
                    className="group-hover/edit:scale-110 transition-transform duration-200"
                  />
                  <span className="ml-1 sm:hidden font-medium">Düzenle</span>
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-9 w-full sm:w-10 text-red-600 border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md group/delete"
              title="Sil"
              onClick={handleDelete}
              disabled={actionLoading.delete || isLoading}
            >
              {actionLoading.delete ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2
                    size={16}
                    className="group-hover/delete:scale-110 transition-transform duration-200"
                  />
                  <span className="ml-1 sm:hidden font-medium">Sil</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
