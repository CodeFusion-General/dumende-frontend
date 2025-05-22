export interface Tour {
    id: number;
    name: string;
    description: string;
    boatId: number;
    captainId: number;
    duration: number;
    maxParticipants: number;
    price: number;
    startLocation: string;
    route: string[];
    includes: string[];
    images: string[];
    available: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TourCreateRequest {
    name: string;
    description: string;
    boatId: number;
    captainId: number;
    duration: number;
    maxParticipants: number;
    price: number;
    startLocation: string;
    route: string[];
    includes: string[];
    images: string[];
}

export interface TourUpdateRequest extends Partial<TourCreateRequest> {} 