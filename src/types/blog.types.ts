export interface BlogPost {
    id: number;
    title: string;
    content: string;
    summary: string;
    author: string;
    image: string;
    tags: string[];
    slug: string;
    published: boolean;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface BlogCreateRequest {
    title: string;
    content: string;
    summary: string;
    author: string;
    image: string;
    tags: string[];
    published?: boolean;
}

export interface BlogUpdateRequest extends Partial<BlogCreateRequest> {} 