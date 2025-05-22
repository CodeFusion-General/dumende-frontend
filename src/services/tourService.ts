import { BaseService } from './base/BaseService';
import { Tour, TourCreateRequest, TourUpdateRequest } from '@/types/tour.types';

class TourService extends BaseService {
    constructor() {
        super('/tours');
    }

    public async getTours(params?: {
        location?: string;
        minDuration?: number;
        maxPrice?: number;
        available?: boolean;
        boatId?: number;
        captainId?: number;
    }): Promise<Tour[]> {
        return this.get<Tour[]>('', params);
    }

    public async getTourById(id: number): Promise<Tour> {
        return this.get<Tour>(`/${id}`);
    }

    public async createTour(data: TourCreateRequest): Promise<Tour> {
        return this.post<Tour>('', data);
    }

    public async updateTour(id: number, data: TourUpdateRequest): Promise<Tour> {
        return this.put<Tour>(`/${id}`, data);
    }

    public async deleteTour(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }

    public async getTourAvailability(id: number, date: string): Promise<boolean> {
        return this.get<boolean>(`/${id}/availability`, { date });
    }

    public async getToursByBoat(boatId: number): Promise<Tour[]> {
        return this.get<Tour[]>(`/boat/${boatId}`);
    }

    public async getToursByCaptain(captainId: number): Promise<Tour[]> {
        return this.get<Tour[]>(`/captain/${captainId}`);
    }
}

export const tourService = new TourService();
