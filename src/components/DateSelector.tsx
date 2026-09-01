import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  const { colors, isDark } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const isToday = selectedDate === today;
  const isTomorrow = selectedDate === tomorrow;
  const isCustom = !isToday && !isTomorrow;

  const activeIndex = isToday ? 0 : isTomorrow ? 1 : 2;
  const [containerWidth, setContainerWidth] = useState(300);
  const pillWidth = (containerWidth - 8) / 3;

  const indicatorPos = useRef(new Animated.Value(activeIndex * pillWidth)).current;

  useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: activeIndex * pillWidth,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, pillWidth]);

  const handlePickerChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      onSelectDate(formatDateToString(date));
    }
  };

  const handleSelectOption = (index: number) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    if (index === 0) {
      onSelectDate(today);
    } else if (index === 1) {
      onSelectDate(tomorrow);
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>

      <View
        style={[
          styles.segmentedTrack,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.cardBorder,
          },
        ]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Animated Sliding Indicator */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              width: pillWidth,
              backgroundColor: isDark ? '#232A3B' : '#E2E8F0',
              transform: [{ translateX: indicatorPos }],
            },
          ]}
        />

        {/* Today Button */}
        <TouchableOpacity
          style={[styles.segmentBtn, { width: pillWidth }]}
          onPress={() => handleSelectOption(0)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="calendar-today"
            size={15}
            color={isToday ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: isToday ? colors.text : colors.textSecondary,
                fontWeight: isToday ? '700' : '500',
              },
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        {/* Tomorrow Button */}
        <TouchableOpacity
          style={[styles.segmentBtn, { width: pillWidth }]}
          onPress={() => handleSelectOption(1)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="calendar-arrow-right"
            size={15}
            color={isTomorrow ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: isTomorrow ? colors.text : colors.textSecondary,
                fontWeight: isTomorrow ? '700' : '500',
              },
            ]}
          >
            Tomorrow
          </Text>
        </TouchableOpacity>

        {/* Custom Pick Date Button */}
        <TouchableOpacity
          style={[styles.segmentBtn, { width: pillWidth }]}
          onPress={() => handleSelectOption(2)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="calendar-edit"
            size={15}
            color={isCustom ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: isCustom ? colors.text : colors.textSecondary,
                fontWeight: isCustom ? '700' : '500',
              },
            ]}
            numberOfLines={1}
          >
            {isCustom ? formatTaskDateBadge(selectedDate) : 'Pick Date'}
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
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentedTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
  },
  slidingPill: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 9,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: '100%',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 13,
  },
});
