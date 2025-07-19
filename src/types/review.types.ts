// Review ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// CustomerDTO tanımı (backend CustomerDTO ile uyumlu)
export interface CustomerDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string; // Base64 encoded string veya URL
}

// Review Types
export interface ReviewDTO {
  id: number;
  customer: CustomerDTO;
  boatId?: number;
  boatName?: string;
  tourId?: number;
  tourName?: string;
  bookingId?: number;
  rating: number;
  comment: string;
  reviewDate: string; // LocalDateTime string format
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewCommand {
  customerId: number;
  boatId?: number;
  tourId?: number;
  bookingId?: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewCommand {
  reviewId: number;
  rating?: number;
  comment?: string;
}

export interface ReviewQuery {
  customerId?: number;
  boatId?: number;
  tourId?: number;
  bookingId?: number;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// UserDTO tanımı (review içinde kullanılan basit versiyon)
export interface UserDTO {
  id: number;
  fullName: string;
  phoneNumber: string;
  profileImage?: string; // byte[] -> string (base64 veya URL)
}

// Alias'lar for backward compatibility
export interface ReviewCreateRequest extends CreateReviewCommand {}
export interface ReviewUpdateRequest extends UpdateReviewCommand {}

// Filtreleme için kullanılan interface
export interface ReviewFilters {
  fiveStars: boolean;
  fourStars: boolean;
  threeStars: boolean;
  twoStars: boolean;
  oneStars: boolean;
  boatId?: number;
  tourId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Review statistics
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  lastMonthReviews: number;
  ratingDistribution: RatingDistribution[];
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

// For compatibility with existing components
export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  tourName?: string;
  boatName?: string;
  customerId?: number;
  boatId?: number;
  tourId?: number;
  bookingId?: number;
}

