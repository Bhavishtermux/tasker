/**
 * Format a Date object to YYYY-MM-DD local string
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to HH:mm string
 */
export function formatTimeToString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse YYYY-MM-DD string into a local Date object (at 00:00:00)
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

/**
 * Get Today's date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return formatDateToString(new Date());
}

/**
 * Get Tomorrow's date string (YYYY-MM-DD)
 */
export function getTomorrowDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDateToString(date);
}

/**
 * Format date for header (e.g. "Tuesday, Sep 1")
 */
export function getHeaderDateFormatted(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format 24-hour HH:mm time string into 12-hour AM/PM (e.g., "6:00 PM")
 */
export function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format date string for task chips:
 * "Today", "Tomorrow", "Yesterday", or "MMM D"
 */
export function formatTaskDateBadge(dateStr: string): string {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateToString(yesterdayDate);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  const date = parseDateString(dateStr);
  const currentYear = new Date().getFullYear();
  if (date.getFullYear() === currentYear) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Check if a date string is before today
 */
export function isOverdueDate(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr < today;
}

/**
 * Get date with added days
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToString(date);
}

/**
 * Get date with added months
 */
export function addMonths(dateStr: string, months: number): string {
  const date = parseDateString(dateStr);
  date.setMonth(date.getMonth() + months);
  return formatDateToString(date);
}

/**
 * Format ISO completed timestamp for completed section
 */
export function formatCompletedAt(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${timeStr}`;
}
