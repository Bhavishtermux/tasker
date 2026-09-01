import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  bestStreak,
  totalCompleted,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Current Streak Highlight Card */}
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: colors.card,
            borderColor: '#F59E0B' + '50',
          },
        ]}
      >
        <View style={styles.streakHeader}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <View>
            <Text style={[styles.streakTitle, { color: '#FBBF24' }]}>
              Current Streak
            </Text>
            <Text style={[styles.streakNumber, { color: colors.text }]}>
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
        <Text style={[styles.streakSub, { color: colors.textSecondary }]}>
          {currentStreak > 0
            ? 'Great job keeping up daily consistency!'
            : 'Complete tasks today to start your streak.'}
        </Text>
      </View>

      {/* Row for Best Streak & Total Completed */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.smallCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.smallCardHeader}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={17}
              color={colors.warning}
            />
            <Text style={[styles.smallCardLabel, { color: colors.textSecondary }]}>
              Best Streak
            </Text>
          </View>
          <Text style={[styles.smallCardValue, { color: colors.text }]}>
            {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
          </Text>
        </View>

        <View
          style={[
            styles.smallCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.smallCardHeader}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={17}
              color={colors.success}
            />
            <Text style={[styles.smallCardLabel, { color: colors.textSecondary }]}>
              Total Completed
            </Text>
          </View>
          <Text style={[styles.smallCardValue, { color: colors.text }]}>
            {totalCompleted} {totalCompleted === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    gap: 10,
  },
  mainCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fireEmoji: {
    fontSize: 28,
  },
  streakTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  streakSub: {
    fontSize: 12.5,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  smallCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  smallCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  smallCardValue: {
    fontSize: 17,
    fontWeight: '700',
  },
});
