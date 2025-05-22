export interface Booking {
    id: number;
    boatId: number;
    userId: number;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export interface BookingCreateRequest {
    boatId: number;
    startDate: string;
    endDate: string;
}

export interface BookingUpdateRequest {
    status: BookingStatus;
} 