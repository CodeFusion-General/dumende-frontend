import { BaseService } from './base/BaseService';
import { Booking, BookingCreateRequest, BookingUpdateRequest } from '@/types/booking.types';

class BookingService extends BaseService {
    constructor() {
        super('/bookings');
    }

    public async getBookings(params?: {
        userId?: number;
        boatId?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Booking[]> {
        return this.get<Booking[]>('', params);
    }

    public async getBookingById(id: number): Promise<Booking> {
        return this.get<Booking>(`/${id}`);
    }

    public async createBooking(data: BookingCreateRequest): Promise<Booking> {
        return this.post<Booking>('', data);
    }

    public async updateBookingStatus(id: number, data: BookingUpdateRequest): Promise<Booking> {
        return this.put<Booking>(`/${id}/status`, data);
    }

    public async cancelBooking(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }

    public async getUserBookings(userId: number): Promise<Booking[]> {
        return this.get<Booking[]>(`/user/${userId}`);
    }

    public async getBoatBookings(boatId: number): Promise<Booking[]> {
        return this.get<Booking[]>(`/boat/${boatId}`);
    }
}

export const bookingService = new BookingService();