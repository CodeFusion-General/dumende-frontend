import React, { useState, useEffect } from "react";
import VesselCard from "./VesselCard";
import EmptyVessels from "./EmptyVessels";
import VesselFilters from "./VesselFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BoatDTO } from "@/types/boat.types";
import { getImageUrl } from "@/lib/imageUtils";

// Mock data for vessel items
const mockVessels = [
  {
    id: "1",
    name: "Blue Horizon",
    type: "Yat",
    brandModel: "Azimut 55",
    capacity: 12,
    buildYear: 2019,
    status: "active" as const,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1527679124583-9208be990bb5?q=80&w=1000",
  },
  {
    id: "2",
    name: "Sea Paradise",
    type: "Gulet",
    brandModel: "Custom Wooden 24m",
    capacity: 18,
    buildYear: 2015,
    status: "draft" as const,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1599054802207-91d346adc120?q=80&w=1000",
  },
  {
    id: "3",
    name: "Swift Wave",
    type: "Sürat Teknesi",
    brandModel: "Sunseeker Predator 68",
    capacity: 8,
    buildYear: 2021,
    status: "inactive" as const,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=1000",
  },
];

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
        return getImageUrl(primaryImage.id);
      }

      // Yoksa ilk geçerli resmi kullan
      return getImageUrl(validImages[0].id);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Taşıtlarım</h1>
        <Button
          onClick={onAddVessel}
          className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
        >
          <Plus size={16} className="mr-1" /> Taşıt Ekle
        </Button>
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
            <div className="bg-white p-6 rounded-lg text-center">
              <p className="text-gray-500">
                Arama kriterlerinize uygun taşıt bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVessels.map((vessel) => {
                const adaptedVessel = adaptBoatToVesselCard(vessel);
                return (
                  <VesselCard
                    key={vessel.id}
                    {...adaptedVessel}
                    onEdit={onEditVessel}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                  />
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
