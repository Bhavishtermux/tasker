import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../../types/task';
import { parseDateString } from '../../utils/dateUtils';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static isInitialized = false;

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1A73E8',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    this.isInitialized = true;
    return true;
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

      if (!granted) {
        const req = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        granted = req.granted;
      }

      return granted;
    } catch (error) {
      console.warn('Failed to check/request notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule a notification for a task if reminder is configured.
   * Returns notification ID or undefined.
   */
  static async scheduleTaskReminder(task: Task, notificationsEnabled: boolean): Promise<string | undefined> {
    if (!notificationsEnabled || !task.reminder || task.reminder.preset === 'none' || task.isCompleted) {
      return undefined;
    }

    try {
      await this.initialize();
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return undefined;

      // Cancel any existing notification for this task
      if (task.reminder.notificationId) {
        await this.cancelNotification(task.reminder.notificationId);
      }

      // Calculate notification target trigger date
      const triggerDate = this.calculateTriggerDate(task);
      if (!triggerDate || triggerDate.getTime() <= Date.now()) {
        // Target date is in the past
        return undefined;
      }

      const priorityLabel = task.priority === 'important' ? '⭐ ' : '';
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${priorityLabel}${task.title}`,
          body: task.notes ? task.notes : `Due ${task.isAllDay ? 'today' : task.dueTime || 'today'} (${task.category})`,
          data: { taskId: task.id },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: 'task-reminders',
        },
      });

      return notificationId;
    } catch (error) {
      console.warn('Error scheduling notification:', error);
      return undefined;
    }
  }

  static async cancelNotification(notificationId?: string): Promise<void> {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('Error canceling notification:', error);
    }
  }

  private static calculateTriggerDate(task: Task): Date | null {
    const baseDate = parseDateString(task.dueDate);

    if (task.isAllDay || !task.dueTime) {
      // Default all-day reminder time to 9:00 AM on the due date
      baseDate.setHours(9, 0, 0, 0);
    } else {
      const [h, m] = task.dueTime.split(':').map((n) => parseInt(n, 10));
      baseDate.setHours(h, m, 0, 0);
    }

    const offsetMinutes = task.reminder.offsetMinutes || 0;
    const triggerTimestamp = baseDate.getTime() - offsetMinutes * 60 * 1000;

    return new Date(triggerTimestamp);
  }
}
