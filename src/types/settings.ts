import { Priority, ReminderPreset } from './task';

export type AppTheme = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: AppTheme;
  notificationsEnabled: boolean;
  defaultReminderPreset: ReminderPreset;
  defaultPriority: Priority;
  confirmBeforeDelete: boolean;
}
