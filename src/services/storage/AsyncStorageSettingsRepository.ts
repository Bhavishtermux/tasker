import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../../types/settings';
import { ISettingsRepository } from './ISettingsRepository';

const STORAGE_KEY_SETTINGS = '@antigravity_settings_v2';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  notificationsEnabled: true,
  defaultReminderPreset: 'none',
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
}

export const settingsRepository = new AsyncStorageSettingsRepository();
