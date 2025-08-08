import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useSimilarTours } from "../useSimilarTours";
import { TourDTO } from "@/types/tour.types";
import { tourService } from "@/services/tourService";
import { beforeEach } from "node:test";

// Mock tour service
vi.mock("@/services/tourService", () => ({
  tourService: {
    getTours: vi.fn(),
  },
}));

const mockTours: TourDTO[] = [
  {
    id: 1,
    name: "İstanbul Şehir Turu",
    description: "İstanbul'un tarihi yerlerini keşfedin",
    guideId: 1,
    price: 150,
    capacity: 20,
    location: "İstanbul",
    rating: 4.5,
    status: "ACTIVE",
    tourDates: [
      {
        id: 1,
        tourId: 1,
        startDate: "2024-03-15T10:00:00",
        durationText: "4 Saat",
        availabilityStatus: "AVAILABLE",
        maxGuests: 20,
        createdAt: "2024-01-01T00:00:00",
        updatedAt: "2024-01-01T00:00:00",
      },
    ],
    tourImages: [],
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
  },
  {
    id: 2,
    name: "İstanbul Boğaz Turu",
    description: "Boğaz'ın güzelliklerini keşfedin",
    guideId: 2,
    price: 120,
    capacity: 25,
    location: "İstanbul",
    rating: 4.3,
    status: "ACTIVE",
    tourDates: [
      {
        id: 2,
        tourId: 2,
        startDate: "2024-03-16T14:00:00",
        durationText: "3 Saat",
        availabilityStatus: "AVAILABLE",
        maxGuests: 25,
        createdAt: "2024-01-01T00:00:00",
        updatedAt: "2024-01-01T00:00:00",
      },
    ],
    tourImages: [],
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
  },
  {
    id: 3,
    name: "Kapadokya Balon Turu",
    description: "Kapadokya'yı havadan görün",
    guideId: 3,
    price: 300,
    capacity: 8,
    location: "Kapadokya",
    rating: 4.8,
    status: "ACTIVE",
    tourDates: [
      {
        id: 3,
        tourId: 3,
        startDate: "2024-03-17T06:00:00",
        durationText: "2 Saat",
        availabilityStatus: "AVAILABLE",
        maxGuests: 8,
        createdAt: "2024-01-01T00:00:00",
        updatedAt: "2024-01-01T00:00:00",
      },
    ],
    tourImages: [],
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
  },
];

const currentTour: TourDTO = {
  id: 4,
  name: "İstanbul Gece Turu",
  description: "İstanbul'un gece güzelliklerini keşfedin",
  guideId: 4,
  price: 180,
  capacity: 15,
  location: "İstanbul",
  rating: 4.2,
  status: "ACTIVE",
  tourDates: [
    {
      id: 4,
      tourId: 4,
      startDate: "2024-03-18T20:00:00",
      durationText: "4 Saat",
      availabilityStatus: "AVAILABLE",
      maxGuests: 15,
      createdAt: "2024-01-01T00:00:00",
      updatedAt: "2024-01-01T00:00:00",
    },
  ],
  tourImages: [],
  createdAt: "2024-01-01T00:00:00",
  updatedAt: "2024-01-01T00:00:00",
};

describe("useSimilarTours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no current tour provided", async () => {
    const { result } = renderHook(() =>
      useSimilarTours({ currentTour: undefined })
    );

    expect(result.current.similarTours).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("fetches and returns similar tours", async () => {
    vi.mocked(tourService.getTours).mockResolvedValue(mockTours);

    const { result } = renderHook(() =>
      useSimilarTours({ currentTour, limit: 3 })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tourService.getTours).toHaveBeenCalled();
    expect(result.current.similarTours).toHaveLength(3);
    expect(result.current.error).toBe(null);

    // Should not include the current tour
    const tourIds = result.current.similarTours.map((tour) => tour.id);
    expect(tourIds).not.toContain(currentTour.id);
  });

  it("prioritizes tours from same location", async () => {
    vi.mocked(tourService.getTours).mockResolvedValue(mockTours);

    const { result } = renderHook(() =>
      useSimilarTours({ currentTour, limit: 3 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // İstanbul tours should be ranked higher than Kapadokya tour
    const firstTour = result.current.similarTours[0];
    const secondTour = result.current.similarTours[1];

    expect(firstTour.location).toBe("İstanbul");
    expect(secondTour.location).toBe("İstanbul");
  });

  it("handles API errors gracefully", async () => {
    const errorMessage = "API Error";
    vi.mocked(tourService.getTours).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() =>
      useSimilarTours({ currentTour, limit: 3 })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.similarTours).toEqual([]);
    expect(result.current.error).toBe(
      "Benzer turlar yüklenirken bir hata oluştu."
    );
  });

  it("respects the limit parameter", async () => {
    vi.mocked(tourService.getTours).mockResolvedValue(mockTours);

    const { result } = renderHook(() =>
      useSimilarTours({ currentTour, limit: 2 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.similarTours).toHaveLength(2);
  });

  it("refetch function works correctly", async () => {
    vi.mocked(tourService.getTours).mockResolvedValue(mockTours);

    const { result } = renderHook(() =>
      useSimilarTours({ currentTour, limit: 3 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tourService.getTours).toHaveBeenCalledTimes(1);

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(tourService.getTours).toHaveBeenCalledTimes(2);
    });
  });

  it("updates when currentTour changes", async () => {
    vi.mocked(tourService.getTours).mockResolvedValue(mockTours);

    const { result, rerender } = renderHook(
      ({ currentTour }) => useSimilarTours({ currentTour, limit: 3 }),
      { initialProps: { currentTour } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tourService.getTours).toHaveBeenCalledTimes(1);

    // Change current tour
    const newCurrentTour = { ...currentTour, id: 5, name: "New Tour" };
    rerender({ currentTour: newCurrentTour });

    await waitFor(() => {
      expect(tourService.getTours).toHaveBeenCalledTimes(2);
    });
  });

  it("calculates similarity scores correctly", async () => {
    // Create tours with different similarity levels
    const testTours: TourDTO[] = [
      // Same location, similar price - should be most similar
      {
        ...mockTours[0],
        id: 10,
        location: "İstanbul",
        price: 170,
        capacity: 18,
      },
      // Different location, very different price - should be least similar
      {
        ...mockTours[0],
        id: 11,
        location: "Antalya",
        price: 500,
        capacity: 5,
      },
      // Same location, different price - should be moderately similar
      {
        ...mockTours[0],
        id: 12,
        location: "İstanbul",
        price: 250,
        capacity: 30,
      },
    ];

    vi.mocked(tourService.getTours).mockResolvedValue(testTours);

    const { result } = renderHook(() =>
      useSimilarTours({ currentTour, limit: 3 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The most similar tour (same location, similar price) should be first
    const firstTour = result.current.similarTours[0];
    expect(firstTour.id).toBe(10);
    expect(firstTour.location).toBe("İstanbul");
    expect(firstTour.price).toBe(170);
  });
});
