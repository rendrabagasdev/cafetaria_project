/**
 * Date & Time Utilities
 *
 * Helper functions for date manipulation and formatting
 */

/**
 * Get start of day (00:00:00)
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get end of day (23:59:59.999)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get date range for today
 */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: getStartOfDay(now),
    end: getEndOfDay(now),
  };
}

/**
 * Get date range for yesterday
 */
export function getYesterdayRange(): { start: Date; end: Date } {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return {
    start: getStartOfDay(yesterday),
    end: getEndOfDay(yesterday),
  };
}

/**
 * Get date range for current week
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get date range for current month
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

/**
 * Format date to Indonesian locale
 *
 * @example
 * formatDateIndonesian(new Date()) // "3 Desember 2025"
 */
export function formatDateIndonesian(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format date and time to Indonesian locale
 *
 * @example
 * formatDateTimeIndonesian(new Date()) // "3 Desember 2025, 14:30"
 */
export function formatDateTimeIndonesian(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format time only
 *
 * @example
 * formatTime(new Date()) // "14:30:45"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format date untuk display (short)
 *
 * @example
 * formatDate(new Date()) // "3 Des 2025"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Add minutes to date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date is expired
 */
export function isExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

/**
 * Get relative time string (e.g., "5 menit lalu")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Baru saja";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} menit lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  } else if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  } else {
    return formatDateIndonesian(date);
  }
}

/**
 * Parse date from various formats
 */
export function parseFlexibleDate(input: string | Date): Date | null {
  if (input instanceof Date) {
    return input;
  }

  // Try ISO format
  const isoDate = new Date(input);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try DD-MM-YYYY format
  const ddmmyyyyRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = input.match(ddmmyyyyRegex);
  if (match) {
    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
}
