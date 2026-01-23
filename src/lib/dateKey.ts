/**
 * Date Key Utility
 * 
 * Provides timezone-safe date key functions for consistent date handling.
 * Uses local timezone to avoid off-by-one day bugs from UTC conversion.
 */

/**
 * Convert a Date to a local date key string (YYYY-MM-DD)
 * 
 * Uses en-CA locale which provides YYYY-MM-DD format in local timezone.
 * This prevents timezone-related off-by-one day bugs.
 * 
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format (local timezone)
 * 
 * @example
 * const today = new Date();
 * const key = toLocalDateKey(today); // "2024-12-15" (in local timezone)
 */
export function toLocalDateKey(date: Date): string {
  // en-CA gives YYYY-MM-DD format in local timezone
  return date.toLocaleDateString('en-CA');
}

/**
 * Get today's date key in local timezone
 * 
 * @returns Today's date as YYYY-MM-DD string (local timezone)
 */
export function getTodayDateKey(): string {
  return toLocalDateKey(new Date());
}

/**
 * Add or subtract days from a date key
 * 
 * @param dateKey - Date key in YYYY-MM-DD format
 * @param delta - Number of days to add (positive) or subtract (negative)
 * @returns New date key in YYYY-MM-DD format
 * 
 * @example
 * addDays('2024-12-15', 1) // "2024-12-16"
 * addDays('2024-12-15', -1) // "2024-12-14"
 */
export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toLocalDateKey(dt);
}
