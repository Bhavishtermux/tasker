import { Priority, ReminderPreset } from './task';

export type AppTheme = 'light' | 'dark' | 'system';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export interface UserSettings {
  theme: AppTheme;
  notificationsEnabled: boolean;
  defaultReminderPreset: ReminderPreset;
  defaultCategory: string;
  defaultPriority: Priority;
  confirmBeforeDelete: boolean;
}
