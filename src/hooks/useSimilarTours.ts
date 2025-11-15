import { useQuery } from "@tanstack/react-query";
import { TourDTO } from "@/types/tour.types";
import { tourService } from "@/services/tourService";

interface UseSimilarToursOptions {
  currentTour?: TourDTO;
  limit?: number;
}

interface UseSimilarToursReturn {
  similarTours: TourDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSimilarTours = ({
  currentTour,
  limit = 6,
}: UseSimilarToursOptions): UseSimilarToursReturn => {
  const typeFilter = currentTour?.type;
  const locationFilter = currentTour?.location;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["similar-tours", typeFilter, locationFilter],
    enabled: !!currentTour,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      if (!currentTour) {
        return [] as TourDTO[];
      }

      const filters: {
        name?: string;
        location?: string;
        type?: string;
        minPrice?: number;
        maxPrice?: number;
        minCapacity?: number;
      } = {};

      if (typeFilter) {
        filters.type = typeFilter;
      }

      if (locationFilter) {
        filters.location = locationFilter;
      }

      const response = await tourService.advancedSearchPaginated(filters, {
        page: 0,
        size: limit,
        sort: "rating,desc",
      });

      const tours = response.content || [];
      // Mevcut turu listeden çıkar
      return tours.filter((tour) => tour.id !== currentTour.id).slice(0, limit);
    },
  });

  const similarTours = data || [];
  const errorMessage = isError
    ? "Benzer turlar yüklenirken bir hata oluştu."
    : null;

  return {
    similarTours,
    isLoading,
    error: errorMessage,
    refetch,
  };
};

