import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import {
  formatDateToString,
  parseDateString,
  getTodayDateString,
  getTomorrowDateString,
  formatTaskDateBadge,
} from '../utils/dateUtils';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const { colors } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const handlePickerChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      onSelectDate(formatDateToString(date));
    }
  };

  const isCustomDate = selectedDate !== today && selectedDate !== tomorrow;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
      <View style={styles.chipRow}>
        {/* Today Button */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedDate === today
                  ? colors.primaryLight
                  : colors.surfaceVariant,
              borderColor:
                selectedDate === today ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onSelectDate(today)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-today"
            size={16}
            color={selectedDate === today ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              {
                color: selectedDate === today ? colors.primary : colors.text,
                fontWeight: selectedDate === today ? '600' : '400',
              },
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        {/* Tomorrow Button */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedDate === tomorrow
                  ? colors.primaryLight
                  : colors.surfaceVariant,
              borderColor:
                selectedDate === tomorrow ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onSelectDate(tomorrow)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-arrow-right"
            size={16}
            color={
              selectedDate === tomorrow ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.chipText,
              {
                color: selectedDate === tomorrow ? colors.primary : colors.text,
                fontWeight: selectedDate === tomorrow ? '600' : '400',
              },
            ]}
          >
            Tomorrow
          </Text>
        </TouchableOpacity>

        {/* Custom Date Button */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: isCustomDate
                ? colors.primaryLight
                : colors.surfaceVariant,
              borderColor: isCustomDate ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-edit"
            size={16}
            color={isCustomDate ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              {
                color: isCustomDate ? colors.primary : colors.text,
                fontWeight: isCustomDate ? '600' : '400',
              },
            ]}
          >
            {isCustomDate ? formatTaskDateBadge(selectedDate) : 'Pick Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={parseDateString(selectedDate)}
          mode="date"
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
});
