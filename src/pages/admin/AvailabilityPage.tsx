import React, { useState, useEffect } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AvailabilityDTO,
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  CreateAvailabilityPeriodCommand,
  CalendarAvailability,
} from "@/types/availability.types";
import { BoatDTO } from "@/types/boat.types";

interface AvailabilityEntry {
  id: number;
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
  boatId: number;
  displayDate: string;
  status: "available" | "unavailable" | "reserved";
}

const AvailabilityPage = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityEntries, setAvailabilityEntries] = useState<
    AvailabilityEntry[]
  >([]);
  const [boats, setBoats] = useState<BoatDTO[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<BoatDTO | null>(null);
  const [boatsLoading, setBoatsLoading] = useState(true);

  // TODO: Get from auth context - temporarily hardcoded owner ID
  const currentOwnerId = 2; // Ahmet Yılmaz from test data


  useEffect(() => {
    fetchBoats();
  }, []);

  useEffect(() => {
    if (selectedBoat) {
      fetchAvailabilityData();
    }
  }, [selectedBoat]);

  const fetchBoats = async () => {

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


      // Convert AvailabilityDTO to AvailabilityEntry format
      const formattedEntries: AvailabilityEntry[] = availabilities.map(
        (availability) => ({
          id: availability.id,
          date: availability.date,
          isAvailable: availability.isAvailable,
          priceOverride: availability.priceOverride,
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

  const handleBoatChange = (boatId: string) => {
    const boat = boats.find((b) => b.id.toString() === boatId);
    if (boat) {
      setSelectedBoat(boat);
    }
  };

  const handleAddAvailability = async (
    data: Partial<CreateAvailabilityDTO>
  ) => {
    if (!selectedBoat) {
      toast({
        title: "Hata",
        description: "Lütfen önce bir gemi seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const createCommand: CreateAvailabilityDTO = {
        boatId: selectedBoat.id,
        date: data.date!,
        isAvailable: data.isAvailable ?? true,
        priceOverride: data.priceOverride,
      };


      const response = await availabilityService.createAvailability(
        createCommand
      );

      const newEntry: AvailabilityEntry = {
        id: response.id,
        date: response.date,
        isAvailable: response.isAvailable,
        priceOverride: response.priceOverride,
        boatId: response.boatId,
        displayDate: formatDate(response.date),
        status: response.isAvailable ? "available" : "unavailable",
      };

      setAvailabilityEntries((prev) => [...prev, newEntry]);

      toast({
        title: "Başarılı",
        description: "Yeni müsaitlik eklendi.",
      });

    } catch (error) {
      console.error("Failed to add availability:", error);
      toast({
        title: "Hata",
        description: "Müsaitlik eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAvailability = async (
    id: number,
    data: Partial<UpdateAvailabilityDTO>
  ) => {
    try {
      const updateCommand: UpdateAvailabilityDTO = {
        id,
        ...data,
      };


      const response = await availabilityService.updateAvailability(
        updateCommand
      );

      const updatedEntry: AvailabilityEntry = {
        id: response.id,
        date: response.date,
        isAvailable: response.isAvailable,
        priceOverride: response.priceOverride,
        boatId: response.boatId,
        displayDate: formatDate(response.date),
        status: response.isAvailable ? "available" : "unavailable",
      };

      setAvailabilityEntries((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry))
      );

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
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {

      await availabilityService.deleteAvailability(id);
      setAvailabilityEntries((prev) => prev.filter((entry) => entry.id !== id));

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

  const handleCreatePeriod = async (
    startDate: string,
    endDate: string,
    isAvailable: boolean = true
  ) => {
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
        startDate,
        endDate,
        isAvailable,
      };

      await availabilityService.createAvailabilityPeriod(command);

      // Refresh data after creating period
      await fetchAvailabilityData();

      toast({
        title: "Başarılı",
        description: "Dönem müsaitliği başarıyla oluşturuldu.",
      });

    } catch (error) {
      console.error("Failed to create availability period:", error);
      toast({
        title: "Hata",
        description: "Dönem müsaitliği oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

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
          {/* Header with Boat Selector */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold flex items-center">
                <Clock className="mr-2" />
                Müsaitlik
              </h1>

              {/* Boat Selector */}
              <div className="flex items-center space-x-2">
                <Ship className="h-5 w-5 text-gray-600" />
                <Select
                  value={selectedBoat?.id.toString()}
                  onValueChange={handleBoatChange}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Gemi seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {boats.map((boat) => (
                      <SelectItem key={boat.id} value={boat.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{boat.name}</span>
                          <span className="text-sm text-gray-500">
                            ({boat.location})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
              onClick={() => {
                // TODO: Open add availability modal
                const today = new Date().toISOString().split("T")[0];
                handleAddAvailability({ date: today, isAvailable: true });
              }}
              disabled={!selectedBoat}
            >
              <Plus size={16} className="mr-1" /> Yeni Müsaitlik Ekle
            </Button>
          </div>

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
            <Tabs
              defaultValue="available"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="w-full justify-start border-b rounded-none">
                <TabsTrigger value="available">Müsait Günler</TabsTrigger>
                <TabsTrigger value="unavailable">
                  Müsait Olmayan Günler
                </TabsTrigger>
                <TabsTrigger value="all">Tüm Kayıtlar</TabsTrigger>
              </TabsList>

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
                          onUpdate={handleUpdateAvailability}
                          onDelete={handleDeleteAvailability}
                        />
                      ))}

                    {availabilityEntries.filter((entry) => entry.isAvailable)
                      .length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Henüz müsait gün eklenmemiş.</p>
                        <Button
                          className="mt-4 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
                          onClick={() => {
                            const today = new Date()
                              .toISOString()
                              .split("T")[0];
                            handleAddAvailability({
                              date: today,
                              isAvailable: true,
                            });
                          }}
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
                          onUpdate={handleUpdateAvailability}
                          onDelete={handleDeleteAvailability}
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
                          onUpdate={handleUpdateAvailability}
                          onDelete={handleDeleteAvailability}
                        />
                      ))}

                    {availabilityEntries.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Henüz müsaitlik kaydı bulunmamaktadır.</p>
                        <Button
                          className="mt-4 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
                          onClick={() => {
                            const today = new Date()
                              .toISOString()
                              .split("T")[0];
                            const weekLater = new Date(
                              Date.now() + 7 * 24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .split("T")[0];
                            handleCreatePeriod(today, weekLater, true);
                          }}
                          disabled={!selectedBoat}
                        >
                          <Plus size={16} className="mr-1" /> Haftalık Müsaitlik
                          Oluştur
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CaptainLayout>
    </SidebarProvider>
  );
};

interface AvailabilityCardProps {
  entry: AvailabilityEntry;
  onToggle: (id: number) => void;
  onUpdate: (id: number, data: Partial<UpdateAvailabilityDTO>) => void;
  onDelete: (id: number) => void;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  entry,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Müsait</Badge>
        );
      case "unavailable":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            Müsait Olmayan
          </Badge>
        );
      case "reserved":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Rezerve</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 hover:shadow transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="space-y-2 mb-4 md:mb-0">
          <h3 className="font-medium">{entry.displayDate}</h3>
          <div className="flex items-center space-x-2">
            {getStatusBadge(entry.status)}
            {entry.priceOverride && (
              <Badge variant="outline" className="text-xs">
                ₺{entry.priceOverride}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon size={14} className="mr-1" />
            {entry.date}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(entry.id)}
            className={
              entry.isAvailable
                ? "text-orange-600 hover:bg-orange-50"
                : "text-green-600 hover:bg-green-50"
            }
            title={entry.isAvailable ? "Müsait Olmayan Yap" : "Müsait Yap"}
          >
            {entry.isAvailable ? "Müsait Olmayan Yap" : "Müsait Yap"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="Düzenle"
            onClick={() => {
              // TODO: Open edit modal with current values
              const newPrice = prompt(
                "Yeni fiyat (boş bırakabilirsiniz):",
                entry.priceOverride?.toString() || ""
              );
              if (newPrice !== null) {
                const priceOverride = newPrice
                  ? parseFloat(newPrice)
                  : undefined;
                onUpdate(entry.id, { priceOverride });
              }
            }}
          >
            <Edit size={16} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-white hover:bg-red-500"
            title="Sil"
            onClick={() => {
              if (
                confirm(
                  "Bu müsaitlik kaydını silmek istediğinizden emin misiniz?"
                )
              ) {
                onDelete(entry.id);
              }
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
