import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useTasks } from '../../src/context/TaskContext';
import { StreakCard } from '../../src/components/StreakCard';
import { ProgressChart } from '../../src/components/ProgressChart';
import { FloatingBottomNav } from '../../src/components/FloatingBottomNav';

export default function ProgressScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { metrics, refreshTasks } = useTasks();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setIsRefreshing(false);
  };

  const handleSelectTab = (tab: 'tasks' | 'progress' | 'settings') => {
    if (tab === 'tasks') {
      router.push('/(tabs)');
    } else if (tab === 'settings') {
      router.push('/(tabs)/settings');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>progress</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.text]}
            tintColor={colors.text}
          />
        }
      >
        {/* Streak & Overall Stats */}
        <StreakCard
          currentStreak={metrics.currentStreak}
          bestStreak={metrics.bestStreak}
          totalCompleted={metrics.totalCompletedTasks}
        />

        {/* Charts & Metrics */}
        <ProgressChart metrics={metrics} />
      </ScrollView>

      {/* Floating Bottom Navigation Island */}
      <FloatingBottomNav
        currentTab="progress"
        isSearchActive={false}
        onSelectTab={handleSelectTab}
        onToggleSearch={() => router.push('/(tabs)')}
        onPressAdd={() => router.push('/task/create')}
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
    paddingTop: 14,
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  scrollContent: {
    paddingBottom: 110,
    gap: 12,
  },
});
