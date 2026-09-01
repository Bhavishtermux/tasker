import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Task, Subtask, TaskSectionData } from '../types/task';
import { taskRepository } from '../services/storage/AsyncStorageTaskRepository';
import {
  groupTasksIntoSections,
  filterTasksBySearch,
  generateNextOccurrence,
} from '../services/tasks/TaskLogic';
import {
  calculateProgressMetrics,
  ProgressMetrics,
} from '../services/tasks/StreakCalculator';
import { NotificationService } from '../services/notifications/NotificationService';
import { useSettings } from './SettingsContext';

interface TaskContextType {
  tasks: Task[];
  sections: TaskSectionData[];
  metrics: ProgressMetrics;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  lastDeletedTask: Task | null;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  undoDeleteTask: () => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  editSubtask: (taskId: string, subtaskId: string, newTitle: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  wipeAllData: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await taskRepository.getAllTasks();
      setTasks(storedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add Task
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };

    // Schedule notification if reminder enabled
    if (newTask.reminder && newTask.reminder.preset !== 'none') {
      const notifId = await NotificationService.scheduleTaskReminder(
        newTask,
        settings.notificationsEnabled
      );
      if (notifId) {
        newTask.reminder.notificationId = notifId;
      }
    }

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await taskRepository.saveTasks(updatedTasks);

    return newTask;
  };

  // Update Task
  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    const existingIndex = tasks.findIndex((t) => t.id === id);
    if (existingIndex < 0) return;

    const oldTask = tasks[existingIndex];
    const updatedTask: Task = { ...oldTask, ...updates };

    // Handle reminder notification rescheduling
    if (
      updates.reminder !== undefined ||
      updates.dueDate !== undefined ||
      updates.dueTime !== undefined ||
      updates.isAllDay !== undefined
    ) {
      if (oldTask.reminder?.notificationId) {
        await NotificationService.cancelNotification(oldTask.reminder.notificationId);
      }

      if (updatedTask.reminder && updatedTask.reminder.preset !== 'none' && !updatedTask.isCompleted) {
        const notifId = await NotificationService.scheduleTaskReminder(
          updatedTask,
          settings.notificationsEnabled
        );
        updatedTask.reminder.notificationId = notifId;
      } else {
        updatedTask.reminder = {
          ...updatedTask.reminder,
          notificationId: undefined,
        };
      }
    }

    const updatedList = [...tasks];
    updatedList[existingIndex] = updatedTask;
    setTasks(updatedList);
    await taskRepository.saveTasks(updatedList);
  };

  // Toggle Task Completion
  const toggleTaskCompletion = async (id: string): Promise<void> => {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex < 0) return;

    const currentTask = tasks[taskIndex];
    const newIsCompleted = !currentTask.isCompleted;
    const nowIso = new Date().toISOString();

    let updatedTasks = [...tasks];

    if (newIsCompleted) {
      // Cancel reminder notification
      if (currentTask.reminder?.notificationId) {
        await NotificationService.cancelNotification(currentTask.reminder.notificationId);
      }

      // Complete current task
      const completedTask: Task = {
        ...currentTask,
        isCompleted: true,
        completedAt: nowIso,
      };
      updatedTasks[taskIndex] = completedTask;

      // If recurring, generate next occurrence
      if (currentTask.repeat && currentTask.repeat.type !== 'none') {
        const nextOccurrence = generateNextOccurrence(currentTask);
        if (nextOccurrence) {
          // Schedule reminder for the next occurrence if reminder was active
          if (nextOccurrence.reminder && nextOccurrence.reminder.preset !== 'none') {
            const notifId = await NotificationService.scheduleTaskReminder(
              nextOccurrence,
              settings.notificationsEnabled
            );
            nextOccurrence.reminder.notificationId = notifId;
          }
          updatedTasks.unshift(nextOccurrence);
        }
      }
    } else {
      // Uncompleting: restore to active section, clear completedAt
      const uncompletedTask: Task = {
        ...currentTask,
        isCompleted: false,
        completedAt: undefined,
      };

      // Reschedule reminder if configured
      if (uncompletedTask.reminder && uncompletedTask.reminder.preset !== 'none') {
        const notifId = await NotificationService.scheduleTaskReminder(
          uncompletedTask,
          settings.notificationsEnabled
        );
        uncompletedTask.reminder.notificationId = notifId;
      }

      updatedTasks[taskIndex] = uncompletedTask;
    }

    setTasks(updatedTasks);
    await taskRepository.saveTasks(updatedTasks);
  };

  // Delete Task
  const deleteTask = async (id: string): Promise<void> => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Cancel notification
    if (taskToDelete.reminder?.notificationId) {
      await NotificationService.cancelNotification(taskToDelete.reminder.notificationId);
    }

    setLastDeletedTask(taskToDelete);
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    await taskRepository.saveTasks(updatedTasks);
  };

  // Undo Delete Task
  const undoDeleteTask = async (): Promise<void> => {
    if (!lastDeletedTask) return;

    const restoredTask = { ...lastDeletedTask };
    // Reschedule reminder if it was active and not completed
    if (
      restoredTask.reminder &&
      restoredTask.reminder.preset !== 'none' &&
      !restoredTask.isCompleted
    ) {
      const notifId = await NotificationService.scheduleTaskReminder(
        restoredTask,
        settings.notificationsEnabled
      );
      restoredTask.reminder.notificationId = notifId;
    }

    const updatedTasks = [restoredTask, ...tasks];
    setTasks(updatedTasks);
    setLastDeletedTask(null);
    await taskRepository.saveTasks(updatedTasks);
  };

  // Subtask management
  const addSubtask = async (taskId: string, title: string): Promise<void> => {
    if (!title.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      isCompleted: false,
    };

    const updatedSubtasks = [...task.subtasks, newSubtask];
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const editSubtask = async (
    taskId: string,
    subtaskId: string,
    newTitle: string
  ): Promise<void> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, title: newTitle.trim() } : s
    );
    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  // Clear Completed
  const clearCompletedTasks = async (): Promise<void> => {
    const activeOnly = tasks.filter((t) => !t.isCompleted);
    setTasks(activeOnly);
    await taskRepository.clearCompletedTasks();
  };

  // Wipe All Data
  const wipeAllData = async (): Promise<void> => {
    // Cancel all notifications
    for (const t of tasks) {
      if (t.reminder?.notificationId) {
        await NotificationService.cancelNotification(t.reminder.notificationId);
      }
    }
    setTasks([]);
    await taskRepository.wipeAllTasks();
  };

  // Computed filtered tasks & sections
  const filteredTasks = useMemo(() => {
    return filterTasksBySearch(tasks, searchQuery);
  }, [tasks, searchQuery]);

  const sections = useMemo(() => {
    return groupTasksIntoSections(filteredTasks);
  }, [filteredTasks]);

  // Computed metrics
  const metrics = useMemo(() => {
    return calculateProgressMetrics(tasks);
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        sections,
        metrics,
        searchQuery,
        setSearchQuery,
        isLoading,
        lastDeletedTask,
        addTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
        undoDeleteTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        editSubtask,
        clearCompletedTasks,
        wipeAllData,
        refreshTasks: loadTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
