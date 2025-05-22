export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: ContactStatus;
    createdAt: string;
    updatedAt: string;
}

export enum ContactStatus {
    NEW = 'NEW',
    READ = 'READ',
    REPLIED = 'REPLIED',
    ARCHIVED = 'ARCHIVED'
}

export interface ContactCreateRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactUpdateRequest {
    status: ContactStatus;
} 