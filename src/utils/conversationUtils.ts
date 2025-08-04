import { BookingDTO, BookingStatus } from "@/types/booking.types";
import { BoatDTO } from "@/types/boat.types";
import { boatService } from "@/services/boatService";
import { logSecurityEvent } from "./messagingSecurity";

/**
 * Generates a unique conversation ID for booking-based messaging
 * Format: booking_{bookingId}_{customerId}_{captainId}
 */
export const generateBookingConversationId = (
  bookingId: number,
  customerId: number,
  captainId: number
): string => {
  return `booking_${bookingId}_${customerId}_${captainId}`;
};

/**
 * Extracts captain ID from booking data by fetching boat information
 * The captain ID is the boat owner ID
 */
export const extractCaptainIdFromBooking = async (
  booking: BookingDTO
): Promise<number> => {
  try {
    const boat = await boatService.getBoatById(booking.boatId);
    return boat.ownerId;
  } catch (error) {
    throw new Error(
      `Failed to extract captain ID from booking ${booking.id}: ${error}`
    );
  }
};

/**
 * Validates if a user has access to messaging for a specific booking
 * Rules:
 * - Booking must exist and be in an active status (PENDING, CONFIRMED)
 * - User must be either the customer or the captain (boat owner)
 * - CANCELLED and REJECTED bookings disable messaging
 */
export const validateBookingMessagingAccess = async (
  booking: BookingDTO,
  userId: number
): Promise<{
  hasAccess: boolean;
  reason?: string;
  captainId?: number;
}> => {
  try {
    // Enhanced security: Check if booking exists and is valid
    if (!booking || !booking.id || !booking.customerId || !booking.boatId) {
      logSecurityEvent({
        type: "access_denied",
        userId,
        details: "Invalid booking data provided",
        timestamp: new Date(),
        severity: "medium",
      });

      return {
        hasAccess: false,
        reason: "Invalid booking data",
      };
    }

    // Check if booking status allows messaging
    const allowedStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED, // Allow messaging even after completion for follow-up
    ];

    if (!allowedStatuses.includes(booking.status as BookingStatus)) {
      return {
        hasAccess: false,
        reason: `Messaging is not available for ${booking.status} bookings`,
      };
    }

    // Get captain ID from boat owner
    const captainId = await extractCaptainIdFromBooking(booking);

    // Enhanced security: Validate captain ID
    if (!captainId || captainId <= 0) {
      logSecurityEvent({
        type: "access_denied",
        userId,
        bookingId: booking.id,
        details: "Invalid captain ID extracted from booking",
        timestamp: new Date(),
        severity: "high",
      });

      return {
        hasAccess: false,
        reason: "Invalid captain information",
      };
    }

    // Check if user is either customer or captain
    const isCustomer = userId === booking.customerId;
    const isCaptain = userId === captainId;

    if (!isCustomer && !isCaptain) {
      // Log unauthorized access attempt
      logSecurityEvent({
        type: "access_denied",
        userId,
        bookingId: booking.id,
        details: `User ${userId} attempted to access booking ${booking.id} (customer: ${booking.customerId}, captain: ${captainId})`,
        timestamp: new Date(),
        severity: "high",
      });

      return {
        hasAccess: false,
        reason: "User is not authorized to access this booking conversation",
      };
    }

    return {
      hasAccess: true,
      captainId,
    };
  } catch (error) {
    // Log validation error
    logSecurityEvent({
      type: "access_denied",
      userId,
      bookingId: booking?.id,
      details: `Booking access validation failed: ${error}`,
      timestamp: new Date(),
      severity: "medium",
    });

    return {
      hasAccess: false,
      reason: `Failed to validate booking access: ${error}`,
    };
  }
};

/**
 * Validates if messaging is available for a specific booking status
 */
export const isMessagingEnabledForBookingStatus = (
  status: BookingStatus
): boolean => {
  const enabledStatuses: BookingStatus[] = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.COMPLETED,
  ];

  return enabledStatuses.includes(status);
};

/**
 * Generates conversation metadata for booking-based messaging
 */
export const generateBookingConversationMetadata = (
  booking: BookingDTO,
  captainId: number
) => {
  return {
    conversationId: generateBookingConversationId(
      booking.id,
      booking.customerId,
      captainId
    ),
    bookingId: booking.id,
    customerId: booking.customerId,
    captainId,
    bookingStatus: booking.status,
    messagingEnabled: isMessagingEnabledForBookingStatus(
      booking.status as BookingStatus
    ),
  };
};

/**
 * Parses conversation ID to extract booking information
 * Returns null if conversation ID is not in booking format
 */
export const parseBookingConversationId = (
  conversationId: string
): {
  bookingId: number;
  customerId: number;
  captainId: number;
} | null => {
  const bookingConversationPattern = /^booking_(\d+)_(\d+)_(\d+)$/;
  const match = conversationId.match(bookingConversationPattern);

  if (!match) {
    return null;
  }

  return {
    bookingId: parseInt(match[1], 10),
    customerId: parseInt(match[2], 10),
    captainId: parseInt(match[3], 10),
  };
};

/**
 * Validates conversation ID format for booking-based messaging
 */
export const isValidBookingConversationId = (
  conversationId: string
): boolean => {
  return parseBookingConversationId(conversationId) !== null;
};
