import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { formatTimeToString, formatTime12Hour } from '../utils/dateUtils';

interface TimeSelectorProps {
  isAllDay: boolean;
  onToggleAllDay: (allDay: boolean) => void;
  dueTime?: string; // HH:mm
  onSelectTime: (timeStr: string) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  isAllDay,
  onToggleAllDay,
  dueTime = '09:00',
  onSelectTime,
}) => {
  const { colors } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handlePickerChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      onSelectTime(formatTimeToString(date));
    }
  };

  const getTimeDate = (): Date => {
    const d = new Date();
    if (dueTime) {
      const [h, m] = dueTime.split(':').map((n) => parseInt(n, 10));
      d.setHours(h || 9, m || 0, 0, 0);
    } else {
      d.setHours(9, 0, 0, 0);
    }
    return d;
  };

  return (
    <View style={styles.container}>
      {/* All-Day Toggle Row */}
      <View style={styles.allDayRow}>
        <View style={styles.allDayLabelContainer}>
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.allDayLabel, { color: colors.text }]}>
            All day
          </Text>
        </View>
        <Switch
          value={isAllDay}
          onValueChange={onToggleAllDay}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={isAllDay ? colors.primary : colors.textMuted}
        />
      </View>

      {/* Time Picker Button (when not all-day) */}
      {!isAllDay && (
        <View style={styles.timePickerContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Time
          </Text>
          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime12Hour(dueTime)}
            </Text>
            <MaterialCommunityIcons
              name="menu-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={getTimeDate()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  allDayLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allDayLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  timePickerContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
});
