import React, { useState, useEffect } from "react";
import VesselCard from "./VesselCard";
import EmptyVessels from "./EmptyVessels";
import VesselFilters from "./VesselFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BoatDTO } from "@/types/boat.types";
import { getDefaultImageUrl } from "@/lib/imageUtils";

// Mock data removed - component uses real data from props

interface VesselsListProps {
  onAddVessel: () => void;
  onEditVessel: (id: string) => void;
  onDeleteVessel: (id: string) => Promise<void>;
  vessels: BoatDTO[];
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
}

const VesselsList: React.FC<VesselsListProps> = ({
  onAddVessel,
  onEditVessel,
  onDeleteVessel,
  vessels,
  loading,
  error,
  isEmpty = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [filteredVessels, setFilteredVessels] = useState(vessels);

  // Update filtered vessels when vessels prop changes
  useEffect(() => {
    setFilteredVessels(vessels);
  }, [vessels]);

  // BoatDTO to VesselCard props adapter
  const adaptBoatToVesselCard = (boat: BoatDTO) => {
    const getStatusFromBoatStatus = (status: string) => {
      switch (status?.toUpperCase()) {
        case "ACTIVE":
          return "active" as const;
        case "DRAFT":
          return "draft" as const;
        case "INACTIVE":
          return "inactive" as const;
        default:
          return "draft" as const;
      }
    };

    const getTypeDisplayName = (type: string) => {
      const typeNames: { [key: string]: string } = {
        SAILBOAT: "Yelkenli",
        MOTORBOAT: "Motor Bot",
        YACHT: "Yat",
        SPEEDBOAT: "Hız Teknesi",
        CATAMARAN: "Katamaran",
      };
      return typeNames[type] || type;
    };

    const getThumbnailUrl = (images: any[]) => {
      if (!images || images.length === 0) {
        return "https://images.unsplash.com/photo-1527679124583-9208be990bb5?q=80&w=1000";
      }

      // Geçerli fotoğrafları filtrele
      const validImages = images.filter((img) => img && img.id);
      if (validImages.length === 0) {
        return "https://images.unsplash.com/photo-1527679124583-9208be990bb5?q=80&w=1000";
      }

      // Primary image varsa onu kullan
      const primaryImage = validImages.find((img) => img.isPrimary);
      if (primaryImage) {
        return primaryImage.imageUrl || getDefaultImageUrl();
      }

      // Yoksa ilk geçerli resmi kullan
      return validImages[0].imageUrl || getDefaultImageUrl();
    };

    return {
      id: boat.id.toString(),
      name: boat.name,
      type: getTypeDisplayName(boat.type),
      brandModel: boat.brandModel || boat.model || "Belirtilmemiş",
      capacity: boat.capacity,
      buildYear: boat.buildYear || boat.year,
      status: getStatusFromBoatStatus(boat.status),
      thumbnailUrl: getThumbnailUrl(boat.images),
    };
  };

  // Handle filtering
  useEffect(() => {
    let results = [...vessels];

    // Apply search filter
    if (searchQuery) {
      results = results.filter((vessel) =>
        vessel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      results = results.filter((vessel) => {
        const typeDisplayName = adaptBoatToVesselCard(vessel).type;
        return typeDisplayName === typeFilter;
      });
    }

    // Apply capacity filter
    if (capacityFilter !== "all") {
      switch (capacityFilter) {
        case "1-6":
          results = results.filter(
            (vessel) => vessel.capacity >= 1 && vessel.capacity <= 6
          );
          break;
        case "7-12":
          results = results.filter(
            (vessel) => vessel.capacity >= 7 && vessel.capacity <= 12
          );
          break;
        case "13-20":
          results = results.filter(
            (vessel) => vessel.capacity >= 13 && vessel.capacity <= 20
          );
          break;
        case "21+":
          results = results.filter((vessel) => vessel.capacity >= 21);
          break;
        default:
          break;
      }
    }

    setFilteredVessels(results);
  }, [vessels, searchQuery, typeFilter, capacityFilter]);

  const handleDelete = (id: string) => {
    onDeleteVessel(id);
  };

  const handlePreview = (id: string) => {
    // Open preview in new tab
    window.open(`/boats/${id}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Modern Header Section */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-2xl border border-primary/10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Taşıtlarım</h1>
            <p className="text-gray-600 text-sm">
              Teknelerinizi yönetin ve müşterilerinizin rezervasyon yapmasını sağlayın
            </p>
          </div>
          <Button
            onClick={onAddVessel}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-6 py-2.5"
          >
            <Plus size={18} className="mr-2" /> Yeni Taşıt Ekle
          </Button>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl" />
        <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-lg" />
      </div>

      {isEmpty ? (
        <EmptyVessels onAddClick={onAddVessel} />
      ) : (
        <>
          <VesselFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            capacityFilter={capacityFilter}
            setCapacityFilter={setCapacityFilter}
          />

          {filteredVessels.length === 0 ? (
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sonuç Bulunamadı</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Arama kriterlerinize uygun taşıt bulunamadı. Farklı filtreler deneyebilir veya yeni bir taşıt ekleyebilirsiniz.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredVessels.map((vessel) => {
                const adaptedVessel = adaptBoatToVesselCard(vessel);
                return (
                  <div key={vessel.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                    <VesselCard
                      {...adaptedVessel}
                      onEdit={onEditVessel}
                      onDelete={handleDelete}
                      onPreview={handlePreview}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VesselsList;
