// Date formatting utilities for backend communication
// Backend uses LocalDateTime (timezone-naive) which gets interpreted in server timezone (Europe/Istanbul)

/**
 * Format a Date object to backend-compatible ISO string format
 * Backend expects: "YYYY-MM-DDTHH:mm:ss" (without timezone suffix)
 *
 * @param date - The Date object to format
 * @returns ISO string without timezone suffix
 */
export const formatDateTimeForBackend = (date: Date): string => {
  // Convert to ISO string and remove the 'Z' suffix and milliseconds
  const isoString = date.toISOString();
  // Remove milliseconds and Z: "2024-01-15T14:30:00.000Z" -> "2024-01-15T14:30:00"
  return isoString.split('.')[0];
};

/**
 * Parse backend ISO string to Date object
 * Backend returns: "YYYY-MM-DDTHH:mm:ss" (interpreted as server timezone)
 *
 * @param isoString - ISO string from backend
 * @returns Date object
 */
export const parseDateFromBackend = (isoString: string): Date => {
  // If string already has timezone info, parse directly
  if (isoString.endsWith('Z') || isoString.includes('+')) {
    return new Date(isoString);
  }
  // Otherwise, add 'Z' to interpret as UTC (backend stores in Europe/Istanbul but sends as UTC)
  return new Date(isoString + 'Z');
};

/**
 * Format date for display (locale-aware)
 *
 * @param date - Date object or ISO string
 * @param locale - Locale string (default: 'tr-TR')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateForDisplay = (
  date: Date | string,
  locale: string = 'tr-TR',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format datetime for display (locale-aware)
 *
 * @param date - Date object or ISO string
 * @param locale - Locale string (default: 'tr-TR')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted datetime string
 */
export const formatDateTimeForDisplay = (
  date: Date | string,
  locale: string = 'tr-TR',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Calculate duration between two dates in minutes
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in minutes
 */
export const calculateDurationMinutes = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = typeof startDate === 'string' ? parseDateFromBackend(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDateFromBackend(endDate) : endDate;
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Calculate duration between two dates in hours
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in hours
 */
export const calculateDurationHours = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  return calculateDurationMinutes(startDate, endDate) / 60;
};

/**
 * Calculate duration between two dates in days
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in days
 */
export const calculateDurationDays = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  return calculateDurationHours(startDate, endDate) / 24;
};

/**
 * Format duration in human-readable format
 *
 * @param minutes - Duration in minutes
 * @param locale - Locale ('tr' or 'en')
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number, locale: 'tr' | 'en' = 'tr'): string => {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(locale === 'tr' ? `${days} gün` : `${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(locale === 'tr' ? `${hours} saat` : `${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (mins > 0 && days === 0) {
    parts.push(locale === 'tr' ? `${mins} dakika` : `${mins} minute${mins > 1 ? 's' : ''}`);
  }

  return parts.join(' ') || (locale === 'tr' ? '0 dakika' : '0 minutes');
};

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  return dateObj.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 *
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  return dateObj.getTime() > Date.now();
};

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Add minutes to a date
 *
 * @param date - Base date
 * @param minutes - Minutes to add
 * @returns New date with added minutes
 */
export const addMinutes = (date: Date | string, minutes: number): Date => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : new Date(date);
  return new Date(dateObj.getTime() + minutes * 60 * 1000);
};

/**
 * Add hours to a date
 *
 * @param date - Base date
 * @param hours - Hours to add
 * @returns New date with added hours
 */
export const addHours = (date: Date | string, hours: number): Date => {
  return addMinutes(date, hours * 60);
};

/**
 * Add days to a date
 *
 * @param date - Base date
 * @param days - Days to add
 * @returns New date with added days
 */
export const addDays = (date: Date | string, days: number): Date => {
  return addHours(date, days * 24);
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date to compare
 * @param locale - Locale ('tr' or 'en')
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date | string, locale: 'tr' | 'en' = 'tr'): string => {
  const dateObj = typeof date === 'string' ? parseDateFromBackend(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const isPast = diffMs < 0;

  if (diffMinutes < 1) {
    return locale === 'tr' ? 'şimdi' : 'now';
  }

  if (diffMinutes < 60) {
    const text = locale === 'tr' ? `${diffMinutes} dakika` : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    return isPast ? (locale === 'tr' ? `${text} önce` : `${text} ago`) : (locale === 'tr' ? `${text} sonra` : `in ${text}`);
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const text = locale === 'tr' ? `${diffHours} saat` : `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return isPast ? (locale === 'tr' ? `${text} önce` : `${text} ago`) : (locale === 'tr' ? `${text} sonra` : `in ${text}`);
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    const text = locale === 'tr' ? `${diffDays} gün` : `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    return isPast ? (locale === 'tr' ? `${text} önce` : `${text} ago`) : (locale === 'tr' ? `${text} sonra` : `in ${text}`);
  }

  const diffMonths = Math.floor(diffDays / 30);
  const text = locale === 'tr' ? `${diffMonths} ay` : `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  return isPast ? (locale === 'tr' ? `${text} önce` : `${text} ago`) : (locale === 'tr' ? `${text} sonra` : `in ${text}`);
};
