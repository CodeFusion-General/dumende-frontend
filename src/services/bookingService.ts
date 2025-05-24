import { BaseService } from "./base/BaseService";
import {
  BookingDTO,
  CreateBookingDTO,
  UpdateBookingDTO,
  BookingFilters,
  BookingStatus,
  PaymentDTO,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  PaymentStatus,
} from "@/types/booking.types";

class BookingService extends BaseService {
  constructor() {
    super("/bookings");
  }

  public async getBookings(filters?: BookingFilters): Promise<BookingDTO[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    return this.get<BookingDTO[]>(`?${queryString}`);
  }

  public async getBookingById(id: number): Promise<BookingDTO> {
    return this.get<BookingDTO>(`/${id}`);
  }

  public async createBooking(data: CreateBookingDTO): Promise<BookingDTO> {
    return this.post<BookingDTO>("", data);
  }

  public async updateBooking(data: UpdateBookingDTO): Promise<BookingDTO> {
    return this.put<BookingDTO>(`/${data.id}`, data);
  }

  public async updateBookingStatus(
    id: number,
    status: BookingStatus
  ): Promise<BookingDTO> {
    return this.patch<BookingDTO>(`/${id}/status`, { status });
  }

  public async cancelBooking(id: number, reason?: string): Promise<BookingDTO> {
    return this.patch<BookingDTO>(`/${id}/cancel`, { reason });
  }

  public async deleteBooking(id: number): Promise<void> {
    return this.delete<void>(`/${id}`);
  }

  // Customer based queries
  public async getCustomerBookings(customerId: number): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/customer/${customerId}`);
  }

  public async getCustomerActiveBookings(
    customerId: number
  ): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/customer/${customerId}/active`);
  }

  // Boat based queries
  public async getBoatBookings(boatId: number): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/boat/${boatId}`);
  }

  public async getBoatBookingsInRange(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/boat/${boatId}/range`, {
      startDate,
      endDate,
    });
  }

  // Tour based queries
  public async getTourBookings(tourId: number): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/tour/${tourId}`);
  }

  // Payment Management
  public async getBookingPayments(bookingId: number): Promise<PaymentDTO[]> {
    return this.get<PaymentDTO[]>(`/${bookingId}/payments`);
  }

  public async createPayment(data: CreatePaymentDTO): Promise<PaymentDTO> {
    return this.post<PaymentDTO>("/payments", data);
  }

  public async updatePayment(data: UpdatePaymentDTO): Promise<PaymentDTO> {
    return this.put<PaymentDTO>(`/payments/${data.id}`, data);
  }

  public async updatePaymentStatus(
    paymentId: number,
    status: PaymentStatus
  ): Promise<PaymentDTO> {
    return this.patch<PaymentDTO>(`/payments/${paymentId}/status`, { status });
  }

  public async processPayment(
    bookingId: number,
    paymentData: {
      amount: number;
      currency: string;
      paymentMethod: string;
      transactionId: string;
    }
  ): Promise<PaymentDTO> {
    return this.post<PaymentDTO>(`/${bookingId}/payments/process`, paymentData);
  }

  public async refundPayment(
    paymentId: number,
    reason?: string
  ): Promise<PaymentDTO> {
    return this.post<PaymentDTO>(`/payments/${paymentId}/refund`, { reason });
  }

  // Validation and Availability
  public async checkAvailability(data: {
    boatId: number;
    startDate: string;
    endDate: string;
    passengerCount: number;
  }): Promise<{
    available: boolean;
    conflictingBookings?: BookingDTO[];
    price: number;
  }> {
    return this.post("/check-availability", data);
  }

  public async calculatePrice(data: {
    boatId: number;
    startDate: string;
    endDate: string;
    passengerCount: number;
    tourId?: number;
  }): Promise<{
    basePrice: number;
    totalPrice: number;
    breakdown: {
      dailyRate: number;
      days: number;
      tourPrice?: number;
      taxes: number;
      fees: number;
    };
  }> {
    return this.post("/calculate-price", data);
  }

  // Pagination support
  public async getBookingsPaginated(
    filters?: BookingFilters & {
      page?: number;
      size?: number;
      sort?: string;
    }
  ) {
    return this.getPaginated<BookingDTO>("/paginated", filters);
  }

  // Statistics
  public async getBookingStatistics(params?: {
    customerId?: number;
    boatId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    statusDistribution: Record<BookingStatus, number>;
    monthlyRevenue: Array<{ month: string; revenue: number; bookings: number }>;
    popularBoats: Array<{
      boatId: number;
      bookingCount: number;
      revenue: number;
    }>;
  }> {
    const queryString = params ? this.buildQueryString(params) : "";
    return this.get(`/statistics?${queryString}`);
  }
}

export const bookingService = new BookingService();
