import { Task } from '../../types/task';
import {
  getTodayDateString,
  parseDateString,
  formatDateToString,
  addDays,
} from '../../utils/dateUtils';

export interface DayProgress {
  dayName: string; // "Mon", "Tue", etc.
  dateStr: string; // "YYYY-MM-DD"
  completed: number;
  total: number;
  isToday: boolean;
}

export interface ProgressMetrics {
  todayPercentage: number;
  tasksCompletedToday: number;
  tasksCreatedToday: number;
  totalTasksToday: number;
  weeklyDays: DayProgress[];
  monthlyCompleted: number;
  monthlyTotal: number;
  monthlyPercentage: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletedTasks: number;
}

/**
 * Calculate comprehensive progress metrics and streak counters from actual task history
 */
export function calculateProgressMetrics(tasks: Task[]): ProgressMetrics {
  const today = getTodayDateString();
  const todayDate = new Date();

  // 1. Total completed tasks all time
  const totalCompletedTasks = tasks.filter((t) => t.isCompleted).length;

  // 2. Today's metrics (tasks due today or completed today)
  const tasksDueToday = tasks.filter((t) => t.dueDate === today);
  const tasksCompletedToday = tasks.filter((t) => {
    if (!t.completedAt) return false;
    return formatDateToString(new Date(t.completedAt)) === today;
  }).length;

  const tasksCreatedToday = tasks.filter((t) => {
    return formatDateToString(new Date(t.createdAt)) === today;
  }).length;

  const totalTasksToday = Math.max(tasksDueToday.length, tasksCompletedToday);
  const todayPercentage =
    totalTasksToday > 0 ? Math.round((tasksCompletedToday / totalTasksToday) * 100) : 0;

  // 3. Weekly breakdown (Monday to Sunday of current week)
  const currentDayOfWeek = todayDate.getDay(); // 0 = Sun, 1 = Mon...
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(todayDate);
  mondayDate.setDate(todayDate.getDate() + mondayOffset);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyDays: DayProgress[] = [];

  for (let i = 0; i < 7; i++) {
    const loopDate = new Date(mondayDate);
    loopDate.setDate(mondayDate.getDate() + i);
    const loopDateStr = formatDateToString(loopDate);
    const isLoopToday = loopDateStr === today;

    // Tasks completed on loopDate
    const completedOnDay = tasks.filter((t) => {
      if (!t.completedAt) return false;
      return formatDateToString(new Date(t.completedAt)) === loopDateStr;
    }).length;

    // Tasks due on loopDate
    const dueOnDay = tasks.filter((t) => t.dueDate === loopDateStr).length;
    const totalOnDay = Math.max(dueOnDay, completedOnDay);

    weeklyDays.push({
      dayName: dayNames[i],
      dateStr: loopDateStr,
      completed: completedOnDay,
      total: totalOnDay,
      isToday: isLoopToday,
    });
  }

  // 4. Monthly metrics (current calendar month)
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();

  const monthlyCompleted = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const monthlyDue = tasks.filter((t) => {
    const d = parseDateString(t.dueDate);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const monthlyTotal = Math.max(monthlyDue, monthlyCompleted);
  const monthlyPercentage =
    monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;

  // 5. Streaks calculation
  // Gather all unique days where at least 1 task was completed
  const completedDateSet = new Set<string>();
  for (const t of tasks) {
    if (t.completedAt) {
      completedDateSet.add(formatDateToString(new Date(t.completedAt)));
    }
  }

  const sortedDates = Array.from(completedDateSet).sort();

  let currentStreak = 0;
  let bestStreak = 0;

  if (sortedDates.length > 0) {
    // Check if streak is active (completed today or yesterday)
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const yesterdayStr = formatDateToString(yesterdayDate);

    const hasToday = completedDateSet.has(today);
    const hasYesterday = completedDateSet.has(yesterdayStr);

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? todayDate : yesterdayDate;
      let streakCount = 0;

      while (true) {
        const checkDateStr = formatDateToString(checkDate);
        if (completedDateSet.has(checkDateStr)) {
          streakCount++;
          const prev = new Date(checkDate);
          prev.setDate(prev.getDate() - 1);
          checkDate = prev;
        } else {
          break;
        }
      }
      currentStreak = streakCount;
    }

    // Best streak all-time
    let runningStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const d = parseDateString(dStr);
      if (!prevDate) {
        runningStreak = 1;
      } else {
        const diffTime = d.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }
      }
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
      prevDate = d;
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    todayPercentage,
    tasksCompletedToday,
    tasksCreatedToday,
    totalTasksToday,
    weeklyDays,
    monthlyCompleted,
    monthlyTotal,
    monthlyPercentage,
    currentStreak,
    bestStreak,
    totalCompletedTasks,
  };
}
