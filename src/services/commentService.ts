import { BaseService } from './base/BaseService';
import { Comment, Testimonial, CommentCreateRequest, CommentUpdateRequest } from '@/types/comment.types';

class CommentService extends BaseService {
    constructor() {
        super('/comments');
    }

    public async getComments(filters?: { entityType?: string; entityId?: number }): Promise<Comment[]> {
        const params = new URLSearchParams();
        if (filters?.entityType) params.append('entityType', filters.entityType);
        if (filters?.entityId) params.append('entityId', filters.entityId.toString());

        // baseUrl already includes "/comments", so we avoid duplicating the path
        return this.get<Comment[]>(`?${params.toString()}`);
    }

    public async getCommentById(id: number): Promise<Comment> {
        return this.get<Comment>(`/${id}`);
    }

    public async createComment(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
        return this.post<Comment>('', data);
    }

    public async updateComment(id: number, data: Partial<Comment>): Promise<Comment> {
        return this.put<Comment>(`/${id}`, data);
    }

    public async deleteComment(id: number): Promise<void> {
        return this.delete<void>(`/${id}`);
    }

    public async getCommentsByBoat(boatId: number): Promise<Comment[]> {
        return this.get<Comment[]>(`/boat/${boatId}`);
    }

    public async getCommentsByTour(tourId: number): Promise<Comment[]> {
        return this.get<Comment[]>(`/tour/${tourId}`);
    }

    public async getTestimonials(filters?: { featured?: boolean }): Promise<Testimonial[]> {
        const params = new URLSearchParams();
        if (filters?.featured) params.append('featured', filters.featured.toString());
        
        return this.get<Testimonial[]>(`/testimonials?${params.toString()}`);
    }

    public async getUserComments(userId: number): Promise<Comment[]> {
        return this.get<Comment[]>(`/user/${userId}`);
    }

    public async getEntityRating(entityType: 'BOAT' | 'TOUR', entityId: number): Promise<{
        averageRating: number;
        totalRatings: number;
    }> {
        return this.get(`/${entityType}/${entityId}/rating`);
    }
}

export const commentService = new CommentService();
