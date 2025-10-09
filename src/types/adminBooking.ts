import { BookingDTO, BookingStatus, PaymentStatus } from "./booking.types";

// Admin-specific booking view with enriched data
export interface AdminBookingView extends BookingDTO {
  // Customer information
  customerInfo: {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
    registrationDate: string;
    verificationStatus: "verified" | "pending" | "rejected";
  };

  // Boat information (if booking is for a boat)
  boatInfo?: {
    id: number;
    name: string;
    ownerName: string;
    ownerEmail: string;
    location: string;
    type: string;
    capacity: number;
  };

  // Tour information (if booking is for a tour)
  tourInfo?: {
    id: number;
    name: string;
    guideName: string;
    guideEmail: string;
    location: string;
    duration: number;
    maxParticipants: number;
  };

  // Payment information
  paymentInfo: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    lastPaymentDate?: string;
    refundAmount?: number;
  };

  // Admin notes and actions
  adminNotes: AdminBookingNote[];
  lastModifiedBy?: {
    adminId: number;
    adminName: string;
    modifiedAt: string;
  };
}

// Admin notes for bookings
export interface AdminBookingNote {
  id: number;
  adminId: number;
  adminName: string;
  note: string;
  type: "info" | "warning" | "important";
  createdAt: string;
}

// Booking filters for admin panel
export interface AdminBookingFilters {
  status?: BookingStatus[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  customerName?: string;
  customerEmail?: string;
  boatName?: string;
  tourName?: string;
  ownerName?: string;
  guideName?: string;
  paymentStatus?: PaymentStatus[];
  minAmount?: number;
  maxAmount?: number;
  hasNotes?: boolean;
  createdDateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Booking statistics for admin dashboard
export interface AdminBookingStatistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  noShow: number;
  todayBookings: number;
  thisWeekBookings: number;
  thisMonthBookings: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  averageBookingValue: number;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    bookingCount: number;
    totalSpent: number;
  }>;
  topBoats: Array<{
    boatId: number;
    boatName: string;
    ownerName: string;
    bookingCount: number;
    revenue: number;
  }>;
  topTours: Array<{
    tourId: number;
    tourName: string;
    guideName: string;
    bookingCount: number;
    revenue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    bookings: number;
    revenue: number;
    averageValue: number;
  }>;
  statusDistribution: Record<BookingStatus, number>;
  paymentStatusDistribution: Record<PaymentStatus, number>;
}

// Booking action types for admin operations
export interface AdminBookingAction {
  type:
    | "approve"
    | "reject"
    | "cancel"
    | "complete"
    | "refund"
    | "add_note"
    | "contact_customer"
    | "contact_owner"
    | "reschedule";
  bookingId: number;
  reason?: string;
  note?: string;
  newDate?: {
    startDate: string;
    endDate: string;
  };
  refundAmount?: number;
}

// Bulk operations for admin
export interface AdminBulkBookingOperation {
  bookingIds: number[];
  operation: "approve" | "reject" | "cancel" | "export" | "add_note";
  reason?: string;
  note?: string;
}


// Booking report types
export interface BookingReportData {
  summary: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    period: string;
  };
  bookings: AdminBookingView[];
  charts: {
    dailyBookings: Array<{ date: string; count: number; revenue: number }>;
    statusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    topPerformers: Array<{
      name: string;
      type: "boat" | "tour";
      bookings: number;
      revenue: number;
    }>;
  };
}
