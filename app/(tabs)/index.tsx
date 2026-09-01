import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useTasks } from '../../src/context/TaskContext';
import { TaskList } from '../../src/components/TaskList';
import { SearchBar } from '../../src/components/SearchBar';
import { BottomNavBar, TabName } from '../../src/components/BottomNavBar';
import { getHeaderDateFormatted } from '../../src/utils/dateUtils';
import { Task } from '../../src/types/task';

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    sections,
    searchQuery,
    setSearchQuery,
    lastDeletedTask,
    undoDeleteTask,
    refreshTasks,
  } = useTasks();

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);

  const formattedDate = getHeaderDateFormatted();

  const handleOpenCreate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    router.push('/task/create');
  };

  const handlePressTask = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const handleToggleSearch = () => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
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

  const handleSelectTab = (tab: TabName) => {
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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
          <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>
            {formattedDate}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Search Toggle Button */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: isSearchVisible
                  ? colors.primaryLight
                  : colors.surfaceVariant,
              },
            ]}
            onPress={handleToggleSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isSearchVisible ? 'close' : 'magnify'}
              size={20}
              color={isSearchVisible ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Add (+) Button in Header */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleOpenCreate}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={colors.checkboxCheck}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Search Bar */}
      {isSearchVisible && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          onClose={() => {
            setSearchQuery('');
            setIsSearchVisible(false);
          }}
        />
      )}

      {/* Task Sections (Overdue, Today, Tomorrow, Upcoming, Completed) */}
      <TaskList
        sections={sections}
        onPressTask={handlePressTask}
        isSearchActive={searchQuery.length > 0}
        searchQuery={searchQuery}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Floating 3-Tab Bottom Navigation Bar */}
      <BottomNavBar
        currentTab="tasks"
        onSelectTab={handleSelectTab}
      />

      {/* Undo Delete Snackbar */}
      <Snackbar
        visible={showUndoSnackbar}
        onDismiss={() => setShowUndoSnackbar(false)}
        duration={4000}
        action={{
          label: 'UNDO',
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dateSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
