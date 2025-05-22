export interface Comment {
    id: number;
    content: string;
    rating: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    entityId: number;
    entityType: 'BOAT' | 'TOUR';
    createdAt: string;
    updatedAt: string;
}

export interface Testimonial extends Comment {
    position?: string;
    company?: string;
    featured: boolean;
}

export interface CommentCreateRequest {
    content: string;
    rating: number;
    entityId: number;
    entityType: 'BOAT' | 'TOUR';
}

export interface CommentUpdateRequest extends Partial<CommentCreateRequest> {} 