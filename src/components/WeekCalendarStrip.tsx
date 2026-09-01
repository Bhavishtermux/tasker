import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../context/ThemeContext';
import { getWeekDaysForDate } from '../utils/dateUtils';

interface WeekCalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const { colors } = useAppTheme();
  const weekDays = getWeekDaysForDate(selectedDate);

  const handlePressDay = (dateStr: string) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onSelectDate(dateStr);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {weekDays.map((item) => {
          const isSelected = item.dateStr === selectedDate;

          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.dayColumn,
                isSelected && styles.selectedDayColumn,
              ]}
              onPress={() => handlePressDay(item.dateStr)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: isSelected ? colors.text : colors.textMuted,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {item.dayNumber}
              </Text>
              {isSelected && (
                <View
                  style={[styles.indicatorDot, { backgroundColor: colors.text }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 40,
    borderRadius: 12,
  },
  selectedDayColumn: {
    // subtle active indicator
  },
  dayName: {
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  dayNumber: {
    fontSize: 15,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
