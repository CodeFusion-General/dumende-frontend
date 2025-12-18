// Booking status utilities for managing status transitions, colors, and labels

import { BookingStatus } from '@/types/booking.types';

/**
 * Status flow diagram:
 * RESERVED (payment pending, 15min TTL)
 *   ↓
 * PENDING (user initiated payment)
 *   ↓
 * PROCESSING (payment gateway processing)
 *   ↓
 * CONFIRMED (payment successful)
 *   ↓
 * COMPLETED (service completed) or
 * CANCELLED (user/system cancelled) or
 * NO_SHOW (customer didn't show) or
 * REJECTED (owner/system rejected)
 */

/**
 * Valid status transitions map
 */
const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.RESERVED]: [
    BookingStatus.PENDING,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.PENDING]: [
    BookingStatus.PROCESSING,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.PROCESSING]: [
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
    BookingStatus.NO_SHOW,
  ],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.NO_SHOW]: [],
  [BookingStatus.REJECTED]: [],
};

/**
 * Check if a status transition is valid
 *
 * @param from - Current status
 * @param to - Target status
 * @returns True if transition is valid
 */
export const isValidStatusTransition = (
  from: BookingStatus,
  to: BookingStatus
): boolean => {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};

/**
 * Get allowed next statuses for a given status
 *
 * @param currentStatus - Current booking status
 * @returns Array of allowed next statuses
 */
export const getAllowedNextStatuses = (
  currentStatus: BookingStatus
): BookingStatus[] => {
  return VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
};

/**
 * Get Tailwind color classes for a status
 *
 * @param status - Booking status
 * @returns Tailwind CSS classes for badge styling
 */
export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.RESERVED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case BookingStatus.PENDING:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case BookingStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-800 border-green-300';
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-300';
    case BookingStatus.COMPLETED:
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case BookingStatus.NO_SHOW:
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case BookingStatus.REJECTED:
      return 'bg-red-100 text-red-900 border-red-400';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Get localized status label
 *
 * @param status - Booking status
 * @param language - Language code ('tr' or 'en')
 * @returns Localized status label
 */
export const getStatusLabel = (
  status: BookingStatus,
  language: 'tr' | 'en' = 'tr'
): string => {
  const labels: Record<BookingStatus, { tr: string; en: string }> = {
    [BookingStatus.RESERVED]: { tr: 'Tutuldu', en: 'Reserved' },
    [BookingStatus.PENDING]: { tr: 'Beklemede', en: 'Pending' },
    [BookingStatus.PROCESSING]: { tr: 'İşleniyor', en: 'Processing' },
    [BookingStatus.CONFIRMED]: { tr: 'Onaylandı', en: 'Confirmed' },
    [BookingStatus.CANCELLED]: { tr: 'İptal Edildi', en: 'Cancelled' },
    [BookingStatus.COMPLETED]: { tr: 'Tamamlandı', en: 'Completed' },
    [BookingStatus.NO_SHOW]: { tr: 'Gelmedi', en: 'No Show' },
    [BookingStatus.REJECTED]: { tr: 'Reddedildi', en: 'Rejected' },
  };

  return labels[status]?.[language] ?? status;
};

/**
 * Get status description
 *
 * @param status - Booking status
 * @param language - Language code ('tr' or 'en')
 * @returns Localized status description
 */
export const getStatusDescription = (
  status: BookingStatus,
  language: 'tr' | 'en' = 'tr'
): string => {
  const descriptions: Record<BookingStatus, { tr: string; en: string }> = {
    [BookingStatus.RESERVED]: {
      tr: 'Rezervasyon geçici olarak tutuldu. Ödeme bekliyor (15 dakika).',
      en: 'Reservation temporarily held. Payment pending (15 minutes).',
    },
    [BookingStatus.PENDING]: {
      tr: 'Ödeme işlemi başlatıldı.',
      en: 'Payment process initiated.',
    },
    [BookingStatus.PROCESSING]: {
      tr: 'Ödeme işlemi gerçekleştiriliyor.',
      en: 'Payment is being processed.',
    },
    [BookingStatus.CONFIRMED]: {
      tr: 'Rezervasyon onaylandı. Ödeme tamamlandı.',
      en: 'Reservation confirmed. Payment completed.',
    },
    [BookingStatus.CANCELLED]: {
      tr: 'Rezervasyon iptal edildi.',
      en: 'Reservation cancelled.',
    },
    [BookingStatus.COMPLETED]: {
      tr: 'Hizmet tamamlandı.',
      en: 'Service completed.',
    },
    [BookingStatus.NO_SHOW]: {
      tr: 'Müşteri gelmedi.',
      en: 'Customer did not show up.',
    },
    [BookingStatus.REJECTED]: {
      tr: 'Rezervasyon reddedildi.',
      en: 'Reservation rejected.',
    },
  };

  return descriptions[status]?.[language] ?? '';
};

/**
 * Get status icon (emoji or icon name)
 *
 * @param status - Booking status
 * @returns Icon representation
 */
export const getStatusIcon = (status: BookingStatus): string => {
  const icons: Record<BookingStatus, string> = {
    [BookingStatus.RESERVED]: '⏳',
    [BookingStatus.PENDING]: '🕐',
    [BookingStatus.PROCESSING]: '⚙️',
    [BookingStatus.CONFIRMED]: '✅',
    [BookingStatus.CANCELLED]: '❌',
    [BookingStatus.COMPLETED]: '🎉',
    [BookingStatus.NO_SHOW]: '👻',
    [BookingStatus.REJECTED]: '🚫',
  };

  return icons[status] ?? '❓';
};

/**
 * Check if a status is considered "active" (can still be modified)
 *
 * @param status - Booking status
 * @returns True if status is active
 */
export const isActiveStatus = (status: BookingStatus): boolean => {
  return [
    BookingStatus.RESERVED,
    BookingStatus.PENDING,
    BookingStatus.PROCESSING,
    BookingStatus.CONFIRMED,
  ].includes(status);
};

/**
 * Check if a status is considered "final" (cannot be modified)
 *
 * @param status - Booking status
 * @returns True if status is final
 */
export const isFinalStatus = (status: BookingStatus): boolean => {
  return [
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
    BookingStatus.NO_SHOW,
    BookingStatus.REJECTED,
  ].includes(status);
};

/**
 * Check if booking can be cancelled
 *
 * @param status - Current booking status
 * @returns True if booking can be cancelled
 */
export const canCancelBooking = (status: BookingStatus): boolean => {
  return [
    BookingStatus.RESERVED,
    BookingStatus.PENDING,
    BookingStatus.PROCESSING,
    BookingStatus.CONFIRMED,
  ].includes(status);
};

/**
 * Check if booking requires payment
 *
 * @param status - Current booking status
 * @returns True if payment is required
 */
export const requiresPayment = (status: BookingStatus): boolean => {
  return [
    BookingStatus.RESERVED,
    BookingStatus.PENDING,
  ].includes(status);
};

/**
 * Get all statuses that should be shown in a filter
 *
 * @returns Array of filterable statuses
 */
export const getFilterableStatuses = (): BookingStatus[] => {
  return Object.values(BookingStatus);
};

/**
 * Sort bookings by status priority (for display purposes)
 *
 * @param status - Booking status
 * @returns Priority number (lower = higher priority)
 */
export const getStatusPriority = (status: BookingStatus): number => {
  const priorities: Record<BookingStatus, number> = {
    [BookingStatus.RESERVED]: 1,
    [BookingStatus.PENDING]: 2,
    [BookingStatus.PROCESSING]: 3,
    [BookingStatus.CONFIRMED]: 4,
    [BookingStatus.COMPLETED]: 5,
    [BookingStatus.CANCELLED]: 6,
    [BookingStatus.NO_SHOW]: 7,
    [BookingStatus.REJECTED]: 8,
  };

  return priorities[status] ?? 99;
};

/**
 * Calculate time remaining for RESERVED status (15 minutes TTL)
 *
 * @param createdAt - Booking creation timestamp
 * @returns Time remaining in milliseconds, or null if expired/not applicable
 */
export const getReservationTimeRemaining = (createdAt: string | Date): number | null => {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const expiresAt = new Date(created.getTime() + 15 * 60 * 1000); // 15 minutes
  const now = new Date();
  const remaining = expiresAt.getTime() - now.getTime();

  return remaining > 0 ? remaining : null;
};

/**
 * Format reservation time remaining
 *
 * @param milliseconds - Time remaining in milliseconds
 * @param language - Language code ('tr' or 'en')
 * @returns Formatted time string
 */
export const formatReservationTimeRemaining = (
  milliseconds: number,
  language: 'tr' | 'en' = 'tr'
): string => {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  if (language === 'tr') {
    return `${minutes}:${seconds.toString().padStart(2, '0')} dakika`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')} minutes`;
  }
};
