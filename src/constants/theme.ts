export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  success: string;
  danger: string;
  warning: string;
  importantBadge: string;
  importantText: string;
  chipBackground: string;
  chipText: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  tabBarIndicator: string;
  checkboxBorder: string;
  checkboxCheck: string;
  dockBackground: string;
  dockBorder: string;
  badgeBackground: string;
  badgeText: string;
}

export const lightTheme: ThemeColors = {
  primary: '#0F172A',
  primaryLight: '#F1F5F9',
  primaryDark: '#020617',
  accent: '#2563EB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  divider: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  importantBadge: '#FEE2E2',
  importantText: '#DC2626',
  chipBackground: '#F1F5F9',
  chipText: '#0F172A',
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#0F172A',
  tabBarInactive: '#94A3B8',
  tabBarIndicator: '#E2E8F0',
  checkboxBorder: '#94A3B8',
  checkboxCheck: '#FFFFFF',
  dockBackground: '#FFFFFF',
  dockBorder: '#E2E8F0',
  badgeBackground: '#F1F5F9',
  badgeText: '#64748B',
};

export const darkTheme: ThemeColors = {
  primary: '#38BDF8', // Electric Cyan / Blue accent
  primaryLight: '#0F2538',
  primaryDark: '#0284C7',
  accent: '#38BDF8',
  background: '#08090C', // Deep dark backdrop from reference UI
  surface: '#12151D',
  surfaceVariant: '#191E2B',
  card: '#12151D', // Rounded card surface with subtle blue-gray undertone
  cardBorder: '#1C2230',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#1C2230',
  divider: '#161B26',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  importantBadge: '#3B1818',
  importantText: '#F87171',
  chipBackground: '#191E2B',
  chipText: '#F8FAFC',
  tabBarBackground: '#0D0F14',
  tabBarActive: '#38BDF8',
  tabBarInactive: '#64748B',
  tabBarIndicator: '#191E2B',
  checkboxBorder: '#334155',
  checkboxCheck: '#08090C',
  dockBackground: '#0F131C',
  dockBorder: '#1E2536',
  badgeBackground: '#191E2B',
  badgeText: '#94A3B8',
};
