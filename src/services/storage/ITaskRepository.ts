import { Task } from '../../types/task';

export interface ITaskRepository {
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  saveTask(task: Task): Promise<void>;
  saveTasks(tasks: Task[]): Promise<void>;
  deleteTask(id: string): Promise<void>;
  clearCompletedTasks(): Promise<void>;
  wipeAllTasks(): Promise<void>;
}
