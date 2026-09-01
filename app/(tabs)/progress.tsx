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
import { BottomNavBar, TabName } from '../../src/components/BottomNavBar';

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

  const handleSelectTab = (tab: TabName) => {
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
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Consistency and completion metrics
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Streak & Milestone Cards */}
        <StreakCard
          currentStreak={metrics.currentStreak}
          bestStreak={metrics.bestStreak}
          totalCompleted={metrics.totalCompletedTasks}
        />

        {/* Animated Progress Charts */}
        <ProgressChart metrics={metrics} />
      </ScrollView>

      {/* Floating 3-Tab Bottom Navigation Bar */}
      <BottomNavBar
        currentTab="progress"
        onSelectTab={handleSelectTab}
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
    gap: 12,
  },
});
