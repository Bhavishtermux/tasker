import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useTasks } from '../../src/context/TaskContext';
import { TaskList } from '../../src/components/TaskList';
import { SearchBar } from '../../src/components/SearchBar';
import { WeekCalendarStrip } from '../../src/components/WeekCalendarStrip';
import { FloatingBottomNav } from '../../src/components/FloatingBottomNav';
import {
  getTodayDateString,
  getHeaderTitleForDate,
} from '../../src/utils/dateUtils';
import { groupTasksForDate, filterTasksBySearch } from '../../src/services/tasks/TaskLogic';
import { Task } from '../../src/types/task';

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    lastDeletedTask,
    undoDeleteTask,
    refreshTasks,
  } = useTasks();

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);

  // Group tasks for the selected date
  const filteredTasks = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return filterTasksBySearch(tasks, searchQuery);
    }
    return tasks;
  }, [tasks, searchQuery]);

  const dateSections = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      // Show all search matches across dates
      return groupTasksForDate(filteredTasks, selectedDate);
    }
    return groupTasksForDate(filteredTasks, selectedDate);
  }, [filteredTasks, selectedDate, searchQuery]);

  // Calculate top-right stats for selected date
  const dateTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const completedDateTasks = dateTasks.filter((t) => t.isCompleted);

  // Calculate hours summary (e.g. 1.5 of 7.5 hrs)
  const totalMinutes = dateTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || (t.isAllDay ? 60 : 30)),
    0
  );
  const completedMinutes = completedDateTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || (t.isAllDay ? 60 : 30)),
    0
  );

  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedHours = (completedMinutes / 60).toFixed(1);
  const taskCountDisplay = dateTasks.length;

  const headerTitle = getHeaderTitleForDate(selectedDate);

  const handleOpenCreate = () => {
    router.push('/task/create');
  };

  const handlePressTask = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const handleToggleSearch = () => {
    if (isSearchVisible) {
      setSearchQuery('');
      setIsSearchVisible(false);
    } else {
      setIsSearchVisible(true);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setIsRefreshing(false);
  };

  const handleUndo = async () => {
    await undoDeleteTask();
    setShowUndoSnackbar(false);
  };

  const handleSelectTab = (tab: 'tasks' | 'progress' | 'settings') => {
    if (tab === 'progress') {
      router.push('/(tabs)/progress');
    } else if (tab === 'settings') {
      router.push('/(tabs)/settings');
    }
  };

  React.useEffect(() => {
    if (lastDeletedTask) {
      setShowUndoSnackbar(true);
    }
  }, [lastDeletedTask]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {headerTitle}
        </Text>

        {/* Top Right Stats Pills */}
        <View style={styles.statsRow}>
          {/* Total tasks count pill */}
          <View
            style={[
              styles.pill,
              { backgroundColor: colors.badgeBackground },
            ]}
          >
            <MaterialCommunityIcons
              name="check"
              size={12}
              color={colors.textSecondary}
            />
            <Text style={[styles.pillText, { color: colors.textSecondary }]}>
              {taskCountDisplay}
            </Text>
          </View>

          {/* Time summary pill */}
          {totalMinutes > 0 && (
            <View
              style={[
                styles.pill,
                { backgroundColor: colors.badgeBackground },
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.pillText, { color: colors.textSecondary }]}>
                {completedHours} of {totalHours} hrs
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Week Calendar Strip */}
      <WeekCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Inline Search Bar */}
      {isSearchVisible && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          autoFocus
        />
      )}

      {/* Task List (Morning, Afternoon, Evening, Completed) */}
      <TaskList
        sections={dateSections}
        onPressTask={handlePressTask}
        isSearchActive={searchQuery.length > 0}
        searchQuery={searchQuery}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Floating Bottom Navigation Island */}
      <FloatingBottomNav
        currentTab="tasks"
        isSearchActive={isSearchVisible}
        onSelectTab={handleSelectTab}
        onToggleSearch={handleToggleSearch}
        onPressAdd={handleOpenCreate}
      />

      {/* Undo Delete Snackbar */}
      <Snackbar
        visible={showUndoSnackbar}
        onDismiss={() => setShowUndoSnackbar(false)}
        duration={4000}
        action={{
          label: 'Undo',
          textColor: colors.primary,
          onPress: handleUndo,
        }}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          marginBottom: 80,
        }}
      >
        <Text style={{ color: colors.text }}>Task deleted</Text>
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
