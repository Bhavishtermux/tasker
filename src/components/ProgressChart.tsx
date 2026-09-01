import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressMetrics } from '../services/tasks/StreakCalculator';
import { useAppTheme } from '../context/ThemeContext';

interface ProgressChartProps {
  metrics: ProgressMetrics;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ metrics }) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Today's Summary Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Today
        </Text>

        <View style={styles.todayRow}>
          <View style={styles.percentageContainer}>
            <Text style={[styles.percentageText, { color: colors.primary }]}>
              {metrics.todayPercentage}%
            </Text>
            <Text style={[styles.percentageSub, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.todayStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {metrics.tasksCompletedToday} / {metrics.totalTasksToday}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                tasks completed
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {metrics.tasksCreatedToday}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                tasks created today
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar for Today */}
        <View
          style={[
            styles.progressBarBackground,
            { backgroundColor: colors.surfaceVariant },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(metrics.todayPercentage, 100)}%`,
                backgroundColor:
                  metrics.todayPercentage === 100
                    ? colors.success
                    : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* This Week Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            This Week
          </Text>
          <Text style={[styles.headerSubtext, { color: colors.textMuted }]}>
            Mon – Sun
          </Text>
        </View>

        <View style={styles.weeklyList}>
          {metrics.weeklyDays.map((day) => {
            const ratio =
              day.total > 0
                ? Math.min(Math.round((day.completed / day.total) * 100), 100)
                : 0;

            return (
              <View key={day.dateStr} style={styles.dayRow}>
                <View style={styles.dayNameContainer}>
                  <Text
                    style={[
                      styles.dayName,
                      {
                        color: day.isToday ? colors.primary : colors.text,
                        fontWeight: day.isToday ? '700' : '500',
                      },
                    ]}
                  >
                    {day.dayName}
                  </Text>
                  {day.isToday && (
                    <View
                      style={[
                        styles.todayDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>

                {/* Day bar */}
                <View
                  style={[
                    styles.dayBarTrack,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  <View
                    style={[
                      styles.dayBarFill,
                      {
                        width: `${ratio}%`,
                        backgroundColor:
                          ratio === 100 ? colors.success : colors.primary,
                      },
                    ]}
                  />
                </View>

                {/* Ratio count */}
                <Text
                  style={[
                    styles.dayRatioText,
                    {
                      color: day.completed > 0 ? colors.text : colors.textMuted,
                    },
                  ]}
                >
                  {day.completed}/{day.total}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Monthly Summary Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          This Month
        </Text>

        <View style={styles.monthlyContent}>
          <View style={styles.monthlyStat}>
            <Text style={[styles.monthlyNumber, { color: colors.primary }]}>
              {metrics.monthlyCompleted}
            </Text>
            <Text style={[styles.monthlyLabel, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>

          <View style={styles.monthlyStat}>
            <Text style={[styles.monthlyNumber, { color: colors.text }]}>
              {metrics.monthlyTotal}
            </Text>
            <Text style={[styles.monthlyLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
          </View>

          <View style={styles.monthlyStat}>
            <Text
              style={[
                styles.monthlyNumber,
                {
                  color:
                    metrics.monthlyPercentage >= 75
                      ? colors.success
                      : colors.text,
                },
              ]}
            >
              {metrics.monthlyPercentage}%
            </Text>
            <Text style={[styles.monthlyLabel, { color: colors.textSecondary }]}>
              Rate
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerSubtext: {
    fontSize: 12,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  percentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '800',
  },
  percentageSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 48,
    marginHorizontal: 16,
  },
  todayStats: {
    flex: 1,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyList: {
    gap: 10,
    marginTop: 4,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayNameContainer: {
    width: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 14,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  dayRatioText: {
    width: 44,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '500',
  },
  monthlyContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  monthlyStat: {
    alignItems: 'center',
  },
  monthlyNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  monthlyLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
