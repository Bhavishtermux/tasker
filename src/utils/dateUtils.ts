import { TimeOfDay } from '../types/task';

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
 * Format date nicely for header (e.g. "today", "tomorrow", or "Friday, Sep 16")
 */
export function getHeaderTitleForDate(dateStr: string): string {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  if (dateStr === today) return 'today';
  if (dateStr === tomorrow) return 'tomorrow';

  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toLowerCase();
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

export interface WeekDayItem {
  dayName: string; // Mon, Tue...
  dayNumber: number; // 12, 13...
  dateStr: string; // YYYY-MM-DD
  isToday: boolean;
}

/**
 * Get the 7 days of the week for a given selected date (Mon through Sun)
 */
export function getWeekDaysForDate(selectedDateStr: string): WeekDayItem[] {
  const baseDate = parseDateString(selectedDateStr);
  const todayStr = getTodayDateString();

  const dayOfWeek = baseDate.getDay(); // 0 = Sun, 1 = Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + mondayOffset);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result: WeekDayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const loopDate = new Date(monday);
    loopDate.setDate(monday.getDate() + i);
    const dateStr = formatDateToString(loopDate);

    result.push({
      dayName: dayNames[i],
      dayNumber: loopDate.getDate(),
      dateStr,
      isToday: dateStr === todayStr,
    });
  }

  return result;
}

/**
 * Determine default TimeOfDay from dueTime (HH:mm)
 */
export function getTimeOfDayFromTime(timeStr?: string, explicitTimeOfDay?: TimeOfDay): TimeOfDay {
  if (explicitTimeOfDay) return explicitTimeOfDay;
  if (!timeStr) return 'morning';

  const [hours] = timeStr.split(':').map((n) => parseInt(n, 10));
  if (hours < 12) return 'morning';
  if (hours < 17) return 'afternoon';
  return 'evening';
}
