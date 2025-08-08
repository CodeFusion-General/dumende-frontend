import { useState, useEffect } from "react";
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
  const [similarTours, setSimilarTours] = useState<TourDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarTours = async () => {
    if (!currentTour) {
      setSimilarTours([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get all tours first
      const allTours = await tourService.getTours();

      // Filter out current tour
      const otherTours = allTours.filter((tour) => tour.id !== currentTour.id);

      // Calculate similarity scores and sort
      const toursWithScores = otherTours.map((tour) => ({
        tour,
        score: calculateSimilarityScore(currentTour, tour),
      }));

      // Sort by similarity score (highest first) and take the limit
      const sortedTours = toursWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.tour);

      setSimilarTours(sortedTours);
    } catch (err) {
      console.error("Error fetching similar tours:", err);
      setError("Benzer turlar yüklenirken bir hata oluştu.");
      setSimilarTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchSimilarTours();
  };

  useEffect(() => {
    fetchSimilarTours();
  }, [currentTour?.id, limit]);

  return {
    similarTours,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Calculate similarity score between two tours
 * Higher score means more similar
 */
function calculateSimilarityScore(
  currentTour: TourDTO,
  otherTour: TourDTO
): number {
  let score = 0;

  // Location similarity (highest weight)
  if (currentTour.location && otherTour.location) {
    const currentLocation = currentTour.location.toLowerCase();
    const otherLocation = otherTour.location.toLowerCase();

    if (currentLocation === otherLocation) {
      score += 50; // Exact location match
    } else if (
      currentLocation.includes(otherLocation) ||
      otherLocation.includes(currentLocation)
    ) {
      score += 30; // Partial location match
    }
  }

  // Price similarity (medium weight)
  if (currentTour.price && otherTour.price) {
    const priceDiff = Math.abs(currentTour.price - otherTour.price);
    const avgPrice = (currentTour.price + otherTour.price) / 2;
    const priceRatio = priceDiff / avgPrice;

    if (priceRatio <= 0.2) {
      score += 25; // Very similar price (within 20%)
    } else if (priceRatio <= 0.5) {
      score += 15; // Somewhat similar price (within 50%)
    } else if (priceRatio <= 1.0) {
      score += 5; // Different but reasonable price range
    }
  }

  // Capacity similarity (medium weight)
  if (currentTour.capacity && otherTour.capacity) {
    const capacityDiff = Math.abs(currentTour.capacity - otherTour.capacity);
    const avgCapacity = (currentTour.capacity + otherTour.capacity) / 2;
    const capacityRatio = capacityDiff / avgCapacity;

    if (capacityRatio <= 0.3) {
      score += 20; // Similar capacity
    } else if (capacityRatio <= 0.6) {
      score += 10; // Somewhat similar capacity
    }
  }

  // Duration similarity (low weight)
  if (currentTour.tourDates?.length && otherTour.tourDates?.length) {
    const currentDuration =
      currentTour.tourDates[0]?.durationText?.toLowerCase();
    const otherDuration = otherTour.tourDates[0]?.durationText?.toLowerCase();

    if (currentDuration && otherDuration) {
      if (currentDuration === otherDuration) {
        score += 15; // Exact duration match
      } else if (
        (currentDuration.includes("saat") && otherDuration.includes("saat")) ||
        (currentDuration.includes("gün") && otherDuration.includes("gün"))
      ) {
        score += 8; // Same duration type (hours/days)
      }
    }
  }

  // Rating similarity (low weight)
  if (currentTour.rating && otherTour.rating) {
    const ratingDiff = Math.abs(currentTour.rating - otherTour.rating);
    if (ratingDiff <= 0.5) {
      score += 10; // Very similar rating
    } else if (ratingDiff <= 1.0) {
      score += 5; // Somewhat similar rating
    }
  }

  // Status similarity (low weight)
  if (currentTour.status === otherTour.status) {
    score += 5;
  }

  // Guide similarity (low weight)
  if (currentTour.guideId === otherTour.guideId) {
    score += 10; // Same guide
  }

  // Add some randomness to avoid always showing the same tours
  score += Math.random() * 2;

  return score;
}

/**
 * Extract tour type from description or name
 * This is a simple heuristic-based approach
 */
function extractTourType(tour: TourDTO): string[] {
  const text = `${tour.name} ${tour.description}`.toLowerCase();
  const types: string[] = [];

  // Adventure keywords
  if (
    text.match(
      /macera|tırmanış|rafting|paraşüt|dalış|sörf|kayak|bisiklet|yürüyüş|trekking/
    )
  ) {
    types.push("adventure");
  }

  // Cultural keywords
  if (
    text.match(/kültür|tarih|müze|antik|saray|cami|kilise|manastır|arkeoloji/)
  ) {
    types.push("cultural");
  }

  // Food keywords
  if (text.match(/yemek|lezze|gastronomi|mutfak|tadım|restoran|lokanta/)) {
    types.push("food");
  }

  // Nature keywords
  if (text.match(/doğa|orman|göl|nehir|şelale|milli park|kuş|hayvan|botanik/)) {
    types.push("nature");
  }

  // City keywords
  if (text.match(/şehir|kent|alışveriş|gece|bar|eğlence|sokak|meydan/)) {
    types.push("city");
  }

  // Beach/Sea keywords
  if (text.match(/plaj|deniz|kum|güneş|yüzme|tekne|yelken|balık/)) {
    types.push("beach");
  }

  return types.length > 0 ? types : ["general"];
}
