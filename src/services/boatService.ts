import { BaseService } from './base/BaseService';
import { Boat, BoatCreateRequest, BoatUpdateRequest } from '@/types/boat.types';

class BoatService extends BaseService {
    constructor() {
        super('/boats');
    }

    public async getBoats(params?: { 
        location?: string;
        minCapacity?: number;
        maxPrice?: number;
        available?: boolean;
    }): Promise<Boat[]> {
        return this.get<Boat[]>('', params);
    }

    public async getBoatById(id: number): Promise<Boat> {
        return this.get<Boat>(`/${id}`);
    }

    public async createBoat(data: BoatCreateRequest): Promise<Boat> {
        return this.post<Boat>('', data);
    }

    public async updateBoat(id: number, data: BoatUpdateRequest): Promise<Boat> {
        return this.put<Boat>(`/${id}`, data);
    }

    public async deleteBoat(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }

    public async getBoatAvailability(id: number, startDate: string, endDate: string): Promise<boolean> {
        return this.get<boolean>(`/${id}/availability`, { startDate, endDate });
    }

    public async getBoatsByCaption(captainId: number): Promise<Boat[]> {
        return this.get<Boat[]>('/captain/${captainId}');
    }
}

export const boatService = new BoatService();