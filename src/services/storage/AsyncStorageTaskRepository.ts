import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../../types/task';
import { ITaskRepository } from './ITaskRepository';
import { getTodayDateString } from '../../utils/dateUtils';

const STORAGE_KEY_TASKS = '@antigravity_tasks_v1';

export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-1',
    title: 'design user registration process',
    dueDate: getTodayDateString(),
    dueTime: '09:30',
    isAllDay: false,
    timeOfDay: 'morning',
    estimatedMinutes: 50,
    category: 'coinbase',
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'review and provide feedback on the wireframes for the new design concept',
    dueDate: getTodayDateString(),
    dueTime: '10:45',
    isAllDay: false,
    timeOfDay: 'morning',
    estimatedMinutes: 45,
    category: 'apple',
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'mood board for the ecommerce template',
    dueDate: getTodayDateString(),
    dueTime: '11:30',
    isAllDay: false,
    timeOfDay: 'morning',
    estimatedMinutes: 30,
    category: 'shopify',
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'finalize color palette and typography',
    dueDate: getTodayDateString(),
    dueTime: '14:00',
    isAllDay: false,
    timeOfDay: 'afternoon',
    estimatedMinutes: 25,
    category: 'apple',
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    title: 'analyze user feedback and suggest improvements',
    dueDate: getTodayDateString(),
    dueTime: '15:30',
    isAllDay: false,
    timeOfDay: 'afternoon',
    estimatedMinutes: 60,
    category: 'insurance',
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-6',
    title: 'evaluate two potential website layouts',
    dueDate: getTodayDateString(),
    dueTime: '16:45',
    isAllDay: false,
    timeOfDay: 'afternoon',
    estimatedMinutes: 45,
    category: 'shopify',
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

export class AsyncStorageTaskRepository implements ITaskRepository {
  async getAllTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_TASKS);
      if (!data) {
        // Initialize with high quality seed tasks matching reference UI
        await this.saveTasks(INITIAL_SAMPLE_TASKS);
        return INITIAL_SAMPLE_TASKS;
      }
      const tasks: Task[] = JSON.parse(data);
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('Failed to load tasks from AsyncStorage:', error);
      return [];
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find((t) => t.id === id) || null;
  }

  async saveTask(task: Task): Promise<void> {
    const tasks = await this.getAllTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.unshift(task);
    }
    await this.saveTasks(tasks);
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to AsyncStorage:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getAllTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.saveTasks(filtered);
  }

  async clearCompletedTasks(): Promise<void> {
    const tasks = await this.getAllTasks();
    const activeTasks = tasks.filter((t) => !t.isCompleted);
    await this.saveTasks(activeTasks);
  }

  async wipeAllTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_TASKS);
    } catch (error) {
      console.error('Failed to wipe tasks from AsyncStorage:', error);
      throw error;
    }
  }
}

export const taskRepository = new AsyncStorageTaskRepository();
