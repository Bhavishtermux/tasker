import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserSettings, Category } from '../types/settings';
import {
  settingsRepository,
  DEFAULT_USER_SETTINGS,
} from '../services/storage/AsyncStorageSettingsRepository';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { NotificationService } from '../services/notifications/NotificationService';

interface SettingsContextType {
  settings: UserSettings;
  categories: Category[];
  isLoading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [loadedSettings, loadedCategories] = await Promise.all([
        settingsRepository.getSettings(),
        settingsRepository.getCategories(),
      ]);
      setSettings(loadedSettings);
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Failed to load settings/categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await settingsRepository.saveSettings(updated);

    if (newSettings.notificationsEnabled !== undefined) {
      if (newSettings.notificationsEnabled) {
        await NotificationService.requestPermissions();
      }
    }
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...catData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    await settingsRepository.saveCategories(updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await settingsRepository.saveCategories(updated);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        categories,
        isLoading,
        updateSettings,
        addCategory,
        deleteCategory,
        reloadSettings: loadData,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
