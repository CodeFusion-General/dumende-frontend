export interface CalendarAvailability {
  date: string; // Format: yyyy-MM-dd
  isAvailable: boolean;
  isOverride?: boolean;
  price?: number;
  hasBookings?: boolean;
  bookingCount?: number;
  isInstantConfirmation?: boolean;
}
i
export interface AvailabilityData {
  id: number;
  boatId: number;
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
  isInstantConfirmation?: boolean;
  createdAt: string;
  updatedAt: string;
}
