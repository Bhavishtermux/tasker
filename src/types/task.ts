export type Priority = 'normal' | 'important';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RepeatRule {
  type: RepeatType;
  interval?: number; // e.g. every 2 weeks/days/months
  daysOfWeek?: number[]; // 0 (Sunday) to 6 (Saturday)
}

export type ReminderPreset = 'none' | 'at_time' | '5m' | '10m' | '30m' | '1h' | 'custom';

export interface ReminderRule {
  preset: ReminderPreset;
  offsetMinutes: number;
  customMinutes?: number;
  notificationId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm in 24-hour format
  isAllDay: boolean;
  priority: Priority;
  reminder: ReminderRule;
  repeat: RepeatRule;
  subtasks: Subtask[];
  isCompleted: boolean;
  createdAt: string; // ISO 8601 string
  completedAt?: string; // ISO 8601 string
}

export type TaskSectionType = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'completed';

export interface TaskSectionData {
  type: TaskSectionType;
  title: string;
  data: Task[];
}
