import { BaseService } from './base/BaseService';
import { BlogPost, BlogCreateRequest, BlogUpdateRequest } from '@/types/blog.types';

class BlogService extends BaseService {
    constructor() {
        super('/blog');
    }

    public async getPosts(filters?: { published?: boolean; authorId?: number }): Promise<BlogPost[]> {
        const params = new URLSearchParams();
        if (filters?.published !== undefined) params.append('published', filters.published.toString());
        if (filters?.authorId) params.append('authorId', filters.authorId.toString());
        
        return this.get<BlogPost[]>(`/posts?${params.toString()}`);
    }

    public async getPostById(id: number): Promise<BlogPost> {
        return this.get<BlogPost>(`/${id}`);
    }

    public async getPostBySlug(slug: string): Promise<BlogPost> {
        return this.get<BlogPost>(`/posts/${slug}`);
    }

    public async createPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
        return this.post<BlogPost>('/posts', data);
    }

    public async updatePost(id: number, data: Partial<BlogPost>): Promise<BlogPost> {
        return this.put<BlogPost>(`/posts/${id}`, data);
    }

    public async deletePost(id: number): Promise<void> {
        return this.delete<void>(`/posts/${id}`);
    }

    public async getPostsByTag(tag: string): Promise<BlogPost[]> {
        return this.get<BlogPost[]>(`/tag/${tag}`);
    }

    public async getPostsByAuthor(author: string): Promise<BlogPost[]> {
        return this.get<BlogPost[]>(`/author/${author}`);
    }
}

export const blogService = new BlogService();