import { BaseService } from "./base/BaseService";

// Tour Feature DTO interfaces (backend DTO'larla uyumlu)
export interface TourFeatureDTO {
  id: number;
  tourId: number;
  featureName: string;
}

export interface CreateTourFeatureDTO {
  tourId: number;
  featureName: string;
}

export interface UpdateTourFeatureDTO {
  id: number;
  tourId: number;
  featureName: string;
}

class TourFeatureService extends BaseService {
  constructor() {
    super("/tour-features");
  }

  /**
   * Get tour features by tour ID
   * Backend: GET /api/tour-features/tour/{tourId}
   */
  public async getTourFeatures(tourId: number): Promise<TourFeatureDTO[]> {
    return this.get<TourFeatureDTO[]>(`/tour/${tourId}`);
  }

  /**
   * Create a new tour feature
   * Backend: POST /api/tour-features/
   */
  public async createTourFeature(data: CreateTourFeatureDTO): Promise<TourFeatureDTO> {
    return this.post<TourFeatureDTO>("", data);
  }

  /**
   * Update tour features for a specific tour
   * Backend: PUT /api/tour-features/tour/{tourId}
   */
  public async updateTourFeatures(
    tourId: number, 
    features: TourFeatureDTO[]
  ): Promise<TourFeatureDTO[]> {
    return this.put<TourFeatureDTO[]>(`/tour/${tourId}`, features);
  }

  /**
   * Delete all tour features for a specific tour
   * Backend: DELETE /api/tour-features/tour/{tourId}
   */
  public async deleteTourFeatures(tourId: number): Promise<void> {
    return this.delete<void>(`/tour/${tourId}`);
  }

  /**
   * Convenience method to add a single feature to a tour
   */
  public async addFeatureToTour(tourId: number, featureName: string): Promise<TourFeatureDTO> {
    return this.createTourFeature({
      tourId,
      featureName
    });
  }

  /**
   * Convenience method to replace all features for a tour
   */
  public async setTourFeatures(tourId: number, featureNames: string[]): Promise<TourFeatureDTO[]> {
    const features = featureNames.map(featureName => ({
      id: 0, // Will be set by backend
      tourId,
      featureName
    }));
    return this.updateTourFeatures(tourId, features);
  }
}

export const tourFeatureService = new TourFeatureService();