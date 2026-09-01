import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserSettings } from '../types/settings';
import {
  settingsRepository,
  DEFAULT_USER_SETTINGS,
} from '../services/storage/AsyncStorageSettingsRepository';
import { NotificationService } from '../services/notifications/NotificationService';

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const loadedSettings = await settingsRepository.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
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
