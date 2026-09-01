import { Task, TaskSectionData, TaskSectionType } from '../../types/task';
import {
  getTodayDateString,
  getTomorrowDateString,
  isOverdueDate,
  parseDateString,
  addDays,
  addMonths,
} from '../../utils/dateUtils';

/**
 * Determine the date section for a task
 */
export function getTaskSection(task: Task): TaskSectionType {
  if (task.isCompleted) {
    return 'completed';
  }

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  if (isOverdueDate(task.dueDate)) {
    return 'overdue';
  }

  if (task.dueDate === today) {
    return 'today';
  }

  if (task.dueDate === tomorrow) {
    return 'tomorrow';
  }

  return 'upcoming';
}

/**
 * Group tasks into sections: Overdue, Today, Tomorrow, Upcoming, Completed.
 * Only non-empty sections are returned.
 */
export function groupTasksIntoSections(tasks: Task[]): TaskSectionData[] {
  const sections: Record<TaskSectionType, Task[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    upcoming: [],
    completed: [],
  };

  for (const task of tasks) {
    const sectionType = getTaskSection(task);
    sections[sectionType].push(task);
  }

  const sortActiveTasks = (a: Task, b: Task) => {
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
    if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueTime && !b.dueTime) return -1;
    if (!a.dueTime && b.dueTime) return 1;
    if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
    return b.createdAt.localeCompare(a.createdAt);
  };

  const sortCompletedTasks = (a: Task, b: Task) => {
    const timeA = a.completedAt || a.createdAt;
    const timeB = b.completedAt || b.createdAt;
    return timeB.localeCompare(timeA);
  };

  sections.overdue.sort(sortActiveTasks);
  sections.today.sort(sortActiveTasks);
  sections.tomorrow.sort(sortActiveTasks);
  sections.upcoming.sort(sortActiveTasks);
  sections.completed.sort(sortCompletedTasks);

  const result: TaskSectionData[] = [];

  if (sections.overdue.length > 0) {
    result.push({ type: 'overdue', title: 'Overdue', data: sections.overdue });
  }
  if (sections.today.length > 0) {
    result.push({ type: 'today', title: 'Today', data: sections.today });
  }
  if (sections.tomorrow.length > 0) {
    result.push({ type: 'tomorrow', title: 'Tomorrow', data: sections.tomorrow });
  }
  if (sections.upcoming.length > 0) {
    result.push({ type: 'upcoming', title: 'Upcoming', data: sections.upcoming });
  }
  if (sections.completed.length > 0) {
    result.push({ type: 'completed', title: 'Completed', data: sections.completed });
  }

  return result;
}

/**
 * Filter tasks by search query across title, notes, and subtasks
 */
export function filterTasksBySearch(tasks: Task[], query: string): Task[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return tasks;

  return tasks.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(cleanQuery);
    const notesMatch = task.notes ? task.notes.toLowerCase().includes(cleanQuery) : false;
    const subtaskMatch = task.subtasks.some((s) => s.title.toLowerCase().includes(cleanQuery));

    return titleMatch || notesMatch || subtaskMatch;
  });
}

/**
 * Calculate the next due date for a recurring task.
 */
export function calculateNextDueDate(currentDueDate: string, repeat: Task['repeat']): string {
  const interval = repeat.interval && repeat.interval > 0 ? repeat.interval : 1;
  const baseDate = parseDateString(currentDueDate);

  switch (repeat.type) {
    case 'daily': {
      return addDays(currentDueDate, interval);
    }
    case 'weekly': {
      if (repeat.daysOfWeek && repeat.daysOfWeek.length > 0) {
        const currentDay = baseDate.getDay();
        const sortedDays = [...repeat.daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find((d) => d > currentDay);

        if (nextDay !== undefined) {
          const diff = nextDay - currentDay;
          return addDays(currentDueDate, diff);
        } else {
          const firstDay = sortedDays[0];
          const daysUntilNextWeek = 7 - currentDay + firstDay + (interval - 1) * 7;
          return addDays(currentDueDate, daysUntilNextWeek);
        }
      }
      return addDays(currentDueDate, 7 * interval);
    }
    case 'monthly': {
      return addMonths(currentDueDate, interval);
    }
    case 'custom': {
      return addDays(currentDueDate, interval);
    }
    default:
      return currentDueDate;
  }
}

/**
 * Generates the next occurrence of a recurring task when completed.
 */
export function generateNextOccurrence(task: Task): Task | null {
  if (!task.repeat || task.repeat.type === 'none') {
    return null;
  }

  const nextDueDate = calculateNextDueDate(task.dueDate, task.repeat);

  const resetSubtasks = task.subtasks.map((s) => ({
    ...s,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    isCompleted: false,
  }));

  const nextTask: Task = {
    ...task,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    dueDate: nextDueDate,
    isCompleted: false,
    completedAt: undefined,
    createdAt: new Date().toISOString(),
    subtasks: resetSubtasks,
    reminder: {
      ...task.reminder,
      notificationId: undefined,
    },
  };

  return nextTask;
}
