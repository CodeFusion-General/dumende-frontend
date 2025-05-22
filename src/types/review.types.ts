export interface Review {
    id: string;
    userName: string;
    date: string;
    rating: number;
    comment: string;
    tourName?: string;
    boatName?: string;
} 