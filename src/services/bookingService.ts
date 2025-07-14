import { BaseService } from "./base/BaseService";
import { tokenUtils } from "@/lib/utils";
import { boatService } from "./boatService"; // boatService import ediyoruz
import { tourService } from "./tourService"; // tourService import ediyoruz
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
  BookingWithDetails,
  BookingStatistics,
} from "@/types/booking.types";

// getUserIdFromToken fonksiyonunu kaldırıyoruz - AuthContext kullanacağız

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
  public async getCustomerBookings(): Promise<BookingDTO[]> {
    const userId = tokenUtils.getUserId();
    if (!userId) throw new Error('Kullanıcı ID\'si bulunamadı - lütfen tekrar giriş yapın');
    return this.get<BookingDTO[]>(`/customer/${userId}`);
  }

  public async getCustomerActiveBookings(): Promise<BookingDTO[]> {
    const userId = tokenUtils.getUserId();
    if (!userId) throw new Error('Kullanıcı ID\'si bulunamadı - lütfen tekrar giriş yapın');
    return this.get<BookingDTO[]>(`/customer/${userId}/active`);
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

  // Public methods for helper services access
  public async getBookingsByStatus(status: string): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/status`, { status });
  }

  public async getBookingsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<BookingDTO[]> {
    return this.get<BookingDTO[]>(`/date-range`, { startDate, endDate });
  }

  public async checkBookingExists(id: number): Promise<boolean> {
    return this.get<boolean>(`/exists/${id}`);
  }

  public async deleteBookingsByCustomerId(customerId: number): Promise<void> {
    return this.delete<void>(`/customer/${customerId}`);
  }

  public async deleteBookingsByBoatId(boatId: number): Promise<void> {
    return this.delete<void>(`/boat/${boatId}`);
  }

  public async deleteBookingsByTourId(tourId: number): Promise<void> {
    return this.delete<void>(`/tour/${tourId}`);
  }

  public async updateBookingStatusById(
    id: number,
    status: string
  ): Promise<void> {
    return this.patch<void>(`/${id}/status?status=${status}`, null);
  }

  public async getBoatsByOwnerId(ownerId: number): Promise<any[]> {
    return this.get<any[]>(`/boats/owner/${ownerId}`);
  }

  public async getToursByBoatId(boatId: number): Promise<any[]> {
    return this.get<any[]>(`/tours/boat/${boatId}`);
  }

  public async getUserById(userId: number): Promise<any> {
    return this.get<any>(`/users/${userId}`);
  }

  public async getBoatById(boatId: number): Promise<any> {
    return this.get<any>(`/boats/${boatId}`);
  }

  public async getTourById(tourId: number): Promise<any> {
    return this.get<any>(`/tours/${tourId}`);
  }
}

export const bookingService = new BookingService();

// Booking Query Service - BaseService kullanarak
export const bookingQueryService = {
  // Get booking by ID
  findBookingById: async (id: number): Promise<BookingDTO> => {
    return bookingService.getBookingById(id);
  },

  // Get all bookings
  findAllBookings: async (): Promise<BookingDTO[]> => {
    return bookingService.getBookings();
  },

  // Get bookings by customer ID
  findBookingsByCustomerId: async (
    customerId: number
  ): Promise<BookingDTO[]> => {
    return bookingService.getCustomerBookings();
  },

  // Get bookings by boat ID
  findBookingsByBoatId: async (boatId: number): Promise<BookingDTO[]> => {
    return bookingService.getBoatBookings(boatId);
  },

  // Get bookings by tour ID
  findBookingsByTourId: async (tourId: number): Promise<BookingDTO[]> => {
    return bookingService.getTourBookings(tourId);
  },

  // Get bookings by status
  findBookingsByStatus: async (status: string): Promise<BookingDTO[]> => {
    return bookingService.getBookingsByStatus(status);
  },

  // Get bookings by date range
  findBookingsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<BookingDTO[]> => {
    return bookingService.getBookingsByDateRange(startDate, endDate);
  },

  // Check if booking exists
  existsBookingById: async (id: number): Promise<boolean> => {
    return bookingService.checkBookingExists(id);
  },
};

// Booking Command Service - BaseService kullanarak
export const bookingCommandService = {
  // Create new booking
  createBooking: async (command: CreateBookingDTO): Promise<BookingDTO> => {
    return bookingService.createBooking(command);
  },

  // Update existing booking
  updateBooking: async (command: UpdateBookingDTO): Promise<BookingDTO> => {
    return bookingService.updateBooking(command);
  },

  // Delete booking
  deleteBooking: async (id: number): Promise<void> => {
    return bookingService.deleteBooking(id);
  },

  // Delete bookings by customer ID
  deleteBookingsByCustomerId: async (customerId: number): Promise<void> => {
    return bookingService.deleteBookingsByCustomerId(customerId);
  },

  // Delete bookings by boat ID
  deleteBookingsByBoatId: async (boatId: number): Promise<void> => {
    return bookingService.deleteBookingsByBoatId(boatId);
  },

  // Delete bookings by tour ID
  deleteBookingsByTourId: async (tourId: number): Promise<void> => {
    return bookingService.deleteBookingsByTourId(tourId);
  },

  // Update booking status
  updateBookingStatus: async (id: number, status: string): Promise<void> => {
    return bookingService.updateBookingStatusById(id, status);
  },
};

// Helper functions for owner/captain specific data - AuthContext'ten gelen userId kullanır
export const bookingHelperService = {
  // Get all bookings for owner's boats
  getBookingsForOwnerBoats: async (userId?: number): Promise<BookingDTO[]> => {
    try {
      // AuthContext'ten gelen userId'yi kullan, yoksa cookie'den al
      const ownerId = userId || tokenUtils.getUserId();
      if (!ownerId) throw new Error('Kullanıcı ID\'si bulunamadı - lütfen tekrar giriş yapın');
      
      console.log('Getting boats for owner ID:', ownerId);
      // boatService'i kullanarak doğru endpoint'e git
      const boats = await boatService.getBoatsByOwner(ownerId);
      // Get bookings for each boat
      const bookingsPromises = boats.map((boat: any) =>
        bookingService.getBoatBookings(boat.id)
      );
      const bookingsArrays = await Promise.all(bookingsPromises);
      return bookingsArrays.flat();
    } catch (error) {
      console.error("Error fetching bookings for owner boats:", error);
      throw error; // Error'ı yukarı fırlat ki BookingsPage'de yakalansın
    }
  },

  // Get all bookings for owner's tours
  getBookingsForOwnerTours: async (userId?: number): Promise<BookingDTO[]> => {
    try {
      // AuthContext'ten gelen userId'yi kullan, yoksa cookie'den al
      const ownerId = userId || tokenUtils.getUserId();
      if (!ownerId) throw new Error('Kullanıcı ID\'si bulunamadı - lütfen tekrar giriş yapın');
      
      console.log('Getting tours for owner ID:', ownerId);
      // boatService'i kullanarak doğru endpoint'e git
      const boats = await boatService.getBoatsByOwner(ownerId);
      const bookingsPromises: Promise<BookingDTO[]>[] = [];
      for (const boat of boats) {
        // tourService'i kullanarak doğru endpoint'e git
        const tours = await tourService.getToursByBoatId(boat.id);
        tours.forEach((tour: any) => {
          bookingsPromises.push(bookingService.getTourBookings(tour.id));
        });
      }
      const bookingsArrays = await Promise.all(bookingsPromises);
      return bookingsArrays.flat();
    } catch (error) {
      console.error("Error fetching bookings for owner tours:", error);
      throw error; // Error'ı yukarı fırlat ki BookingsPage'de yakalansın
    }
  },

  // Get all bookings for an owner (boats + tours)
  getAllBookingsForOwner: async (userId?: number): Promise<BookingDTO[]> => {
    try {
      // AuthContext'ten gelen userId'yi kullan
      const ownerId = userId || tokenUtils.getUserId();
      if (!ownerId) throw new Error('Kullanıcı ID\'si bulunamadı - lütfen tekrar giriş yapın');
      
      console.log('Getting all bookings for owner ID:', ownerId);
      const [boatBookings, tourBookings] = await Promise.all([
        bookingHelperService.getBookingsForOwnerBoats(ownerId),
        bookingHelperService.getBookingsForOwnerTours(ownerId),
      ]);
      // Combine and deduplicate bookings
      const allBookings = [...boatBookings, ...tourBookings];
      const uniqueBookings = allBookings.filter(
        (booking, index, self) =>
          index === self.findIndex((b) => b.id === booking.id)
      );
      return uniqueBookings;
    } catch (error) {
      console.error("Error fetching all bookings for owner:", error);
      throw error; // Error'ı yukarı fırlat ki BookingsPage'de yakalansın
    }
  },

  // Get bookings for specific boat with details
  getBookingsWithDetailsForBoat: async (
    boatId: number
  ): Promise<BookingWithDetails[]> => {
    try {
      const bookings = await bookingService.getBoatBookings(boatId);

      // Enrich with additional data
      const bookingsWithDetails: BookingWithDetails[] = [];

      for (const booking of bookings) {
        try {
          // Get customer info
          const customer = await bookingService.getUserById(booking.customerId);

          // Get boat info
          const boat = await bookingService.getBoatById(booking.boatId);

          // Get tour info if exists
          let tour = null;
          if (booking.tourId) {
            tour = await bookingService.getTourById(booking.tourId);
          }

          const bookingWithDetails: BookingWithDetails = {
            ...booking,
            customerName: customer.fullName,
            customerEmail: customer.email,
            customerPhone: customer.phoneNumber,
            boatName: boat.name,
            boatType: boat.type,
            boatLocation: boat.location,
            tourName: tour?.name,
            tourDescription: tour?.description,
            status: booking.status as any,
          };

          bookingsWithDetails.push(bookingWithDetails);
        } catch (err) {
          console.error("Error enriching booking data:", err);
          // Add booking without additional details
          bookingsWithDetails.push({
            ...booking,
            status: booking.status as any,
          });
        }
      }

      return bookingsWithDetails;
    } catch (error) {
      console.error("Error fetching bookings with details:", error);
      return [];
    }
  },

  // Calculate booking statistics for owner
  calculateBookingStatistics: async (
    ownerId: number
  ): Promise<BookingStatistics> => {
    try {
      const bookings = await bookingHelperService.getAllBookingsForOwner();

      const stats: BookingStatistics = {
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
        confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED")
          .length,
        cancelledBookings: bookings.filter((b) => b.status === "CANCELLED")
          .length,
        completedBookings: bookings.filter((b) => b.status === "COMPLETED")
          .length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        thisMonthBookings: 0,
        thisMonthRevenue: 0,
      };

      // Calculate this month's stats
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= thisMonth;
      });

      stats.thisMonthBookings = thisMonthBookings.length;
      stats.thisMonthRevenue = thisMonthBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      return stats;
    } catch (error) {
      console.error("Error calculating booking statistics:", error);
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        thisMonthBookings: 0,
        thisMonthRevenue: 0,
      };
    }
  },
};

export default {
  query: bookingQueryService,
  command: bookingCommandService,
  helper: bookingHelperService,
};
