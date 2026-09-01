import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../../types/task';
import { ITaskRepository } from './ITaskRepository';
import { getTodayDateString, getTomorrowDateString } from '../../utils/dateUtils';

const STORAGE_KEY_TASKS = '@antigravity_tasks_v2';

export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-1',
    title: 'Buy groceries',
    notes: 'Milk, eggs, sourdough bread',
    dueDate: getTodayDateString(),
    dueTime: '18:00',
    isAllDay: false,
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [
      { id: 'sub-1', title: 'Milk', isCompleted: true },
      { id: 'sub-2', title: 'Eggs', isCompleted: true },
      { id: 'sub-3', title: 'Bread', isCompleted: false },
    ],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Finish project assignment',
    notes: 'Submit final draft and review checklist',
    dueDate: getTodayDateString(),
    dueTime: '20:00',
    isAllDay: false,
    priority: 'important',
    reminder: { preset: '30m', offsetMinutes: 30 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Review quarterly goals',
    dueDate: getTomorrowDateString(),
    dueTime: '10:00',
    isAllDay: false,
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'weekly', interval: 1 },
    subtasks: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'Call Mom',
    dueDate: getTodayDateString(),
    dueTime: '16:30',
    isAllDay: false,
    priority: 'normal',
    reminder: { preset: 'none', offsetMinutes: 0 },
    repeat: { type: 'none' },
    subtasks: [],
    isCompleted: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export class AsyncStorageTaskRepository implements ITaskRepository {
  async getAllTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_TASKS);
      if (!data) {
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
