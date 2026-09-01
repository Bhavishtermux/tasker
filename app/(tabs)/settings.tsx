import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useSettings } from '../../src/context/SettingsContext';
import { useTasks } from '../../src/context/TaskContext';
import { ConfirmationModal } from '../../src/components/ConfirmationModal';
import { BottomNavBar, TabName } from '../../src/components/BottomNavBar';
import { AppTheme } from '../../src/types/settings';
import { Priority, ReminderPreset } from '../../src/types/task';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, themeMode, setThemeMode } = useAppTheme();
  const { settings, updateSettings } = useSettings();
  const { tasks, clearCompletedTasks, wipeAllData } = useTasks();

  const [confirmClearVisible, setConfirmClearVisible] = useState(false);
  const [confirmWipeVisible, setConfirmWipeVisible] = useState(false);

  const themeOptions: { mode: AppTheme; label: string; icon: string }[] = [
    { mode: 'system', label: 'System', icon: 'theme-light-dark' },
    { mode: 'light', label: 'Light', icon: 'white-balance-sunny' },
    { mode: 'dark', label: 'Dark', icon: 'weather-night' },
  ];

  const reminderOptions: { preset: ReminderPreset; label: string }[] = [
    { preset: 'none', label: 'None' },
    { preset: 'at_time', label: 'At time' },
    { preset: '5m', label: '5m before' },
    { preset: '10m', label: '10m before' },
    { preset: '30m', label: '30m before' },
    { preset: '1h', label: '1h before' },
  ];

  const handleExportData = async () => {
    try {
      const exportJson = JSON.stringify(tasks, null, 2);
      await Share.share({
        message: exportJson,
        title: 'Daily Tasks Backup',
      });
    } catch {
      Alert.alert('Export Failed', 'Could not export task data.');
    }
  };

  const handleClearCompleted = async () => {
    await clearCompletedTasks();
    setConfirmClearVisible(false);
    Alert.alert('Success', 'Completed tasks have been cleared.');
  };

  const handleWipeData = async () => {
    await wipeAllData();
    setConfirmWipeVisible(false);
    Alert.alert('Success', 'All task data has been reset.');
  };

  const handleSelectTab = (tab: TabName) => {
    if (tab === 'tasks') {
      router.push('/(tabs)');
    } else if (tab === 'progress') {
      router.push('/(tabs)/progress');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Preferences and task defaults
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION: Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.themeRow}>
              {themeOptions.map((opt) => {
                const isSelected = themeMode === opt.mode;
                return (
                  <TouchableOpacity
                    key={opt.mode}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : colors.surfaceVariant,
                        borderColor: isSelected
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}
                    onPress={() => setThemeMode(opt.mode)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon as any}
                      size={18}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themeOptionText,
                        {
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* SECTION: Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Notifications
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={19}
                  color={colors.primary}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Enable notifications
                  </Text>
                  <Text
                    style={[
                      styles.settingSubLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Receive alarms at reminder times
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(val) =>
                  updateSettings({ notificationsEnabled: val })
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primaryLight,
                }}
                thumbColor={
                  settings.notificationsEnabled
                    ? colors.primary
                    : colors.textMuted
                }
              />
            </View>

            <View
              style={[styles.cardDivider, { backgroundColor: colors.divider }]}
            />

            <View style={styles.subSetting}>
              <Text
                style={[
                  styles.subSettingLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Default reminder
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalChips}
              >
                {reminderOptions.map((opt) => {
                  const isSelected =
                    settings.defaultReminderPreset === opt.preset;
                  return (
                    <TouchableOpacity
                      key={opt.preset}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? colors.primaryLight
                            : colors.surfaceVariant,
                          borderColor: isSelected
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                      onPress={() =>
                        updateSettings({ defaultReminderPreset: opt.preset })
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? colors.primary : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* SECTION: Defaults */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Task Defaults
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={19}
                  color={colors.warning}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Default priority
                  </Text>
                  <Text
                    style={[
                      styles.settingSubLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Priority for newly created tasks
                  </Text>
                </View>
              </View>

              <View style={styles.priorityToggleTrack}>
                <TouchableOpacity
                  style={[
                    styles.miniToggle,
                    settings.defaultPriority === 'normal' && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => updateSettings({ defaultPriority: 'normal' })}
                >
                  <Text
                    style={[
                      styles.miniToggleText,
                      {
                        color:
                          settings.defaultPriority === 'normal'
                            ? colors.checkboxCheck
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Normal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.miniToggle,
                    settings.defaultPriority === 'important' && {
                      backgroundColor: colors.danger,
                    },
                  ]}
                  onPress={() =>
                    updateSettings({ defaultPriority: 'important' })
                  }
                >
                  <Text
                    style={[
                      styles.miniToggleText,
                      {
                        color:
                          settings.defaultPriority === 'important'
                            ? '#FFFFFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Important
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION: Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Data Management
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <View style={styles.actionInfo}>
                <MaterialCommunityIcons
                  name="export-variant"
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.actionLabel, { color: colors.text }]}>
                  Export tasks (JSON)
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[styles.cardDivider, { backgroundColor: colors.divider }]}
            />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setConfirmClearVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.actionInfo}>
                <MaterialCommunityIcons
                  name="playlist-remove"
                  size={18}
                  color={colors.warning}
                />
                <Text style={[styles.actionLabel, { color: colors.warning }]}>
                  Clear completed tasks
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[styles.cardDivider, { backgroundColor: colors.divider }]}
            />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setConfirmWipeVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.actionInfo}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={[styles.actionLabel, { color: colors.danger }]}>
                  Delete all data
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.danger}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION: About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            About
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>
                App Name
              </Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>
                Daily Tasks
              </Text>
            </View>
            <View
              style={[styles.cardDivider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating 3-Tab Bottom Navigation Bar */}
      <BottomNavBar
        currentTab="settings"
        onSelectTab={handleSelectTab}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={confirmClearVisible}
        title="Clear Completed Tasks?"
        message="Are you sure you want to remove all completed tasks from history?"
        confirmLabel="Clear"
        isDestructive={true}
        onConfirm={handleClearCompleted}
        onCancel={() => setConfirmClearVisible(false)}
      />

      <ConfirmationModal
        visible={confirmWipeVisible}
        title="Delete All Data?"
        message="This action will permanently remove all tasks and streak history."
        confirmLabel="Delete Everything"
        isDestructive={true}
        onConfirm={handleWipeData}
        onCancel={() => setConfirmWipeVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
  },
  subSetting: {
    gap: 6,
  },
  subSettingLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  horizontalChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
  },
  priorityToggleTrack: {
    flexDirection: 'row',
    backgroundColor: '#00000030',
    borderRadius: 8,
    padding: 2,
  },
  miniToggle: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  miniToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 13,
  },
  aboutValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
