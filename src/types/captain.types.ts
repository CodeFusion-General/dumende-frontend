export interface Captain {
    id: number;
    name: string;
    experience: number;
    bio: string;
    photo: string;
    rating: number;
    available: boolean;
    certifications: string[];
    languages: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CaptainCreateRequest {
    name: string;
    experience: number;
    bio: string;
    photo: string;
    certifications: string[];
    languages: string[];
}

export interface CaptainUpdateRequest extends Partial<CaptainCreateRequest> {} 