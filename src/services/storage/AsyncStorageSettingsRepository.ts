import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, Category } from '../../types/settings';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { ISettingsRepository } from './ISettingsRepository';

const STORAGE_KEY_SETTINGS = '@antigravity_settings_v1';
const STORAGE_KEY_CATEGORIES = '@antigravity_categories_v1';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  notificationsEnabled: true,
  defaultReminderPreset: 'none',
  defaultCategory: 'Personal',
  defaultPriority: 'normal',
  confirmBeforeDelete: true,
};

export class AsyncStorageSettingsRepository implements ISettingsRepository {
  async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_USER_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_USER_SETTINGS, ...parsed };
    } catch (error) {
      console.error('Failed to get settings from storage:', error);
      return DEFAULT_USER_SETTINGS;
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (!data) return DEFAULT_CATEGORIES;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Failed to get categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories:', error);
      throw error;
    }
  }
}

export const settingsRepository = new AsyncStorageSettingsRepository();
