import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme } from '../types/settings';
import { ThemeColors, lightTheme, darkTheme } from '../constants/theme';
import { settingsRepository } from '../services/storage/AsyncStorageSettingsRepository';

interface ThemeContextType {
  themeMode: AppTheme;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: AppTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<AppTheme>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    settingsRepository.getSettings().then((settings) => {
      setThemeModeState(settings.theme || 'system');
      setIsLoaded(true);
    });
  }, []);

  const setThemeMode = async (mode: AppTheme) => {
    setThemeModeState(mode);
    const current = await settingsRepository.getSettings();
    await settingsRepository.saveSettings({ ...current, theme: mode });
  };

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
