import { BaseService } from './base/BaseService';
import { Captain, CaptainCreateRequest, CaptainUpdateRequest } from '@/types/captain.types';

class CaptainService extends BaseService {
    constructor() {
        super('/captains');
    }

    public async getCaptains(params?: {
        available?: boolean;
        experience?: number;
        languages?: string[];
    }): Promise<Captain[]> {
        return this.get<Captain[]>('', params);
    }

    public async getCaptainById(id: number): Promise<Captain> {
        return this.get<Captain>(`/${id}`);
    }

    public async createCaptain(data: CaptainCreateRequest): Promise<Captain> {
        return this.post<Captain>('', data);
    }

    public async updateCaptain(id: number, data: CaptainUpdateRequest): Promise<Captain> {
        return this.put<Captain>(`/${id}`, data);
    }

    public async deleteCaptain(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }

    public async getCaptainAvailability(id: number, date: string): Promise<boolean> {
        return this.get<boolean>(`/${id}/availability`, { date });
    }

    public async getCaptainRating(id: number): Promise<number> {
        return this.get<number>(`/${id}/rating`);
    }

    public async getCaptainBookings(id: number): Promise<any[]> {
        return this.get<any[]>(`/${id}/bookings`);
    }
}

export const captainService = new CaptainService();