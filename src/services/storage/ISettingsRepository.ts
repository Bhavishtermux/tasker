import { UserSettings, Category } from '../../types/settings';

export interface ISettingsRepository {
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<void>;
  getCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;
}
