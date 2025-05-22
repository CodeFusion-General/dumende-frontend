export interface Boat {
    id: number;
    name: string;
    description: string;
    capacity: number;
    pricePerDay: number;
    location: string;
    images: string[];
    features: string[];
    available: boolean;
    createdAt: string;
    updatedAt: string;
    captainId?: number;
}

export interface BoatCreateRequest {
    name: string;
    description: string;
    capacity: number;
    pricePerDay: number;
    location: string;
    images: string[];
    features: string[];
    captainId?: number;
}

export interface BoatUpdateRequest extends Partial<BoatCreateRequest> {} 