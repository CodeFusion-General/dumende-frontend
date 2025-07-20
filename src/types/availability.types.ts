export interface CalendarAvailability {
  date: string; // Format: yyyy-MM-dd
  isAvailable: boolean;
  isOverride?: boolean;
  price?: number;
  hasBookings?: boolean;
  bookingCount?: number;
}
i
export interface AvailabilityData {
  id: number;
  boatId: number;
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
  createdAt: string;
  updatedAt: string;
}
