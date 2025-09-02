import { BaseService } from "../base/BaseService";
import { bookingService } from "../bookingService";
import { userService } from "../userService";
import { boatService } from "../boatService";
import { tourService } from "../tourService";
import {
  AdminBookingView,
  AdminBookingFilters,
  AdminBookingStatistics,
  AdminBookingAction,
  AdminBulkBookingOperation,
  BookingExportConfig,
  BookingReportData,
  AdminBookingNote,
} from "@/types/adminBooking";
import {
  BookingDTO,
  BookingStatus,
  PaymentStatus,
} from "@/types/booking.types";
import { string } from "zod";
import { string } from "zod";
import { string } from "zod";
import { number } from "zod";
import { number } from "zod";
import { type } from "os";
import { type } from "os";
import { string } from "zod";
import { string } from "zod";
import { type } from "os";
import { number } from "zod";
import { type } from "os";
import { type } from "os";
import { string } from "zod";
import { string } from "zod";
import { type } from "os";
import { number } from "zod";
import { string } from "zod";
import { type } from "os";
import { type } from "os";

class AdminBookingService extends BaseService {
  constructor() {
    super("/admin/bookings");
  }

  // Get all bookings with admin view (enriched data)
  public async getAllBookings(
    filters?: AdminBookingFilters,
    page?: number,
    size?: number
  ): Promise<{
    bookings: AdminBookingView[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // Get basic bookings first
      const bookings = await bookingService.getBookings();

      // Enrich with additional data
      const enrichedBookings: AdminBookingView[] = [];

      for (const booking of bookings) {
        try {
          const enriched = await this.enrichBookingData(booking);
          enrichedBookings.push(enriched);
        } catch (error) {
          console.error(`Error enriching booking ${booking.id}:`, error);
          // Add minimal data if enrichment fails
          enrichedBookings.push(this.createMinimalAdminBookingView(booking));
        }
      }

      // Apply filters
      let filteredBookings = this.applyFilters(enrichedBookings, filters);

      // Apply pagination
      const startIndex = page && size ? (page - 1) * size : 0;
      const endIndex =
        page && size ? startIndex + size : filteredBookings.length;
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      return {
        bookings: paginatedBookings,
        totalElements: filteredBookings.length,
        totalPages:
          page && size ? Math.ceil(filteredBookings.length / size) : 1,
        currentPage: page || 1,
      };
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      throw error;
    }
  }

  // Get booking by ID with admin view
  public async getBookingById(id: number): Promise<AdminBookingView> {
    try {
      const booking = await bookingService.getBookingById(id);
      return await this.enrichBookingData(booking);
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  }

  // Get booking statistics for admin dashboard
  public async getBookingStatistics(dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<AdminBookingStatistics> {
    try {
      const bookings = await bookingService.getBookings();

      // Filter by date range if provided
      const filteredBookings = dateRange
        ? bookings.filter((booking) => {
            const bookingDate = new Date(booking.createdAt);
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);
            return bookingDate >= start && bookingDate <= end;
          })
        : bookings;

      return this.calculateStatistics(filteredBookings);
    } catch (error) {
      console.error("Error fetching booking statistics:", error);
      throw error;
    }
  }

  // Perform admin action on booking
  public async performBookingAction(action: AdminBookingAction): Promise<void> {
    try {
      switch (action.type) {
        case "approve":
          await bookingService.updateBookingStatus(
            action.bookingId,
            BookingStatus.CONFIRMED,
            action.reason
          );
          await this.sendNotificationToCustomer(
            action.bookingId,
            "booking_approved",
            action.reason
          );
          await this.sendNotificationToOwner(
            action.bookingId,
            "booking_approved",
            action.reason
          );
          break;
        case "reject":
          await bookingService.updateBookingStatus(
            action.bookingId,
            BookingStatus.REJECTED,
            action.reason
          );
          await this.sendNotificationToCustomer(
            action.bookingId,
            "booking_rejected",
            action.reason
          );
          break;
        case "cancel":
          await bookingService.cancelBooking(action.bookingId, action.reason);
          await this.sendNotificationToCustomer(
            action.bookingId,
            "booking_cancelled",
            action.reason
          );
          await this.sendNotificationToOwner(
            action.bookingId,
            "booking_cancelled",
            action.reason
          );
          await this.updateAvailabilityCalendar(action.bookingId);
          break;
        case "complete":
          await bookingService.updateBookingStatus(
            action.bookingId,
            BookingStatus.COMPLETED,
            action.reason
          );
          await this.sendNotificationToCustomer(
            action.bookingId,
            "booking_completed",
            action.reason
          );
          await this.sendNotificationToOwner(
            action.bookingId,
            "booking_completed",
            action.reason
          );
          break;
        case "add_note":
          if (action.note) {
            await this.addBookingNote(action.bookingId, action.note, "info");
          }
          break;
        case "reschedule":
          if (action.newDate) {
            await this.rescheduleBooking(
              action.bookingId,
              action.newDate,
              action.reason
            );
            await this.sendNotificationToCustomer(
              action.bookingId,
              "booking_rescheduled",
              action.reason
            );
            await this.sendNotificationToOwner(
              action.bookingId,
              "booking_rescheduled",
              action.reason
            );
          }
          break;
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error performing booking action:`, error);
      throw error;
    }
  }

  // Perform bulk operations on bookings
  public async performBulkOperation(
    operation: AdminBulkBookingOperation
  ): Promise<void> {
    try {
      const promises = operation.bookingIds.map((bookingId) => {
        switch (operation.operation) {
          case "approve":
            return bookingService.updateBookingStatus(
              bookingId,
              BookingStatus.CONFIRMED,
              operation.reason
            );
          case "reject":
            return bookingService.updateBookingStatus(
              bookingId,
              BookingStatus.REJECTED,
              operation.reason
            );
          case "cancel":
            return bookingService.cancelBooking(bookingId, operation.reason);
          case "add_note":
            return operation.note
              ? this.addBookingNote(bookingId, operation.note, "info")
              : Promise.resolve();
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      throw error;
    }
  }

  // Add note to booking
  public async addBookingNote(
    bookingId: number,
    note: string,
    type: "info" | "warning" | "important" = "info"
  ): Promise<AdminBookingNote> {
    try {
      // This would typically be a backend call
      // For now, we'll simulate it
      const newNote: AdminBookingNote = {
        id: Date.now(), // Temporary ID
        adminId: 1, // Would come from auth context
        adminName: "Admin User", // Would come from auth context
        note,
        type,
        createdAt: new Date().toISOString(),
      };

      return newNote;
    } catch (error) {
      console.error("Error adding booking note:", error);
      throw error;
    }
  }

  // Export bookings data
  public async exportBookings(config: BookingExportConfig): Promise<Blob> {
    try {
      const { bookings } = await this.getAllBookings(config.filters);

      // This would typically call a backend endpoint for export
      // For now, we'll create a simple CSV
      if (config.format === "csv") {
        return this.createCSVExport(bookings, config);
      }

      throw new Error(`Export format ${config.format} not implemented yet`);
    } catch (error) {
      console.error("Error exporting bookings:", error);
      throw error;
    }
  }

  // Generate booking report
  public async generateBookingReport(
    filters?: AdminBookingFilters,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<BookingReportData> {
    try {
      const { bookings } = await this.getAllBookings(filters);
      const statistics = await this.getBookingStatistics(dateRange);

      return {
        summary: {
          totalBookings: statistics.total,
          totalRevenue: statistics.totalRevenue,
          averageBookingValue: statistics.averageBookingValue,
          period: dateRange
            ? `${dateRange.startDate} - ${dateRange.endDate}`
            : "All time",
        },
        bookings,
        charts: {
          dailyBookings: statistics.monthlyTrend.map((item) => ({
            date: item.month,
            count: item.bookings,
            revenue: item.revenue,
          })),
          statusDistribution: Object.entries(statistics.statusDistribution).map(
            ([status, count]) => ({
              status,
              count,
              percentage: (count / statistics.total) * 100,
            })
          ),
          topPerformers: [
            ...statistics.topBoats.map((boat) => ({
              name: boat.boatName,
              type: "boat" as const,
              bookings: boat.bookingCount,
              revenue: boat.revenue,
            })),
            ...statistics.topTours.map((tour) => ({
              name: tour.tourName,
              type: "tour" as const,
              bookings: tour.bookingCount,
              revenue: tour.revenue,
            })),
          ],
        },
      };
    } catch (error) {
      console.error("Error generating booking report:", error);
      throw error;
    }
  }

  // Private helper methods
  private async enrichBookingData(
    booking: BookingDTO
  ): Promise<AdminBookingView> {
    try {
      // Get customer info
      const customer = await userService.getUserById(booking.customerId);

      // Get boat info if exists
      let boatInfo = undefined;
      if (booking.boatId) {
        try {
          const boat = await boatService.getBoatById(booking.boatId);
          const owner = await userService.getUserById(boat.ownerId);
          boatInfo = {
            id: boat.id,
            name: boat.name,
            ownerName: owner.fullName || owner.firstName + " " + owner.lastName,
            ownerEmail: owner.email,
            location: boat.location,
            type: boat.type,
            capacity: boat.capacity,
          };
        } catch (error) {
          console.error(
            `Error fetching boat info for booking ${booking.id}:`,
            error
          );
        }
      }

      // Get tour info if exists
      let tourInfo = undefined;
      if (booking.tourId) {
        try {
          const tour = await tourService.getTourById(booking.tourId);
          const guide = await userService.getUserById(tour.guideId);
          tourInfo = {
            id: tour.id,
            name: tour.name,
            guideName: guide.fullName || guide.firstName + " " + guide.lastName,
            guideEmail: guide.email,
            location: tour.location,
            duration: tour.duration,
            maxParticipants: tour.maxParticipants,
          };
        } catch (error) {
          console.error(
            `Error fetching tour info for booking ${booking.id}:`,
            error
          );
        }
      }

      // Get payment info
      const payments = await bookingService.getBookingPayments(booking.id);
      const paidAmount = payments
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0);
      const refundAmount = payments
        .filter((p) => p.status === PaymentStatus.REFUNDED)
        .reduce((sum, p) => sum + p.amount, 0);

      const enrichedBooking: AdminBookingView = {
        ...booking,
        customerInfo: {
          id: customer.id,
          name:
            customer.fullName || customer.firstName + " " + customer.lastName,
          email: customer.email,
          phone: customer.phoneNumber || "",
          totalBookings: 0, // Would need separate query
          registrationDate: customer.createdAt,
          verificationStatus: customer.emailVerified ? "verified" : "pending",
        },
        boatInfo,
        tourInfo,
        paymentInfo: {
          totalAmount: booking.totalPrice,
          paidAmount,
          remainingAmount: booking.totalPrice - paidAmount,
          paymentStatus:
            payments.length > 0
              ? (payments[0].status as PaymentStatus)
              : PaymentStatus.PENDING,
          paymentMethod:
            payments.length > 0 ? payments[0].paymentMethod : undefined,
          lastPaymentDate:
            payments.length > 0 ? payments[0].paymentDate : undefined,
          refundAmount,
        },
        adminNotes: [], // Would come from backend
      };

      return enrichedBooking;
    } catch (error) {
      console.error(
        `Error enriching booking data for booking ${booking.id}:`,
        error
      );
      return this.createMinimalAdminBookingView(booking);
    }
  }

  private createMinimalAdminBookingView(booking: BookingDTO): AdminBookingView {
    return {
      ...booking,
      customerInfo: {
        id: booking.customerId,
        name: "Unknown Customer",
        email: "",
        phone: "",
        totalBookings: 0,
        registrationDate: "",
        verificationStatus: "pending",
      },
      paymentInfo: {
        totalAmount: booking.totalPrice,
        paidAmount: 0,
        remainingAmount: booking.totalPrice,
        paymentStatus: PaymentStatus.PENDING,
      },
      adminNotes: [],
    };
  }

  private applyFilters(
    bookings: AdminBookingView[],
    filters?: AdminBookingFilters
  ): AdminBookingView[] {
    if (!filters) return bookings;

    return bookings.filter((booking) => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(booking.status as BookingStatus)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const bookingStart = new Date(booking.startDate);
        const filterStart = new Date(filters.dateRange.startDate);
        const filterEnd = new Date(filters.dateRange.endDate);
        if (bookingStart < filterStart || bookingStart > filterEnd) {
          return false;
        }
      }

      // Customer name filter
      if (filters.customerName) {
        if (
          !booking.customerInfo.name
            .toLowerCase()
            .includes(filters.customerName.toLowerCase())
        ) {
          return false;
        }
      }

      // Customer email filter
      if (filters.customerEmail) {
        if (
          !booking.customerInfo.email
            .toLowerCase()
            .includes(filters.customerEmail.toLowerCase())
        ) {
          return false;
        }
      }

      // Boat name filter
      if (filters.boatName && booking.boatInfo) {
        if (
          !booking.boatInfo.name
            .toLowerCase()
            .includes(filters.boatName.toLowerCase())
        ) {
          return false;
        }
      }

      // Tour name filter
      if (filters.tourName && booking.tourInfo) {
        if (
          !booking.tourInfo.name
            .toLowerCase()
            .includes(filters.tourName.toLowerCase())
        ) {
          return false;
        }
      }

      // Payment status filter
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        if (
          !filters.paymentStatus.includes(booking.paymentInfo.paymentStatus)
        ) {
          return false;
        }
      }

      // Amount range filter
      if (filters.minAmount && booking.totalPrice < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount && booking.totalPrice > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }

  private calculateStatistics(bookings: BookingDTO[]): AdminBookingStatistics {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayBookings = bookings.filter(
      (b) => new Date(b.createdAt) >= today
    ).length;

    const thisWeekBookings = bookings.filter(
      (b) => new Date(b.createdAt) >= thisWeekStart
    ).length;

    const thisMonthBookings = bookings.filter(
      (b) => new Date(b.createdAt) >= thisMonthStart
    ).length;

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const thisMonthRevenue = bookings
      .filter((b) => new Date(b.createdAt) >= thisMonthStart)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const statusDistribution = bookings.reduce((acc, booking) => {
      const status = booking.status as BookingStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<BookingStatus, number>);

    // Initialize all status counts to 0
    Object.values(BookingStatus).forEach((status) => {
      if (!(status in statusDistribution)) {
        statusDistribution[status] = 0;
      }
    });

    return {
      total: bookings.length,
      pending: statusDistribution[BookingStatus.PENDING] || 0,
      confirmed: statusDistribution[BookingStatus.CONFIRMED] || 0,
      completed: statusDistribution[BookingStatus.COMPLETED] || 0,
      cancelled: statusDistribution[BookingStatus.CANCELLED] || 0,
      rejected: statusDistribution[BookingStatus.REJECTED] || 0,
      noShow: statusDistribution[BookingStatus.NO_SHOW] || 0,
      todayBookings,
      thisWeekBookings,
      thisMonthBookings,
      totalRevenue,
      thisMonthRevenue,
      averageBookingValue:
        bookings.length > 0 ? totalRevenue / bookings.length : 0,
      topCustomers: [], // Would need separate aggregation
      topBoats: [], // Would need separate aggregation
      topTours: [], // Would need separate aggregation
      monthlyTrend: [], // Would need separate calculation
      statusDistribution,
      paymentStatusDistribution: {} as Record<PaymentStatus, number>, // Would need payment data
    };
  }

  private createCSVExport(
    bookings: AdminBookingView[],
    config: BookingExportConfig
  ): Blob {
    const headers = [
      "ID",
      "Customer Name",
      "Customer Email",
      "Boat/Tour",
      "Start Date",
      "End Date",
      "Status",
      "Total Price",
      "Passenger Count",
      "Payment Status",
      "Created At",
    ];

    const rows = bookings.map((booking) => [
      booking.id.toString(),
      booking.customerInfo.name,
      booking.customerInfo.email,
      booking.boatInfo?.name || booking.tourInfo?.name || "N/A",
      booking.startDate,
      booking.endDate,
      booking.status,
      booking.totalPrice.toString(),
      booking.passengerCount.toString(),
      booking.paymentInfo.paymentStatus,
      booking.createdAt,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  }

  // Send notification to customer
  private async sendNotificationToCustomer(
    bookingId: number, 
    type: string, 
    reason?: string
  ): Promise<void> {
    try {
      // This would typically call a notification service
      // For now, we'll simulate it
      console.log(`Sending ${type} notification to customer for booking ${bookingId}`, { reason });
      
      // In a real implementation, this would:
      // 1. Get booking details
      // 2. Get customer contact info
      // 3. Send email/SMS notification
      // 4. Log the notification
    } catch (error) {
      console.error("Error sending customer notification:", error);
    }
  }

  // Send notification to boat owner or tour guide
  private async sendNotificationToOwner(
    bookingId: number, 
    type: string, 
    reason?: string
  ): Promise<void> {
    try {
      // This would typically call a notification service
      console.log(`Sending ${type} notification to owner/guide for booking ${bookingId}`, { reason });
      
      // In a real implementation, this would:
      // 1. Get booking details
      // 2. Get owner/guide contact info
      // 3. Send email/SMS notification
      // 4. Log the notification
    } catch (error) {
      console.error("Error sending owner notification:", error);
    }
  }

  // Update availability calendar when booking is cancelled
  private async updateAvailabilityCalendar(bookingId: number): Promise<void> {
    try {
      // This would typically update the availability service
      console.log(`Updating availability calendar for cancelled booking ${bookingId}`);
      
      // In a real implementation, this would:
      // 1. Get booking details
      // 2. Free up the time slots
      // 3. Update availability calendar
      // 4. Notify relevant parties
    } catch (error) {
      console.error("Error updating availability calendar:", error);
    }
  }

  // Reschedule booking to new date/time
  private async rescheduleBooking(
    bookingId: number, 
    newDate: { startDate: string; endDate: string }, 
    reason?: string
  ): Promise<void> {
    try {
      // This would typically update the booking with new dates
      console.log(`Rescheduling booking ${bookingId} to new dates`, newDate, { reason });
      
      // In a real implementation, this would:
      // 1. Check availability for new dates
      // 2. Update booking dates
      // 3. Update availability calendar
      // 4. Send notifications
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      throw error;
    }
  }
}

export const adminBookingService = new AdminBookingService();